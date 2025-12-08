import { useState, useEffect, useRef, useCallback } from 'react';
import { get, set } from 'idb-keyval';
import { decodeAudio } from '../utils/audio';
import { AUDIO_SAMPLE_RATE } from '../lib/constants';

export interface TranscriberData {
    isBusy: boolean;
    isModelLoading: boolean;
    progressItems: ProgressItem[];
    output?: TranscriberOutput;
    model: string;
    setModel: (model: string) => void;
}

export interface TranscriberOutput {
    text: string;
    chunks: {
        text: string;
        timestamp: [number, number];
    }[];
}

export interface ProgressItem {
    file: string;
    loaded: number;
    total: number;
}

// Moved outside hook for proper typing
export interface QueueItem {
    id: string;
    file: File;
    audio?: Float32Array;
    status: 'pending' | 'processing' | 'complete' | 'error';
    output?: TranscriberOutput;
    summary?: string;
    progress?: number;
}

export function useTranscriber() {
    const [isBusy, setIsBusy] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
    const [output, setOutput] = useState<TranscriberOutput | undefined>(undefined);
    const [model, setModel] = useState<string>('onnx-community/moonshine-tiny-ONNX'); // Ultra-fast Moonshine
    const [language, setLanguage] = useState<string>('auto');
    const [task, setTask] = useState<'transcribe' | 'translate'>('transcribe');
    
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // GPU acceleration state
    const [device, setDevice] = useState<'wasm' | 'webgpu'>('wasm');
    const [isGPU, setIsGPU] = useState(false);
    
    // Use ref to avoid stale closure in async operations
    const queueRef = useRef<QueueItem[]>([]);
    const isProcessingRef = useRef(false);
    
    // Legacy single-file state (kept for compatibility with existing UI for now, 
    // but ideally we switch UI to show queue)
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [audioData, setAudioData] = useState<Float32Array | null>(null);
    const [estimatedTime, setEstimatedTime] = useState<number | undefined>(undefined);
    
    // Summarization state
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string | undefined>(undefined);
    
    // Error state for external handling (replaces alert())
    const [lastError, setLastError] = useState<string | null>(null);
    const clearLastError = () => setLastError(null);
    
    const worker = useRef<Worker | null>(null);

    // Load persisted state on mount
    useEffect(() => {
        const loadState = async () => {
            try {
                // For batch, we might want to persist the whole queue, but for now let's stick to single file persistence
                // or maybe just clear it. Batch persistence is complex because of large audio files.
                // We'll keep the legacy persistence for the "active" item.
                const savedOutput = await get('transcription-output');
                const savedDuration = await get('audio-duration');
                const savedSummary = await get('transcription-summary');
                if (savedOutput) setOutput(savedOutput);
                if (savedDuration) setAudioDuration(savedDuration);
                if (savedSummary) setSummary(savedSummary);
            } catch (e) {
                console.error('Failed to load persisted state:', e);
            }
        };
        loadState();
    }, []);

    const processNextInQueue = useCallback(async () => {
        if (isProcessingRef.current) return;

        // Use ref to get current queue state
        const currentQueue = queueRef.current;
        const nextItem = currentQueue.find(item => item.status === 'pending');
        
        if (!nextItem) return;

        // Mark as processing using refs
        isProcessingRef.current = true;
        setIsProcessing(true);
        
        // Update item status
        setQueue(prev => prev.map(i => i.id === nextItem.id ? { ...i, status: 'processing' } : i));

        try {
            let audio = nextItem.audio;
            if (!audio) {
                try {
                    audio = await decodeAudio(nextItem.file);
                } catch (e) {
                    console.error("Decoding failed", e);
                    setQueue(prev => prev.map(i => i.id === nextItem.id ? { ...i, status: 'error' } : i));
                    isProcessingRef.current = false;
                    setIsProcessing(false);
                    return;
                }
            }
            
            if (!worker.current) {
                isProcessingRef.current = false;
                setIsProcessing(false);
                return;
            }

            // Update item with decoded audio
            setQueue(prev => prev.map(i => i.id === nextItem.id ? { ...i, audio, status: 'processing' } : i));

            // For legacy UI support
            setAudioData(audio);
            const duration = audio.length / AUDIO_SAMPLE_RATE;
            setAudioDuration(duration);
            setEstimatedTime(duration * 0.5);
            
            worker.current.postMessage({ 
                audio, 
                model, 
                language, 
                task 
            });

        } catch (error) {
            console.error("Error in processNextInQueue", error);
            isProcessingRef.current = false;
            setIsProcessing(false);
        }
    }, [model, language, task]);

    // Trigger processing when queue changes - REMOVED to avoid effect loop
    // Instead we trigger in addQueueItems and on complete

    const addQueueItems = useCallback((items: { file: File, audio?: Float32Array }[]) => {
        const newItems: QueueItem[] = items.map(item => ({
            id: Math.random().toString(36).substring(7),
            file: item.file,
            audio: item.audio,
            status: 'pending',
            progress: 0
        }));
        
        setQueue(prev => {
            const updatedQueue = [...prev, ...newItems];
            return updatedQueue;
        });
        
        // Trigger processing next tick
        setTimeout(() => {
            processNextInQueue();
        }, 0);
    }, [processNextInQueue]);

    // Sync queue state with ref for async access
    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    useEffect(() => {
        if (!worker.current) {
            worker.current = new Worker('/worker.js', {
                type: 'module',
            });
        }

        const onMessageReceived = (e: MessageEvent) => {
            switch (e.data.status) {
                case 'device-info':
                    setDevice(e.data.device);
                    setIsGPU(e.data.isGPU);
                    break;
                case 'loading':
                    setIsBusy(true);
                    setIsModelLoading(true);
                    if (e.data.device) {
                        setDevice(e.data.device);
                        setIsGPU(e.data.device === 'webgpu');
                    }
                    break;
                case 'progress':
                    // Update progress items
                    setProgressItems(prev => {
                        const newItems = [...prev];
                        const itemIndex = newItems.findIndex(item => item.file === e.data.file);
                        if (itemIndex !== -1) {
                            newItems[itemIndex] = e.data;
                        } else {
                            newItems.push(e.data);
                        }
                        return newItems;
                    });
                    break;
                case 'complete':
                    setIsBusy(false);
                    setIsModelLoading(false);
                    setOutput(e.data.result);
                    // Persist output
                    set('transcription-output', e.data.result);
                    set('audio-duration', audioDuration);
                    
                    // Batch: Mark current item as complete and process next
                    isProcessingRef.current = false;
                    setIsProcessing(false);
                    setQueue(prevQueue => prevQueue.map(item => 
                        item.status === 'processing' ? { ...item, status: 'complete', output: e.data.result } : item
                    ));
                    // Trigger next item after a tick to allow state update
                    setTimeout(() => processNextInQueue(), 0);
                    break;
                case 'partial-complete':
                    // Update output but don't stop busy state
                    setOutput(e.data.result);
                    break;
                
                // Summarization handlers
                case 'loading-summary':
                    setIsSummarizing(true);
                    break;
                case 'progress-summary':
                    break;
                case 'complete-summary':
                    setIsSummarizing(false);
                    setSummary(e.data.result);
                    set('transcription-summary', e.data.result);
                    break;

                case 'error':
                    setIsBusy(false);
                    setIsModelLoading(false);
                    setIsSummarizing(false);
                    isProcessingRef.current = false;
                    setIsProcessing(false);
                    setQueue(prevQueue => prevQueue.map(item => 
                        item.status === 'processing' ? { ...item, status: 'error' } : item
                    ));
                    // Store error for external handling instead of using alert
                    setLastError(e.data.error);
                    break;
            }
        };

        worker.current.addEventListener('message', onMessageReceived);

        return () => {
            worker.current?.removeEventListener('message', onMessageReceived);
        };
    }, [audioDuration, processNextInQueue]);

    const start = useCallback((audio: Float32Array) => {
        // Legacy start: clear queue and add single item
        // We construct a fake File object since we don't have it here in the legacy call
        const fakeFile = new File([], "Recorded Audio");
        setQueue([]); // Clear previous queue items
        addQueueItems([{ file: fakeFile, audio }]);
    }, [addQueueItems]);

    const stream = useCallback((audio: Float32Array) => {
        if (worker.current) {
            worker.current.postMessage({ audio, model, language, task, isPartial: true });
        }
    }, [model, language, task]);

    const summarize = useCallback(() => {
        if (worker.current && output) {
            setSummary(undefined);
            worker.current.postMessage({ action: 'summarize', text: output.text });
        }
    }, [output]);

    return {
        isBusy,
        isModelLoading,
        isProcessing,
        progressItems,
        output,
        model,
        setModel,
        language,
        setLanguage,
        task,
        setTask,
        start,
        stream,
        estimatedTime,
        audioData,
        isSummarizing,
        summary,
        summarize,
        queue,
        addQueueItems,
        lastError,
        clearLastError,
        device,
        isGPU
    };
}

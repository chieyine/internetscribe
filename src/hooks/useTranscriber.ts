import { useState, useCallback, useRef, useEffect } from 'react';
import { get, set } from 'idb-keyval';

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

export interface QueueItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'complete' | 'error';
    output?: TranscriberOutput;
    summary?: string;
    progress?: number;
    error?: string;
}

export function useTranscriber() {
    const [isBusy, setIsBusy] = useState(false);
    const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
    const [output, setOutput] = useState<TranscriberOutput | undefined>(undefined);
    const [language, setLanguage] = useState<string>('auto');
    
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const queueRef = useRef<QueueItem[]>([]);
    const isProcessingRef = useRef(false);
    
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [estimatedTime, setEstimatedTime] = useState<number | undefined>(undefined);
    
    // Error state
    const [lastError, setLastError] = useState<string | null>(null);
    const clearLastError = () => setLastError(null);
    
    // Upload progress tracking
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    // Load persisted state on mount
    useEffect(() => {
        const loadState = async () => {
            try {
                const savedOutput = await get('transcription-output');
                const savedDuration = await get('audio-duration');
                if (savedOutput) setOutput(savedOutput);
                if (savedDuration) setAudioDuration(savedDuration);
            } catch (e) {
                console.error('Failed to load persisted state:', e);
            }
        };
        loadState();
    }, []);

    // Transcribe using Gemini API
    const transcribeWithAPI = useCallback(async (file: File): Promise<TranscriberOutput> => {
        const formData = new FormData();
        formData.append('audio', file);
        formData.append('language', language);
        
        setUploadProgress(0);
        
        const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
        });
        
        setUploadProgress(100);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Transcription failed');
        }
        
        const data = await response.json();
        
        // Format response to match expected structure
        const result: TranscriberOutput = {
            text: data.transcription,
            chunks: [{
                text: data.transcription,
                timestamp: [0, 0] as [number, number]
            }]
        };
        
        return result;
    }, [language]);

    const processNextInQueue = useCallback(async () => {
        if (isProcessingRef.current) return;

        const currentQueue = queueRef.current;
        const nextItem = currentQueue.find(item => item.status === 'pending');
        
        if (!nextItem) return;

        isProcessingRef.current = true;
        setIsProcessing(true);
        setIsBusy(true);
        
        setQueue(prev => prev.map(i => i.id === nextItem.id ? { ...i, status: 'processing' } : i));

        try {
            const result = await transcribeWithAPI(nextItem.file);
            
            setOutput(result);
            set('transcription-output', result);
            
            setQueue(prev => prev.map(i => 
                i.id === nextItem.id ? { ...i, status: 'complete', output: result } : i
            ));
            
        } catch (error) {
            console.error('Transcription error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            setQueue(prev => prev.map(i => 
                i.id === nextItem.id ? { ...i, status: 'error', error: errorMessage } : i
            ));
            setLastError(errorMessage);
        } finally {
            isProcessingRef.current = false;
            setIsProcessing(false);
            setIsBusy(false);
            setUploadProgress(0);
            
            // Process next item
            setTimeout(() => processNextInQueue(), 0);
        }
    }, [transcribeWithAPI]);

    const addQueueItems = useCallback((items: { file: File }[]) => {
        const newItems: QueueItem[] = items.map(item => ({
            id: Math.random().toString(36).substring(7),
            file: item.file,
            status: 'pending',
            progress: 0
        }));
        
        setQueue(prev => {
            const updatedQueue = [...prev, ...newItems];
            return updatedQueue;
        });
        
        setTimeout(() => {
            processNextInQueue();
        }, 0);
    }, [processNextInQueue]);

    // Sync queue state with ref
    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    // Simple start function for compatibility
    const start = useCallback((file: File) => {
        setQueue([]);
        addQueueItems([{ file }]);
    }, [addQueueItems]);

    return {
        isBusy,
        isProcessing,
        progressItems,
        output,
        language,
        setLanguage,
        start,
        estimatedTime,
        queue,
        addQueueItems,
        lastError,
        clearLastError,
        uploadProgress,
        audioDuration
    };
}

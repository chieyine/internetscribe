import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, RefreshCw, CheckCircle2, FileJson, FileText, Subtitles, Copy, Check, Search, X, Upload, Video, Music, Sparkles } from 'lucide-react';
import { ProgressItem, TranscriberOutput } from '../hooks/useTranscriber';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import AudioPlayer from './AudioPlayer';

interface TranscriptionViewProps {
    isBusy: boolean;
    isModelLoading: boolean;
    progressItems: ProgressItem[];
    output?: TranscriberOutput;
    onReset: () => void;
    estimatedTime?: number;
    audioData?: Float32Array | null;
    isSummarizing: boolean;
    summary?: string;
    onSummarize: () => void;
}

export default function TranscriptionView({
    isBusy,
    isModelLoading,
    progressItems,
    output,
    onReset,
    estimatedTime,
    audioData,
    isSummarizing,
    summary,
    onSummarize,
}: TranscriptionViewProps) {
    const [copied, setCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    
    // Media state for drag-and-drop playback
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'video' | 'audio' | null>(null);
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

    // Keyboard shortcuts
    const togglePlay = useCallback(() => {
        if (mediaRef.current) {
            if (mediaRef.current.paused) {
                mediaRef.current.play();
            } else {
                mediaRef.current.pause();
            }
        }
    }, []);

    const copyToClipboard = useCallback(async () => {
        if (!output) return;
        await navigator.clipboard.writeText(output.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [output]);

    useKeyboardShortcuts({
        onTogglePlay: togglePlay,
        onCopy: copyToClipboard,
        onSearch: () => setShowSearch(prev => !prev),
        onReset: () => setShowSearch(false),
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setMediaUrl(url);
        setMediaType(file.type.startsWith('video') ? 'video' : 'audio');
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'audio/*': [], 'video/*': [] },
        maxFiles: 1,
        noClick: true, // Allow clicking on children
        noKeyboard: true,
    });

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (mediaUrl) URL.revokeObjectURL(mediaUrl);
        };
    }, [mediaUrl]);

    const formatTimeVTT = (seconds: number) => {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().slice(11, 23);
    };

    const formatTimeSRT = (seconds: number) => {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().slice(11, 23).replace('.', ',');
    };

    const downloadFile = (format: 'txt' | 'json' | 'vtt' | 'srt') => {
        if (!output) return;
        
        let content = '';
        let type = 'text/plain';
        const filename = `transcription.${format}`;

        switch (format) {
            case 'json':
                content = JSON.stringify(output, null, 2);
                type = 'application/json';
                break;
            case 'vtt':
                content = 'WEBVTT\n\n';
                output.chunks.forEach((chunk, i) => {
                    const start = formatTimeVTT(chunk.timestamp[0]);
                    const end = formatTimeVTT(chunk.timestamp[1]);
                    content += `${i + 1}\n${start} --> ${end}\n${chunk.text.trim()}\n\n`;
                });
                break;
            case 'srt':
                output.chunks.forEach((chunk, i) => {
                    const start = formatTimeSRT(chunk.timestamp[0]);
                    const end = formatTimeSRT(chunk.timestamp[1]);
                    content += `${i + 1}\n${start} --> ${end}\n${chunk.text.trim()}\n\n`;
                });
                break;
            case 'txt':
            default:
                content = output.text;
                break;
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatTimeShort = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChunkClick = useCallback((timestamp: number) => {
        setCurrentTime(timestamp);
        // Seek media if available
        if (mediaRef.current) {
            mediaRef.current.currentTime = timestamp;
            mediaRef.current.play();
        }
    }, []);

    const handleTimeUpdate = useCallback((time: number) => {
        setCurrentTime(time);
    }, []);

    // Find current chunk based on playback time
    const getCurrentChunkIndex = () => {
        if (!output) return -1;
        return output.chunks.findIndex(
            chunk => currentTime >= chunk.timestamp[0] && currentTime < chunk.timestamp[1]
        );
    };

    // Filter chunks by search query
    const filteredChunks = output?.chunks.filter(chunk => 
        searchQuery === '' || chunk.text.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() 
                ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-700 px-0.5 rounded">{part}</mark>
                : part
        );
    };

    const currentChunkIndex = getCurrentChunkIndex();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl space-y-8"
        >
            {/* Loading State */}
            <AnimatePresence mode="wait">
                {(isBusy || isModelLoading) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8 border border-border rounded-xl p-8 bg-card/50 backdrop-blur-sm"
                    >
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-foreground/10 rounded-full blur-xl animate-pulse" />
                                <Loader2 className="w-8 h-8 animate-spin text-foreground relative z-10" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold tracking-tight">
                                    {isModelLoading ? 'Initializing AI Model' : 'Transcribing Audio'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {isModelLoading 
                                        ? 'This happens once. Downloading Whisper model...' 
                                        : estimatedTime 
                                            ? `Processing your audio locally... (~${Math.ceil(estimatedTime / 60)} min)` 
                                            : 'Processing your audio locally...'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-4 max-w-md mx-auto">
                            {progressItems.map((item, index) => {
                                const loadedMB = (item.loaded / (1024 * 1024)).toFixed(1);
                                const totalMB = (item.total / (1024 * 1024)).toFixed(1);
                                const percent = Math.round((item.loaded / item.total) * 100);
                                const isComplete = percent >= 100;
                                
                                return (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-2"
                                    >
                                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                            <span className="truncate max-w-[180px]" title={item.file}>
                                                {item.file.split('/').pop()?.replace('_quantized', '')}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                {isComplete ? (
                                                    <span className="text-green-600 dark:text-green-400">✓ Cached</span>
                                                ) : (
                                                    <>
                                                        <span>{loadedMB} / {totalMB} MB</span>
                                                        <span className="text-foreground font-semibold">{percent}%</span>
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <motion.div 
                                                className={`h-full ${isComplete ? 'bg-green-500' : 'bg-foreground'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                            
                            {/* Helpful tips during download */}
                            {isModelLoading && progressItems.length > 0 && (
                                <div className="text-xs text-muted-foreground text-center mt-4 p-3 bg-muted/30 rounded-lg space-y-1">
                                    <p className="flex items-center justify-center gap-1.5">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Models cache in your browser - next time is instant!
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result State */}
            {output && !isBusy && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* Header with actions */}
                    <div className="flex flex-col md:flex-row items-center justify-between border-b border-border pb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <h2 className="text-2xl font-bold tracking-tight">Transcription Complete</h2>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button
                                onClick={onReset}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                            >
                                <RefreshCw className="w-4 h-4" />
                                New
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    copied 
                                        ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={onSummarize}
                                disabled={isSummarizing}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    summary 
                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {isSummarizing ? 'Summarizing...' : 'Summarize'}
                            </button>
                            
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    showSearch 
                                        ? 'bg-foreground text-background' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                <Search className="w-4 h-4" />
                            </button>
                            <div className="h-6 w-px bg-border mx-2 hidden md:block" />
                            <button
                                onClick={() => downloadFile('txt')}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                title="Download Text"
                            >
                                <FileText className="w-4 h-4" />
                                TXT
                            </button>
                            <button
                                onClick={() => downloadFile('json')}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                title="Download JSON"
                            >
                                <FileJson className="w-4 h-4" />
                                JSON
                            </button>
                            <button
                                onClick={() => downloadFile('vtt')}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                title="Download VTT (Subtitles)"
                            >
                                <Subtitles className="w-4 h-4" />
                                VTT
                            </button>
                            <button
                                onClick={() => downloadFile('srt')}
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                                title="Download SRT (Subtitles)"
                            >
                                <Subtitles className="w-4 h-4" />
                                SRT
                            </button>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <AnimatePresence>
                        {summary && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-6 space-y-2"
                            >
                                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm uppercase tracking-wider">
                                    <Sparkles className="w-4 h-4" />
                                    AI Summary
                                </div>
                                <p className="text-foreground/90 leading-relaxed">
                                    {summary}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Search bar */}
                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search transcript..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 bg-muted rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-foreground/20"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Media Player Area (Dropzone) */}
                    <div 
                        {...getRootProps()} 
                        className={`relative rounded-xl overflow-hidden transition-all ${
                            isDragActive ? 'ring-2 ring-foreground' : ''
                        }`}
                    >
                        <input {...getInputProps()} />
                        
                        {/* Drag Overlay */}
                        <AnimatePresence>
                            {isDragActive && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 border-2 border-dashed border-foreground rounded-xl"
                                >
                                    <Upload className="w-12 h-12 animate-bounce" />
                                    <p className="text-lg font-medium">Drop media file to sync playback</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Player Logic */}
                        {mediaUrl ? (
                            <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                                {mediaType === 'video' ? (
                                    <video
                                        ref={mediaRef as React.RefObject<HTMLVideoElement>}
                                        src={mediaUrl}
                                        controls
                                        className="w-full max-h-[400px] mx-auto"
                                        onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
                                    />
                                ) : (
                                    <div className="p-4 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                            <Music className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <audio
                                            ref={mediaRef as React.RefObject<HTMLAudioElement>}
                                            src={mediaUrl}
                                            controls
                                            className="w-full"
                                            onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
                                        />
                                    </div>
                                )}
                                <div className="bg-muted/10 p-2 text-center text-xs text-muted-foreground">
                                    Playing local file
                                </div>
                            </div>
                        ) : audioData ? (
                            <AudioPlayer
                                audioData={audioData}
                                onTimeUpdate={handleTimeUpdate}
                                onSeek={handleChunkClick}
                            />
                        ) : (
                            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors cursor-pointer">
                                <Video className="w-8 h-8 opacity-50" />
                                <p className="text-sm font-medium">Drop audio/video file here to play along</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Transcript */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 space-y-2 max-h-[400px] overflow-y-auto">
                            {filteredChunks.map((chunk, i) => {
                                const originalIndex = output.chunks.indexOf(chunk);
                                const isActive = originalIndex === currentChunkIndex;
                                
                                return (
                                    <motion.div 
                                        key={i} 
                                        className={`flex gap-4 group cursor-pointer p-2 -mx-2 rounded-lg transition-colors ${
                                            isActive ? 'bg-foreground/10' : 'hover:bg-muted/50'
                                        }`}
                                        onClick={() => handleChunkClick(chunk.timestamp[0])}
                                        animate={isActive ? { scale: 1.01 } : { scale: 1 }}
                                    >
                                        <span className={`text-xs font-mono pt-1 select-none transition-opacity ${
                                            isActive ? 'text-foreground opacity-100' : 'text-muted-foreground opacity-50 group-hover:opacity-100'
                                        }`}>
                                            {formatTimeShort(chunk.timestamp[0])}
                                        </span>
                                        <p className={`leading-relaxed ${isActive ? 'text-foreground font-medium' : 'text-foreground/90'}`}>
                                            {highlightText(chunk.text, searchQuery)}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

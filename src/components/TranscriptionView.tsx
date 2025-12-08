import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, RefreshCw, CheckCircle2, FileJson, FileText, Subtitles, Copy, Check, Search, X, Sparkles, Languages, Clock } from 'lucide-react';
import { TranscriberOutput } from '../hooks/useTranscriber';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useToast } from './Toast';

const TRANSLATE_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
];

interface TranscriptionViewProps {
    isBusy: boolean;
    output?: TranscriberOutput;
    onReset: () => void;
    uploadProgress?: number;
}

export default function TranscriptionView({
    isBusy,
    output,
    onReset,
    uploadProgress = 0,
}: TranscriptionViewProps) {
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const { addToast } = useToast();
    
    // Summary state
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    
    // Translation state
    const [translation, setTranslation] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showTranslateMenu, setShowTranslateMenu] = useState(false);
    const translateMenuRef = useRef<HTMLDivElement>(null);

    // Click-outside handler for translate menu (H4)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (translateMenuRef.current && !translateMenuRef.current.contains(event.target as Node)) {
                setShowTranslateMenu(false);
            }
        };
        if (showTranslateMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTranslateMenu]);

    const copyToClipboard = useCallback(async () => {
        if (!output) return;
        await navigator.clipboard.writeText(output.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [output]);

    const handleSummarize = async () => {
        if (!output || isSummarizing) return;
        setIsSummarizing(true);
        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: output.text }),
            });
            const data = await response.json();
            if (data.success) {
                setSummary(data.summary);
            } else {
                addToast(data.error || 'Failed to summarize text', 'error');
            }
        } catch (error) {
            console.error('Summarization error:', error);
            addToast('Failed to summarize text. Please try again.', 'error');
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleTranslate = async (targetLanguage: string) => {
        if (!output || isTranslating) return;
        setIsTranslating(true);
        setShowTranslateMenu(false);
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: output.text, targetLanguage }),
            });
            const data = await response.json();
            if (data.success) {
                setTranslation(data.translation);
            } else {
                addToast(data.error || 'Failed to translate text', 'error');
            }
        } catch (error) {
            console.error('Translation error:', error);
            addToast('Failed to translate text. Please try again.', 'error');
        } finally {
            setIsTranslating(false);
        }
    };

    const onSearch = () => setShowSearch(!showSearch);

    useKeyboardShortcuts({
        onCopy: copyToClipboard,
        onSearch,
        onReset,
    });

    // Calculate stats
    const wordCount = output?.text.split(/\s+/).filter(Boolean).length || 0;
    const readTime = Math.ceil(wordCount / 200); // Average 200 words per minute

    const formatTimeVTT = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    };

    const formatTimeSRT = (seconds: number) => {
        const vtt = formatTimeVTT(seconds);
        return vtt.replace('.', ',');
    };

    const downloadFile = (format: 'txt' | 'json' | 'vtt' | 'srt') => {
        if (!output) return;

        let content: string;
        let mimeType: string;
        let filename: string;

        switch (format) {
            case 'txt':
                content = output.text;
                mimeType = 'text/plain';
                filename = 'transcription.txt';
                break;
            case 'json':
                content = JSON.stringify({
                    text: output.text,
                    chunks: output.chunks,
                    wordCount,
                    summary: summary || undefined,
                }, null, 2);
                mimeType = 'application/json';
                filename = 'transcription.json';
                break;
            case 'vtt':
                content = 'WEBVTT\n\n';
                output.chunks.forEach((chunk, index) => {
                    const start = formatTimeVTT(chunk.timestamp[0]);
                    const end = formatTimeVTT(chunk.timestamp[1] || chunk.timestamp[0] + 5);
                    content += `${index + 1}\n${start} --> ${end}\n${chunk.text.trim()}\n\n`;
                });
                mimeType = 'text/vtt';
                filename = 'transcription.vtt';
                break;
            case 'srt':
                content = '';
                output.chunks.forEach((chunk, index) => {
                    const start = formatTimeSRT(chunk.timestamp[0]);
                    const end = formatTimeSRT(chunk.timestamp[1] || chunk.timestamp[0] + 5);
                    content += `${index + 1}\n${start} --> ${end}\n${chunk.text.trim()}\n\n`;
                });
                mimeType = 'application/x-subrip';
                filename = 'transcription.srt';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        try {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } finally {
            URL.revokeObjectURL(url);
        }
    };

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() 
                ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">{part}</mark> 
                : part
        );
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl space-y-8"
        >
            {/* Loading State */}
            <AnimatePresence mode="wait">
                {isBusy && (
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
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold tracking-tight">
                                    Transcribing Audio
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Processing with Gemini AI... This usually takes a few seconds.
                                </p>
                            </div>
                        </div>
                        
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="space-y-2 max-w-md mx-auto">
                                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-foreground"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${uploadProgress}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                    />
                                </div>
                            </div>
                        )}
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
                    {/* Header with stats */}
                    <div className="flex flex-col md:flex-row items-center justify-between border-b border-border pb-6 gap-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Transcription Complete</h2>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        {wordCount.toLocaleString()} words
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        ~{readTime} min read
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
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
                        
                        {/* Summarize button */}
                        <button
                            onClick={handleSummarize}
                            disabled={isSummarizing}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                summary 
                                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            } ${isSummarizing ? 'opacity-50' : ''}`}
                        >
                            {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {isSummarizing ? 'Summarizing...' : summary ? 'Summarized' : 'Summarize'}
                        </button>

                        {/* Translate dropdown */}
                        <div className="relative" ref={translateMenuRef}>
                            <button
                                onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                                disabled={isTranslating}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    translation 
                                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                } ${isTranslating ? 'opacity-50' : ''}`}
                            >
                                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                                {isTranslating ? 'Translating...' : 'Translate'}
                            </button>
                            
                            {showTranslateMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-2 z-10 min-w-[150px]">
                                    {TRANSLATE_LANGUAGES.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleTranslate(lang.code)}
                                            className="w-full text-left px-3 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
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
                        
                        <button onClick={() => downloadFile('txt')} className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors" title="Download Text">
                            <FileText className="w-4 h-4" />
                            TXT
                        </button>
                        <button onClick={() => downloadFile('json')} className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors" title="Download JSON">
                            <FileJson className="w-4 h-4" />
                            JSON
                        </button>
                        <button onClick={() => downloadFile('vtt')} className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors" title="Download VTT">
                            <Subtitles className="w-4 h-4" />
                            VTT
                        </button>
                        <button onClick={() => downloadFile('srt')} className="flex items-center gap-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors" title="Download SRT">
                            <Subtitles className="w-4 h-4" />
                            SRT
                        </button>
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
                                <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                                    {summary}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Translation Section */}
                    <AnimatePresence>
                        {translation && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 space-y-2"
                            >
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider">
                                    <Languages className="w-4 h-4" />
                                    Translation
                                </div>
                                <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {translation}
                                </div>
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
                                        className="w-full pl-10 pr-10 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Transcript Text */}
                    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-8">
                        <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
                            {highlightText(output.text, searchQuery)}
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

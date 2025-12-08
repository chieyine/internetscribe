import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileAudio, CheckCircle2, Loader2, AlertCircle, Clock, Eye } from 'lucide-react';
import { TranscriberOutput } from '@/hooks/useTranscriber';

interface QueueItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'complete' | 'error';
    output?: TranscriberOutput;
    progress?: number;
    error?: string;
}

interface QueueListProps {
    queue: QueueItem[];
    onSelectItem?: (item: QueueItem) => void;
    selectedId?: string;
}

export default function QueueList({ queue, onSelectItem, selectedId }: QueueListProps) {
    if (queue.length === 0) return null;

    const completedCount = queue.filter(i => i.status === 'complete').length;

    return (
        <div className="w-full max-w-3xl space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                Queue ({completedCount}/{queue.length} complete)
            </h3>
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {queue.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            className={`
                                flex items-center gap-4 p-3 rounded-lg border transition-colors
                                ${item.status === 'processing' ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}
                                ${selectedId === item.id ? 'ring-2 ring-primary' : ''}
                            `}
                        >
                            <div className="p-2 rounded-md bg-muted">
                                <FileAudio className="w-5 h-5 text-muted-foreground" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                    {item.output && ` • ${item.output.text.split(/\s+/).filter(Boolean).length} words`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {item.status === 'pending' && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        Pending
                                    </div>
                                )}
                                {item.status === 'processing' && (
                                    <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Processing
                                    </div>
                                )}
                                {item.status === 'complete' && (
                                    <>
                                        <div className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Done
                                        </div>
                                        {onSelectItem && (
                                            <button
                                                onClick={() => onSelectItem(item)}
                                                className="flex items-center gap-1.5 text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full hover:bg-blue-500/20 transition-colors"
                                                title="View transcription"
                                            >
                                                <Eye className="w-3 h-3" />
                                                View
                                            </button>
                                        )}
                                    </>
                                )}
                                {item.status === 'error' && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full" title={item.error}>
                                        <AlertCircle className="w-3 h-3" />
                                        Error
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

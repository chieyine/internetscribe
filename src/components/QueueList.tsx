import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileAudio, CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';

interface QueueItem {
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'complete' | 'error';
    progress?: number;
}

interface QueueListProps {
    queue: QueueItem[];
}

export default function QueueList({ queue }: QueueListProps) {
    if (queue.length === 0) return null;

    return (
        <div className="w-full max-w-3xl space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                Queue ({queue.length})
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
                            `}
                        >
                            <div className="p-2 rounded-md bg-muted">
                                <FileAudio className="w-5 h-5 text-muted-foreground" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
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
                                    <div className="flex items-center gap-1.5 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Done
                                    </div>
                                )}
                                {item.status === 'error' && (
                                    <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
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

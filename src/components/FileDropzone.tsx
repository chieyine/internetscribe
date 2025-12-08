import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileDropzoneProps {
    onFilesAdded: (files: File[]) => void;
}

export default function FileDropzone({ onFilesAdded }: FileDropzoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFilesAdded(acceptedFiles);
        }
    }, [onFilesAdded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 
            'audio/*': [],
            'video/*': [] 
        },
        // Remove maxFiles restriction to allow batch
    });

    return (
        <div 
            {...getRootProps()} 
            className="w-full"
            role="button"
            aria-label="Upload audio or video files for transcription. Drag and drop files here or press Enter to browse."
            tabIndex={0}
        >
            <input {...getInputProps()} aria-label="File upload input" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.01, borderColor: "var(--foreground)" }}
                whileTap={{ scale: 0.99 }}
                className={`
                    relative overflow-hidden
                    border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors duration-300
                    ${isDragActive ? 'border-foreground bg-muted/50' : 'border-border hover:bg-muted/30'}
                `}
            >
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <AnimatePresence mode="wait">
                        {isDragActive ? (
                            <motion.div
                                key="upload"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                            >
                                <Upload className="w-16 h-16 text-foreground" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="audio"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="relative"
                            >
                                <div className="absolute -inset-4 bg-foreground/5 rounded-full blur-xl" />
                                <FileAudio className="w-16 h-16 text-foreground/80 relative z-10" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-3">
                        <h3 className="text-2xl font-semibold tracking-tight">
                            {isDragActive ? "Drop files to Transcribe" : "Upload Audio or Video Files"}
                        </h3>
                        <p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
                            Drag & drop your files here, or click to browse.
                            <br />
                            <span className="text-xs opacity-70">Supports MP3, WAV, MP4, MOV, WEBM</span>
                        </p>
                    </div>
                </div>

                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[radial-gradient(#fff_1px,transparent_1px)]" />
            </motion.div>
        </div>
    );
}

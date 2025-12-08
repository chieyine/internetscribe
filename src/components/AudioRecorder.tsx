import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AUDIO_SAMPLE_RATE } from '../lib/constants';

interface AudioRecorderProps {
    onRecordingComplete: (audioData: Float32Array) => void;
    onStreamData?: (audioData: Float32Array) => void;
}

export default function AudioRecorder({ onRecordingComplete, onStreamData }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, []);

    const processAudioBlob = async (blob: Blob): Promise<Float32Array> => {
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer.getChannelData(0);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = async (e) => {
                if (e.data.size > 0) {
                    chunks.current.push(e.data);
                }
            };

            mediaRecorder.current.onstop = async () => {
                setIsProcessing(true);
                if (streamIntervalRef.current) {
                    clearInterval(streamIntervalRef.current);
                }

                const blob = new Blob(chunks.current, { type: 'audio/webm' });
                const audioData = await processAudioBlob(blob);
                
                onRecordingComplete(audioData);
                setIsProcessing(false);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.current.start(1000); // Request data every second
            setIsRecording(true);
            
            // Start timer
            const startTime = Date.now();
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);

            // Stream data if callback provided
            if (onStreamData) {
                streamIntervalRef.current = setInterval(async () => {
                    if (chunks.current.length > 0) {
                        const blob = new Blob(chunks.current, { type: 'audio/webm' });
                        const audioData = await processAudioBlob(blob);
                        onStreamData(audioData);
                    }
                }, 2000); // Update every 2 seconds
            }

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please ensure permission is granted.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
            setDuration(0);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`
                    relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300
                    ${isRecording 
                        ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]' 
                        : 'bg-foreground text-background hover:bg-foreground/90'
                    }
                    ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                {isProcessing ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                ) : isRecording ? (
                    <Square className="w-8 h-8 fill-current text-white" />
                ) : (
                    <Mic className="w-8 h-8" />
                )}
                
                {/* Recording Pulse Ring */}
                {isRecording && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                )}
            </motion.button>

            <div className="h-8 flex items-center justify-center">
                {isRecording ? (
                    <div className="flex items-center gap-2 text-red-500 font-mono font-medium animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-current" />
                        {formatTime(duration)}
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground font-medium">
                        {isProcessing ? 'Processing Audio...' : 'Click to Record'}
                    </span>
                )}
            </div>
        </div>
    );
}

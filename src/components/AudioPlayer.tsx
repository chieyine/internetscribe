"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { AUDIO_SAMPLE_RATE } from '../lib/constants';

interface AudioPlayerProps {
    audioData: Float32Array;
    onTimeUpdate?: (time: number) => void;
    onSeek?: (time: number) => void;
}

export default function AudioPlayer({ 
    audioData, 
    onTimeUpdate,
    onSeek 
}: AudioPlayerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const animationRef = useRef<number>(0);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [playbackTime, setPlaybackTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const startTimeRef = useRef(0);
    const pausedAtRef = useRef(0);

    // Initialize audio context and buffer
    useEffect(() => {
        const initAudio = async () => {
            audioContextRef.current = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
            const buffer = audioContextRef.current.createBuffer(1, audioData.length, AUDIO_SAMPLE_RATE);
            buffer.getChannelData(0).set(audioData);
            audioBufferRef.current = buffer;
            setDuration(buffer.duration);
        };
        initAudio();

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            cancelAnimationFrame(animationRef.current);
        };
    }, [audioData]);

    // Draw waveform
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const centerY = height / 2;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw waveform
        const barWidth = 2;
        const gap = 1;
        const numBars = Math.floor(width / (barWidth + gap));
        const samplesPerBar = Math.floor(audioData.length / numBars);

        // Get computed styles
        const computedStyle = getComputedStyle(document.documentElement);
        const foregroundColor = computedStyle.getPropertyValue('--foreground').trim() || '#0a0a0a';
        
        for (let i = 0; i < numBars; i++) {
            let sum = 0;
            for (let j = 0; j < samplesPerBar; j++) {
                const index = i * samplesPerBar + j;
                if (index < audioData.length) {
                    sum += Math.abs(audioData[index]);
                }
            }
            const avg = sum / samplesPerBar;
            const barHeight = Math.max(2, avg * height * 2);
            
            const x = i * (barWidth + gap);
            const progress = playbackTime / duration;
            const isPlayed = x / width < progress;
            
            ctx.fillStyle = isPlayed ? foregroundColor : `${foregroundColor}33`;
            ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
        }
    }, [audioData, duration, playbackTime]);

    // Update time during playback
    useEffect(() => {
        if (!isPlaying) return;

        const updateTime = () => {
            if (audioContextRef.current && isPlaying) {
                const elapsed = (audioContextRef.current.currentTime - startTimeRef.current) * playbackRate;
                const newTime = pausedAtRef.current + elapsed;
                
                if (newTime >= duration) {
                    setIsPlaying(false);
                    setPlaybackTime(0);
                    pausedAtRef.current = 0;
                    onTimeUpdate?.(0);
                } else {
                    setPlaybackTime(newTime);
                    onTimeUpdate?.(newTime);
                    animationRef.current = requestAnimationFrame(updateTime);
                }
            }
        };
        
        animationRef.current = requestAnimationFrame(updateTime);
        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying, duration, playbackRate, onTimeUpdate]);

    const play = useCallback(() => {
        if (!audioContextRef.current || !audioBufferRef.current) return;

        // Stop existing source
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.playbackRate.value = playbackRate;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
            if (isPlaying) {
                setIsPlaying(false);
                setPlaybackTime(0);
                pausedAtRef.current = 0;
            }
        };

        startTimeRef.current = audioContextRef.current.currentTime;
        source.start(0, pausedAtRef.current);
        sourceNodeRef.current = source;
        setIsPlaying(true);
    }, [playbackRate, isPlaying]);

    const pause = useCallback(() => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
        }
        pausedAtRef.current = playbackTime;
        setIsPlaying(false);
    }, [playbackTime]);

    const seek = useCallback((time: number) => {
        pausedAtRef.current = time;
        setPlaybackTime(time);
        onSeek?.(time);
        
        if (isPlaying) {
            // Restart from new position
            if (sourceNodeRef.current) {
                sourceNodeRef.current.stop();
                sourceNodeRef.current.disconnect();
            }
            
            if (audioContextRef.current && audioBufferRef.current) {
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBufferRef.current;
                source.playbackRate.value = playbackRate;
                source.connect(audioContextRef.current.destination);
                startTimeRef.current = audioContextRef.current.currentTime;
                source.start(0, time);
                sourceNodeRef.current = source;
            }
        }
    }, [isPlaying, playbackRate, onSeek]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = x / rect.width;
        const newTime = progress * duration;
        seek(newTime);
    };

    const reset = () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
        }
        setIsPlaying(false);
        setPlaybackTime(0);
        pausedAtRef.current = 0;
        onSeek?.(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full space-y-4 p-4 bg-muted/30 rounded-xl border border-border" role="region" aria-label="Audio player">
            {/* Waveform */}
            <canvas
                ref={canvasRef}
                className="w-full h-16 cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20"
                onClick={handleCanvasClick}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') seek(Math.max(0, playbackTime - 5));
                    if (e.key === 'ArrowRight') seek(Math.min(duration, playbackTime + 5));
                    if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        if (isPlaying) {
                            pause();
                        } else {
                            play();
                        }
                    }
                }}
                role="slider"
                aria-label="Audio playback position. Use arrow keys to seek."
                aria-valuemin={0}
                aria-valuemax={Math.floor(duration)}
                aria-valuenow={Math.floor(playbackTime)}
                aria-valuetext={`${formatTime(playbackTime)} of ${formatTime(duration)}`}
                tabIndex={0}
            />

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={isPlaying ? pause : play}
                        className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </motion.button>
                    <button
                        onClick={reset}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Reset"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Time */}
                <div className="text-sm font-mono text-muted-foreground">
                    {formatTime(playbackTime)} / {formatTime(duration)}
                </div>

                {/* Speed */}
                <div className="flex items-center gap-1">
                    {[0.5, 1, 1.5, 2].map((rate) => (
                        <button
                            key={rate}
                            onClick={() => setPlaybackRate(rate)}
                            aria-label={`Set playback speed to ${rate}x`}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                playbackRate === rate 
                                    ? 'bg-foreground text-background' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {rate}x
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

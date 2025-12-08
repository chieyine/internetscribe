"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranscriber } from "@/hooks/useTranscriber";
import ThemeToggle from "@/components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Settings2, Loader2, AlertCircle, X, BookOpen } from "lucide-react";

// Lazy load components
const FileDropzone = dynamic(() => import("@/components/FileDropzone"), { 
  ssr: false,
  loading: () => <div className="w-full h-64 animate-pulse bg-muted/20 rounded-xl flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
});
const TranscriptionView = dynamic(() => import("@/components/TranscriptionView"), { 
  ssr: false,
  loading: () => <div className="w-full h-96 animate-pulse bg-muted/20 rounded-xl" />
});
const AudioRecorder = dynamic(() => import("@/components/AudioRecorder"), { ssr: false });
const Settings = dynamic(() => import("@/components/Settings"), { ssr: false });
const QueueList = dynamic(() => import("@/components/QueueList"), { ssr: false });
const InstallPrompt = dynamic(() => import("@/components/InstallPrompt"), { ssr: false });

export default function Home() {
  const { 
    isBusy, 
    progressItems, 
    output, 
    language,
    setLanguage,
    start, 
    estimatedTime, 
    addQueueItems,
    queue,
    lastError,
    clearLastError,
    uploadProgress
  } = useTranscriber();
  
  const [hasAudio, setHasAudio] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [showSettings, setShowSettings] = useState(false);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (lastError) {
      const timer = setTimeout(clearLastError, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastError, clearLastError]);

  const handleFilesAdded = (files: File[]) => {
    addQueueItems(files.map(file => ({ file })));
    setHasAudio(true);
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
    start(file);
    setHasAudio(true);
  };

  const handleReset = () => {
    setHasAudio(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 gap-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <header className="flex flex-col items-center gap-4 text-center pt-8 animate-in fade-in slide-in-from-top-4 duration-700 relative w-full">
          <div className="absolute top-4 right-4 sm:right-8 flex items-center gap-3">
            <Link 
              href="/blog" 
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Blog"
            >
              <BookOpen className="w-4 h-4" />
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-foreground/5 rounded-2xl backdrop-blur-sm border border-foreground/10 shadow-xl">
              <Sparkles className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
              InternetScribe
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-[600px] leading-relaxed">
            Transform your audio and video into text with <span className="text-foreground font-medium">fast AI transcription</span>. 
            Powered by Google Gemini.
          </p>
        </header>

        {/* Main Content */}
        <main className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-1">
            {!hasAudio ? (
              <div className="p-8 space-y-8">
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                            showSettings 
                                ? 'bg-foreground text-background shadow-lg scale-105' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        <Settings2 className="w-4 h-4" />
                        Settings
                    </button>
                </div>

                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <Settings 
                                language={language} 
                                setLanguage={setLanguage}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Mode Switcher */}
                <div className="flex p-1 bg-muted/50 rounded-xl self-center justify-center w-fit mx-auto">
                  <button
                    onClick={() => setInputMode('upload')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      inputMode === 'upload' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Upload Media
                  </button>
                  <button
                    onClick={() => setInputMode('record')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      inputMode === 'record' ? 'bg-red-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Record Audio
                  </button>
                </div>

                {inputMode === 'upload' ? (
                  <FileDropzone onFilesAdded={handleFilesAdded} />
                ) : (
                  <div className="flex flex-col gap-8">
                    <div className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center bg-card/30 min-h-[300px]">
                      <AudioRecorder 
                        onRecordingComplete={handleRecordingComplete}
                      />
                    </div>
                    
                    <QueueList queue={queue} />
                    
                  </div>
                )}
              </div>
            ) : (
              <TranscriptionView
                isBusy={isBusy}
                progressItems={progressItems}
                output={output}
                onReset={handleReset}
                uploadProgress={uploadProgress}
              />
            )}
          </div>
        </main>

        {/* Features Grid - SEO Content */}
        {!hasAudio && (
          <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-border">
            <div className="space-y-3 p-6 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Fast & Accurate</h3>
              <p className="text-sm text-muted-foreground">Powered by Google Gemini AI. Get accurate transcriptions in seconds, not minutes.</p>
            </div>
            <div className="space-y-3 p-6 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Free to Use</h3>
              <p className="text-sm text-muted-foreground">No sign-up, no credit card. Just upload your audio and get results instantly.</p>
            </div>
            <div className="space-y-3 p-6 rounded-xl bg-muted/30">
              <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Multiple Exports</h3>
              <p className="text-sm text-muted-foreground">Download your transcription as plain text, JSON with timestamps, or VTT subtitles.</p>
            </div>
          </div>
        )}

        {/* FAQ Section - SEO Content */}
        {!hasAudio && (
          <div className="pt-12 border-t border-border space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold">Is InternetScribe really free?</h3>
                <p className="text-muted-foreground">Yes! InternetScribe is completely free to use. There are no hidden fees, subscriptions, or limits on usage.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">What audio formats are supported?</h3>
                <p className="text-muted-foreground">We support MP3, WAV, M4A, and most common audio formats. You can also record directly in your browser.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">How accurate is the transcription?</h3>
                <p className="text-muted-foreground">We use Moonshine, the fastest open-source speech recognition model. Real-time transcription directly in your browser.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Is my audio data secure?</h3>
                <p className="text-muted-foreground">Absolutely. Your audio never leaves your device. All transcription happens locally using WebAssembly technology.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <InstallPrompt />
      
      {/* Error Toast */}
      <AnimatePresence>
        {lastError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50 max-w-sm"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl border bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 backdrop-blur-sm shadow-lg">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium flex-1">{lastError}</p>
              <button
                onClick={clearLastError}
                className="p-1 hover:bg-foreground/10 rounded-md transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

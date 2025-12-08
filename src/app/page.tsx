"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTranscriber, TranscriptionOptions, QueueItem } from "@/hooks/useTranscriber";
import ThemeToggle from "@/components/ThemeToggle";
import { AnimatePresence, motion } from "framer-motion";
import { 
    Sparkles, AlertCircle, X, BookOpen, Upload, Mic as MicIcon,
    Youtube, Briefcase, GraduationCap, MessageCircle, Podcast, Mic,
    ArrowRight, Zap, Globe, FileText
} from "lucide-react";

// Lazy load components
const FileDropzone = dynamic(() => import("@/components/FileDropzone"), { 
  ssr: false,
  loading: () => <div className="w-full h-64 animate-pulse bg-white/5 rounded-xl" />
});
const TranscriptionView = dynamic(() => import("@/components/TranscriptionView"), { 
  ssr: false,
  loading: () => <div className="w-full h-96 animate-pulse bg-white/5 rounded-xl" />
});
const AudioRecorder = dynamic(() => import("@/components/AudioRecorder"), { ssr: false });
const QueueList = dynamic(() => import("@/components/QueueList"), { ssr: false });


interface Workflow {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    gradient: string;
    options: TranscriptionOptions;
}

const WORKFLOWS: Workflow[] = [
    {
        id: 'youtuber',
        name: 'YouTuber',
        icon: Youtube,
        description: 'Subtitles & captions with timestamps',
        gradient: 'from-red-500 to-rose-600',
        options: { identifySpeakers: false, removeFillers: true, addTimestamps: true, meetingNotes: false },
    },
    {
        id: 'corporate',
        name: 'Corporate',
        icon: Briefcase,
        description: 'Meeting notes with action items',
        gradient: 'from-blue-500 to-indigo-600',
        options: { identifySpeakers: true, removeFillers: true, addTimestamps: false, meetingNotes: true },
    },
    {
        id: 'student',
        name: 'Student',
        icon: GraduationCap,
        description: 'Lecture notes with key points',
        gradient: 'from-green-500 to-emerald-600',
        options: { identifySpeakers: false, removeFillers: true, addTimestamps: true, meetingNotes: true },
    },
    {
        id: 'whatsapp',
        name: 'Voice Notes',
        icon: MessageCircle,
        description: 'Clean voice message text',
        gradient: 'from-emerald-500 to-teal-600',
        options: { identifySpeakers: false, removeFillers: true, addTimestamps: false, meetingNotes: false },
    },
    {
        id: 'podcast',
        name: 'Podcast',
        icon: Podcast,
        description: 'Multi-speaker transcription',
        gradient: 'from-purple-500 to-violet-600',
        options: { identifySpeakers: true, removeFillers: false, addTimestamps: true, meetingNotes: false },
    },
    {
        id: 'interview',
        name: 'Interview',
        icon: Mic,
        description: 'Speaker labels, polished text',
        gradient: 'from-orange-500 to-amber-600',
        options: { identifySpeakers: true, removeFillers: true, addTimestamps: false, meetingNotes: false },
    },
];

const LANGUAGES = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
];

export default function Home() {
  const { 
    isBusy, 
    output, 
    language,
    setLanguage,
    setOptions,
    start, 
    addQueueItems,
    queue,
    lastError,
    clearLastError,
    uploadProgress
  } = useTranscriber();
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);

  // Calculate which output to display
  const selectedItem = queue.find(item => item.id === selectedItemId);
  const displayOutput = selectedItem?.output || output;

  const handleSelectQueueItem = (item: QueueItem) => {
    if (item.output) {
      setSelectedItemId(item.id);
    }
  };

  // Auto-dismiss error
  useEffect(() => {
    if (lastError) {
      const timer = setTimeout(clearLastError, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastError, clearLastError]);

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setOptions(workflow.options);
  };

  const handleFilesAdded = (files: File[]) => {
    addQueueItems(files.map(file => ({ file })));
    setHasStarted(true);
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    start(file);
    setHasStarted(true);
  };

  const handleReset = () => {
    setHasStarted(false);
    setSelectedWorkflow(null);
  };

  const handleBack = () => {
    setSelectedWorkflow(null);
  };

  // Show transcription view when we have output or are transcribing
  if (hasStarted && (output || isBusy)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={handleReset} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <Sparkles className="w-6 h-6" />
              <span className="font-semibold">InternetScribe</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/blog" className="p-2 text-white/60 hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </Link>
              <ThemeToggle />
            </div>
          </div>

          {queue.length > 1 && (
            <div className="mb-6">
              <QueueList 
                queue={queue} 
                onSelectItem={handleSelectQueueItem}
                selectedId={selectedItemId}
              />
            </div>
          )}

          <TranscriptionView
            isBusy={isBusy}
            output={displayOutput}
            onReset={handleReset}
            uploadProgress={uploadProgress}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {lastError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-red-500/90 backdrop-blur-sm rounded-xl shadow-xl"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{lastError}</span>
            <button onClick={clearLastError} className="p-1 hover:bg-white/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">InternetScribe</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="p-2 text-white/60 hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!selectedWorkflow ? (
            /* STEP 1: Workflow Selection */
            <motion.div
              key="workflows"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero */}
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm"
                >
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Powered by Google Gemini AI
                </motion.div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Transcribe audio{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    in seconds
                  </span>
                </h1>
                <p className="text-lg text-white/60 max-w-xl mx-auto">
                  Select your workflow below and let AI do the rest. Accurate transcription with smart formatting.
                </p>
              </div>

              {/* Workflow Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {WORKFLOWS.map((workflow, index) => {
                  const Icon = workflow.icon;
                  return (
                    <motion.button
                      key={workflow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => handleWorkflowSelect(workflow)}
                      className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${workflow.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{workflow.name}</h3>
                      <p className="text-sm text-white/50">{workflow.description}</p>
                      <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                    </motion.button>
                  );
                })}
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h4 className="font-medium mb-1">Lightning Fast</h4>
                  <p className="text-sm text-white/50">Transcribe in seconds, not minutes</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="font-medium mb-1">50+ Languages</h4>
                  <p className="text-sm text-white/50">Auto-detect or choose manually</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <h4 className="font-medium mb-1">Smart Formatting</h4>
                  <p className="text-sm text-white/50">Speakers, timestamps, summaries</p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* STEP 2: Upload Section */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              {/* Selected Workflow Header */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedWorkflow.gradient} flex items-center justify-center`}>
                    <selectedWorkflow.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedWorkflow.name}</h2>
                    <p className="text-sm text-white/50">{selectedWorkflow.description}</p>
                  </div>
                </div>
              </div>

              {/* Language Selection */}
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <span className="text-sm text-white/50 mr-2">Language:</span>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      language === lang.code
                        ? 'bg-white text-black font-medium'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              {/* Input Mode Toggle */}
              <div className="flex p-1 bg-white/10 rounded-xl self-center justify-center w-fit mx-auto">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputMode === 'upload' 
                      ? 'bg-white text-black' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setInputMode('record')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputMode === 'record' 
                      ? 'bg-red-500 text-white' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <MicIcon className="w-4 h-4" />
                  Record
                </button>
              </div>

              {/* Upload/Record Area */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                {inputMode === 'upload' ? (
                  <FileDropzone onFilesAdded={handleFilesAdded} />
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[250px]">
                    <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                  </div>
                )}
              </div>

              <QueueList queue={queue} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

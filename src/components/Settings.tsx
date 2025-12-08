import React from 'react';
import { Settings2, Languages, Cpu, ArrowRightLeft, Info, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsProps {
    model: string;
    setModel: (model: string) => void;
    language: string;
    setLanguage: (lang: string) => void;
    task: 'transcribe' | 'translate';
    setTask: (task: 'transcribe' | 'translate') => void;
}

const LANGUAGES = [
    { code: 'auto', name: 'Auto-Detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ar', name: 'Arabic' },
];

const MODELS = [
    { id: 'xenova/whisper-tiny', name: 'Tiny', size: '~40MB', quality: 2, speed: 'Fastest', desc: 'Quick drafts, short clips' },
    { id: 'xenova/whisper-base', name: 'Base', size: '~75MB', quality: 3, speed: 'Fast', desc: 'Everyday use, clear audio' },
    { id: 'xenova/whisper-small', name: 'Small', size: '~250MB', quality: 4, speed: 'Moderate', desc: 'Good for most use cases' },
    { id: 'xenova/whisper-medium', name: 'Medium', size: '~750MB', quality: 5, speed: 'Slower', desc: 'High accuracy, complex audio' },
    { id: 'xenova/whisper-large-v3', name: 'Large V3', size: '~1.5GB', quality: 5, speed: 'Slowest', desc: 'Best quality, professional use' },
];

function QualityStars({ count }: { count: number }) {
    return (
        <span className="text-yellow-500" aria-label={`${count} out of 5 stars`}>
            {'★'.repeat(count)}{'☆'.repeat(5 - count)}
        </span>
    );
}

export default function Settings({
    model,
    setModel,
    language,
    setLanguage,
    task,
    setTask,
}: SettingsProps) {
    const selectedModel = MODELS.find(m => m.id === model) || MODELS[0];

    return (
        <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full max-w-xl bg-card/50 border border-border rounded-xl p-6 space-y-6 backdrop-blur-sm"
        >
            <div className="flex items-center gap-2 text-lg font-semibold">
                <Settings2 className="w-5 h-5" />
                <h3>Transcription Settings</h3>
            </div>

            <div className="grid gap-6">
                {/* Model Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <Cpu className="w-4 h-4" />
                        Model Size
                    </label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-foreground/20 outline-none"
                        aria-label="Select transcription model"
                    >
                        {MODELS.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name} ({m.size}) - {m.speed}
                            </option>
                        ))}
                    </select>
                    
                    {/* Selected Model Info */}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{selectedModel.name}</span>
                            <QualityStars count={selectedModel.quality} />
                        </div>
                        <p className="text-xs text-muted-foreground">{selectedModel.desc}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Size: {selectedModel.size}</span>
                            <span>Speed: {selectedModel.speed}</span>
                        </div>
                    </div>

                    {/* Caching Info */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                        <Download className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p>
                            <strong className="text-foreground">One-time download:</strong> Models are cached in your browser after the first use. 
                            Future transcriptions will load instantly without re-downloading.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Language Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Languages className="w-4 h-4" />
                            Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-foreground/20 outline-none"
                            aria-label="Select audio language"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Task Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <ArrowRightLeft className="w-4 h-4" />
                            Task
                        </label>
                        <div className="flex bg-background border border-border rounded-lg p-1">
                            <button
                                onClick={() => setTask('transcribe')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                    task === 'transcribe'
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                aria-pressed={task === 'transcribe'}
                            >
                                Transcribe
                            </button>
                            <button
                                onClick={() => setTask('translate')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                    task === 'translate'
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                aria-pressed={task === 'translate'}
                            >
                                Translate
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    {task === 'translate' 
                        ? 'Translates audio from any supported language to English text.' 
                        : 'Transcribes audio in the original language.'}
                </p>

                {/* Quality Guide */}
                <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-3">
                        <Info className="w-4 h-4" />
                        Model Guide
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="bg-muted/30 rounded-lg p-2">
                            <div className="font-medium">Quick Notes</div>
                            <div className="text-muted-foreground">Use Tiny or Base</div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2">
                            <div className="font-medium">Meetings</div>
                            <div className="text-muted-foreground">Use Small or Medium</div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-2">
                            <div className="font-medium">Professional</div>
                            <div className="text-muted-foreground">Use Large V3</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}


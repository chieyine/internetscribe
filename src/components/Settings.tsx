import React from 'react';
import { Settings2, Languages, Cpu, ArrowRightLeft } from 'lucide-react';
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
    { id: 'xenova/whisper-tiny', name: 'Tiny (Fastest, ~40MB)' },
    { id: 'xenova/whisper-base', name: 'Base (Balanced, ~70MB)' },
    { id: 'xenova/whisper-small', name: 'Small (Accurate, ~250MB)' },
];

export default function Settings({
    model,
    setModel,
    language,
    setLanguage,
    task,
    setTask,
}: SettingsProps) {
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

            <div className="grid gap-6 md:grid-cols-2">
                {/* Model Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <Cpu className="w-4 h-4" />
                        Model Size
                    </label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-foreground/20 outline-none"
                    >
                        {MODELS.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

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
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                                {l.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Task Selection */}
                <div className="space-y-2 md:col-span-2">
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
                        >
                            Translate to English
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {task === 'translate' 
                            ? 'Translates audio from any supported language to English text.' 
                            : 'Transcribes audio in the original language.'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

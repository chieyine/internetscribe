'use client';

import { motion } from 'framer-motion';
import { Globe, Info, Users, Clock, Sparkles, FileText } from 'lucide-react';

const LANGUAGES = [
    { code: 'auto', name: 'Auto-detect' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
];

export interface TranscriptionOptions {
    identifySpeakers: boolean;
    removeFillers: boolean;
    addTimestamps: boolean;
    meetingNotes: boolean;
}

interface SettingsProps {
    language: string;
    setLanguage: (language: string) => void;
    options: TranscriptionOptions;
    setOptions: (options: TranscriptionOptions) => void;
}

function ToggleOption({ 
    icon: Icon, 
    label, 
    description, 
    checked, 
    onChange 
}: { 
    icon: React.ElementType;
    label: string; 
    description: string; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex-shrink-0 mt-0.5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground/20"
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 font-medium text-sm">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {label}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
        </label>
    );
}

export default function Settings({ language, setLanguage, options, setOptions }: SettingsProps) {
    const updateOption = (key: keyof TranscriptionOptions, value: boolean) => {
        setOptions({ ...options, [key]: value });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-muted/30 rounded-xl border border-border space-y-6"
        >
            {/* Language Selection */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Globe className="w-4 h-4" />
                    Language
                </div>
                <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                                language === lang.code
                                    ? 'bg-foreground text-background font-medium shadow-lg'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transcription Options */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Transcription Options
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                    <ToggleOption
                        icon={Users}
                        label="Identify Speakers"
                        description="Label different speakers in the transcript"
                        checked={options.identifySpeakers}
                        onChange={(v) => updateOption('identifySpeakers', v)}
                    />
                    <ToggleOption
                        icon={Clock}
                        label="Add Timestamps"
                        description="Include time markers throughout"
                        checked={options.addTimestamps}
                        onChange={(v) => updateOption('addTimestamps', v)}
                    />
                    <ToggleOption
                        icon={Sparkles}
                        label="Remove Filler Words"
                        description="Remove um, uh, like, etc."
                        checked={options.removeFillers}
                        onChange={(v) => updateOption('removeFillers', v)}
                    />
                    <ToggleOption
                        icon={FileText}
                        label="Meeting Notes Format"
                        description="Structure with action items & key points"
                        checked={options.meetingNotes}
                        onChange={(v) => updateOption('meetingNotes', v)}
                    />
                </div>
            </div>

            {/* Info Section */}
            <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Info className="w-4 h-4" />
                    About
                </div>
                <p className="text-xs text-muted-foreground">
                    Powered by Google Gemini AI. Fast, accurate transcription in seconds.
                </p>
            </div>
        </motion.div>
    );
}

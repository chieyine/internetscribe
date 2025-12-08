'use client';

import { motion } from 'framer-motion';
import { Globe, Info } from 'lucide-react';

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

interface SettingsProps {
    language: string;
    setLanguage: (language: string) => void;
}

export default function Settings({ language, setLanguage }: SettingsProps) {
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

            {/* Info Section */}
            <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Info className="w-4 h-4" />
                    About
                </div>
                <p className="text-sm text-muted-foreground">
                    Powered by Google Gemini AI. Supports large files up to 100MB. 
                    Fast, accurate transcription in seconds.
                </p>
            </div>
        </motion.div>
    );
}


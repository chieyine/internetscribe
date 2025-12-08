'use client';

import { motion } from 'framer-motion';
import { Globe, Info, Users, Clock, Sparkles, FileText, Briefcase, GraduationCap, Youtube, MessageCircle, Mic, Video, Podcast } from 'lucide-react';

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

interface Workflow {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    color: string;
    options: TranscriptionOptions;
}

const WORKFLOWS: Workflow[] = [
    {
        id: 'youtuber',
        name: 'YouTuber',
        icon: Youtube,
        description: 'Captions & subtitles with timestamps',
        color: 'text-red-500',
        options: {
            identifySpeakers: false,
            removeFillers: true,
            addTimestamps: true,
            meetingNotes: false,
        },
    },
    {
        id: 'corporate',
        name: 'Corporate',
        icon: Briefcase,
        description: 'Meeting notes with action items',
        color: 'text-blue-500',
        options: {
            identifySpeakers: true,
            removeFillers: true,
            addTimestamps: false,
            meetingNotes: true,
        },
    },
    {
        id: 'student',
        name: 'Student',
        icon: GraduationCap,
        description: 'Lecture notes with key points',
        color: 'text-green-500',
        options: {
            identifySpeakers: false,
            removeFillers: true,
            addTimestamps: true,
            meetingNotes: true,
        },
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: MessageCircle,
        description: 'Clean voice message transcription',
        color: 'text-emerald-500',
        options: {
            identifySpeakers: false,
            removeFillers: true,
            addTimestamps: false,
            meetingNotes: false,
        },
    },
    {
        id: 'podcast',
        name: 'Podcast',
        icon: Podcast,
        description: 'Multi-speaker with timestamps',
        color: 'text-purple-500',
        options: {
            identifySpeakers: true,
            removeFillers: false,
            addTimestamps: true,
            meetingNotes: false,
        },
    },
    {
        id: 'interview',
        name: 'Interview',
        icon: Mic,
        description: 'Speaker labels, clean transcript',
        color: 'text-orange-500',
        options: {
            identifySpeakers: true,
            removeFillers: true,
            addTimestamps: false,
            meetingNotes: false,
        },
    },
    {
        id: 'video',
        name: 'Video Edit',
        icon: Video,
        description: 'Timestamps for video editing',
        color: 'text-pink-500',
        options: {
            identifySpeakers: false,
            removeFillers: false,
            addTimestamps: true,
            meetingNotes: false,
        },
    },
];

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
            <div className="shrink-0 mt-0.5">
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

    const applyWorkflow = (workflow: Workflow) => {
        setOptions(workflow.options);
    };

    // Find currently matching workflow
    const currentWorkflow = WORKFLOWS.find(w => 
        w.options.identifySpeakers === options.identifySpeakers &&
        w.options.removeFillers === options.removeFillers &&
        w.options.addTimestamps === options.addTimestamps &&
        w.options.meetingNotes === options.meetingNotes
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-muted/30 rounded-xl border border-border space-y-6"
        >
            {/* Workflow Presets */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Quick Workflows
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {WORKFLOWS.map((workflow) => {
                        const Icon = workflow.icon;
                        const isActive = currentWorkflow?.id === workflow.id;
                        return (
                            <button
                                key={workflow.id}
                                onClick={() => applyWorkflow(workflow)}
                                className={`p-3 rounded-lg text-left transition-all ${
                                    isActive 
                                        ? 'bg-foreground text-background shadow-lg scale-[1.02]' 
                                        : 'bg-muted/50 hover:bg-muted hover:scale-[1.01]'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className={`w-4 h-4 ${isActive ? '' : workflow.color}`} />
                                    <span className="text-sm font-medium">{workflow.name}</span>
                                </div>
                                <p className={`text-xs ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
                                    {workflow.description}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

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

            {/* Fine-tune Options */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    Fine-tune Options
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

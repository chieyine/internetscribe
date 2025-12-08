"use client";

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

type Theme = 'light' | 'dark' | 'system';

// SSR-safe mounting detection using useSyncExternalStore
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
    return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

export default function ThemeToggle() {
    const isMounted = useIsMounted();
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('theme') as Theme) || 'system';
    });

    useEffect(() => {
        const root = document.documentElement;
        
        if (theme === 'system') {
            localStorage.removeItem('theme');
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', isDark);
            root.classList.toggle('light', !isDark);
        } else {
            localStorage.setItem('theme', theme);
            root.classList.toggle('dark', theme === 'dark');
            root.classList.toggle('light', theme === 'light');
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            document.documentElement.classList.toggle('dark', e.matches);
            document.documentElement.classList.toggle('light', !e.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const options = useMemo(() => [
        { value: 'light' as Theme, icon: Sun, label: 'Light' },
        { value: 'dark' as Theme, icon: Moon, label: 'Dark' },
        { value: 'system' as Theme, icon: Monitor, label: 'System' },
    ], []);

    // Avoid hydration mismatch
    if (!isMounted) {
        return (
            <div className="inline-flex items-center p-1 bg-muted rounded-lg border border-border">
                <div className="p-2 w-8 h-8" />
                <div className="p-2 w-8 h-8" />
                <div className="p-2 w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="inline-flex items-center p-1 bg-muted rounded-lg border border-border">
            {options.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.value;
                
                return (
                    <motion.button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-2 rounded-md transition-colors ${
                            isActive 
                                ? 'bg-background text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title={option.label}
                    >
                        <Icon className="w-4 h-4" />
                    </motion.button>
                );
            })}
        </div>
    );
}


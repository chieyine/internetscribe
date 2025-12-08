"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const TOAST_DURATION = 5000;

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
    error: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const Icon = icons[toast.type];

    useEffect(() => {
        const timer = setTimeout(onRemove, TOAST_DURATION);
        return () => clearTimeout(timer);
    }, [onRemove]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg ${styles[toast.type]}`}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={onRemove}
                className="p-1 hover:bg-foreground/10 rounded-md transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" role="region" aria-label="Notifications">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => (
                        <ToastItem 
                            key={toast.id} 
                            toast={toast} 
                            onRemove={() => removeToast(toast.id)} 
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

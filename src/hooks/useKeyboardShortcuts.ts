import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
    onCopy?: () => void;
    onSearch?: () => void;
    onReset?: () => void;
}

export function useKeyboardShortcuts({
    onCopy,
    onSearch,
    onReset,
}: KeyboardShortcuts) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            // Only allow Escape in inputs
            if (e.key !== 'Escape') return;
        }

        const isMod = e.metaKey || e.ctrlKey;

        switch (e.key) {
            case 'c':
                // Cmd/Ctrl + C = copy (let browser handle if text selected)
                if (isMod && !window.getSelection()?.toString()) {
                    e.preventDefault();
                    onCopy?.();
                }
                break;
            case 'f':
                // Cmd/Ctrl + F = focus search
                if (isMod) {
                    e.preventDefault();
                    onSearch?.();
                }
                break;
            case 'Escape':
                // Escape = reset/close
                onReset?.();
                break;
        }
    }, [onCopy, onSearch, onReset]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

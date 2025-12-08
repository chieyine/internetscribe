import React from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';

export default function InstallPrompt() {
  const { isInstallable, install } = usePWA();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isInstallable || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 md:w-auto"
      >
        <div className="bg-foreground text-background p-4 rounded-xl shadow-2xl flex items-center gap-4 md:min-w-[320px]">
          <div className="p-2 bg-background/10 rounded-lg">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Install App</h3>
            <p className="text-xs opacity-80">Install InternetScribe for offline use</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-background/10 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={install}
              className="px-4 py-2 bg-background text-foreground text-sm font-medium rounded-lg hover:bg-background/90 transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register service worker in production, or in dev when on localhost
      const isLocalhost = 
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      
      if (process.env.NODE_ENV === "production" || isLocalhost) {
        navigator.serviceWorker.register("/sw.js").catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
      }
    }
  }, []);

  return null;
}

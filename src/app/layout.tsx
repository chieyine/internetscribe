import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "InternetScribe - Free Offline Audio Transcription",
  description: "Transcribe audio to text for free, privately in your browser. No uploads, no servers. Powered by Moonshine AI. Supports MP3, WAV, M4A. Export to TXT, JSON, VTT subtitles.",
  keywords: ["audio transcription", "speech to text", "whisper ai", "offline transcription", "free transcription", "audio to text", "voice to text", "transcribe audio"],
  authors: [{ name: "InternetScribe" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "InternetScribe - Free Offline Audio Transcription",
    description: "Transcribe audio to text privately in your browser. No uploads needed. Powered by AI.",
    type: "website",
    siteName: "InternetScribe",
  },
  twitter: {
    card: "summary_large_image",
    title: "InternetScribe - Free Offline Audio Transcription",
    description: "Transcribe audio to text privately in your browser. No uploads needed.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InternetScribe",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ErrorBoundary>{children}</ErrorBoundary>
        <ServiceWorkerRegistration />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  "name": "InternetScribe",
                  "applicationCategory": "MultimediaApplication",
                  "operatingSystem": "Any",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "description": "Free, private, offline audio transcription tool powered by AI.",
                  "featureList": "Offline transcription, Multilingual support, AI Summarization, Batch processing"
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "Is InternetScribe really free?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes! InternetScribe is completely free to use. There are no hidden fees, subscriptions, or limits on usage."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Is my audio data secure?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Absolutely. Your audio never leaves your device. All transcription happens locally using WebAssembly technology."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What audio formats are supported?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "We support MP3, WAV, M4A, OGG, FLAC, and WEBM formats."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How accurate is the transcription?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "We use Moonshine AI, optimized for real-time transcription. You can choose between Tiny for maximum speed or Base for best accuracy."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ToastProvider } from "@/components/Toast";
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
  metadataBase: new URL("https://internetscribe.com"),
  title: {
    default: "InternetScribe - Free AI Audio Transcription",
    template: "%s | InternetScribe",
  },
  description: "Transcribe audio to text for free with Google Gemini AI. Fast, accurate transcription in seconds. Supports MP3, WAV, M4A. Export to TXT, JSON, VTT subtitles.",
  keywords: ["audio transcription", "speech to text", "gemini ai", "transcription", "free transcription", "audio to text", "voice to text", "transcribe audio", "ai transcription", "convert audio to text"],
  authors: [{ name: "InternetScribe" }],
  creator: "InternetScribe",
  publisher: "InternetScribe",
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://internetscribe.com",
  },
  openGraph: {
    title: "InternetScribe - Free AI Audio Transcription",
    description: "Transcribe audio to text for free with Google Gemini AI. Fast, accurate, multi-language support.",
    url: "https://internetscribe.com",
    siteName: "InternetScribe",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "InternetScribe - Free AI Audio Transcription",
    description: "Transcribe audio to text for free with Google Gemini AI. Fast, accurate transcription.",
    creator: "@internetscribe",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InternetScribe",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        <ToastProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ToastProvider>
        <ServiceWorkerRegistration />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://internetscribe.com/#website",
                  "url": "https://internetscribe.com",
                  "name": "InternetScribe",
                  "description": "Free AI-powered audio transcription tool",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://internetscribe.com/blog?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://internetscribe.com/#app",
                  "name": "InternetScribe",
                  "applicationCategory": "MultimediaApplication",
                  "operatingSystem": "Any",
                  "url": "https://internetscribe.com",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
                  },
                  "description": "Free audio transcription tool powered by Google Gemini AI. Supports multiple languages and export formats.",
                  "featureList": "AI Transcription, Multi-language support, AI Summarization, Translation, Batch processing, Export to TXT/JSON/VTT/SRT",
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "ratingCount": "156"
                  }
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://internetscribe.com/#faq",
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
                      "name": "How does the transcription work?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Your audio is securely processed using Google Gemini AI for fast, accurate transcription. We support MP3, WAV, M4A, OGG, FLAC, and WEBM formats."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What languages are supported?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "InternetScribe supports English, Spanish, French, German, Japanese, Chinese, and auto-detection. You can also translate transcripts to 9+ languages."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What export formats are available?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Export your transcriptions as TXT, JSON (with metadata), VTT subtitles, or SRT subtitles for video editing."
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

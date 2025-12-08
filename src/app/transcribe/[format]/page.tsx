import { Metadata } from 'next';
import Home from '../../page';

type Props = {
  params: Promise<{ format: string }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const format = (await params).format.toUpperCase();
  const formatLower = format.toLowerCase();
  
  return {
    title: `Free ${format} to Text Converter`,
    description: `Convert ${format} audio files to text instantly with InternetScribe. Free, fast, and accurate ${formatLower} transcription. Export to TXT, JSON, VTT, or SRT.`,
    alternates: {
      canonical: `https://internetscribe.com/transcribe/${formatLower}`,
    },
    openGraph: {
      title: `Free ${format} to Text Converter - InternetScribe`,
      description: `Convert ${format} audio to text instantly. Free transcription with InternetScribe.`,
      url: `https://internetscribe.com/transcribe/${formatLower}`,
    },
    twitter: {
      title: `Free ${format} to Text Converter - InternetScribe`,
      description: `Convert ${format} audio to text instantly. Free transcription with InternetScribe.`,
    }
  }
}

export async function generateStaticParams() {
  return [
    { format: 'mp3' },
    { format: 'wav' },
    { format: 'm4a' },
    { format: 'ogg' },
    { format: 'flac' },
    { format: 'webm' },
  ]
}

export default function FormatPage() {
  return <Home />
}

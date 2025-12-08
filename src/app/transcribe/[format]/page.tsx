import { Metadata } from 'next';
import Home from '../../page';

type Props = {
  params: Promise<{ format: string }>
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const format = (await params).format.toUpperCase();
  
  return {
    title: `Free ${format} to Text Converter - InternetScribe`,
    description: `Convert ${format} audio files to text privately in your browser. No uploads, no servers. Fast, free, and secure transcription for ${format} files.`,
    openGraph: {
      title: `Free ${format} to Text Converter - InternetScribe`,
      description: `Transcribe ${format} audio to text privately in your browser.`,
    },
    twitter: {
      title: `Free ${format} to Text Converter - InternetScribe`,
      description: `Transcribe ${format} audio to text privately in your browser.`,
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

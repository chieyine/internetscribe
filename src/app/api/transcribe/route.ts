import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 5 minutes timeout for long audio files
export const maxDuration = 300;

interface TranscriptionOptions {
    identifySpeakers: boolean;
    removeFillers: boolean;
    addTimestamps: boolean;
    meetingNotes: boolean;
}

function buildPrompt(language: string, options: TranscriptionOptions): string {
    const parts: string[] = [];
    
    // Base instruction
    parts.push('Please transcribe the audio content accurately.');
    
    // Language handling
    if (language === 'auto') {
        parts.push('Detect the language automatically and transcribe in that language.');
    } else if (language !== 'en') {
        parts.push(`The audio is in ${language}. Transcribe it in that language.`);
    }
    
    // Speaker identification
    if (options.identifySpeakers) {
        parts.push('Identify different speakers and label them as [Speaker 1], [Speaker 2], etc. When a different person speaks, start a new paragraph with their speaker label.');
    }
    
    // Timestamps
    if (options.addTimestamps) {
        parts.push('Add timestamps throughout the transcript. Insert a timestamp marker like [00:30] or [01:45] approximately every 30 seconds of audio.');
    }
    
    // Remove filler words
    if (options.removeFillers) {
        parts.push('Remove filler words like "um", "uh", "like", "you know", "I mean", "so", and similar verbal fillers. Create a clean, readable transcript.');
    }
    
    // Meeting notes format
    if (options.meetingNotes) {
        parts.push(`Format the output as meeting notes with the following structure:
## Summary
A 2-3 sentence overview of what was discussed.

## Key Points
- Bullet points of main topics discussed

## Action Items
- List any tasks, decisions, or next steps mentioned

## Full Transcript
The complete transcription below.`);
    } else {
        parts.push('Format it with proper punctuation and paragraphs.');
    }
    
    // Final instruction
    if (!options.meetingNotes) {
        parts.push('Return only the transcription text, nothing else.');
    }
    
    return parts.join(' ');
}

export async function POST(request: NextRequest) {
    try {
        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Get the form data
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;
        const language = formData.get('language') as string || 'auto';
        const optionsStr = formData.get('options') as string || '{}';
        
        // Parse options with defaults
        const defaultOptions: TranscriptionOptions = {
            identifySpeakers: false,
            removeFillers: false,
            addTimestamps: false,
            meetingNotes: false,
        };
        const options: TranscriptionOptions = { ...defaultOptions, ...JSON.parse(optionsStr) };

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Validate file size (100MB limit)
        const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
        if (audioFile.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 100MB.' },
                { status: 413 }
            );
        }

        // Convert file to base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');

        // Determine MIME type
        const mimeType = audioFile.type || 'audio/mpeg';

        // Get Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build dynamic prompt based on options
        const prompt = buildPrompt(language, options);

        // Call Gemini API
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Audio,
                },
            },
            prompt,
        ]);

        const response = await result.response;
        const transcription = response.text();

        return NextResponse.json({
            success: true,
            transcription: transcription,
            language: language,
            options: options,
        });

    } catch (error: unknown) {
        console.error('Transcription error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
        
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

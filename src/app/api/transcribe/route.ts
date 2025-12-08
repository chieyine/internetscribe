import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 5 minutes timeout for long audio files
export const maxDuration = 300;

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

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Convert file to base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString('base64');

        // Determine MIME type
        const mimeType = audioFile.type || 'audio/mpeg';

        // Get Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build prompt based on language
        let prompt = 'Please transcribe the audio content accurately. ';
        if (language === 'auto') {
            prompt += 'Detect the language automatically and transcribe in that language. ';
        } else if (language !== 'en') {
            prompt += `The audio is in ${language}. Transcribe it in that language. `;
        }
        prompt += 'Return only the transcription text, nothing else. Format it with proper punctuation and paragraphs.';

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

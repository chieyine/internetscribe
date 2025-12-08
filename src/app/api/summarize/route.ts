import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        // Validate text length (500KB limit)
        const MAX_TEXT_SIZE = 500 * 1024; // 500KB
        if (text.length > MAX_TEXT_SIZE) {
            return NextResponse.json(
                { error: 'Text too large. Maximum size is 500KB.' },
                { status: 413 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Please provide a concise summary of the following transcript. 
Include:
1. A brief 2-3 sentence overview
2. Key points discussed (as bullet points)
3. Any action items or decisions mentioned

Keep it concise and actionable.

Transcript:
${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        return NextResponse.json({
            success: true,
            summary: summary,
        });

    } catch (error: unknown) {
        console.error('Summarization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Summarization failed';
        
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

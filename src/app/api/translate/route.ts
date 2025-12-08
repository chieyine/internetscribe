import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    nl: 'Dutch',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ru: 'Russian',
    ar: 'Arabic',
};

export async function POST(request: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        const { text, targetLanguage } = await request.json();

        if (!text || !targetLanguage) {
            return NextResponse.json(
                { error: 'Text and target language are required' },
                { status: 400 }
            );
        }

        const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Translate the following text to ${languageName}. 
Keep the original formatting, paragraph breaks, and structure.
Return only the translated text, nothing else.

Text to translate:
${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translation = response.text();

        return NextResponse.json({
            success: true,
            translation: translation,
            targetLanguage: targetLanguage,
        });

    } catch (error: unknown) {
        console.error('Translation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Translation failed';
        
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

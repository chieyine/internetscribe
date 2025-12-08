# InternetScribe

**InternetScribe** is a secure, offline audio transcription application built with Next.js 14 and WebAssembly. It uses OpenAI's Whisper model (via `@xenova/transformers`) to transcribe audio entirely within your browser—no data is ever sent to a server.

## Features

- **Offline Transcription**: Powered by WebAssembly, running locally in your browser.
- **Drag & Drop Interface**: Simple, intuitive file upload.
- **In-Browser Recording**: Record audio directly within the app.
- **Model Selection**: Choose between Tiny (Fast), Base (Balanced), and Small (Accurate) models.
- **Institutional Design**: High-end, "Institutional Authority" aesthetic using Tailwind CSS.
- **Secure**: Your audio files never leave your device.
- **Advanced Export**: Download transcriptions as Text, JSON, or VTT (subtitles).
- **PWA Ready**: Installable on desktop and mobile.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS (v4)
- **AI Engine**: `@xenova/transformers` (Whisper Tiny)
- **State Management**: React Hooks & Web Workers

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000).

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1. Push your code to a Git repository.
2. Import the project into Vercel.
3. Deploy! (No special build configuration required).

## License

MIT

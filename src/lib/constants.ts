// Audio processing configuration constants
// These values are used consistently across the application for Whisper AI compatibility

/**
 * Sample rate for audio processing (16kHz)
 * Whisper AI models expect 16kHz audio input
 */
export const AUDIO_SAMPLE_RATE = 16000;

/**
 * Service worker cache version
 * Increment this when deploying new versions to bust the cache
 */
export const CACHE_VERSION = 'v1';

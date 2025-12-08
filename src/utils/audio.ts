import { AUDIO_SAMPLE_RATE } from '../lib/constants';

export const decodeAudio = async (file: File): Promise<Float32Array> => {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new AudioContext({ sampleRate: AUDIO_SAMPLE_RATE });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const audioData = audioBuffer.getChannelData(0);
    // Close the AudioContext to prevent resource leaks
    await audioContext.close();
    return audioData;
};

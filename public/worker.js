import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Skip local model checks
env.allowLocalModels = false;
env.useBrowserCache = true; // Enable caching to avoid re-downloading models

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'xenova/whisper-tiny.en';
    static instance = null;

    static async getInstance(progress_callback = null, model = 'xenova/whisper-tiny.en') {
        if (this.instance === null || this.model !== model) {
            this.model = model;
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

class SummarizationPipelineSingleton {
    static task = 'summarization';
    static model = 'xenova/distilbart-cnn-6-6';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { action } = event.data;

    if (action === 'summarize') {
        const { text } = event.data;
        self.postMessage({ status: 'loading-summary' });
        
        try {
            const summarizer = await SummarizationPipelineSingleton.getInstance((data) => {
                self.postMessage({ status: 'progress-summary', ...data });
            });

            const output = await summarizer(text, {
                max_new_tokens: 100,
            });

            self.postMessage({
                status: 'complete-summary',
                result: output[0].summary_text,
            });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
        return;
    }

    // Default: Transcription
    const { audio, model, isPartial, language, task } = event.data;

    // Only send loading status if not a partial update
    if (!isPartial) {
        self.postMessage({ status: 'loading' });
    }

    try {
        const transcriber = await PipelineSingleton.getInstance((data) => {
            // Only send download progress for full requests or if model not loaded
            if (!isPartial) {
                self.postMessage({ status: 'progress', ...data });
            }
        }, model);

        const output = await transcriber(audio, {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: true,
            language: language === 'auto' ? null : language,
            task: task || 'transcribe',
        });

        self.postMessage({
            status: isPartial ? 'partial-complete' : 'complete',
            result: output,
        });
    } catch (error) {
        self.postMessage({
            status: 'error',
            error: error.message,
        });
    }
});

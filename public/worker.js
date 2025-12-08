import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Skip local model checks
env.allowLocalModels = false;
env.useBrowserCache = true; // Enable caching to avoid re-downloading models

// WebGPU detection
let device = 'wasm'; // Default to CPU/WASM

async function detectWebGPU() {
    try {
        if (typeof navigator !== 'undefined' && navigator.gpu) {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                device = 'webgpu';
                console.log('[InternetScribe] WebGPU detected - GPU acceleration enabled! 🚀');
                return true;
            }
        }
    } catch {
        console.log('[InternetScribe] WebGPU not available, using CPU');
    }
    return false;
}

// Detect WebGPU on worker load
const webgpuPromise = detectWebGPU();

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'onnx-community/moonshine-tiny-ONNX';
    static instance = null;
    static currentDevice = null;

    static async getInstance(progress_callback = null, model = 'onnx-community/moonshine-tiny-ONNX') {
        // Wait for WebGPU detection to complete
        await webgpuPromise;
        
        if (this.instance === null || this.model !== model || this.currentDevice !== device) {
            this.model = model;
            this.currentDevice = device;
            
            const options = { 
                progress_callback,
            };
            
            // Try WebGPU first, fall back to WASM
            if (device === 'webgpu') {
                try {
                    options.device = 'webgpu';
                    options.dtype = 'fp32'; // WebGPU works well with fp32
                    this.instance = await pipeline(this.task, this.model, options);
                    console.log('[InternetScribe] Model loaded with WebGPU acceleration');
                } catch (e) {
                    console.warn('[InternetScribe] WebGPU failed, falling back to CPU:', e.message);
                    device = 'wasm';
                    this.currentDevice = 'wasm';
                    delete options.device;
                    delete options.dtype;
                    this.instance = await pipeline(this.task, this.model, options);
                }
            } else {
                this.instance = await pipeline(this.task, this.model, options);
            }
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

    // Check device status
    if (action === 'check-device') {
        await webgpuPromise;
        self.postMessage({ 
            status: 'device-info', 
            device: device,
            isGPU: device === 'webgpu'
        });
        return;
    }

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
        self.postMessage({ status: 'loading', device: device });
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
            device: device, // Report which device was used
        });
    } catch (error) {
        self.postMessage({
            status: 'error',
            error: error.message,
        });
    }
});


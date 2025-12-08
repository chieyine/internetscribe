import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';

// Skip local model checks
env.allowLocalModels = false;
env.useBrowserCache = true; // Enable caching to avoid re-downloading models

// WebGPU detection with robust fallback
let device = 'wasm'; // Default to CPU/WASM

async function detectWebGPU() {
    try {
        if (typeof navigator !== 'undefined' && navigator.gpu) {
            // Try high-performance first, then fall back to low-power (integrated GPU)
            let adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
            if (!adapter) {
                adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' });
            }
            if (!adapter) {
                adapter = await navigator.gpu.requestAdapter();
            }
            
            if (adapter) {
                // Actually request the device to verify it works
                try {
                    const gpuDevice = await adapter.requestDevice();
                    if (gpuDevice) {
                        device = 'webgpu';
                        console.log('[InternetScribe] WebGPU verified - GPU acceleration enabled! 🚀');
                        gpuDevice.destroy(); // Clean up test device
                        return true;
                    }
                } catch (deviceError) {
                    console.warn('[InternetScribe] GPU device request failed:', deviceError.message);
                    return false;
                }
            }
        }
    } catch (e) {
        console.log('[InternetScribe] WebGPU not available, using CPU:', e.message);
    }
    console.log('[InternetScribe] Using CPU (WASM) for transcription');
    return false;
}

// Detect WebGPU on worker load
const webgpuPromise = detectWebGPU();

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance = null;
    static currentDevice = null;

    static async getInstance(progress_callback = null, model = 'Xenova/whisper-tiny.en') {
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


// Web Worker for running AI models in the background
// This prevents blocking the main UI thread

let pipeline = null;

// Dynamic import for Transformers.js
async function loadTransformers() {
  try {
    const { pipeline: createPipeline, env } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0');
    
    // Configure environment for browser
    env.allowLocalModels = false;
    env.remoteURL = 'https://huggingface.co/';
    
    return { createPipeline };
  } catch (error) {
    console.error('Failed to load Transformers.js:', error);
    throw error;
  }
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;
  
  try {
    switch (type) {
      case 'loadModel':
        self.postMessage({ type: 'status', message: 'Loading Transformers.js...' });
        const { createPipeline } = await loadTransformers();
        
        self.postMessage({ type: 'status', message: 'Creating pipeline...' });
        pipeline = await createPipeline(data.task, data.model, {
          progress_callback: (progress) => {
            self.postMessage({ 
              type: 'progress', 
              progress: progress.progress,
              message: `Loading model: ${Math.round(progress.progress * 100)}%`
            });
          }
        });
        
        self.postMessage({ type: 'modelLoaded', success: true });
        break;
        
      case 'runInference':
        if (!pipeline) {
          throw new Error('Model not loaded');
        }
        
        self.postMessage({ type: 'status', message: 'Running inference...' });
        const result = await pipeline(data.input);
        self.postMessage({ type: 'result', data: result });
        break;
        
      default:
        throw new Error('Unknown message type');
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error.message || 'Unknown error occurred' 
    });
  }
});
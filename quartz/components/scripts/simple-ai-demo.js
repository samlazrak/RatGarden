// Simple AI demo implementation using lightweight models or APIs

class SimpleAIDemo {
  constructor() {
    this.demos = document.querySelectorAll('.interactive-ai-demo');
    this.init();
  }

  init() {
    this.demos.forEach(demo => {
      const runBtn = demo.querySelector('.run-demo-btn');
      const demoType = demo.dataset.demoType;
      
      if (runBtn) {
        runBtn.addEventListener('click', () => this.runDemo(demo, demoType));
      }
      
      // Set up example buttons
      const exampleBtns = demo.querySelectorAll('.example-btn');
      exampleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const value = e.target.dataset.value;
          const input = demo.querySelector('.text-input');
          if (input) input.value = value;
        });
      });
    });
  }

  async runDemo(demo, demoType) {
    const input = this.getInput(demo);
    if (!input) {
      this.showError(demo, 'Please provide input');
      return;
    }

    this.setLoading(demo, true);
    
    try {
      let result;
      
      switch (demoType) {
        case 'nlp':
          result = await this.runSentimentAnalysis(input);
          break;
        case 'vision':
          result = await this.runImageClassification(input);
          break;
        case 'generative':
          result = await this.runTextGeneration(input);
          break;
        default:
          result = { error: 'Unknown demo type' };
      }
      
      this.displayResult(demo, result, demoType);
    } catch (error) {
      this.showError(demo, 'An error occurred: ' + error.message);
    } finally {
      this.setLoading(demo, false);
    }
  }

  getInput(demo) {
    const textInput = demo.querySelector('.text-input');
    if (textInput) return textInput.value.trim();
    
    const imageInput = demo.querySelector('.image-input');
    if (imageInput && imageInput.files[0]) return imageInput.files[0];
    
    return null;
  }

  async runSentimentAnalysis(text) {
    // Simple rule-based sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'awesome'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'disappointing', 'horrible'];
    
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeScore++;
    });
    
    let label, score;
    if (positiveScore > negativeScore) {
      label = 'POSITIVE';
      score = Math.min(0.6 + positiveScore * 0.1, 0.99);
    } else if (negativeScore > positiveScore) {
      label = 'NEGATIVE';
      score = Math.min(0.6 + negativeScore * 0.1, 0.99);
    } else {
      label = 'NEUTRAL';
      score = 0.85;
    }
    
    return {
      label,
      score,
      scores: [
        { label, score },
        { label: label === 'POSITIVE' ? 'NEGATIVE' : 'POSITIVE', score: 1 - score }
      ]
    };
  }

  async runImageClassification(file) {
    // Simulate image classification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const labels = ['cat', 'dog', 'bird', 'car', 'person'];
    const randomLabel = labels[Math.floor(Math.random() * labels.length)];
    const score = 0.7 + Math.random() * 0.25;
    
    return {
      label: randomLabel,
      score,
      scores: labels.map(label => ({
        label,
        score: label === randomLabel ? score : Math.random() * (1 - score)
      })).sort((a, b) => b.score - a.score)
    };
  }

  async runTextGeneration(prompt) {
    // Simple template-based generation
    const continuations = [
      " and the journey continues with endless possibilities ahead.",
      " which demonstrates the power of human creativity and innovation.",
      " as we explore the boundaries of what's possible together.",
      " revealing new insights with every step forward."
    ];
    
    const randomContinuation = continuations[Math.floor(Math.random() * continuations.length)];
    
    return {
      text: prompt + randomContinuation,
      prompt
    };
  }

  displayResult(demo, result, demoType) {
    const output = demo.querySelector('.demo-output');
    if (!output) return;
    
    let html = '';
    
    if (demoType === 'nlp' || demoType === 'vision') {
      html = `
        <div class="classification-result">
          <div class="main-result">
            <span class="result-label">Prediction:</span>
            <span class="result-value ${result.label.toLowerCase()}">${result.label}</span>
            <span class="confidence">${(result.score * 100).toFixed(1)}% confidence</span>
          </div>
          <div class="all-scores">
            ${result.scores.map(score => `
              <div class="score-item">
                <span class="score-label">${score.label}</span>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${score.score * 100}%"></div>
                </div>
                <span class="score-value">${(score.score * 100).toFixed(1)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (demoType === 'generative') {
      html = `
        <div class="generation-result">
          <div class="generated-text">
            <p><span class="prompt-text">${result.prompt}</span>${result.text.substring(result.prompt.length)}</p>
          </div>
        </div>
      `;
    }
    
    output.innerHTML = html;
  }

  setLoading(demo, loading) {
    const btn = demo.querySelector('.run-demo-btn');
    const status = demo.querySelector('.status-text');
    
    if (btn) {
      if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
      } else {
        btn.classList.remove('loading');
        btn.disabled = false;
      }
    }
    
    if (status) {
      status.textContent = loading ? 'Processing...' : 'Ready';
    }
  }

  showError(demo, message) {
    const output = demo.querySelector('.demo-output');
    if (output) {
      output.innerHTML = `
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <p>${message}</p>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SimpleAIDemo());
} else {
  new SimpleAIDemo();
}
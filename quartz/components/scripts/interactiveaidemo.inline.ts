interface ModelOutput {
  type: "classification" | "generation" | "visualization"
  data: any
  confidence?: number
  processingTime?: number
}

class InteractiveAIDemo {
  private element: HTMLElement
  private demoType: string
  private modelSource: string
  private modelId: string
  private fallbackBehavior: string
  private apiEndpoint: string
  private model: any = null
  private isModelLoading: boolean = false
  private isProcessing: boolean = false
  
  constructor(element: HTMLElement) {
    this.element = element
    this.demoType = element.dataset.demoType || "nlp"
    this.modelSource = element.dataset.modelSource || "huggingface"
    this.modelId = element.dataset.modelId || ""
    this.fallbackBehavior = element.dataset.fallback || "static"
    this.apiEndpoint = element.dataset.apiEndpoint || ""
    
    this.setupEventListeners()
    this.checkWebGPUSupport()
  }
  
  private async checkWebGPUSupport() {
    const statusText = this.element.querySelector(".status-text")
    const statusIndicator = this.element.querySelector(".status-indicator")
    
    if (!navigator.gpu && this.fallbackBehavior === "none") {
      this.updateStatus("error", "WebGPU not supported")
      this.disableDemo("Your browser doesn't support WebGPU. Please use a compatible browser.")
      return
    }
    
    if (this.modelSource === "huggingface" && this.modelId) {
      this.updateStatus("loading", "Loading model...")
      await this.loadModel()
    }
  }
  
  private async loadModel() {
    if (this.isModelLoading || this.model) return
    
    this.isModelLoading = true
    
    try {
      // In a real implementation, we would load the model using Transformers.js
      // For demo purposes, we'll simulate model loading
      await this.simulateModelLoading()
      
      this.model = { loaded: true }
      this.updateStatus("ready", "Model loaded")
    } catch (error) {
      console.error("Failed to load model:", error)
      
      if (this.fallbackBehavior === "api") {
        this.updateStatus("ready", "Using API fallback")
      } else if (this.fallbackBehavior === "static") {
        this.updateStatus("ready", "Using static demo")
      } else {
        this.updateStatus("error", "Model loading failed")
        this.disableDemo("Failed to load the AI model. Please try again later.")
      }
    } finally {
      this.isModelLoading = false
    }
  }
  
  private async simulateModelLoading() {
    // Simulate model download progress
    const steps = 5
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      this.updateStatus("loading", `Loading model... ${i * 20}%`)
    }
  }
  
  private setupEventListeners() {
    const runBtn = this.element.querySelector(".run-demo-btn")
    const exampleBtns = this.element.querySelectorAll(".example-btn")
    const textInput = this.element.querySelector(".text-input") as HTMLTextAreaElement
    const imageInput = this.element.querySelector(".image-input") as HTMLInputElement
    
    runBtn?.addEventListener("click", () => this.runDemo())
    
    exampleBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const value = (e.currentTarget as HTMLElement).dataset.value
        if (textInput && value) {
          textInput.value = value
        }
      })
    })
    
    imageInput?.addEventListener("change", (e) => this.handleImageUpload(e))
    
    // Run demo on Enter key in text input
    textInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault()
        this.runDemo()
      }
    })
  }
  
  private async handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    
    const preview = this.element.querySelector(".image-preview")
    if (!preview) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = document.createElement("img")
      img.src = e.target?.result as string
      preview.innerHTML = ""
      preview.appendChild(img)
    }
    reader.readAsDataURL(file)
  }
  
  private async runDemo() {
    if (this.isProcessing) return
    
    const input = this.getInput()
    if (!input) {
      this.showError("Please provide input for the demo")
      return
    }
    
    this.isProcessing = true
    this.setLoading(true)
    this.updateStatus("processing", "Processing...")
    
    const startTime = Date.now()
    
    try {
      let output: ModelOutput
      
      if (this.model && this.modelSource === "huggingface") {
        output = await this.runModelInference(input)
      } else if (this.fallbackBehavior === "api") {
        output = await this.runAPIInference(input)
      } else {
        output = await this.runStaticDemo(input)
      }
      
      output.processingTime = Date.now() - startTime
      this.displayOutput(output)
      this.updateStatus("ready", "Ready")
    } catch (error) {
      console.error("Demo error:", error)
      this.showError("An error occurred while running the demo")
      this.updateStatus("error", "Error occurred")
    } finally {
      this.isProcessing = false
      this.setLoading(false)
    }
  }
  
  private getInput(): string | File | null {
    const textInput = this.element.querySelector(".text-input") as HTMLTextAreaElement
    const imageInput = this.element.querySelector(".image-input") as HTMLInputElement
    
    if (textInput) {
      return textInput.value.trim()
    } else if (imageInput && imageInput.files?.[0]) {
      return imageInput.files[0]
    }
    
    return null
  }
  
  private async runModelInference(input: string | File): Promise<ModelOutput> {
    // Simulate model inference
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (this.demoType === "nlp") {
      return {
        type: "classification",
        data: {
          label: "POSITIVE",
          score: 0.9876,
          scores: [
            { label: "POSITIVE", score: 0.9876 },
            { label: "NEGATIVE", score: 0.0124 }
          ]
        },
        confidence: 0.9876
      }
    } else if (this.demoType === "vision") {
      return {
        type: "classification",
        data: {
          label: "cat",
          score: 0.923,
          scores: [
            { label: "cat", score: 0.923 },
            { label: "dog", score: 0.045 },
            { label: "bird", score: 0.032 }
          ]
        },
        confidence: 0.923
      }
    } else if (this.demoType === "generative") {
      const prompt = input as string
      return {
        type: "generation",
        data: {
          text: `${prompt} where AI and nature coexist in perfect harmony. The digital garden bloomed with algorithmic flowers, each petal a neural network learning from the sun's rays.`,
          prompt: prompt
        }
      }
    }
    
    return { type: "visualization", data: {} }
  }
  
  private async runAPIInference(input: string | File): Promise<ModelOutput> {
    // In a real implementation, this would call the API endpoint
    // For demo, we'll use the static demo
    return this.runStaticDemo(input)
  }
  
  private async runStaticDemo(input: string | File): Promise<ModelOutput> {
    // Static demo responses
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (this.demoType === "nlp") {
      const text = input as string
      const sentiment = this.analyzeStaticSentiment(text)
      
      return {
        type: "classification",
        data: {
          label: sentiment.label,
          score: sentiment.score,
          scores: [
            { label: sentiment.label, score: sentiment.score },
            { label: sentiment.label === "POSITIVE" ? "NEGATIVE" : "POSITIVE", score: 1 - sentiment.score }
          ]
        },
        confidence: sentiment.score
      }
    } else if (this.demoType === "vision") {
      // For image demos, return random classification
      const labels = ["cat", "dog", "bird", "fish", "rabbit"]
      const randomLabel = labels[Math.floor(Math.random() * labels.length)]
      const score = 0.7 + Math.random() * 0.3
      
      return {
        type: "classification",
        data: {
          label: randomLabel,
          score: score,
          scores: labels.map(label => ({
            label,
            score: label === randomLabel ? score : Math.random() * (1 - score) / (labels.length - 1)
          })).sort((a, b) => b.score - a.score)
        },
        confidence: score
      }
    } else if (this.demoType === "generative") {
      const prompt = input as string
      const continuations = [
        "and the future unfolds with infinite possibilities. Each line of code becomes a brushstroke painting tomorrow's canvas.",
        "where innovation meets imagination. The boundaries between human creativity and machine intelligence blur into something beautiful.",
        "as we embark on a journey through the digital landscape. Every algorithm tells a story waiting to be discovered."
      ]
      
      return {
        type: "generation",
        data: {
          text: prompt + " " + continuations[Math.floor(Math.random() * continuations.length)],
          prompt: prompt
        }
      }
    }
    
    return { type: "visualization", data: {} }
  }
  
  private analyzeStaticSentiment(text: string): { label: string; score: number } {
    const positiveWords = ["good", "great", "excellent", "amazing", "wonderful", "fantastic", "love", "best", "awesome", "brilliant"]
    const negativeWords = ["bad", "poor", "terrible", "awful", "hate", "worst", "disappointing", "horrible", "confusing", "difficult"]
    
    const lowerText = text.toLowerCase()
    let positiveCount = 0
    let negativeCount = 0
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++
    })
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++
    })
    
    if (positiveCount > negativeCount) {
      return { label: "POSITIVE", score: Math.min(0.6 + positiveCount * 0.1, 0.99) }
    } else if (negativeCount > positiveCount) {
      return { label: "NEGATIVE", score: Math.min(0.6 + negativeCount * 0.1, 0.99) }
    } else {
      return { label: "NEUTRAL", score: 0.85 }
    }
  }
  
  private displayOutput(output: ModelOutput) {
    const outputContainer = this.element.querySelector(".demo-output")
    if (!outputContainer) return
    
    let html = ""
    
    if (output.type === "classification") {
      html = `
        <div class="classification-result">
          <div class="main-result">
            <span class="result-label">Prediction:</span>
            <span class="result-value ${output.data.label.toLowerCase()}">${output.data.label}</span>
            <span class="confidence">${(output.data.score * 100).toFixed(1)}% confidence</span>
          </div>
          <div class="all-scores">
            ${output.data.scores.map((score: any) => `
              <div class="score-item">
                <span class="score-label">${score.label}</span>
                <div class="score-bar">
                  <div class="score-fill" style="width: ${score.score * 100}%"></div>
                </div>
                <span class="score-value">${(score.score * 100).toFixed(1)}%</span>
              </div>
            `).join("")}
          </div>
        </div>
      `
    } else if (output.type === "generation") {
      html = `
        <div class="generation-result">
          <div class="generated-text">
            <p><span class="prompt-text">${output.data.prompt}</span>${output.data.text.substring(output.data.prompt.length)}</p>
          </div>
        </div>
      `
    } else if (output.type === "visualization") {
      html = `
        <div class="visualization-result">
          <canvas id="demo-visualization"></canvas>
        </div>
      `
    }
    
    if (output.processingTime) {
      html += `
        <div class="processing-info">
          <span class="info-icon">⏱️</span>
          <span>Processed in ${output.processingTime}ms</span>
        </div>
      `
    }
    
    outputContainer.innerHTML = html
    
    // If visualization, render it
    if (output.type === "visualization") {
      this.renderVisualization(output.data)
    }
  }
  
  private renderVisualization(data: any) {
    // Placeholder for visualization rendering
    const canvas = this.element.querySelector("#demo-visualization") as HTMLCanvasElement
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Simple placeholder visualization
    canvas.width = canvas.offsetWidth
    canvas.height = 200
    
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--secondary")
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--light")
    ctx.font = "20px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Visualization Placeholder", canvas.width / 2, canvas.height / 2)
  }
  
  private updateStatus(status: "ready" | "loading" | "processing" | "error", text: string) {
    const statusText = this.element.querySelector(".status-text")
    const statusIndicator = this.element.querySelector(".status-indicator")
    
    if (statusText) statusText.textContent = text
    if (statusIndicator) {
      statusIndicator.className = `status-indicator ${status}`
    }
  }
  
  private setLoading(loading: boolean) {
    const runBtn = this.element.querySelector(".run-demo-btn")
    if (runBtn) {
      if (loading) {
        runBtn.classList.add("loading")
        runBtn.setAttribute("disabled", "true")
      } else {
        runBtn.classList.remove("loading")
        runBtn.removeAttribute("disabled")
      }
    }
  }
  
  private showError(message: string) {
    const outputContainer = this.element.querySelector(".demo-output")
    if (outputContainer) {
      outputContainer.innerHTML = `
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <p>${message}</p>
        </div>
      `
    }
  }
  
  private disableDemo(reason: string) {
    const runBtn = this.element.querySelector(".run-demo-btn")
    if (runBtn) {
      runBtn.setAttribute("disabled", "true")
    }
    this.showError(reason)
  }
}

// Initialize all interactive AI demos on the page
document.addEventListener("DOMContentLoaded", () => {
  const demos = document.querySelectorAll(".interactive-ai-demo")
  demos.forEach(element => {
    new InteractiveAIDemo(element as HTMLElement)
  })
})
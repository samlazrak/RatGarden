interface AIResponse {
  suggestions: string[]
  corrections: Array<{
    text: string
    replacement: string
    reason: string
    type: "grammar" | "style" | "clarity"
  }>
  summary?: string
  completion?: string
  score?: {
    grammar: number
    clarity: number
    engagement: number
  }
}

class AIWritingAssistant {
  private element: HTMLElement
  private provider: string
  private features: string[]
  private cacheStrategy: string
  private apiEndpoint: string
  private cache: Map<string, AIResponse> = new Map()
  private usageCount: number = 0
  private dailyLimit: number = 100
  
  constructor(element: HTMLElement) {
    this.element = element
    this.provider = element.dataset.provider || "mock"
    this.features = JSON.parse(element.dataset.features || "[]")
    this.cacheStrategy = element.dataset.cacheStrategy || "moderate"
    this.apiEndpoint = element.dataset.apiEndpoint || ""
    
    this.loadUsageCount()
    this.setupEventListeners()
  }
  
  private loadUsageCount() {
    const stored = localStorage.getItem("ai-assistant-usage")
    if (stored) {
      const data = JSON.parse(stored)
      const today = new Date().toDateString()
      if (data.date === today) {
        this.usageCount = data.count
      } else {
        this.usageCount = 0
      }
    }
    this.updateUsageDisplay()
  }
  
  private saveUsageCount() {
    localStorage.setItem("ai-assistant-usage", JSON.stringify({
      date: new Date().toDateString(),
      count: this.usageCount
    }))
  }
  
  private updateUsageDisplay() {
    const countEl = this.element.querySelector(".usage-count")
    if (countEl) {
      countEl.textContent = `${this.usageCount} / ${this.dailyLimit}`
    }
  }
  
  private setupEventListeners() {
    const trigger = this.element.querySelector(".ai-assistant-trigger")
    const closeBtn = this.element.querySelector(".close-btn")
    const analyzeBtn = this.element.querySelector(".analyze-btn")
    const clearBtn = this.element.querySelector(".clear-btn")
    const tabs = this.element.querySelectorAll(".tab-btn")
    const panel = this.element.querySelector(".assistant-panel")
    
    trigger?.addEventListener("click", () => {
      panel?.classList.add("active")
      this.element.classList.add("panel-open")
    })
    
    closeBtn?.addEventListener("click", () => {
      panel?.classList.remove("active")
      this.element.classList.remove("panel-open")
    })
    
    analyzeBtn?.addEventListener("click", () => this.analyze())
    clearBtn?.addEventListener("click", () => this.clear())
    
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        tabs.forEach(t => t.classList.remove("active"))
        ;(e.currentTarget as HTMLElement).classList.add("active")
      })
    })
    
    // Close panel when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.element.contains(e.target as Node) && panel?.classList.contains("active")) {
        panel.classList.remove("active")
        this.element.classList.remove("panel-open")
      }
    })
  }
  
  private async analyze() {
    const textInput = this.element.querySelector(".text-input") as HTMLTextAreaElement
    const text = textInput?.value.trim()
    
    if (!text) {
      this.showError("Please enter some text to analyze")
      return
    }
    
    if (this.usageCount >= this.dailyLimit) {
      this.showError("Daily usage limit reached. Please try again tomorrow.")
      return
    }
    
    const activeFeature = this.element.querySelector(".tab-btn.active")?.getAttribute("data-feature") || "grammar"
    
    this.setLoading(true)
    
    try {
      const response = await this.callAI(text, activeFeature)
      this.displayResults(response, activeFeature)
      
      this.usageCount++
      this.saveUsageCount()
      this.updateUsageDisplay()
    } catch (error) {
      this.showError("Failed to analyze text. Please try again.")
      console.error("AI Assistant error:", error)
    } finally {
      this.setLoading(false)
    }
  }
  
  private async callAI(text: string, feature: string): Promise<AIResponse> {
    // Check cache
    const cacheKey = `${feature}:${text.substring(0, 100)}`
    if (this.cacheStrategy !== "none" && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    
    // Mock implementation for demo
    if (this.provider === "mock") {
      const response = await this.mockAIResponse(text, feature)
      
      if (this.cacheStrategy !== "none") {
        this.cache.set(cacheKey, response)
      }
      
      return response
    }
    
    // Real API implementation would go here
    const apiResponse = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, feature })
    })
    
    if (!apiResponse.ok) {
      throw new Error("API request failed")
    }
    
    const response = await apiResponse.json()
    
    if (this.cacheStrategy !== "none") {
      this.cache.set(cacheKey, response)
    }
    
    return response
  }
  
  private async mockAIResponse(text: string, feature: string): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const response: AIResponse = {
      suggestions: [],
      corrections: [],
      score: {
        grammar: Math.floor(Math.random() * 20) + 80,
        clarity: Math.floor(Math.random() * 20) + 80,
        engagement: Math.floor(Math.random() * 20) + 80
      }
    }
    
    switch (feature) {
      case "grammar":
        response.corrections = [
          {
            text: "recieve",
            replacement: "receive",
            reason: "Common spelling mistake - 'i' before 'e' except after 'c'",
            type: "grammar"
          },
          {
            text: "it's",
            replacement: "its",
            reason: "Use 'its' for possession, 'it's' for 'it is'",
            type: "grammar"
          }
        ]
        response.suggestions = [
          "Consider using active voice for better clarity",
          "Break long sentences into shorter ones for readability"
        ]
        break
        
      case "style":
        response.corrections = [
          {
            text: "very important",
            replacement: "crucial",
            reason: "Use stronger adjectives to improve impact",
            type: "style"
          }
        ]
        response.suggestions = [
          "Vary sentence length for better rhythm",
          "Consider adding transitional phrases between paragraphs"
        ]
        break
        
      case "suggestions":
        response.suggestions = [
          "Add a compelling hook in the introduction",
          "Include specific examples to support your points",
          "Consider adding a call-to-action at the end"
        ]
        break
        
      case "completion":
        const words = text.split(" ")
        const lastWords = words.slice(-5).join(" ")
        response.completion = `${lastWords} and furthermore, this demonstrates the importance of continuous improvement in technical writing.`
        break
        
      case "summarize":
        response.summary = "This text discusses the importance of AI-assisted writing tools in modern content creation. Key points include grammar checking, style improvements, and the potential for AI to enhance clarity and engagement in written communication."
        break
    }
    
    return response
  }
  
  private displayResults(response: AIResponse, feature: string) {
    const resultsArea = this.element.querySelector(".results-area")
    if (!resultsArea) return
    
    let html = ""
    
    switch (feature) {
      case "grammar":
      case "style":
        if (response.corrections.length > 0) {
          html += "<div class='corrections-section'>"
          html += "<h4>Corrections:</h4>"
          html += "<ul class='corrections-list'>"
          
          for (const correction of response.corrections) {
            html += `
              <li class='correction-item'>
                <span class='correction-text'>"${correction.text}"</span>
                <span class='arrow'>→</span>
                <span class='replacement'>"${correction.replacement}"</span>
                <p class='reason'>${correction.reason}</p>
              </li>
            `
          }
          
          html += "</ul></div>"
        }
        
        if (response.suggestions.length > 0) {
          html += "<div class='suggestions-section'>"
          html += "<h4>Suggestions:</h4>"
          html += "<ul class='suggestions-list'>"
          
          for (const suggestion of response.suggestions) {
            html += `<li class='suggestion-item'>${suggestion}</li>`
          }
          
          html += "</ul></div>"
        }
        
        if (response.score) {
          html += "<div class='score-section'>"
          html += "<h4>Writing Score:</h4>"
          html += "<div class='scores'>"
          html += `<div class='score-item'><span>Grammar:</span> <span class='score-value'>${response.score.grammar}%</span></div>`
          html += `<div class='score-item'><span>Clarity:</span> <span class='score-value'>${response.score.clarity}%</span></div>`
          html += `<div class='score-item'><span>Engagement:</span> <span class='score-value'>${response.score.engagement}%</span></div>`
          html += "</div></div>"
        }
        break
        
      case "suggestions":
        html += "<div class='suggestions-section'>"
        html += "<h4>AI Suggestions:</h4>"
        html += "<ul class='suggestions-list enhanced'>"
        
        for (const suggestion of response.suggestions) {
          html += `<li class='suggestion-item'>${suggestion}</li>`
        }
        
        html += "</ul></div>"
        break
        
      case "completion":
        html += "<div class='completion-section'>"
        html += "<h4>AI Completion:</h4>"
        html += `<p class='completion-text'>${response.completion}</p>`
        html += "<button class='action-btn secondary use-completion'>Use This Text</button>"
        html += "</div>"
        break
        
      case "summarize":
        html += "<div class='summary-section'>"
        html += "<h4>AI Summary:</h4>"
        html += `<p class='summary-text'>${response.summary}</p>`
        html += "</div>"
        break
    }
    
    resultsArea.innerHTML = html
    
    // Add event listener for "Use This Text" button
    const useBtn = resultsArea.querySelector(".use-completion")
    if (useBtn) {
      useBtn.addEventListener("click", () => {
        const textInput = this.element.querySelector(".text-input") as HTMLTextAreaElement
        if (textInput && response.completion) {
          textInput.value = response.completion
        }
      })
    }
  }
  
  private clear() {
    const textInput = this.element.querySelector(".text-input") as HTMLTextAreaElement
    const resultsArea = this.element.querySelector(".results-area")
    
    if (textInput) textInput.value = ""
    if (resultsArea) {
      resultsArea.innerHTML = '<div class="results-placeholder"><p>Results will appear here after analysis...</p></div>'
    }
  }
  
  private setLoading(loading: boolean) {
    const analyzeBtn = this.element.querySelector(".analyze-btn")
    if (analyzeBtn) {
      if (loading) {
        analyzeBtn.classList.add("loading")
        analyzeBtn.setAttribute("disabled", "true")
      } else {
        analyzeBtn.classList.remove("loading")
        analyzeBtn.removeAttribute("disabled")
      }
    }
  }
  
  private showError(message: string) {
    const resultsArea = this.element.querySelector(".results-area")
    if (resultsArea) {
      resultsArea.innerHTML = `<div class="error-message">${message}</div>`
    }
  }
}

// Initialize all AI Writing Assistants on the page
document.addEventListener("DOMContentLoaded", () => {
  const assistants = document.querySelectorAll(".ai-writing-assistant")
  assistants.forEach(element => {
    new AIWritingAssistant(element as HTMLElement)
  })
})
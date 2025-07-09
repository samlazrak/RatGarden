import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { SimpleSlug, resolveRelative } from "../util/path"
import { SemanticLink } from "../util/semantic"
import semanticLinksStyle from "./styles/semanticLinks.scss"

export interface Options {
  title: string
  maxSuggestions: number
  minStrength: number
  showStrength: boolean
  showConfidence: boolean
  showExplanation: boolean
}

const defaultOptions: Options = {
  title: "Semantic Links",
  maxSuggestions: 5,
  minStrength: 0.3,
  showStrength: true,
  showConfidence: false,
  showExplanation: true,
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const SemanticLinks: QuartzComponent = ({ 
    displayClass, 
    fileData, 
    allFiles, 
    ctx 
  }: QuartzComponentProps) => {
    const semanticLinks = fileData.semanticLinks || []
    
    // Filter and sort semantic links
    const filteredLinks = semanticLinks
      .filter(link => link.strength >= options.minStrength)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, options.maxSuggestions)

    if (filteredLinks.length === 0) {
      return null
    }

    const strengthColor = (strength: number): string => {
      if (strength >= 0.7) return "semantic-strong"
      if (strength >= 0.5) return "semantic-medium"
      return "semantic-weak"
    }

    const strengthLabel = (strength: number): string => {
      if (strength >= 0.7) return "Strong"
      if (strength >= 0.5) return "Medium"
      return "Weak"
    }

    const formatStrength = (strength: number): string => {
      return `${Math.round(strength * 100)}%`
    }

    return (
      <div class={`semantic-links ${displayClass ?? ""}`}>
        <h3>{options.title}</h3>
        <div class="semantic-links-container">
          {filteredLinks.map((link, index) => {
            const targetFile = allFiles.find(f => f.slug === link.target)
            const targetTitle = targetFile?.frontmatter?.title || link.target
            const relativeUrl = resolveRelative(fileData.slug!, link.target)
            
            return (
              <div 
                key={index} 
                class={`semantic-link-item ${strengthColor(link.strength)}`}
              >
                <div class="semantic-link-header">
                  <a 
                    href={relativeUrl} 
                    class="semantic-link-title"
                    data-no-popover={false}
                  >
                    {targetTitle}
                  </a>
                  <div class="semantic-link-indicators">
                    {options.showStrength && (
                      <span class={`semantic-strength ${strengthColor(link.strength)}`}>
                        {formatStrength(link.strength)}
                      </span>
                    )}
                    {options.showConfidence && link.confidence && (
                      <span class="semantic-confidence">
                        {Math.round(link.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>
                
                <div class="semantic-link-meta">
                  <span class={`semantic-type semantic-type-${link.type}`}>
                    {link.type === "semantic" ? "AI Suggested" : 
                     link.type === "tag-based" ? "Tag Related" : "Direct Link"}
                  </span>
                  <span class={`semantic-strength-label ${strengthColor(link.strength)}`}>
                    {strengthLabel(link.strength)}
                  </span>
                </div>
                
                {options.showExplanation && link.explanation && (
                  <div class="semantic-explanation">
                    {link.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div class="semantic-links-footer">
          <span class="semantic-links-note">
            Links suggested by AI based on content similarity
          </span>
        </div>
      </div>
    )
  }

  SemanticLinks.displayName = "SemanticLinks"
  SemanticLinks.css = semanticLinksStyle
  return SemanticLinks
}) satisfies QuartzComponentConstructor
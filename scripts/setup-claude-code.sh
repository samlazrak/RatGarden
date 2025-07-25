#!/bin/bash

# Claude Code CLI Setup for RatGarden
echo "🚀 Setting up Claude Code CLI for maximum efficiency..."

# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Create Claude Code configuration
mkdir -p ~/.config/claude-code

cat > ~/.config/claude-code/config.json <<'EOF'
{
  "model": "claude-3-5-sonnet-20241022",
  "maxTokens": 4000,
  "temperature": 0.1,
  "systemPrompt": "You are an expert developer working on RatGarden, a Quartz 4 digital garden. Focus on efficiency, use existing patterns, and follow the project's conventions.",
  "subAgents": {
    "unit-test-engineer": {
      "description": "Specialized in creating comprehensive test suites",
      "prompt": "You are a unit testing expert. Create thorough, well-structured tests following TDD principles."
    },
    "code-reviewer": {
      "description": "Expert code review with focus on security and performance",
      "prompt": "You are a senior code reviewer. Focus on security, performance, and best practices."
    },
    "software-architecture-expert": {
      "description": "System design and architecture decisions",
      "prompt": "You are a software architect. Design scalable, maintainable systems."
    },
    "ai-ml-engineer-mentor": {
      "description": "AI/ML implementation guidance",
      "prompt": "You are an AI/ML engineer. Provide practical implementation guidance."
    },
    "professional-writer-career-advisor": {
      "description": "Technical writing and career positioning",
      "prompt": "You are a professional technical writer and career advisor."
    },
    "privacy-auditor": {
      "description": "Privacy and security compliance",
      "prompt": "You are a privacy and security expert. Ensure HIPAA/GDPR compliance."
    }
  },
  "hooks": {
    "pre-command": "scripts/claude-hooks/pre-command.sh",
    "post-command": "scripts/claude-hooks/post-command.sh"
  },
  "mcpServers": [
    "~/.config/claude-code/mcp-servers/project-context",
    "~/.config/claude-code/mcp-servers/code-snippets"
  ]
}
EOF

# Create hooks directory
mkdir -p scripts/claude-hooks

# Pre-command hook
cat > scripts/claude-hooks/pre-command.sh <<'EOF'
#!/bin/bash
# Load project context before each command
echo "Loading RatGarden context..."
cat .claude/claude-modes.md
echo "---"
cat CLAUDE.md | head -50
EOF
chmod +x scripts/claude-hooks/pre-command.sh

# Post-command hook
cat > scripts/claude-hooks/post-command.sh <<'EOF'
#!/bin/bash
# Save context and track usage
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
echo "$DATE,$TIME,$1" >> ~/.claude-knowledge/db/usage.csv
echo "Context saved and usage tracked."
EOF
chmod +x scripts/claude-hooks/post-command.sh

echo "✅ Claude Code CLI setup complete!"
echo "Usage: claude --sub-agent <agent-name> <command>" 
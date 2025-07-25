# Claude Efficiency Guide: Maximum Value from Your Subscription

## 1. Local Knowledge Base & Memory Systems

### SQLite Database for Persistent Memory
```bash
# Create a local knowledge base
sqlite3 ~/claude-knowledge.db <<EOF
CREATE TABLE IF NOT EXISTS contexts (
    id INTEGER PRIMARY KEY,
    project TEXT,
    context TEXT,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS code_snippets (
    id INTEGER PRIMARY KEY,
    language TEXT,
    description TEXT,
    code TEXT,
    usage_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS common_solutions (
    id INTEGER PRIMARY KEY,
    problem TEXT,
    solution TEXT,
    times_used INTEGER DEFAULT 0
);
EOF
```

### MCP Server Memory Integration
Your MCP memory server can store:
- Project-specific contexts
- Common code patterns
- Frequently used solutions
- API documentation snippets

## 2. Sub-Agent Strategies for Token Efficiency

### Task-Specific Sub-Agents
```markdown
/unit-test-engineer - Offload test generation
/code-reviewer - Automated code review
/software-architecture-expert - Design decisions
/general-purpose - Complex multi-step tasks
```

### Efficient Sub-Agent Usage Pattern
```python
# Instead of: "Write tests for all these functions"
# Use: Launch unit-test-engineer for batch testing

# Instead of: "Review this entire codebase"
# Use: Launch code-reviewer for targeted reviews
```

## 3. Local File Strategies

### Project Templates
```bash
# Create reusable templates
mkdir -p ~/.claude-templates/{react,python,node}

# Store common patterns
cat > ~/.claude-templates/react/component.tsx <<'EOF'
import { FC } from 'preact/compat'

interface ${NAME}Props {
  // Props here
}

export const ${NAME}: FC<${NAME}Props> = ({}) => {
  return <div>${NAME}</div>
}
EOF
```

### Context Files
```bash
# Project-specific context
cat > .claude-context.json <<'EOF'
{
  "project": "RatGarden",
  "stack": ["Quartz", "TypeScript", "Preact"],
  "conventions": {
    "testing": "vitest",
    "styling": "SCSS",
    "linting": "npm run check"
  },
  "common_commands": {
    "dev": "npm run dev",
    "test": "npm run test",
    "build": "npm run build"
  }
}
EOF
```

## 4. Token-Saving Techniques

### Batch Operations
```bash
# Instead of multiple queries:
# "Create a component"
# "Add tests"
# "Add styles"

# Use one query with todo list:
# "Create component with tests and styles"
```

### Reference Instead of Repeat
```markdown
# Store common patterns in CLAUDE.md
# Reference: "Use the error handling pattern from CLAUDE.md"
# Instead of: "Wrap this in try-catch with proper error logging..."
```

### Use Grep/Glob Instead of Reading
```bash
# Don't: "Read all files in src/"
# Do: "Find files matching pattern"
grep -r "pattern" src/
glob "**/*.tsx"
```

## 5. Efficient Workflow Patterns

### 1. Start with Planning
```markdown
- Use TodoWrite immediately
- Break complex tasks into subtasks
- Let sub-agents handle specialized work
```

### 2. Leverage Search Tools
```markdown
- Use Grep for code searches
- Use Glob for file discovery
- Avoid reading entire files when possible
```

### 3. Context Preservation
```markdown
- Update CLAUDE.md with project conventions
- Store successful patterns in local DB
- Use MCP memory for cross-session context
```

## 6. Automation Scripts

### Token Usage Tracker
```bash
#!/bin/bash
# track-tokens.sh
cat > ~/bin/track-tokens.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
echo "$DATE,$TIME,$1" >> ~/.claude-usage.csv
EOF
chmod +x ~/bin/track-tokens.sh
```

### Quick Context Loader
```bash
#!/bin/bash
# load-context.sh
cat > ~/bin/load-context.sh <<'EOF'
#!/bin/bash
PROJECT=$1
sqlite3 ~/claude-knowledge.db "SELECT context FROM contexts WHERE project='$PROJECT' ORDER BY created_at DESC LIMIT 1"
EOF
chmod +x ~/bin/load-context.sh
```

## 7. MCP Server Extensions

### Custom MCP Servers to Install
```bash
# Code snippet server
npx @code-snippets/mcp-server

# Documentation cache server
npx @doc-cache/mcp-server

# Project context server
npx @project-context/mcp-server
```

## 8. Best Practices Summary

1. **Pre-load Context**: Use CLAUDE.md and local files
2. **Batch Requests**: Combine related tasks
3. **Use Sub-agents**: Offload specialized work
4. **Cache Solutions**: Store in SQLite/MCP memory
5. **Template Everything**: Reuse common patterns
6. **Search > Read**: Use search tools efficiently
7. **Plan First**: TodoWrite before implementation

## 9. Example Efficient Session

```markdown
1. Load project context from CLAUDE.md
2. Create todo list for entire feature
3. Launch architecture sub-agent for design
4. Use templates for boilerplate
5. Launch test sub-agent for tests
6. Store solution in memory for reuse
```

## 10. Quick Reference Commands

```bash
# Save current context
echo "Project: X, Context: Y" | sqlite3 ~/claude-knowledge.db "INSERT INTO contexts (project, context) VALUES ('X', ?);"

# Load previous context
sqlite3 ~/claude-knowledge.db "SELECT context FROM contexts WHERE project='X' LIMIT 1"

# Track token usage
~/bin/track-tokens.sh "Feature implementation - 500 tokens"

# Use sub-agent
# Just ask: "Use the unit-test-engineer to create tests"
```
#!/bin/bash

# Initialize Claude Knowledge Base System
echo "🚀 Initializing Claude Knowledge Base System..."

# Create knowledge base directory
mkdir -p ~/.claude-knowledge/{db,templates,contexts,tracking}

# Initialize SQLite database
sqlite3 ~/.claude-knowledge/db/claude-knowledge.db <<EOF
-- Project contexts table
CREATE TABLE IF NOT EXISTS contexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project TEXT NOT NULL,
    context TEXT NOT NULL,
    summary TEXT,
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    use_count INTEGER DEFAULT 1
);

-- Code snippets table
CREATE TABLE IF NOT EXISTS code_snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL,
    description TEXT NOT NULL,
    code TEXT NOT NULL,
    tags TEXT,
    project TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

-- Common solutions table
CREATE TABLE IF NOT EXISTS solutions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    category TEXT,
    tags TEXT,
    times_used INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

-- Token usage tracking table
CREATE TABLE IF NOT EXISTS token_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    task_description TEXT,
    tokens_used INTEGER,
    tokens_saved INTEGER,
    method_used TEXT,
    project TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Efficiency patterns table
CREATE TABLE IF NOT EXISTS efficiency_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_name TEXT NOT NULL,
    description TEXT,
    before_tokens INTEGER,
    after_tokens INTEGER,
    savings_percent REAL,
    example TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_contexts_project ON contexts(project);
CREATE INDEX idx_snippets_language ON code_snippets(language);
CREATE INDEX idx_solutions_category ON solutions(category);
CREATE INDEX idx_token_usage_date ON token_usage(date);
CREATE INDEX idx_token_usage_project ON token_usage(project);

-- Create views for common queries
CREATE VIEW recent_contexts AS
SELECT project, context, summary, last_used
FROM contexts
ORDER BY last_used DESC
LIMIT 10;

CREATE VIEW token_usage_summary AS
SELECT 
    date,
    project,
    SUM(tokens_used) as total_tokens,
    SUM(tokens_saved) as total_saved,
    COUNT(*) as task_count
FROM token_usage
GROUP BY date, project
ORDER BY date DESC;

CREATE VIEW popular_snippets AS
SELECT language, description, code, usage_count
FROM code_snippets
WHERE usage_count > 0
ORDER BY usage_count DESC
LIMIT 20;
EOF

echo "✅ Database initialized"

# Create helper scripts
cat > ~/.claude-knowledge/save-context.sh <<'EOF'
#!/bin/bash
# Usage: save-context.sh <project> <context> [summary]

PROJECT="$1"
CONTEXT="$2"
SUMMARY="${3:-}"

if [ -z "$PROJECT" ] || [ -z "$CONTEXT" ]; then
    echo "Usage: save-context.sh <project> <context> [summary]"
    exit 1
fi

sqlite3 ~/.claude-knowledge/db/claude-knowledge.db <<SQL
INSERT OR REPLACE INTO contexts (project, context, summary)
VALUES ('$PROJECT', '$CONTEXT', '$SUMMARY');
SQL

echo "✅ Context saved for project: $PROJECT"
EOF

cat > ~/.claude-knowledge/get-context.sh <<'EOF'
#!/bin/bash
# Usage: get-context.sh <project>

PROJECT="$1"

if [ -z "$PROJECT" ]; then
    echo "Usage: get-context.sh <project>"
    exit 1
fi

sqlite3 ~/.claude-knowledge/db/claude-knowledge.db <<SQL
UPDATE contexts SET use_count = use_count + 1, last_used = CURRENT_TIMESTAMP
WHERE project = '$PROJECT';

SELECT context FROM contexts
WHERE project = '$PROJECT'
ORDER BY last_used DESC
LIMIT 1;
SQL
EOF

cat > ~/.claude-knowledge/track-tokens.sh <<'EOF'
#!/bin/bash
# Usage: track-tokens.sh <tokens_used> <task_description> [project] [tokens_saved]

TOKENS="$1"
TASK="$2"
PROJECT="${3:-default}"
SAVED="${4:-0}"

if [ -z "$TOKENS" ] || [ -z "$TASK" ]; then
    echo "Usage: track-tokens.sh <tokens_used> <task_description> [project] [tokens_saved]"
    exit 1
fi

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M:%S)

sqlite3 ~/.claude-knowledge/db/claude-knowledge.db <<SQL
INSERT INTO token_usage (date, time, task_description, tokens_used, tokens_saved, project)
VALUES ('$DATE', '$TIME', '$TASK', $TOKENS, $SAVED, '$PROJECT');
SQL

echo "✅ Token usage tracked: $TOKENS tokens for $TASK"
EOF

cat > ~/.claude-knowledge/save-snippet.sh <<'EOF'
#!/bin/bash
# Usage: save-snippet.sh <language> <description> <code_file> [project]

LANG="$1"
DESC="$2"
FILE="$3"
PROJECT="${4:-}"

if [ -z "$LANG" ] || [ -z "$DESC" ] || [ -z "$FILE" ]; then
    echo "Usage: save-snippet.sh <language> <description> <code_file> [project]"
    exit 1
fi

CODE=$(cat "$FILE" | sed "s/'/'''/g")

sqlite3 ~/.claude-knowledge/db/claude-knowledge.db <<SQL
INSERT INTO code_snippets (language, description, code, project)
VALUES ('$LANG', '$DESC', '$CODE', '$PROJECT');
SQL

echo "✅ Code snippet saved: $DESC"
EOF

cat > ~/.claude-knowledge/token-report.sh <<'EOF'
#!/bin/bash
# Generate token usage report

echo "📊 Token Usage Report"
echo "===================="

sqlite3 -header -column ~/.claude-knowledge/db/claude-knowledge.db <<SQL
SELECT 
    date,
    project,
    SUM(tokens_used) as tokens_used,
    SUM(tokens_saved) as tokens_saved,
    COUNT(*) as tasks,
    ROUND(CAST(SUM(tokens_saved) AS FLOAT) / (SUM(tokens_used) + SUM(tokens_saved)) * 100, 2) as savings_pct
FROM token_usage
WHERE date >= date('now', '-7 days')
GROUP BY date, project
ORDER BY date DESC;
SQL

echo ""
echo "Top Token-Saving Methods:"
sqlite3 -header -column ~/.claude-knowledge/db/claude-knowledge.db <<SQL
SELECT 
    method_used,
    COUNT(*) as times_used,
    SUM(tokens_saved) as total_saved
FROM token_usage
WHERE method_used IS NOT NULL
GROUP BY method_used
ORDER BY total_saved DESC
LIMIT 5;
SQL
EOF

# Make all scripts executable
chmod +x ~/.claude-knowledge/*.sh

# Create template examples
cat > ~/.claude-knowledge/templates/react-component.tsx <<'EOF'
import { FC } from 'preact/compat'
import { useState } from 'preact/hooks'

interface {{NAME}}Props {
  // Define props here
}

export const {{NAME}}: FC<{{NAME}}Props> = ({}) => {
  const [state, setState] = useState()
  
  return (
    <div className="{{kebab-name}}">
      {{NAME}}
    </div>
  )
}
EOF

cat > ~/.claude-knowledge/templates/python-class.py <<'EOF'
from typing import Optional, List, Dict
from dataclasses import dataclass

@dataclass
class {{NAME}}:
    """{{DESCRIPTION}}"""
    
    def __init__(self):
        pass
    
    def {{method_name}}(self) -> None:
        """{{METHOD_DESCRIPTION}}"""
        pass
EOF

# Create initial efficiency patterns
sqlite3 ~/.claude-knowledge/db/claude-knowledge.db <<EOF
INSERT INTO efficiency_patterns (pattern_name, description, before_tokens, after_tokens, savings_percent, example)
VALUES 
('Use Sub-Agents', 'Delegate specialized tasks to sub-agents', 5000, 2000, 60, 'Launch unit-test-engineer for test generation'),
('Batch Operations', 'Combine multiple similar requests', 3000, 1000, 66, 'Single query for component + tests + styles'),
('Template Usage', 'Use pre-defined templates', 1500, 200, 86, 'Use react-component template'),
('Search vs Read', 'Use grep/glob instead of reading files', 2000, 300, 85, 'grep pattern instead of reading all files');
EOF

# Create quick aliases
cat >> ~/.bashrc <<'EOF'

# Claude Knowledge Base Aliases
alias claude-save-context='~/.claude-knowledge/save-context.sh'
alias claude-get-context='~/.claude-knowledge/get-context.sh'
alias claude-track='~/.claude-knowledge/track-tokens.sh'
alias claude-snippet='~/.claude-knowledge/save-snippet.sh'
alias claude-report='~/.claude-knowledge/token-report.sh'
EOF

echo "✅ Knowledge base system initialized!"
echo ""
echo "📚 Available commands:"
echo "  - claude-save-context <project> <context> [summary]"
echo "  - claude-get-context <project>"
echo "  - claude-track <tokens> <task> [project] [saved]"
echo "  - claude-snippet <language> <description> <file> [project]"
echo "  - claude-report"
echo ""
echo "🚀 Run 'source ~/.bashrc' to activate aliases"
#!/bin/bash

# MCP Server Setup for RatGarden
echo "🔧 Setting up MCP servers for enhanced context..."

# Create MCP servers directory
mkdir -p ~/.config/claude-code/mcp-servers/{project-context,code-snippets,medical-content}

# Project Context MCP Server
cat > ~/.config/claude-code/mcp-servers/project-context/package.json <<'EOF'
{
  "name": "ratgarden-project-context",
  "version": "1.0.0",
  "description": "MCP server for RatGarden project context",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0"
  }
}
EOF

cat > ~/.config/claude-code/mcp-servers/project-context/index.js <<'EOF'
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const server = new Server(
  {
    name: 'ratgarden-project-context',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {
        schemes: ['file'],
      },
    },
  }
);

// Tool: Get project context
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_project_context',
        description: 'Get current RatGarden project context',
        inputSchema: {
          type: 'object',
          properties: {
            context_type: {
              type: 'string',
              enum: ['modes', 'efficiency', 'sub_agents', 'all'],
              default: 'all'
            }
          }
        }
      },
      {
        name: 'save_context',
        description: 'Save current context to knowledge base',
        inputSchema: {
          type: 'object',
          properties: {
            context: { type: 'string' },
            tags: { type: 'string' }
          },
          required: ['context']
        }
      }
    ]
  };
});

// Tool: Get project context implementation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'get_project_context') {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const projectRoot = process.cwd();
      const context = {};
      
      if (args.context_type === 'all' || args.context_type === 'modes') {
        const modesPath = path.join(projectRoot, '.claude', 'claude-modes.md');
        if (fs.existsSync(modesPath)) {
          context.modes = fs.readFileSync(modesPath, 'utf8');
        }
      }
      
      if (args.context_type === 'all' || args.context_type === 'efficiency') {
        const efficiencyPath = path.join(projectRoot, '.claude', 'claude-efficiency-guide.md');
        if (fs.existsSync(efficiencyPath)) {
          context.efficiency = fs.readFileSync(efficiencyPath, 'utf8');
        }
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(context, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error loading context: ${error.message}`
          }
        ]
      };
    }
  }
  
  if (name === 'save_context') {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(process.env.HOME, '.claude-knowledge', 'db', 'claude-knowledge.db');
    
    try {
      const db = new sqlite3.Database(dbPath);
      const stmt = db.prepare('INSERT INTO contexts (project, context, tags) VALUES (?, ?, ?)');
      stmt.run('RatGarden', args.context, args.tags || '');
      stmt.finalize();
      db.close();
      
      return {
        content: [
          {
            type: 'text',
            text: 'Context saved successfully'
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error saving context: ${error.message}`
          }
        ]
      };
    }
  }
});

// Resource: Read project files
server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri.startsWith('file://')) {
    const fs = require('fs');
    const path = require('path');
    const filePath = uri.replace('file://', '');
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: content
            }
          ]
        };
      }
    } catch (error) {
      // File not found or not readable
    }
  }
  
  return { contents: [] };
});

const transport = new StdioServerTransport();
server.connect(transport);
console.error('RatGarden Project Context MCP Server running...');
EOF

# Install dependencies
cd ~/.config/claude-code/mcp-servers/project-context
npm install

echo "✅ MCP servers setup complete!"
echo "MCP servers will provide enhanced context and memory for Claude Code" 
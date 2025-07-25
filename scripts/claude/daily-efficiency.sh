#!/bin/bash

# Daily Efficiency Script for Claude Opus Max Subscription
echo "📊 Daily Efficiency Report"
echo "=========================="

# Run efficiency report
node scripts/token-efficiency-tracker.cjs report

echo ""
echo "🎯 Today's Optimization Goals"
echo "============================="

# Check if we have any recent usage
RECENT_USAGE=$(sqlite3 ~/.claude-knowledge/db/claude-knowledge.db "SELECT COUNT(*) FROM token_usage WHERE date = date('now')")

if [ "$RECENT_USAGE" -gt 0 ]; then
    echo "✅ Token tracking is active"
    echo "📈 Recent usage detected: $RECENT_USAGE sessions today"
else
    echo "⚠️  No token usage tracked today"
    echo "💡 Remember to track your Claude usage:"
    echo "   node scripts/token-efficiency-tracker.cjs track \"task description\" tokens_used tokens_saved method sub_agent"
fi

echo ""
echo "🚀 Efficiency Tips for Today:"
echo "1. Use Claude Code CLI for development tasks"
echo "2. Batch related operations into single queries"
echo "3. Use MCP servers for context loading"
echo "4. Track all usage for optimization insights"
echo "5. Use appropriate models: Haiku (80%), Sonnet (15%), Opus (5%)"

echo ""
echo "📋 Quick Commands:"
echo "  claude --print \"your prompt\"                    # Quick tasks"
echo "  claude --model sonnet \"complex reasoning\"       # Complex tasks"
echo "  claude --model opus \"medical content\"           # Medical/Research"
echo "  node scripts/token-efficiency-tracker.cjs report  # Efficiency report" 
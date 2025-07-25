#!/usr/bin/env python3
"""
Claude Token Usage Monitor
Real-time token tracking and optimization suggestions
"""

import sqlite3
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import json

class TokenMonitor:
    def __init__(self):
        self.db_path = os.path.expanduser("~/.claude-knowledge/db/claude-knowledge.db")
        self.ensure_db_exists()
    
    def ensure_db_exists(self):
        """Ensure database is initialized"""
        if not os.path.exists(self.db_path):
            print("❌ Knowledge base not initialized. Run init-knowledge-base.sh first.")
            sys.exit(1)
    
    def track_usage(self, tokens: int, task: str, project: str = "default", 
                   saved: int = 0, method: str = None):
        """Track token usage"""
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO token_usage (date, time, task_description, tokens_used, 
                                   tokens_saved, project, method_used)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.now().strftime("%Y-%m-%d"),
            datetime.now().strftime("%H:%M:%S"),
            task,
            tokens,
            saved,
            project,
            method
        ))
        
        conn.commit()
        conn.close()
        
        # Provide immediate feedback
        if saved > 0:
            savings_pct = (saved / (tokens + saved)) * 100
            print(f"✅ Tracked: {tokens} tokens used, {saved} saved ({savings_pct:.1f}% efficiency)")
        else:
            print(f"✅ Tracked: {tokens} tokens used")
    
    def get_usage_stats(self, days: int = 7) -> Dict:
        """Get usage statistics for the past N days"""
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        
        # Total usage
        cur.execute("""
            SELECT 
                SUM(tokens_used) as total_used,
                SUM(tokens_saved) as total_saved,
                COUNT(*) as total_tasks
            FROM token_usage
            WHERE date >= date('now', ?)
        """, (f'-{days} days',))
        
        totals = cur.fetchone()
        
        # Daily breakdown
        cur.execute("""
            SELECT 
                date,
                SUM(tokens_used) as daily_used,
                SUM(tokens_saved) as daily_saved,
                COUNT(*) as task_count
            FROM token_usage
            WHERE date >= date('now', ?)
            GROUP BY date
            ORDER BY date DESC
        """, (f'-{days} days',))
        
        daily_stats = cur.fetchall()
        
        # Project breakdown
        cur.execute("""
            SELECT 
                project,
                SUM(tokens_used) as project_used,
                SUM(tokens_saved) as project_saved
            FROM token_usage
            WHERE date >= date('now', ?)
            GROUP BY project
            ORDER BY project_used DESC
        """, (f'-{days} days',))
        
        project_stats = cur.fetchall()
        
        # Most effective methods
        cur.execute("""
            SELECT 
                method_used,
                COUNT(*) as times_used,
                SUM(tokens_saved) as total_saved
            FROM token_usage
            WHERE method_used IS NOT NULL 
            AND date >= date('now', ?)
            GROUP BY method_used
            ORDER BY total_saved DESC
            LIMIT 5
        """, (f'-{days} days',))
        
        methods = cur.fetchall()
        
        conn.close()
        
        return {
            'totals': totals,
            'daily': daily_stats,
            'projects': project_stats,
            'methods': methods
        }
    
    def suggest_optimizations(self) -> List[str]:
        """Suggest optimizations based on usage patterns"""
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        
        suggestions = []
        
        # Check for repetitive tasks
        cur.execute("""
            SELECT task_description, COUNT(*) as count
            FROM token_usage
            WHERE date >= date('now', '-7 days')
            GROUP BY task_description
            HAVING count > 2
            ORDER BY count DESC
            LIMIT 5
        """)
        
        repetitive = cur.fetchall()
        if repetitive:
            suggestions.append(f"🔄 Repetitive tasks detected: Consider creating templates or scripts for: {repetitive[0][0]}")
        
        # Check for high token usage tasks
        cur.execute("""
            SELECT task_description, tokens_used
            FROM token_usage
            WHERE date >= date('now', '-7 days')
            AND tokens_used > 1000
            ORDER BY tokens_used DESC
            LIMIT 5
        """)
        
        high_usage = cur.fetchall()
        if high_usage:
            suggestions.append(f"⚡ High token task: '{high_usage[0][0]}' used {high_usage[0][1]} tokens. Consider using sub-agents.")
        
        # Check efficiency rate
        cur.execute("""
            SELECT 
                CAST(SUM(tokens_saved) AS FLOAT) / (SUM(tokens_used) + SUM(tokens_saved)) * 100 as efficiency
            FROM token_usage
            WHERE date >= date('now', '-7 days')
        """)
        
        efficiency = cur.fetchone()[0] or 0
        if efficiency < 20:
            suggestions.append(f"📈 Current efficiency: {efficiency:.1f}%. Use more templates and sub-agents to improve.")
        
        conn.close()
        return suggestions
    
    def generate_report(self):
        """Generate comprehensive usage report"""
        stats = self.get_usage_stats()
        suggestions = self.suggest_optimizations()
        
        print("\n📊 Claude Token Usage Report")
        print("=" * 50)
        
        # Totals
        if stats['totals'][0]:
            total_used = stats['totals'][0] or 0
            total_saved = stats['totals'][1] or 0
            total_tasks = stats['totals'][2] or 0
            efficiency = (total_saved / (total_used + total_saved) * 100) if (total_used + total_saved) > 0 else 0
            
            print(f"\n📈 Last 7 Days Summary:")
            print(f"  • Total tokens used: {total_used:,}")
            print(f"  • Total tokens saved: {total_saved:,}")
            print(f"  • Total tasks: {total_tasks}")
            print(f"  • Overall efficiency: {efficiency:.1f}%")
        
        # Daily breakdown
        if stats['daily']:
            print(f"\n📅 Daily Usage:")
            for date, used, saved, tasks in stats['daily'][:5]:
                daily_eff = (saved / (used + saved) * 100) if (used + saved) > 0 else 0
                print(f"  {date}: {used:,} tokens, {tasks} tasks, {daily_eff:.1f}% efficiency")
        
        # Project breakdown
        if stats['projects']:
            print(f"\n🗂️  Project Usage:")
            for project, used, saved in stats['projects'][:5]:
                proj_eff = (saved / (used + saved) * 100) if (used + saved) > 0 else 0
                print(f"  {project}: {used:,} tokens, {proj_eff:.1f}% efficiency")
        
        # Effective methods
        if stats['methods']:
            print(f"\n🎯 Most Effective Methods:")
            for method, times, saved in stats['methods']:
                print(f"  {method}: used {times} times, saved {saved:,} tokens")
        
        # Suggestions
        if suggestions:
            print(f"\n💡 Optimization Suggestions:")
            for suggestion in suggestions:
                print(f"  {suggestion}")
        
        print("\n" + "=" * 50)

def main():
    monitor = TokenMonitor()
    
    if len(sys.argv) < 2:
        print("Usage: claude-token-monitor.py <command> [args...]")
        print("\nCommands:")
        print("  track <tokens> <task> [project] [saved] [method]")
        print("  report")
        print("  suggest")
        return
    
    command = sys.argv[1]
    
    if command == "track":
        if len(sys.argv) < 4:
            print("Usage: track <tokens> <task> [project] [saved] [method]")
            return
        
        tokens = int(sys.argv[2])
        task = sys.argv[3]
        project = sys.argv[4] if len(sys.argv) > 4 else "default"
        saved = int(sys.argv[5]) if len(sys.argv) > 5 else 0
        method = sys.argv[6] if len(sys.argv) > 6 else None
        
        monitor.track_usage(tokens, task, project, saved, method)
    
    elif command == "report":
        monitor.generate_report()
    
    elif command == "suggest":
        suggestions = monitor.suggest_optimizations()
        if suggestions:
            print("\n💡 Optimization Suggestions:")
            for suggestion in suggestions:
                print(f"  {suggestion}")
        else:
            print("✅ No immediate optimizations needed!")
    
    else:
        print(f"Unknown command: {command}")

if __name__ == "__main__":
    main()
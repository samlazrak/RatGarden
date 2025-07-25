# Sanitization and Push System

This directory contains scripts for automatically creating a sanitized version of your private RatGarden repository and pushing it to a public showcase repository.

## Overview

The system consists of:

- `sanitize.ts` - Main TypeScript sanitization script
- `sanitize-config.json` - Configuration file for customization
- `.git/hooks/pre-push` - Git hook that runs automatically on push
- `test-sanitization.ts` - Test script to verify system functionality

## How It Works

1. **Automatic Trigger**: When you push to the `main` branch, the pre-push hook automatically runs
2. **Sanitization**: The script creates a clean copy of your repo with sensitive data removed
3. **User Confirmation**: Waits for user input before pushing to public repository
4. **Public Push**: The sanitized version is pushed to your public showcase repository after confirmation

## What Gets Sanitized

### Files Removed

- `api/ai-assistant.js` (contains API keys)
- `private/` directory
- All `.env` files
- Draft posts (files with `draft: true` in frontmatter)
- `node_modules/` (dependencies)
- `public/` (build output)
- `.quartz-cache/` (build cache)
- `.vscode/` (IDE settings - kept in private repo)
- `.claude/` (AI assistant data - kept in private repo)
- `.idea/` (IDE settings - kept in private repo)
- Other build artifacts and temporary files

### Content Sanitized

- API keys and secrets removed from configuration files
- Sensitive patterns stripped from code files
- Test files containing secrets removed

### Enhanced Security

- Comprehensive `.gitignore` for the public repo
- All environment variables and secrets excluded
- Private content and drafts filtered out
- IDE settings and AI assistant data kept private
- API key patterns replaced with sanitized versions (sk-\*\*\*)
- Specific API key examples removed from documentation
- Content files scanned and cleaned for sensitive patterns

## Configuration

Edit `sanitize-config.json` to customize:

- Public repository URL
- Files and patterns to remove
- Directories to scan for drafts
- Git commit configuration

## Manual Usage

If you want to run the sanitization manually:

```bash
# Run the full sanitization and push
npx tsx scripts/sanitize.ts

# Or just test the script without pushing
npx tsx scripts/sanitize.ts --dry-run

# Run comprehensive tests
npx tsx scripts/test-sanitization.ts
```

## Safety Features

- **Non-blocking**: If sanitization fails, your original push still succeeds
- **User confirmation**: Requires explicit user approval before pushing to public repo
- **Temporary files**: All work is done in `/tmp` and cleaned up automatically
- **Force push**: Uses `--force` to ensure the public repo is completely replaced
- **Error handling**: Comprehensive error checking and logging

## Troubleshooting

### Common Issues

1. **SSH Key Issues**: Ensure your SSH key is set up for both repositories
2. **Permission Denied**: Make sure the scripts are executable (`chmod +x`)
3. **Public Repo Not Found**: Create the public repository first on GitHub

### Debug Mode

Add `--debug` to the script for verbose output:

```bash
npx tsx scripts/sanitize.ts --debug
```

## Security Notes

- The script is designed to be thorough but may not catch all edge cases
- Always review the public repository after the first few pushes
- Consider adding additional patterns to `sanitize-config.json` if needed
- The script uses `--force` push, so any manual changes to the public repo will be overwritten

## Customization

### Adding New Patterns

Edit `sanitize-config.json` and add new patterns to `patternsToRemove`:

```json
{
  "patternsToRemove": [
    "api_key",
    "apiKey",
    "API_KEY",
    "secret",
    "password",
    "token",
    "OPENAI_API_KEY",
    "your_new_pattern"
  ]
}
```

### Excluding Additional Files

Add new file patterns to `filesToRemove`:

```json
{
  "filesToRemove": ["api/ai-assistant.js", "private/", ".env*", "*.env", "your_sensitive_file.js"]
}
```

## Git Hook Details

The pre-push hook is located at `.git/hooks/pre-push` and:

- Only runs when pushing to the `main` branch
- Never blocks your original push (exit code 0)
- Provides clear feedback about what's happening
- Handles errors gracefully

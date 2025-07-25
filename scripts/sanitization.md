# Sanitization and Push System

This document details the sanitization system that automatically creates a sanitized version of your private RatGarden repository and pushes it to a public showcase repository.

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

## Repository Structure

### Private Repository

Contains everything:

- All content files and media
- Build outputs and cache
- Development scripts and tests
- IDE settings and AI assistant data

### Public Repository

Contains only what's needed to showcase AI features:

- Quartz 4 static site generator code
- AI components and scripts
- Configuration files (sanitized)
- Documentation for AI features

## Single Commit History

The public repository keeps a single commit history. Each time the sanitization script runs:

- It creates a completely fresh copy
- Removes all sensitive data and private content
- Pushes the sanitized version with `--force` - only used in demo repos.
- This keeps the public repo clean and current without exposing development history for security purposes. This is a demo repo - not how I actually run and manage my repos.

## Advanced Configuration

### Custom File Patterns

You can add custom file patterns to exclude specific types of content:

```json
{
  "filesToExclude": ["*.log", "*.tmp", "temp/", "cache/", "*.key", "*.pem"]
}
```

### Content Sanitization Rules

Define patterns to remove from file contents:

```json
{
  "contentToSanitize": ["sk-[a-zA-Z0-9]{48}", "ghp_[a-zA-Z0-9]{36}", "AIza[a-zA-Z0-9]{35}"]
}
```

### Git Configuration

Customize Git behavior for the sanitized repository:

```json
{
  "gitConfig": {
    "userName": "RatGarden Sanitizer",
    "userEmail": "sanitizer@ratgarden.local"
  },
  "commitMessage": "Sanitized version for public showcase"
}
```

## Monitoring and Logging

### Log Output

The sanitization script provides detailed logging:

- Files being processed
- Items being excluded
- Git operations
- Error messages
- Success confirmations

### Error Handling

The script handles various error conditions:

- Missing files or directories
- Git operation failures
- Permission issues
- Network connectivity problems
- Invalid configuration

### Performance Considerations

- Uses temporary directories for processing
- Cleans up temporary files automatically
- Optimizes file copying operations
- Minimizes Git operations

## Integration with Development Workflow

### Pre-push Hook Integration

The sanitization system integrates seamlessly with your development workflow:

1. **Normal Development**: Work normally in your private repository
2. **Automatic Trigger**: Pushing to main triggers sanitization
3. **User Control**: You decide when to push to public repository
4. **Clean Separation**: Private and public repositories remain separate

### Manual Override

You can bypass the automatic sanitization:

```bash
# Skip sanitization for this push
git push --no-verify

# Or push to a different branch
git push origin feature-branch
```

## Best Practices

### Security

- Regularly review the sanitization patterns
- Test with `--dry-run` before major changes
- Monitor the public repository for any sensitive data
- Keep the sanitization script updated

### Maintenance

- Update patterns as new sensitive data types are added
- Test the system after major repository changes
- Review and update the configuration file regularly
- Monitor for any new security concerns

### Performance

- Use fast mode for routine pushes
- Clear temporary files periodically
- Monitor disk space usage during sanitization
- Optimize file patterns for faster processing

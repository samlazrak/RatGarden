#!/bin/bash

# Gemini CLI Automation Scripts
# Usage: ./gemini-automation.sh [command] [file]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[GEMINI]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if gemini CLI is available
check_gemini() {
    if ! command -v gemini &> /dev/null; then
        print_error "Gemini CLI not found. Install with: npm install -g @google/gemini-cli"
        exit 1
    fi
}

# Function to check if file exists
check_file() {
    if [ ! -f "$1" ]; then
        print_error "File not found: $1"
        exit 1
    fi
}

# Code review function
review_code() {
    local file="$1"
    check_file "$file"
    print_status "Reviewing code: $file"
    
    gemini -p "review this code for best practices, security issues, performance optimizations, and potential bugs" < "$file"
}

# Generate tests function
generate_tests() {
    local file="$1"
    local test_file="${file%.*}.test.ts"
    check_file "$file"
    print_status "Generating tests for: $file"
    
    gemini -p "generate comprehensive Vitest unit tests with good coverage, mocking, and edge cases" < "$file" > "$test_file"
    print_success "Tests generated: $test_file"
}

# Generate documentation function
generate_docs() {
    local file="$1"
    local doc_file="${file%.*}.doc.md"
    check_file "$file"
    print_status "Generating documentation for: $file"
    
    gemini -p "generate comprehensive JSDoc documentation with examples, usage patterns, and API reference" < "$file" > "$doc_file"
    print_success "Documentation generated: $doc_file"
}

# Security audit function
security_audit() {
    local file="$1"
    check_file "$file"
    print_status "Performing security audit: $file"
    
    gemini -p "security audit: check for vulnerabilities, XSS, CSRF, injection attacks, and security best practices" < "$file"
}

# Performance analysis function
performance_analysis() {
    local file="$1"
    check_file "$file"
    print_status "Analyzing performance: $file"
    
    gemini -p "analyze for performance bottlenecks, memory leaks, optimization opportunities, and best practices" < "$file"
}

# Accessibility audit function
accessibility_audit() {
    local file="$1"
    check_file "$file"
    print_status "Auditing accessibility: $file"
    
    gemini -p "audit for accessibility issues: ARIA attributes, keyboard navigation, screen reader support, and WCAG compliance" < "$file"
}

# Refactor suggestions function
refactor_suggestions() {
    local file="$1"
    check_file "$file"
    print_status "Generating refactor suggestions: $file"
    
    gemini -p "suggest refactoring improvements for code quality, maintainability, and performance" < "$file"
}

# Pre-commit review function
pre_commit_review() {
    print_status "Running pre-commit review..."
    
    if [ -n "$(git diff --cached --name-only)" ]; then
        git diff --cached | gemini -p "review these staged changes for code quality, security, and best practices"
    else
        print_warning "No staged changes to review"
    fi
}

# Build error analysis function
analyze_build_errors() {
    print_status "Analyzing build errors..."
    
    # Capture build output
    local build_output=$(npm run build 2>&1 || true)
    echo "$build_output" | gemini -p "analyze these build errors and suggest specific fixes"
}

# Dependency analysis function
analyze_dependencies() {
    print_status "Analyzing dependencies..."
    
    cat package.json | gemini -p "analyze dependencies for security vulnerabilities, performance impact, maintenance status, and compatibility"
}

# Architecture review function
architecture_review() {
    print_status "Performing architecture review..."
    
    # Get list of main files
    local files=$(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | head -10)
    echo "$files" | xargs gemini -p "analyze the overall architecture of this codebase and suggest improvements"
}

# Batch operations
batch_review() {
    local pattern="$1"
    print_status "Batch reviewing files matching: $pattern"
    
    find . -name "$pattern" | while read -r file; do
        if [ -f "$file" ]; then
            print_status "Reviewing: $file"
            gemini -p "quick review for major issues" < "$file"
            echo "---"
        fi
    done
}

batch_test_generation() {
    local pattern="$1"
    print_status "Batch generating tests for files matching: $pattern"
    
    find . -name "$pattern" | while read -r file; do
        if [ -f "$file" ]; then
            generate_tests "$file"
        fi
    done
}

# Interactive mode
interactive_mode() {
    print_status "Starting interactive Gemini session..."
    gemini
}

# Help function
show_help() {
    echo "Gemini CLI Automation Script"
    echo ""
    echo "Usage: $0 [command] [file]"
    echo ""
    echo "Commands:"
    echo "  review <file>           - Review code for best practices and issues"
    echo "  test <file>             - Generate comprehensive tests"
    echo "  doc <file>              - Generate documentation"
    echo "  security <file>         - Perform security audit"
    echo "  perf <file>             - Analyze performance"
    echo "  a11y <file>             - Audit accessibility"
    echo "  refactor <file>         - Suggest refactoring improvements"
    echo "  pre-commit              - Review staged changes"
    echo "  build-errors            - Analyze build errors"
    echo "  deps                    - Analyze dependencies"
    echo "  architecture            - Review overall architecture"
    echo "  batch-review <pattern>  - Review multiple files (e.g., '*.tsx')"
    echo "  batch-test <pattern>    - Generate tests for multiple files"
    echo "  interactive             - Start interactive Gemini session"
    echo "  help                    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 review quartz/components/Search.tsx"
    echo "  $0 test quartz/components/AISearch.tsx"
    echo "  $0 batch-review '*.tsx'"
    echo "  $0 pre-commit"
}

# Main script logic
main() {
    check_gemini
    
    case "${1:-help}" in
        "review")
            review_code "$2"
            ;;
        "test")
            generate_tests "$2"
            ;;
        "doc")
            generate_docs "$2"
            ;;
        "security")
            security_audit "$2"
            ;;
        "perf")
            performance_analysis "$2"
            ;;
        "a11y")
            accessibility_audit "$2"
            ;;
        "refactor")
            refactor_suggestions "$2"
            ;;
        "pre-commit")
            pre_commit_review
            ;;
        "build-errors")
            analyze_build_errors
            ;;
        "deps")
            analyze_dependencies
            ;;
        "architecture")
            architecture_review
            ;;
        "batch-review")
            batch_review "$2"
            ;;
        "batch-test")
            batch_test_generation "$2"
            ;;
        "interactive")
            interactive_mode
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@" 
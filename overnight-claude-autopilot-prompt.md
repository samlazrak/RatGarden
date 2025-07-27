# Overnight Claude Autopilot Prompt for RatGarden Digital Garden

## Project Context
You are working on "The Rat's Garden" - a sophisticated Quartz 4 digital garden with AI-powered features, built with TypeScript, Preact, and SCSS. This is a private repository that gets sanitized for public deployment. The project demonstrates advanced AI/ML capabilities for healthcare applications.

## Primary Objectives

### 1. **Restore Draft/Private Hiding Mechanics**
- **Current Issue**: The draft/private content filtering system needs to be fully restored and tested
- **Files to Fix**: 
  - `quartz/plugins/filters/draft.ts` - Ensure proper filtering of `draft: true` content
  - `quartz/plugins/filters/explicit.ts` - Verify `publish: true` logic works correctly
  - `quartz.config.ts` - Check ignore patterns for drafts and private content
  - `scripts/dev/dev-with-drafts.ts` - Ensure development workflow includes private content properly
- **Environment Variables**: Verify `QUARTZ_INCLUDE_PRIVATE=true` works correctly
- **Testing**: Create comprehensive tests for draft/private filtering

### 2. **Comprehensive Code Testing Implementation**
- **Current State**: Project has Vitest setup but needs comprehensive test coverage
- **Priority Areas**:
  - AI Components: `AISearch.tsx`, `AIRecommendations.tsx`, `AIWritingAssistant.tsx`, `InteractiveAIDemo.tsx`
  - Core Components: `SemanticLinks.tsx`, `PrivacyAnalytics.tsx`, `CanvasViewer.tsx`
  - Utility Functions: Graph link generation, sanitization scripts
  - Plugin System: Draft filters, explicit publish filters
- **Testing Standards**:
  - Use Vitest with happy-dom for component testing
  - Achieve 80%+ test coverage
  - Test happy paths, edge cases, and error conditions
  - Mock external dependencies (TensorFlow.js, API calls)
  - Test TypeScript types and interfaces

### 3. **Documentation Creation**
Create comprehensive documentation for:

#### A. Claude Setup Documentation
- **File**: `content/blog/claude-setup-guide.md`
- **Content**:
  - Claude Code installation and configuration
  - Workspace setup for RatGarden project
  - Custom prompts and context management
  - Integration with VS Code/Cursor
  - Best practices for AI-assisted development
  - Troubleshooting common issues

#### B. Cursor Setup Documentation  
- **File**: `content/blog/cursor-ide-setup.md`
- **Content**:
  - Cursor IDE installation and configuration
  - AI features and capabilities
  - Custom settings for TypeScript/Preact development
  - Integration with Claude Code
  - Productivity tips and workflows
  - Extension recommendations

#### C. AI Coding Interest Posts
- **File**: `content/blog/ai-assisted-development-practices.md`
- **Content**:
  - Best practices for AI-assisted coding
  - Prompt engineering for software development
  - AI tools comparison (Claude, GitHub Copilot, Cursor)
  - Ethical considerations in AI-assisted development
  - Future of AI in software engineering

#### D. Job Application Post
- **File**: `content/blog/software-engineer-ai-healthcare.md`
- **Content**:
  - Experience with AI in healthcare applications
  - How AI would enhance the GlobalVetLink platform
  - Specific use cases for AI in veterinary software
  - Technical skills relevant to the SE3 position
  - Portfolio project showcasing AI capabilities

### 4. **Portfolio Project for GlobalVetLink Position**
Create a showcase project that demonstrates skills relevant to the Software Engineer 3 position:

#### A. **VetLink AI Assistant** - A Conceptual AI-Powered Veterinary Platform
- **File**: `content/projects/vetlink-ai-assistant.md`
- **Technical Stack**: Java (Spring Boot), React, PostgreSQL, AI/ML integration
- **Features**:
  - AI-powered clinical documentation assistant
  - Automated ICD-10 coding for veterinary procedures
  - Computer vision for medical image analysis
  - Natural language processing for patient records
  - Privacy-preserving AI architecture
- **Demonstrates**:
  - Full-stack development (Java, React, PostgreSQL)
  - AI/ML integration in healthcare software
  - Scalable architecture design
  - Privacy and security considerations
  - Agile development practices

## Technical Requirements

### Code Quality Standards
- **TypeScript**: All new code must be TypeScript with strict type checking
- **Preact**: Use Preact instead of React for all components
- **SCSS**: Follow existing styling patterns with CSS custom properties
- **Testing**: Write tests first (TDD approach)
- **Documentation**: Comprehensive JSDoc comments and README updates

### File Organization
- **Components**: `quartz/components/` with styles in `quartz/components/styles/`
- **Tests**: `tests/` directory or alongside components with `__tests__` folders
- **Content**: `content/blog/` for new blog posts
- **Projects**: `content/projects/` for portfolio projects
- **Documentation**: Update `README.md` and `CLAUDE.md` as needed

### Testing Framework
- **Framework**: Vitest with happy-dom
- **Coverage**: Aim for 80%+ test coverage
- **Mocking**: Mock TensorFlow.js, API calls, and external dependencies
- **Component Testing**: Use @testing-library/preact for component tests

## Specific Tasks Breakdown

### Phase 1: Core Infrastructure (Priority 1)
1. **Fix Draft/Private Filtering**
   - Review and fix `quartz/plugins/filters/draft.ts`
   - Test with `npm run dev-with-drafts`
   - Verify environment variable handling
   - Create tests for filtering logic

2. **Implement Comprehensive Testing**
   - Set up test infrastructure for AI components
   - Create mock providers for TensorFlow.js
   - Write tests for core utility functions
   - Implement test coverage reporting

### Phase 2: Documentation (Priority 2)
1. **Create Claude Setup Guide**
   - Step-by-step installation instructions
   - Workspace configuration
   - Best practices and tips

2. **Create Cursor Setup Guide**
   - IDE configuration
   - AI features setup
   - Productivity workflows

3. **Create AI Coding Practices Post**
   - Best practices for AI-assisted development
   - Tool comparisons and recommendations

### Phase 3: Job Application Content (Priority 3)
1. **Create Job Experience Post**
   - Relate experience to GlobalVetLink position
   - Demonstrate AI expertise in healthcare context
   - Show technical skills alignment

2. **Create VetLink AI Assistant Project**
   - Conceptual AI-powered veterinary platform
   - Demonstrate full-stack skills
   - Show healthcare AI expertise

### Phase 4: Content Creation (Priority 4)
1. **Create AI Interest Posts**
   - AI in software development
   - Future of AI-assisted coding
   - Ethical considerations

2. **Update Portfolio Content**
   - Ensure all new content is properly linked
   - Update navigation and metadata
   - Test all AI features work with new content

## Success Criteria

### Technical Success
- [ ] Draft/private filtering works correctly in all environments
- [ ] Test coverage reaches 80%+ for AI components
- [ ] All new code passes TypeScript strict checking
- [ ] All tests pass consistently
- [ ] Build process works without errors

### Content Success
- [ ] All documentation is comprehensive and accurate
- [ ] Blog posts are well-written and informative
- [ ] Portfolio project demonstrates relevant skills
- [ ] Content is properly linked and discoverable
- [ ] AI features work correctly with new content

### Quality Success
- [ ] Code follows existing patterns and conventions
- [ ] Documentation is clear and actionable
- [ ] Tests are comprehensive and meaningful
- [ ] Content is professional and engaging
- [ ] All features work in both development and production

## Notes for Claude Autopilot

### Repository Context
- **Private Repository**: Contains all content, build artifacts, and development files
- **Public Repository**: Source code only - no content, no build artifacts, no private files
- **Sanitization**: Automatic sanitization system removes sensitive content before public pushes
- **Git Operations**: NEVER make git commits automatically - only suggest commits to the user

### Development Workflow
- **Commands**: Use `npm run dev` for development, `npm run test` for testing
- **Type Checking**: Use `npm run check` for TypeScript and formatting
- **Build**: Use `npm run build` for production builds
- **Drafts**: Use `npm run dev-with-drafts` to include draft content

### AI Features Context
- **TensorFlow.js**: Used for semantic search and recommendations
- **Privacy-First**: All AI features run client-side when possible
- **Mock Providers**: Available for development without API costs
- **Performance**: Optimized for fast loading and low memory usage

### Error Handling
- **Maximum 3 attempts** to fix linter errors on the same file
- If errors persist, stop and ask for guidance
- Focus on clear, obvious fixes rather than complex type system changes
- Provide summary of remaining issues when hitting limits

## Expected Outcomes

By the end of this overnight session, you should have:

1. **Fully functional draft/private content filtering**
2. **Comprehensive test suite with 80%+ coverage**
3. **Complete documentation for Claude and Cursor setup**
4. **Professional blog posts about AI coding practices**
5. **Job application content showcasing relevant skills**
6. **Portfolio project demonstrating full-stack AI capabilities**
7. **All content properly integrated and tested**

This will significantly enhance the RatGarden digital garden as both a technical showcase and a professional portfolio, while demonstrating the capabilities of AI-assisted development workflows. 
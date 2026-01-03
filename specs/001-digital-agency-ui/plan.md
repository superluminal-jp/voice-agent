# Implementation Plan: Digital Agency Design System UI Update

**Branch**: `001-digital-agency-ui` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-digital-agency-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Update the voice agent application UI to comply with the Digital Agency Design System v2.10.0 by extracting design tokens from Figma via MCP server and applying them to all UI components. The update includes color palette, typography, spacing, component styles, and responsive design patterns while maintaining existing functionality and accessibility standards.

## Technical Context

**Language/Version**: TypeScript 5  
**Primary Dependencies**: Next.js 15.5.6, React 19.1.0, Tailwind CSS v4, shadcn/ui (Radix UI), @openai/agents 0.1.10  
**Storage**: Browser localStorage (session management), no backend storage required  
**Testing**: Visual regression testing, accessibility audits (WCAG AA compliance), manual testing  
**Target Platform**: Modern web browsers (Chrome 90+, Edge 90+, Firefox 88+, Safari 14+)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: No performance degradation; maintain <200ms UI response times, preserve existing voice agent latency (<200ms typical)  
**Constraints**: Must maintain WCAG AA contrast ratios (4.5:1 normal text, 3:1 large text), preserve all existing functionality, support both light and dark themes  
**Scale/Scope**: Single-page application with ~15 UI components, responsive across mobile (320px+), tablet (768px+), desktop (1024px+)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Code Quality Standards
- ✅ TypeScript strict mode enabled
- ✅ ESLint and Prettier configuration (assumed standard Next.js setup)
- ✅ Error handling and logging in place
- ✅ Accessibility features (ARIA labels, keyboard navigation) preserved

### Architecture Compliance
- ✅ Component-based architecture (React functional components)
- ✅ Separation of concerns (components, hooks, lib utilities)
- ✅ Type safety (TypeScript throughout)
- ✅ No breaking changes to existing functionality

### Security & Compliance
- ✅ WCAG AA accessibility standards maintained
- ✅ No sensitive data exposure in design system updates
- ✅ Client-side only changes (no API modifications)

**Gate Status**: ✅ PASS - All checks pass. No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-digital-agency-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── figma-design-tokens.md # Extracted design tokens from Figma
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── components/
│   │   ├── VoiceAgent.tsx                    # Main voice agent component
│   │   └── voice-agent/
│   │       ├── AudioLevelIndicator.tsx       # Audio level visualization
│   │       ├── ConnectionStatus.tsx          # Connection status and controls
│   │       ├── ConversationHistory.tsx       # Conversation transcript display
│   │       ├── ErrorAlert.tsx                # Error message display
│   │       ├── PreConnectionOnboarding.tsx   # Pre-connection onboarding UI
│   │       ├── RagFolderSelector.tsx         # RAG folder selector
│   │       ├── SessionHistoryList.tsx        # Session history list
│   │       ├── SystemPromptTemplateSelector.tsx # System prompt template selector
│   │       ├── TextInput.tsx                 # Text input component
│   │       └── ToolsConfigDialog.tsx          # Tools configuration dialog
│   ├── globals.css                           # Global styles (CSS variables, Tailwind config)
│   ├── layout.tsx                            # App layout and metadata
│   └── page.tsx                              # Home page
├── components/
│   ├── ui/                                   # shadcn/ui components
│   │   ├── alert.tsx                         # Alert component
│   │   ├── badge.tsx                         # Badge component
│   │   ├── button.tsx                        # Button component
│   │   ├── card.tsx                          # Card component
│   │   ├── checkbox.tsx                      # Checkbox component
│   │   ├── dialog.tsx                        # Dialog component
│   │   ├── progress.tsx                      # Progress component
│   │   ├── scroll-area.tsx                   # ScrollArea component
│   │   ├── select.tsx                        # Select component
│   │   └── textarea.tsx                      # Textarea component
│   ├── theme-provider.tsx                    # Theme provider for dark mode
│   ├── theme-toggle.tsx                     # Theme toggle component
│   ├── language-toggle.tsx                   # Language toggle component
│   └── i18n-provider.tsx                     # i18n provider
├── hooks/
│   ├── useAudioDevices.ts                   # Audio device enumeration
│   ├── useAudioLevel.ts                     # Audio level monitoring
│   ├── usePTT.ts                            # Push-to-Talk keyboard handling
│   └── useSystemAudio.ts                    # System audio capture management
├── lib/
│   ├── audio-utils.ts                       # Audio processing utilities
│   ├── i18n.ts                              # Internationalization setup
│   ├── rag.ts                               # RAG utilities
│   ├── realtime-api.ts                      # OpenAI Realtime API integration
│   ├── session-storage.ts                   # Session storage utilities
│   ├── system-prompt-templates.ts           # System prompt templates
│   ├── tools.ts                             # Tools configuration
│   ├── utils.ts                             # General utilities
│   └── vad-config.ts                        # VAD configuration
└── types/
    ├── realtime-session.ts                  # Realtime session types
    └── voice-agent.ts                       # Voice agent types
```

**Structure Decision**: Single Next.js web application with App Router. All UI components are in `src/app/components/` and `src/components/ui/`. Design system updates will primarily affect:
- `src/app/globals.css` - CSS variables and Tailwind configuration
- `src/components/ui/*.tsx` - shadcn/ui component styling
- Component-specific styling in `src/app/components/voice-agent/*.tsx`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. Design system update is a styling-only change that does not require architectural modifications.

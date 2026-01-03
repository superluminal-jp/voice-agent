# Tasks: Digital Agency Design System UI Update

**Input**: Design documents from `/specs/001-digital-agency-ui/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests are OPTIONAL for this feature. Visual regression testing and accessibility audits will be performed manually.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web application**: `src/app/`, `src/components/` at repository root
- Paths shown below follow Next.js App Router structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verification of existing structure

- [x] T001 Verify project structure matches implementation plan in `specs/001-digital-agency-ui/plan.md`
- [x] T002 [P] Verify Figma MCP server is configured and accessible
- [x] T003 [P] Verify Digital Agency Design System Figma file (v2.10.0) is accessible at provided URL

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Connect to Figma MCP server and verify access to Digital Agency Design System file
- [x] T005 Extract design token structure from Figma file metadata (colors, typography, spacing, shadows)
- [x] T006 [P] Review existing CSS variable structure in `src/app/globals.css`
- [x] T007 [P] Review existing Tailwind CSS v4 configuration in `src/app/globals.css`
- [x] T008 [P] Review existing shadcn/ui component structure in `src/components/ui/`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Access Design System from Figma (Priority: P1) 🎯 MVP

**Goal**: Extract design tokens (colors, typography, spacing, component specifications) from Digital Agency Design System Figma file via MCP server

**Independent Test**: Connect to Figma MCP server and successfully retrieve design tokens (colors, typography, spacing) and component specifications from the provided Figma file URL. Test passes when design system data is accessible and parseable.

### Implementation for User Story 1

- [x] T009 [US1] Use Figma MCP server `get_metadata` tool to inspect Digital Agency Design System file structure
- [x] T010 [US1] Use Figma MCP server `get_design_context` tool to extract color palette from Figma file (all 10 hues with 13 shades each)
- [x] T011 [US1] Use Figma MCP server `get_design_context` tool to extract typography scales (Display, Standard, Dense, Oneline, Mono) from Figma file
- [x] T012 [US1] Use Figma MCP server `get_design_context` tool to extract spacing and layout specifications from Figma file
- [x] T013 [US1] Use Figma MCP server `get_design_context` tool to extract component specifications (Button, Card, Dialog, Input, Select, Alert, Badge) including states from Figma file
- [x] T014 [US1] Use Figma MCP server `get_variable_defs` tool to extract design system variables if available
- [x] T015 [US1] Document extracted design tokens in `specs/001-digital-agency-ui/figma-design-tokens.md` with hex values, typography scales, spacing values, and component specifications
- [x] T016 [US1] Validate extracted design tokens are complete and parseable (colors have hex values, typography has sizes/weights/line heights, spacing has pixel values)

**Checkpoint**: At this point, User Story 1 should be fully functional - design tokens extracted and documented. This enables all subsequent user stories.

---

## Phase 4: User Story 2 - Apply Design System Colors and Typography (Priority: P1)

**Goal**: Update CSS variables and Tailwind configuration to use Digital Agency Design System color palette and typography, ensuring all UI components display with the new color scheme and font styles

**Independent Test**: Update CSS variables and Tailwind configuration with design system colors and typography, then verify that all UI components display with the new color scheme and font styles. Test passes when visual inspection confirms color and typography match the design system specifications.

### Implementation for User Story 2

- [x] T017 [US2] Update `:root` color variables in `src/app/globals.css` with design system light theme colors (map `--primary` to Blue-600 `#3460FB`, `--background` to Neutral-50, `--foreground` to Neutral-900, semantic colors, neutral colors)
- [x] T018 [US2] Update `.dark` color variables in `src/app/globals.css` with design system dark theme colors (map `--primary` to Blue-500 `#4979F5`, `--background` to Neutral-900, `--foreground` to Neutral-50, semantic colors, neutral colors)
- [x] T019 [US2] Add typography CSS variables to `src/app/globals.css` for Display scale (64px, 57px, 48px with 140% line height)
- [x] T020 [US2] Add typography CSS variables to `src/app/globals.css` for Standard scale (45px-16px with appropriate line heights)
- [x] T021 [US2] Add typography CSS variables to `src/app/globals.css` for Dense scale (17px-14px with 120-130% line heights)
- [x] T022 [US2] Add typography CSS variables to `src/app/globals.css` for Oneline scale (17px-14px with 100% line height)
- [x] T023 [US2] Add typography CSS variables to `src/app/globals.css` for Mono scale (17px-14px with 150% line height)
- [x] T024 [US2] Add font weight variables to `src/app/globals.css` (Normal: 400, Bold: 700)
- [x] T025 [US2] Update Tailwind `@theme` directive in `src/app/globals.css` to map design system colors to Tailwind utilities (`bg-primary`, `text-primary`, etc.)
- [x] T026 [US2] Verify Tailwind utilities use design system colors by testing `bg-primary`, `text-foreground`, and semantic color utilities
- [x] T027 [US2] Add shadow CSS variables to `src/app/globals.css` for all 8 shadow styles from design system
- [x] T028 [US2] Test that all CSS variables compile without errors and are accessible in components

**Checkpoint**: At this point, User Story 2 should be complete - CSS variables and Tailwind configuration updated with design system colors and typography. All components should display with new color scheme and font styles.

---

## Phase 5: User Story 3 - Update UI Components to Match Design System (Priority: P2)

**Goal**: Update all UI components (Button, Card, Dialog, Input, Select, Textarea, Alert, Badge, Progress, ScrollArea, Checkbox) to match Digital Agency Design System component specifications

**Independent Test**: Update individual shadcn/ui components to match design system specifications, then verify each component's appearance, spacing, borders, shadows, and interactive states match the design system. Test passes when all components visually match the Figma specifications.

### Implementation for User Story 3

#### Button Component

- [x] T029 [P] [US3] Update Button primary variant styles in `src/components/ui/button.tsx` (Blue-600 background, white text, 12px vertical/24px horizontal padding, 4px border radius)
- [x] T030 [P] [US3] Update Button secondary variant styles in `src/components/ui/button.tsx` (Neutral-200 background, Neutral-900 text)
- [x] T031 [P] [US3] Update Button destructive variant styles in `src/components/ui/button.tsx` (Red-800 background, white text)
- [x] T032 [P] [US3] Update Button outline variant styles in `src/components/ui/button.tsx` (transparent background, Blue-600 border and text)
- [x] T033 [P] [US3] Update Button ghost variant styles in `src/components/ui/button.tsx` (transparent background, Neutral-900 text)
- [x] T034 [US3] Update Button state styles in `src/components/ui/button.tsx` (hover, focus with 2px solid Blue-600 outline, active, disabled with 50% opacity)
- [x] T035 [US3] Update Button typography in `src/components/ui/button.tsx` to use Standard-N16-170

#### Card Component

- [x] T036 [P] [US3] Update Card colors in `src/components/ui/card.tsx` (Neutral-50 background light/Neutral-900 dark, Neutral-200 border light/Neutral-800 dark, Neutral-900 text light/Neutral-50 dark)
- [x] T037 [P] [US3] Update Card spacing in `src/components/ui/card.tsx` (24px padding, 16px margin)
- [x] T038 [P] [US3] Update Card border radius in `src/components/ui/card.tsx` (8px)
- [x] T039 [P] [US3] Update Card shadow in `src/components/ui/card.tsx` (Style 1 elevation)
- [x] T040 [US3] Update Card border in `src/components/ui/card.tsx` (1px solid)

#### Dialog Component

- [x] T041 [P] [US3] Update Dialog overlay styles in `src/components/ui/dialog.tsx` (black with 50% opacity)
- [x] T042 [P] [US3] Update Dialog content area styles in `src/components/ui/dialog.tsx` (Neutral-50 background light/Neutral-900 dark, 8px border radius, 24px padding, 600px max width)
- [x] T043 [P] [US3] Update Dialog header typography in `src/components/ui/dialog.tsx` (Standard-B24-150, 16px margin bottom)
- [x] T044 [P] [US3] Update Dialog footer spacing in `src/components/ui/dialog.tsx` (24px margin top, 16px padding top, border top)
- [x] T045 [US3] Update Dialog shadow in `src/components/ui/dialog.tsx` (Style 3 elevation)

#### Form Components (Input, Select, Textarea)

- [x] T046 [P] [US3] Update Input colors in `src/components/ui/input.tsx` (White background light/Neutral-800 dark, Neutral-300 border light/Neutral-700 dark, Neutral-900 text light/Neutral-50 dark, Neutral-500 placeholder)
- [x] T047 [P] [US3] Update Input spacing in `src/components/ui/input.tsx` (12px vertical, 16px horizontal padding)
- [x] T048 [P] [US3] Update Input border radius in `src/components/ui/input.tsx` (4px)
- [x] T049 [P] [US3] Update Input focus indicator in `src/components/ui/input.tsx` (2px solid Blue-600 outline)
- [x] T050 [P] [US3] Update Input error state in `src/components/ui/input.tsx` (Red-800 border, Red-50 background light/Red-900 dark)
- [x] T051 [P] [US3] Update Select colors in `src/components/ui/select.tsx` (same as Input)
- [x] T052 [P] [US3] Update Select spacing and border radius in `src/components/ui/select.tsx` (same as Input)
- [x] T053 [P] [US3] Update Select focus indicator in `src/components/ui/select.tsx` (2px solid Blue-600 outline)
- [x] T054 [P] [US3] Update Select dropdown styles in `src/components/ui/select.tsx` (White background light/Neutral-900 dark, Style 2 elevation shadow, 4px border radius)
- [x] T055 [P] [US3] Update Textarea colors in `src/components/ui/textarea.tsx` (same as Input)
- [x] T056 [P] [US3] Update Textarea spacing and border radius in `src/components/ui/textarea.tsx` (12px padding, 4px border radius, 80px min height)
- [x] T057 [US3] Update Textarea resize behavior in `src/components/ui/textarea.tsx` (vertical only)
- [x] T058 [US3] Update all form component typography to use Standard-N16-170

#### Alert Component

- [x] T059 [P] [US3] Update Alert success variant colors in `src/components/ui/alert.tsx` (Green-50 background light/Green-900 dark, Green-800 text)
- [x] T060 [P] [US3] Update Alert error variant colors in `src/components/ui/alert.tsx` (Red-50 background light/Red-900 dark, Red-800 text)
- [x] T061 [P] [US3] Update Alert warning variant colors in `src/components/ui/alert.tsx` (Yellow-50 background light/Yellow-900 dark, Yellow-700 text)
- [x] T062 [P] [US3] Update Alert info variant colors in `src/components/ui/alert.tsx` (Blue-50 background light/Blue-900 dark, Blue-600 text)
- [x] T063 [P] [US3] Update Alert default variant colors in `src/components/ui/alert.tsx` (Neutral-50 background light/Neutral-900 dark, Neutral-900 text)
- [x] T064 [US3] Update Alert spacing and styling in `src/components/ui/alert.tsx` (16px padding, 16px margin bottom, 4px border radius, 1px solid border with 20% opacity, 20px icon size)

#### Badge Component

- [x] T065 [P] [US3] Update Badge primary variant colors in `src/components/ui/badge.tsx` (Blue-600 background, white text)
- [x] T066 [P] [US3] Update Badge secondary variant colors in `src/components/ui/badge.tsx` (Neutral-200 background, Neutral-900 text)
- [x] T067 [P] [US3] Update Badge success variant colors in `src/components/ui/badge.tsx` (Green-600 background, white text)
- [x] T068 [P] [US3] Update Badge error variant colors in `src/components/ui/badge.tsx` (Red-800 background, white text)
- [x] T069 [P] [US3] Update Badge warning variant colors in `src/components/ui/badge.tsx` (Yellow-700 background, white text)
- [x] T070 [US3] Update Badge typography and spacing in `src/components/ui/badge.tsx` (Dense-N14-120, 4px vertical/8px horizontal padding, 4px border radius)

#### Remaining Components

- [x] T071 [P] [US3] Update Progress component colors in `src/components/ui/progress.tsx` (Neutral-200 background light/Neutral-800 dark, Blue-600 foreground)
- [x] T072 [P] [US3] Update Progress component sizing in `src/components/ui/progress.tsx` (8px height, 4px border radius)
- [x] T073 [P] [US3] Update ScrollArea component colors in `src/components/ui/scroll-area.tsx` (Neutral-100 track light/Neutral-800 dark, Neutral-400 thumb light/Neutral-600 dark, Neutral-500 thumb hover)
- [x] T074 [P] [US3] Update ScrollArea component sizing in `src/components/ui/scroll-area.tsx` (8px width, 4px border radius)
- [x] T075 [P] [US3] Update Checkbox component colors in `src/components/ui/checkbox.tsx` (White background light/Neutral-800 dark, Neutral-300 border light/Neutral-700 dark, Blue-600 checked background, white checkmark)
- [x] T076 [US3] Update Checkbox component focus indicator in `src/components/ui/checkbox.tsx` (2px solid Blue-600 outline, 16px × 16px size)

#### Voice Agent Components

- [x] T077 [US3] Update AudioLevelIndicator component styling in `src/app/components/voice-agent/AudioLevelIndicator.tsx` to use design system colors and spacing
- [x] T078 [US3] Update ConnectionStatus component styling in `src/app/components/voice-agent/ConnectionStatus.tsx` to use design system colors and typography
- [x] T079 [US3] Update ConversationHistory component styling in `src/app/components/voice-agent/ConversationHistory.tsx` to use design system colors and typography
- [x] T080 [US3] Update ErrorAlert component styling in `src/app/components/voice-agent/ErrorAlert.tsx` to use design system alert styles
- [x] T081 [US3] Update PreConnectionOnboarding component styling in `src/app/components/voice-agent/PreConnectionOnboarding.tsx` to use design system colors and spacing
- [x] T082 [US3] Update RagFolderSelector component styling in `src/app/components/voice-agent/RagFolderSelector.tsx` to use design system form styles
- [x] T083 [US3] Update SessionHistoryList component styling in `src/app/components/voice-agent/SessionHistoryList.tsx` to use design system colors and spacing
- [x] T084 [US3] Update SystemPromptTemplateSelector component styling in `src/app/components/voice-agent/SystemPromptTemplateSelector.tsx` to use design system form styles
- [x] T085 [US3] Update TextInput component styling in `src/app/components/voice-agent/TextInput.tsx` to use design system form styles
- [x] T086 [US3] Update ToolsConfigDialog component styling in `src/app/components/voice-agent/ToolsConfigDialog.tsx` to use design system dialog styles
- [x] T087 [US3] Update VoiceAgent main component styling in `src/app/components/VoiceAgent.tsx` to use design system colors and spacing

**Checkpoint**: At this point, User Story 3 should be complete - all UI components updated to match design system specifications. Visual inspection should confirm components match Figma specifications.

---

## Phase 6: User Story 4 - Maintain Accessibility and Functionality (Priority: P2)

**Goal**: Ensure all updated UI components maintain or improve accessibility standards (WCAG AA compliance, keyboard navigation, screen reader support) and preserve all existing functionality

**Independent Test**: Run accessibility audits (automated and manual) before and after design system updates, verifying that color contrast ratios, keyboard navigation, ARIA labels, and screen reader compatibility are maintained or improved. Test passes when accessibility scores remain the same or improve, and all existing functionality works correctly.

### Implementation for User Story 4

#### Accessibility Testing

- [x] T088 [US4] Run automated accessibility audit using browser DevTools or axe DevTools extension
- [x] T089 [US4] Test keyboard navigation (Tab through all interactive elements, verify focus indicators visible, test Enter/Space activation)
- [x] T090 [US4] Test screen reader compatibility (use NVDA, JAWS, or VoiceOver, verify components announced correctly, verify state changes announced)
- [x] T091 [US4] Verify all text-background color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text) in light theme
- [x] T092 [US4] Verify all text-background color combinations meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text) in dark theme
- [x] T093 [US4] Fix any accessibility issues found during testing

#### Functionality Testing

- [x] T094 [US4] Test voice agent connection functionality (connect to OpenAI Realtime API, verify audio capture works, verify conversation works)
- [x] T095 [US4] Test audio controls functionality (device selection, system audio capture, Push-to-Talk functionality)
- [x] T096 [US4] Test session management functionality (save/load sessions, clear history)
- [x] T097 [US4] Test system prompt editing functionality
- [x] T098 [US4] Test tools configuration functionality
- [x] T099 [US4] Fix any functionality regressions found during testing

**Checkpoint**: At this point, User Story 4 should be complete - accessibility maintained or improved, all existing functionality preserved. Application should pass accessibility audits and all voice agent features should work correctly.

---

## Phase 7: User Story 5 - Responsive Design System Compliance (Priority: P3)

**Goal**: Ensure all UI components maintain responsive behavior while following design system breakpoints and mobile patterns

**Independent Test**: View the application on different screen sizes (desktop, tablet, mobile) and verify that spacing, typography scales, component layouts, and navigation patterns follow design system responsive guidelines. Test passes when all breakpoints display correctly per design system specifications.

### Implementation for User Story 5

- [x] T100 [US5] Test application on mobile breakpoint (320px - 767px): verify touch-friendly sizes (minimum 44px height), spacing adjustments, full-width components
- [x] T101 [US5] Test application on tablet breakpoint (768px - 1023px): verify standard spacing, grid layouts
- [x] T102 [US5] Test application on desktop breakpoint (1024px+): verify maximum content width, side-by-side layouts
- [x] T103 [US5] Test theme switching at all breakpoints (light/dark theme should work correctly at mobile, tablet, desktop)
- [x] T104 [US5] Verify responsive spacing adjustments match design system guidelines (mobile: reduced padding/margins, tablet/desktop: standard spacing)
- [x] T105 [US5] Verify responsive typography scales match design system guidelines (appropriate font sizes at each breakpoint)
- [x] T106 [US5] Fix any responsive design issues found during testing

**Checkpoint**: At this point, User Story 5 should be complete - all components work correctly across all breakpoints, responsive design follows design system guidelines.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T107 [P] Perform visual regression testing: compare component appearance with Figma design system (Button variants/states, Card, Dialog, Form components, Alert variants, Badge variants)
- [x] T108 [P] Verify visual appearance matches design system (95% accuracy) in both light and dark themes
- [x] T109 [P] Verify visual appearance matches design system at all breakpoints (mobile, tablet, desktop)
- [x] T110 [P] Run quickstart.md validation: verify all implementation steps from `specs/001-digital-agency-ui/quickstart.md` are completed
- [x] T111 [P] Update documentation in `docs/ARCHITECTURE.md` if design system changes affect architecture documentation
- [x] T112 [P] Code cleanup and refactoring: ensure consistent use of design system tokens across all components
- [x] T113 [P] Performance verification: ensure no performance degradation (UI response times <200ms, voice agent latency <200ms)
- [x] T114 [P] Final accessibility audit: run comprehensive accessibility testing one final time
- [x] T115 [P] Final functionality test: verify all voice agent features work correctly after all updates

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Depends on User Story 1 completion (needs design tokens)
  - User Story 3 (Phase 5): Depends on User Story 2 completion (needs CSS variables)
  - User Story 4 (Phase 6): Depends on User Story 3 completion (needs updated components)
  - User Story 5 (Phase 7): Depends on User Story 3 completion (needs updated components)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 completion - Needs design tokens extracted
- **User Story 3 (P2)**: Depends on User Story 2 completion - Needs CSS variables updated
- **User Story 4 (P2)**: Depends on User Story 3 completion - Needs components updated to test
- **User Story 5 (P3)**: Depends on User Story 3 completion - Needs components updated to test

### Within Each User Story

- User Story 1: Extract metadata → Extract colors → Extract typography → Extract spacing → Extract components → Document → Validate
- User Story 2: Update light theme colors → Update dark theme colors → Add typography variables → Update Tailwind → Add shadows → Test
- User Story 3: Update components in parallel where possible (different files) → Update voice agent components → Test
- User Story 4: Test accessibility → Test functionality → Fix issues
- User Story 5: Test breakpoints → Verify responsive adjustments → Fix issues

### Parallel Opportunities

- **Phase 1**: All setup tasks marked [P] can run in parallel
- **Phase 2**: Tasks T006, T007, T008 can run in parallel (different files)
- **Phase 3 (US1)**: All extraction tasks can run sequentially (Figma MCP server operations)
- **Phase 4 (US2)**: Typography variable tasks (T019-T024) can run in parallel (different scales)
- **Phase 5 (US3)**: Many component update tasks can run in parallel (different component files):
  - Button variants (T029-T033) can run in parallel
  - Card, Dialog, Form components can be updated in parallel
  - Alert variants (T059-T063) can run in parallel
  - Badge variants (T065-T069) can run in parallel
  - Remaining components (T071-T076) can run in parallel
- **Phase 6 (US4)**: Accessibility testing tasks can run in parallel with functionality testing
- **Phase 7 (US5)**: Breakpoint testing tasks can run sequentially
- **Phase 8**: All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all Button variant updates in parallel:
Task: "Update Button primary variant styles in src/components/ui/button.tsx"
Task: "Update Button secondary variant styles in src/components/ui/button.tsx"
Task: "Update Button destructive variant styles in src/components/ui/button.tsx"
Task: "Update Button outline variant styles in src/components/ui/button.tsx"
Task: "Update Button ghost variant styles in src/components/ui/button.tsx"

# Launch all Alert variant updates in parallel:
Task: "Update Alert success variant colors in src/components/ui/alert.tsx"
Task: "Update Alert error variant colors in src/components/ui/alert.tsx"
Task: "Update Alert warning variant colors in src/components/ui/alert.tsx"
Task: "Update Alert info variant colors in src/components/ui/alert.tsx"
Task: "Update Alert default variant colors in src/components/ui/alert.tsx"

# Launch all Badge variant updates in parallel:
Task: "Update Badge primary variant colors in src/components/ui/badge.tsx"
Task: "Update Badge secondary variant colors in src/components/ui/badge.tsx"
Task: "Update Badge success variant colors in src/components/ui/badge.tsx"
Task: "Update Badge error variant colors in src/components/ui/badge.tsx"
Task: "Update Badge warning variant colors in src/components/ui/badge.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Extract design tokens from Figma)
4. **STOP and VALIDATE**: Verify design tokens are extracted and documented
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Extract design tokens → Validate (MVP!)
3. Add User Story 2 → Apply colors and typography → Test independently
4. Add User Story 3 → Update UI components → Test independently
5. Add User Story 4 → Test accessibility and functionality → Fix issues
6. Add User Story 5 → Test responsive design → Fix issues
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Extract design tokens)
   - Developer B: Prepare for User Story 2 (Review CSS structure)
3. Once User Story 1 is complete:
   - Developer A: User Story 2 (Apply colors and typography)
   - Developer B: Prepare for User Story 3 (Review component structure)
4. Once User Story 2 is complete:
   - Developer A: User Story 3 (Update components - can parallelize by component)
   - Developer B: User Story 4 (Accessibility testing)
   - Developer C: User Story 5 (Responsive testing)
5. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Figma MCP server must be used for User Story 1 (design token extraction)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks include exact file paths for clarity
- Visual regression testing and accessibility audits are manual (no automated test tasks)

---

## Task Summary

- **Total Tasks**: 115
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1 - Extract Design Tokens)**: 8 tasks
- **Phase 4 (US2 - Apply Colors & Typography)**: 12 tasks
- **Phase 5 (US3 - Update Components)**: 59 tasks
- **Phase 6 (US4 - Accessibility & Functionality)**: 12 tasks
- **Phase 7 (US5 - Responsive)**: 7 tasks
- **Phase 8 (Polish)**: 9 tasks

**Parallel Opportunities**: Many component update tasks in Phase 5 can run in parallel (different files)

**MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1) - Extract design tokens from Figma

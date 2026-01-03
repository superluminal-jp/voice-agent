# Quick Start Guide: Digital Agency Design System UI Update

**Feature**: Digital Agency Design System UI Update  
**Date**: 2025-01-27  
**Status**: Draft

## Overview

This guide provides step-by-step instructions for implementing the Digital Agency Design System UI update. The update involves extracting design tokens from Figma, updating CSS variables and Tailwind configuration, and modifying UI components to match design system specifications.

## Prerequisites

- Node.js v18.17.0 or later
- npm v9.0.0 or later
- Access to Figma MCP server
- Digital Agency Design System Figma file (v2.10.0) accessible
- Modern browser for testing

## Implementation Steps

### Step 1: Extract Design Tokens from Figma

**Objective**: Extract color palette, typography, spacing, and component specifications from Figma design system file.

**Actions**:
1. Ensure Figma desktop app is running and design system file is open
2. Use Figma MCP server to access design tokens
3. Extract color palette (all 10 hues with 13 shades each)
4. Extract typography scales (Display, Standard, Dense, Oneline, Mono)
5. Extract spacing and layout specifications
6. Extract component specifications (Button, Card, Dialog, etc.)
7. Save extracted tokens to `figma-design-tokens.md` (already completed)

**Verification**: 
- All color tokens extracted with hex values
- All typography scales extracted with sizes and line heights
- Spacing and layout specifications documented

**Time Estimate**: 30 minutes

---

### Step 2: Update CSS Variables in globals.css

**Objective**: Map design system colors to CSS custom properties in `src/app/globals.css`.

**Actions**:
1. Open `src/app/globals.css`
2. Update `:root` color variables with design system light theme colors:
   - Map `--primary` to Blue-600 (`#3460FB`)
   - Map `--background` to Neutral-50 (`#f2f2f2`)
   - Map `--foreground` to Neutral-900 (`#1a1a1a`)
   - Map semantic colors (success, error, warning, caution)
   - Map neutral colors for borders, muted areas
3. Update `.dark` color variables with design system dark theme colors:
   - Map `--primary` to Blue-500 (`#4979F5`)
   - Map `--background` to Neutral-900 (`#1a1a1a`)
   - Map `--foreground` to Neutral-50 (`#f2f2f2`)
   - Map semantic colors for dark theme
   - Map neutral colors for dark theme
4. Add typography variables:
   - Font size variables for each typography scale
   - Line height variables
   - Font weight variables
5. Add spacing variables (if not using Tailwind defaults):
   - Base spacing scale (4px, 8px, 12px, 16px, etc.)
6. Add shadow variables:
   - 8 shadow styles from design system

**Verification**:
- All color variables defined and mapped correctly
- Light and dark theme variables both defined
- Typography variables added
- CSS file compiles without errors

**Time Estimate**: 1-2 hours

---

### Step 3: Update Tailwind Configuration

**Objective**: Integrate design system tokens into Tailwind CSS v4 configuration.

**Actions**:
1. Review `globals.css` `@theme` directive
2. Ensure design system colors are accessible via Tailwind utilities:
   - `bg-primary`, `text-primary`, `border-primary` should use design system colors
   - Semantic color utilities (`bg-success`, `bg-error`, etc.)
3. Verify spacing scale aligns with design system (16px base unit)
4. Test Tailwind utilities work correctly:
   ```bash
   npm run dev
   ```
   - Check that `bg-primary` uses Blue-600
   - Check that spacing utilities match design system

**Verification**:
- Tailwind utilities use design system colors
- Spacing scale matches design system
- No Tailwind configuration errors

**Time Estimate**: 30 minutes

---

### Step 4: Update Button Component

**Objective**: Update Button component to match design system button specifications.

**Actions**:
1. Open `src/components/ui/button.tsx`
2. Update variant styles:
   - Primary: Blue-600 background, white text
   - Secondary: Neutral-200 background, Neutral-900 text
   - Destructive: Red-800 background, white text
   - Outline: Transparent background, Blue-600 border
   - Ghost: Transparent background, Neutral-900 text
3. Update state styles (hover, focus, active, disabled):
   - Hover: Slightly darker/lighter shade
   - Focus: 2px solid Blue-600 outline
   - Active: Pressed state styling
   - Disabled: 50% opacity
4. Update typography: Standard-N16-170
5. Update spacing: 12px vertical, 24px horizontal padding
6. Update border radius: 4px
7. Test all variants and states

**Verification**:
- All button variants match design system
- All states (hover, focus, active, disabled) work correctly
- Focus indicator is visible
- Colors meet contrast requirements

**Time Estimate**: 1 hour

---

### Step 5: Update Card Component

**Objective**: Update Card component to match design system card specifications.

**Actions**:
1. Open `src/components/ui/card.tsx`
2. Update colors:
   - Background: Neutral-50 (light), Neutral-900 (dark)
   - Border: Neutral-200 (light), Neutral-800 (dark)
   - Text: Neutral-900 (light), Neutral-50 (dark)
3. Update spacing: 24px padding, 16px margin
4. Update border radius: 8px
5. Update shadow: Style 1 elevation
6. Update border: 1px solid
7. Test in both light and dark themes

**Verification**:
- Card appearance matches design system
- Spacing and borders correct
- Shadow applied correctly
- Works in both themes

**Time Estimate**: 30 minutes

---

### Step 6: Update Dialog Component

**Objective**: Update Dialog component to match design system dialog specifications.

**Actions**:
1. Open `src/components/ui/dialog.tsx`
2. Update overlay: Black with 50% opacity
3. Update content area:
   - Background: Neutral-50 (light), Neutral-900 (dark)
   - Border radius: 8px
   - Padding: 24px
   - Max width: 600px
4. Update header typography: Standard-B24-150
5. Update footer spacing: 24px margin top, 16px padding top, border top
6. Update shadow: Style 3 elevation
7. Test dialog open/close animations

**Verification**:
- Dialog appearance matches design system
- Overlay and content area styled correctly
- Header and footer spacing correct
- Animations work smoothly

**Time Estimate**: 1 hour

---

### Step 7: Update Form Components (Input, Select, Textarea)

**Objective**: Update form components to match design system form specifications.

**Actions**:
1. Open `src/components/ui/input.tsx`, `select.tsx`, `textarea.tsx`
2. Update colors:
   - Background: White (light), Neutral-800 (dark)
   - Border: Neutral-300 (light), Neutral-700 (dark)
   - Text: Neutral-900 (light), Neutral-50 (dark)
   - Placeholder: Neutral-500
   - Error border: Red-800
3. Update typography: Standard-N16-170
4. Update spacing: 12px vertical, 16px horizontal padding
5. Update border radius: 4px
6. Update focus indicator: 2px solid Blue-600 outline
7. Update error state: Red-800 border, Red-50 background (light), Red-900 background (dark)
8. Test all states (default, focus, error, disabled)

**Verification**:
- All form components match design system
- Focus indicators visible
- Error states styled correctly
- Disabled states work correctly

**Time Estimate**: 1.5 hours

---

### Step 8: Update Alert Component

**Objective**: Update Alert component to match design system alert specifications.

**Actions**:
1. Open `src/components/ui/alert.tsx`
2. Update variant colors:
   - Success: Green-50 background (light), Green-900 background (dark), Green-800 text
   - Error: Red-50 background (light), Red-900 background (dark), Red-800 text
   - Warning: Yellow-50 background (light), Yellow-900 background (dark), Yellow-700 text
   - Info: Blue-50 background (light), Blue-900 background (dark), Blue-600 text
   - Default: Neutral-50 background (light), Neutral-900 background (dark), Neutral-900 text
3. Update typography: Standard-N16-170
4. Update spacing: 16px padding, 16px margin bottom
5. Update border radius: 4px
6. Update border: 1px solid (matching variant color, 20% opacity)
7. Update icon: 20px size, matching variant color
8. Test all variants

**Verification**:
- All alert variants match design system
- Colors and borders correct
- Icons display correctly

**Time Estimate**: 45 minutes

---

### Step 9: Update Badge Component

**Objective**: Update Badge component to match design system badge specifications.

**Actions**:
1. Open `src/components/ui/badge.tsx`
2. Update variant colors:
   - Primary: Blue-600 background, white text
   - Secondary: Neutral-200 background, Neutral-900 text
   - Success: Green-600 background, white text
   - Error: Red-800 background, white text
   - Warning: Yellow-700 background, white text
3. Update typography: Dense-N14-120
4. Update spacing: 4px vertical, 8px horizontal padding
5. Update border radius: 4px
6. Test all variants

**Verification**:
- All badge variants match design system
- Typography and spacing correct

**Time Estimate**: 30 minutes

---

### Step 10: Update Remaining Components

**Objective**: Update Progress, ScrollArea, and Checkbox components.

**Actions**:
1. Update Progress component:
   - Background: Neutral-200 (light), Neutral-800 (dark)
   - Foreground: Blue-600
   - Height: 8px, border radius: 4px
2. Update ScrollArea component:
   - Track: Neutral-100 (light), Neutral-800 (dark)
   - Thumb: Neutral-400 (light), Neutral-600 (dark)
   - Thumb hover: Neutral-500
3. Update Checkbox component:
   - Background: White (light), Neutral-800 (dark)
   - Border: Neutral-300 (light), Neutral-700 (dark)
   - Checked: Blue-600 background, white checkmark
   - Focus: Blue-600, 2px solid outline
   - Size: 16px × 16px

**Verification**:
- All components match design system
- All states work correctly

**Time Estimate**: 1 hour

---

### Step 11: Update Voice Agent Components

**Objective**: Update voice agent-specific components to use design system styling.

**Actions**:
1. Review all components in `src/app/components/voice-agent/`
2. Update component-specific styling:
   - Use design system colors for backgrounds, borders, text
   - Use design system typography for text
   - Use design system spacing for layouts
   - Apply design system shadows for elevation
3. Ensure components maintain functionality
4. Test all voice agent features

**Verification**:
- Voice agent components use design system styling
- All functionality preserved
- Visual appearance matches design system

**Time Estimate**: 2-3 hours

---

### Step 12: Accessibility Testing

**Objective**: Verify all components meet WCAG AA accessibility requirements.

**Actions**:
1. Run automated accessibility audit:
   ```bash
   # Use browser DevTools accessibility audit
   # Or use axe DevTools extension
   ```
2. Test keyboard navigation:
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Test Enter/Space activation
3. Test screen reader compatibility:
   - Use screen reader (NVDA, JAWS, VoiceOver)
   - Verify all components are announced correctly
   - Verify state changes are announced
4. Test color contrast:
   - Verify all text-background combinations meet WCAG AA
   - Normal text: minimum 4.5:1
   - Large text: minimum 3:1
5. Fix any accessibility issues found

**Verification**:
- All components pass accessibility audit
- Keyboard navigation works correctly
- Screen reader compatibility verified
- Color contrast meets WCAG AA requirements

**Time Estimate**: 2-3 hours

---

### Step 13: Responsive Testing

**Objective**: Verify all components work correctly across breakpoints.

**Actions**:
1. Test on mobile (320px - 767px):
   - Verify touch-friendly sizes (minimum 44px height)
   - Verify spacing adjustments
   - Verify full-width components
2. Test on tablet (768px - 1023px):
   - Verify standard spacing
   - Verify grid layouts
3. Test on desktop (1024px+):
   - Verify maximum content width
   - Verify side-by-side layouts
4. Test theme switching at all breakpoints
5. Fix any responsive issues

**Verification**:
- All components work correctly at all breakpoints
- Spacing and layouts adjust appropriately
- Theme switching works at all breakpoints

**Time Estimate**: 1-2 hours

---

### Step 14: Visual Regression Testing

**Objective**: Verify visual appearance matches design system specifications.

**Actions**:
1. Compare component appearance with Figma design system:
   - Button variants and states
   - Card appearance
   - Dialog appearance
   - Form components
   - Alert variants
   - Badge variants
2. Test in both light and dark themes
3. Test at different breakpoints
4. Fix any visual discrepancies

**Verification**:
- All components visually match design system (95% accuracy)
- Both themes display correctly
- All breakpoints display correctly

**Time Estimate**: 2-3 hours

---

### Step 15: Functional Testing

**Objective**: Verify all existing functionality still works after UI updates.

**Actions**:
1. Test voice agent connection:
   - Connect to OpenAI Realtime API
   - Verify audio capture works
   - Verify conversation works
2. Test audio controls:
   - Device selection
   - System audio capture
   - Push-to-Talk functionality
3. Test session management:
   - Save/load sessions
   - Clear history
4. Test system prompt editing
5. Test tools configuration
6. Fix any functionality issues

**Verification**:
- All voice agent features work correctly
- No functionality regressions
- Performance maintained

**Time Estimate**: 1-2 hours

---

## Testing Checklist

- [ ] All CSS variables defined and working
- [ ] Tailwind utilities use design system colors
- [ ] All button variants and states work correctly
- [ ] Card component matches design system
- [ ] Dialog component matches design system
- [ ] All form components match design system
- [ ] Alert component matches design system
- [ ] Badge component matches design system
- [ ] Progress, ScrollArea, Checkbox components updated
- [ ] Voice agent components updated
- [ ] Accessibility audit passes (WCAG AA)
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility verified
- [ ] Color contrast meets requirements
- [ ] Responsive design works at all breakpoints
- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] Visual appearance matches design system (95% accuracy)
- [ ] All functionality preserved
- [ ] Performance maintained

## Estimated Total Time

**Total Implementation Time**: 15-20 hours

**Breakdown**:
- Design token extraction: 30 minutes
- CSS variables update: 1-2 hours
- Tailwind configuration: 30 minutes
- Component updates: 8-10 hours
- Testing: 5-7 hours

## Common Issues and Solutions

### Issue: Colors don't match design system
**Solution**: Verify CSS variables are correctly mapped to design system hex values. Check that both light and dark theme variables are defined.

### Issue: Focus indicators not visible
**Solution**: Ensure focus styles use 2px solid outline with Blue-600 color. Verify focus styles are not overridden by other CSS.

### Issue: Contrast ratios don't meet WCAG AA
**Solution**: Adjust color mappings to use design system colors that meet contrast requirements. Use contrast ratio tags from design system as guidance.

### Issue: Components break at certain breakpoints
**Solution**: Verify responsive spacing and typography adjustments are applied correctly. Test at all breakpoints.

### Issue: Dark theme colors don't look right
**Solution**: Verify dark theme color mappings use appropriate shades from design system. Ensure contrast ratios are maintained.

## Next Steps

After completing implementation:
1. Run full test suite
2. Perform accessibility audit
3. Get design review approval
4. Deploy to staging environment
5. User acceptance testing
6. Deploy to production


# Component Styling Specification Contract

**Feature**: Digital Agency Design System UI Update  
**Date**: 2025-01-27  
**Status**: Draft

## Overview

This contract defines the styling specifications for all UI components to ensure compliance with the Digital Agency Design System v2.10.0. Components must adhere to these specifications to maintain visual consistency and accessibility standards.

## Contract Scope

This contract applies to all UI components in the application:
- Button
- Card
- Dialog
- Input
- Select
- Textarea
- Alert
- Badge
- Progress
- ScrollArea
- Checkbox

## Component Specifications

### Button Component

**Variants**: default, primary, secondary, destructive, outline, ghost

**States**: default, hover, focus, active, disabled

**Styling Requirements**:
- **Colors**:
  - Primary variant: Blue-600 background, white text
  - Secondary variant: Neutral-200 background, Neutral-900 text
  - Destructive variant: Red-800 background, white text
  - Outline variant: Transparent background, Blue-600 border and text
  - Ghost variant: Transparent background, Neutral-900 text
- **Typography**: Standard-N16-170 (16px, Normal, 170% line height)
- **Spacing**: Padding 12px vertical, 24px horizontal
- **Border Radius**: 4px
- **Focus Indicator**: 2px solid outline, Blue-600 color
- **Disabled State**: 50% opacity, non-interactive

**Responsive**:
- Mobile: Same styling, touch-friendly size (minimum 44px height)
- Tablet/Desktop: Standard sizing

---

### Card Component

**Variants**: default

**States**: default, hover (if interactive)

**Styling Requirements**:
- **Colors**:
  - Background: Neutral-50 (light), Neutral-900 (dark)
  - Border: Neutral-200 (light), Neutral-800 (dark)
  - Text: Neutral-900 (light), Neutral-50 (dark)
- **Typography**: Standard-N16-170 for body text
- **Spacing**: Padding 24px, margin 16px
- **Border Radius**: 8px
- **Shadow**: Style 1 elevation (subtle shadow)
- **Border**: 1px solid

**Responsive**:
- Mobile: Padding 16px, margin 8px
- Tablet/Desktop: Standard spacing

---

### Dialog Component

**Variants**: default

**States**: default, open, closing

**Styling Requirements**:
- **Overlay**: Black with 50% opacity
- **Content Area**:
  - Background: Neutral-50 (light), Neutral-900 (dark)
  - Border Radius: 8px
  - Padding: 24px
  - Max Width: 600px (mobile: 90vw)
- **Header**: 
  - Typography: Standard-B24-150 (24px, Bold, 150%)
  - Spacing: Margin bottom 16px
- **Footer**:
  - Spacing: Margin top 24px, padding top 16px, border top
- **Shadow**: Style 3 elevation (prominent shadow)

**Responsive**:
- Mobile: Full width (90vw), reduced padding
- Tablet/Desktop: Centered, max-width 600px

---

### Input Component

**Variants**: default, error

**States**: default, focus, error, disabled

**Styling Requirements**:
- **Colors**:
  - Background: White (light), Neutral-800 (dark)
  - Border: Neutral-300 (light), Neutral-700 (dark)
  - Text: Neutral-900 (light), Neutral-50 (dark)
  - Placeholder: Neutral-500 (light), Neutral-500 (dark)
  - Error border: Red-800
- **Typography**: Standard-N16-170 (16px, Normal, 170%)
- **Spacing**: Padding 12px vertical, 16px horizontal
- **Border Radius**: 4px
- **Focus Indicator**: 2px solid outline, Blue-600 color
- **Error State**: Red-800 border, Red-50 background (light), Red-900 background (dark)

**Responsive**:
- Mobile: Touch-friendly size (minimum 44px height)
- Tablet/Desktop: Standard sizing

---

### Select Component

**Variants**: default, error

**States**: default, open, focus, error, disabled

**Styling Requirements**:
- **Colors**: Same as Input component
- **Typography**: Standard-N16-170 (16px, Normal, 170%)
- **Spacing**: Padding 12px vertical, 16px horizontal
- **Border Radius**: 4px
- **Focus Indicator**: 2px solid outline, Blue-600 color
- **Dropdown**: 
  - Background: White (light), Neutral-900 (dark)
  - Shadow: Style 2 elevation
  - Border Radius: 4px

**Responsive**:
- Mobile: Touch-friendly size (minimum 44px height)
- Tablet/Desktop: Standard sizing

---

### Textarea Component

**Variants**: default, error

**States**: default, focus, error, disabled

**Styling Requirements**:
- **Colors**: Same as Input component
- **Typography**: Standard-N16-170 (16px, Normal, 170%)
- **Spacing**: Padding 12px
- **Border Radius**: 4px
- **Min Height**: 80px
- **Resize**: Vertical only

**Responsive**:
- Mobile: Full width, reduced min-height
- Tablet/Desktop: Standard sizing

---

### Alert Component

**Variants**: default, success, error, warning, info

**States**: default, dismissible

**Styling Requirements**:
- **Colors**:
  - Success: Green-50 background (light), Green-900 background (dark), Green-800 text
  - Error: Red-50 background (light), Red-900 background (dark), Red-800 text
  - Warning: Yellow-50 background (light), Yellow-900 background (dark), Yellow-700 text
  - Info: Blue-50 background (light), Blue-900 background (dark), Blue-600 text
  - Default: Neutral-50 background (light), Neutral-900 background (dark), Neutral-900 text
- **Typography**: Standard-N16-170 (16px, Normal, 170%)
- **Spacing**: Padding 16px, margin 16px bottom
- **Border Radius**: 4px
- **Border**: 1px solid (matching variant color, 20% opacity)
- **Icon**: 20px size, matching variant color

**Responsive**:
- Mobile: Full width, reduced padding
- Tablet/Desktop: Standard sizing

---

### Badge Component

**Variants**: default, primary, secondary, success, error, warning

**States**: default

**Styling Requirements**:
- **Colors**:
  - Primary: Blue-600 background, white text
  - Secondary: Neutral-200 background, Neutral-900 text
  - Success: Green-600 background, white text
  - Error: Red-800 background, white text
  - Warning: Yellow-700 background, white text
  - Default: Neutral-200 background, Neutral-900 text
- **Typography**: Dense-N14-120 (14px, Normal, 120%)
- **Spacing**: Padding 4px vertical, 8px horizontal
- **Border Radius**: 4px
- **Size**: Fit content, minimum 20px height

**Responsive**:
- Mobile: Same styling
- Tablet/Desktop: Standard sizing

---

### Progress Component

**Variants**: default

**States**: default, indeterminate

**Styling Requirements**:
- **Colors**:
  - Background: Neutral-200 (light), Neutral-800 (dark)
  - Foreground: Blue-600
- **Height**: 8px (default), 4px (small), 12px (large)
- **Border Radius**: 4px (full rounded)
- **Animation**: Smooth transition for value changes

**Responsive**:
- Mobile: Standard height
- Tablet/Desktop: Standard height

---

### ScrollArea Component

**Variants**: default

**States**: default, scrolling

**Styling Requirements**:
- **Colors**:
  - Track: Neutral-100 (light), Neutral-800 (dark)
  - Thumb: Neutral-400 (light), Neutral-600 (dark)
  - Thumb hover: Neutral-500 (light), Neutral-500 (dark)
- **Width**: 8px (scrollbar width)
- **Border Radius**: 4px (thumb)

**Responsive**:
- Mobile: Native scrollbar (if supported)
- Tablet/Desktop: Custom scrollbar

---

### Checkbox Component

**Variants**: default

**States**: default, checked, indeterminate, focus, disabled

**Styling Requirements**:
- **Colors**:
  - Background: White (light), Neutral-800 (dark)
  - Border: Neutral-300 (light), Neutral-700 (dark)
  - Checked background: Blue-600
  - Checked foreground: White
  - Focus indicator: Blue-600, 2px solid outline
- **Size**: 16px × 16px
- **Border Radius**: 2px
- **Spacing**: 8px margin right (from label)

**Responsive**:
- Mobile: Touch-friendly size (minimum 20px × 20px)
- Tablet/Desktop: Standard 16px × 16px

---

## Accessibility Requirements

### Focus Indicators
- All interactive components MUST have visible focus indicators
- Focus indicator: 2px solid outline, Blue-600 color
- Focus indicator must have sufficient contrast (WCAG AA)

### Keyboard Navigation
- All interactive components MUST be keyboard accessible
- Tab order must be logical and intuitive
- Enter/Space must activate buttons and controls

### Screen Reader Support
- All components MUST have appropriate ARIA labels
- State changes MUST be announced to screen readers
- Error messages MUST be associated with form inputs

### Color Contrast
- All text-background combinations MUST meet WCAG AA requirements
- Normal text: minimum 4.5:1 contrast ratio
- Large text (18px+): minimum 3:1 contrast ratio

---

## Responsive Breakpoints

### Mobile (320px - 767px)
- Reduced padding and margins (16px → 12px)
- Touch-friendly sizes (minimum 44px height for interactive elements)
- Full-width components where appropriate
- Simplified layouts

### Tablet (768px - 1023px)
- Standard spacing
- Standard component sizes
- Grid-based layouts

### Desktop (1024px+)
- Standard spacing
- Standard component sizes
- Maximum content width constraints
- Side-by-side layouts where appropriate

---

## Theme Support

### Light Theme
- Use light color variants (Neutral-50 backgrounds, Neutral-900 text)
- Maintain high contrast for readability
- Use design system light theme color mappings

### Dark Theme
- Use dark color variants (Neutral-900 backgrounds, Neutral-50 text)
- Maintain high contrast for readability
- Use design system dark theme color mappings
- Ensure all components are readable in dark mode

---

## Validation Rules

1. All components MUST use design system color tokens (no hardcoded colors)
2. All components MUST use design system typography scales
3. All components MUST use design system spacing tokens
4. All components MUST meet WCAG AA contrast requirements
5. All components MUST have visible focus indicators
6. All components MUST be keyboard accessible
7. All components MUST support both light and dark themes
8. All components MUST be responsive across defined breakpoints

---

## Compliance Verification

Components are verified against this contract through:
- Visual inspection against Figma design system
- Automated contrast ratio testing
- Accessibility audit tools (axe, WAVE)
- Manual keyboard navigation testing
- Screen reader testing
- Responsive design testing across breakpoints


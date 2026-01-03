# Data Model: Digital Agency Design System UI Update

**Feature**: Digital Agency Design System UI Update  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

This feature primarily involves styling and visual updates. The data model focuses on design tokens, theme configuration, and component styling specifications rather than traditional data entities.

## Design Token Entities

### ColorToken

Represents a color value from the Digital Agency Design System.

**Attributes**:
- `name`: string - Color name (e.g., "Blue-600", "Neutral-500")
- `value`: string - Hex color code (e.g., "#3460FB")
- `hue`: string - Color hue (Blue, Light Blue, Cyan, Green, Lime, Yellow, Orange, Red, Magenta, Purple, Neutral)
- `shade`: number - Shade level (50, 100, 200, ..., 1200)
- `semantic`: string | null - Semantic meaning (primary, secondary, success, error, warning, caution, accent, link) or null
- `contrastRatio`: object - Contrast ratio information
  - `onWhite`: number | null - Contrast ratio on white background
  - `onBlack`: number | null - Contrast ratio on black background

**Relationships**:
- Belongs to a ColorPalette
- Used by ThemeConfiguration
- Referenced by ComponentStyle

**Validation Rules**:
- `value` must be valid hex color code (format: #RRGGBB)
- `shade` must be between 50 and 1200
- `contrastRatio` values must meet WCAG AA requirements when used for text

---

### TypographyScale

Represents a typography scale definition from the design system.

**Attributes**:
- `name`: string - Scale name (Display, Standard, Dense, Oneline, Mono)
- `fontSize`: number - Font size in pixels
- `fontWeight`: string - Font weight (Normal, Bold)
- `lineHeight`: number - Line height as percentage (e.g., 140, 150, 170)
- `fontFamily`: string - Font family (sans, mono)
- `useCase`: string - Intended use case (headings, body, compact, single-line, code)

**Relationships**:
- Used by ComponentStyle for text styling
- Referenced in ThemeConfiguration

**Validation Rules**:
- `fontSize` must be positive number
- `lineHeight` must be between 100 and 200
- `fontWeight` must be "Normal" or "Bold"

---

### SpacingToken

Represents spacing values from the design system.

**Attributes**:
- `name`: string - Spacing name (e.g., "base", "small", "medium", "large")
- `value`: number - Spacing value in pixels
- `unit`: string - Unit type (px, rem)
- `useCase`: string - Intended use case (margin, padding, gap, border-radius)

**Relationships**:
- Used by ComponentStyle for spacing
- Referenced in LayoutConfiguration

**Validation Rules**:
- `value` must be positive number
- `value` should be multiple of 4px or 8px (design system grid)

---

### ShadowToken

Represents elevation/shadow definitions from the design system.

**Attributes**:
- `name`: string - Shadow name (Style 1, Style 2, ..., Style 8)
- `value`: string - CSS box-shadow value
- `elevation`: number - Elevation level (1-8, higher = more elevated)
- `useCase`: string - Intended use case (card, dialog, popover, tooltip)

**Relationships**:
- Used by ComponentStyle for elevation
- Referenced in ThemeConfiguration

**Validation Rules**:
- `value` must be valid CSS box-shadow syntax
- `elevation` must be between 1 and 8

---

### ComponentStyle

Represents styling specifications for a UI component.

**Attributes**:
- `componentName`: string - Component name (Button, Card, Dialog, Input, Select, Alert, Badge)
- `variant`: string - Component variant (default, primary, secondary, destructive, outline, ghost)
- `state`: string - Component state (default, hover, focus, active, disabled)
- `colors`: object - Color specifications
  - `background`: string - Background color token name
  - `foreground`: string - Text color token name
  - `border`: string - Border color token name
- `typography`: string - Typography scale name
- `spacing`: object - Spacing specifications
  - `padding`: object - Padding values (top, right, bottom, left)
  - `margin`: object - Margin values (top, right, bottom, left)
  - `gap`: number - Gap between child elements
- `borderRadius`: number - Border radius in pixels
- `shadow`: string | null - Shadow token name or null
- `responsive`: object - Responsive adjustments per breakpoint

**Relationships**:
- References ColorToken, TypographyScale, SpacingToken, ShadowToken
- Belongs to ThemeConfiguration

**Validation Rules**:
- All color references must exist in ColorToken collection
- Typography reference must exist in TypographyScale collection
- Spacing values must be positive numbers
- Border radius must be non-negative

---

### ThemeConfiguration

Represents the complete theme configuration for light and dark modes.

**Attributes**:
- `name`: string - Theme name ("light" or "dark")
- `colors`: object - Color mappings
  - `primary`: string - Primary color token name
  - `secondary`: string - Secondary color token name
  - `accent`: string - Accent color token name
  - `background`: string - Background color token name
  - `foreground`: string - Text color token name
  - `border`: string - Border color token name
  - `muted`: string - Muted color token name
  - `destructive`: string - Destructive/error color token name
  - `success`: string - Success color token name
  - `warning`: string - Warning color token name
  - `caution`: string - Caution color token name
- `typography`: object - Typography scale mappings
  - `display`: string - Display typography scale name
  - `heading`: string - Heading typography scale name
  - `body`: string - Body text typography scale name
  - `small`: string - Small text typography scale name
- `spacing`: object - Spacing scale mappings
- `shadows`: object - Shadow token mappings
- `componentStyles`: ComponentStyle[] - Array of component style specifications

**Relationships**:
- Contains ComponentStyle specifications
- References ColorToken, TypographyScale, SpacingToken, ShadowToken collections

**Validation Rules**:
- All color references must exist in ColorToken collection
- All typography references must exist in TypographyScale collection
- All component styles must be valid ComponentStyle objects
- Contrast ratios must meet WCAG AA requirements for all text-background combinations

---

### LayoutConfiguration

Represents responsive layout configuration from the design system.

**Attributes**:
- `breakpoint`: string - Breakpoint name (mobile, tablet, desktop, wide)
- `minWidth`: number - Minimum width in pixels
- `maxWidth`: number | null - Maximum width in pixels or null
- `grid`: object - Grid configuration
  - `columns`: number - Number of grid columns
  - `gutter`: number - Gutter width in pixels
  - `margin`: number - Side margin in pixels
- `spacing`: object - Spacing adjustments for this breakpoint
- `typography`: object - Typography scale adjustments for this breakpoint

**Relationships**:
- References SpacingToken and TypographyScale
- Used by ComponentStyle for responsive adjustments

**Validation Rules**:
- `minWidth` must be positive number
- `maxWidth` must be greater than `minWidth` if not null
- Grid values must be positive numbers

---

## State Transitions

### Theme Switching

```
Light Theme → [User Action] → Dark Theme
Dark Theme → [User Action] → Light Theme
```

**Triggers**: User clicks theme toggle button  
**Effects**: 
- CSS variables updated in `:root` and `.dark` selectors
- All components re-render with new theme colors
- Contrast ratios verified for new theme

### Component State Changes

```
Default → [Hover] → Hover State
Hover → [Mouse Leave] → Default
Default → [Focus] → Focus State
Focus → [Blur] → Default
Default → [Click] → Active State
Active → [Release] → Default
Any State → [Disabled] → Disabled State
```

**Triggers**: User interactions (mouse, keyboard, touch)  
**Effects**: 
- Component visual appearance changes
- CSS classes updated
- Accessibility attributes maintained

---

## Data Flow

### Design Token Extraction

```
Figma File → MCP Server → Design Tokens → CSS Variables → Components
```

1. Figma MCP server extracts design tokens from Figma file
2. Design tokens parsed and validated
3. CSS custom properties created in `globals.css`
4. Components reference CSS variables for styling

### Theme Application

```
Theme Configuration → CSS Variables → Component Styles → Rendered UI
```

1. Theme configuration defines color and typography mappings
2. CSS variables set in `:root` (light) and `.dark` (dark)
3. Components use CSS variables via Tailwind utilities or direct CSS
4. Browser renders styled components

---

## Validation Rules Summary

### Color Tokens
- Hex color format validation
- Shade range validation (50-1200)
- Contrast ratio compliance (WCAG AA)

### Typography
- Font size range validation
- Line height range validation (100-200%)
- Font weight validation (Normal/Bold)

### Spacing
- Positive number validation
- Grid unit alignment (4px or 8px multiples)

### Component Styles
- All referenced tokens must exist
- State transitions must be valid
- Responsive breakpoints must be defined

### Theme Configuration
- All color mappings must reference valid ColorTokens
- All typography mappings must reference valid TypographyScales
- Contrast ratios must meet WCAG AA for all combinations

---

## Data Persistence

### Client-Side Storage
- **Theme Preference**: Stored in localStorage via next-themes
- **Component State**: Managed in React component state (not persisted)
- **Design Tokens**: Defined in CSS files (not persisted, part of codebase)

### No Backend Storage Required
This feature does not require backend storage. All design tokens and theme configurations are:
- Defined in CSS files (`globals.css`)
- Configured in Tailwind configuration
- Applied at build/runtime via CSS variables

---

## Integration Points

### CSS Variables System
Design tokens are exposed as CSS custom properties:
- `--color-*`: Color tokens
- `--font-*`: Typography tokens
- `--spacing-*`: Spacing tokens
- `--shadow-*`: Shadow tokens

### Tailwind Configuration
Design tokens integrated into Tailwind via:
- `@theme` directive in `globals.css`
- Custom color scales
- Custom spacing scales
- Custom typography scales

### Component Usage
Components access design tokens via:
- Tailwind utility classes (e.g., `bg-primary`, `text-foreground`)
- CSS variables (e.g., `var(--color-primary)`)
- Direct CSS custom properties


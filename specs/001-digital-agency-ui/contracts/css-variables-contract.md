# CSS Variables Contract

**Feature**: Digital Agency Design System UI Update  
**Date**: 2025-01-27  
**Status**: Draft

## Overview

This contract defines the CSS custom properties (variables) that must be defined in `globals.css` to support the Digital Agency Design System. All components must use these variables for colors, typography, spacing, and other design tokens.

## Color Variables

### Primary Colors
```css
--color-primary: [Blue-600 hex value]
--color-primary-foreground: [White or appropriate contrast color]
--color-primary-hover: [Blue-700 hex value]
--color-primary-active: [Blue-800 hex value]
```

### Secondary Colors
```css
--color-secondary: [Neutral-200 hex value]
--color-secondary-foreground: [Neutral-900 hex value]
--color-secondary-hover: [Neutral-300 hex value]
--color-secondary-active: [Neutral-400 hex value]
```

### Accent Colors
```css
--color-accent: [Accent color from design system]
--color-accent-foreground: [Appropriate contrast color]
```

### Semantic Colors
```css
--color-success: [Green-600 hex value]
--color-success-foreground: [White or appropriate contrast color]
--color-error: [Red-800 hex value]
--color-error-foreground: [White or appropriate contrast color]
--color-warning: [Yellow-700 hex value]
--color-warning-foreground: [White or appropriate contrast color]
--color-caution: [Orange-600 hex value]
--color-caution-foreground: [White or appropriate contrast color]
```

### Neutral Colors
```css
--color-background: [Neutral-50 for light, Neutral-900 for dark]
--color-foreground: [Neutral-900 for light, Neutral-50 for dark]
--color-muted: [Neutral-200 for light, Neutral-800 for dark]
--color-muted-foreground: [Neutral-500 for light, Neutral-500 for dark]
--color-border: [Neutral-200 for light, Neutral-800 for dark]
--color-input: [White for light, Neutral-800 for dark]
--color-ring: [Blue-600 hex value]
```

### Card Colors
```css
--color-card: [Neutral-50 for light, Neutral-900 for dark]
--color-card-foreground: [Neutral-900 for light, Neutral-50 for dark]
```

### Destructive Colors
```css
--color-destructive: [Red-800 hex value]
--color-destructive-foreground: [White or appropriate contrast color]
```

## Typography Variables

### Font Families
```css
--font-sans: [System sans-serif font stack]
--font-mono: [System monospace font stack]
```

### Font Sizes (Display)
```css
--font-size-display-64: 64px
--font-size-display-57: 57px
--font-size-display-48: 48px
```

### Font Sizes (Standard)
```css
--font-size-std-45: 45px
--font-size-std-36: 36px
--font-size-std-32: 32px
--font-size-std-28: 28px
--font-size-std-26: 26px
--font-size-std-24: 24px
--font-size-std-22: 22px
--font-size-std-20: 20px
--font-size-std-18: 18px
--font-size-std-17: 17px
--font-size-std-16: 16px
```

### Font Sizes (Dense)
```css
--font-size-dense-17: 17px
--font-size-dense-16: 16px
--font-size-dense-14: 14px
```

### Font Sizes (Oneline)
```css
--font-size-oneline-17: 17px
--font-size-oneline-16: 16px
--font-size-oneline-14: 14px
```

### Font Sizes (Mono)
```css
--font-size-mono-17: 17px
--font-size-mono-16: 16px
--font-size-mono-14: 14px
```

### Line Heights
```css
--line-height-140: 140%
--line-height-150: 150%
--line-height-160: 160%
--line-height-170: 170%
--line-height-100: 100%
--line-height-120: 120%
--line-height-130: 130%
```

### Font Weights
```css
--font-weight-normal: 400
--font-weight-bold: 700
```

## Spacing Variables

### Base Spacing (16px grid)
```css
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px
--spacing-16: 64px
--spacing-20: 80px
```

## Border Radius Variables
```css
--radius-sm: 2px
--radius-md: 4px
--radius-lg: 8px
--radius-xl: 12px
```

## Shadow Variables
```css
--shadow-1: [Style 1 shadow value]
--shadow-2: [Style 2 shadow value]
--shadow-3: [Style 3 shadow value]
--shadow-4: [Style 4 shadow value]
--shadow-5: [Style 5 shadow value]
--shadow-6: [Style 6 shadow value]
--shadow-7: [Style 7 shadow value]
--shadow-8: [Style 8 shadow value]
```

## Theme-Specific Variables

### Light Theme (`:root`)
All color variables use light theme values (light backgrounds, dark text).

### Dark Theme (`.dark`)
All color variables use dark theme values (dark backgrounds, light text).

## Usage Contract

1. **Components MUST use CSS variables** - No hardcoded color values, font sizes, or spacing
2. **Variables MUST be defined** - All referenced variables must exist in `globals.css`
3. **Theme switching** - Variables must support both light and dark themes
4. **Fallback values** - Variables should have fallback values for older browsers
5. **Naming convention** - Variables follow `--color-*`, `--font-*`, `--spacing-*`, `--radius-*`, `--shadow-*` pattern

## Validation

- All CSS variables must be defined before use
- All color variables must be valid hex color codes
- All spacing variables must be positive numbers with units (px, rem)
- All typography variables must be valid CSS values
- All shadow variables must be valid CSS box-shadow syntax


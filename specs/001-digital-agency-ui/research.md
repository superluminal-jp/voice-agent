# Research: Digital Agency Design System UI Update

**Feature**: Digital Agency Design System UI Update  
**Date**: 2025-01-27  
**Status**: Complete

## Research Tasks

### 1. Tailwind CSS v4 Design Token Integration

**Task**: Research best practices for integrating design system tokens into Tailwind CSS v4 configuration

**Findings**:
- Tailwind CSS v4 uses CSS variables and `@theme` directive for custom theme configuration
- Design tokens can be integrated via CSS custom properties in `globals.css`
- Tailwind v4 supports arbitrary values and custom color scales
- Color tokens should be mapped to Tailwind's semantic color system (primary, secondary, accent, etc.)

**Decision**: Use CSS custom properties (`--color-*`) in `globals.css` with Tailwind's `@theme` directive to map design system colors to Tailwind utilities. This allows both CSS variable usage and Tailwind class usage.

**Rationale**: 
- Maintains compatibility with existing shadcn/ui components that use CSS variables
- Enables Tailwind utility classes (e.g., `bg-primary`, `text-foreground`)
- Supports dark mode via CSS variable overrides
- Follows Tailwind v4 best practices

**Alternatives Considered**:
- Direct Tailwind config file: Rejected - Tailwind v4 prefers CSS-based configuration
- Separate design token file: Rejected - CSS variables provide better integration

---

### 2. shadcn/ui Component Customization

**Task**: Research how to customize shadcn/ui components to match design system specifications

**Findings**:
- shadcn/ui components are copy-paste components, not npm packages
- Components can be directly modified in `src/components/ui/`
- Components use CSS variables for theming, making design system integration straightforward
- Radix UI primitives (underlying shadcn/ui) support extensive customization via className props

**Decision**: Update shadcn/ui component files directly to use design system colors, typography, and spacing. Modify component styles while preserving component logic and accessibility features.

**Rationale**:
- Direct control over component styling
- Maintains component functionality and accessibility
- CSS variables allow theme switching without component changes
- Follows shadcn/ui architecture (components are owned by the project)

**Alternatives Considered**:
- Creating wrapper components: Rejected - Unnecessary abstraction, adds complexity
- Using CSS-only overrides: Rejected - May not cover all component states and variants

---

### 3. Design System Color Mapping Strategy

**Task**: Determine how to map Digital Agency Design System colors to application's semantic color system

**Findings**:
- Design system provides 10 color hues (Blue, Light Blue, Cyan, Green, Lime, Yellow, Orange, Red, Magenta, Purple) with 13 shades each (50-1200)
- Design system includes semantic colors (Success, Error, Warning, Caution)
- Application uses semantic color names (primary, secondary, accent, destructive, etc.)
- Neutral colors (grays) are used for backgrounds, borders, text

**Decision**: 
- Map Blue-600 (`#3460FB`) as primary color for light theme
- Map Blue-500 (`#4979F5`) as primary color for dark theme
- Use Neutral colors for backgrounds, borders, and text
- Map semantic colors: Success → Green-600, Error → Red-800, Warning → Yellow-700
- Use Accent colors for highlights and interactive elements

**Rationale**:
- Blue is the primary brand color in the design system
- Semantic colors provide clear meaning (success, error, warning)
- Neutral colors ensure proper contrast and readability
- Accent colors add visual interest without overwhelming

**Alternatives Considered**:
- Using all color hues: Rejected - Too many colors would create inconsistency
- Using only neutral colors: Rejected - Lacks visual hierarchy and meaning

---

### 4. Typography System Integration

**Task**: Research how to integrate design system typography scales into Next.js/React application

**Findings**:
- Design system defines 5 typography scales: Display (Dsp), Standard (Std), Dense (Dns), Oneline (Oln), Mono
- Each scale has multiple sizes with specific line heights
- Application currently uses system fonts (Geist Sans, Geist Mono)
- Tailwind v4 supports custom font sizes and line heights via CSS variables

**Decision**: 
- Create CSS custom properties for typography scales in `globals.css`
- Map Standard (Std) scale to body text and headings
- Use Display (Dsp) for large headings
- Use Dense (Dns) for compact UI elements
- Use Oneline (Oln) for single-line text
- Use Mono for code and technical content

**Rationale**:
- Typography scales provide consistent text sizing across the application
- CSS variables allow easy theme switching and responsive adjustments
- Multiple scales provide flexibility for different use cases
- Maintains compatibility with existing font setup

**Alternatives Considered**:
- Using only Standard scale: Rejected - Lacks flexibility for different UI contexts
- Hard-coding font sizes: Rejected - Difficult to maintain and update

---

### 5. Responsive Design System Breakpoints

**Task**: Research how to apply design system responsive breakpoints to Next.js application

**Findings**:
- Design system defines breakpoints: 797px, 1024px, 1280px, 1440px, 1920px
- Tailwind CSS uses default breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Next.js supports responsive design via Tailwind classes and CSS media queries
- Design system breakpoints align closely with Tailwind defaults

**Decision**: 
- Extend Tailwind breakpoints to match design system where needed
- Use Tailwind's responsive utilities for component layouts
- Apply design system spacing and typography scales at each breakpoint
- Maintain mobile-first approach

**Rationale**:
- Tailwind breakpoints are close enough to design system breakpoints
- Minor adjustments can be made via custom breakpoints
- Mobile-first approach ensures good mobile experience
- Tailwind utilities provide efficient responsive styling

**Alternatives Considered**:
- Custom breakpoint system: Rejected - Unnecessary complexity, Tailwind breakpoints are sufficient
- Fixed-width layouts: Rejected - Does not support responsive design requirements

---

### 6. Dark Mode Color Mapping

**Task**: Determine how to map design system colors for dark mode theme

**Findings**:
- Design system provides color scales but does not explicitly define dark mode colors
- Application already has dark mode support via next-themes
- Dark mode typically inverts or adjusts color relationships (light backgrounds → dark backgrounds)
- WCAG AA contrast requirements must be maintained in both themes

**Decision**: 
- Use darker shades of design system colors for dark mode (e.g., Blue-800, Blue-900 for backgrounds)
- Use lighter shades for text and interactive elements in dark mode
- Map Neutral colors appropriately (light grays for dark mode backgrounds, dark grays for light mode)
- Ensure all color combinations meet WCAG AA contrast ratios in both themes

**Rationale**:
- Dark mode requires different color relationships for readability
- Using design system color scales ensures consistency
- Contrast requirements are legally and ethically required
- Existing dark mode infrastructure can be leveraged

**Alternatives Considered**:
- Separate dark mode color palette: Rejected - Design system does not provide one, would require custom colors
- Inverting all colors: Rejected - May not maintain design system aesthetics

---

### 7. Component State Styling (Hover, Focus, Active, Disabled)

**Task**: Research design system specifications for component interactive states

**Findings**:
- Design system defines component states but specific styling details need to be extracted from Figma
- shadcn/ui components already support hover, focus, active, and disabled states
- Focus indicators are critical for accessibility (keyboard navigation)
- Design system emphasizes visible focus indicators

**Decision**: 
- Extract component state specifications from Figma design system file
- Apply design system colors and styles to existing component states
- Ensure focus indicators are clearly visible (2px outline, design system accent color)
- Maintain disabled state styling (reduced opacity, non-interactive appearance)

**Rationale**:
- Component states are essential for user interaction feedback
- Accessibility requires visible focus indicators
- Design system provides consistent state styling
- Existing component infrastructure supports state management

**Alternatives Considered**:
- Custom state styling: Rejected - Would not match design system
- Removing state styling: Rejected - Degrades user experience and accessibility

---

### 8. Spacing and Layout System

**Task**: Research design system spacing tokens and grid system

**Findings**:
- Design system uses 16px base grid unit
- Spacing follows 8px or 16px increments
- Layout breakpoints define margins and gutters for different screen sizes
- Tailwind CSS uses 4px base spacing scale (can be customized)

**Decision**: 
- Map design system spacing to Tailwind spacing scale
- Use 16px (4 * 4px) as base unit, which aligns with design system
- Apply design system margins and gutters at breakpoints
- Use Tailwind spacing utilities (p-4 = 16px, p-8 = 32px, etc.)

**Rationale**:
- 16px base unit matches design system grid
- Tailwind spacing utilities provide efficient styling
- Consistent spacing creates visual harmony
- Responsive spacing can be applied via Tailwind breakpoints

**Alternatives Considered**:
- Custom spacing system: Rejected - Tailwind spacing is sufficient and well-integrated
- Fixed spacing values: Rejected - Lacks flexibility for different components

---

### 9. Shadow/Elevation System

**Task**: Research design system elevation (shadow) specifications

**Findings**:
- Design system defines 8 shadow styles (Style 1-8)
- Shadows provide depth and hierarchy in UI
- Tailwind CSS supports custom shadows via `box-shadow` utilities
- shadcn/ui components use CSS variables for shadows

**Decision**: 
- Extract shadow specifications from Figma design system
- Create CSS custom properties for each shadow style
- Map shadows to component elevation levels (cards, dialogs, popovers)
- Apply appropriate shadows based on component hierarchy

**Rationale**:
- Shadows provide visual depth and component hierarchy
- CSS variables allow easy theme switching
- Design system provides consistent shadow styles
- Component elevation improves user understanding of UI structure

**Alternatives Considered**:
- Using Tailwind default shadows: Rejected - Would not match design system
- No shadows: Rejected - Reduces visual hierarchy and depth

---

### 10. Accessibility and Contrast Compliance

**Task**: Research WCAG AA contrast requirements and design system compliance

**Findings**:
- WCAG AA requires 4.5:1 contrast ratio for normal text, 3:1 for large text
- Design system includes contrast ratio tags in color specifications
- Some design system colors may not meet contrast requirements in all combinations
- Contrast must be verified for all text-background combinations

**Decision**: 
- Verify all color combinations meet WCAG AA requirements
- Use design system contrast ratio tags as guidance
- Adjust color mappings if contrast requirements are not met
- Test all text-background combinations in both light and dark themes

**Rationale**:
- WCAG AA compliance is legally required for government applications
- Accessibility is an ethical requirement
- Design system provides contrast ratio information
- Testing ensures compliance across all use cases

**Alternatives Considered**:
- Ignoring contrast requirements: Rejected - Legal and ethical violation
- Using only high-contrast colors: Rejected - May not match design system aesthetics

---

## Consolidated Decisions

### Color System
- **Primary**: Blue-600 (light), Blue-500 (dark)
- **Semantic**: Success (Green-600), Error (Red-800), Warning (Yellow-700), Caution (Orange-600)
- **Neutral**: Design system Neutral colors for backgrounds, borders, text
- **Accent**: Design system Accent colors for highlights

### Typography
- **Display**: For large headings (64px, 57px, 48px)
- **Standard**: For body text and standard headings (45px-16px)
- **Dense**: For compact UI elements (17px-14px)
- **Oneline**: For single-line text (17px-14px)
- **Mono**: For code and technical content (17px-14px)

### Spacing
- **Base Unit**: 16px (matches design system grid)
- **Scale**: 4px increments (Tailwind default, 16px = 4 * 4px)

### Responsive
- **Breakpoints**: Use Tailwind defaults (sm, md, lg, xl, 2xl) with minor adjustments
- **Approach**: Mobile-first responsive design

### Implementation Strategy
1. Update CSS variables in `globals.css` with design system colors
2. Update Tailwind configuration to use design system tokens
3. Modify shadcn/ui components to use design system styles
4. Apply typography scales via CSS variables
5. Test accessibility and contrast compliance
6. Verify responsive behavior across breakpoints

## Unresolved Questions

None - All research tasks completed. Design system tokens have been extracted from Figma and implementation strategy is clear.


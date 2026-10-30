---
name: Kinesis Lab
description: Clinical Field Notes, extracted from the implemented Vietnamese workspace.
colors:
  canvas: "var(--canvas)"
  sheet: "var(--sheet)"
  surface: "var(--surface)"
  ink: "var(--ink)"
  slate: "var(--slate)"
  cobalt: "var(--cobalt)"
  cobalt-soft: "var(--cobalt-soft)"
  on-cobalt: "var(--on-cobalt)"
  cleared: "var(--cleared)"
  cleared-soft: "var(--cleared-soft)"
  caution: "var(--caution)"
  caution-soft: "var(--caution-soft)"
  crimson: "var(--crimson)"
  crimson-soft: "var(--crimson-soft)"
  rule: "var(--rule)"
  rule-strong: "var(--rule-strong)"
  mark: "var(--mark)"
  toolbar: "var(--toolbar)"
  toolbar-muted: "var(--toolbar-muted)"
typography:
  headline:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.5vw, 34px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    lineHeight: 1.7
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.7
  mono:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
rounded:
  badge: "6px"
  number: "8px"
  control: "10px"
  alert: "12px"
  tab-bar: "14px"
  panel: "18px"
spacing:
  icon-gap: "8px"
  group-gap: "12px"
  section-gap: "20px"
  panel-inline: "24px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-cobalt}"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  icon-button:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.slate}"
    rounded: "{rounded.control}"
  field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  badge:
    rounded: "{rounded.badge}"
    padding: "5px 9px"
  panel:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.panel}"
  tab-button:
    textColor: "{colors.slate}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  mobile-nav:
    backgroundColor: "color-mix(in srgb, var(--sheet) 94%, var(--canvas))"
    textColor: "{colors.slate}"
  page-heading:
    textColor: "{colors.ink}"
    typography: "{typography.headline}"
---

# Design System: Kinesis Lab

## Overview

**Creative North Star: "Clinical Field Notes"**

This document extracts the implemented visual system in `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/theme.ts`, `src/components/WorkspaceUI.tsx`, `src/components/AppShell.tsx` and `src/components/ThemePicker.tsx`, recorded on 2026-10-30. Clinical Field Notes is the incumbent identity confirmed by the user, not a new visual direction. Theme-dependent paper, ink and accents frame a Vietnamese clinical-learning workspace with refined controls and soft structural depth.

Be Vietnam Pro carries readable Vietnamese content and interface hierarchy; IBM Plex Mono distinguishes compact technical references. The responsive workspace gives learning and consultation the same navigation treatment. A clear heading, navigation and the actual task organize the first viewport. Product and medical truth remain in `PRODUCT.md` and `docs/medical-evidence-policy.md`.

**Key Characteristics:**
- Theme-bound paper, ink, borders and functional state colors.
- Vietnamese sans-serif hierarchy with compact monospace technical references.
- Rounded controls, lightly bordered panels and soft structural shadows.
- Desktop top navigation and mobile bottom navigation around a separately scrolling workspace.

## Colors

The palette character changes with the selected theme; the semantic role names remain stable. Frontmatter colors intentionally bind to the implemented CSS custom properties rather than freezing the default palette. `globals.css` owns the exact values and `color-mix()` expressions for each theme; `@theme inline` exposes them to utilities. The historical name `cobalt` means primary action, not a promise of blue.

### Primary

- **Primary action / Primary tonal surface / Primary action text:** `cobalt`, `cobalt-soft` and `on-cobalt` cover actions, selected navigation and readable action labels. Use the paired text role instead of assuming the same foreground for every state.

### Secondary

- **Positive state / Positive tonal surface:** `cleared` and `cleared-soft` support positive state treatment where the source assigns that meaning.
- **Theme highlight:** `mark` appears in selection, the active navigation underline and selected tabs. It is theme-dependent, not universally gold.

### Tertiary

- **Caution state / Caution tonal surface:** `caution` and `caution-soft` distinguish cautionary context.
- **Error state / Error tonal surface:** `crimson` and `crimson-soft` support error context. Other implemented foreground pairs include `on-caution`, `on-crimson` and `on-cleared`; preserve those source mappings when using solid state surfaces. State names are semantic and do not guarantee hue.

### Neutral

- **Workspace canvas / Paper surface / Inset surface:** `canvas`, `sheet` and `surface` establish the layered work area.
- **Primary ink / Secondary ink:** `ink` and `slate` separate primary content and supporting text.
- **Quiet border / Field border:** `rule` and `rule-strong` establish container and input boundaries.
- **Toolbar ink / Toolbar secondary text:** `toolbar` and `toolbar-muted` support the dark header; its primary labels are white in the implementation.

All 13 themes remain supported: `tide` (Ocean Sunset, default), `pacific` (Ocean Blue Serenity), `canopy` (Warm Neutral Tones), `sunny-beach` (Sunny Beach Day), `summer-ocean` (Summer Ocean Breeze), `earthy-forest` (Earthy Forest Hues), `olive-garden` (Olive Garden Feast), `summer-fun` (Refreshing Summer Fun), `autumn-glow` (Warm Autumn Glow), `black-gold` (Black & Gold Elegance), `deep-sea` (Deep Sea), `earthy-green` (Earthy Green) and `fresh-greens` (Fresh Greens). The root uses `data-theme`; the provider persists the selection as `kinesis-theme`. The theme picker and toolbar spectrum legitimately use the source palette slots `p1` through `p10`.

The sidecar's derived tonal ramps are preview metadata, not new production tokens or replacements for these theme mappings.

## Typography

**Display and Body Font:** Be Vietnam Pro, with UI sans-serif/system fallbacks; loaded weights (400, 500, 600, 700) and Vietnamese subset in `layout.tsx`.

**Label/Mono Font:** IBM Plex Mono, with monospace fallback; loaded weights (400, 500, 600). Standard field labels remain sans-serif; section numbers and technical references use mono.

### Hierarchy

- **Headline:** the frontmatter headline role is the shared page heading; balanced wrapping and tight tracking provide hierarchy without a decorative kicker.
- **Title:** the frontmatter title role describes the shared section heading. Empty-state headings use a larger size (16px) at weight (600).
- **Body:** the frontmatter body role captures reusable workspace support copy. Global body line-height is (1.55); page descriptions use (1.75) with a maximum width (720px), empty-state copy uses (14px/24px), and rendered answers use (1.7). Preserve these context-specific settings.
- **Label:** the frontmatter label role is the shared field label. Buttons use (13px), weight (600), line-height (1.5); tabs use (12.5px), weight (600); badges use (11px), weight (500), line-height (1.5).
- **Mono:** the frontmatter mono role captures section-number typography. Do not turn monospace technical references into a new decorative heading tier.

## Layout

The shell fills the dynamic viewport (`100dvh`) and contains a separate vertical scroller. Main content is centered with a maximum width (1600px). Its mobile padding is (26px 20px 36px), changing at (640px) to (32px 28px 40px), then at (1280px) to horizontal padding (32px). The header's inner row is (64px) high; the unused `--header-h: 4.5rem` declaration does not determine that rendered height.

Desktop navigation appears at (1024px); below that, a five-column bottom navigation uses a minimum item height (48px), safe-area-aware bottom padding and a footer clearance (86px). Desktop footer clearance is (20px). Page-heading actions wrap with the heading; shared groups and controls use the frontmatter spacing values. Panels permit shrinking with `min-width: 0`; reading tables scroll horizontally rather than forcing the workspace wider. Route-specific grids remain in their source components rather than a fabricated global grid rule.

## Elevation & Depth

Depth combines theme-toned surfaces, thin borders and soft shadows. Panels have a small contact shadow and a broad low-opacity lift; primary buttons have a compact action shadow; tabs use inset structure and a selected underline. The toolbar uses a tonal gradient, broad structural shadow and a three-pixel palette spectrum. These established gradients belong to this identity. The mobile navigation adds translucent paper, blur (12px) and an upward shadow. Floating study chat has stronger elevation to distinguish it from document content.

Exact shadow expressions are recorded in the sidecar from `globals.css`. State transitions commonly last (150ms); the catch-up arrival animation lasts (180ms) with `cubic-bezier(0.16, 1, 0.3, 1)`. Reduced-motion CSS removes animation and retains brief color, border, shadow and opacity transitions (100ms). These are observed implementation behaviors, not a new motion doctrine.

## Shapes

The frontmatter radius scale describes the shared badge, section number, control, alert, tab group and panel. Controls use the same gentle corners across buttons and fields. Borders are generally (1px), with quiet container rules and stronger field rules. The theme picker is an intentionally circular control (36px); the source logo also has its own rounded SVG geometry. Some Atlas and client-detail containers have a source override (16px); they do not replace the shared panel radius.

## Components

### Buttons

Primary and secondary buttons share inline-flex alignment, icon gap, minimum height (42px) and the frontmatter padding. Primary uses action/text pairs with a compact shadow and changes to ink on hover; disabled primary uses surface/slate and no shadow. Secondary uses paper/ink, changing to primary tonal surface and primary ink on hover; disabled secondary opacity is (0.6). Icon buttons have minimum dimensions (40px), quiet borders and primary-toned hover. Keyboard focus uses a primary outline (3px) with offset (3px).

### Chips

The shared badge is a compact informational marker with a quiet border. Its global rule does not assign a universal background, text tone or click behavior; route-level state classes provide those when needed. Do not present a static badge as a control.

### Cards / Containers

Shared panels use paper, quiet borders and the panel shadow. Their header is a wrapping flex row with padding (20px 24px), gap (12px) and a bottom rule. Body padding is assigned by each consumer, so there is no universal panel-body padding token.

### Inputs / Fields

Fields use paper/ink, a stronger border and control corners. Shared labels sit above full-width fields with margin (6px), minimum height (44px) and the frontmatter field padding. Focus changes the border to primary and retains the visible outline. Search fields reserve left padding (42px) for an inline SVG at (14px). Placeholders use secondary ink at full opacity. Error messages use the error tonal surface, ink text, a flare-mixed border and alert corners; they wrap long content.

### Navigation

Desktop links share a dark toolbar, secondary toolbar ink at rest and white text on hover or active. Active links add a translucent rounded backing, highlight icon and highlight-to-positive underline. Mobile links use secondary ink at rest and primary ink on a primary tonal surface when active. Both retain `aria-current`. Shared tabs wrap inside a tonal inset group; `aria-pressed="true"` selects a paper tab with a highlight underline and soft lift. The existing source uses pressed buttons, so previews do not invent tab-panel keyboard semantics.

### Page Heading and Feedback

`PageHeading` renders the title, description and optional wrapping actions. It does not render an eyebrow. The heading ends in a quiet highlight-mixed divider. `SectionHeading` uses a bordered monospace section number beside a sans-serif title. Loading feedback uses a status region and spinner; empty states pair an outline SVG, clear title, supporting copy and optional action. The native theme selector keeps its accessible label while showing the current palette as a circular conic swatch.

## Do's and Don'ts

### Do:

- Do use semantic CSS custom properties so every supported theme changes the workspace coherently.
- Do preserve Be Vietnam Pro, Vietnamese diacritics and IBM Plex Mono technical references.
- Do reuse shared controls, visible keyboard focus and wrapping layouts at narrow widths.
- Do preserve the established toolbar spectrum, theme picker and soft structural depth where their source patterns apply.
- Do keep product and medical claims governed by PRODUCT.md and the medical evidence policy.

### Don't:

- Don't freeze the default Tide colors into new components or treat their hues as universal rules.
- Don't add a decorative eyebrow to PageHeading or turn leftover kicker styling into a future component pattern.
- Don't replace shared controls with one-off shapes or remove focus and state distinctions.
- Don't infer universal accessibility or medical validation from these extracted tokens and snippets.

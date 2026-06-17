---
name: Visual Identity — Soft UI Minimal SaaS
description: Monochrome B&W design system, Inter typography, 20px radii, soft elevation, white sidebar with light-gray active pill
type: design
---
# Soft UI Minimal SaaS (Linear/Notion/Figma-inspired)

## Palette (semantic tokens in `src/index.css`)
- Background `#F7F7F5` — app canvas
- Surface `#FFFFFF` — cards, sidebar, popovers
- Primary text `#111111` — headings, primary ink
- Secondary text `#777777` — muted-foreground
- Border `#E8E8E8` — all hairlines
- Soft surface / active pill `#F1F1EF`
- Primary button: black (`#111`) with white text

## Typography
- Inter (display + body), tracking -0.02em on headings
- Falls back to SF Pro Display / system-ui

## Shape & elevation
- `--radius: 1.25rem` (20px) — large rounded containers
- Soft shadow tokens, NO blur backdrops (legacy `.glass*` utilities aliased to opaque white surfaces)
- Sidebar: white background, subtle right border, light-gray rounded-2xl active pill with very soft shadow

## Forbidden
- Gradients, bright colors, dark backgrounds
- Heavy shadows or backdrop blur on cards
- Color-coded module accents — everything is monochrome

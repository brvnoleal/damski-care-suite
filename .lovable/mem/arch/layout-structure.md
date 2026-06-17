---
name: App Layout Structure
description: Sidebar has a fixed hamburger Menu toggle at the top, separated by a line from the navigation icons below; the toggle expands/retracts only the nav icons. Header is white, clinic name removed, search centered.
---
# App Layout Structure

## Sidebar
- White surface with a subtle right border (`#E8E8E8`).
- **Top section**: fixed hamburger Menu icon (3 horizontal lines) that toggles the collapsed/expanded state of the navigation icons below.
- **Separator**: a single hairline below the menu toggle separates it from the navigation icons and the rest of the dashboard.
- **Navigation**: icons (Início, Agenda, etc.) sit below the separator. When collapsed, only icons show; when expanded, icons + labels show.
- On mobile, the sidebar is an off-canvas drawer; the menu row also contains a close (X) button on the right.
- The menu toggle itself does not expand/retract — it only controls the icons below it.

## Header
- Pure white surface (`#FFFFFF`).
- **No menu toggle** and **no clinic name** inside the header.
- Layout is a 3-column grid:
  1. Empty left spacer.
  2. Centered patient search.
  3. Notifications + settings icons, aligned to the right.
- The header has a bottom border separating it from the main content; no extra line is introduced by the menu control.

## Why
Keeping the menu control inside the sidebar, fixed above the navigation, makes the toggle relationship explicit: it directly controls the icons below it. Removing the clinic name and centering the search keeps the header minimal and balanced.

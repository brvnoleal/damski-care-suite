---
name: App Layout Structure
description: Sidebar has a fixed hamburger Menu toggle at the very top, separated by a hairline from the navigation icons below. Footer actions hold Configurações above Sair, with a hairline separating Sair from the items above. Header has no menu toggle, no clinic name, and no settings icon; search bar is centered.
---
# App Layout Structure

## Sidebar
- White surface with a subtle right border (`#E8E8E8`).
- **Top section**: fixed hamburger Menu icon (3 horizontal lines) that toggles the collapsed/expanded state of the navigation icons below.
- **Separator**: a single hairline below the menu toggle separates it from the navigation icons (Início, Agenda, etc.).
- **Navigation**: icons sit below the separator. When collapsed, only icons show; when expanded, icons + labels show.
- **Footer actions**: a "Configurações" link sits just above the "Sair" button.
- **Separator**: a hairline (`border-t`) separates the "Sair" button from the navigation and "Configurações" items above it.
- On mobile, the sidebar is an off-canvas drawer; the menu row also contains a close (X) button on the right.
- The menu toggle itself does not expand/retract — it only controls the icons below it.

## Header
- Pure white surface (`#FFFFFF`).
- **No menu toggle** and **no clinic name** inside the header.
- Layout is a single grid row: `1fr auto 1fr`.
  - Left column: empty spacer.
  - Center column: patient search centered within the remaining space (up to `max-w-md`).
  - Right column: notifications icon aligned to the right.
- Only the standard header bottom border separates it from the main content.

## Behavior
- On desktop: the toggle switches the sidebar between `72px` (icon-only) and `260px` (icons + labels). The dashboard main area resizes to fill the remaining width.
- On mobile: the toggle opens/closes the off-canvas sidebar drawer.
- The toggle button stays in the same position at the top of the sidebar at all times.
- Right-side form popups (e.g. Nova Consulta) float with visible top/bottom spacing, rounded corners, and internal scrolling instead of touching the viewport edges.

## Why
Putting the menu control at the top of the sidebar, separated by a line, makes the relationship explicit: it controls the icons below it. Removing the menu toggle and clinic name from the header keeps the header clean and lets the search sit centered.

---
name: App Layout Structure
description: Header has a static hamburger Menu toggle on the left, a centered search bar in the remaining space, and right-side icons. No divider between the toggle and the search. Toggle expands/retracts sidebar and dashboard while staying fixed.
---
# App Layout Structure

## Header
- Pure white surface (`#FFFFFF`).
- Single flex row with three sections:
  1. **Static hamburger Menu toggle** (3 horizontal lines) on the far left. Clicking it expands/retracts the sidebar and dashboard; the button itself does not move.
  2. **Search bar** centered in the remaining space between the toggle and the right-side icons. It uses `flex-1` with `justify-center`.
  3. **Notifications + settings icons** on the far right.
- No divider/line between the menu toggle and the search bar. The only visual separation is the standard header bottom border.

## Sidebar
- White surface with a subtle right border (`#E8E8E8`).
- No menu toggle inside the sidebar. On mobile, the sidebar is an off-canvas drawer with a close (X) button in a top row.
- Navigation icons (Início, Agenda, etc.) collapse/expand their labels when the sidebar is toggled.

## Behavior
- On desktop: the toggle switches the sidebar between `72px` (icon-only) and `260px` (icons + labels). The dashboard main area resizes to fill the remaining width.
- On mobile: the toggle opens/closes the off-canvas sidebar drawer.
- The toggle button stays in the same position in the header at all times.

## Why
Putting the menu control in the header keeps the chrome consistent and makes the toggle always accessible. Centering the search in the flex-1 remaining space gives a balanced, calm header without extra dividers.

---
name: App Layout Structure
description: Menu toggle is a fixed hamburger button at the top-left, completely outside the sidebar. Sidebar contains all navigation and action items. Header has no menu toggle, no clinic name, and no settings icon; search bar is centered.
---
# App Layout Structure

## Menu Toggle
- Fixed hamburger Menu icon at the **top-left of the viewport**, outside the sidebar.
- Toggles the sidebar collapsed/expanded state on desktop and opens/closes the mobile drawer.
- It is NOT part of the sidebar menu and does not expand/retract with the sidebar.
- On mobile, the toggle stays visible; a close (X) button appears next to it only when the drawer is open.
- The toggle bar has a bottom hairline (`border-b`) that separates it from the content below.

## Sidebar
- White surface with a subtle right border (`#E8E8E8`).
- Contains all navigation and action items: Início, Agenda, Consultas, Pacientes, Procedimentos, Usuários, Documentos, Insumos, Relatórios, Configurações, Sair.
- **Navigation**: icons sit at the top. When collapsed, only icons show; when expanded, icons + labels show.
- **Footer actions**: the "Sair" button sits at the bottom, separated from the items above by a hairline (`border-t`).
- On mobile, the sidebar is an off-canvas drawer that slides in below the fixed toggle bar.

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
- On mobile: the toggle opens/closes the off-canvas sidebar drawer; the toggle itself remains visible.
- The sidebar and main content area are both offset `56px` from the top so the fixed toggle bar sits above them.

## Why
Separating the menu toggle from the sidebar menu makes the toggle always reachable, even when the mobile drawer is closed. The sidebar can then focus entirely on navigation and action items. Keeping the menu toggle out of the header preserves the clean, centered search layout.

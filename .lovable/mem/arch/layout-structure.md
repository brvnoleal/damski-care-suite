---
name: App Layout Structure
description: Menu toggle and header (search + notifications) share a single fixed top bar. Toggle sits on the left with the sidebar width; header fills the remaining width. Sidebar and main content sit below this top bar.
---
# App Layout Structure

## Top Bar
- A single fixed bar at the very top of the viewport (`z-40`, `h-14`).
- **Left segment**: menu toggle. On desktop it matches the sidebar width (`72px` collapsed, `260px` expanded). On mobile it is a compact button with a close (X) button next to it when the drawer is open.
- **Right segment**: header containing the centered patient search and the notifications icon on the right.
- Both segments share the same visual hairline (`border-b`) and sit above the sidebar and main content.

## Menu Toggle
- Hamburger icon inside the left segment of the top bar, completely outside the sidebar.
- Toggles the sidebar collapsed/expanded state on desktop and opens/closes the mobile drawer.
- It is NOT part of the sidebar menu and does not expand/retract with the sidebar.

## Sidebar
- White surface with a subtle right border (`#E8E8E8`).
- Contains all navigation and action items: Início, Agenda, Consultas, Pacientes, Procedimentos, Usuários, Documentos, Insumos, Relatórios, Configurações, Sair.
- **Navigation**: icons sit at the top. When collapsed, only icons show; when expanded, icons + labels show.
- **Footer actions**: the "Sair" button sits at the bottom, separated from the items above by a hairline (`border-t`).
- On mobile, the sidebar is an off-canvas drawer that slides in below the fixed top bar.

## Header
- Fills the right segment of the fixed top bar.
- **No menu toggle** and **no clinic name** inside the header.
- Layout is a single grid row: `1fr auto 1fr`.
  - Left column: empty spacer.
  - Center column: patient search centered within the remaining space (up to `max-w-md`).
  - Right column: notifications icon aligned to the right.
- Separated from the toggle segment by the sidebar's right border logic.

## Behavior
- On desktop: the toggle switches the sidebar between `72px` (icon-only) and `260px` (icons + labels). The header and main area resize to fill the remaining width.
- On mobile: the toggle opens/closes the off-canvas sidebar drawer; the toggle stays in the top bar and the header remains visible beside it.
- The sidebar and main content area are both offset `56px` from the top so the fixed top bar sits above them.

## Why
Combining the menu toggle and the header into one top bar keeps the primary controls (navigation, search, notifications) together and always visible. The sidebar can then focus entirely on navigation and action items below.

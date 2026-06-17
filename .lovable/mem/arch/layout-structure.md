---
name: App Layout Structure
description: A single fixed top bar spans the full width and contains the menu toggle, centered search, and notifications. The sidebar sits below it and collapses/expands independently without moving the top bar controls.
---
# App Layout Structure

## Top Bar
- A single fixed bar spanning the full width at the very top of the viewport (`z-50`, `h-14`).
- **Left**: menu toggle button (fixed size, does not move or resize with the sidebar).
- **Center**: patient search, centered within the remaining space (up to `max-w-md`).
- **Right**: notifications icon.
- The top bar is visually separated from the content below by a hairline (`border-b`).
- It is completely independent of the sidebar width: expanding or collapsing the sidebar does **not** move or resize any top bar element.

## Menu Toggle
- Hamburger icon at the top-left, always visible and static.
- Toggles the sidebar collapsed/expanded state on desktop and opens/closes the mobile drawer.
- On mobile, the icon switches to an X when the drawer is open.
- It is NOT part of the sidebar menu and does not expand/retract with the sidebar.

## Sidebar
- White surface with a subtle right border (`#E8E8E8`) and `overflow-hidden` so content is clipped during the collapse/expand animation.
- Contains all navigation and action items: Início, Agenda, Consultas, Pacientes, Procedimentos, Usuários, Documentos, Insumos, Relatórios, Configurações, Sair.
- **Icons**: each navigation icon sits inside a fixed `w-5 h-5` flex shelf. The icon stays in the exact same horizontal position whether the sidebar is expanded or collapsed; it never shifts, centers, or scales because of the sidebar state.
- **Labels**: navigation labels, "Configurações", and "Sair" animate with a smooth `transition-all duration-300 ease-in-out` using `max-width` and `opacity`. They slide/fade in beside the static icon when expanded and collapse to zero width when retracted, keeping the animation visually symmetric.
- **Footer actions**: the "Sair" button sits at the bottom, separated from the items above by a hairline (`border-t`).
- On mobile, the sidebar is an off-canvas drawer that slides in below the fixed top bar.

## Header
- The header is the top bar itself; it contains no clinic name, no settings icon, and no extra elements besides the toggle, search, and notifications.
- Layout is a single grid row: `auto 1fr auto`.
  - Left column: menu toggle.
  - Center column: patient search centered within the remaining space.
  - Right column: notifications icon aligned to the right.

## Main Content Area
- The gray app canvas sits below the top bar and to the right of the sidebar.
- On desktop, the top-left corner of the content area is rounded (`rounded-tl-2xl`) and has a subtle top/left hairline (`border-t`, `border-l`). The straight segments sit behind the fixed top bar and the sidebar, so only the rounded corner remains visible where the gray area meets the white frame.
- On mobile, the main area keeps the full-width, sharp-cornered look because the sidebar is off-canvas; the rounding is only relevant where the sidebar meets the content.

## Behavior
- On desktop: the toggle switches the sidebar between `72px` (icon-only) and `260px` (icons + labels). The width transition/animation is applied **only to the sidebar**; the top bar stays fixed and its controls do not move or resize.
- On mobile: the toggle opens/closes the off-canvas sidebar drawer; the top bar remains visible and unchanged while the drawer slides in below it.
- The sidebar and main content area are both offset `56px` from the top so the fixed top bar sits above them.

## Why
Keeping the top bar full-width and independent of the sidebar makes the primary controls (navigation, search, notifications) always stable and easy to reach. The sidebar can animate smoothly without causing visual jumps in the header or pushing the menu button around.

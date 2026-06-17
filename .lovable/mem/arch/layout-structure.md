---
name: App Layout Structure
description: A single fixed top bar spans the full width and contains the menu toggle, centered search, and notifications. The sidebar sits below it with a fixed width; only the labels expand/collapse. The main content area has a rounded top-right corner.
---
# App Layout Structure

## Top Bar
- A single fixed bar spanning the full width at the very top of the viewport (`z-50`, `h-14`).
- **Left**: menu toggle button (fixed size, does not move or resize with the sidebar).
- **Center**: patient search, centered within the remaining space (up to `max-w-md`).
- **Right**: notifications icon.
- The top bar is visually separated from the content below by a hairline (`border-b`).
- It is completely independent of the sidebar: expanding or collapsing the menu does **not** move or resize any top bar element.

## Menu Toggle
- Hamburger icon at the top-left, always visible and static.
- Toggles the sidebar collapsed/expanded state on desktop and opens/closes the mobile drawer.
- On mobile, the icon switches to an X when the drawer is open.
- It is NOT part of the sidebar menu and does not expand/retract with the sidebar.

## Sidebar
- White surface with a subtle right border (`#E8E8E8`) and `overflow-hidden`.
- **Fixed width**: always `260px` on both desktop and mobile. The sidebar itself does not change width when the menu is collapsed/expanded.
- Contains all navigation and action items: Início, Agenda, Consultas, Pacientes, Procedimentos, Usuários, Documentos, Insumos, Relatórios, Configurações, Sair.
- **Navigation icons**: remain perfectly static at the left edge; they do not shift or center when the menu is collapsed.
- **Labels**: navigation labels and the "Sair" label fade and scale their width with a smooth `transition-all duration-300 ease-in-out` (`max-width: 0` → `max-width: 180px`, `opacity: 0` → `opacity: 1`). Only the labels expand or retract.
- **Footer actions**: the "Sair" button sits at the bottom, separated from the items above by a hairline (`border-t`).
- On mobile, the sidebar is an off-canvas drawer that slides in below the fixed top bar.

## Header
- The header is the top bar itself; it contains no clinic name, no settings icon, and no extra elements besides the toggle, search, and notifications.
- Layout is a single grid row: `auto 1fr auto`.
  - Left column: menu toggle.
  - Center column: patient search centered within the remaining space.
  - Right column: notifications icon aligned to the right.

## Main Content Area
- Sits below the fixed top bar (`mt-14`) and beside the fixed-width sidebar.
- The gray background (`bg-background`) has a rounded top-right corner (`rounded-tr-2xl`) where it meets the sidebar, creating a smooth visual transition.
- Scrolls independently inside `h-[calc(100vh-56px)]`.

## Behavior
- On desktop: the toggle shows/hides the sidebar labels. The sidebar width stays at `260px`; the icons stay fixed; only the text labels animate in/out.
- On mobile: the toggle opens/closes the off-canvas sidebar drawer; the top bar remains visible and unchanged while the drawer slides in below it.
- The sidebar and main content area are both offset `56px` from the top so the fixed top bar sits above them.

## Why
Keeping the sidebar at a fixed width and animating only the labels makes the primary navigation icons always stable and predictable. The main content area never shifts horizontally, and the rounded top-right corner softens the junction between the white sidebar and the gray content canvas.

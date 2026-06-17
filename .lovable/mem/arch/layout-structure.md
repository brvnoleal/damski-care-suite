---
name: App Layout Structure
description: Header is white and fixed at the top; sidebar expand/retract toggle is a hamburger Menu icon fixed in the header, not inside the sidebar
---
# App Layout Structure

## Header
- Pure white surface (`#FFFFFF`) connected to the white sidebar via the shared menu toggle.
- Contains, from left to right:
  1. Fixed hamburger Menu toggle (3 horizontal lines) that expands/retracts the sidebar.
  2. Clinic name (optional, hidden on very small screens).
  3. Patient search (centered, flex-1).
  4. Notifications bell.
  5. Settings gear.
- The menu toggle stays fixed in the header; only the sidebar width changes when toggled.

## Sidebar
- White surface with a subtle right border (`#E8E8E8`).
- On desktop it can be expanded (`260px`) or collapsed (`72px`).
- On mobile it is an off-canvas drawer with a close (X) button inside.
- No expand/collapse chevron inside the sidebar — the control lives in the header.

## Active route pill
- Light-gray rounded-2xl pill (`#F1F1EF`) with a very soft shadow.

## Why
Keeping the toggle in the white header creates a continuous visual connection between the header and sidebar, reinforces the fixed chrome of the app, and avoids a floating control inside the sidebar.

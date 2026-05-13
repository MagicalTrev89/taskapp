# ADR-006: Drag-and-Drop Library

Date: 2026-05-13

## Status

Accepted

## Context

US-006 (Kanban Board) and US-004 (Configure Statuses) require drag-and-drop functionality:
- Kanban board: dragging task cards between columns to change status
- Status configuration: reordering statuses by drag-and-drop
- Must work on both desktop (mouse) and mobile (touch) per US-006 AC
- US-009 provides a keyboard-accessible alternative (dropdown), so the library does not need to solve accessibility on its own

## Decision

Use **@dnd-kit** (dnd-kit) for all drag-and-drop interactions.

## Rationale

dnd-kit is the recommended choice for React/Next.js:
- Built for React with hooks, not a wrapper around a DOM library
- Active development and maintenance (principle 5)
- First-class support for touch devices (US-006 requires mobile)
- Accessible by default with keyboard support via `KeyboardSensor`
- Modular: use only the sensors and utilities needed
- Performant — uses CSS transforms, not positional styles
- Supports sortable lists (for status reordering) and drag-between-containers (for Kanban columns)

Alternatives considered:
- **react-beautiful-dnd**: Deprecated, no longer maintained. Ruled out.
- **@hello-pangea/dnd**: Community fork of react-beautiful-dnd. Viable but less active ecosystem than dnd-kit.
- **HTML5 Drag and Drop API**: Poor mobile support, inconsistent cross-browser behaviour. Not suitable.

## Consequences

### Positive
- Single library for both Kanban drag-and-drop and status reordering
- Touch support built in (US-006 mobile requirement)
- Keyboard support via `KeyboardSensor` (supplements US-009 dropdown)
- Lightweight — only import what you use
- Good documentation and examples for Kanban-style layouts

### Negative
- Requires custom implementation for Kanban-style "drag between containers" — not a plug-and-play Kanban component
- Learning curve for the sortable preset and collision detection configuration
- No built-in Kanban board component — we build the board, dnd-kit provides the drag primitives
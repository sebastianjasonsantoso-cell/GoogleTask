# Google Tasks architecture and UI/UX research

**Audience:** GoogleTask product and engineering work

**Date:** 28 August 2026

## Scope and assumptions

This research covers current Google Tasks behaviour on desktop and its Google Workspace side-panel model. The goal is a close functional and interaction-inspired web experience, not Google account integration, Google Calendar synchronization, or an attempt to impersonate Google services.

## Executive answer

Google Tasks is best treated as a deliberately small personal task system: users work inside one active list, add tasks quickly, then expand a task only when they need richer details. The highest-value architecture is therefore a local list/task graph with ordered items, an optional detail surface, and keyboard-first updates—not a broad dashboard.

## Evidence-backed design decisions

1. **Active-list-first navigation.** Google documents creation from a right-side panel, with one selected task list and a list chooser at the top; users create a new list from that chooser. This motivates a focused task canvas with a prominent active-list control rather than a dense multi-column dashboard. [Use Google products side by side — Google Tasks Help](https://support.google.com/tasks/answer/106237?co=GENIE.Platform%3DDesktop&hl=en)
2. **Progressive task detail.** A task can carry details, a date/time, deadlines, repeat rules and subtasks; desktop editing also supports moving a task to another list. The implementation will keep title entry lightweight and open a detail dialog only when needed. [Add or edit a task — Google Tasks Help](https://support.google.com/tasks/answer/7675838?co=GENIE.Platform%3DDesktop&hl=en)
3. **Ordered task collections.** Google supports custom order, date, deadline, recently starred, and title sorts; manual reorder is available only in the custom order. The app will model task order explicitly and expose the matching sort modes. [Organize your tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675629?co=GENIE.Platform%3DDesktop&hl=en)
4. **Completion as a reversible state.** Completed tasks can be shown or hidden rather than disappearing. The UI will preserve a collapsible Completed group and allow an item to be re-opened. [Organize your tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675629?co=GENIE.Platform%3DDesktop&hl=en)
5. **Keyboard efficiency.** Google exposes shortcuts for creating, completing, starring and moving tasks. The app will support Enter to add, Space to complete a focused task, and Cmd/Ctrl+Enter to save a detail dialog. [Use keyboard shortcuts for Google Tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675630?co=GENIE.Platform%3DDesktop&hl=en)

## Target information architecture

- `TaskList`: id, title, order
- `Task`: id, listId, title, notes, dueDate, starred, completedAt, order, subtasks
- `Subtask`: id, title, completed
- UI state: active list, active sort, completed visibility, selected task/detail dialog
- Persistence: versioned browser `localStorage`, suitable for this local-only release

## Implementation limits

This release intentionally excludes Google sign-in, Calendar sync, notifications, repeating tasks, and collaboration. These depend on account, calendar, or server capabilities outside the requested local task experience.

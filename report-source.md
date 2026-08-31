# Google Tasks desktop parity research

**Audience:** GoogleTask product and engineering work  
**Date:** 31 August 2026  
**Scope:** English desktop UI and core task-list interactions. The goal is close interaction and layout parity for a local, standalone task manager, not Google account impersonation, data sync, Calendar integration, or reuse of Google-owned visual assets.

## Executive answer

The current Google Tasks desktop experience is a sparse, application-level workspace: a permanent left sidebar contains `Create`, aggregate views (`All tasks`, `Starred`), and user task lists; a 680px white rounded card sits at the top-centre of the remaining canvas. The card presents one task collection with a compact title, list options, a text-style `Add a task` control, task rows, and a collapsible completed section. Task creation from the list expands inline; the global Create action opens a focused form. The implementation should reproduce this shell before adding any broader dashboard treatment.

## Evidence and decisions

1. **Navigation and geometry.** Direct visual inspection of the signed-in Tasks desktop application on 31 August 2026 found a header, permanent sidebar, white `Create` button, `All tasks`, `Starred`, a `Lists` section, and a 680px white rounded list card centred within the remaining canvas. This is consistent with Google’s documentation that lists are selected from the Tasks surface and that users can create a new list from the list chooser. [Add a list — Google Tasks Help](https://support.google.com/tasks/answer/7675771?co=GENIE.Platform%3DDesktop&hl=en)
2. **Create and detail workflow.** Direct inspection found that the card-level `Add a task` expands an inline task row with title, details, Today/Tomorrow, date/time, and repeat controls; the global `Create` action opens an Add task form. Google documents that desktop task creation/editing supports details, dates/times, deadlines, repeating tasks, subtasks, and moving tasks between lists. [Add or edit a task — Google Tasks Help](https://support.google.com/tasks/answer/7675838?co=GENIE.Platform%3DDesktop&hl=en)
3. **Task organisation.** The list options surface exposes sorting, so the clone preserves `My order`, `Date`, `Deadline`, `Starred recently`, and `Title`. Google documents those sorts and states that manual reordering is available in `My order`. [Organize your tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675629?co=GENIE.Platform%3DDesktop&hl=en)
4. **Starred and completed task affordances.** The application keeps aggregate `Starred` navigation and row-level starring, plus a collapsible completed section. Google documents both starred-task management and showing/hiding completed tasks. [Prioritize tasks with stars — Google Tasks Help](https://support.google.com/tasks/answer/12718779?co=GENIE.Platform%3DDesktop&hl=en) [Organize your tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675629?co=GENIE.Platform%3DDesktop&hl=en)
5. **Keyboard behavior.** The implementation preserves quick task creation by `n`, Space to complete a focused task, and Escape to close active overlays. Google’s documented desktop shortcuts include Enter to create, Space to complete, and Escape/Enter to finish editing. [Use keyboard shortcuts for Google Tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675630?co=GENIE.Platform%3DDesktop&hl=en)

## Architecture

- `TaskList`: `id`, `title`, `order`
- `Task`: `id`, `listId`, `title`, `notes`, date/time/repeat metadata, star/completion state, order, and subtasks
- UI state: active aggregate/list view, sort, completed visibility, editor dialogs, menu visibility
- Persistence: versioned `localStorage` only. The release intentionally excludes sign-in, sync, notifications, real recurrence processing, sharing, and Calendar integration.

## Gap matrix and limitations

| Claim | Evidence | Confidence | Product decision |
| --- | --- | --- | --- |
| Desktop uses a sidebar and wide task canvas | Direct live observation, 31 Aug 2026 | High | Rebuild shell around sidebar + canvas |
| New-task dialog includes calendar/time/recurrence/list fields | Direct live observation; official editing help | High | Include matching local form controls |
| Sort, stars, completed grouping are first-class | Official Help | High | Preserve these interactions |
| Account sync and Calendar notification behavior | Official Help says Tasks is integrated with Workspace | High | Exclude; no authenticated backend was requested |

## Sources consulted

- [Learn about Google Tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675772?hl=en), accessed 31 August 2026.
- [Add a list — Google Tasks Help](https://support.google.com/tasks/answer/7675771?co=GENIE.Platform%3DDesktop&hl=en), accessed 31 August 2026.
- [Add or edit a task — Google Tasks Help](https://support.google.com/tasks/answer/7675838?co=GENIE.Platform%3DDesktop&hl=en), accessed 31 August 2026.
- [Organize your tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675629?co=GENIE.Platform%3DDesktop&hl=en), accessed 31 August 2026.
- [Prioritize tasks with stars — Google Tasks Help](https://support.google.com/tasks/answer/12718779?co=GENIE.Platform%3DDesktop&hl=en), accessed 31 August 2026.
- [Use keyboard shortcuts for Google Tasks — Google Tasks Help](https://support.google.com/tasks/answer/7675630?co=GENIE.Platform%3DDesktop&hl=en), accessed 31 August 2026.

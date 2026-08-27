# PRD — Google Tasks

## Ringkasan

Google Tasks is a lightweight task-list app that helps users quickly organize work and personal activities. It follows familiar task-management patterns in a standalone English interface.

## Tujuan

- Create, complete, star, and delete tasks with minimal friction.
- Group tasks into Today, Work, and Personal lists.
- Store changes locally so a list remains after reopening the page.

## Pengguna sasaran

Professionals and students who want to see daily priorities without a complex project-management system.

## Ruang lingkup versi 1

1. Navigation for Today, Starred, Completed, Work, and Personal lists.
2. An input to add a task to the active list.
3. Complete/incomplete status and a completed-tasks section.
4. Starred-task controls and view.
5. Delete one task or all tasks from the options menu.
6. Browser-based `localStorage` persistence.
7. Responsive desktop and mobile layout.

## Cerita pengguna

- As a user, I want to add a task so I do not forget important work.
- As a user, I want to complete a task so my progress is clear.
- As a user, I want to star an important task so I can find it quickly.
- As a user, I want to reopen the app and see my last task list.

## Kriteria keberhasilan

- A new task appears instantly in the active list.
- Task status, stars, and deletions persist after a page refresh.
- The interface is usable from a 320 px screen through desktop.
- Primary controls have accessible labels for screen readers.

## Di luar ruang lingkup versi 1

- Google accounts and synchronization.
- List sharing and collaboration.
- Notifications and real due dates.
- Subtasks, attachments, and calendar integration.

## Arah berikutnya

Add custom lists, due dates, search, and sign-in with cross-device sync.

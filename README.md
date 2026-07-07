# Gestion Projet

Gestion Projet is a local-first project tracking app built with React, TypeScript, Vite, Tailwind CSS, and Zustand. It is designed for personal project follow-up without a backend: projects, tasks, questions, deliverables, notes, milestones, and time entries are stored in the browser.

The app is organized around one active project at a time, with global search and JSON backup tools available from the main shell.

## Features

- **Focus**: daily overview of active projects, urgent tasks, blocked work, unanswered questions, and stale information.
- **Board**: Kanban-style task board with drag and drop, task details, tags, status, priority, size, due dates, and checklists.
- **Backlog**: structured project backlog for tasks, questions, and deliverables.
- **Notes**: one Markdown workspace per project, with GitHub-flavored Markdown, alerts, code highlighting, Mermaid diagrams, and embedded image assets.
- **Temps**: time tracking by project and task, milestone timeline, daily recap, and activity reporting over a selected date range.
- **Global search**: searches notes, tasks, questions, and deliverables across projects.
- **Import/export**: downloads and restores a JSON backup, including Markdown image assets.

## Data Model

The main entities are:

- **Projects**: the top-level workspace unit, including name and color.
- **Tasks**: board/backlog items with column, order, completion state, tags, priority, size, due date, and checks.
- **Questions**: open or answered project questions, including recipient and answer content.
- **Deliverables**: project outputs with description, type, version, and status metadata.
- **Notes**: Markdown content attached to a project.
- **Tags**: reusable labels shared across tasks.
- **Relations**: links between entities.
- **Time entries and milestones**: tracked work and planning markers.

All persisted data is stored in IndexedDB through `idb-keyval` and `zustand/middleware` persistence. There is no API server, database service, or authentication layer.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Build the production bundle:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## Scripts

| Command        | Description                                                            |
| -------------- | ---------------------------------------------------------------------- |
| `pnpm dev`     | Start Vite in development mode.                                        |
| `pnpm build`   | Run TypeScript project builds, then create the Vite production bundle. |
| `pnpm preview` | Serve the built app locally.                                           |
| `pnpm lint`    | Run Biome checks on `src/`.                                            |
| `pnpm format`  | Format `src/` with Biome.                                              |
| `pnpm check`   | Run Biome checks and apply safe fixes in `src/`.                       |

## Application Structure

```text
src/
  components/
    backlog/     Backlog view and detail panels
    board/       Kanban board, columns, cards, and card details
    focus/       Daily focus dashboard and project/task summaries
    layout/      App shell, project selector, search, tags, import/export
    notes/       Markdown note list, editor, renderer, and image handling
    shared/      Shared entity detail, badges, links, and relation controls
    time/        Time entry forms, recap, milestones, and reports
    ui/          Reusable UI primitives
  hooks/         Read/write hooks around the stores
  lib/           Domain helpers for references, Markdown, Mermaid, relations, time
  models/        TypeScript domain models
  store/         Zustand slices, IndexedDB storage, migrations, import/export
```

Routes are defined in `src/router.tsx` and loaded lazily behind the app shell. The app uses hash routing, so static hosting works without server-side route rewrites.

## Persistence and Backups

Data is saved automatically in the browser's IndexedDB under versioned store keys. Backup files are exported from the toolbar as `gestion-projet-backup-YYYY-MM-DD.json`.

Importing a backup validates the store keys, applies available migrations, restores the data into IndexedDB, imports Markdown image assets, and reloads the app.

Because storage is browser-local, use export regularly before clearing site data, changing browsers, or moving to another machine.

## Technical Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- shadcn-style UI primitives
- Base UI dialogs and controls
- Zustand stores with IndexedDB persistence
- DnD Kit for drag and drop
- Biome for linting and formatting
- React Markdown, Remark/Rehype, Highlight.js, and Mermaid for notes

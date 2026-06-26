# Job Tracker AI

Kanban-style job application tracker built with React + Vite. Runs fully in the browser with IndexedDB — no backend needed.

## Run

```bash
npm install      # first time only
npm run dev      # starts at http://localhost:5200
```

App always runs on **port 5200** (`strictPort: true` — fails fast if port is taken).

## Features

- **Kanban board** — drag-and-drop cards across 6 columns: Wishlist → Applied → Follow-up → Interview → Offer → Rejected
- **Job cards** — company, role, location (remote / on-site / hybrid), priority (high / medium / low), notes, applied date
- **Dashboard** — stats overview across all stages
- **Archive** — soft-delete jobs, restore or permanently delete
- **Sidebar** — filter and sort (newest / oldest / company A-Z)
- **Persistent storage** — IndexedDB via `idb`, survives page refresh

## Stack

| Layer | Library |
|---|---|
| UI | React 18 |
| Drag & Drop | @dnd-kit/core |
| Storage | IndexedDB (idb) |
| Styles | Tailwind CSS 3 |
| Build | Vite 5 |

## Project Structure

```
src/
  App.jsx          # root, routing between board/dashboard/archive
  main.jsx         # entry point
  constants.js     # column definitions, priority/location styles
  db.js            # IndexedDB read/write helpers
  components/
    Board.jsx      # kanban board container
    Column.jsx     # droppable column
    JobCard.jsx    # draggable job card
    JobModal.jsx   # add/edit job form
    Dashboard.jsx  # stats view
    Archive.jsx    # archived jobs view
    Sidebar.jsx    # filters + sort
    Header.jsx
    Footer.jsx
    ConfirmDialog.jsx
  hooks/
    useJobs.js     # all job state + CRUD logic
```

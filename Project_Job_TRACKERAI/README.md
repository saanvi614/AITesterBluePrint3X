# Job Tracker — AI-Powered Kanban Job Board

A local-first, no-backend Kanban board for tracking job applications. Built with React + Vite + Tailwind CSS.

**Live App:** [swati-job-tracker.vercel.app](https://swati-job-tracker.vercel.app)

---

## Features

- **6 Kanban columns** — Wishlist → Applied → Follow-up → Interview → Offer → Rejected
- **Drag & drop** — move cards between columns or reorder within a column
- **Add / Edit / Delete** jobs with a modal form
- **Search** by company or role name
- **Sort** manually, by newest, or oldest applied date
- **Dark mode** toggle
- **Export / Import** backup as JSON
- **IndexedDB persistence** — data survives page refreshes, no server needed
- **Resume autocomplete** — datalist from previously used resume names

## Tech Stack

| Tool | Version |
|------|---------|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 3 |
| @dnd-kit/core + sortable | drag-and-drop |
| idb | IndexedDB wrapper |

## Project Structure

```
src/
  App.jsx                 root state and all handlers
  constants.js            6 COLUMNS array with colour tokens
  index.css               Tailwind directives + thin scrollbars
  lib/db.js               getAll / put / delete / clear
  utils/helpers.js        generateId, daysSince, todayISO, formatDate
  components/
    Header.jsx            search, sort, theme, export/import, add-job
    KanbanBoard.jsx       DndContext + DragOverlay + column grid
    KanbanColumn.jsx      useDroppable + SortableContext
    JobCard.jsx           useSortable + card UI
    JobModal.jsx          add/edit form with validation
    ConfirmDialog.jsx     delete confirmation dialog
```

## Job Data Model

| Field | Type | Notes |
|-------|------|-------|
| id | string | auto-generated |
| company | string | required |
| role | string | required |
| status | string | column id |
| linkedinUrl | string | optional |
| resumeUsed | string | optional, autocomplete |
| dateApplied | ISO string | defaults to today |
| salaryRange | string | optional |
| notes | string | optional |
| order | number | for manual sort |
| createdAt / updatedAt | ISO string | auto-set |

## Run Locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Build

```bash
npm run build
# Output in dist/
```

---

Made by **@swati Jadhav**

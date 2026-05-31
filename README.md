# TaskFlow

A browser-based productivity app for managing daily tasks, tracking time, and reviewing your work output. No backend, no account, no setup. Everything runs in your browser and persists via localStorage.

## Links

* Live Demo: Coming soon
* Portfolio Website: Coming soon

## Screenshots

### Dashboard

![TaskFlow dashboard showing task management, timers, and task organization](./assets/readme/dashboard.webp)

### Analytics

![TaskFlow analytics dashboard with productivity curve and daily hours heatmap](./assets/readme/analytics.webp)

### Mobile View

![TaskFlow mobile responsive interface](./assets/readme/mobile.webp)

## Stack

* React 19
* Vite 8
* TailwindCSS v4
* clsx
* Browser localStorage for persistence
* No backend required

## Features

* Task creation, editing, and deletion
* Per-task timer with wall-clock accuracy
* Target duration tracking with live progress
* Task pinning and priority management
* Reusable task templates with one-click import
* Analytics dashboard with productivity curve
* Daily hours heatmap
* Date range filtering with a custom calendar picker
* CSV and JSON export
* Light and dark themes
* Offline-first, no account required

## Overview

TaskFlow lets you create tasks, run a per-task timer, set target minutes, and track how much time you actually spent. It filters tasks by date range, lets you pin important ones, and gives you an analytics view with a productivity chart and daily hours heatmap.

You can save reusable task templates and import them into any day. Tasks can be exported as CSV or JSON. The app supports light and dark themes, works offline, and loads instantly.

## Architecture Notes

State management is handled through custom React hooks.

Task and template data are synchronized with localStorage using batched writes inside `requestAnimationFrame` to avoid layout thrashing during timer ticks.

Timer tracking relies on wall-clock calculations rather than interval counts. Each task stores a `timerStartedAt` timestamp and a `baseSpentSeconds` value. On every tick, elapsed time is computed as `Date.now() - timerStartedAt`, so the timer catches up correctly after tab switches and page refreshes without drifting.

Daily time totals are stored separately in `taskflow-daily-time` rather than being derived from task data. This is necessary because a single task can span multiple calendar days, and the analytics view needs accurate per-day breakdowns.

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

To build for production:

```bash
npm run build
```

## Project Structure

```text
src/
  components/
  features/
  hooks/
  pages/
  utils/

public/
  theme-init.js
```

Key folders:

* `components/`: reusable UI components
* `features/`: task and analytics logic
* `hooks/`: custom React hooks
* `pages/`: page-level components
* `utils/`: storage, export, date, and theme helpers

Key files worth knowing:

* `src/pages/Home.jsx`: main page, wires everything together
* `src/hooks/useTasks.js`: task and template management
* `src/hooks/useTaskTimer.js`: timer state and wall-clock calculations
* `src/hooks/useCompletionNotifier.js`: completion notifications
* `src/features/tasks/taskHelpers.js`: filtering and sorting utilities
* `src/utils/dailyTimeStorage.js`: daily time tracking
* `src/index.css`: global styles and design tokens

## Views

* **All Tasks**: create and manage tasks with filters, sorting, pagination, and date range selection
* **Saved Tasks**: build a reusable task library and import tasks into any day
* **Analytics**: review productivity trends and daily activity breakdowns
* **Export**: preview and export task data as CSV or JSON
* **Guide**: quick reference for available features
* **Account**: privacy information and planned v2 features

## Code Style

Prettier and ESLint are configured. Run both before committing:

```bash
npm run format:prettier
npm run format:eslint
```

Config files:

* `.prettierrc`
* `eslint.config.js`

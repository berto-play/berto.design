# Log — Daily Management App

A private PWA for logging daily observations across four professional relationships. Built to run from a bookmark or home screen — no server, no backend, no accounts.

---

## What it is

A daily log tool that lets you rate observable behaviors across four subjects (Direct Report, Self/360, PM, Leadership), track trends over time, and surface a quick verdict on each person's trajectory. It also stores a leadership brief for reference before key conversations.

---

## Architecture

### No framework. No build step.

Three files do all the work:

| File | Purpose |
|------|---------|
| `index.html` | Shell — one `<div id="app">`, loads CSS and JS |
| `app.js` | All logic, all rendering (~1,300 lines) |
| `style.css` | All styles (~1,200 lines) |
| `sw.js` | Service worker — network-first caching |
| `manifest.json` | PWA manifest — enables "Add to Home Screen" |

The app renders by writing HTML strings into `#app` via a single `render()` function. There is no virtual DOM, no component tree, no state reactivity — just functions that produce HTML and re-render the screen when something changes.

### Routing

One `state` object tracks the current view and all in-flight data:

```js
const state = {
  view: 'lock',       // which screen is shown
  data: null,         // all sessions loaded from storage
  draft: null,        // in-progress assessment
  histFilter: 'today',
  histDetail: null,   // null = dashboard overview, subjectId = drill-down
};
```

Screens are plain functions (`viewLock`, `viewHome`, `viewAssess`, `viewHistory`, etc.). Navigation is just calling one of those functions and updating `state.view`. No router library.

### PWA / Offline

The service worker uses a **network-first** strategy:

1. Try to fetch fresh from the network
2. On success — update the cache, return the response
3. On failure (offline) — return the cached version

GitHub API calls are never intercepted by the service worker. The cache name (`log-v9`) is bumped on each deploy to force the browser to reinstall the worker and clear stale files.

---

## Data

### Storage model

All data lives in two places simultaneously:

| Location | What's stored |
|----------|--------------|
| `localStorage` | PIN hash, code names (labels), GitHub credentials, current sessions, last-known GitHub SHA |
| GitHub private repo | `data.json` — sessions array + code names (source of truth when online) |

`data.json` structure:
```json
{
  "sessions": [...],
  "labels": { "dr": "...", "me": "...", "pm": "...", "boss": "..." },
  "pendingSync": false
}
```

### Read / write flow

- **On login** — `loadData()` fetches `data.json` from GitHub, saves to localStorage. If code names are found in the file and not on the device, they are restored automatically.
- **On every save** — `saveData()` writes to localStorage immediately, then attempts a GitHub write. If the write fails (offline), `pendingSync: true` is flagged and retried on next login.
- **Local-only mode** — if no GitHub token is set, all data stays in localStorage only.

### Session schema

```json
{
  "id": "uuid-v4",
  "date": "YYYY-MM-DD",
  "subject": "dr | me | pm | boss",
  "ratings": {
    "framing": "Solid",
    "execution": "Strong",
    ...
  },
  "note": "optional one-line context"
}
```

---

## Auth

PIN is hashed with SHA-256 before storage — the raw PIN never touches localStorage:

```js
SHA-256("log-v1-" + pin)  →  stored as pin_hash
```

The salt prefix (`log-v1-`) is baked in to prevent reuse of hash tables from other apps. On each unlock attempt, the entered PIN is hashed and compared to the stored hash.

---

## Assessment model

Four subjects, each with their own criteria set:

| Subject | ID | Areas |
|---------|-----|-------|
| Direct Report | `dr` | Problem Framing, Design Execution, Presentation, Feedback Reception, Workload Management |
| Self / 360 | `me` | Speed & Output, Process Ownership, Proactiveness, Demanding Clarity, DR Verdict, Product Challenge, Right Stakeholders, Blurred Lines |
| PM | `pm` | Brief Quality, Timeliness, Unblocking, Prioritisation, Alignment |
| Leadership | `boss` | Clarity of Expectations, Quality of Feedback, Decision Support, Access & Availability, Air Cover |

Each area has:
- A question (what you are observing)
- Three observable signals (concrete behaviors to look for)
- A rating: `Not yet / Developing / Solid / Strong`

Ratings map to numeric values (0–3) for averaging and trend calculation.

### Verdict logic

```
avg ≥ 2.0  →  Growing
avg ≥ 1.0  →  Not Sure
avg < 1.0  →  Flag a Concern
```

Requires at least 2 rated areas to produce a verdict.

---

## Responsive behavior

The assessment screen adapts based on screen width (`window.innerWidth`):

- **Desktop (≥ 768px)** — all areas fully expanded simultaneously. Signals and rating buttons visible inline. No interaction needed to see everything.
- **Mobile (< 768px)** — compact list of areas. Tap a row → bottom sheet slides up from the bottom with signals and rating buttons.

---

## Cross-device setup

On a new device, entering your GitHub token in the setup form triggers an automatic fetch of `data.json`. If the file contains saved code names, the form pre-fills them — you only need to set a PIN to complete setup.

Code names are written to `data.json` on every save, so they stay in sync with the private repo automatically.

---

## Code names / privacy

All four subjects are referenced by code names you choose at setup. These are:

- Stored in `localStorage` (per device)
- Synced to your **private** GitHub repo inside `data.json`
- Never present in the public source code

The app source code (`berto-play/berto.design`) is public. The data repo (`berto-play/berto-log-data`) is private. No real names appear anywhere in the public repo.

---

## Deployment

Hosted on **GitHub Pages** from the `main` branch of `berto-play/berto.design`. No build process — the files are served as-is.

To deploy a change:
1. Edit `app.js` / `style.css`
2. Bump the cache name in `sw.js` (e.g. `log-v9` → `log-v10`) so the browser reinstalls the service worker
3. Push to `main`
4. GitHub Pages serves the updated files within ~1 minute

---

## File map

```
berto.design/          ← public repo (GitHub Pages)
├── index.html         ← app shell
├── app.js             ← all logic and rendering
├── style.css          ← all styles
├── sw.js              ← service worker
├── manifest.json      ← PWA manifest
└── icon.svg           ← app icon

berto-log-data/        ← private repo (data only)
└── data.json          ← sessions + labels
```

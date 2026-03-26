# PRD: Daily Management Log

## Overview
A mobile-first PWA for a design lead to log daily observations across four relationships — direct report, self (360), PM, and leadership — building an evidence base for honest, structured conversations with their stakeholder. All personal names are replaced with code names configured at setup. No PII in public code.

---

## Deployment
- **App code**: public repo (`berto-play/berto.design`) — no PII
- **Data**: private repo (`berto-play/berto-log-data`) — synced via GitHub API
- **Hosting**: GitHub Pages
- **Access**: PIN-protected on every device

---

## Users

| Role | Description |
|---|---|
| Manager (primary user) | Logs sessions, reviews patterns, generates discussion guides |
| Stakeholder | Receives discussion guide output in 1:1 conversations |

---

## Four Assessment Tracks

| Track | Role | Purpose |
|---|---|---|
| Direct Report | Employee being managed | Growing or not? Evidence for stakeholder verdict |
| Myself (360) | Self-assessment | Am I meeting stakeholder expectations? |
| PM | Collaborator (not managed) | Accountability log — record of contribution and gaps |
| Leadership | Manager / stakeholder | Relationship tracking — clarity, feedback quality, support |

Code names for all four are set at first setup and stored in the private data repo. They never appear in the public codebase.

---

## Assessment Framework

### Ratings (all tracks)
| Rating | Meaning |
|---|---|
| Not yet | Pattern of gaps, not meeting the bar |
| Developing | Inconsistent, some progress |
| Solid | Consistently meeting expectations |
| Strong | Exceeding, leading without prompting |

### Verdict (calculated per session)
- **Growing** — average rating ≥ 2.0 (Solid+)
- **Not Sure** — average rating 1.0–2.0
- **Flag a Concern** — average rating < 1.0

Verdict is calculated from the session's rated areas. Requires at least 2 areas rated.

---

## Criteria by Track

### Direct Report (5 areas)
| Area | Question |
|---|---|
| Problem Framing | Are they framing before executing? |
| Design Execution | Are they executing well within given scope? |
| Presentation & Reviews | Are they presenting work effectively? |
| Feedback Reception | Are they receiving and applying feedback? |
| Workload Management | Are they handling scope independently? |

### Myself — 360 (8 areas, based on stakeholder expectations)
| Area | Question |
|---|---|
| Speed & Output | Am I moving fast enough? |
| Process Ownership | Am I running reviews with structure? |
| Proactiveness | Am I driving the work or waiting to be told? |
| Demanding Clarity | Am I naming blockers and demanding inputs? |
| Direct Report Verdict | Do I have a clear read on my direct report? |
| Product Challenge | Am I pushing back when something is off? |
| Right Stakeholders | Am I using the right people for the right things? |
| Blurred Lines | Am I clear on where design ends and product starts? |

### PM (5 areas — accountability log)
| Area | Question |
|---|---|
| Brief Quality | Are briefs clear and complete before design starts? |
| Timeliness | Are inputs arriving when needed? |
| Unblocking | Are they removing blockers quickly? |
| Prioritisation | Are priorities clear and stable? |
| Alignment | Are PM and design in sync? |

### Leadership (5 areas — relationship tracking)
| Area | Question |
|---|---|
| Clarity of Expectations | Do I know what is expected of me? |
| Quality of Feedback | Is feedback useful and direct? |
| Decision Support | Are decisions being made when needed? |
| Access & Availability | Can I get time with leadership when needed? |
| Strategic Alignment | Are we on the same page about direction? |

---

## Session Flow

```
Home → tap subject card
  → Assessment screen (accordion cards)
    → tap area to expand
    → read signals (reference only)
    → tap rating: Not yet / Developing / Solid / Strong
    → card closes, dot updates
  → optional one-line note
  → Save session
→ Back to Home
```

Multiple sessions per day per subject are supported. No minimum areas required to save (at least 1 rating needed).

---

## Progress Tracking

- **Days logged**: count of unique dates with at least one session (no countdown)
- **Per subject**: total session count + date of last session
- **Verdict on home**: calculated from most recent session per subject

---

## Report & Export

### Discussion Guide (per subject)
Structured talking points formatted for stakeholder communication style:
- Direct, short sentences
- Makes a call on the verdict
- Names gaps explicitly
- Ends with a clear ask
- Written to be said out loud, not handed over

### Export options
- **Copy to clipboard** — for pasting into messages or notes
- **Download as .txt** — named `log-[codename]-[date].txt`

### Stakeholder communication style (shapes report tone)
- Thinks out loud, expects you to keep up
- Direct but not harsh
- Asks questions to draw you out — wants opinions, not summaries
- Respects directness: "I need X by Thursday" not "it would be helpful if"
- Uses "right?" to check alignment — engage, don't just agree
- Gives context once, expects you to run with it
- Comfortable with ambiguity, impatient with paralysis
- Appreciates naming what you don't know rather than working around it

---

## Data Management

- **Delete session**: available in History — removes single session, syncs to GitHub
- **Wipe all data**: available in Report screen — clears all sessions, resets to empty state
- **Offline**: sessions save to localStorage immediately, sync to GitHub when online. Pending sync indicator shown on home.

---

## Data Model

```json
{
  "sessions": [
    {
      "id": "timestamp-string",
      "date": "2026-03-26",
      "subject": "dr | me | pm | boss",
      "ratings": {
        "area_id": "Not yet | Developing | Solid | Strong"
      },
      "note": "optional one-line note"
    }
  ],
  "pendingSync": false
}
```

Code names stored in `localStorage` on each device, not in `data.json`.

---

## Tech Stack

| | |
|---|---|
| Framework | Vanilla JS + CSS (no build step) |
| Auth | 4-digit PIN, SHA-256 hashed, localStorage |
| Data | GitHub API → private repo `data.json` |
| Offline | localStorage queue, syncs on next open |
| PWA | manifest.json + service worker |
| Deploy | GitHub Pages (public repo, private data) |
| Install | Safari "Add to Home Screen" |

---

## Non-Functional Requirements
- Mobile-first, iOS Safari primary
- Offline capable — logs queue without internet
- Session save in under 30 seconds
- No external dependencies, no build step
- Private data — nothing leaves the device until explicitly synced

---

## Out of Scope (V1)
- Stakeholder direct access to app or data
- Auto-analytics or trend charts
- Multi-user or team-wide use
- Notification reminders
- Custom criteria editing in-app

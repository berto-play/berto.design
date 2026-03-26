# PRD: Daily Management Log

## Overview
A mobile-first daily logging app for a manager to track observable signals across two parallel tracks — their direct report's growth and their own management quality — building toward an assessment verdict and a structured discussion guide for a stakeholder.

---

## Problem
Without a consistent logging system, manager assessments are based on recency bias and gut feel. This app creates a 30-second daily ritual after each interaction, capturing signals across defined criteria so the verdict is evidence-based and the discussion with the stakeholder is grounded and clear.

---

## Users

| Role | Person | Purpose |
|---|---|---|
| Primary user | Manager | Log daily, review patterns, prepare for Joe |
| Subject | Anna | Being assessed across 5 domains |
| Stakeholder | Joe | Receives discussion guide, not the raw data |

---

## Two Tracks

**Anna Track** — Is she growing?
**My Track** — Am I managing well?

Both logged per interaction. Both feed the final report.

---

## Domains & Signals

### 1. Problem Framing

| Signal | Track | Type |
|---|---|---|
| Defined requirements before opening Figma | Anna | Positive |
| Jumped to screens before problem was framed | Anna | Negative |
| Asked clarifying questions | Anna | Positive |
| Provided clear frame before handing work | Me | Positive |
| Handed work without context | Me | Negative |

### 2. Design Execution

| Signal | Track | Type |
|---|---|---|
| Strong visual detail and UI precision | Anna | Positive |
| Deviated from brief | Anna | Negative |
| Worked within the given frame | Anna | Positive |
| Leveraged her visual strengths | Me | Positive |
| Gave too much open scope | Me | Negative |

### 3. Presentation & Reviews

| Signal | Track | Type |
|---|---|---|
| Led with insight, not research dump | Anna | Positive |
| Lost the room | Anna | Negative |
| Owned the meeting format | Me | Positive |
| Let the review drift | Me | Negative |

### 4. Feedback Reception

| Signal | Track | Type |
|---|---|---|
| Received feedback without defensiveness | Anna | Positive |
| Repeated same pattern after feedback | Anna | Negative |
| Gave direct, honest feedback | Me | Positive |
| Over-softened — message disappeared | Me | Negative |

### 5. Workload Management

| Signal | Track | Type |
|---|---|---|
| Handled scope without hand-holding | Anna | Positive |
| Got lost in complexity | Anna | Negative |
| Protected her from messy process | Me | Positive |
| Overloaded her with strategy/context | Me | Negative |

---

## Daily Log Flow

```
Open app
  → Tap "Log Interaction"
  → Pick track: Anna / Me / Both
  → Pick relevant domain(s)
  → Tap signals that fired today
  → Optional: one-line note
  → Save (< 30 seconds)
```

---

## Verdict

Three states, shown as a running indicator as signals accumulate:

- **Growing** — consistent positive signals, patterns improving
- **Not Sure** — mixed signals, no clear direction yet
- **Flag a Concern** — repeated negatives, no improvement after feedback

---

## Stakeholder: Joe's Communication Style

Understanding how Joe communicates is essential to formatting the discussion guide correctly. The output must match his expectations, not feel like a report being handed up.

**How he thinks and talks:**
- Thinks out loud in real time. He does not deliver polished briefs — he builds thinking as he speaks. Track it, ask when lost, push back when something does not land.
- Direct but not harsh. Will tell you something is underdone without dressing it up. Casual, not aggressive.
- Asks questions to draw you out — "What do you think?" "How was that session compared to yesterday?" He wants your opinion, not a summary. Silence or vague answers frustrate him.
- Respects people who demand things. "I need X by Thursday" lands better than "it would be helpful if maybe." Be open, honest, clear, and direct about what you need.
- Uses "right?" constantly — not a question, it means: are you following me, are you aligned, do you see what I see. Engage with it, don't just say yes.
- Gives context once and expects you to run with it. He does not want to repeat himself.
- Comfortable with ambiguity, impatient with paralysis. Make a call, go, adjust. Do not wait for perfect clarity.
- Appreciates honesty about what you do not know. Name the gap clearly instead of working around it quietly.

---

## Report: Discussion Guide for Joe

This is not a written document to send. It is a set of talking points structured for a real-time conversation with Joe. The format matches how he communicates: direct, opinionated, makes a call, names gaps clearly.

### Format

```
Verdict on Anna: [Growing / Not Sure / Flag a Concern]
Here is what I am seeing, right?

Problem Framing: [one direct sentence — pattern, not list]
Execution: [one direct sentence]
Presentation: [one direct sentence]
Feedback: [one direct sentence]

The pattern overall: [one sentence that lands the verdict]

On my side:
  - What I did: [2–3 bullets, specific]
  - Where I fell short: [1–2 bullets, named clearly, no softening]

What I need from you: [one clear ask — a decision, a deadline, a resource]

One thing I am not sure about yet: [name the gap directly]
```

### Tone rules for this output
- Make the call. Do not hedge the verdict with "it is hard to say."
- Short sentences. No filler.
- If there is a gap in the data, name it — "I only have 4 data points on this, so take it with that in mind."
- End with a clear ask or next step. Joe responds to "I need X" not "what do you think we should do."
- Write it as if you are about to say it out loud, not hand it to someone to read.

---

## Non-Functional Requirements

- Mobile-first, iOS primary
- Offline capable — log without internet
- Daily log completed in under 30 seconds
- Maximum 3 taps to log a signal
- Private — nothing shared until explicitly exported

---

## Out of Scope (V1)

- Multi-person management (Anna is the only subject)
- Joe having direct app access
- Auto-analytics or dashboards
- Team-wide rollout

---

## Open Questions

1. What is the hard deadline for the verdict? (Joe said "a few weeks" — specific date?)
2. Should the verdict be suggested by the app based on signal patterns, or always set manually?

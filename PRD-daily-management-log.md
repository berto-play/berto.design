# PRD: Daily Management Log

## Overview
A mobile-first daily logging app for a manager to track observable signals across two parallel tracks — their direct report's growth and their own management quality — building toward an assessment verdict and a structured discussion guide for a stakeholder.

---

## Problem
Without a consistent logging system, manager assessments are based on recency bias and gut feel. This app creates a 30-second daily ritual after each interaction, capturing signals across defined criteria so the verdict is evidence-based and the discussion with the stakeholder is grounded and clear.

---

## Users

| Role | Purpose |
|---|---|
| Manager (primary user) | Log daily, review patterns, prepare for stakeholder conversation |
| Direct Report (subject) | Being assessed across 5 domains |
| Stakeholder | Receives discussion guide, not the raw data |

---

## Two Tracks

**Direct Report Track** — Is this person growing?
**Manager Track** — Am I managing well?

Both logged per interaction. Both feed the final report.

---

## Domains & Signals

### 1. Problem Framing

| Signal | Track | Type |
|---|---|---|
| Defined requirements before jumping to execution | Direct Report | Positive |
| Jumped to execution before problem was framed | Direct Report | Negative |
| Asked clarifying questions | Direct Report | Positive |
| Provided clear frame before handing work | Manager | Positive |
| Handed work without context | Manager | Negative |

### 2. Design Execution

| Signal | Track | Type |
|---|---|---|
| Strong attention to detail and precision | Direct Report | Positive |
| Deviated from brief | Direct Report | Negative |
| Worked within the given frame | Direct Report | Positive |
| Leveraged their core strengths | Manager | Positive |
| Gave too much open scope | Manager | Negative |

### 3. Presentation & Reviews

| Signal | Track | Type |
|---|---|---|
| Led with insight, not research dump | Direct Report | Positive |
| Lost the room | Direct Report | Negative |
| Owned the meeting format | Manager | Positive |
| Let the review drift | Manager | Negative |

### 4. Feedback Reception

| Signal | Track | Type |
|---|---|---|
| Received feedback without defensiveness | Direct Report | Positive |
| Repeated same pattern after feedback | Direct Report | Negative |
| Gave direct, honest feedback | Manager | Positive |
| Over-softened — message disappeared | Manager | Negative |

### 5. Workload Management

| Signal | Track | Type |
|---|---|---|
| Handled scope without hand-holding | Direct Report | Positive |
| Got lost in complexity | Direct Report | Negative |
| Protected them from messy process | Manager | Positive |
| Overloaded them with strategy/context | Manager | Negative |

---

## Daily Log Flow

```
Open app
  → Tap "Log Interaction"
  → Pick track: Direct Report / Me / Both
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

### Verdict Logic

Assessment window: 7 days.

The app uses a **hybrid approach**:
- At day 5, the app generates a suggested verdict based on signal ratios across all domains
- The manager reviews and confirms or overrides it
- The suggestion exists to create a forcing function — reacting to "no, that's not right" is faster and sharper than arriving at a blank field

Suggested verdict is calculated from the ratio of positive to negative signals per track, weighted slightly toward pattern consistency over raw count.

---

## Stakeholder Communication Style

Understanding how the stakeholder communicates is essential to formatting the discussion guide correctly. The output must match their expectations, not feel like a formal report being handed up.

**How they think and communicate:**
- Thinks out loud in real time. Does not deliver polished briefs — builds thinking as they speak. Track it, ask when lost, push back when something does not land.
- Direct but not harsh. Will say something is underdone without dressing it up. Casual, not aggressive.
- Asks questions to draw you out. Wants your opinion, not a summary. Silence or vague answers are frustrating.
- Respects directness. "I need X by Thursday" lands better than "it would be helpful if maybe." Be open, honest, and clear about what you need.
- Checks alignment constantly — expect "right?" as a signal to engage, not just agree.
- Gives context once and expects you to run with it. Does not want to repeat themselves or be pulled back in for context already given.
- Comfortable with ambiguity, impatient with paralysis. Make a call, go, adjust. Do not wait for perfect clarity.
- Appreciates honesty about what you do not know. Name the gap clearly instead of working around it quietly.

---

## Report: Discussion Guide for Stakeholder

This is not a written document to send. It is a set of talking points structured for a real-time conversation. The format matches how the stakeholder communicates: direct, opinionated, makes a call, names gaps clearly.

### Format

```
Verdict on [Direct Report]: [Growing / Not Sure / Flag a Concern]
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
- End with a clear ask or next step. The stakeholder responds to "I need X" not "what do you think we should do."
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

- Multi-person management (one direct report only)
- Stakeholder having direct app access
- Auto-analytics or dashboards
- Team-wide rollout

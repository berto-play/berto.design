# MD Design System — Session Index

**Date:** March 29, 2026
**Branch:** `claude/medicilio-design-system-vZnwX`
**Repo:** `berto-play/berto.design`

---

## What was done and why

### 1. PII extraction from `berto.design` app

The public app source (`app.js`, `README.md`, `PRD-daily-management-log.md`) contained hardcoded personally identifiable information that contradicted the app's own stated privacy guarantee ("No real names appear anywhere in the public repo").

| What was removed | Where | Why |
|-----------------|-------|-----|
| `"Eagle"` codename in memo comment and rules text | `app.js` lines 108, 118 | Hardcoded codename for a specific real person, baked into public source alongside identifying context |
| `boss: 'Eagle'` default codename | `app.js` line 459 | Replaced with generic `'Boss'` |
| `berto-play/berto-log-data` default repo | `app.js` lines 167, 434, 1204, 1240 | Hardcoded GitHub org/repo name identifies the app owner. Cleared to blank so new installs don't pre-fill someone else's repo. |
| `berto-play/*` org references | `README.md`, `PRD-daily-management-log.md` | Same reason — replaced with `your-org/*` placeholders |

---

### 2. MD Design System — Layer 0 token foundation

**Why this was built:**
The DS PRD identifies the absence of a canonical token foundation as the root cause of visual inconsistency across RPM and Home Medicine. Tables, buttons, border radii, and filters are all inconsistent because there is no shared source of truth that components can reference.

**What was built:**
A [Style Dictionary](https://amzn.github.io/style-dictionary/) package in `md-ds/` that outputs platform-ready tokens from a single JSON source:

| Token file | Contents |
|-----------|----------|
| `tokens/color.json` | Brand, interactive, feedback, surface, text, border, clinical |
| `tokens/typography.json` | Family, weight, 12-step size scale, line-height, letter-spacing |
| `tokens/spacing.json` | 4px base scale — `space/1` = 4px through `space/24` = 96px |
| `tokens/radius.json` | Named radii: card, input, button, modal, pill, full |
| `tokens/elevation.json` | Shadow stack: none → sm → md → lg → modal → tooltip |
| `tokens/motion.json` | Duration (5 steps) + easing curves (enter / exit / spring) |

**Why Style Dictionary:**
The PRD confirms a library-agnostic token contract is required — engineering must be able to consume tokens regardless of whether they use Ant Design, MUI, or Kitten. Style Dictionary produces CSS custom properties, Android XML, and Swift UI constants from the same source. When the component library changes, only the theme mapping layer changes. These token files are not touched.

**Decisions that informed the structure (all CONFIRMED in the PRD):**
- Token-first architecture — tokens define the system, components are expressions of tokens
- Library-agnostic — `color/interactive/primary` not `ant-blue-6`
- Semantic, platform-agnostic naming: `category/role/variant`
- `color/clinical/*` added as a stable group not subject to brand changes

**What is explicitly NOT final:**
- `color/brand/*` values are placeholder. The rebranding project (stalled since January 2023) is listed as an open decision in the PRD. Do not finalize brand color tokens until Joe / Mattia confirm whether it is dead or active.

---

### 3. Company name updated Medicilio → MD

Applied across all files in `md-ds/` and the folder name itself.

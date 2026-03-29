# Medicilio Design Tokens — Layer 0

Token foundation for the Medicilio Design System. This is the single source of truth for color, typography, spacing, radius, elevation, and motion. Everything else in the system consumes these tokens. Nothing here is component-specific.

---

## Token naming convention

```
category/role/variant
```

| Category   | Format                  | Example                     |
|------------|-------------------------|-----------------------------|
| Color      | `color/[group]/[name]`  | `color/interactive/primary` |
| Typography | `font/size/[scale]`     | `font/size/body-md`         |
| Spacing    | `space/[scale]`         | `space/4`                   |
| Radius     | `radius/[name]`         | `radius/card`               |
| Elevation  | `elevation/[name]`      | `elevation/modal`           |
| Motion     | `motion/duration/[name]`| `motion/duration/normal`    |

Never use hex values, library-specific names, or component-specific names as token names. `ant-blue-6` works nowhere outside Ant Design. `color/interactive/primary` works everywhere.

---

## Outputs

| Platform | Output                          | Format                   |
|----------|---------------------------------|--------------------------|
| Web      | `build/css/variables.css`       | CSS custom properties    |
| Android  | `build/android/colors.xml`      | Android XML color values |
|          | `build/android/dimens.xml`      | Android XML dimensions   |
| iOS      | `build/ios/MedicilioTokens.swift` | Swift class             |

---

## Build

```bash
npm install
npm run build
```

Build a single platform:

```bash
npm run build:css
npm run build:android
npm run build:ios
```

---

## Token files

```
tokens/
├── color.json       — brand, interactive, feedback, surface, text, border, clinical
├── typography.json  — font family, weight, size, line-height, letter-spacing
├── spacing.json     — 4px base scale (space/1 = 4px, space/4 = 16px, …)
├── radius.json      — named radii for each component category
├── elevation.json   — shadow stack from none → modal
└── motion.json      — duration and easing curves
```

---

## Engineering integration

The engineering theme layer maps these tokens to whichever component library is in use (Ant Design, MUI, Kitten). When the library changes, only the theme mapping layer changes — these token files are untouched.

```
Medicilio tokens  →  Theme mapping layer  →  Ant Design / MUI / Kitten
```

CSS output is consumed directly by web without a library. iOS and Android outputs are consumed by platform-native apps.

---

## Status notes

- **Rebranding**: Token values marked "Pending rebranding confirmation" will be updated once the rebranding project (on hold since January 2023) is confirmed dead or active. Do not finalize `color/brand/*` until that decision is made.
- **Clinical colors**: `color/clinical/*` are stable and not subject to rebranding.

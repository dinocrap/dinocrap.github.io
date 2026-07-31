# dinocrap.github.io

Memento mori wallpaper, redrawn every morning by GitHub Actions and served
straight from this repo.

**Live:** https://dinocrap.github.io
**Image:** https://dinocrap.github.io/wallpaper.png

---

## What changed from the previous version

The old setup used Playwright to launch a headless Chromium and screenshot an
HTML page. It never worked, because of three path bugs:

| Where | Said | Actually was |
|---|---|---|
| `package.json` | `node scripts/generate-wallpaper.mjs` | file was at repo root |
| `generate-wallpaper.mjs` | read `scripts/wallpaper.html` | file was at repo root |
| `generate-wallpaper.mjs` | wrote `site/wallpaper.png` | workflow committed `wallpaper.png` at root |

The first one alone made every run fail instantly with "Cannot find module".
Even patched, the third meant the committed image would never change.

This version drops Playwright and Chromium entirely — the image is drawn
directly with [satori](https://github.com/vercel/satori) via `@vercel/og`.
No browser to install, ~33 packages, renders in about a second.

Rendering code is adapted from [Ti-03/remainders](https://github.com/Ti-03/remainders).

---

## Layout

```
wallpaper.config.json     ← the only file you normally edit
scripts/render.tsx        ← draws the PNGs
views/                    ← year-view.tsx, life-view.tsx
lib/                      ← date maths, types, built-in plugins
.github/workflows/daily.yml
index.html                ← the site at dinocrap.github.io
wallpaper.png             ← regenerated daily, committed by the Action
life.png
```

Because this is a **user** Pages site, GitHub serves the root of `main`
directly — the PNGs sit at the top level rather than in a `docs/` folder.

---

## Settings that must be right

**Settings → Pages** → Source: *Deploy from a branch*, Branch: **main**,
Folder: **/ (root)**.

**Settings → Actions → General** → Workflow permissions: **Read and write**.
Without this the Action renders the image but can't commit it.

---

## Configure

Edit `wallpaper.config.json` — on the GitHub website is fine. The workflow
re-renders on any change to it, so the new image appears within a minute.

| Field | Notes |
|---|---|
| `viewMode` | `"year"` (this year as dots) or `"life"` (80 years as weeks) |
| `birthDate` | `YYYY-MM-DD`. Only matters for life view |
| `timezone` | IANA name — currently `Europe/Vilnius` |
| `device` | `1206 × 2622` (iPhone 16 Pro) |
| `colors.current` | The accent — `#E89EB8` |
| `colors` | also `background`, `past`, `future`, `text` |
| `typography.fontSize` | Fraction of image width (0.035 ≈ 3.5%) |
| `layout` | Padding and dot spacing, all fractions |
| `plugins` | `quotes`, `habit-tracker`, `moon-phase` — set `enabled: true` |
| `renderBothViews` | Also writes the other view to `year.png` / `life.png` |

Run it locally if you want:

```bash
npm install
npm run generate
```

---

## Keeping the schedule alive

GitHub disables scheduled workflows on public repos after **60 days with no
repository activity**. Commits pushed by the built-in `GITHUB_TOKEN` are widely
reported not to count, so a self-committing workflow can still get switched off
— this is the most likely reason the previous version stopped on its own.
GitHub doesn't document exactly what counts as activity, so treat it as a
known risk rather than a certainty.

**Permanent fix:** create a fine-grained personal access token with
*Contents: Read and write* on this repo, then add it as a repository secret
named `WALLPAPER_PAT`. The workflow already looks for it — no edits needed.
Pushes then come from your account, which does count as activity.

**Or ignore it:** when it stops, the Actions tab shows an *Enable workflow*
button. One click, every couple of months.

---

## Phone setup

**iPhone** — Shortcuts → Automation → Time of Day, 07:00, **Run Immediately**
1. *Get Contents of URL* → `https://dinocrap.github.io/wallpaper.png`
2. *Set Wallpaper* → tap the **⌄** arrow, turn **off** "Show Preview"

**Android** — MacroDroid: Time of Day trigger → HTTP Request (GET, save
response to file) → Set Wallpaper (select that file).

Keep the phone time after the Action runs; 07:00 local is a safe gap.

If you get a stale image, GitHub's CDN is caching. Add a changing query string
— in Shortcuts, a *Format Date* action with format `yyyyMMddHH` appended as
`?v=…` does it.

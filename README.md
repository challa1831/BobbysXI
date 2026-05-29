# World Cup 2026 — Don Bobby's Club

A small offline-first website covering the FIFA World Cup 2026 trip: itinerary, full match schedule, a Bobby pose collection, and a page for each of the 10 teams being followed. Pure static HTML / CSS / JS — no build step, no framework, runs anywhere.

## Run it locally

Double-click **`index.html`** in this folder — it opens in your default browser. Nothing to install. With `cleanUrls` on, links work the same locally and on Vercel.

## Folder layout

```
World Cup 2026/
├── index.html           Hub / landing page
├── trip.html            Big trip — itinerary, map, roster, reservations
├── schedule.html        All WC 2026 group-stage fixtures
├── poses.html           Don Bobby pose collection
│
├── argentina.html  brazil.html  england.html  france.html
├── germany.html    japan.html   netherlands.html
├── portugal.html   spain.html   belgium.html
│
├── style.css            Shared stylesheet
├── app.js               Shared script (modals, weather)
│
├── vercel.json          Vercel config (clean URLs)
├── .gitignore
└── README.md
```

## Deploy with GitHub + Vercel

This repo is set up so a `git push` to GitHub auto-publishes via Vercel. One-time steps:

**1. Create a GitHub repo**

```bash
cd "World Cup 2026"
git init
git add .
git commit -m "Initial commit"
git branch -M main
gh repo create wc-2026 --public --source=. --push
```

(Or, without the `gh` CLI: create a repo on github.com, then `git remote add origin <url>` and `git push -u origin main`.)

**2. Connect to Vercel**

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Pick the `wc-2026` repo and click **Import**.
3. Framework preset: **Other** (Vercel will auto-detect static).
4. Output directory: leave blank (root).
5. Click **Deploy**.

That's it — Vercel gives you a `*.vercel.app` URL within ~30 seconds. Every future `git push` to `main` redeploys automatically.

**3. Optional: custom domain**

In the Vercel project → **Settings → Domains** → add your domain and follow the DNS instructions.

## Editing tips

- Site-wide colours / typography → `style.css`
- Interactive logic (modals, weather) → `app.js`
- Each page is self-contained HTML — edit directly
- The animated trip map and the Bobby pose gallery are inline `<svg>` + `<script>` blocks inside their respective pages

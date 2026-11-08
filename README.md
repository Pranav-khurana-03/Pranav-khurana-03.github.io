# Pranav Khurana — Engineering Portfolio

React 18+ / TypeScript / Vite / Tailwind v4 static site. Follows `BUILD_YOUR_OWN_PORTFOLIO.md`.

## Run
- `npm run dev` — local dev server
- `npm run build` — must pass before pushing (same command as the deploy)

## Where things go
- `src/data/portfolio.ts` — ALL content (text, links, projects). Edit this, not components.
- `public/glb/` — compressed 3D models (`npx @gltf-transform/cli draco in.glb out.glb`; new filename on every replace)
- `public/projects/` — project images (~1400 px wide, JPEG)
- `public/photo.jpg`, `public/resume.pdf` — portrait and resume
- `source-pdf/`, `papers/` — raw source material (kept local, not in the repo)
- `legacy/`, `visuals/` — earlier versions and standalone demos (kept local, not in the repo)

## Deploy
Repo `<username>.github.io`, Settings → Pages → Source: GitHub Actions, push to `main`.

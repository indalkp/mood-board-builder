# Mood Board Builder

Custom Wix Velo webapp for visual reference collection. Members create unlimited mood boards, drag-drop upload images, share read-only public links via slug.

**Live**: https://www.indalkp.com/mood-boards (after deploy)
**Architecture**: custom HTML embed → Velo HTTP function → Wix Media Manager + Wix CMS.

## What this demo proves

Built to showcase web app capability for client work. Demonstrates four production patterns in one project:

- Custom HTML / JavaScript embed inside Wix
- Velo backend (web modules + HTTP functions)
- Wix CMS schema + member-permissioned data
- Public share-link routing with auth bypass via `suppressAuth`

Same architecture pattern as KPZ Draw (github.com/indalkp/kpz-draw), scaled down to a 4-hour build.

## Repo layout

```
mood-board-builder/
├── bootstrap-embed.html        ← pasted into the Wix HTML Embed element on /mood-boards
├── src/                        ← frontend, served via jsDelivr CDN pinned to git tag
│   ├── main.js
│   ├── ui.js
│   └── api.js
└── velo/                       ← MIRROR of code that lives in Wix (paste these into Wix Editor)
    ├── backend/
    │   ├── moodBoardService.web.js
    │   └── http-functions.js
    ├── page-code-mood-boards.js
    └── cms-schema.md
```

## Deploy pipeline

```
GitHub repo (indalkp/mood-board-builder)
  └── tagged release (v0.X.Y)
        └── jsDelivr CDN caches tag
              └── Wix HTML Embed loads via VERSION constant in bootstrap-embed.html
                    └── Velo Page Code handles app ↔ Wix RPC bridge
                          └── Velo backend (moodBoardService.web.js) handles CRUD
                                └── Wix Media Manager + CMS collections store data
```

Identical pipeline shape to KPZ Draw — same `VERSION` bump on each release.

## Built by Indal KP

[indalkp.com](https://www.indalkp.com) · [indalkp@gmail.com](mailto:indalkp@gmail.com) · Studio: Kpz_Art

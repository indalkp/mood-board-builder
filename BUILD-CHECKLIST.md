# Mood Board Builder — Build Checklist

Run through this in order. Tick boxes as you go. Hard stop at hour 5 — ship what works.

---

## 0. Prep (5 min)

- [ ] All files in this folder confirmed (`README.md`, `bootstrap-embed.html`, `src/*`, `velo/*`)
- [ ] You are logged into github.com as `indalkp` in the browser
- [ ] You are logged into your Wix Editor in another tab
- [ ] You have `git` installed and accessible in PowerShell

---

## 1. GitHub repo init + first push (15 min)

Open PowerShell. Paste this whole block:

```powershell
cd C:\Users\ajayp\kp\mood-board-builder
git init
git add -A
git commit -m "v0.1.0: initial scaffold

- MoodBoards + MoodBoardImages CMS collections (schema in velo/cms-schema.md)
- Velo backend web module (CRUD)
- Velo HTTP function for image upload
- Page code with postMessage RPC bridge
- Frontend drag-drop + grid view + public share viewer"
git tag -a v0.1.0 -m "v0.1.0 -- initial release"
git branch -M main
```

Now go to https://github.com/new → create empty repo named `mood-board-builder`, public, **DO NOT initialize with README** (we already have one). Hit Create repository.

Back in PowerShell:

```powershell
git remote add origin https://github.com/indalkp/mood-board-builder.git
git push -u origin main
git push origin v0.1.0
```

GCM should handle auth silently (cached from KPZ Draw work).

Verify in browser at https://github.com/indalkp/mood-board-builder — README should render, tag v0.1.0 should appear.

---

## 2. Wait 2 min for jsDelivr cache (5 min, do other work)

Then verify the CDN picked up the tag:
- Open: https://cdn.jsdelivr.net/gh/indalkp/mood-board-builder@v0.1.0/src/main.js
- Should return JS code, not 404. If 404 → wait 60s, retry.

---

## 3. Create Wix CMS collections (20 min)

Open Wix Editor → Content Manager → Create Collection.
Use the schema in `velo/cms-schema.md`. Two collections: `MoodBoards`, `MoodBoardImages`. Set Custom Permissions exactly as documented.

- [ ] MoodBoards collection created with all fields
- [ ] MoodBoards permissions set to "Site member author"
- [ ] MoodBoardImages collection created with all fields
- [ ] MoodBoardImages permissions set to "Site member author"

---

## 4. Paste Velo backend code (10 min)

In Wix Editor's Velo file tree:

- [ ] Backend & Public → backend → create file `moodBoardService.web.js` → paste contents from `velo/backend/moodBoardService.web.js`
- [ ] Backend & Public → backend → create or open `http-functions.js` → paste/merge `post_uploadMoodBoardImage` from `velo/backend/http-functions.js`

(If you already have an `http-functions.js` for KPZ Draw, MERGE the new export into it — Wix only allows one `http-functions.js` per site.)

---

## 5. Create the /mood-boards page (15 min)

In Wix Editor:

- [ ] Pages panel → + Add Page → Blank → name it "Mood Boards" → URL slug `/mood-boards`
- [ ] Drop an HTML Embed element onto the page
- [ ] Click the embed → Properties → set ID to `moodBoardEmbed`
- [ ] Click "Set Code" → paste contents of `bootstrap-embed.html`
- [ ] Resize the embed to fill the page (e.g. 1200 × 800 or stretch to viewport)

---

## 6. Paste page code (10 min)

In Wix Editor, with the /mood-boards page open:

- [ ] Click the Velo `{ }` icon (bottom-left toolbar)
- [ ] Page Code panel → Mood Boards → paste contents of `velo/page-code-mood-boards.js`

---

## 7. Save + Preview (15 min)

- [ ] Click Save in the Editor
- [ ] Click Preview
- [ ] You should see the embed load → "Loading mood board builder..." → then either login prompt or your board list (if already logged in as a member)
- [ ] Click "+ New board", name it "Test Board"
- [ ] Drop an image onto the drop zone
- [ ] Click Share → confirm the public URL appears
- [ ] Open the public URL in incognito → confirm read-only view works

---

## 8. Publish (5 min)

- [ ] Click Publish (top-right of Wix Editor)
- [ ] Visit https://www.indalkp.com/mood-boards as a logged-in member → confirm it loads
- [ ] Test a public share link in incognito

---

## 9. Portfolio screenshots (15 min)

- [ ] Create a board called "Brand Direction — Sample" with 12-15 images
- [ ] Take a clean full-window screenshot (no browser chrome)
- [ ] Create a second board "Client Reference Board" with 8-10 mixed images
- [ ] Screenshot the public share view in incognito
- [ ] Save both screenshots → `C:\Users\ajayp\kp\mood-board-builder\portfolio-shots\`

These go on Upwork + Fiverr as Portfolio Item #3.

---

## Hard stop signs

- **Hour 4**: if RPC bridge breaks, ship without `setBoardPublic` — keep boards private, add Share later
- **Hour 5**: if image upload won't work via HTTP function, swap to a Wix UploadButton element on the page (not in embed) and pass URLs in via postMessage. Loses drag-drop visual but ships.
- **Hour 6**: stop. Take screenshots of whatever works. Ship what you have.

You will not need the stop signs. KPZ Draw is harder than this.

---

## After v0.1.0 ships

- [ ] Add Mood Board Builder as Portfolio Item #3 on Upwork (Wix Velo specialized profile)
- [ ] Add Mood Board Builder as Portfolio Item #3 on Fiverr gig
- [ ] Update Upwork specialized profile portfolio attachments
- [ ] Tweet/LinkedIn-post a screenshot — second build-in-public moment

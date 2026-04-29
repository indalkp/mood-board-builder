// UI rendering for the mood board embed.
// Two views: list (all my boards) and board (single board with images + drop zone).

import { createBoard, uploadImage, setBoardPublic } from "./api.js";

// === LIST VIEW ===
export function renderListView(root, boards, { onOpen }) {
  root.innerHTML = `
    <header class="hdr">
      <h1>My Mood Boards</h1>
      <button id="newBoardBtn" class="btn-primary">+ New board</button>
    </header>
    <div class="board-grid" id="boardGrid"></div>
  `;
  const grid = root.querySelector("#boardGrid");

  if (!boards || boards.length === 0) {
    grid.innerHTML = `<div class="empty">No boards yet. Click "+ New board" to start →</div>`;
  } else {
    boards.forEach(b => {
      const card = document.createElement("div");
      card.className = "board-card";
      card.innerHTML = `<div class="card-name">${escapeHtml(b.name)}</div>`;
      card.onclick = () => onOpen(b._id);
      grid.appendChild(card);
    });
  }

  root.querySelector("#newBoardBtn").onclick = async () => {
    const name = prompt("Board name?");
    if (!name) return;
    try {
      await createBoard(name);
      location.reload();
    } catch (err) {
      alert("Could not create board: " + err.message);
    }
  };
}

// === BOARD VIEW ===
export function renderBoardView(root, { board, images }, { readOnly, initData }) {
  root.innerHTML = `
    <header class="hdr">
      <h1>${escapeHtml(board.name)}</h1>
      ${readOnly
        ? `<span style="color:var(--mid-grey);font-size:13px;">Public view</span>`
        : `<button id="shareBtn" class="btn-primary">${board.isPublic ? "Sharing on" : "Share"}</button>`}
    </header>
    ${!readOnly ? `<div id="dropZone" class="drop-zone">Drop images here or click to upload</div>` : ""}
    ${!readOnly && board.isPublic ? `<div class="share-bar">
      <input id="shareUrl" readonly value="${initData.siteUrl}mood-boards?s=${escapeHtml(board.shareSlug)}">
      <button class="btn-primary" id="copyShareBtn">Copy</button>
    </div>` : ""}
    <div class="image-grid" id="imageGrid"></div>
  `;

  const grid = root.querySelector("#imageGrid");
  if (!images || images.length === 0) {
    grid.innerHTML = `<div class="empty">No images yet. ${readOnly ? "" : "Drop or upload above."}</div>`;
  } else {
    images.forEach(img => {
      const wrap = document.createElement("div");
      wrap.className = "image-cell";
      const url = wixImageToHttp(img.imageUrl);
      wrap.innerHTML = `<img src="${url}" alt="" loading="lazy">`;
      grid.appendChild(wrap);
    });
  }

  if (!readOnly) {
    setupDropZone(root.querySelector("#dropZone"), async (file) => {
      try {
        await uploadImage(file, board._id);
        location.reload();
      } catch (err) {
        alert("Upload failed: " + err.message);
      }
    });

    const shareBtn = root.querySelector("#shareBtn");
    if (shareBtn) {
      shareBtn.onclick = async () => {
        try {
          const result = await setBoardPublic(board._id, !board.isPublic);
          board.isPublic = result.isPublic;
          location.reload();
        } catch (err) {
          alert("Could not update sharing: " + err.message);
        }
      };
    }

    const copyBtn = root.querySelector("#copyShareBtn");
    if (copyBtn) {
      copyBtn.onclick = () => {
        const inp = root.querySelector("#shareUrl");
        inp.select();
        document.execCommand("copy");
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "Copy", 1500);
      };
    }
  }
}

// === HELPERS ===
function setupDropZone(zone, onDrop) {
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));
  zone.addEventListener("drop", async (e) => {
    e.preventDefault();
    zone.classList.remove("over");
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    for (const f of files) await onDrop(f);
  });
  zone.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = async () => {
      for (const f of input.files) await onDrop(f);
    };
    input.click();
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function wixImageToHttp(url) {
  // Convert wix:image://v1/abc.../filename → static.wixstatic.com/media/abc...
  if (!url) return "";
  if (!url.startsWith("wix:image://")) return url;
  const match = url.match(/wix:image:\/\/v1\/([^\/]+)\//);
  return match ? `https://static.wixstatic.com/media/${match[1]}` : url;
}

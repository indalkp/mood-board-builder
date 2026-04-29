// Entry point. Listens for init from the Wix page code, then mounts the appropriate view.
// Posted to from page code with { type: "init", isLoggedIn, shareSlug, siteUrl }.

import { renderListView, renderBoardView } from "./ui.js";
import { fetchMyBoards, fetchBoardBySlug, fetchBoardById } from "./api.js";

let initData = null;

export function boot() {
  window.addEventListener("message", async (event) => {
    const msg = event.data || {};
    if (msg.type !== "init") return;
    initData = msg;
    await mount();
  });
}

async function mount() {
  const root = document.querySelector("#app");

  // Public viewer mode (?s=shareSlug in URL)
  if (initData.shareSlug) {
    try {
      const data = await fetchBoardBySlug(initData.shareSlug);
      renderBoardView(root, data, { readOnly: true, initData });
    } catch (err) {
      root.innerHTML = `<div class="loading">${escapeHtml(err.message)}</div>`;
    }
    return;
  }

  // Logged-in user — show their board list
  if (initData.isLoggedIn) {
    try {
      const boards = await fetchMyBoards();
      renderListView(root, boards, {
        onOpen: async (boardId) => {
          const data = await fetchBoardById(boardId);
          renderBoardView(root, data, { readOnly: false, initData });
        },
      });
    } catch (err) {
      root.innerHTML = `<div class="loading">Error: ${escapeHtml(err.message)}</div>`;
    }
    return;
  }

  // Not logged in, no slug — show login prompt fallback
  root.innerHTML = `<div class="loading">Please log in to view your boards.</div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

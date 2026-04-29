// Page code for /mood-boards
// PASTE INTO Wix Editor at: Page Code → Main Pages → Mood Boards
// (Click the {} icon in the bottom-left of the Editor → Page Code → Mood Boards)

import { authentication } from "wix-members-frontend";
import wixLocation from "wix-location";
import {
  createBoard,
  listMyBoards,
  getBoard,
  addImageToBoard,
  setBoardPublic,
  reorderImages,
} from "backend/moodBoardService.web";

// --- the RPC handler map: maps an RPC method name to a backend function ---
const handlers = {
  createBoard,
  listMyBoards,
  getBoard,
  addImageToBoard,
  setBoardPublic,
  reorderImages,
};

$w.onReady(async () => {
  const isLoggedIn = authentication.loggedIn();

  // shareSlug from URL — public viewer mode
  const slug = wixLocation.query.s || null;

  // Embed element. Set its ID in the Editor's Properties panel to: moodBoardEmbed
  const html = $w("#moodBoardEmbed");

  // 1) Pass init data into the embed
  html.postMessage({
    type: "init",
    isLoggedIn,
    shareSlug: slug,
    siteUrl: wixLocation.baseUrl,
  });

  // 2) Listen for RPC calls FROM the embed and route to the right backend function
  html.onMessage(async (event) => {
    const msg = event.data || {};

    if (msg.type === "rpc-call") {
      try {
        const fn = handlers[msg.method];
        if (!fn) throw new Error("Unknown method: " + msg.method);
        const result = await fn(msg.args);
        html.postMessage({ type: "rpc-response", callId: msg.callId, result });
      } catch (err) {
        html.postMessage({ type: "rpc-response", callId: msg.callId, error: String(err.message || err) });
      }
      return;
    }

    if (msg.type === "navigate") {
      wixLocation.to(msg.url);
      return;
    }
  });

  // 3) If not logged in and no public slug → prompt login
  if (!isLoggedIn && !slug) {
    authentication.promptLogin({ mode: "login" });
  }
});

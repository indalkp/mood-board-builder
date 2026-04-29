// API bridge to Wix Velo.
// Two paths:
// 1. Image upload → direct POST to a Velo HTTP function (no postMessage needed)
// 2. Everything else → postMessage RPC to page code, which calls the web module

const HTTP_BASE = "/_functions";

// --- public API used by ui.js + main.js ---

export async function fetchMyBoards() {
  return await callPageCode("listMyBoards");
}

export async function fetchBoardById(boardId) {
  return await callPageCode("getBoard", { boardId });
}

export async function fetchBoardBySlug(shareSlug) {
  return await callPageCode("getBoard", { shareSlug });
}

export async function createBoard(name) {
  return await callPageCode("createBoard", name);
}

export async function setBoardPublic(boardId, isPublic) {
  return await callPageCode("setBoardPublic", { boardId, isPublic });
}

export async function uploadImage(file, boardId) {
  // Step 1: POST raw image bytes to the Velo HTTP function
  const upRes = await fetch(`${HTTP_BASE}/uploadMoodBoardImage`, {
    method: "POST",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  if (!upRes.ok) {
    const txt = await upRes.text().catch(() => "");
    throw new Error(`Upload failed (${upRes.status}): ${txt}`);
  }
  const { imageUrl } = await upRes.json();

  // Step 2: register on the board via web module
  return await callPageCode("addImageToBoard", { boardId, imageUrl });
}

// --- postMessage RPC bridge ---
const pendingCalls = new Map();
let nextCallId = 1;

window.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "rpc-response") {
    const { callId, result, error } = msg;
    const resolver = pendingCalls.get(callId);
    if (resolver) {
      pendingCalls.delete(callId);
      error ? resolver.reject(new Error(error)) : resolver.resolve(result);
    }
  }
});

function callPageCode(method, args) {
  return new Promise((resolve, reject) => {
    const callId = nextCallId++;
    pendingCalls.set(callId, { resolve, reject });
    window.parent.postMessage({ type: "rpc-call", callId, method, args }, "*");
    setTimeout(() => {
      if (pendingCalls.has(callId)) {
        pendingCalls.delete(callId);
        reject(new Error(`Page code RPC timeout (${method})`));
      }
    }, 10000);
  });
}

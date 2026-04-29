// Mood Board Builder — Velo backend web module
// PASTE INTO Wix Editor at: Backend & Public → backend → moodBoardService.web.js
// (Repo path mirrors the in-Wix path so version control is honest.)

import { Permissions, webMethod } from "wix-web-module";
import wixData from "wix-data";
import { currentMember } from "wix-members-backend";

// --- helpers ---
function makeSlug() {
  // 8-char URL-safe slug. Collision risk for v0.1 is negligible.
  return Math.random().toString(36).slice(2, 10);
}

async function getMemberOrThrow() {
  const member = await currentMember.getMember();
  if (!member) throw new Error("Not signed in");
  return member;
}

// --- create a new board ---
export const createBoard = webMethod(
  Permissions.SiteMember,
  async (name) => {
    const member = await getMemberOrThrow();
    const board = await wixData.insert("MoodBoards", {
      name: name || "Untitled board",
      _owner: member._id,
      shareSlug: makeSlug(),
      isPublic: false,
    });
    return board;
  }
);

// --- list boards owned by the current member ---
export const listMyBoards = webMethod(
  Permissions.SiteMember,
  async () => {
    const member = await getMemberOrThrow();
    const result = await wixData.query("MoodBoards")
      .eq("_owner", member._id)
      .descending("_createdDate")
      .find();
    return result.items;
  }
);

// --- get a board (auth path: by ID for owner; public path: by shareSlug) ---
export const getBoard = webMethod(
  Permissions.Anyone,
  async ({ boardId, shareSlug }) => {
    let board;

    if (boardId) {
      // Authenticated path — must be owner OR board must be public
      const member = await currentMember.getMember();
      const fetched = await wixData.get("MoodBoards", boardId, { suppressAuth: true });
      if (!fetched) throw new Error("Board not found");
      const isOwner = member && fetched._owner === member._id;
      if (!isOwner && !fetched.isPublic) throw new Error("Not authorized");
      board = fetched;
    } else if (shareSlug) {
      // Public path — must have isPublic = true
      const result = await wixData.query("MoodBoards")
        .eq("shareSlug", shareSlug)
        .find({ suppressAuth: true });
      board = result.items[0];
      if (!board) throw new Error("Board not found");
      if (!board.isPublic) throw new Error("Board is private");
    } else {
      throw new Error("Need boardId or shareSlug");
    }

    const images = await wixData.query("MoodBoardImages")
      .eq("boardId", board._id)
      .ascending("order")
      .find({ suppressAuth: true });

    return { board, images: images.items };
  }
);

// --- add an uploaded image to a board ---
// imageUrl is the wix:image://... URL returned by the upload HTTP function
export const addImageToBoard = webMethod(
  Permissions.SiteMember,
  async ({ boardId, imageUrl, order }) => {
    const member = await getMemberOrThrow();
    const board = await wixData.get("MoodBoards", boardId, { suppressAuth: true });
    if (!board) throw new Error("Board not found");
    if (board._owner !== member._id) throw new Error("Not authorized");

    const image = await wixData.insert(
      "MoodBoardImages",
      { boardId, imageUrl, order: order ?? 0 },
      { suppressAuth: true }
    );
    return image;
  }
);

// --- toggle public/private + return slug ---
export const setBoardPublic = webMethod(
  Permissions.SiteMember,
  async ({ boardId, isPublic }) => {
    const member = await getMemberOrThrow();
    const board = await wixData.get("MoodBoards", boardId, { suppressAuth: true });
    if (!board) throw new Error("Board not found");
    if (board._owner !== member._id) throw new Error("Not authorized");

    board.isPublic = !!isPublic;
    await wixData.update("MoodBoards", board, { suppressAuth: true });
    return { shareSlug: board.shareSlug, isPublic: board.isPublic };
  }
);

// --- reorder images on a board ---
export const reorderImages = webMethod(
  Permissions.SiteMember,
  async ({ boardId, imageIds }) => {
    const member = await getMemberOrThrow();
    const board = await wixData.get("MoodBoards", boardId, { suppressAuth: true });
    if (!board || board._owner !== member._id) throw new Error("Not authorized");

    // imageIds is an array of _id strings in the desired order
    const updates = imageIds.map((id, idx) =>
      wixData.update(
        "MoodBoardImages",
        { _id: id, order: idx },
        { suppressAuth: true }
      )
    );
    await Promise.all(updates);
    return { ok: true };
  }
);

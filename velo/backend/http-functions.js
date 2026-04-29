// HTTP function for image uploads from the custom HTML embed.
// PASTE INTO Wix Editor at: Backend & Public → backend → http-functions.js
// Endpoint: https://www.indalkp.com/_functions/uploadMoodBoardImage

// IMPORTANT: if you already have an http-functions.js in your Wix site (e.g. for KPZ Draw),
// merge this export into the existing file instead of overwriting. Wix only allows ONE
// http-functions.js per site.

import { ok, badRequest, serverError } from "wix-http-functions";
import { mediaManager } from "wix-media-backend";

export async function post_uploadMoodBoardImage(request) {
  try {
    const buffer = await request.body.buffer();
    const contentType = request.headers["content-type"];

    if (!contentType || !contentType.startsWith("image/")) {
      return badRequest({ body: { error: "Content-Type must be image/*" } });
    }

    const ext = contentType.split("/")[1] || "jpg";
    const fileName = mb-${Date.now()}.${ext};

    const uploadedFile = await mediaManager.upload(
      "/mood-boards", // virtual folder inside Wix Media Manager
      buffer,
      fileName,
      {
        mediaOptions: {
          mimeType: contentType,
          mediaType: "image",
        },
        metadataOptions: {
          isPrivate: false,
          isVisitorUpload: false,
        },
      }
    );

    return ok({ body: { imageUrl: uploadedFile.fileUrl } });
  } catch (err) {
    return serverError({ body: { error: String(err) } });
  }
}

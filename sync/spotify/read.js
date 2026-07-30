// sync/spotify/read.js
// Reads the release manifest from Vercel Blob.
// Uses fallback.json if Blob is unreachable or has no release data.

import { get } from "@vercel/blob";
import fs from "fs";
import path from "path";

const MANIFEST_PATH = "spotify-manifest.json";

async function readFromBlob() {
  const result = await get(MANIFEST_PATH, {
    access: "private",
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    throw new Error(`Blob read failed: status ${result?.statusCode}`);
  }

  const text = await new Response(result.stream).text();
  return JSON.parse(text);
}

function readFromFallback() {
  const filePath = path.join(
    process.cwd(),
    "sync",
    "spotify",
    "fallback.json"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export async function getManifest() {
  const fallbackManifest = readFromFallback();

  try {
    const blobManifest = await readFromBlob();

    if (!blobManifest?.release?.spotifyId) {
      console.warn(
        "[sync/spotify/read] Blob manifest missing release data; using fallback.json"
      );
      return fallbackManifest;
    }

    return blobManifest;
  } catch (err) {
    console.error(
      "[sync/spotify/read] Blob read failed, using fallback.json:",
      err.message
    );
    return fallbackManifest;
  }
}
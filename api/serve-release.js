// serves GET /api/serve-release
// reads the release manifest instead of calling spotify directly
// feeds the homepage's hero-release component

import { getManifest } from "../sync/spotify/read.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=1800");

  try {
    const manifest = await getManifest();
    res.status(200).json(manifest.release);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load release" });
  }
}
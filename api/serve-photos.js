import { getManifest } from "../sync/cloudinary/photos/read.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const forceFresh = req.query.fresh === "1";
  res.setHeader("Cache-Control", forceFresh ? "no-store" : "public, max-age=1800");

  try {
    const manifest = await getManifest(forceFresh);
    res.status(200).json({ photos: manifest.photos || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load photos" });
  }
}
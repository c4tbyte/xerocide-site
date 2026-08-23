import { getManifest } from "../sync/airtable/read.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const forceFresh = req.query.fresh === "1";
  res.setHeader("Cache-Control", forceFresh ? "no-store" : "public, max-age=1800");

  try {
    const manifest = await getManifest(forceFresh);
    const videos = (manifest.videos || []).map((v) => ({
      id: v.youtubeId,
      title: v.title,
      date: v.date || "",
      location: v.location || "",
      youtubeUrl: v.url,
    }));

    res.status(200).json({ videos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load videos" });
  }
}
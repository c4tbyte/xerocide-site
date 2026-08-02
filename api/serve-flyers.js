import { getManifest } from "../sync/cloudinary/read.js";
 
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=1800");
 
  try {
    const manifest = await getManifest();
    res.status(200).json({ flyers: manifest.flyers || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load flyers" });
  }
}

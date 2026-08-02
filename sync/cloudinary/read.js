import { get } from "@vercel/blob";
import fs from "fs";
import path from "path";
 
const MANIFEST_PATH = "cloudinary-archive-manifest.json";
const IN_MEMORY_TTL = 55 * 60 * 1000;
let memoryCache = null;
 
async function readFromBlob() {
  const result = await get(MANIFEST_PATH, { access: "private" });
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
    "cloudinary",
    "fallback.json"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
 
export async function getManifest() {
  if (memoryCache && memoryCache.expires > Date.now()) {
    return memoryCache.manifest;
  }
  try {
    const manifest = await readFromBlob();
    memoryCache = { manifest, expires: Date.now() + IN_MEMORY_TTL };
    return manifest;
  } catch (err) {
    console.error(
      "[sync/cloudinary/archive/read] Blob read failed, using fallback.json:",
      err.message
    );
    return readFromFallback();
  }
}

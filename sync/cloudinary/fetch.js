import { v2 as cloudinary } from "cloudinary";
 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
 
const FLYER_FOLDER = "Flyers";
 
function deliveryUrl(publicId, opts = {}) {
  return cloudinary.url(publicId, { secure: true, ...opts });
}
 
export async function buildManifest() {
  const resources = await cloudinary.search
    .expression(`asset_folder="${FLYER_FOLDER}"`)
    .sort_by("created_at", "desc")
    .max_results(100)
    .execute();
 
  const flyers = (resources.resources || []).map((img) => ({
    thumb: deliveryUrl(img.public_id, { width: 500, crop: "limit" }),
    full: deliveryUrl(img.public_id, { width: 1400, crop: "limit" }),
    createdAt: img.created_at,
  }));
 
  return {
    generatedAt: new Date().toISOString(),
    flyers,
  };
}

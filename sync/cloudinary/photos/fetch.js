import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PHOTOS_FOLDER = "Photos";

function deliveryUrl(publicId, opts = {}) {
  return cloudinary.url(publicId, { secure: true, ...opts });
}

export async function buildManifest() {
  const resources = await cloudinary.search
    .expression(`folder="${PHOTOS_FOLDER}"`)
    .sort_by("created_at", "desc")
    .max_results(100)
    .execute();

  const photos = (resources.resources || []).map((img) => ({
    url: deliveryUrl(img.public_id, { width: 900, crop: "limit" }),
    createdAt: img.created_at,
  }));

  return {
    generatedAt: new Date().toISOString(),
    photos,
  };
}
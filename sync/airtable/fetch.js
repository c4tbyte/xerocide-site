const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const TABLE_NAME = "Videos";
 
function extractYouTubeId(url) {
  const match = (url || "").match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
 
async function getAirtableRows() {
  let rows = [];
  let offset;
 
  do {
    const url = new URL(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`
    );
    if (offset) url.searchParams.set("offset", offset);
 
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    });
 
    if (!res.ok) {
      throw new Error(`Airtable fetch failed: ${res.status}`);
    }
 
    const json = await res.json();
    rows = rows.concat(json.records);
    offset = json.offset;
  } while (offset);
 
  return rows;
}
 
async function getVideoTitle(youtubeUrl) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      youtubeUrl
    )}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return "";
    const data = await res.json();
    return data.title || "";
  } catch {
    return "";
  }
}
 
export async function buildManifest() {
  const rows = await getAirtableRows();
 
  const videos = [];
  for (const row of rows) {
    const rawUrl = row.fields?.Videos;
    if (!rawUrl) continue;
 
    const youtubeId = extractYouTubeId(rawUrl);
    if (!youtubeId) continue;
 
    const title = await getVideoTitle(rawUrl);
 
    videos.push({
      youtubeId,
      title: title || "Untitled",
      url: rawUrl,
    });
  }
 
  return {
    generatedAt: new Date().toISOString(),
    videos,
  };
}

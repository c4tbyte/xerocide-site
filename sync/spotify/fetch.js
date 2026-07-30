// sync/spotify/fetch.js
// Fetches the newest release for the single hardcoded artist from Spotify.
// Simpler than a multi-artist roster sync (no grouping/rate-limit avoidance
// needed for one artist), but follows the same field names/logging style
// as the rest of this project's sync sources.

const SPOTIFY_PAGE_LIMIT = 10;

function requireEnvironmentVariable(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function getSpotifyToken() {
  const clientId = requireEnvironmentVariable("SPOTIFY_CLIENT_ID");
  const clientSecret = requireEnvironmentVariable("SPOTIFY_CLIENT_SECRET");

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");

    throw new Error(
      `Spotify auth failed: ${response.status}` +
        (responseText ? ` — ${responseText}` : "")
    );
  }

  const data = await response.json();

  if (!data?.access_token) {
    throw new Error(
      "Spotify authentication succeeded but returned no access token"
    );
  }

  return data.access_token;
}

async function getArtistAlbums(artistId, token) {
  const params = new URLSearchParams({
    include_groups: "album,single",
    limit: String(SPOTIFY_PAGE_LIMIT),
  });

  const url =
    `https://api.spotify.com/v1/artists/` +
    `${encodeURIComponent(artistId)}/albums?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");

    throw new Error(
      `Spotify API error for artist ${artistId}: ${response.status}` +
        (responseText ? ` — ${responseText}` : "")
    );
  }

  return response.json();
}

function cleanAlbums(rawData, expectedArtistId) {
  const items = Array.isArray(rawData?.items) ? rawData.items : [];

  return items
    .filter((item) => {
      return (
        item?.id &&
        Array.isArray(item.artists) &&
        item.artists.some((artist) => artist.id === expectedArtistId)
      );
    })
    .map((item) => ({
      title: item.name ?? "",
      artistName: item.artists?.[0]?.name ?? "",
      image: item.images?.[0]?.url ?? "",
      releaseDate: item.release_date ?? "",
      spotifyUrl: item.external_urls?.spotify ?? "",
      albumType: item.album_type ?? "",
      spotifyId: item.id,
      totalTracks: item.total_tracks ?? 0,
    }));
}

function pickLatestRelease(albums) {
  const sorted = [...albums].sort((a, b) => {
    return new Date(b.releaseDate) - new Date(a.releaseDate);
  });

  return sorted[0] ?? null;
}

export async function buildManifest() {
  const artistId = requireEnvironmentVariable("SPOTIFY_ARTIST_ID");

  console.log(
    `[sync/spotify/fetch] Fetching latest release for artist ${artistId}`
  );

  const token = await getSpotifyToken();
  const rawData = await getArtistAlbums(artistId, token);
  const albums = cleanAlbums(rawData, artistId);

  if (albums.length === 0) {
    throw new Error(`No releases found for artist ${artistId}`);
  }

  const release = pickLatestRelease(albums);

  console.log(
    `[sync/spotify/fetch] Latest release: ${release.title} ` +
      `(${release.releaseDate})`
  );

  return {
    generatedAt: new Date().toISOString(),
    release,
  };
}
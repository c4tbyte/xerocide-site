function normalizeForMatch(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
 
class ReleaseHighlight extends HTMLElement {
  connectedCallback() {
    this._load();
  }
 
  get layout() {
    return this.getAttribute("layout") || "hero";
  }
 
  async _load() {
    const isRow = this.layout === "row";
 
    const releaseEndpoint = this.getAttribute("release-endpoint") || "/api/serve-release";
    const fallbackUrl = this.getAttribute("spotify-artist-url") || "#";
    const eyebrow = this.getAttribute("eyebrow") || "Now Streaming...";
    const listenText = this.getAttribute("listen-text") || (isRow ? "Listen Now" : "Listen Here");
    const buyText = this.getAttribute("buy-text") || "Buy CD/Cassette";
 
    this.innerHTML = isRow
      ? `<p class="release-highlight-loading">Loading latest release…</p>`
      : `<p class="hero-right-text">Loading latest release…</p>`;
 
    let release = null;
    try {
      const res = await fetch(releaseEndpoint);
      if (res.ok) release = await res.json();
    } catch (err) {
      console.error("[release-highlight] failed to load release:", err);
    }
 
    if (!release) {
      this.innerHTML = isRow
        ? `<p class="release-highlight-loading">Couldn't load the latest release right now.</p>`
        : `
          <h2 class="hero-right-title">${eyebrow}</h2>
          <a href="${fallbackUrl}" target="_blank" rel="noopener" class="hero-right-link">Check out our music →</a>
        `;
      return;
    }
 
    const title = release.title || "Latest Release";
    const image = release.image || "";
    const listenUrl = release.spotifyUrl || fallbackUrl;
 
    const esc = window.TextHelper?.escapeText || ((s) => s);
    const escAttr = window.TextHelper?.escapeAttr || ((s) => s);
 
    // ---- HERO layout (desktop) ----
    if (!isRow) {
      this.innerHTML = `
        <h2 class="hero-right-title">${esc(eyebrow)}</h2>
        <a href="${escAttr(listenUrl)}" target="_blank" rel="noopener">
          <img class="hero-right-cover" src="${escAttr(image)}" alt="${escAttr(title)} album cover" />
        </a>
        <p class="hero-right-text">${esc(title)}</p>
        <a href="${escAttr(listenUrl)}" target="_blank" rel="noopener" class="hero-right-link">${esc(listenText)} →</a>
      `;
      return;
    }
 
    // ---- ROW layout (mobile) ----
    const merchEndpoint = this.getAttribute("merch-endpoint");
    const storeUrl = (this.getAttribute("store-url") || "").replace(/\/$/, "");
    const matchName = this.getAttribute("match-name") || "";
    const cdKeywords = (this.getAttribute("cd-keywords") || "cd,cassette")
      .split(",")
      .map((k) => normalizeForMatch(k))
      .filter(Boolean);
 
    let buyUrl = "";
    if (merchEndpoint && matchName) {
      try {
        const res = await fetch(merchEndpoint);
        if (res.ok) {
          const products = await res.json();
          const needle = normalizeForMatch(matchName);
          const match = products.find((p) => {
            if (p.status !== "active") return false;
            const name = normalizeForMatch(p.name);
            return name.includes(needle) && cdKeywords.some((kw) => name.includes(kw));
          });
          if (match) buyUrl = `${storeUrl}${match.url}`;
        }
      } catch (err) {
        console.error("[release-highlight] failed to check merch:", err);
      }
    }
 
    const year = (release.releaseDate || "").slice(0, 4);
 
    this.innerHTML = `
      <div class="release-highlight-card">
        <img class="release-highlight-cover" src="${escAttr(image)}" alt="${escAttr(title)} cover" />
        <div class="release-highlight-text">
          <div class="release-highlight-title">${esc(title)}</div>
          ${year ? `<div class="release-highlight-year">${esc(year)}</div>` : ""}
        </div>
      </div>
      <div class="release-highlight-buttons">
        <a class="release-highlight-btn listen" href="${escAttr(listenUrl)}" target="_blank" rel="noopener">${esc(listenText)}</a>
        ${buyUrl ? `<a class="release-highlight-btn buy" href="${escAttr(buyUrl)}" target="_blank" rel="noopener">${esc(buyText)}</a>` : ""}
      </div>
    `;
  }
}
 
customElements.define("release-highlight", ReleaseHighlight);
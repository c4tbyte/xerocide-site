// hero-release.js
// Fetches a single "latest release" from the /api/serve-release endpoint
// and renders it using the existing .hero-right-* classes from theme.css.
// No shadow DOM on purpose - this reuses your global styles as-is.

class HeroRelease extends HTMLElement {
  connectedCallback() {
    this.load();
  }

  async load() {
    const endpoint = this.getAttribute("api-endpoint") || "/api/serve-release";
    const fallbackUrl = this.getAttribute("spotify-artist-url") || "#";
    const eyebrow = this.getAttribute("eyebrow") || "Now Streaming...";

    this.innerHTML = `<p class="hero-right-text">Loading latest release…</p>`;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      const title = data.title || "Latest Release";
      const image = data.image || "";
      const url = data.spotifyUrl || fallbackUrl;

      const esc = window.TextHelper?.escapeText || ((s) => s);
      const escAttr = window.TextHelper?.escapeAttr || ((s) => s);

      this.innerHTML = `
        <h2 class="hero-right-title">${esc(eyebrow)}</h2>
        <a href="${escAttr(url)}" target="_blank" rel="noopener">
          <img class="hero-right-cover" src="${escAttr(image)}" alt="${escAttr(title)} album cover" />
        </a>
        <p class="hero-right-text">${esc(title)}</p>
        <a href="${escAttr(url)}" target="_blank" rel="noopener" class="hero-right-link">Listen Here →</a>
      `;
    } catch (err) {
      console.error("hero-release: failed to load release", err);
      this.innerHTML = `
        <h2 class="hero-right-title">${eyebrow}</h2>
        <a href="${fallbackUrl}" target="_blank" rel="noopener" class="hero-right-link">Check out our music →</a>
      `;
    }
  }
}

customElements.define("hero-release", HeroRelease);
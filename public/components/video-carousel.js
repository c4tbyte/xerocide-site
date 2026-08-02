
const VIDEO_TEMPLATE = document.createElement("template");
VIDEO_TEMPLATE.innerHTML = `
<style>
  :host {
    --vc-bg: #0a0a0a;
    --vc-fg: #ffffff;
    --vc-muted: #888888;
    --vc-panel: #131313;
    --vc-border: #2b2b2b;
    --vc-font-heading: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --vc-font-body: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --vc-label-tracking: 0.12em;
    --vc-padding: 28px;
    --vc-header-gap: 20px;
    --vc-arrow-size: 32px;
    --vc-arrow-offset: -8px;
    --vc-min-height: 380px;
    --vc-video-max-height: 300px;

    position: relative;
    display: flex;
    flex-direction: column;
    min-height: var(--vc-min-height);
    background: var(--vc-bg);
    color: var(--vc-fg);
    font-family: var(--vc-font-body);
    padding: var(--vc-padding);
    box-sizing: border-box;
  }

  * { box-sizing: border-box; }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: var(--vc-header-gap);
  }

  h2 {
    margin: 0;
    font-family: var(--vc-font-heading);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: var(--vc-label-tracking);
    text-transform: uppercase;
  }

  .header .view-all {
    font-family: var(--vc-font-heading);
    font-size: var(--vc-view-all-font-size, 16px);
    letter-spacing: var(--vc-label-tracking);
    text-transform: uppercase;
    color: var(--vc-fg);
    text-decoration: none;
    white-space: nowrap;
  }

  .header .view-all:hover { opacity: 0.8; }

  .video-row {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .quote-panel {
    flex: 1;
    min-width: 0;
  }

  .quote-panel blockquote {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #d6d6d3;
    font-style: italic;
  }

  .frame-wrap {
    position: relative;
    flex: 0 0 auto;
    max-width: calc(var(--vc-video-max-height) * 16 / 9);
    width: 100%;
  }

  .video-frame {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--vc-panel);
    border: 1px solid var(--vc-border);
    touch-action: pan-y;
  }

  .video-frame iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
    pointer-events: none; /* keep swipe gestures usable over the iframe */
  }

  .video-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: var(--vc-bg);
    border: 1px solid var(--vc-fg);
    color: var(--vc-fg);
    cursor: pointer;
    font-size: 16px;
    width: var(--vc-arrow-size);
    height: var(--vc-arrow-size);
    line-height: 1;
    opacity: 0.7;
    z-index: 2;
    transition: opacity 0.15s ease;
  }

  .video-arrow:hover:not(:disabled) { opacity: 1; }
  .video-arrow:disabled { opacity: 0.25; cursor: default; }

  .video-arrow.prev { left: var(--vc-arrow-offset); }
  .video-arrow.next { right: var(--vc-arrow-offset); }

  .video-meta {
    margin-top: 14px;
    text-align: center;
  }
  .video-title {
    font-size: 13px;
    line-height: 1.4;
    color: #d6d6d3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .video-count {
    margin-top: 4px;
    font-family: var(--vc-font-body);
    font-size: 10px;
    letter-spacing: var(--vc-label-tracking);
    text-transform: uppercase;
    color: var(--vc-muted);
  }

  .state-message {
    font-size: 13px;
    color: var(--vc-muted);
    padding: 30px 0;
    text-align: center;
  }
</style>

<div class="header">
  <h2 part="title"></h2>
  <a class="view-all" href="#" target="_blank" rel="noopener"></a>
</div>
<div class="video-row">
  <div class="frame-wrap">
    <button class="video-arrow prev" aria-label="Previous video" hidden>&#8249;</button>
    <div class="video-frame"></div>
    <button class="video-arrow next" aria-label="Next video" hidden>&#8250;</button>
  </div>
  <div class="quote-panel">
    <blockquote></blockquote>
  </div>
</div>
<div class="video-meta">
  <div class="video-title"></div>
  <div class="video-count"></div>
</div>
`;

class VideoCarousel extends HTMLElement {
  static get observedAttributes() {
    return ["api-endpoint", "title", "view-all-text", "view-all-url"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(VIDEO_TEMPLATE.content.cloneNode(true));
    this._videos = [];
    this._index = 0;
  }

  connectedCallback() {
    this._render();
    this._loadData();
    this._setupSwipe();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  get apiEndpoint() { return this.getAttribute("api-endpoint"); }
  get titleText() { return this.getAttribute("title") || "Media"; }
  get viewAllText() { return this.getAttribute("view-all-text") || ""; }
  get viewAllUrl() { return this.getAttribute("view-all-url") || ""; }

  _render() {
    const root = this.shadowRoot;
    root.querySelector("h2").textContent = this.titleText;

    const link = root.querySelector(".view-all");

    if (this.viewAllText && this.viewAllUrl) {
      link.hidden = false;
      link.textContent = this.viewAllText + " →";
      link.href = this.viewAllUrl;
    } else {
      link.hidden = true;
    }
  }

  async _loadData() {
    const frame = this.shadowRoot.querySelector(".video-frame");

    if (!this.apiEndpoint) {
      frame.innerHTML = `<div class="state-message">Set api-endpoint to load videos.</div>`;
      return;
    }

    frame.innerHTML = `<div class="state-message">Loading videos…</div>`;

    try {
      const res = await fetch(this.apiEndpoint);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();

      this._videos = Array.isArray(data.videos) ? data.videos : [];

      if (this._videos.length === 0) {
        frame.innerHTML = `<div class="state-message">No videos yet.</div>`;
        return;
      }

      this._showVideo(0);
    } catch (err) {
      console.error("[video-carousel] failed to load:", err);
      frame.innerHTML = `<div class="state-message">Couldn't load videos right now.</div>`;
    }
  }

  _showVideo(index) {
    const videos = this._videos;
    if (videos.length === 0) return;

    this._index = window.PaginationHelper.wrapPage(index, videos.length);
    const video = videos[this._index];

    const frame = this.shadowRoot.querySelector(".video-frame");
    const titleEl = this.shadowRoot.querySelector(".video-title");
    const countEl = this.shadowRoot.querySelector(".video-count");
    const prevBtn = this.shadowRoot.querySelector(".prev");
    const nextBtn = this.shadowRoot.querySelector(".next");
    const videoRow = this.shadowRoot.querySelector(".video-row");
    const quotePanel = this.shadowRoot.querySelector(".quote-panel");
    const quoteEl = this.shadowRoot.querySelector("blockquote");

    frame.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${window.TextHelper.escapeAttr(video.youtubeId)}"
      title="${window.TextHelper.escapeAttr(video.title)}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      loading="lazy"
    ></iframe>`;

    const hasQuote = Boolean(video.quote && video.quote.trim());
    videoRow.classList.toggle("has-quote", hasQuote);
    quotePanel.hidden = !hasQuote;
    quoteEl.textContent = hasQuote ? video.quote : "";

    titleEl.textContent = video.title;
    countEl.textContent = `${this._index + 1} / ${videos.length}`;

    const showArrows = videos.length > 1;
    prevBtn.hidden = !showArrows;
    nextBtn.hidden = !showArrows;

    prevBtn.onclick = () => this._showVideo(this._index - 1);
    nextBtn.onclick = () => this._showVideo(this._index + 1);
  }

  _setupSwipe() {
    window.SwipeHelper.attachSwipeBehavior(
      this.shadowRoot.querySelector(".video-frame"),
      {
        getPage: () => this._index,
        getTotalPages: () => this._videos.length || 1,
        goToPage: (page) => this._showVideo(page),
      }
    );
  }
}

customElements.define("video-carousel", VideoCarousel);
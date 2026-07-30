const FLYER_TEMPLATE = document.createElement("template");
FLYER_TEMPLATE.innerHTML = `
<style>
  :host {
    --fa-bg: #0a0a0a;
    --fa-fg: #ffffff;
    --fa-muted: #888888;
    --fa-font-heading: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --fa-label-tracking: 0.12em;
    --fa-card-gap: 16px;
    --fa-columns: 3;
 
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: var(--fa-min-height, 380px);
    background: var(--fa-bg);
    color: var(--fa-fg);
    font-family: var(--fa-font-heading);
    padding: 28px;
    box-sizing: border-box;
  }
 
  * { box-sizing: border-box; }
 
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
 
  .header h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: var(--fa-label-tracking);
    text-transform: uppercase;
  }
 
  .nav-arrows { display: flex; gap: 10px; }
 
  .nav-arrows button {
    background: none;
    border: 1px solid var(--fa-fg);
    color: var(--fa-fg);
    cursor: pointer;
    font-size: 16px;
    padding: 6px 14px;
    opacity: 0.7;
    line-height: 1;
  }
 
  .nav-arrows button:hover { opacity: 1; }
  .nav-arrows button:disabled { opacity: 0.25; cursor: default; }
 
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--fa-columns), 1fr);
    gap: var(--fa-card-gap);
    flex: 1;
    align-content: start;
    touch-action: pan-y;
    transition: transform 0.25s ease;
  }
 
  .card {
    display: block;
    cursor: pointer;
  }
 
  .card img {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    background: #000;
    display: block;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transition: opacity 0.15s ease;
  }
 
  .card:hover img { opacity: 0.85; }
 
  .swipe-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
  }
 
  .swipe-dots .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: background 0.2s ease;
  }
 
  .swipe-dots .dot.active { background: #ffffff; }
 
  .state-message {
    font-size: 13px;
    color: var(--fa-muted);
    padding: 30px 0;
    text-align: center;
  }
 
  @media (max-width: 700px) {
    :host { --fa-columns: 2; }
  }
</style>
 
<div class="header">
  <h2 part="title"></h2>
  <div class="nav-arrows" hidden>
    <button class="prev" aria-label="Previous flyers">&#8249;</button>
    <button class="next" aria-label="Next flyers">&#8250;</button>
  </div>
</div>
 
<div class="grid"></div>
<div class="swipe-dots"></div>
`;
 
class FlyerArchive extends HTMLElement {
  static get observedAttributes() {
    return ["api-endpoint", "title", "columns"];
  }
 
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(FLYER_TEMPLATE.content.cloneNode(true));
    this._pages = [];
    this._page = 0;
  }
 
  connectedCallback() {
    this._render();
    this._loadData();
    this._setupSwipe();
 
    let lastWidth = window.innerWidth;
    window.ResizeHelper.onResizeOnce(this, () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      this.shadowRoot.host.style.setProperty("--fa-columns", String(this.columns));
      this._rebuildPages();
    });
  }
 
  attributeChangedCallback() {
    if (this.isConnected) {
      this._render();
      this._loadData();
    }
  }
 
  get apiEndpoint() { return this.getAttribute("api-endpoint"); }
  get titleText() { return this.getAttribute("title") || "Flyer Archive"; }
 
  get columns() {
    if (window.matchMedia("(max-width: 700px)").matches) return 2;
    return Number(this.getAttribute("columns") || 3);
  }
 
  get perPage() {
    return this.columns;
  }
 
  _render() {
    const root = this.shadowRoot;
    root.querySelector("h2").textContent = this.titleText;
    root.host.style.setProperty("--fa-columns", String(this.columns));
  }
 
  async _loadData() {
    const grid = this.shadowRoot.querySelector(".grid");
    const arrowsWrap = this.shadowRoot.querySelector(".nav-arrows");
 
    if (!this.apiEndpoint) {
      grid.innerHTML = `<div class="state-message">Set api-endpoint to load flyers.</div>`;
      return;
    }
 
    grid.innerHTML = `<div class="state-message">Loading flyers…</div>`;
 
    try {
      const res = await fetch(this.apiEndpoint);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
 
      this._flatList = Array.isArray(data.flyers) ? data.flyers : [];
      this._rebuildPages();
    } catch (err) {
      console.error("[flyer-archive] failed to load:", err);
      grid.innerHTML = `<div class="state-message">Couldn't load flyers right now.</div>`;
      arrowsWrap.hidden = true;
    }
  }
 
  _rebuildPages() {
    const flatList = this._flatList || [];
    const perPage = this.perPage;
 
    this._pages = [];
    for (let i = 0; i < flatList.length; i += perPage) {
      this._pages.push(flatList.slice(i, i + perPage));
    }
 
    this._page = 0;
    this._renderPage();
  }
 
  _renderPage() {
    const grid = this.shadowRoot.querySelector(".grid");
    const arrowsWrap = this.shadowRoot.querySelector(".nav-arrows");
 
    if (this._pages.length === 0) {
      grid.innerHTML = `<div class="state-message">No flyers yet.</div>`;
      arrowsWrap.hidden = true;
      this.shadowRoot.querySelector(".swipe-dots").innerHTML = "";
      return;
    }
 
    const totalPages = this._totalPages();
    arrowsWrap.hidden = !(totalPages > 1);
 
    const pageItems = this._pages[this._page];
 
    grid.innerHTML = pageItems
      .map((flyer) => {
        const thumb = flyer.thumb || flyer.full || "";
        const full = flyer.full || flyer.thumb || "";
        return `
          <a class="card" href="${window.TextHelper.escapeAttr(full)}" target="_blank" rel="noopener">
            <img src="${window.TextHelper.escapeAttr(thumb)}" alt="Show flyer" loading="lazy" />
          </a>
        `;
      })
      .join("");
 
    if (totalPages > 1) {
      const prevBtn = this.shadowRoot.querySelector(".prev");
      const nextBtn = this.shadowRoot.querySelector(".next");
      prevBtn.onclick = () => this._goToPage(this._page - 1);
      nextBtn.onclick = () => this._goToPage(this._page + 1);
    }
 
    this._renderPageDots();
  }
 
  _totalPages() {
    return window.PaginationHelper.getTotalPages(this._pages.length, 1);
  }
 
  _goToPage(page) {
    if (this._pages.length === 0) return;
    this._page = window.PaginationHelper.wrapPage(page, this._totalPages());
    this._renderPage();
  }
 
  _setupSwipe() {
    window.SwipeHelper.attachSwipeBehavior(
      this.shadowRoot.querySelector(".grid"),
      {
        getPage: () => this._page,
        getTotalPages: () => this._totalPages(),
        goToPage: (page) => this._goToPage(page),
      }
    );
  }
 
  _renderPageDots() {
    const dotsEl = this.shadowRoot.querySelector(".swipe-dots");
    window.SwipeHelper.renderPageDots(dotsEl, this._page, this._totalPages());
  }
}
 
customElements.define("flyer-archive", FlyerArchive);
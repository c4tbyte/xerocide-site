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
    --fa-padding: 28px;
    --fa-header-gap: 20px;
    --fa-arrow-size: 32px;
    --fa-arrow-offset: -8px;
    --fa-min-height: 380px;
 
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: var(--fa-min-height);
    background: var(--fa-bg);
    color: var(--fa-fg);
    font-family: var(--fa-font-heading);
    padding: var(--fa-padding);
    box-sizing: border-box;
  }
 
  * { box-sizing: border-box; }
 
  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: var(--fa-header-gap);
  }
 
  .header h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: var(--fa-label-tracking);
    text-transform: uppercase;
  }
 
  .header .view-all {
    font-family: var(--fa-font-body, inherit);
    font-size: var(--fa-view-all-font-size, 16px);
    letter-spacing: var(--fa-label-tracking);
    text-transform: uppercase;
    color: var(--fa-view-all-color, var(--fa-fg));
    text-decoration: none;
    white-space: nowrap;
  }
 
  .header .view-all:hover { opacity: 0.8; }
 
  .grid-wrap {
    position: relative;
    flex: 1;
    display: flex;
  }
 
  .nav-arrows button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: var(--fa-bg);
    border: 1px solid var(--fa-fg);
    color: var(--fa-fg);
    cursor: pointer;
    font-size: var(--fa-arrow-font-size, 16px);
    width: var(--fa-arrow-size);
    height: var(--fa-arrow-size);
    line-height: 1;
    opacity: 0.7;
    z-index: 2;
  }
 
  .nav-arrows button:hover { opacity: 1; }
  .nav-arrows button:disabled { opacity: 0.25; cursor: default; }
 
  .nav-arrows .prev { left: var(--fa-arrow-offset); }
  .nav-arrows .next { right: var(--fa-arrow-offset); }
 
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--fa-columns), max-content);
    justify-content: center;
    gap: var(--fa-card-gap);
    flex: 1;
    align-content: start;
    touch-action: pan-y;
    transition: transform 0.25s ease;
  }
 
  .card {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
 
  .card img {
    width: auto;
    max-width: var(--fa-card-max-width, clamp(70px, 9vw, 140px));
    max-height: var(--fa-card-max-height, clamp(90px, 12vh, 180px));
    aspect-ratio: var(--fa-card-aspect-ratio, 3 / 4);
    object-fit: cover;
    background: #000;
    display: block;
    border: var(--fa-image-border, none);
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
    margin-top: var(--fa-dots-gap, 24px);
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
    width: 100%;
  }
 
  @media (max-width: 700px) {
    :host { --fa-columns: 2; }
 
    .lightbox-arrow {
      display: none;
    }
  }
 
  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }
 
  .lightbox[hidden] { display: none; }
 
  .lightbox img {
    max-width: min(90vw, 800px);
    max-height: 85vh;
    object-fit: contain;
    display: block;
  }
 
  .lightbox-close {
    position: absolute;
    top: 20px;
    right: 24px;
    background: none;
    border: none;
    color: #ffffff;
    font-size: 32px;
    line-height: 1;
    cursor: pointer;
    z-index: 2;
  }
 
  .lightbox-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid #ffffff;
    color: #ffffff;
    cursor: pointer;
    font-size: 22px;
    width: 44px;
    height: 44px;
    line-height: 1;
    z-index: 2;
  }
 
  .lightbox-arrow:hover { background: rgba(255, 255, 255, 0.15); }
 
  .lightbox-arrow.prev { left: 16px; }
  .lightbox-arrow.next { right: 16px; }
</style>
 
<div class="header">
  <h2 part="title"></h2>
  <a class="view-all" href="#"></a>
</div>
 
<div class="grid-wrap">
  <div class="nav-arrows" hidden>
    <button class="prev" aria-label="Previous flyers">&#8249;</button>
    <button class="next" aria-label="Next flyers">&#8250;</button>
  </div>
  <div class="grid"></div>
</div>
<div class="swipe-dots"></div>
 
<div class="lightbox" hidden>
  <button class="lightbox-close" aria-label="Close">&times;</button>
  <button class="lightbox-arrow prev" aria-label="Previous image">&#8249;</button>
  <img src="" alt="" />
  <button class="lightbox-arrow next" aria-label="Next image">&#8250;</button>
</div>
`;
 
class FlyerArchive extends HTMLElement {
  static get observedAttributes() {
    return ["api-endpoint", "title", "columns", "view-all-text", "view-all-url"];
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
    this._setupLightbox();
 
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
    return Number(this.getAttribute("columns") || 3);
  }
 
  get perPage() {
    return this.columns;
  }
 
  _render() {
    const root = this.shadowRoot;
    root.querySelector("h2").textContent = this.titleText;
    root.host.style.setProperty("--fa-columns", String(this.columns));
 
    const link = root.querySelector(".view-all");
    const viewAllText = this.getAttribute("view-all-text");
    const viewAllUrl = this.getAttribute("view-all-url");
 
    if (viewAllText && viewAllUrl) {
      link.hidden = false;
      link.textContent = viewAllText + " →";
      link.href = viewAllUrl;
    } else {
      link.hidden = true;
    }
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
      .map((flyer, i) => {
        const thumb = flyer.thumb || flyer.full || "";
        const globalIndex = this._page * this.perPage + i;
        return `
          <div class="card" data-idx="${globalIndex}">
            <img src="${window.TextHelper.escapeAttr(thumb)}" alt="Show flyer" loading="lazy" />
          </div>
        `;
      })
      .join("");
 
    grid.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => {
        this._openLightbox(Number(card.dataset.idx));
      });
    });
 
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
 
  _setupLightbox() {
    const root = this.shadowRoot;
    const lightbox = root.querySelector(".lightbox");
    const closeBtn = root.querySelector(".lightbox-close");
    const prevBtn = root.querySelector(".lightbox-arrow.prev");
    const nextBtn = root.querySelector(".lightbox-arrow.next");
 
    closeBtn.addEventListener("click", () => this._closeLightbox());
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) this._closeLightbox();
    });
    prevBtn.addEventListener("click", () => this._lightboxStep(-1));
    nextBtn.addEventListener("click", () => this._lightboxStep(1));
 
    document.addEventListener("keydown", (e) => {
      if (this.shadowRoot.querySelector(".lightbox").hidden) return;
      if (e.key === "Escape") this._closeLightbox();
      if (e.key === "ArrowLeft") this._lightboxStep(-1);
      if (e.key === "ArrowRight") this._lightboxStep(1);
    });
 
    window.SwipeHelper.attachSwipeBehavior(lightbox, {
      getPage: () => this._lightboxIndex,
      getTotalPages: () => this._flatList.length,
      goToPage: (index) => {
        this._lightboxIndex = window.PaginationHelper.wrapPage(index, this._flatList.length);
        this._renderLightboxImage();
      },
    });
  }
 
  _openLightbox(index) {
    this._lightboxIndex = index;
    this._renderLightboxImage();
    this.shadowRoot.querySelector(".lightbox").hidden = false;
  }
 
  _closeLightbox() {
    this.shadowRoot.querySelector(".lightbox").hidden = true;
  }
 
  _lightboxStep(direction) {
    const total = this._flatList.length;
    this._lightboxIndex = ((this._lightboxIndex + direction) % total + total) % total;
    this._renderLightboxImage();
  }
 
  _renderLightboxImage() {
    const flyer = this._flatList[this._lightboxIndex];
    if (!flyer) return;
    const full = flyer.full || flyer.thumb || "";
    const img = this.shadowRoot.querySelector(".lightbox img");
    img.src = full;
    img.alt = "Show flyer";
  }
}
 
customElements.define("flyer-archive", FlyerArchive);
 

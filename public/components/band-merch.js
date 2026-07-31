const MERCH_TEMPLATE = document.createElement("template");
MERCH_TEMPLATE.innerHTML = `
<style>
  :host {
    --lm-bg: #000000;
    --lm-fg: #ffffff;
    --lm-muted: #888888;
    --lm-font-heading: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --lm-font-body: 'Arial Narrow', 'Helvetica Neue', sans-serif;
    --lm-font-weight-body: 400;
    --lm-label-tracking: 0.12em;
    --lm-card-gap: 20px;
    --lm-image-radius: 0px;
    --lm-button-align: center;
    --lm-button-bg: transparent;
    --lm-button-fg: var(--lm-fg);
    --lm-button-border: var(--lm-fg);
    --lm-button-radius: 0px;
    --lm-columns: 2;
    --lm-padding: 28px;
    --lm-header-gap: 20px;
    --lm-arrow-size: 32px;
    --lm-arrow-offset: -8px;
    --lm-min-height: 380px;
    --lm-footer-gap: 26px;
    --lm-single-image-size: 150px;
    --lm-image-border: none;
 
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: var(--lm-min-height);
    background: var(--lm-bg);
    color: var(--lm-fg);
    font-family: var(--lm-font-body);
    padding: var(--lm-padding);
    box-sizing: border-box;
  }
 
  * { box-sizing: border-box; }
 
  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: var(--lm-header-gap);
  }
 
  .header h2 {
    margin: 0;
    font-family: var(--lm-font-heading);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: var(--lm-label-tracking);
    text-transform: uppercase;
  }
 
  .header .view-all {
    font-family: var(--lm-font-heading);
    font-size: 13px;
    letter-spacing: var(--lm-label-tracking);
    text-transform: uppercase;
    color: var(--lm-button-fg);
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
    background: var(--lm-bg);
    border: 1px solid var(--lm-fg);
    color: var(--lm-fg);
    cursor: pointer;
    font-size: 16px;
    width: var(--lm-arrow-size);
    height: var(--lm-arrow-size);
    line-height: 1;
    opacity: 0.7;
    z-index: 2;
  }
 
  .nav-arrows button:hover { opacity: 1; }
  .nav-arrows button:disabled { opacity: 0.25; cursor: default; }
 
  .nav-arrows .prev { left: var(--lm-arrow-offset); }
  .nav-arrows .next { right: var(--lm-arrow-offset); }
 
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--lm-columns), 1fr);
    gap: var(--lm-card-gap);
    flex: 1;
    align-content: start;
    touch-action: pan-y;
    transition: transform 0.25s ease;
  }
 
  .card {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
 
  .grid.single {
    display: flex;
  }
 
  .grid.single .card {
    flex-direction: row;
    align-items: center;
    gap: 20px;
    width: 100%;
  }
 
  .grid.single .card img {
    width: var(--lm-single-image-size);
    height: var(--lm-single-image-size);
    aspect-ratio: 1 / 1;
    object-fit: cover;
    flex-shrink: 0;
  }
 
  .grid.single .card-link {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    width: 100%;
  }
 
  .grid.single .card-text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
 
  .grid.single .product-title {
    font-size: 18px;
    max-height: none;
    white-space: normal;
  }
 
  .grid.single .product-meta {
    font-size: 14px;
  }
 
  .card img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: var(--lm-image-radius);
    background: #000;
    display: block;
    border: var(--lm-image-border);
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
 
  .card a.card-link {
    color: inherit;
    text-decoration: none;
  }
 
  .card .product-title {
    font-family: var(--lm-font-heading);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    max-height: 2.6em;
    overflow: hidden;
  }
 
  .card .product-meta {
    font-family: var(--lm-font-body);
    font-size: 11px;
    font-weight: var(--lm-font-weight-body);
    color: var(--lm-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
 
  .state-message {
    font-size: 13px;
    color: var(--lm-muted);
    padding: 30px 0;
    text-align: center;
    width: 100%;
  }
 
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
 
  .swipe-dots .dot.active {
    background: #ffffff;
  }
 
  @media (max-width: 700px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      justify-content: center;
    }
    .card { max-width: 140px; margin: 0 auto; }
    .card .product-title { font-size: 11px; }
    .card .product-meta { font-size: 9px; }
  }
</style>
 
<div class="header">
  <h2 part="title"></h2>
  <a class="view-all" href="#"></a>
</div>
 
<div class="grid-wrap">
  <div class="nav-arrows" hidden>
    <button class="prev" aria-label="Previous page">&#8249;</button>
    <button class="next" aria-label="Next page">&#8250;</button>
  </div>
  <div class="grid"></div>
</div>
<div class="swipe-dots"></div>
`;
 
function normalizeForMatch(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
 
class BandMerch extends HTMLElement {
  static get observedAttributes() {
    return [
      "api-endpoint",
      "store-url",
      "match-name",
      "title",
      "view-all-text",
      "view-all-url",
      "button-position",
      "columns",
    ];
  }
 
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(MERCH_TEMPLATE.content.cloneNode(true));
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
      this.shadowRoot.host.style.setProperty("--lm-columns", String(this.columns));
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
  get storeUrl() { return (this.getAttribute("store-url") || "").replace(/\/$/, ""); }
  get matchName() { return this.getAttribute("match-name") || ""; }
 
  get columns() {
    if (window.matchMedia("(max-width: 700px)").matches) return 2;
    return Number(this.getAttribute("columns") || 2);
  }
 
  get rows() {
    if (window.matchMedia("(max-width: 700px)").matches) return 2;
    return 1;
  }
 
  get perPage() {
    return this.columns * this.rows;
  }
 
  get titleText() { return this.getAttribute("title") || "Merch"; }
  get viewAllText() { return this.getAttribute("view-all-text") || "View All Merch"; }
  get viewAllArrow() { return this.viewAllText + " →"; }
 
  _render() {
    const root = this.shadowRoot;
    root.querySelector("h2").textContent = this.titleText;
    root.host.style.setProperty("--lm-columns", String(this.columns));
 
    const buttonPosition = this.getAttribute("button-position") || "center";
    root.host.style.setProperty("--lm-button-align", buttonPosition);
 
    const viewAllLink = root.querySelector(".view-all");
    viewAllLink.textContent = this.viewAllArrow;
    viewAllLink.href = this.getAttribute("view-all-url") || "#";
  }
 
  async _loadData() {
    const grid = this.shadowRoot.querySelector(".grid");
    const arrowsWrap = this.shadowRoot.querySelector(".nav-arrows");
 
    if (!this.apiEndpoint || !this.matchName) {
      grid.innerHTML = `<div class="state-message">Set api-endpoint and match-name to load merch.</div>`;
      return;
    }
 
    grid.innerHTML = `<div class="state-message">Loading merch…</div>`;
 
    try {
      const response = await fetch(this.apiEndpoint);
      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      const allProducts = await response.json();
 
      const needle = normalizeForMatch(this.matchName);
 
      const matches = allProducts.filter((p) => {
        if (p.status !== "active" || !p.images || !p.images.length) return false;
        return needle && normalizeForMatch(p.name).includes(needle);
      });
 
      this._flatList = matches;
      this._rebuildPages();
    } catch (err) {
      console.error("[band-merch] failed to load:", err);
      grid.innerHTML = `<div class="state-message">Couldn't load merch right now.</div>`;
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
      this.style.display = "none";
      this.dispatchEvent(new CustomEvent("merch-empty", { bubbles: true, composed: true }));
      return;
    }
 
    this.style.display = "";
 
    const totalPages = this._totalPages();
    arrowsWrap.hidden = !(totalPages > 1);
 
    const pageItems = this._pages[this._page];
    const isSingleItem = this._flatList.length === 1;
 
    grid.classList.toggle("single", isSingleItem);
 
    if (isSingleItem) {
      const p = pageItems[0];
      const image = p.images?.[0]?.url || "";
      const price = this._formatPrice(p);
      const link = `${this.storeUrl}${p.url}`;
 
      grid.innerHTML = `
        <div class="card">
          <a class="card-link" href="${window.TextHelper.escapeAttr(link)}" target="_blank" rel="noopener">
            <img src="${window.TextHelper.escapeAttr(image)}" alt="${window.TextHelper.escapeAttr(p.name)}" />
            <div class="card-text">
              <div class="product-title">${window.TextHelper.escapeText(p.name)}</div>
              <div class="product-meta">${price}</div>
            </div>
          </a>
        </div>
      `;
    } else {
      grid.innerHTML = pageItems
        .map((p) => {
          const image = p.images?.[0]?.url || "";
          const price = this._formatPrice(p);
          const link = `${this.storeUrl}${p.url}`;
          return `
            <div class="card">
              <a class="card-link" href="${window.TextHelper.escapeAttr(link)}" target="_blank" rel="noopener">
                <img src="${window.TextHelper.escapeAttr(image)}" alt="${window.TextHelper.escapeAttr(p.name)}" />
                <div class="product-title">${window.TextHelper.escapeText(p.name)}</div>
                <div class="product-meta">${price}</div>
              </a>
            </div>
          `;
        })
        .join("");
    }
 
    requestAnimationFrame(() => {
      this.shadowRoot.querySelectorAll(".product-title").forEach((el) => {
        window.TextHelper.fitTextToLines(el, 2);
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
 
  _formatPrice(product) {
    const prices = (product.options || []).map((o) => o.price);
    const min = prices.length ? Math.min(...prices) : product.price;
    const max = prices.length ? Math.max(...prices) : product.price;
    const fmt = (n) => `$${Number(n).toFixed(2)}`;
    return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
  }
}
 
customElements.define("band-merch", BandMerch);
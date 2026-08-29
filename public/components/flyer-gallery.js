const FRAME_META = {
  1:  { w: 294, h: 360, hole: { left: 0.0748, top: 0.1278, right: 0.8776, bottom: 0.9056 } },
  2:  { w: 314, h: 360, hole: { left: 0.1529, top: 0.1250, right: 0.8599, bottom: 0.8889 } },
  3:  { w: 289, h: 360, hole: { left: 0.0830, top: 0.1139, right: 0.8962, bottom: 0.9389 } },
  4:  { w: 300, h: 360, hole: { left: 0.1400, top: 0.1306, right: 0.8867, bottom: 0.9222 } },
  5:  { w: 294, h: 345, hole: { left: 0.1429, top: 0.1072, right: 0.8639, bottom: 0.8870 } },
  6:  { w: 314, h: 345, hole: { left: 0.1561, top: 0.1275, right: 0.8312, bottom: 0.9072 } },
  7:  { w: 289, h: 345, hole: { left: 0.0692, top: 0.1391, right: 0.8443, bottom: 0.9043 } },
  9:  { w: 294, h: 327, hole: { left: 0.1020, top: 0.0765, right: 0.8401, bottom: 0.9144 } },
  10: { w: 314, h: 327, hole: { left: 0.1369, top: 0.0917, right: 0.8503, bottom: 0.9052 } },
  11: { w: 289, h: 327, hole: { left: 0.1246, top: 0.0826, right: 0.8927, bottom: 0.9083 } },
  12: { w: 300, h: 327, hole: { left: 0.1667, top: 0.1070, right: 0.8867, bottom: 0.9083 } },
};
const FEATURED_DEFAULT_FRAME = 4;
const GRID_FRAME_CYCLE = [1, 2, 3, 5, 6, 7, 9, 10, 11, 12];
const ROTATIONS = [-2, 1.5, -1, 2.2, -1.6, 1.1, -2.4, 1.8];
const GRID_PAGE_SIZE = 12;
const MOBILE_BREAKPOINT = 500;

function getTotalPages(itemCount, perPage) {
  return Math.max(1, Math.ceil(itemCount / perPage));
}
function wrapPage(page, totalPages) {
  if (page < 0) return totalPages - 1;
  if (page >= totalPages) return 0;
  return page;
}

class FlyerGallery extends HTMLElement {
  static get observedAttributes() {
    return ['cloud-name', 'base-transform', 'featured-transform', 'grid-transform', 'frame-base-url'];
  }

  constructor() {
    super();
    this._images = [];
    this._page = 0;
    this._selectedIndex = 0;
    this._source = {
      cloudName: '',
      baseTransform: 'f_auto,q_auto',
      featuredTransform: 'w_900',
      gridTransform: 'w_500,h_650,c_fill',
      frameBaseUrl: 'frames/',
    };
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._readAttributes();
    this._readInlineJSON();
    this._render();
  }

  attributeChangedCallback() {
    this._readAttributes();
    this._render();
  }

  _readAttributes() {
    this._source.cloudName = this.getAttribute('cloud-name') || this._source.cloudName;
    this._source.baseTransform = this.getAttribute('base-transform') || this._source.baseTransform;
    this._source.featuredTransform = this.getAttribute('featured-transform') || this._source.featuredTransform;
    this._source.gridTransform = this.getAttribute('grid-transform') || this._source.gridTransform;
    this._source.frameBaseUrl = this.getAttribute('frame-base-url') || this._source.frameBaseUrl;
  }

  _readInlineJSON() {
    if (this._images.length) return;
    const script = this.querySelector('script[type="application/json"]');
    if (script) {
      try {
        this._images = JSON.parse(script.textContent);
      } catch (e) {
        console.error('flyer-gallery: could not parse inline JSON', e);
      }
    }
  }

  setSource(partial) {
    Object.assign(this._source, partial);
    this._render();
  }

  set images(list) {
    this._images = Array.isArray(list) ? list : [];
    this._page = 0;
    this._selectedIndex = 0;
    this._render();
  }
  get images() {
    return this._images;
  }

  nextPage() {
    const total = getTotalPages(this._images.length, GRID_PAGE_SIZE);
    this._page = wrapPage(this._page + 1, total);
    this._render();
  }

  prevPage() {
    const total = getTotalPages(this._images.length, GRID_PAGE_SIZE);
    this._page = wrapPage(this._page - 1, total);
    this._render();
  }

  _resolvePhotoUrl(item, transformExtra) {
    if (item.url) return item.url;
    if (!item.publicId || !this._source.cloudName) return '';
    const t = [this._source.baseTransform, transformExtra].filter(Boolean).join(',');
    return `https://res.cloudinary.com/${this._source.cloudName}/image/upload/${t}/${item.publicId}`;
  }

  _frameUrl(id) {
    const padded = String(id).padStart(2, '0');
    return `${this._source.frameBaseUrl}frame-${padded}.png`;
  }

  _isMobile() {
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  }

  _lightboxUrl(item) {
    if (item.url) return item.url;
    return this._resolvePhotoUrl(item, 'w_1200');
  }

  _openLightbox(idx) {
    this._lightboxIndex = idx;
    this._renderLightbox();
    this.shadowRoot.querySelector('.fg-lightbox').hidden = false;
  }

  _closeLightbox() {
    this.shadowRoot.querySelector('.fg-lightbox').hidden = true;
  }

  _lightboxStep(direction) {
    const total = this._images.length;
    this._lightboxIndex = ((this._lightboxIndex + direction) % total + total) % total;
    this._renderLightbox();
  }

  _renderLightbox() {
    const item = this._images[this._lightboxIndex];
    if (!item) return;
    const img = this.shadowRoot.querySelector('.fg-lightbox img');
    img.src = this._lightboxUrl(item);
    img.alt = item.alt || '';
  }

  _setupLightbox() {
    const root = this.shadowRoot;
    const lightbox = root.querySelector('.fg-lightbox');
    const closeBtn = root.querySelector('.fg-lightbox-close');

    closeBtn.addEventListener('click', () => this._closeLightbox());
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) this._closeLightbox();
    });

    let touchStartX = 0;
    const img = lightbox.querySelector('img');

    img.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    img.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });

    img.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) < 40) return;
      this._lightboxStep(deltaX < 0 ? 1 : -1);
    }, { passive: true });

    if (!this._keyboardBound) {
      this._keyboardBound = true;
      document.addEventListener('keydown', (e) => {
        const lb = this.shadowRoot.querySelector('.fg-lightbox');
        if (!lb || lb.hidden) return;
        if (e.key === 'Escape') this._closeLightbox();
        if (e.key === 'ArrowLeft') this._lightboxStep(-1);
        if (e.key === 'ArrowRight') this._lightboxStep(1);
      });
    }
  }

  _render() {
    const root = this.shadowRoot;
    const isMobile = this._isMobile();
    const total = this._images.length;
    if (this._selectedIndex >= total) this._selectedIndex = 0;
    const featured = this._images[this._selectedIndex];

    const totalPages = getTotalPages(total, GRID_PAGE_SIZE);
    if (this._page >= totalPages) this._page = 0;

    const start = isMobile ? 0 : this._page * GRID_PAGE_SIZE;
    const visible = isMobile ? this._images : this._images.slice(start, start + GRID_PAGE_SIZE);
    const emptyCount = isMobile ? 0 : GRID_PAGE_SIZE - visible.length;

    const gridTiles = visible.map((it, i) => this._tile(it, {
      isFeatured: false,
      frameId: it.frameId || GRID_FRAME_CYCLE[i % GRID_FRAME_CYCLE.length],
      transform: this._source.gridTransform,
      rotation: ROTATIONS[i % ROTATIONS.length],
      idx: start + i,
      isSelected: start + i === this._selectedIndex,
    })).join('') + Array.from({ length: emptyCount }, (_, j) => this._emptyTile(visible.length + j)).join('');

    const showNextBtn = !isMobile && totalPages > 1;

    root.innerHTML = `<style>${FlyerGallery.STYLES}</style>` +
      `<div class="fg-wrap">` +
        `<div class="fg-featured-col">${featured ? this._tile(featured, {
          isFeatured: true,
          frameId: featured.frameId || FEATURED_DEFAULT_FRAME,
          transform: this._source.featuredTransform,
          rotation: 0,
        }) : ''}</div>` +
        `<div class="fg-grid-col">` +
          `<div class="fg-grid">${gridTiles}</div>` +
          (showNextBtn ? `
          <button class="fg-page-btn fg-page-next" aria-label="Next flyers">&#8250;</button>` : '') +
        `</div>` +
      `</div>` +
      `<div class="fg-lightbox" hidden>` +
        `<button class="fg-lightbox-close" aria-label="Close">&times;</button>` +
        `<img src="" alt="" />` +
      `</div>`;

    const nextBtn = root.querySelector('.fg-page-next');
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());

    root.querySelectorAll('.fg-tile-grid:not(.fg-tile-empty)').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = Number(el.dataset.idx);
        if (isMobile) {
          this._openLightbox(idx);
        } else {
          this._selectFeatured(idx);
        }
      });
    });

    this._setupLightbox();
  }

  _emptyTile(i) {
    const frameId = GRID_FRAME_CYCLE[i % GRID_FRAME_CYCLE.length];
    const meta = FRAME_META[frameId] || FRAME_META[1];
    return `<div class="fg-tile-grid fg-tile-empty" aria-hidden="true">
      <div class="fg-frame-box" style="aspect-ratio:${meta.w}/${meta.h};"></div>
    </div>`;
  }

  _selectFeatured(idx) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= this._images.length) return;
    this._selectedIndex = idx;
    this._render();
  }

  _tile(item, opts) {
    const { isFeatured, frameId, transform, rotation, idx, isSelected } = opts;
    const meta = FRAME_META[frameId] || FRAME_META[1];
    const photoSrc = this._resolvePhotoUrl(item, transform);
    const frameSrc = this._frameUrl(frameId);
    const h = meta.hole;
    const photoInset = `${(h.top * 100).toFixed(2)}% ${(100 - h.right * 100).toFixed(2)}% ${(100 - h.bottom * 100).toFixed(2)}% ${(h.left * 100).toFixed(2)}%`;

    const inner = `
      <div class="fg-frame-box" style="aspect-ratio:${meta.w}/${meta.h}; --fg-rot:${rotation}deg;">
        <div class="fg-photo-slot" style="inset:${photoInset};">
          <img class="fg-photo-img" src="${photoSrc}" alt="${this._esc(item.alt || '')}" loading="lazy" />
        </div>
        <img class="fg-frame-img" src="${frameSrc}" alt="" aria-hidden="true" />
      </div>`;

    let cls = isFeatured ? 'fg-tile-link fg-tile-featured' : 'fg-tile-link fg-tile-grid';
    if (isSelected) cls += ' is-selected';
    const idxAttr = isFeatured ? '' : ` data-idx="${idx}"`;
    return item.href
      ? `<a class="${cls}"${idxAttr} href="${this._esc(item.href)}">${inner}</a>`
      : `<div class="${cls}"${idxAttr}>${inner}</div>`;
  }

  _esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
}

FlyerGallery.STYLES = `
  :host {
    display: block;
    --fg-photo-filter: grayscale(1) contrast(1.15);
    --fg-accent: #4fdc2a;
    font-family: inherit;
  }

  .fg-wrap {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 50px;
    align-items: flex-start;
  }

  .fg-tile-link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  .fg-frame-box {
    position: relative;
    filter: drop-shadow(0 16px 30px rgba(0,0,0,.55));
    transform: rotate(var(--fg-rot, 0deg)) scale(1);
    transition: transform .2s ease;
  }
  .fg-tile-link:hover .fg-frame-box {
    transform: rotate(var(--fg-rot, 0deg)) scale(1.06);
  }
  .fg-tile-grid.is-selected .fg-frame-box {
    transform: rotate(var(--fg-rot, 0deg)) scale(1.05);
  }
  .fg-photo-slot {
    position: absolute;
    overflow: hidden;
    z-index: 1;
  }
  .fg-photo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    background: #0c0c0c;
    filter: var(--fg-photo-filter);
    transition: filter .25s ease;
  }
  .fg-tile-link:hover .fg-photo-img {
    filter: none;
  }
  .fg-tile-grid.is-selected .fg-photo-img {
    filter: none;
  }
  .fg-tile-featured .fg-photo-img {
    filter: none;
  }
  .fg-frame-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
    z-index: 2;
    user-select: none;
  }

  .fg-featured-col {
    flex: 0 0 600px;
    max-width: 100%;
    min-height: 790px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .fg-tile-featured {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .fg-tile-featured .fg-frame-box {
    width: 100%;
    max-width: 600px;
  }

  .fg-tile-grid {
    cursor: pointer;
  }
  .fg-tile-grid .fg-frame-box {
    width: 100%;
  }
  .fg-tile-empty {
    visibility: hidden;
    cursor: default;
  }

  .fg-grid-col {
    position: relative;
    flex: 0 0 896px;
    max-width: 100%;
    box-sizing: border-box;
    padding-right: 56px;
  }
  .fg-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 22px 16px;
    min-height: 790px;
    align-content: start;
  }
  @media (max-width: 500px) {
    .fg-grid { grid-template-columns: repeat(2, 1fr); min-height: 0; }
    .fg-featured-col { display: none; }
    .fg-grid-col { padding-right: 0; }
    .fg-page-btn {
      position: static;
      transform: none;
      display: block;
      margin: 20px auto 0;
    }
  }

.fg-page-btn {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  background: #fff;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 10px 12px;
  color: #000;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: color .15s ease;
  user-select: none;
  -webkit-user-select: none;
}
.fg-page-btn:hover {
  color: #333;
}

.fg-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fg-lightbox[hidden] { display: none; }

.fg-lightbox img {
  max-width: min(92vw, 800px);
  max-height: 85vh;
  object-fit: contain;
  display: block;
  touch-action: none;
}

.fg-lightbox-close {
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
`;

customElements.define('flyer-gallery', FlyerGallery);
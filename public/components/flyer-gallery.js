const FRAME_META = {
  1:  { w: 294, h: 360, hole: { left: 0.0748, top: 0.1278, right: 0.8776, bottom: 0.9056 } },
  2:  { w: 314, h: 360, hole: { left: 0.1529, top: 0.1250, right: 0.8599, bottom: 0.8889 } },
  3:  { w: 289, h: 360, hole: { left: 0.0830, top: 0.1139, right: 0.8962, bottom: 0.9389 } },
  4:  { w: 300, h: 360, hole: { left: 0.1400, top: 0.1306, right: 0.8867, bottom: 0.9222 } },
  5:  { w: 294, h: 345, hole: { left: 0.1429, top: 0.1072, right: 0.8639, bottom: 0.8870 } },
  6:  { w: 314, h: 345, hole: { left: 0.1561, top: 0.1275, right: 0.8312, bottom: 0.9072 } },
  7:  { w: 289, h: 345, hole: { left: 0.0692, top: 0.1391, right: 0.8443, bottom: 0.9043 } },
  8:  { w: 300, h: 345, hole: { left: 0.0800, top: 0.2435, right: 0.9233, bottom: 0.8580 } },
  9:  { w: 294, h: 327, hole: { left: 0.1020, top: 0.0765, right: 0.8401, bottom: 0.9144 } },
  10: { w: 314, h: 327, hole: { left: 0.1369, top: 0.0917, right: 0.8503, bottom: 0.9052 } },
  11: { w: 289, h: 327, hole: { left: 0.1246, top: 0.0826, right: 0.8927, bottom: 0.9083 } },
  12: { w: 300, h: 327, hole: { left: 0.1667, top: 0.1070, right: 0.8867, bottom: 0.9083 } },
};
const FEATURED_DEFAULT_FRAME = 4;
const GRID_FRAME_CYCLE = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12];
const ROTATIONS = [-2, 1.5, -1, 2.2, -1.6, 1.1, -2.4, 1.8];

class FlyerGallery extends HTMLElement {
  static get observedAttributes() {
    return ['cloud-name', 'base-transform', 'featured-transform', 'grid-transform', 'frame-base-url'];
  }

  constructor() {
    super();
    this._images = [];
    this._visibleCount = 12;
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
    this._visibleCount = 12;
    this._render();
  }
  get images() {
    return this._images;
  }

  loadMore(n = 12) {
    this._visibleCount += n;
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

  _render() {
    const root = this.shadowRoot;
    const [featured, ...rest] = this._images;
    const visible = rest.slice(0, this._visibleCount);
    const hasMore = rest.length > this._visibleCount;

    root.innerHTML = `<style>${FlyerGallery.STYLES}</style>` +
      `<div class="fg-wrap">` +
        `<div class="fg-featured-col">${featured ? this._tile(featured, {
          isFeatured: true,
          frameId: featured.frameId || FEATURED_DEFAULT_FRAME,
          transform: this._source.featuredTransform,
          rotation: 0,
        }) : ''}</div>` +
        `<div class="fg-grid-col">` +
          `<div class="fg-grid">${visible.map((it, i) => this._tile(it, {
            isFeatured: false,
            frameId: it.frameId || GRID_FRAME_CYCLE[i % GRID_FRAME_CYCLE.length],
            transform: this._source.gridTransform,
            rotation: ROTATIONS[i % ROTATIONS.length],
            idx: i + 1,
          })).join('')}</div>` +
          (hasMore ? `<button class="fg-load-more" part="load-more">Load More Flyers</button>` : '') +
        `</div>` +
      `</div>`;

    const loadMoreBtn = root.querySelector('.fg-load-more');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMore());
    }

    root.querySelectorAll('.fg-tile-grid').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this._promoteToFeatured(Number(el.dataset.idx));
      });
    });
  }

  _promoteToFeatured(idx) {
    if (!Number.isInteger(idx) || idx <= 0 || idx >= this._images.length) return;
    const [item] = this._images.splice(idx, 1);
    this._images.unshift(item);
    this._render();
  }

  _tile(item, opts) {
    const { isFeatured, frameId, transform, rotation, idx } = opts;
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

    const cls = isFeatured ? 'fg-tile-link fg-tile-featured' : 'fg-tile-link fg-tile-grid';
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
    flex: 0 0 380px;
    max-width: 100%;
    display: flex;
    justify-content: center;
    padding: 24px;
  }
  .fg-tile-featured {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .fg-tile-featured .fg-frame-box {
    width: 100%;
    max-width: 380px;
  }

  .fg-tile-grid {
    cursor: pointer;
  }
  .fg-tile-grid .fg-frame-box {
    width: 100%;
  }

  .fg-grid-col {
    flex: 0 0 760px;
    max-width: 100%;
  }
  .fg-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px 22px;
  }
  @media (max-width: 500px) {
    .fg-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .fg-load-more {
    margin-top: 32px;
    display: block;
    margin-inline: auto;
    background: transparent;
    border: 1px solid var(--fg-accent);
    color: var(--fg-accent);
    font: inherit;
    font-size: 12px;
    letter-spacing: .1em;
    text-transform: uppercase;
    padding: 12px 28px;
    cursor: pointer;
    transition: background .15s ease, color .15s ease;
  }
  .fg-load-more:hover {
    background: var(--fg-accent);
    color: #05130a;
  }
`;

customElements.define('flyer-gallery', FlyerGallery);
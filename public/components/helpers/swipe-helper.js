function attachSwipeBehavior(grid, { getPage, getTotalPages, goToPage }) {
  if (grid._swipeAttached) return;
  grid._swipeAttached = true;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let dragging = false;
  let horizontal = null;
  grid.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;
    dragging = true;
    horizontal = null;
    grid.style.transition = "none";
  }, { passive: true });
  grid.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    currentX = e.touches[0].clientX;
    const dx = currentX - startX;
    const dy = e.touches[0].clientY - startY;
    if (horizontal === null) {
      horizontal = Math.abs(dx) > Math.abs(dy);
    }
    if (!horizontal) return;
    e.preventDefault();
    const atStart = getPage() === 0;
    const atEnd = getPage() >= getTotalPages() - 1;
    const resisted = (atStart && dx > 0) || (atEnd && dx < 0) ? dx * 0.35 : dx;
    grid.style.transform = `translateX(${resisted}px)`;
  }, { passive: false });
  grid.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;
    const dx = currentX - startX;
    grid.style.transition = "transform 0.25s ease";
    if (horizontal && Math.abs(dx) > 50) {
      const dir = dx < 0 ? 1 : -1;
      const width = grid.clientWidth;
      grid.style.transform = `translateX(${-dir * width}px)`;
      setTimeout(() => {
        grid.style.transition = "none";
        grid.style.transform = `translateX(${dir * width}px)`;
        goToPage(getPage() + dir);
        requestAnimationFrame(() => {
          grid.style.transition = "transform 0.25s ease";
          grid.style.transform = "translateX(0)";
        });
      }, 250);
    } else {
      grid.style.transform = "translateX(0)";
    }
  });
}
function renderPageDots(container, currentPage, totalPages) {
  if (!container) return;
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }
  let dotsHtml = "";
  for (let i = 0; i < totalPages; i++) {
    const isActive = i === currentPage;
    dotsHtml += `<span class="dot${isActive ? " active" : ""}"></span>`;
  }
  container.innerHTML = dotsHtml;
}
window.SwipeHelper = { attachSwipeBehavior, renderPageDots };
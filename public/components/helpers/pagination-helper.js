function getTotalPages(itemCount, perPage) {
  return Math.max(1, Math.ceil(itemCount / perPage));
}
function wrapPage(page, totalPages) {
  if (page < 0) return totalPages - 1;
  if (page >= totalPages) return 0;
  return page;
}
window.PaginationHelper = { getTotalPages, wrapPage };
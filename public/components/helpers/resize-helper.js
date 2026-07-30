function onResizeOnce(instance, callback) {
  if (instance._resizeListenerAttached) return;
  instance._resizeListenerAttached = true;
  window.addEventListener("resize", callback);
}
window.ResizeHelper = { onResizeOnce };
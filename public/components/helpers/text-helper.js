function escapeText(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return (str || "").replace(/"/g, "&quot;");
}
function parsePairs(str) {
  return (str || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [label, url] = entry.split("|").map((s) => s.trim());
      return { label, url };
    });
}
function fitTextToLines(el, maxLines, minFontSize = 9) {
  const startingFontSize = parseFloat(getComputedStyle(el).fontSize);
  let fontSize = startingFontSize;
  el.style.fontSize = fontSize + "px";
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
  const maxHeight = lineHeight * maxLines;
  while (el.scrollHeight > maxHeight && fontSize > minFontSize) {
    fontSize -= 0.5;
    el.style.fontSize = fontSize + "px";
  }
}
window.TextHelper = { escapeText, escapeAttr, parsePairs, fitTextToLines };

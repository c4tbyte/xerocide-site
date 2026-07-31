function renderSiteFooter() {
  const isHome =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("home.html");
  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  const hideBrand = isHome && isMobile;
 
  const footerHTML = `
    <simple-footer
      hide-brand="${hideBrand}"
      logo-src="images/nav-logo.jpg"
      logo-alt="Xerocide"
      logo-href="/"
      about-text="Tampa Bay metallic hardcore. Formed in 2025 to bring real heaviness back to the scene."
      columns="
        Quick Links:
          Shows|/shows,
          Releases|/releases,
          Merch|https://YOUR_STORE_HANDLE.bigcartel.com;
        Media:
          Photos|/photos,
          Videos|/videos;
        Info:
          Booking|/booking,
          Contact|/contact,
          Legal|/legal
      "
      connect-heading="Stay connected"
      connect-text="Follow along for new releases, shows, and merch drops."
      social="
        spotify|https://open.spotify.com/artist/4rYFE3Y8s6AgARellzfzL8,
        instagram|https://www.instagram.com/xerocidefl/,
        email|mailto:booking@xerocide.com
      "
    ></simple-footer>
  `;
 
  document.querySelectorAll("[data-site-footer]").forEach((el) => {
    el.innerHTML = footerHTML;
  });
}
 
document.addEventListener("DOMContentLoaded", renderSiteFooter);
 
window.FooterHelper = { renderSiteFooter };
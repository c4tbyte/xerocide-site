function renderSiteFooter() {
  const footerHTML = `
    <simple-footer
      logo-src="images/nav-logo.jpg"
      logo-alt="Xerocide"
      logo-href="/"
      about-text="Tampa Bay metallic hardcore. Formed in 2025 to bring real heaviness back to the scene."
      columns="
        Quick Links:
          Home|/,
          Shows|/shows,
          Releases|/releases,
          Merch|https://YOUR_STORE_HANDLE.bigcartel.com;
        Info:
          About|/about,
          Media|/media,
          Booking|/booking,
          Contact|/contact
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
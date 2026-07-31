function renderSiteFooter() {
  const footerHTML = `
    <simple-footer
      logo-src="images/nav-logo.jpg"
      logo-alt="Xerocide"
      logo-href="/"
      about-text="Xerocide is a Tampa Bay metallic hardcore band built on community, resilience, and empowerment. Est. 2025."
      columns="
        Quick Links:
          Shows|/shows,
          Releases|/releases,
          Merch|https://armageddonrecords.bigcartel.com;
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
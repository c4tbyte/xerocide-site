function renderSiteNav() {
  const navHTML = `
    <simple-nav
      logo-src="images/nav-logo.jpg"
      logo-alt="Xerocide"
      logo-href="/"
      links="
        Home|/,
        Shows|/shows,
        Releases|/releases,
        Media|/media,
        About|/about,
        Booking|/booking
      "
      social="
        spotify|https://open.spotify.com/artist/4rYFE3Y8s6AgARellzfzL8?si=zWLyWuRRTFKZ2i-FRKWFdQ,
        instagram|https://www.instagram.com/xerocidefl/,
        email|mailto:booking@xerocide.com
      "
    ></simple-nav>
  `;
 
  document.querySelectorAll("[data-site-nav]").forEach((el) => {
    el.innerHTML = navHTML;
  });
}
 
document.addEventListener("DOMContentLoaded", renderSiteNav);
 
window.NavHelper = { renderSiteNav };
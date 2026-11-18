/* Loads the anonymous visit statistics (Umami, self-hosted at stats.softef.com, no cookies).
   A classic script, shared by the app and the website pages, run before their modules.
   Each address has its own Umami website: the published site counts, localhost goes to a
   development website (to test the events), anywhere else nothing is loaded.
   What is sent is listed in STATISTIQUES.md, at the root of the repository. */
(function () {
  /** @type {Record<string, string>} */
  var SITES = {
    "ares-automa.softef.com": "4487b560-1c83-43eb-a099-51a68068405e",
    "localhost": "9e353929-8f01-48bc-8705-65e80d3c0066",
    "127.0.0.1": "9e353929-8f01-48bc-8705-65e80d3c0066"
  };
  var id = SITES[location.hostname];
  if (!id) return;
  /* app/analytics.js only keeps events for later where they can be sent */
  window.automaStats = true;
  function load() {
    if (window.umami || document.getElementById("umami-tracker")) return;
    var s = document.createElement("script");
    s.id = "umami-tracker"; // not "umami": an element id would show as window.umami and stop the tracker
    s.src = "https://stats.softef.com/s.js";
    s.setAttribute("data-website-id", id);
    s.setAttribute("data-do-not-track", "true");
    s.setAttribute("data-errors", "true");
    s.setAttribute("data-environment", location.hostname === "ares-automa.softef.com" ? "production" : "development");
    s.onload = function () { window.dispatchEvent(new Event("automa-stats-ready")); };
    /* offline or blocked: try again once the network is back */
    s.onerror = function () { s.remove(); };
    document.head.appendChild(s);
  }
  load();
  window.addEventListener("online", load);
})();

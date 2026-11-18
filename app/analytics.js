/* Anonymous visit statistics (Umami, no cookies). The Umami script is loaded by the pages
   (index.html, the website pages) and only counts on the published domain. It may be missing:
   offline, blocked, or not loaded yet. Then nothing is sent and the app works the same.
   Never put anything personal in the data: only the shape of the game. */

/** @param {string} name @param {Record<string, string | number | boolean>} [data] */
export function track(name, data) {
  try {
    /** @type {{ umami?: { track(name: string, data?: object): unknown } }} */ (/** @type {unknown} */ (window)).umami?.track(name, data);
  } catch { /* statistics never break the app */ }
}

/* the app installed from this page (the website pages share its manifest, but only the app counts it) */
window.addEventListener("appinstalled", () => track("install"));

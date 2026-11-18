/* Anonymous visit statistics (Umami, no cookies). The Umami script is loaded by the pages
   (index.html, the website pages) and only counts on the published domain. It may be missing:
   offline, blocked, or not loaded yet. Then nothing is sent and the app works the same.
   Never put anything personal in the data: only the shape of the game. */

import { t } from "./i18n.js";

/* ?notrack in the address turns the statistics off on this device (Umami reads the
   "umami.disabled" key of localStorage, shared by the app and the website), ?track turns
   them back on. Each browser has its own storage, and so does an app installed on iOS. */
const params = new URLSearchParams(location.search);
const choice = params.has("notrack") ? "off" : params.has("track") ? "on" : null;
if (choice) {
  try {
    if (choice === "off") localStorage.setItem("umami.disabled", "1");
    else localStorage.removeItem("umami.disabled");
    params.delete("notrack");
    params.delete("track");
    const rest = params.toString();
    history.replaceState(null, "", location.pathname + (rest ? `?${rest}` : "") + location.hash);
    setTimeout(() => window.alert(choice === "off" ? t.statsOff : t.statsOn), 300);
  } catch { /* no storage: nothing to remember */ }
}

/** @param {string} name @param {Record<string, string | number | boolean>} [data] */
export function track(name, data) {
  try {
    /** @type {{ umami?: { track(name: string, data?: object): unknown } }} */ (/** @type {unknown} */ (window)).umami?.track(name, data);
  } catch { /* statistics never break the app */ }
}

/* the app installed from this page (the website pages share its manifest, but only the app counts it) */
window.addEventListener("appinstalled", () => track("install"));

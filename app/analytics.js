/* Anonymous visit statistics (Umami, no cookies), loaded by stats.js. Every event sent is
   listed in STATISTIQUES.md, at the root of the repository: keep it up to date.
   Never put anything personal in the data: no free text, no exact time, no identifier.

   A game is often played offline. An event that cannot be sent waits in localStorage and
   leaves on the next visit online (at most 100 events, for 30 days). Umami then dates it at
   its sending: it gets late=true when it waited more than a minute. Where stats.js loads
   nothing (another address), or on a device that turned the statistics off, nothing is kept. */

import { t } from "./i18n.js";

/** @typedef {Record<string, string | number | boolean>} EventData */
/** @typedef {{ name: string, data: EventData, at: number }} Queued */

const QUEUE = "automa-stats-queue";
const UNDOS = "automa-stats-undos";
const MAX = 100;
const AGE = 30 * 24 * 3600 * 1000;
const LATE = 60 * 1000;

/** @returns {boolean} the statistics are turned off on this device (?notrack) */
function disabled() {
  try { return !!localStorage.getItem("umami.disabled"); } catch { return false; }
}

/** @returns {Queued[]} */
function readQueue() {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE) || "[]");
    return Array.isArray(q) ? q : [];
  } catch { return []; }
}
/** @param {Queued[]} q */
function writeQueue(q) {
  try {
    if (q.length) localStorage.setItem(QUEUE, JSON.stringify(q.slice(-MAX)));
    else localStorage.removeItem(QUEUE);
  } catch { /* no storage: the event is lost */ }
}

/* sends the waiting events, if the tracker is there and the device online */
function flush() {
  const umami = window.umami;
  if (!umami || !navigator.onLine) return;
  const now = Date.now();
  const q = readQueue().filter(e => now - e.at < AGE);
  writeQueue([]);
  for (const e of q) {
    try { umami.track(e.name, now - e.at > LATE ? { ...e.data, late: true } : e.data); } catch { /* never breaks the app */ }
  }
}

/** sends an event now, or later if it cannot leave now
    @param {string} name @param {EventData} [data] */
export function track(name, data = {}) {
  if (!window.automaStats || disabled()) return;
  writeQueue([...readQueue(), { name, data, at: Date.now() }]);
  flush();
}

window.addEventListener("automa-stats-ready", flush);
window.addEventListener("online", flush);
flush();

/* ---------- Undos of a game: counted on the device, sent with its end ---------- */

/** @param {number} createdAt the game @returns {number} */
export function undosOf(createdAt) {
  try {
    const u = JSON.parse(localStorage.getItem(UNDOS) || "null");
    return u && u.game === createdAt ? Number(u.n) || 0 : 0;
  } catch { return 0; }
}
/** @param {number} createdAt the game */
export function countUndo(createdAt) {
  try { localStorage.setItem(UNDOS, JSON.stringify({ game: createdAt, n: undosOf(createdAt) + 1 })); } catch { /* not counted */ }
}

/* ---------- ?notrack and ?track ---------- */

/* ?notrack in the address turns the statistics off on this device (Umami reads the
   "umami.disabled" key of localStorage, shared by the app and the website), ?track turns
   them back on. Each browser has its own storage, and so does an app installed on iOS. */
const params = new URLSearchParams(location.search);
const choice = params.has("notrack") ? "off" : params.has("track") ? "on" : null;
if (choice) {
  try {
    if (choice === "off") { localStorage.setItem("umami.disabled", "1"); localStorage.removeItem(QUEUE); }
    else localStorage.removeItem("umami.disabled");
    params.delete("notrack");
    params.delete("track");
    const rest = params.toString();
    history.replaceState(null, "", location.pathname + (rest ? `?${rest}` : "") + location.hash);
    setTimeout(() => window.alert(choice === "off" ? t.statsOff : t.statsOn), 300);
  } catch { /* no storage: nothing to remember */ }
}

/* the app installed from this page (the website pages share its manifest, but only the app counts it) */
window.addEventListener("appinstalled", () => track("install"));

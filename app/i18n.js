import fr from "./i18n/fr.js";
import en from "./i18n/en.js";
/** @typedef {import("./i18n/fr.js").Messages} Messages */

/* The language of the app: the one chosen on the website (same localStorage key, "lang"),
   else the browser's (English unless French). Changing it reloads the app, which keeps its
   game: every component then renders in the new language. */
const KEY = "lang";

/** @returns {"fr" | "en"} */
function detect() {
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* no storage */ }
  if (saved === "fr" || saved === "en") return saved;
  return /^fr\b/i.test(navigator.languages?.[0] || navigator.language || "") ? "fr" : "en";
}

export const lang = detect();
/** the texts in the current language @type {Messages} */
export const t = lang === "en" ? en : fr;
document.documentElement.lang = lang;

/** @param {"fr" | "en"} next */
export function setLang(next) {
  try { localStorage.setItem(KEY, next); } catch { /* not saved: only for this visit */ }
  location.reload();
}

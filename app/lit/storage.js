import { isCurrent } from "./engine.js";
/** @typedef {import("./engine.js").Game} Game */
/** @typedef {import("./engine.js").GameRecord} GameRecord */

/* Saving in the browser (localStorage). The keys differ from the prototype's, so both apps
   can be open on the same site without overwriting each other's game.
   Every access is wrapped: storage can be full, blocked or missing (private browsing). */
const GAME = "automa-lit-partie", HISTORY = "automa-lit-historique", HISTORY_MAX = 100;

/** @template T @param {string} key @param {T} fallback @returns {T} */
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; } };
/** @param {string} key @param {unknown} value */
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* not saved */ } };

/** the game in progress, or null (a save from older rules is ignored) @returns {Game | null} */
export function loadGame() { const st = read(GAME, null); return isCurrent(st) ? st : null; }
/** @param {Game | null} st */
export function saveGame(st) {
  if (st) write(GAME, { ...st, savedAt: Date.now() });
  else try { localStorage.removeItem(GAME); } catch { /* nothing to remove */ }
}

/** @returns {GameRecord[]} */
export const loadHistory = () => read(HISTORY, /** @type {GameRecord[]} */ ([]));
/** @param {GameRecord} record */
export function addToHistory(record) { write(HISTORY, [record, ...loadHistory()].slice(0, HISTORY_MAX)); }

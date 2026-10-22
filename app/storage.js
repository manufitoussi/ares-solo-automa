import { isCurrent } from "./engine.js";
/** @typedef {import("./engine.js").Game} Game */
/** @typedef {import("./engine.js").GameRecord} GameRecord */

/* Saving in the browser (localStorage). The keys are the prototype's, which this app replaces:
   on a device that played with it, the game in progress and the history are kept.
   Every access is wrapped: storage can be full, blocked or missing (private browsing). */
const GAME = "automa-hybride-partie", HISTORY = "automa-hybride-historique", HISTORY_MAX = 100;

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
/** @param {GameRecord[]} history */
export function saveHistory(history) { write(HISTORY, history.slice(0, HISTORY_MAX)); }
/** @param {GameRecord} record */
export function addToHistory(record) { write(HISTORY, [record, ...loadHistory()].slice(0, HISTORY_MAX)); }

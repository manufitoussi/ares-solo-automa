import { isCurrent } from "./engine.js";

/* Saving in the browser (localStorage). The keys differ from the prototype's, so both apps
   can be open on the same site without overwriting each other's game.
   Every access is wrapped: storage can be full, blocked or missing (private browsing). */
const GAME = "automa-lit-partie", HISTORY = "automa-lit-historique", HISTORY_MAX = 100;

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* not saved */ } };

/* the game in progress, or null (a save from older rules is ignored) */
export function loadGame() { const st = read(GAME, null); return isCurrent(st) ? st : null; }
export function saveGame(st) {
  if (st) write(GAME, { ...st, savedAt: Date.now() });
  else try { localStorage.removeItem(GAME); } catch { /* nothing to remove */ }
}

export const loadHistory = () => read(HISTORY, []);
export function addToHistory(record) { write(HISTORY, [record, ...loadHistory()].slice(0, HISTORY_MAX)); }

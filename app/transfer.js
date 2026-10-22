import { isCurrent } from "./engine.js";
/** @typedef {import("./engine.js").Game} Game */
/** @typedef {import("./engine.js").GameRecord} GameRecord */

/* Export and import of the saved data, to move it to another device or keep a copy:
   one JSON file with the game in progress (if any) and the history. Pure functions, no DOM. */

export const FORMAT = "ares-solo-automa";
const VERSION = 1;
const HISTORY_MAX = 100;

/** @typedef {{ format: string, version: number, exportedAt: string, game: Game | null, history: GameRecord[] }} ExportFile */

/** @param {{ game: Game | null, history: GameRecord[] }} data @param {string} [now] @returns {ExportFile} */
export function exportData({ game, history }, now = new Date().toISOString()) {
  return { format: FORMAT, version: VERSION, exportedAt: now, game, history };
}

/** Why a file cannot be imported: not JSON, not an export of this app, or nothing in it. */
export class ImportError extends Error {
  /** @param {"json" | "format" | "empty"} code */
  constructor(code) { super(`Cannot import: ${code}`); this.code = code; }
}

/** @param {unknown} r @returns {r is GameRecord} */
const isRecord = r => !!r && typeof r === "object"
  && typeof /** @type {GameRecord} */ (r).date === "string" && typeof /** @type {GameRecord} */ (r).scoreAutoma === "number";

/** Reads an exported file. A game saved with older rules is left out, like on loading.
    @param {string} text @returns {{ game: Game | null, history: GameRecord[] }} */
export function parseImport(text) {
  /** @type {Partial<ExportFile> | null} */
  let data;
  try { data = JSON.parse(text); } catch { throw new ImportError("json"); }
  if (!data || typeof data !== "object" || data.format !== FORMAT) throw new ImportError("format");
  const game = isCurrent(data.game) ? data.game : null;
  const history = Array.isArray(data.history) ? data.history.filter(isRecord) : [];
  if (!game && !history.length) throw new ImportError("empty");
  return { game, history };
}

/** the same saved game, whatever the file it comes from @param {GameRecord} r */
const recordKey = r => `${r.createdAt}|${r.date}`;

/** Adds the imported records to the history, without duplicates, most recent first.
    @param {GameRecord[]} current @param {GameRecord[]} incoming @returns {{ history: GameRecord[], added: number }} */
export function mergeHistory(current, incoming) {
  const known = new Set(current.map(recordKey));
  const fresh = incoming.filter(r => !known.has(recordKey(r)));
  const history = [...current, ...fresh].sort((a, b) => b.date.localeCompare(a.date)).slice(0, HISTORY_MAX);
  return { history, added: fresh.length };
}

import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "./engine.js";
import { exportData, parseImport, mergeHistory, ImportError, FORMAT } from "./transfer.js";

const game = E.newGame({ niveau: "normal" }, { now: 1 });
/** @param {string} date @param {number} createdAt @returns {E.GameRecord} */
const record = (date, createdAt) => ({ ...E.gameRecord(game, { date }), createdAt });

test("an exported file is read back as it was", () => {
  const history = [record("2026-10-20T10:00:00Z", 1)];
  const text = JSON.stringify(exportData({ game, history }, "2026-10-22T00:00:00Z"));
  assert.deepEqual(parseImport(text), { game, history });
  assert.equal(JSON.parse(text).format, FORMAT);
});

test("a file that is not an export of the app is refused", () => {
  /** @param {string} text */
  const code = text => { try { parseImport(text); return "ok"; } catch (e) { return e instanceof ImportError ? e.code : "other"; } };
  assert.equal(code("not json"), "json");
  assert.equal(code(JSON.stringify({ hello: 1 })), "format");
  assert.equal(code(JSON.stringify(exportData({ game: null, history: [] }))), "empty");
});

test("a game from older rules is left out, the history is kept", () => {
  const text = JSON.stringify(exportData({ game: { ...game, v: 2 }, history: [record("2026-10-20T10:00:00Z", 1)] }));
  const data = parseImport(text);
  assert.equal(data.game, null);
  assert.equal(data.history.length, 1);
});

test("imported games are added to the history once, most recent first", () => {
  const a = record("2026-10-19T10:00:00Z", 1), b = record("2026-10-20T10:00:00Z", 2), c = record("2026-10-21T10:00:00Z", 3);
  const { history, added } = mergeHistory([b, a], [c, a]);
  assert.equal(added, 1);
  assert.deepEqual(history.map(r => r.createdAt), [3, 2, 1]);
});

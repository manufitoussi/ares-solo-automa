import { test } from "node:test";
import assert from "node:assert/strict";
import * as E from "./engine.js";

/* deterministic random numbers, so a shuffled deck is the same at every run */
function seeded(seed = 1) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const setup = { niveau: "normal", pioche: "app", oxy: 0, temp: 0, oce: 0 };
const game = (over = {}) => ({ ...E.newGame(setup, { rng: seeded(), now: 0 }), ...over });

test("a new game starts with the engine of its level and a full deck", () => {
  for (const k of E.LEVELS) assert.equal(E.newGame({ ...setup, niveau: k }).a.moteur, E.MOTEUR0[k]);
  const st = game();
  assert.equal(st.v, E.STATE_VERSION);
  assert.deepEqual([...st.deck].sort((x, y) => x - y), E.CARDS.map(c => c.n));
  assert.deepEqual(st.a, { cubes: 0, moteur: 3, compteur: 0, nt: 5, pvFin: 0 });
  assert.equal(st.log.length, 1);
});

test("each phase gives +1 copper, then its effect", () => {
  const st = game({ a: { cubes: 4, moteur: 3, compteur: 0, nt: 5, pvFin: 0 } });
  assert.deepEqual(E.computePhase(st, "I").a, { cubes: 0, moteur: 4, compteur: 0, nt: 5, pvFin: 0 });
  assert.equal(E.computePhase(st, "II").a.compteur, 1);
  assert.equal(E.computePhase(st, "IV").a.cubes, 4 + 1 + 3);
  assert.equal(E.computePhase(st, "V").a.cubes, 5);
});

test("development does nothing more without a silver", () => {
  const r = E.computePhase(game(), "I");
  assert.equal(r.a.moteur, 3);
  assert.equal(r.ch.moteur, 0);
});

test("action spends every silver on the target, an ocean gives back 1 copper", () => {
  const st = game({ cible: "ocean", a: { cubes: 9, moteur: 3, compteur: 0, nt: 5, pvFin: 0 } });
  const r = E.computePhase(st, "III");
  /* 10 cubes: 1st ocean → 6, 2nd ocean → 2 */
  assert.equal(r.p.oce, 2);
  assert.equal(r.a.nt, 7);
  assert.equal(r.a.cubes, 2);
  assert.equal(r.ch.spent, 10);
});

test("a maxed target moves to the next one", () => {
  const p = { oxy: E.MAX.oxy, temp: 3, oce: 0 };
  assert.equal(E.effCible("oxy", p), "temp");
  assert.equal(E.effCible("ocean", { oxy: 0, temp: 0, oce: E.MAX.oce }), "oxy");
  const r = E.computePhase(game({ cible: "oxy", p, a: { cubes: 4, moteur: 3, compteur: 0, nt: 5, pvFin: 0 } }), "III");
  assert.equal(r.p.temp, 4);
  assert.equal(r.p.oxy, E.MAX.oxy);
});

test("reactive cards choose their phase", () => {
  const riposte = E.resolveCard(game({ card: 13, lastPlayerPhase: "II" }));
  assert.equal(riposte.phase, "II");
  assert.equal(E.resolveCard(game({ card: 13 })).phase, "IV");
  assert.equal(E.resolveCard(game({ card: 14 })).phase, "IV");
  assert.equal(E.resolveCard(game({ card: 14, a: { cubes: 5, moteur: 3, compteur: 0, nt: 5, pvFin: 0 } })).phase, "III");
  const course = E.resolveCard(game({ card: 15, p: { oxy: 7, temp: 2, oce: 5 } }));
  assert.deepEqual([course.phase, course.cible], ["III", "temp"]);
});

test("transitions never change the state they receive", () => {
  const st = game(), before = JSON.stringify(st);
  const st2 = E.draw(E.pickPhase(st, "IV"), { rng: seeded() });
  E.applyPhase(E.startPhases(st2));
  E.adjustAutoma(st, "cubes", 1);
  E.adjustParam(st, "oxy", 1);
  assert.equal(JSON.stringify(st), before);
});

test("the player cannot pick the phase of the previous round", () => {
  const st = game({ lastPlayerPhase: "III" });
  assert.equal(E.pickPhase(st, "III"), st);
  assert.equal(E.pickPhase(st, "IV").playerPhase, "IV");
});

test("a full round: plan, draw, phases in order, next turn", () => {
  let st = E.pickPhase(game(), "V");
  st = E.draw(st, { n: 1 }); /* card 1: Production, oxygen */
  assert.equal(st.automaPhase, "IV");
  assert.deepEqual(st.queue, ["IV", "V"]);
  assert.equal(st.step, "reveal");
  assert.ok(!st.deck.includes(1));
  st = E.startPhases(st);
  st = E.applyPhase(st);
  assert.equal(st.a.cubes, 4);
  st = E.applyPhase(st);
  assert.equal(st.a.cubes, 5);
  assert.equal(st.step, "endturn");
  st = E.nextTurn(st);
  assert.deepEqual([st.turn, st.step, st.lastPlayerPhase, st.playerPhase], [2, "plan", "V", null]);
  assert.deepEqual(st.discard, [1]);
  assert.deepEqual(st.track, [{ t: 1, a: 5, p: 5 }]);
});

test("an empty deck is reshuffled from the discard", () => {
  const st = E.draw(game({ playerPhase: "I", deck: [], discard: [3, 7] }), { rng: seeded() });
  assert.equal(st.discard.length, 0);
  assert.equal(st.deck.length, 1);
  assert.ok([3, 7].includes(st.card));
});

test("the game ends when every parameter is maxed, leftover silver scores", () => {
  const p = { oxy: E.MAX.oxy, temp: E.MAX.temp, oce: E.MAX.oce - 1 };
  let st = game({ p, cible: "ocean", playerPhase: "III", card: 6, automaPhase: "III", queue: ["III"], qi: 0, step: "phase",
    a: { cubes: 14, moteur: 3, compteur: 2, nt: 30, pvFin: 0 } });
  st = E.applyPhase(st);
  /* 15 cubes: 1 ocean (−5 +1) → 11, then everything is maxed: 2 silver left */
  assert.equal(st.status, "ended");
  assert.equal(st.a.pvFin, 2);
  assert.deepEqual(E.scoreAutoma(st.a), { nt: 31, pv: 2, fin: 2, total: 35 });
});

test("corrections clamp and merge in the log", () => {
  let st = E.adjustAutoma(game(), "moteur", 1);
  st = E.adjustAutoma(st, "moteur", 1);
  assert.equal(st.a.moteur, 5);
  assert.equal(st.log[0], "T1 · Correction moteur : 3 → 5");
  assert.equal(E.adjustAutoma(game(), "cubes", -1).a.cubes, 0);
  assert.equal(E.adjustParam(game({ p: { oxy: 14, temp: 0, oce: 0 } }), "oxy", 1).p.oxy, 14);
  assert.equal(E.adjustPlayerTR(game(), 2).pnt, 7);
});

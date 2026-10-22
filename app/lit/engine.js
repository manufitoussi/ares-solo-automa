/* Automa engine, rules v0.6: pure game logic, no DOM, no HTML.
   Extracted from app/prototype/assistant-automa.html, same rules and same saved state (v:3).
   Every transition takes a state and returns a new one: the input is never mutated,
   so the UI can keep old states for undo and compare references to know what changed.
   The log lines are still French text, as in the prototype: they will become structured
   events when the app is translated.
   Types are JSDoc comments, checked by TypeScript (npm run check); the file stays plain JS. */

/* ---------- Types ---------- */
/** @typedef {"I" | "II" | "III" | "IV" | "V"} Phase */
/** @typedef {"oxy" | "temp" | "ocean"} Target  what the automa raises in Action */
/** @typedef {"oxy" | "temp" | "oce"} Param  a Mars parameter, as stored in the game */
/** @typedef {"tresfacile" | "facile" | "normal" | "difficile" | "tresdifficile"} Level */
/** @typedef {"Riposte" | "Opportuniste" | "Course"} Reaction */
/** @typedef {"app" | "cartes"} DeckMode  the app draws, or the player flips the printed cards */
/** @typedef {"plan" | "reveal" | "phase" | "endturn"} Step */
/** @typedef {"cubes" | "moteur" | "compteur" | "nt"} AutomaKey  what "Corriger" can change */

/** An automa card: a phase, or a reaction (13 to 15). Card 15 targets the least advanced parameter.
    @typedef {{ n: number, ph?: Phase, react?: Reaction, c: Target | "low" }} Card */
/** The automa board. The reserve is in copper units: silver = floor(cubes / 5).
    @typedef {{ cubes: number, moteur: number, compteur: number, nt: number, pvFin: number }} Automa */
/** @typedef {{ oxy: number, temp: number, oce: number }} Mars */
/** End of a round: TR of the automa (a) and of the player (p, null once the game ended on
    maxed parameters), and the Mars steps raised so far by each (ca, cj; absent in older saves).
    @typedef {{ t: number, a: number, p: number | null, ca?: number, cj?: number }} TrackPoint */
/** Mars steps the player raised (d, negative for a correction), when: the round and the phase
    being resolved, or the step of the round outside the phases.
    @typedef {{ t: number, at: Phase | Step, k: Param, d: number }} PlayerStep */
/** The player's final score, typed at the end of the game.
    @typedef {{ nt: number, forets: number, cartes: number, autres: number }} PlayerScore */
/** @typedef {{ niveau: Level, pioche?: DeckMode, oxy?: number, temp?: number, oce?: number }} Setup */
/** What one phase changes for the automa.
    @typedef {{ gain: number, moteur: number, compteur: number, prod: number, temp: number, oce: number, oxy: number, nt: number, spent: number }} Change */

/**
 * The game, as saved in the browser (format v:3).
 * @typedef {object} Game
 * @property {number} v
 * @property {"playing" | "ended"} status
 * @property {Level} niveau
 * @property {DeckMode} pioche
 * @property {number} createdAt
 * @property {number} savedAt
 * @property {number} turn
 * @property {number[]} deck            card numbers still to draw
 * @property {number[]} discard
 * @property {number | null} card       the card of the round, once drawn
 * @property {Step} step
 * @property {Phase | null} playerPhase
 * @property {Phase | null} automaPhase
 * @property {Target | null} cible
 * @property {string} why               why a reactive card chose its phase
 * @property {Phase[]} queue            the phases of the round, in order
 * @property {number} qi                index of the current phase in the queue
 * @property {Phase | null} lastPlayerPhase
 * @property {string} rules
 * @property {Automa} a
 * @property {Mars} p
 * @property {string[]} log             most recent first
 * @property {TrackPoint[]} [track]
 * @property {number} [pnt]             the player's TR, when set
 * @property {number | null} [playerScore]
 * @property {string} [remark]
 * @property {boolean} [saved]          the result is in the history
 * @property {PlayerStep[]} [playerSteps]  the player's Mars steps, as they are typed
 * @property {number[]} [actionTurns]   the rounds with an Action phase
 * @property {{ joueur: number, automa: number }} [crans]  Mars steps raised by each so far
 * @property {PlayerScore} [playerFinal]  the player's final score, once saved
 */

/**
 * A finished game, as kept in the history.
 * @typedef {object} GameRecord
 * @property {string} date
 * @property {number} createdAt
 * @property {Level} niveau
 * @property {number} tours
 * @property {number | null} scoreJoueur
 * @property {number} scoreAutoma
 * @property {{ nt: number, pvFin: number, pvCompteur: number, compteur: number, moteur: number, cubesFin: number }} detail
 * @property {Mars} params
 * @property {string} remarque
 * @property {TrackPoint[]} courbe
 * @property {DeckMode} pioche
 * @property {string} version
 * @property {PlayerScore & { cransParAction: number[], cransHorsAction: number }} [joueur]
 */

/* ---------- Game data ---------- */
/** @type {Record<Phase, { n: number, nom: string, court: string }>} */
export const PH = {
  I: { n: 1, nom: "Développement", court: "Dév." },
  II: { n: 2, nom: "Construction", court: "Const." },
  III: { n: 3, nom: "Action", court: "Action" },
  IV: { n: 4, nom: "Production", court: "Prod." },
  V: { n: 5, nom: "Recherche", court: "Rech." }
};
/** @type {Phase[]} */
export const ORDER = ["I", "II", "III", "IV", "V"];
/** @type {Record<Target, { nom: string }>} */
export const CIB = { oxy: { nom: "Oxygène" }, temp: { nom: "Température" }, ocean: { nom: "Océan" } };
/** @type {Card[]} */
export const CARDS = [
  { n: 1, ph: "IV", c: "oxy" }, { n: 2, ph: "IV", c: "temp" }, { n: 3, ph: "IV", c: "ocean" },
  { n: 4, ph: "III", c: "oxy" }, { n: 5, ph: "III", c: "temp" }, { n: 6, ph: "III", c: "ocean" },
  { n: 7, ph: "I", c: "oxy" }, { n: 8, ph: "I", c: "temp" }, { n: 9, ph: "I", c: "ocean" },
  { n: 10, ph: "II", c: "oxy" }, { n: 11, ph: "II", c: "temp" }, { n: 12, ph: "V", c: "ocean" },
  { n: 13, react: "Riposte", c: "oxy" }, { n: 14, react: "Opportuniste", c: "temp" }, { n: 15, react: "Course", c: "low" }
];
/* copper cubes, 5 copper = 1 silver, everything costs 1 silver; the level sets the starting engine. */
export const COST = 5;
/** @type {Level[]} */
export const LEVELS = ["tresfacile", "facile", "normal", "difficile", "tresdifficile"];
/** @type {Record<Level, string>} */
export const NIV = { tresfacile: "Très facile", facile: "Facile", normal: "Normal", difficile: "Difficile", tresdifficile: "Très difficile" };
/** @type {Record<Level, number>} */
export const MOTEUR0 = { tresfacile: 1, facile: 2, normal: 3, difficile: 4, tresdifficile: 5 };
/** @type {Record<Param, number>} */
export const MAX = { oxy: 14, temp: 19, oce: 9 };
export const STATE_VERSION = 3;
export const RULES = "0.6";

/* ---------- Helpers ---------- */
/** @template T @param {T} o @returns {T} */
export const clone = o => JSON.parse(JSON.stringify(o));
/** silver in a reserve of copper units @param {number} n */
export const ag = n => Math.floor(n / COST);
/** copper left over @param {number} n */
export const cu = n => n % COST;
/** @param {number} n @param {string} w */
export const plural = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;
/** @param {number} n */
export const purse = n => `${plural(ag(n), "argent")} et ${plural(cu(n), "cuivre")}`;
/** @template T @param {T[]} a @param {() => number} [rng] @returns {T[]} */
export const shuffle = (a, rng = Math.random) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
/** @param {Mars} p */
export const allMax = p => p.oxy >= MAX.oxy && p.temp >= MAX.temp && p.oce >= MAX.oce;
/** temperature in °C for a step of the track @param {number} step */
export const tempC = step => -30 + 2 * step;
/** @param {Target} c @returns {Param} */
export const paramOf = c => c === "oxy" ? "oxy" : c === "temp" ? "temp" : "oce";
/** @param {number} n */
export const card = n => CARDS.find(c => c.n === n);

/** the card of the round; a phase screen without a drawn card is a bug @param {Game} st @returns {Card} */
function drawnCard(st) {
  const cd = st.card == null ? undefined : card(st.card);
  if (!cd) throw new Error(`No automa card drawn (card: ${st.card})`);
  return cd;
}

/* ---------- Rules ---------- */
/** @param {Mars} p @returns {Target} */
export function leastAdvanced(p) {
  /** @type {[Target, number][]} */
  const f = [["oxy", p.oxy / MAX.oxy], ["temp", p.temp / MAX.temp], ["ocean", p.oce / MAX.oce]];
  let best = f[0]; for (const x of f) if (x[1] < best[1]) best = x; return best[0];
}
/** the target actually raised: the next one in the order oxy → temp → ocean when it is maxed
    @param {Target} c @param {Mars} p @returns {Target} */
export function effCible(c, p) {
  /** @type {Target[]} */
  const order = ["oxy", "temp", "ocean"]; const i = order.indexOf(c);
  for (let k = 0; k < 3; k++) { const x = order[(i + k) % 3]; if (p[paramOf(x)] < MAX[paramOf(x)]) return x; }
  return "oxy";
}
/** the phase and target of the drawn card; a reactive card decides from the game
    @param {Game} st @returns {{ phase: Phase, cible: Target, why: string }} */
export function resolveCard(st) {
  const cd = drawnCard(st);
  /** @type {Phase} */
  let phase = cd.ph ?? "IV";
  let why = "", cible = cd.c;
  if (cd.react === "Riposte") { phase = st.lastPlayerPhase || "IV"; why = st.lastPlayerPhase ? `Phase du joueur au tour précédent : ${PH[phase].nom}.` : "Premier tour : Production."; }
  if (cd.react === "Opportuniste") { phase = st.a.cubes >= COST ? "III" : "IV"; why = st.a.cubes >= COST ? `Il a ${plural(ag(st.a.cubes), "argent")} : il dépense en Action.` : `Il n'a aucun argent : il produit.`; }
  if (cd.react === "Course") { phase = "III"; cible = leastAdvanced(st.p); why = `Paramètre le moins avancé : ${CIB[cible].nom.toLowerCase()}.`; }
  /* only card 15 has "low", and Course has just replaced it */
  return { phase, cible: /** @type {Target} */ (cible), why };
}
/** One phase for the automa: always +1 cube first, then the phase effect; never a bonus.
    Returns the automa and Mars after the phase, and what changed (ch), without touching st.
    @param {Game} st @param {Phase} ph @returns {{ a: Automa, p: Mars, ch: Change }} */
export function computePhase(st, ph) {
  const a = clone(st.a), p = { ...st.p };
  /** @type {Change} */
  const ch = { gain: 1, moteur: 0, compteur: 0, prod: 0, temp: 0, oce: 0, oxy: 0, nt: 0, spent: 0 };
  a.cubes += 1;
  if (ph === "I") { if (a.cubes >= COST) { a.cubes -= COST; a.moteur++; ch.moteur = 1; ch.spent = COST; } }
  else if (ph === "II") { a.compteur++; ch.compteur = 1; }
  else if (ph === "IV") { a.cubes += a.moteur; ch.prod = a.moteur; }
  else if (ph === "III") {
    const target = /** @type {Target} */ (st.cible); /* set by the draw */
    /* no forests, the oxygen target raises oxygen directly */
    for (let g = 0; g < 200 && a.cubes >= COST && !allMax(p); g++) {
      const c = effCible(target, p);
      a.cubes -= COST; ch.spent += COST;
      if (c === "oxy") { p.oxy++; a.nt++; ch.nt++; ch.oxy++; }
      else if (c === "temp") { p.temp++; a.nt++; ch.nt++; ch.temp++; }
      else { p.oce++; a.nt++; ch.nt++; ch.oce++; a.cubes += 1; /* ocean tile bonus: +1 cube, whatever is printed */ }
    }
  }
  return { a, p, ch };
}
/** @param {Automa} a */
export const vpOf = a => a.compteur;
/** last round: once all parameters are maxed, each silver left is worth 1 VP (set when the game ends)
    @param {Automa} a */
export function scoreAutoma(a) { const pv = vpOf(a), fin = a.pvFin || 0; return { nt: a.nt, pv, fin, total: a.nt + pv + fin }; }

/** the player's TR can be changed at any time; it is recorded at the end of each round for the curve
    @param {Game} st @returns {number} */
export function lastPNT(st) { const tr = (st.track || []).filter(x => x.p != null); return tr.length ? /** @type {number} */ (tr[tr.length - 1].p) : 5; }
/** @param {Game} st */
export const pntOf = st => st.pnt ?? lastPNT(st);

/* ---------- Transitions (each returns a new state) ---------- */
/** @param {Game} st @param {string} msg */
function log(st, msg) { st.log.unshift(`T${st.turn} · ${msg}`); if (st.log.length > 120) st.log.length = 120; }
/** @param {Game} st */
function recordTurn(st) {
  const p = pntOf(st);
  st.track = (st.track || []).filter(x => x.t !== st.turn);
  st.track.push({ t: st.turn, a: st.a.nt, p, ...cransOf(st) });
}
/** Mars steps raised so far, for the curve @param {Game} st */
const cransOf = st => ({ ca: st.crans?.automa ?? 0, cj: st.crans?.joueur ?? 0 });

/** @param {Setup} setup @param {{ rng?: () => number, now?: number }} [options] @returns {Game} */
export function newGame(setup, { rng = Math.random, now = Date.now() } = {}) {
  const s = setup;
  /** @type {Game} */
  const st = {
    v: STATE_VERSION, status: "playing", niveau: s.niveau, pioche: s.pioche || "app", createdAt: now, savedAt: now, turn: 1,
    deck: shuffle(CARDS.map(c => c.n), rng), discard: [], card: null, step: "plan",
    playerPhase: null, automaPhase: null, cible: null, why: "", queue: [], qi: 0, lastPlayerPhase: null,
    rules: RULES,
    a: { cubes: 0, moteur: MOTEUR0[s.niveau] ?? 3, compteur: 0, nt: 5, pvFin: 0 },
    p: { oxy: Number(s.oxy) || 0, temp: Number(s.temp) || 0, oce: Number(s.oce) || 0 },
    log: []
  };
  log(st, `Nouvelle partie (règles v${RULES}), niveau ${NIV[st.niveau]}, moteur de départ ${st.a.moteur}`);
  return st;
}
/** a saved game is only resumed if it has the current format (a v0.5 or v0.4 save is ignored)
    @param {unknown} st @returns {st is Game} */
export const isCurrent = st => !!st && /** @type {{ v?: unknown }} */ (st).v === STATE_VERSION;

/** the player cannot pick the phase they played last round @param {Game} st @param {Phase} ph */
export const canPick = (st, ph) => st.lastPlayerPhase !== ph;
/** @param {Game} state @param {Phase} ph @returns {Game} */
export function pickPhase(state, ph) {
  if (!canPick(state, ph)) return state;
  const st = clone(state); st.playerPhase = ph; return st;
}

/** draw the automa card: at random from its deck, or card n when the player flips the printed cards
    @param {Game} state @param {{ n?: number | null, rng?: () => number }} [options] @returns {Game} */
export function draw(state, { n = null, rng = Math.random } = {}) {
  const st = clone(state);
  if (!st.deck.length) { st.deck = shuffle(st.discard, rng); st.discard = []; log(st, "Pioche automa remélangée"); }
  if (n != null) { st.card = n; st.deck = st.deck.filter(x => x !== n); st.discard = st.discard.filter(x => x !== n); }
  else st.card = st.deck.pop() ?? null;
  const r = resolveCard(st); st.automaPhase = r.phase; st.cible = r.cible; st.why = r.why;
  st.queue = ORDER.filter(ph => ph === st.playerPhase || ph === st.automaPhase); st.qi = 0; st.step = "reveal";
  const player = st.playerPhase ? PH[st.playerPhase].nom : "?";
  log(st, `Carte ${st.card} : ${PH[r.phase].nom}, cible ${CIB[r.cible].nom.toLowerCase()} (joueur : ${player})`);
  return st;
}

/** @param {Game} state @returns {Game} */
export function startPhases(state) { const st = clone(state); st.step = "phase"; return st; }

/** apply the current phase of the queue; ends the game once every parameter is maxed
    @param {Game} state @returns {Game} */
export function applyPhase(state) {
  const st = clone(state), ph = st.queue[st.qi];
  const c0 = st.a.cubes, r = computePhase(st, ph), c = r.ch;
  st.a = r.a; st.p = r.p;
  const raised = c.oxy + c.temp + c.oce;
  st.crans = { joueur: st.crans?.joueur ?? 0, automa: (st.crans?.automa ?? 0) + raised };
  if (ph === "III") st.actionTurns = [...(st.actionTurns ?? []), st.turn];
  let what = "";
  if (ph === "I") what = c.moteur ? `moteur ${st.a.moteur} (1 argent)` : "moteur inchangé, aucun argent";
  else if (ph === "II") what = `compteur de PV ${st.a.compteur}`;
  else if (ph === "III") what = `+${c.oxy} oxygène, +${c.temp} température, ${c.oce} océan(s), NT +${c.nt}, ${plural(c.spent / COST, "argent")} dépensé${c.spent > COST ? "s" : ""}${c.oce ? `, +${c.oce} cuivre(s) (bonus océans)` : ""}`;
  else if (ph === "IV") what = `+${c.prod} (moteur)`;
  else what = "rien de plus";
  log(st, `${PH[ph].nom} : +1 cuivre, ${what} → ${purse(st.a.cubes)} (avant : ${purse(c0)})`);
  st.qi++;
  if (allMax(st.p)) {
    st.a.pvFin = ag(st.a.cubes);
    if (st.a.pvFin) log(st, `Dernier tour : ${plural(st.a.pvFin, "argent")} restant = ${st.a.pvFin} PV`);
    st.status = "ended";
    st.track = (st.track || []).filter(x => x.t !== st.turn); st.track.push({ t: st.turn, a: st.a.nt, p: null, ...cransOf(st) });
    log(st, "Tous les paramètres sont au maximum : fin de partie.");
  }
  else if (st.qi >= st.queue.length) st.step = "endturn";
  return st;
}

/** @param {Game} state @returns {Game} */
export function nextTurn(state) {
  const st = clone(state);
  recordTurn(st); if (st.card != null) st.discard.push(st.card); st.card = null;
  st.lastPlayerPhase = st.playerPhase; st.playerPhase = null; st.turn++; st.step = "plan";
  return st;
}
/** @param {Game} state @returns {Game} */
export function endGame(state) { const st = clone(state); recordTurn(st); st.status = "ended"; log(st, "Partie terminée à la demande"); return st; }
/** @param {Game} state @returns {Game} */
export function resumeGame(state) { const st = clone(state); st.status = "playing"; return st; }

/* manual corrections of the automa board; consecutive corrections of the same value are
   merged into one log line */
/** @type {Record<AutomaKey, string>} */
const NOMS = { cubes: "réserve", moteur: "moteur", compteur: "compteur de PV", nt: "NT" };
/** @param {Game} state @param {AutomaKey} k @param {number} d @returns {Game} */
export function adjustAutoma(state, k, d) {
  const st = clone(state), old = st.a[k];
  st.a[k] = Math.max(0, st.a[k] + d);
  const head = `T${st.turn} · Correction ${NOMS[k]} : `, prev = st.log[0] || "";
  if (prev.startsWith(head)) { const from = prev.slice(head.length).split(" → ")[0]; st.log[0] = `${head}${from} → ${st.a[k]}`; }
  else log(st, `Correction ${NOMS[k]} : ${old} → ${st.a[k]}`);
  return st;
}
/** The player raises (or corrects) a Mars parameter, kept between 0 and its maximum.
    Each step also gives the player 1 TR, as in the game. The step is recorded with the round
    and the phase being resolved, for the balancing figures.
    @param {Game} state @param {Param} k @param {number} d @returns {Game} */
export function adjustParam(state, k, d) {
  const value = Math.min(MAX[k], Math.max(0, state.p[k] + d)), delta = value - state.p[k];
  if (!delta) return state;
  const st = clone(state);
  st.p[k] = value;
  st.pnt = Math.max(0, pntOf(st) + delta);
  st.crans = { automa: st.crans?.automa ?? 0, joueur: (st.crans?.joueur ?? 0) + delta };
  /** @type {Phase | Step} */
  const at = st.step === "phase" && st.qi < st.queue.length ? st.queue[st.qi] : st.step;
  const steps = st.playerSteps ?? [], last = steps.at(-1);
  if (last && last.t === st.turn && last.at === at && last.k === k) last.d += delta;
  else steps.push({ t: st.turn, at, k, d: delta });
  st.playerSteps = steps.filter(x => x.d !== 0);
  return st;
}
/** the player's steps in each Action phase of the game, in order (0 when they raised none)
    @param {Game} st @returns {number[]} */
export function playerStepsPerAction(st) {
  const steps = st.playerSteps ?? [];
  return (st.actionTurns ?? []).map(t => steps.filter(x => x.t === t && x.at === "III").reduce((s, x) => s + x.d, 0));
}
/** the player's steps outside the Action phases (cards played in other phases…) @param {Game} st */
export function playerStepsOutsideAction(st) {
  return (st.playerSteps ?? []).filter(x => x.at !== "III").reduce((s, x) => s + x.d, 0);
}
/** @param {Game} state @param {number} d @returns {Game} */
export function adjustPlayerTR(state, d) { const st = clone(state); st.pnt = Math.max(0, pntOf(st) + d); return st; }

/** the record kept in the history of games
    @param {Game} st @param {{ playerScore?: number | null, remark?: string, date?: string, player?: PlayerScore }} [options] @returns {GameRecord} */
export function gameRecord(st, { playerScore = null, remark = "", date = new Date().toISOString(), player } = {}) {
  const sc = scoreAutoma(st.a);
  return {
    ...(player ? { joueur: { ...player, cransParAction: playerStepsPerAction(st), cransHorsAction: playerStepsOutsideAction(st) } } : {}),
    date, createdAt: st.createdAt, niveau: st.niveau, tours: st.turn, scoreJoueur: playerScore, scoreAutoma: sc.total,
    detail: { nt: sc.nt, pvFin: sc.fin, pvCompteur: sc.pv, compteur: st.a.compteur, moteur: st.a.moteur, cubesFin: st.a.cubes },
    params: st.p, remarque: remark, courbe: st.track || [], pioche: st.pioche || "app", version: RULES
  };
}

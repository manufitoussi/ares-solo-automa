/* Automa engine, rules v0.6: pure game logic, no DOM, no HTML.
   Extracted from app/prototype/assistant-automa.html, same rules and same saved state (v:3).
   Every transition takes a state and returns a new one: the input is never mutated,
   so the UI can keep old states for undo and compare references to know what changed.
   The log lines are still French text, as in the prototype: they will become structured
   events when the app is translated. */

/* ---------- Game data ---------- */
export const PH = {
  I: { n: 1, nom: "Développement", court: "Dév." },
  II: { n: 2, nom: "Construction", court: "Const." },
  III: { n: 3, nom: "Action", court: "Action" },
  IV: { n: 4, nom: "Production", court: "Prod." },
  V: { n: 5, nom: "Recherche", court: "Rech." }
};
export const ORDER = ["I", "II", "III", "IV", "V"];
export const CIB = { oxy: { nom: "Oxygène" }, temp: { nom: "Température" }, ocean: { nom: "Océan" } };
export const CARDS = [
  { n: 1, ph: "IV", c: "oxy" }, { n: 2, ph: "IV", c: "temp" }, { n: 3, ph: "IV", c: "ocean" },
  { n: 4, ph: "III", c: "oxy" }, { n: 5, ph: "III", c: "temp" }, { n: 6, ph: "III", c: "ocean" },
  { n: 7, ph: "I", c: "oxy" }, { n: 8, ph: "I", c: "temp" }, { n: 9, ph: "I", c: "ocean" },
  { n: 10, ph: "II", c: "oxy" }, { n: 11, ph: "II", c: "temp" }, { n: 12, ph: "V", c: "ocean" },
  { n: 13, react: "Riposte", c: "oxy" }, { n: 14, react: "Opportuniste", c: "temp" }, { n: 15, react: "Course", c: "low" }
];
/* copper cubes, 5 copper = 1 silver, everything costs 1 silver; the level sets the starting engine.
   The reserve is kept as a number of copper units: silver = floor(cubes / 5), copper = cubes % 5. */
export const COST = 5;
export const LEVELS = ["tresfacile", "facile", "normal", "difficile", "tresdifficile"];
export const NIV = { tresfacile: "Très facile", facile: "Facile", normal: "Normal", difficile: "Difficile", tresdifficile: "Très difficile" };
export const MOTEUR0 = { tresfacile: 1, facile: 2, normal: 3, difficile: 4, tresdifficile: 5 };
export const MAX = { oxy: 14, temp: 19, oce: 9 };
export const STATE_VERSION = 3;
export const RULES = "0.6";

/* ---------- Helpers ---------- */
export const clone = o => JSON.parse(JSON.stringify(o));
export const ag = n => Math.floor(n / COST);
export const cu = n => n % COST;
export const plural = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;
export const purse = n => `${plural(ag(n), "argent")} et ${plural(cu(n), "cuivre")}`;
export const shuffle = (a, rng = Math.random) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
export const allMax = p => p.oxy >= MAX.oxy && p.temp >= MAX.temp && p.oce >= MAX.oce;
export const tempC = step => -30 + 2 * step;
export const paramOf = c => c === "oxy" ? "oxy" : c === "temp" ? "temp" : "oce";
export const card = n => CARDS.find(c => c.n === n);

/* ---------- Rules ---------- */
export function leastAdvanced(p) {
  const f = [["oxy", p.oxy / MAX.oxy], ["temp", p.temp / MAX.temp], ["ocean", p.oce / MAX.oce]];
  let best = f[0]; for (const x of f) if (x[1] < best[1]) best = x; return best[0];
}
/* the target actually raised: the next one in the order oxy → temp → ocean when it is maxed */
export function effCible(c, p) {
  const order = ["oxy", "temp", "ocean"]; const i = order.indexOf(c);
  for (let k = 0; k < 3; k++) { const x = order[(i + k) % 3]; if (p[paramOf(x)] < MAX[paramOf(x)]) return x; }
  return "oxy";
}
export function resolveCard(st) {
  const cd = card(st.card); let phase = cd.ph, why = "", cible = cd.c;
  if (cd.react === "Riposte") { phase = st.lastPlayerPhase || "IV"; why = st.lastPlayerPhase ? `Phase du joueur au tour précédent : ${PH[phase].nom}.` : "Premier tour : Production."; }
  if (cd.react === "Opportuniste") { phase = st.a.cubes >= COST ? "III" : "IV"; why = st.a.cubes >= COST ? `Il a ${plural(ag(st.a.cubes), "argent")} : il dépense en Action.` : `Il n'a aucun argent : il produit.`; }
  if (cd.react === "Course") { phase = "III"; cible = leastAdvanced(st.p); why = `Paramètre le moins avancé : ${CIB[cible].nom.toLowerCase()}.`; }
  return { phase, cible, why };
}
/* one phase for the automa: always +1 cube first, then the phase effect; never a bonus.
   Returns the automa and Mars after the phase, and what changed (ch), without touching st. */
export function computePhase(st, ph) {
  const a = clone(st.a), p = { ...st.p }, ch = { gain: 1, moteur: 0, compteur: 0, prod: 0, temp: 0, oce: 0, oxy: 0, nt: 0, spent: 0 };
  a.cubes += 1;
  if (ph === "I") { if (a.cubes >= COST) { a.cubes -= COST; a.moteur++; ch.moteur = 1; ch.spent = COST; } }
  else if (ph === "II") { a.compteur++; ch.compteur = 1; }
  else if (ph === "IV") { a.cubes += a.moteur; ch.prod = a.moteur; }
  else if (ph === "III") {
    /* no forests, the oxygen target raises oxygen directly */
    for (let g = 0; g < 200 && a.cubes >= COST && !allMax(p); g++) {
      const c = effCible(st.cible, p);
      a.cubes -= COST; ch.spent += COST;
      if (c === "oxy") { p.oxy++; a.nt++; ch.nt++; ch.oxy++; }
      else if (c === "temp") { p.temp++; a.nt++; ch.nt++; ch.temp++; }
      else { p.oce++; a.nt++; ch.nt++; ch.oce++; a.cubes += 1; /* ocean tile bonus: +1 cube, whatever is printed */ }
    }
  }
  return { a, p, ch };
}
export const vpOf = a => a.compteur;
/* last round: once all parameters are maxed, each silver left is worth 1 VP (set when the game ends) */
export function scoreAutoma(a) { const pv = vpOf(a), fin = a.pvFin || 0; return { nt: a.nt, pv, fin, total: a.nt + pv + fin }; }

/* the player's TR can be changed at any time; it is recorded at the end of each round for the curve */
export function lastPNT(st) { const tr = (st.track || []).filter(x => x.p != null); return tr.length ? tr[tr.length - 1].p : 5; }
export const pntOf = st => st.pnt ?? lastPNT(st);

/* ---------- Transitions (each returns a new state) ---------- */
function log(st, msg) { st.log.unshift(`T${st.turn} · ${msg}`); if (st.log.length > 120) st.log.length = 120; }
function recordTurn(st) {
  const p = pntOf(st);
  st.track = (st.track || []).filter(x => x.t !== st.turn);
  st.track.push({ t: st.turn, a: st.a.nt, p });
}

/* setup: {niveau, pioche ("app" | "cartes"), oxy, temp, oce} */
export function newGame(setup, { rng = Math.random, now = Date.now() } = {}) {
  const s = setup;
  const st = {
    v: STATE_VERSION, status: "playing", niveau: s.niveau, pioche: s.pioche || "app", createdAt: now, savedAt: now, turn: 1,
    deck: shuffle(CARDS.map(c => c.n), rng), discard: [], card: null, step: "plan",
    playerPhase: null, automaPhase: null, cible: null, why: "", queue: [], qi: 0, lastPlayerPhase: null,
    rules: RULES,
    a: { cubes: 0, moteur: MOTEUR0[s.niveau] ?? 3, compteur: 0, nt: 5, pvFin: 0 },
    p: { oxy: +s.oxy || 0, temp: +s.temp || 0, oce: +s.oce || 0 },
    log: []
  };
  log(st, `Nouvelle partie (règles v${RULES}), niveau ${NIV[st.niveau]}, moteur de départ ${st.a.moteur}`);
  return st;
}
/* a saved game is only resumed if it has the current format (a v0.5 or v0.4 save is ignored) */
export const isCurrent = st => !!st && st.v === STATE_VERSION;

/* the player cannot pick the phase they played last round */
export const canPick = (st, ph) => st.lastPlayerPhase !== ph;
export function pickPhase(state, ph) {
  if (!canPick(state, ph)) return state;
  const st = clone(state); st.playerPhase = ph; return st;
}

/* draw the automa card: at random from its deck, or card n when the player flips the printed cards */
export function draw(state, { n = null, rng = Math.random } = {}) {
  const st = clone(state);
  if (!st.deck.length) { st.deck = shuffle(st.discard, rng); st.discard = []; log(st, "Pioche automa remélangée"); }
  if (n != null) { st.card = n; st.deck = st.deck.filter(x => x !== n); st.discard = st.discard.filter(x => x !== n); }
  else st.card = st.deck.pop();
  const r = resolveCard(st); st.automaPhase = r.phase; st.cible = r.cible; st.why = r.why;
  st.queue = ORDER.filter(ph => ph === st.playerPhase || ph === st.automaPhase); st.qi = 0; st.step = "reveal";
  log(st, `Carte ${st.card} : ${PH[st.automaPhase].nom}, cible ${CIB[st.cible].nom.toLowerCase()} (joueur : ${PH[st.playerPhase].nom})`);
  return st;
}

export function startPhases(state) { const st = clone(state); st.step = "phase"; return st; }

/* apply the current phase of the queue; ends the game once every parameter is maxed */
export function applyPhase(state) {
  const st = clone(state), ph = st.queue[st.qi];
  const c0 = st.a.cubes, r = computePhase(st, ph), c = r.ch;
  st.a = r.a; st.p = r.p;
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
    st.track = (st.track || []).filter(x => x.t !== st.turn); st.track.push({ t: st.turn, a: st.a.nt, p: null });
    log(st, "Tous les paramètres sont au maximum : fin de partie.");
  }
  else if (st.qi >= st.queue.length) st.step = "endturn";
  return st;
}

export function nextTurn(state) {
  const st = clone(state);
  recordTurn(st); st.discard.push(st.card); st.card = null;
  st.lastPlayerPhase = st.playerPhase; st.playerPhase = null; st.turn++; st.step = "plan";
  return st;
}
export function endGame(state) { const st = clone(state); recordTurn(st); st.status = "ended"; log(st, "Partie terminée à la demande"); return st; }
export function resumeGame(state) { const st = clone(state); st.status = "playing"; return st; }

/* manual corrections of the automa board (k: cubes, moteur, compteur, nt); consecutive
   corrections of the same value are merged into one log line */
const NOMS = { cubes: "réserve", moteur: "moteur", compteur: "compteur de PV", nt: "NT" };
export function adjustAutoma(state, k, d) {
  const st = clone(state), old = st.a[k];
  st.a[k] = Math.max(0, st.a[k] + d);
  const head = `T${st.turn} · Correction ${NOMS[k] || k} : `, prev = st.log[0] || "";
  if (prev.startsWith(head)) { const from = prev.slice(head.length).split(" → ")[0]; st.log[0] = `${head}${from} → ${st.a[k]}`; }
  else log(st, `Correction ${NOMS[k] || k} : ${old} → ${st.a[k]}`);
  return st;
}
/* Mars parameters (k: oxy, temp, oce), kept between 0 and their maximum */
export function adjustParam(state, k, d) { const st = clone(state); st.p[k] = Math.min(MAX[k], Math.max(0, st.p[k] + d)); return st; }
export function adjustPlayerTR(state, d) { const st = clone(state); st.pnt = Math.max(0, pntOf(st) + d); return st; }

/* the record kept in the history of games */
export function gameRecord(st, { playerScore = null, remark = "", date = new Date().toISOString() } = {}) {
  const sc = scoreAutoma(st.a);
  return {
    date, createdAt: st.createdAt, niveau: st.niveau, tours: st.turn, scoreJoueur: playerScore, scoreAutoma: sc.total,
    detail: { nt: sc.nt, pvFin: sc.fin, pvCompteur: sc.pv, compteur: st.a.compteur, moteur: st.a.moteur, cubesFin: st.a.cubes },
    params: st.p, remarque: remark, courbe: st.track || [], pioche: st.pioche || "app", version: RULES
  };
}

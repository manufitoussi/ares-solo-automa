import { html } from "lit";
import { ag, cu } from "../engine.js";
/** @typedef {import("../engine.js").AutomaKey} AutomaKey */

/* The texts of the app in English. The words are the English website's: copper and silver
   (no plural), engine, step, round, reserve, TR, VP. */

/** @param {number} n @param {string} one @param {string} many */
const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
/** @param {number} n */
const copper = n => `${n} copper`;
/** @param {number} n */
const silver = n => `${n} silver`;
/** @param {number} n */
const steps = n => pl(n, "step", "steps");
/** a reserve in copper units, as silver and copper @param {number} n */
const purse = n => `${silver(ag(n))} and ${copper(cu(n))}`;

const phase = { I: "Development", II: "Construction", III: "Action", IV: "Production", V: "Research" };
const targetLower = { oxy: "oxygen", temp: "temperature", ocean: "ocean" };

/** @type {import("./fr.js").Messages} */
const en = {
  lang: "en",
  locale: "en-GB",
  decimal: x => x.toFixed(1),
  steps,
  phase,
  phaseShort: { I: "Dev.", II: "Const.", III: "Action", IV: "Prod.", V: "Res." },
  target: { oxy: "Oxygen", temp: "Temperature", ocean: "Ocean" },
  targetLower,
  level: { tresfacile: "Very easy", facile: "Easy", normal: "Normal", difficile: "Hard", tresdifficile: "Very hard" },
  levelText: n => `Starting engine: ${n}.`,

  top: {
    back: "Back to the website", brand: "Hybrid automa",
    sub: v => `Game assistant · v${v} draft`,
    undo: "Undo", undoShort: "↶", history: "History", historyShort: "Games",
    newGame: "New game", newShort: "New", confirm: "Confirm?", confirmShort: "Sure?", confirmAria: "Confirm the new game",
    other: "FR", otherAria: "Version française"
  },
  journal: n => `Log (${n})`,

  setup: {
    title: "New game",
    intro: "The assistant plays the automa: it draws its cards, counts its copper and silver and tells what to do on its board. The board and the project cards stay on the table.",
    level: "Level", deck: "Automa deck",
    deckApp: { title: "The app draws", text: "The assistant draws the automa card at random." },
    deckCards: { title: "Printed cards", text: "The player flips the printed card and enters its number." },
    setupTitle: "Setup",
    setup: engine => `A player board for the automa, a marker on 5 on the TR track, the MC production marker on ${engine} (its engine), copper and silver cubes. Empty reserve and VP counter. No corporation, no hand.`,
    begin: "Start the game"
  },

  plan: {
    title: "Planning",
    intro: last => `The player's phase${last ? ` (not ${last}, played last round)` : ""}, then the automa card.`,
    lastPlayed: ", played last round",
    draw: "Flip the automa card",
    inDeck: n => `${pl(n, "card", "cards")} in the deck`,
    pickCard: "Flip its card, then tap its number", pickPhaseFirst: "First the player's phase",
    emptyTitle: "Empty deck", empty: "Shuffle its 15 cards before drawing.",
    cardAria: (n, label, used) => `Card ${n}, ${label}${used ? ", already out" : ""}`,
    usedNote: "The cards already out since the last shuffle are greyed out."
  },

  reveal: {
    title: "The automa card", todo: "This round, for the automa",
    playerPhase: "player's phase", automaPhase: "automa's phase", and: " and ",
    whatI: ok => `+1 copper${ok ? ", then engine +1 for 1 silver" : ": no silver for the engine"}`,
    whatII: "+1 copper, then 1 cube on its VP counter",
    whatIII: n => `+1 copper${n ? `, then about ${steps(n)} on its target` : ": no silver for its target"}`,
    whatIV: n => `+1 copper, then ${pl(n, "cube", "cubes")} (engine)`,
    whatV: "+1 copper",
    targetTitle: "Its target",
    targetAction: other => ` It is used in the Action phase: the parameter it raises${other ? ` (maxed: it goes for ${other} instead)` : ""}.`,
    targetNoAction: " It is only used in the Action phase. No Action phase this round: ignore it.",
    wait: "Nothing to do yet. The phases are resolved in order; the card stays on screen.",
    start: "Resolve the phases"
  },

  phaseScreen: {
    tag: {
      I: "+1 copper, then engine +1 for 1 silver.", II: "+1 copper, then 1 cube on its VP counter.",
      III: "+1 copper, then all its silver on its target.", IV: "+1 copper, then as many copper as its engine.", V: "+1 copper. Nothing more."
    },
    todo: "To do on its board",
    gain: exchange => html`<b>+1 copper</b> in its reserve${exchange ? ": with 5 copper, exchange them for 1 silver" : ""}`,
    engineUp: (a, b) => html`<b>Spend 1 silver</b> and raise its engine: ${a} → ${b}`,
    engineNo: a => html`No silver: the engine stays at ${a}`,
    counter: (cubes, vp) => html`<b>1 cube on its VP counter</b> (${pl(cubes, "cube", "cubes")}, ${vp} VP)`,
    prod: n => html`<b>+${copper(n)}</b> from its engine`,
    prodNone: html`Engine at 0: nothing more`,
    oxy: n => html`<b>Oxygen +${steps(n)}</b> (no forest)`,
    temp: n => html`<b>Temperature +${steps(n)}</b>`,
    ocean: n => html`<b>Flip ${pl(n, "ocean tile", "ocean tiles")}</b>: +1 copper per tile, whatever the printed bonus (already counted)`,
    nt: (n, a, b) => html`<b>Automa TR +${n}</b> (${a} → ${b})`,
    noSilver: html`No silver: nothing on its target`,
    reserve: (a, b) => `Reserve: ${purse(a)} → ${purse(b)} (5 copper = 1 silver).`,
    target: (name, other) => ` Target: ${name}${other ? ` maxed, it goes for ${other}` : ""}.`,
    noBonus: " No bonus for the automa.",
    lastRoundTitle: "Last round", lastRound: "Every parameter is maxed: each silver it has left is worth 1 VP.",
    playerBonus: "The player chose this phase: they take its bonus.", playerNoBonus: "The player also plays this phase, without its bonus.",
    done: "Done",
    stepsTitle: n => `The player raises their steps · ${steps(n)} in this Action`,
    stepsNote: "Before resolving the automa. Each step also gives the player 1 TR; the automa's plan is computed again."
  },

  mars: {
    aria: "Mars parameters", title: "Mars · update when the player raises a step (+1 TR for them)",
    oxy: "Oxygen", temp: "Temperature", tempShort: "Temp.", oce: "Oceans",
    oxyName: "oxygen", tempName: "temperature", oceName: "oceans", tr: "Player's TR", trName: "the player's TR",
    lower: name => `Lower ${name}`,
    raise: name => `Raise ${name}`
  },

  status: {
    aria: "Automa status",
    head: (level, turn) => `Automa · ${level} · round ${turn}`,
    edit: "Fix", done: "Close",
    remove: label => `Remove 1 ${label}`,
    add: label => `Add 1 ${label}`,
    reserve: "Reserve", reserveSub: "silver and copper, MC area",
    engine: "Engine", engineSub: "MC production", counter: "Counter", counterSub: "plant area", tr: "TR",
    vp: n => `${n} VP`,
    curveSoon: "The progress curve will show here after 2 rounds (the player's TR is set in the Mars panel)."
  },

  endTurn: {
    title: n => `End of round ${n}`,
    before: "Before the next round",
    player: html`<b>The player</b>: more than 10 cards in hand? They discard down to 10, as usual.`,
    automa: html`<b>The automa</b>: nothing to do, it has no hand.`,
    card: (printed, left) => html`<b>Its card of the round</b>: ${printed
      ? `to its discard pile. When its deck is empty, shuffle the 15 cards (${left} left).`
      : `the assistant sets it aside. It only comes back once its whole deck has been used (${left} left).`}`,
    trTitle: "Player's TR",
    tr: (p, a) => `${p}, against ${a} for the automa. It can be set at any time in the Mars panel and draws the curve of the game.`,
    next: "Next round", end: "End the game"
  },

  end: {
    title: "Final scoring", maxed: "Every parameter is maxed.", stopped: "Game stopped before the parameters were maxed.",
    scoring: " The player scores as usual: 1 VP per TR point, plus their forest and card VP. The automa has no forests.",
    automa: "Automa", vp: "VP", tr: "TR", silverLeft: "Silver left in the last round", counter: "VP counter (1 VP per cube)", total: "Total",
    playerScore: (p, a) => `Player's score · ${p} against ${a} for the automa`,
    fields: { nt: "TR", forets: "Forests", cartes: "Cards", autres: "Other VP" },
    stepsTitle: "Player's steps",
    steps: (total, actions, detail, outside) => `${steps(total)} in ${pl(actions, "Action phase", "Action phases")}${detail ? ` (${detail})` : ""}${outside ? `, and ${steps(outside)} outside Actions` : ""}.`,
    perAction: (mean, list) => `${mean} per Action: ${list}`,
    remark: "Remarks (balance, feeling)",
    save: "Save the game", saved: "Game saved", resume: "Resume the game",
    savedToast: "Game saved in the history of this browser."
  },

  history: {
    title: "History", back: "Back to the game",
    summary: (n, won) => `${pl(n, "game", "games")} · ${pl(won, "win", "wins")} of the player against the automa.`,
    empty: "No saved game yet. At the end of a game, save it from the scoring screen: it will show here.",
    cols: ["Date", "Level", "Rules", "Rounds", "Player", "Player TR", "Steps / Action", "Automa", "Winner", "TR per round", "Steps", "Remarks"],
    winner: { player: "Player", automa: "Automa", tie: "Tie" }
  },

  transfer: {
    title: "Backup",
    intro: "To go on with another device or keep a copy: export a file (or copy the text) with the game in progress and the history, then import it (or paste it) on the other device. The imported history is added to this one.",
    export: "Export", import: "Import", copy: "Copy", paste: "Paste",
    pasteLabel: "Paste the text of a backup here", importText: "Import the text",
    copied: "Backup copied: paste it in the app of the other device (History, Paste).",
    copyFailed: "Copying did not work: use Export instead.",
    fileName: date => `automa-backup-${date}.json`,
    replace: "Replace the game in progress with the one in the backup?",
    done: (game, added) => `Imported: ${game ? "the game in progress, and " : ""}${pl(added, "game added", "games added")} to the history.`,
    kept: "The game in progress on this device is kept.",
    error: { json: "This backup cannot be read.", format: "This backup does not come from this app.", empty: "This backup has no game and no history." }
  },

  curve: {
    nt: "TR per round", crans: "Mars steps, so far", player: "Player", automa: "Automa",
    rounds: (a, b) => `rounds ${a} to ${b}`,
    aria: title => `${title}: the player in orange, the automa dotted`
  },

  why: w => {
    if (!w || typeof w === "string") return w || "";
    switch (w.k) {
      case "riposte": return `The player's phase last round: ${phase[w.phase]}.`;
      case "riposteFirst": return "First round: Production.";
      case "oppSilver": return `It has ${silver(w.silver)}: it spends in Action.`;
      case "oppNone": return "It has no silver: it produces.";
      case "course": return `Least advanced parameter: ${targetLower[w.target]}.`;
    }
  },

  log: e => {
    if (typeof e === "string") return e;
    /** @type {Record<AutomaKey, string>} */
    const keys = { cubes: "reserve", moteur: "engine", compteur: "VP counter", nt: "TR" };
    const line = (() => {
      switch (e.k) {
        case "new": return `New game (rules v${e.rules}), level ${en.level[e.level]}, starting engine ${e.engine}`;
        case "reshuffle": return "Automa deck shuffled";
        case "draw": return `Card ${e.card}: ${phase[e.phase]}, target ${targetLower[e.target]} (player: ${e.player ? phase[e.player] : "?"})`;
        case "phase": {
          const c = e.ch;
          const what = e.phase === "I" ? (c.moteur ? `engine ${e.engine} (1 silver)` : "engine unchanged, no silver")
            : e.phase === "II" ? `VP counter ${e.counter}`
            : e.phase === "III" ? `+${c.oxy} oxygen, +${c.temp} temperature, ${c.oce} ocean(s), TR +${c.nt}, ${silver(c.spent / 5)} spent${c.oce ? `, +${c.oce} copper (ocean bonus)` : ""}`
            : e.phase === "IV" ? `+${c.prod} (engine)` : "nothing more";
          return `${phase[e.phase]}: +1 copper, ${what} → ${purse(e.after)} (before: ${purse(e.before)})`;
        }
        case "lastRound": return `Last round: ${silver(e.silver)} left = ${e.silver} VP`;
        case "maxed": return "Every parameter is maxed: end of the game.";
        case "stopped": return "Game ended on request";
        case "correct": return `Fix ${keys[e.key]}: ${e.from} → ${e.to}`;
      }
    })();
    return `R${e.t} · ${line}`;
  }
};

export default en;

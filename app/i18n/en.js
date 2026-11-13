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
    sub: v => `Game assistant · v${v}`,
    undo: "Undo", history: "History", historyShort: "Games",
    newGame: "New game", newShort: "New", confirm: "Confirm?", confirmShort: "Sure?", confirmAria: "Confirm the new game",
    other: "FR", otherAria: "Version française"
  },
  journal: n => `Log (${n})`,

  setup: {
    title: "New game",
    intro: "The app plays the automa: it draws its cards and tells what it does in each phase. It replaces the printed automa cards and player phase cards.",
    level: "Level", deck: "Automa deck",
    board: "Automa board",
    boardApp: { title: "In the app", text: "The app keeps its reserve, its engine, its VP counter and its TR." },
    boardTable: { title: "On the table", text: "A player board for the automa; the app gives the rules to apply." },
    boardForced: "Detailed tracking keeps the automa board in the app.",
    tracking: "Detailed tracking",
    trackingText: "To analyse your games: the app also follows Mars, the player's steps and TR, and draws the curves.",
    setupApp: engine => `The app keeps the automa board: empty reserve, engine at ${engine}, empty VP counter, TR at 5. No corporation, no hand.`,
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
    usedNote: "The cards already out since the last shuffle are greyed out.",
    turn: n => `Round ${n}`,
    pick: "Player's phase",
    hint: "Tap a phase to see what it gives the player and the automa.",
    revealed: "The automa's effect only applies if the phase is revealed: chosen by the player or drawn by the automa card."
  },

  info: {
    player: "Player", automa: "Automa", bonus: "Bonus",
    skill: {
      I: "The player may play 1 green Project card.",
      II: "The player may play 1 blue card or 1 red card.",
      III: "The player uses the “Action:” effects and the standard actions of their choice.",
      IV: "The player gains heat, plants and cards from their productions, and as many MC as their production + TR.",
      V: "The player draws 2 cards and keeps 1."
    },
    bonusText: {
      I: "this card costs 3 MC less.",
      II: "they draw 1 card or play 1 more blue or red card.",
      III: "they may use one “Action:” once more.",
      IV: "they gain 4 MC.",
      V: "they draw 3 more cards and keep 1 more."
    },
    chosen: "their phase,", notChosen: "No bonus: this is not the phase they chose.",
    rule: {
      I: "+1 copper, then if it has 1 silver, it spends it: engine +1.",
      II: "+1 copper, then it puts 1 cube on its VP counter.",
      III: "+1 copper, then it spends all its silver on the target of its card: 1 step and 1 TR per silver.",
      IV: "+1 copper, then it gains as many copper as its engine.",
      V: "+1 copper. Nothing more."
    },
    now: {
      I: (has, a, b) => has ? `+1 copper, then it spends 1 silver: engine ${a} → ${b}.` : `+1 copper, but no silver: the engine stays at ${a}.`,
      II: (a, b) => `+1 copper, then 1 cube on its VP counter: ${a} → ${b}.`,
      III: (n, a, b) => n ? `+1 copper, then it has ${silver(n)}: ${steps(n)} on its target, TR ${a} → ${b}.` : "+1 copper, but no silver: nothing on its target.",
      IV: n => `+1 copper, then +${copper(n)} from its engine.`,
      V: "+1 copper. Nothing more."
    },
    reserve: n => `Its reserve: ${purse(n)}.`,
    target: name => `Its target: ${name}.`,
    targetRule: "If its target is maxed, it goes for the next one: oxygen → temperature → ocean. An ocean it places gives it back 1 copper.",
    fix: "If the automa board does not match, fix it with “Fix”."
  },

  table: {
    player: "Player", automa: "Automa", empty: "Pick a phase",
    meta: "Player + automa", metaPhase: "Phase", skill: "Skill",
    skillShort: {
      I: "Play 1 green card.",
      II: "Play 1 blue or red card.",
      III: "“Action:” effects and standard actions.",
      IV: "Produce: heat, plants, cards, MC + TR.",
      V: "Draw 2 cards, keep 1."
    },
    bonusShort: {
      I: "−3 MC on that card.",
      II: "Draw 1 card, or play 1 more blue or red card.",
      III: "One “Action:” once more.",
      IV: "+4 MC.",
      V: "Draw 3 more cards, keep 1 more."
    }
  },

  ask: {
    title: "Reactive card",
    oppQuestion: "Does it have at least 1 silver in its reserve?",
    oppYes: "Yes", oppYesText: "Action", oppNo: "No", oppNoText: "Production",
    courseQuestion: "Which parameter is the least advanced?",
    courseHow: "Compare the share of each track already done: oxygen out of 14 steps, temperature out of 19, oceans out of 9. It goes for the lowest share.",
    courseAria: name => `Least advanced: ${name}`
  },

  reveal: {
    title: "The automa card", todo: "This round, for the player and the automa",
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

  confirmTerraformed: "Is Mars terraformed? The game stops here: each silver the automa has left is worth 1 VP, then comes the scoring.",
  phaseScreen: {
    /** @param {boolean} player @param {boolean} automa @returns {string} */
    chosenBy: (player, automa) => player && automa ? "Chosen by the player and drawn by the automa" : player ? "Chosen by the player" : "Drawn by the automa",
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
    next: "Next round", end: "End the game",
    terraformed: "Mars is terraformed: end of the game"
  },

  end: {
    title: "Final scoring", maxed: "Every parameter is maxed.", stopped: "Game stopped before the parameters were maxed.",
    terraformed: "Mars is terraformed.",
    lastRoundTable: " Last round: each silver it has left is worth 1 VP.",
    automaCount: "Count its board",
    automaFields: { nt: "Its TR", compteur: "Counter cubes", argents: "Silver left" },
    automaScore: a => `Automa's score · ${a}`,
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
    cols: ["Game", "Date", "Level", "Rules", "Rounds", "Player", "Player TR", "Steps / Action", "Automa", "Winner", "TR per round", "Steps", "Remarks"],
    winner: { player: "Player", automa: "Automa", tie: "Tie" },
    current: "In progress", unsaved: "Ended, not saved",
    mode: { jeu: "Play", suivi: "Tracking" },
    export: "Export", copy: "Copy", delete: "Delete",
    actionAria: (action, date) => `${action} the game of ${date}`,
    confirmDelete: "Delete this game from the history?",
    confirmAbandon: "Abandon the game in progress? It will be lost (export it first to keep it).",
    deleted: "Game deleted."
  },

  transfer: {
    title: "Backup",
    intro: "To go on with another device or keep a copy: each game is exported as a file or copied from its row; “Export all” and “Copy all” take the game in progress and the whole history. On the other device, import the file or paste the text: the games are added to the history, and a game in progress replaces the device's one.",
    exportAll: "Export all", import: "Import", copyAll: "Copy all", paste: "Paste",
    pasteLabel: "Paste the text of a backup here", importText: "Import the text",
    copied: "Copied: paste it in the app of the other device (History, Paste).",
    copyFailed: "Copying did not work: use Export instead.",
    fileName: (date, all) => `automa-${all ? "backup" : "game"}-${date}.json`,
    replace: "Replace the game in progress with the one in the backup?",
    done: (game, added) => `Imported: ${[game ? "the game in progress" : "", added || !game ? `${pl(added, "game added", "games added")} to the history` : ""].filter(Boolean).join(", and ")}.`,
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
      case "oppYes": return "It has at least 1 silver: it spends in Action.";
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
        case "terraformed": return "Mars is terraformed: end of the game";
        case "correct": return `Fix ${keys[e.key]}: ${e.from} → ${e.to}`;
      }
    })();
    return `R${e.t} · ${line}`;
  }
};

export default en;

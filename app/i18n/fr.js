import { html } from "lit";
import { ag, cu } from "../engine.js";
/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Target} Target */
/** @typedef {import("../engine.js").Level} Level */
/** @typedef {import("../engine.js").AutomaKey} AutomaKey */
/** @typedef {import("../engine.js").Why} Why */
/** @typedef {import("../engine.js").LogEntry} LogEntry */

/* The texts of the app in French, the reference language: en.js must have the same entries
   (the type check says so). A text that depends on a number or a name is a function. */

/** @param {number} n @param {string} one @param {string} many */
const pl = (n, one, many) => `${n} ${n > 1 ? many : one}`;
/** @param {number} n */
const copper = n => pl(n, "cuivre", "cuivres");
/** @param {number} n */
const silver = n => pl(n, "argent", "argents");
/** @param {number} n */
const steps = n => pl(n, "cran", "crans");
/** a reserve in copper units, as silver and copper @param {number} n */
const purse = n => `${silver(ag(n))} et ${copper(cu(n))}`;

const phase = { I: "Développement", II: "Construction", III: "Action", IV: "Production", V: "Recherche" };
const targetLower = { oxy: "oxygène", temp: "température", ocean: "océan" };

const fr = {
  lang: "fr",
  locale: "fr-FR",
  /** @param {number} x */
  decimal: x => x.toFixed(1).replace(".", ","),
  steps,
  phase,
  phaseShort: { I: "Dév.", II: "Const.", III: "Action", IV: "Prod.", V: "Rech." },
  target: { oxy: "Oxygène", temp: "Température", ocean: "Océan" },
  targetLower,
  level: { tresfacile: "Très facile", facile: "Facile", normal: "Normal", difficile: "Difficile", tresdifficile: "Très difficile" },
  /** @param {number} n */
  levelText: n => `Moteur de départ : ${n}.`,

  top: {
    back: "Retour au site", brand: "Automa hybride",
    /** @param {string} v */
    sub: v => `Assistant de partie · v${v} brouillon`,
    undo: "Annuler", undoShort: "↶", history: "Historique", historyShort: "Parties",
    newGame: "Nouvelle partie", newShort: "Nouvelle", confirm: "Confirmer ?", confirmShort: "Sûr ?", confirmAria: "Confirmer la nouvelle partie",
    other: "EN", otherAria: "English version"
  },
  /** @param {number} n */
  journal: n => `Journal (${n})`,

  setup: {
    title: "Nouvelle partie",
    intro: "L'assistant joue l'automa : il tire ses cartes, compte ses cuivres et ses argents et dit quoi faire sur son plateau. Le plateau et les cartes projet restent sur la table.",
    level: "Niveau", deck: "Pioche de l'automa",
    deckApp: { title: "L'appli tire", text: "L'assistant tire la carte automa au hasard." },
    deckCards: { title: "Cartes imprimées", text: "Le joueur retourne la carte imprimée et indique son numéro." },
    setupTitle: "Mise en place",
    /** @param {number} engine */
    setup: engine => `Un plateau joueur pour l'automa, un marqueur sur le 5 de la piste de NT, le marqueur de production des MC sur ${engine} (son moteur), des cubes cuivre et argent. Réserve et compteur de PV vides. Ni corporation, ni main.`,
    begin: "Commencer la partie"
  },

  plan: {
    title: "Planification",
    /** @param {string | null} last */
    intro: last => `Phase choisie par le joueur${last ? ` (pas ${last}, jouée au tour précédent)` : ""}, puis la carte de l'automa.`,
    lastPlayed: ", déjà jouée au tour précédent",
    draw: "Retourner la carte automa",
    /** @param {number} n */
    inDeck: n => `${pl(n, "carte", "cartes")} dans la pioche`,
    pickCard: "Retourner sa carte, puis toucher son numéro", pickPhaseFirst: "D'abord la phase du joueur",
    emptyTitle: "Pioche vide", empty: "Remélanger ses 15 cartes avant de tirer.",
    /** @param {number} n @param {string} label @param {boolean} used */
    cardAria: (n, label, used) => `Carte ${n}, ${label}${used ? ", déjà sortie" : ""}`,
    usedNote: "Les cartes déjà sorties depuis le dernier mélange sont grisées."
  },

  reveal: {
    title: "Carte de l'automa", todo: "Ce tour, pour l'automa",
    playerPhase: "phase du joueur", automaPhase: "phase de l'automa", and: " et ",
    /** @param {boolean} ok */
    whatI: ok => `+1 cuivre${ok ? ", puis moteur +1 pour 1 argent" : " : pas d'argent pour le moteur"}`,
    whatII: "+1 cuivre, puis 1 cube sur son compteur de PV",
    /** @param {number} n */
    whatIII: n => `+1 cuivre${n ? `, puis environ ${steps(n)} sur sa cible` : " : pas d'argent pour sa cible"}`,
    /** @param {number} n */
    whatIV: n => `+1 cuivre, puis ${pl(n, "cube", "cubes")} (moteur)`,
    whatV: "+1 cuivre",
    targetTitle: "Sa cible",
    /** @param {string | null} other */
    targetAction: other => ` Elle sert en phase Action : c'est le paramètre qu'il monte${other ? ` (au maximum : il vise ${other} à la place)` : ""}.`,
    targetNoAction: " Elle ne sert qu'en phase Action. Pas de phase Action ce tour : on l'ignore.",
    wait: "Rien à faire pour l'instant. Les phases se résolvent dans l'ordre ; la carte reste affichée.",
    start: "Résoudre les phases"
  },

  phaseScreen: {
    tag: {
      I: "+1 cuivre, puis moteur +1 pour 1 argent.", II: "+1 cuivre, puis 1 cube sur son compteur de PV.",
      III: "+1 cuivre, puis tous ses argents sur sa cible.", IV: "+1 cuivre, puis autant de cuivres que son moteur.", V: "+1 cuivre. Rien de plus."
    },
    todo: "À faire sur son plateau",
    /** @param {boolean} exchange */
    gain: exchange => html`<b>+1 cuivre</b> dans sa réserve${exchange ? " : avec 5 cuivres, l'échanger contre 1 argent" : ""}`,
    /** @param {number} a @param {number} b */
    engineUp: (a, b) => html`<b>Dépenser 1 argent</b> et monter son moteur : ${a} → ${b}`,
    /** @param {number} a */
    engineNo: a => html`Aucun argent : le moteur reste à ${a}`,
    /** @param {number} cubes @param {number} vp */
    counter: (cubes, vp) => html`<b>1 cube sur son compteur de PV</b> (${pl(cubes, "cube", "cubes")}, ${vp} PV)`,
    /** @param {number} n */
    prod: n => html`<b>+${copper(n)}</b> grâce à son moteur`,
    prodNone: html`Moteur à 0 : rien de plus`,
    /** @param {number} n */
    oxy: n => html`<b>Oxygène +${steps(n)}</b> (sans forêt)`,
    /** @param {number} n */
    temp: n => html`<b>Température +${steps(n)}</b>`,
    /** @param {number} n */
    ocean: n => html`<b>Retourner ${pl(n, "tuile", "tuiles")} océan</b> : +1 cuivre par tuile, quel que soit le bonus imprimé (déjà compté)`,
    /** @param {number} n @param {number} a @param {number} b */
    nt: (n, a, b) => html`<b>NT de l'automa +${n}</b> (${a} → ${b})`,
    noSilver: html`Aucun argent : rien sur sa cible`,
    /** @param {number} a @param {number} b */
    reserve: (a, b) => `Réserve : ${purse(a)} → ${purse(b)} (5 cuivres = 1 argent).`,
    /** @param {string} name @param {string | null} other */
    target: (name, other) => ` Cible : ${name}${other ? ` au maximum, il passe à ${other}` : ""}.`,
    noBonus: " Pas de bonus pour l'automa.",
    lastRoundTitle: "Dernier tour", lastRound: "Tous les paramètres sont au maximum : chaque argent qu'il lui reste vaut 1 PV.",
    playerBonus: "Le joueur a choisi cette phase : il prend son bonus.", playerNoBonus: "Le joueur joue aussi cette phase, sans bonus.",
    done: "C'est fait",
    /** @param {number} n */
    stepsTitle: n => `Le joueur monte ses crans · ${steps(n)} dans cette Action`,
    stepsNote: "Avant de résoudre l'automa. Chaque cran donne aussi 1 NT au joueur ; le plan de l'automa se recalcule."
  },

  mars: {
    aria: "Paramètres de Mars", title: "Mars · à mettre à jour quand le joueur monte un cran (+1 NT pour lui)",
    oxy: "Oxygène", temp: "Température", tempShort: "Temp.", oce: "Océans",
    oxyName: "l'oxygène", tempName: "la température", oceName: "les océans", tr: "NT du joueur", trName: "le NT du joueur",
    /** @param {string} name */
    lower: name => `Baisser ${name}`,
    /** @param {string} name */
    raise: name => `Monter ${name}`
  },

  status: {
    aria: "État de l'automa",
    /** @param {string} level @param {number} turn */
    head: (level, turn) => `Automa · ${level} · tour ${turn}`,
    edit: "Corriger", done: "Terminer",
    /** @param {string} label */
    remove: label => `Retirer 1 ${label}`,
    /** @param {string} label */
    add: label => `Ajouter 1 ${label}`,
    reserve: "Réserve", reserveSub: "argents et cuivres, zone des MC",
    engine: "Moteur", engineSub: "production des MC", counter: "Compteur", counterSub: "zone des plantes", tr: "NT",
    /** @param {number} n */
    vp: n => `${n} PV`,
    curveSoon: "La courbe de progression apparaîtra ici après 2 tours (le NT du joueur se règle dans le panneau Mars)."
  },

  endTurn: {
    /** @param {number} n */
    title: n => `Fin du tour ${n}`,
    before: "Avant le tour suivant",
    player: html`<b>Le joueur</b> : plus de 10 cartes en main ? Il défausse jusqu'à 10, comme d'habitude.`,
    automa: html`<b>L'automa</b> : rien à faire, il n'a pas de main.`,
    /** @param {boolean} printed @param {number} left */
    card: (printed, left) => html`<b>Sa carte du tour</b> : ${printed
      ? `dans sa défausse. Quand sa pioche est vide, remélanger les 15 cartes (il en reste ${left}).`
      : `l'assistant la met de côté. Elle ne reviendra qu'une fois toute sa pioche utilisée (il en reste ${left}).`}`,
    trTitle: "NT du joueur",
    /** @param {number} p @param {number} a */
    tr: (p, a) => `${p}, contre ${a} pour l'automa. Il se règle à tout moment dans le panneau Mars et sert à tracer la courbe de la partie.`,
    next: "Tour suivant", end: "Terminer la partie"
  },

  end: {
    title: "Décompte final", maxed: "Tous les paramètres sont au maximum.", stopped: "Partie arrêtée avant la fin des paramètres.",
    scoring: " Le joueur compte comme d'habitude : 1 PV par point de NT, plus ses PV de forêt et de cartes. L'automa n'a pas de forêt.",
    automa: "Automa", vp: "PV", tr: "NT", silverLeft: "Argents restants au dernier tour", counter: "Compteur de PV (1 PV par cube)", total: "Total",
    /** @param {number} p @param {number} a */
    playerScore: (p, a) => `Score du joueur · ${p} contre ${a} pour l'automa`,
    fields: { nt: "NT", forets: "Forêts", cartes: "Cartes", autres: "Autres PV" },
    stepsTitle: "Crans du joueur",
    /** @param {number} total @param {number} actions @param {string} detail @param {number} outside */
    steps: (total, actions, detail, outside) => `${steps(total)} en ${pl(actions, "phase", "phases")} Action${detail ? ` (${detail})` : ""}${outside ? `, et ${steps(outside)} hors Action` : ""}.`,
    /** @param {string} mean @param {string} list */
    perAction: (mean, list) => `${mean} par Action : ${list}`,
    remark: "Remarques (équilibrage, ressenti)",
    save: "Enregistrer la partie", saved: "Partie enregistrée", resume: "Reprendre la partie",
    savedToast: "Partie enregistrée dans l'historique de ce navigateur."
  },

  history: {
    title: "Historique", back: "Retour à la partie",
    /** @param {number} n @param {number} won */
    summary: (n, won) => `${pl(n, "partie", "parties")} · ${pl(won, "victoire", "victoires")} du joueur contre l'automa.`,
    empty: "Aucune partie enregistrée pour l'instant. À la fin d'une partie, l'enregistrer depuis l'écran de décompte : elle apparaîtra ici.",
    cols: ["Date", "Niveau", "Règles", "Tours", "Joueur", "NT joueur", "Crans / Action", "Automa", "Gagnant", "NT par tour", "Crans", "Remarques"],
    winner: { player: "Joueur", automa: "Automa", tie: "Égalité" }
  },

  transfer: {
    title: "Sauvegarde",
    intro: "Pour continuer sur un autre appareil ou garder une copie : exporter un fichier (ou copier le texte) avec la partie en cours et l'historique, puis l'importer (ou le coller) sur l'autre appareil. L'historique importé s'ajoute à celui-ci.",
    export: "Exporter", import: "Importer", copy: "Copier", paste: "Coller",
    pasteLabel: "Coller ici le texte d'une sauvegarde", importText: "Importer le texte",
    copied: "Sauvegarde copiée : la coller dans l'appli de l'autre appareil (Historique, Coller).",
    copyFailed: "La copie n'a pas marché : utiliser Exporter.",
    /** @param {string} date */
    fileName: date => `automa-sauvegarde-${date}.json`,
    replace: "Remplacer la partie en cours par celle de la sauvegarde ?",
    /** @param {boolean} game @param {number} added */
    done: (game, added) => `Importé : ${game ? "la partie en cours, et " : ""}${pl(added, "partie ajoutée", "parties ajoutées")} à l'historique.`,
    kept: "La partie en cours de cet appareil est gardée.",
    error: { json: "Cette sauvegarde n'est pas lisible.", format: "Cette sauvegarde ne vient pas de cette appli.", empty: "Cette sauvegarde ne contient ni partie ni historique." }
  },

  curve: {
    nt: "NT par tour", crans: "Crans de Mars, cumulés", player: "Joueur", automa: "Automa",
    /** @param {number} a @param {number} b */
    rounds: (a, b) => `tours ${a} à ${b}`,
    /** @param {string} title */
    aria: title => `${title} : le joueur en orange, l'automa en pointillés`
  },

  /** why a reactive card chose its phase (a text in games saved before the translation)
      @param {Why | string | null | undefined} w @returns {string} */
  why: w => {
    if (!w || typeof w === "string") return w || "";
    switch (w.k) {
      case "riposte": return `Phase du joueur au tour précédent : ${phase[w.phase]}.`;
      case "riposteFirst": return "Premier tour : Production.";
      case "oppSilver": return `Il a ${silver(w.silver)} : il dépense en Action.`;
      case "oppNone": return "Il n'a aucun argent : il produit.";
      case "course": return `Paramètre le moins avancé : ${targetLower[w.target]}.`;
    }
  },

  /** a line of the game log (a text in games saved before the translation)
      @param {LogEntry} e @returns {string} */
  log: e => {
    if (typeof e === "string") return e;
    /** @type {Record<AutomaKey, string>} */
    const keys = { cubes: "réserve", moteur: "moteur", compteur: "compteur de PV", nt: "NT" };
    const line = (() => {
      switch (e.k) {
        case "new": return `Nouvelle partie (règles v${e.rules}), niveau ${fr.level[e.level]}, moteur de départ ${e.engine}`;
        case "reshuffle": return "Pioche automa remélangée";
        case "draw": return `Carte ${e.card} : ${phase[e.phase]}, cible ${targetLower[e.target]} (joueur : ${e.player ? phase[e.player] : "?"})`;
        case "phase": {
          const c = e.ch;
          const what = e.phase === "I" ? (c.moteur ? `moteur ${e.engine} (1 argent)` : "moteur inchangé, aucun argent")
            : e.phase === "II" ? `compteur de PV ${e.counter}`
            : e.phase === "III" ? `+${c.oxy} oxygène, +${c.temp} température, ${c.oce} océan(s), NT +${c.nt}, ${silver(c.spent / 5)} dépensé${c.spent > 5 ? "s" : ""}${c.oce ? `, +${c.oce} cuivre(s) (bonus océans)` : ""}`
            : e.phase === "IV" ? `+${c.prod} (moteur)` : "rien de plus";
          return `${phase[e.phase]} : +1 cuivre, ${what} → ${purse(e.after)} (avant : ${purse(e.before)})`;
        }
        case "lastRound": return `Dernier tour : ${silver(e.silver)} restant = ${e.silver} PV`;
        case "maxed": return "Tous les paramètres sont au maximum : fin de partie.";
        case "stopped": return "Partie terminée à la demande";
        case "correct": return `Correction ${keys[e.key]} : ${e.from} → ${e.to}`;
      }
    })();
    return `T${e.t} · ${line}`;
  }
};

/** @typedef {typeof fr} Messages */
export default fr;

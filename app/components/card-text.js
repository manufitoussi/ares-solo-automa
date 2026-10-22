import { html } from "lit";
import { icon, cardIcon } from "./ui.js";
/** @typedef {import("lit").TemplateResult} TemplateResult */
/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Target} Target */
/** @typedef {import("../engine.js").Reaction} Reaction */

/* The texts of the automa card, in each language of the site. The short texts (tiny card) are
   the ones of the landing page. The reactive cards keep their names in every language. */

/**
 * @typedef {object} CardText
 * @property {Record<Phase, string>} phase
 * @property {Record<Target, string>} target
 * @property {Record<Target, string>} targetShort
 * @property {Record<Phase, TemplateResult>} effect        what the automa does in the phase
 * @property {Record<Phase, TemplateResult>} effectShort
 * @property {Record<Phase, TemplateResult>} player        what the player does (third person, as on the printed cards)
 * @property {Record<Phase, string>} playerShort
 * @property {Record<Reaction, string>} rule               a reactive card shown outside a game
 * @property {{ automa: string, reactive: string, target: string, player: string, plays: string, least: string }} label
 */

const CU = icon("cube", 14), AG = icon("argent", 14);

/** @type {{ fr: CardText, en: CardText }} */
export const CARD_TEXT = {
  fr: {
    phase: { I: "Développement", II: "Construction", III: "Action", IV: "Production", V: "Recherche" },
    target: { oxy: "Oxygène", temp: "Température", ocean: "Océan" },
    targetShort: { oxy: "Oxygène", temp: "Temp.", ocean: "Océan" },
    effect: {
      I: html`+1 ${CU}. Puis, s'il a 1 ${AG}, il le dépense&nbsp;: <b>moteur +1</b>.`,
      II: html`+1 ${CU}. Puis il pose 1 ${CU} sur son <b>compteur de PV</b>.`,
      III: html`+1 ${CU}. Puis il dépense <b>tous ses ${AG}</b> sur sa cible : 1 cran par ${AG}.`,
      IV: html`+1 ${CU}. Puis il gagne <b>autant de ${CU} que son moteur</b>.`,
      V: html`+1 ${CU}. Rien de plus.`
    },
    effectShort: {
      I: html`+1 ${CU}, puis 1 ${AG} : <b>moteur +1</b>.`,
      II: html`+1 ${CU}, puis 1 ${CU} sur son <b>compteur de PV</b>.`,
      III: html`+1 ${CU}, puis tous ses ${AG} sur sa cible.`,
      IV: html`+1 ${CU}, puis autant de ${CU} que son moteur.`,
      V: html`+1 ${CU}. Rien de plus.`
    },
    player: {
      I: html`peut jouer 1 ${cardIcon("#3D7A47")} carte verte.`,
      II: html`peut jouer 1 ${cardIcon("#2E5A8A")} carte bleue ou 1 ${cardIcon("#B5342A")} rouge.`,
      III: html`active ses « Action : » et les actions standard de son choix.`,
      IV: html`produit : ${icon("mc", 14)} production + NT, ${icon("chaleur", 14)} chaleur, ${icon("plantes", 14)} plantes, ${icon("cartes", 14)} cartes.`,
      V: html`pioche 2 ${icon("cartes", 14)} cartes et en garde&nbsp;1.`
    },
    playerShort: {
      I: "joue 1 carte verte.", II: "joue 1 carte bleue ou rouge.", III: "active ses actions.",
      IV: "produit.", V: "pioche 2 cartes, en garde 1."
    },
    rule: {
      Riposte: "Il joue la phase du joueur au tour précédent (Production au premier tour).",
      Opportuniste: "Action s'il a un argent, sinon Production.",
      Course: "Action, sur le paramètre le moins avancé."
    },
    label: { automa: "Automa", reactive: "réactive", target: "Cible", player: "Joueur", plays: "Il joue :", least: "Le moins avancé" }
  },
  en: {
    phase: { I: "Development", II: "Construction", III: "Action", IV: "Production", V: "Research" },
    target: { oxy: "Oxygen", temp: "Temperature", ocean: "Ocean" },
    targetShort: { oxy: "Oxygen", temp: "Temp.", ocean: "Ocean" },
    effect: {
      I: html`+1 ${CU}. Then, if it has 1 ${AG}, it spends it: <b>engine +1</b>.`,
      II: html`+1 ${CU}. Then it puts 1 ${CU} on its <b>VP counter</b>.`,
      III: html`+1 ${CU}. Then it spends <b>all its ${AG}</b> on its target: 1 step per ${AG}.`,
      IV: html`+1 ${CU}. Then it gains <b>as many ${CU} as its engine</b>.`,
      V: html`+1 ${CU}. Nothing more.`
    },
    effectShort: {
      I: html`+1 ${CU}, then 1 ${AG}: <b>engine +1</b>.`,
      II: html`+1 ${CU}, then 1 ${CU} on its <b>VP counter</b>.`,
      III: html`+1 ${CU}, then all its ${AG} on its target.`,
      IV: html`+1 ${CU}, then as many ${CU} as its engine.`,
      V: html`+1 ${CU}. Nothing more.`
    },
    player: {
      I: html`may play 1 ${cardIcon("#3D7A47")} green card.`,
      II: html`may play 1 ${cardIcon("#2E5A8A")} blue or 1 ${cardIcon("#B5342A")} red card.`,
      III: html`uses their “Action:” cards and the standard actions of their choice.`,
      IV: html`produces: ${icon("mc", 14)} production + TR, ${icon("chaleur", 14)} heat, ${icon("plantes", 14)} plants, ${icon("cartes", 14)} cards.`,
      V: html`draws 2 ${icon("cartes", 14)} cards and keeps&nbsp;1.`
    },
    playerShort: {
      I: "plays 1 green card.", II: "plays 1 blue or red card.", III: "uses its actions.",
      IV: "produces.", V: "draws 2 cards, keeps 1."
    },
    rule: {
      Riposte: "It plays the player's phase of the previous round (Production in the first round).",
      Opportuniste: "Action if it has a silver, otherwise Production.",
      Course: "Action, on the least advanced parameter."
    },
    label: { automa: "Automa", reactive: "reactive", target: "Target", player: "Player", plays: "It plays:", least: "Least advanced" }
  }
};

/** the texts for an element: the language of the closest lang attribute, French by default
    @param {Element} el @returns {CardText} */
export const cardTextFor = el => (el.closest("[lang]")?.getAttribute("lang") ?? "fr").startsWith("en") ? CARD_TEXT.en : CARD_TEXT.fr;

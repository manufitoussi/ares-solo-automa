import { html, nothing } from "lit";
import { ag, computePhase, hasBoard } from "../engine.js";
import { t } from "../i18n.js";
/** @typedef {import("../engine.js").Game} Game */
/** @typedef {import("../engine.js").Phase} Phase */

/* What a phase gives each side, as the printed player phase cards said it (in our words).
   Used by the planning screen (before the card is drawn) and by the phase screen. */

/** The player's side: their skill, and the bonus when it is the phase they chose.
    @param {Phase} ph @param {boolean} chosen */
export const playerBlock = (ph, chosen) => html`
  <div class="side-block player">
    <span class="lab">${t.info.player}</span>
    <p>${t.info.skill[ph]}</p>
    ${chosen
      ? html`<p class="bonus"><b>${t.info.bonus}</b>${t.info.chosen} ${t.info.bonusText[ph]}</p>`
      : html`<p class="muted">${t.info.notChosen}</p>`}
  </div>`;

/** What the automa would do in this phase, from its board as it is now (before its +1 copper).
    The Action phase is counted in silver only: its target is not known before the draw.
    @param {Game} st @param {Phase} ph @returns {string} */
export function automaNow(st, ph) {
  const a = st.a, N = t.info.now;
  if (ph === "III") { const n = ag(a.cubes + 1); return N.III(n, a.nt, a.nt + n); }
  const r = computePhase(st, ph);
  if (ph === "I") return N.I(r.ch.moteur > 0, a.moteur, r.a.moteur);
  if (ph === "II") return N.II(a.compteur, r.a.compteur);
  if (ph === "IV") return N.IV(r.ch.prod);
  return N.V;
}

/** The automa's side in the planning: numbers with the board in the app, the rule otherwise.
    @param {Game} st @param {Phase} ph */
export const automaBlock = (st, ph) => html`
  <div class="side-block automa">
    <span class="lab">${t.info.automa}</span>
    ${hasBoard(st)
      ? html`<p>${automaNow(st, ph)}</p><p class="muted">${t.info.reserve(st.a.cubes)}</p>`
      : html`<p>${t.info.rule[ph]}</p>`}
    ${ph === "III" ? html`<p class="muted">${t.info.targetRule}</p>` : nothing}
  </div>`;

import { html, nothing, styleMap } from "lit";
import { ag, computePhase, hasBoard } from "../engine.js";
import { t } from "../i18n.js";
import { PHASE_COLOR, PHASE_TINT } from "./ui.js";
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

/** The player's phase card, drawn like the printed one (short texts); an empty slot before
    the player picks. Used by the table screen and the phase screen.
    @param {Phase | null} ph */
export function playerCard(ph) {
  const T = t.table;
  if (!ph) return html`<div class="cw"><div class="cempty">${T.empty}</div></div>`;
  const C = PHASE_COLOR[ph];
  return html`
    <div class="cw"><div class="pcard" role="img" aria-label="${T.player} : ${t.phase[ph]}">
      <div class="pc-ban" style=${styleMap({ background: C.col, color: C.dark ? "#1F1A24" : "#fff" })}>
        <span class="r">${ph}</span><span class="nm">${t.phase[ph]}</span></div>
      <div class="pc-meta"><span>${T.meta}</span><span>${T.metaPhase}</span></div>
      <div class="pc-you"><span class="pc-lab">${T.skill}</span><p>${T.skillShort[ph]}</p></div>
      <p class="pc-bon"><b>${t.info.bonus}</b> ${T.bonusShort[ph]}</p>
      <div class="pc-au" style=${styleMap({ background: PHASE_TINT[ph] })}><span class="pc-tag">${T.automa}</span><p>${t.phaseScreen.tag[ph]}</p></div>
    </div></div>`;
}

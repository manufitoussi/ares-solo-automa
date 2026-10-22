import { html, nothing, styleMap } from "lit";
import { LightElement } from "./light-element.js";
import { PH, CIB, card } from "../engine.js";
import { PHASE_COLOR, REACT_COLOR, PHASE_TINT, TARGET_COLOR, EFFECT, PLAYER, icon } from "./ui.js";

/* An automa card, drawn like the printed card. It only needs plain attributes, so it also
   works in any HTML page, without the app around it:
     <automa-card number="5"></automa-card>
     <automa-card number="13" phase="II" why="Phase du joueur au tour précédent."></automa-card>
   `phase` and `target` default to the ones printed on the card; a reactive card (13 to 15)
   needs `phase`, since it depends on the game, and `target` for card 15.
   `still` turns off the flip animation, for when the card stays on screen. */
export class AutomaCard extends LightElement {
  /* `type: Number` converts the attribute text "5" into the number 5 */
  static properties = {
    number: { type: Number },
    phase: { type: String },
    target: { type: String },
    why: { type: String },
    still: { type: Boolean }
  };

  render() {
    const cd = card(this.number);
    if (!cd) return nothing;
    const ph = this.phase || cd.ph, target = this.target || cd.c;
    if (!PH[ph] || !CIB[target]) return nothing;
    const P = PH[ph], C = PHASE_COLOR[ph];
    const banner = cd.react
      ? { background: REACT_COLOR, color: null }
      : { background: C.col, color: C.dark ? "#1F1A24" : null };
    return html`
      <div class="acard ${this.still ? "still" : ""}" aria-label="Carte automa ${cd.n}">
        <div class="kban" style=${styleMap(banner)}>
          ${cd.react
            ? html`<span class="r" style="color:#8FE3E8">?</span><span class="nm">${cd.react}</span>`
            : html`<span class="r">${ph}</span><span class="nm">${P.nom}</span>`}
        </div>
        <div class="meta"><span>Automa${cd.react ? " · réactive" : ""}</span><span>${String(cd.n).padStart(2, "0")} / 15</span></div>
        ${cd.react ? html`<div class="why">Il joue : <b>${P.nom}</b>. ${this.why}</div>` : nothing}
        <div class="au" style=${styleMap({ background: PHASE_TINT[ph] })}><p>${EFFECT[ph]}</p></div>
        <div class="sp"></div>
        <div class="cib" style=${styleMap({ borderColor: TARGET_COLOR[target] })}>
          <span class="l">Cible</span>${icon(target, 24)}<span class="cn">${CIB[target].nom}</span>
          <span class="cc">1 ${icon("argent", 14)}</span>
        </div>
        <div class="vous"><span class="t">Joueur</span><p>${PLAYER[ph]}</p></div>
      </div>`;
  }
}
customElements.define("automa-card", AutomaCard);

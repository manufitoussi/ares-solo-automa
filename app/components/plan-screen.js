import { html, styleMap } from "lit";
import { LightElement } from "./light-element.js";
import { ORDER, CARDS, canPick } from "../engine.js";
import { t } from "../i18n.js";
import { PHASE_COLOR, REACT_COLOR } from "./ui.js";
/** @typedef {import("../engine.js").Game} Game */

/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Card} Card */

/** @param {Card} cd */
const cardLabel = cd => cd.react ?? `${t.phaseShort[/** @type {Phase} */ (cd.ph)]} · ${t.target[/** @type {import("../engine.js").Target} */ (cd.c)]}`;
/** @param {number} n */
const pad = n => String(n).padStart(2, "0");

/* Planning: the player picks their phase, then the automa card is drawn.
   It only displays the game it receives and reports `pick` (a phase) and `draw`
   (a card number with the printed cards, null when the app draws). */
export class PlanScreen extends LightElement {
  static properties = { game: { attribute: false } };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
  }

  /** @param {Phase} ph */
  phaseButton(ph) {
    const st = this.game, C = PHASE_COLOR[ph], last = st.lastPlayerPhase === ph;
    /* styleMap sets inline styles from an object; `?disabled` adds or removes a boolean attribute */
    return html`
      <button type="button" class="phb" style=${styleMap({ background: C.col, color: C.dark ? "#1F1A24" : null })}
        aria-pressed=${st.playerPhase === ph} ?disabled=${!canPick(st, ph)}
        aria-label="${t.phase[ph]}${last ? t.plan.lastPlayed : ""}"
        @click=${() => this.emit("pick", ph)}>
        <span class="r">${ph}</span><span class="n">${t.phase[ph]}</span><span class="short">${t.phaseShort[ph]}</span>
      </button>`;
  }

  /* with the printed cards: one button per card, the ones already out are greyed */
  printedCards() {
    const st = this.game, full = !st.deck.length;
    return html`
      <div><span class="lab">${st.playerPhase ? t.plan.pickCard : t.plan.pickPhaseFirst}</span>
        ${full ? html`<p class="note" style="margin-top:6px"><b>${t.plan.emptyTitle}</b> ${t.plan.empty}</p>` : ""}
        <div class="pick15" style="margin-top:6px">
          ${CARDS.map(cd => {
            const used = !full && !st.deck.includes(cd.n);
            return html`
              <button type="button" ?disabled=${!st.playerPhase || used} @click=${() => this.emit("draw", cd.n)}
                aria-label=${t.plan.cardAria(cd.n, cardLabel(cd), used)}>
                <i style=${styleMap({ background: cd.react ? REACT_COLOR : PHASE_COLOR[/** @type {Phase} */ (cd.ph)].col })}></i><b>${pad(cd.n)}</b>${cardLabel(cd)}
              </button>`;
          })}
        </div>
        <p style="font-size:13px;color:var(--muted);margin-top:6px">${t.plan.usedNote}</p>
      </div>`;
  }

  render() {
    const st = this.game, n = st.deck.length;
    return html`
      <section class="panel">
        <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">${t.plan.title}</h2>
        <p>${t.plan.intro(st.lastPlayerPhase ? t.phase[st.lastPlayerPhase] : null)}</p>
        <div class="phases">${ORDER.map(ph => this.phaseButton(ph))}</div>
        ${st.pioche === "cartes" ? this.printedCards() : html`
          <div class="row">
            <button type="button" class="cta" ?disabled=${!st.playerPhase} @click=${() => this.emit("draw", null)}>${t.plan.draw}</button>
            <span class="lab">${t.plan.inDeck(n)}</span>
          </div>`}
      </section>`;
  }
}
customElements.define("plan-screen", PlanScreen);

import { html } from "lit";
import { LightElement } from "./light-element.js";
import { pntOf } from "../engine.js";
import { t } from "../i18n.js";
/** @typedef {import("../engine.js").Game} Game */

/* End of the round. Reports `next` (next round) or `end` (stop the game here). */
export class EndTurnScreen extends LightElement {
  static properties = { game: { attribute: false } };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
  }

  render() {
    const st = this.game, E = t.endTurn;
    return html`
      <section class="panel">
        <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">${E.title(st.turn)}</h2>
        <div class="todo"><span class="lab">${E.before}</span><ul>
          <li>${E.player}</li>
          <li>${E.automa}</li>
          <li>${E.card(st.pioche === "cartes", st.deck.length)}</li>
        </ul></div>
        <p class="note"><b>${E.trTitle}</b> ${E.tr(pntOf(st), st.a.nt)}</p>
        <div class="row">
          <button type="button" class="cta" @click=${() => this.emit("next")}>${E.next}</button>
          <button type="button" class="ghost" @click=${() => this.emit("end")}>${E.end}</button>
        </div>
      </section>`;
  }
}
customElements.define("end-turn-screen", EndTurnScreen);

import { html } from "lit";
import { LightElement } from "./light-element.js";
import { pntOf } from "../engine.js";
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
    const st = this.game;
    return html`
      <section class="panel">
        <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">Fin du tour ${st.turn}</h2>
        <div class="todo"><span class="lab">Avant le tour suivant</span><ul>
          <li><b>Le joueur</b> : plus de 10 cartes en main ? Il défausse jusqu'à 10, comme d'habitude.</li>
          <li><b>L'automa</b> : rien à faire, il n'a pas de main.</li>
          <li><b>Sa carte du tour</b> : ${st.pioche === "cartes"
            ? `dans sa défausse. Quand sa pioche est vide, remélanger les 15 cartes (il en reste ${st.deck.length}).`
            : `l'assistant la met de côté. Elle ne reviendra qu'une fois toute sa pioche utilisée (il en reste ${st.deck.length}).`}</li>
        </ul></div>
        <p class="note"><b>NT du joueur</b> ${pntOf(st)}, contre ${st.a.nt} pour l'automa. Il se règle à tout moment dans le panneau Mars et sert à tracer la courbe de la partie.</p>
        <div class="row">
          <button type="button" class="cta" @click=${() => this.emit("next")}>Tour suivant</button>
          <button type="button" class="ghost" @click=${() => this.emit("end")}>Terminer la partie</button>
        </div>
      </section>`;
  }
}
customElements.define("end-turn-screen", EndTurnScreen);

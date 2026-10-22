import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { allMax, scoreAutoma } from "../engine.js";
import { icon } from "./ui.js";
import "./tr-curve.js";

/* Final scoring. The player's score and remarks are typed here, kept in the component
   until "Enregistrer", then sent up with `save` ({playerScore, remark}).
   `resume` goes back to the game if it was stopped by mistake. */
export class EndScreen extends LightElement {
  static properties = {
    game: { attribute: false },
    score: { state: true },
    remark: { state: true }
  };

  /* willUpdate runs before each render: the place to prepare state from new properties.
     Here, the fields start from what the game already holds. */
  willUpdate(changed) {
    if (changed.has("game") && this.score === undefined) {
      this.score = this.game.playerScore ?? "";
      this.remark = this.game.remark ?? "";
    }
  }

  save() {
    const n = parseInt(this.score, 10);
    this.emit("save", { playerScore: isNaN(n) ? null : n, remark: this.remark.trim() });
  }

  render() {
    const st = this.game, sc = scoreAutoma(st.a);
    return html`
      <section class="panel">
        <h2 style="font-size:32px;font-style:italic;text-transform:uppercase">Décompte final</h2>
        <p>${allMax(st.p) ? "Tous les paramètres sont au maximum." : "Partie arrêtée avant la fin des paramètres."} Le joueur compte comme d'habitude : 1 PV par point de NT, plus ses PV de forêt et de cartes. L'automa n'a pas de forêt.</p>
        <div class="scroll"><table><thead><tr><th>Automa</th><th class="n">PV</th></tr></thead><tbody>
          <tr><td>${icon("nt")} NT</td><td class="n">${sc.nt}</td></tr>
          <tr><td>${icon("argent", 14)} Argents restants au dernier tour</td><td class="n">${sc.fin}</td></tr>
          <tr><td>${icon("pv")} Compteur de PV (1 PV par cube)</td><td class="n">${sc.pv}</td></tr>
          <tr><td><b>Total</b></td><td class="n"><b>${sc.total}</b></td></tr>
        </tbody></table></div>
        <tr-curve legend .track=${st.track}></tr-curve>
        <div class="fgrid">
          <div class="field"><label for="e-score">Score du joueur</label>
            <input type="number" id="e-score" min="0" inputmode="numeric" .value=${String(this.score)} ?disabled=${st.saved}
              @input=${e => { this.score = e.target.value; }}></div>
          <div class="field" style="grid-column:span 2"><label for="e-rem">Remarques (équilibrage, ressenti)</label>
            <input type="text" id="e-rem" maxlength="300" .value=${this.remark} ?disabled=${st.saved}
              @input=${e => { this.remark = e.target.value; }}></div>
        </div>
        <div class="row">
          <button type="button" class="cta" ?disabled=${st.saved} @click=${this.save}>${st.saved ? "Partie enregistrée" : "Enregistrer la partie"}</button>
          ${st.saved ? nothing : html`<button type="button" class="ghost" @click=${() => this.emit("resume")}>Reprendre la partie</button>`}
        </div>
        ${st.saved ? html`<p class="toast">Partie enregistrée dans l'historique de ce navigateur.</p>` : nothing}
      </section>`;
  }
}
customElements.define("end-screen", EndScreen);

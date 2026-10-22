import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { NIV, ag, cu, vpOf } from "../engine.js";
import { icon } from "./ui.js";
import "./tr-curve.js";
/** @typedef {import("../engine.js").Game} Game */
/** @typedef {import("../engine.js").AutomaKey} AutomaKey */

/* The automa board: reserve, engine, VP counter and TR.
   "Corriger" shows − / + buttons; that mode is local to the component (`edit`), the game
   itself only changes through the `correct` event ({key, delta}) sent to the parent. */
export class AutomaStatus extends LightElement {
  static properties = {
    game: { attribute: false },
    edit: { state: true }
  };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
    this.edit = false;
  }

  /** @param {string} label @param {unknown} value @param {AutomaKey} key @param {string} [sub] */
  stat(label, value, key, sub) {
    return html`
      <div class="stat">
        <span class="k">${label}</span>
        <span class="v num">${value}</span>
        ${sub ? html`<span class="sub">${sub}</span>` : nothing}
        ${this.edit ? html`
          <div class="adj">
            <button type="button" aria-label="Retirer 1 ${label}" @click=${() => this.emit("correct", { key, delta: -1 })}>−</button>
            <button type="button" aria-label="Ajouter 1 ${label}" @click=${() => this.emit("correct", { key, delta: 1 })}>+</button>
          </div>` : nothing}
      </div>`;
  }

  render() {
    const st = this.game, a = st.a;
    return html`
      <section class="panel" aria-label="État de l'automa">
        <div class="row" style="justify-content:space-between">
          <span class="lab">Automa · ${NIV[st.niveau]} · tour ${st.turn}</span>
          <button type="button" class="ghost" style="min-height:36px;padding:4px 12px" @click=${() => { this.edit = !this.edit; }}>
            ${this.edit ? "Terminer" : "Corriger"}</button>
        </div>
        <div class="stats">
          ${this.stat("Réserve", html`${ag(a.cubes)}${icon("argent", 14)} <small>+</small> ${cu(a.cubes)}${icon("cube", 14)}`, "cubes", "argents et cuivres, zone des MC")}
          ${this.stat("Moteur", html`${icon("moteur")}${a.moteur}`, "moteur", "production des MC")}
          ${this.stat("Compteur", html`${icon("pv")}${a.compteur} <small>${vpOf(a)} PV</small>`, "compteur", "zone des plantes")}
          ${this.stat("NT", html`${icon("nt")}${a.nt}`, "nt")}
        </div>
        ${(st.track || []).length >= 2
          ? html`<tr-curve legend .track=${st.track ?? []}></tr-curve>`
          : html`<p style="font-size:13px;color:var(--muted)">La courbe de progression apparaîtra ici après 2 tours (le NT du joueur se règle dans le panneau Mars).</p>`}
      </section>`;
  }
}
customElements.define("automa-status", AutomaStatus);

import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { ag, cu, vpOf } from "../engine.js";
import { t } from "../i18n.js";
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
            <button type="button" aria-label=${t.status.remove(label)} @click=${() => this.emit("correct", { key, delta: -1 })}>−</button>
            <button type="button" aria-label=${t.status.add(label)} @click=${() => this.emit("correct", { key, delta: 1 })}>+</button>
          </div>` : nothing}
      </div>`;
  }

  render() {
    const st = this.game, a = st.a, S = t.status;
    return html`
      <section class="panel" aria-label=${S.aria}>
        <div class="row" style="justify-content:space-between">
          <span class="lab">${S.head(t.level[st.niveau], st.turn)}</span>
          <button type="button" class="ghost" style="min-height:36px;padding:4px 12px" @click=${() => { this.edit = !this.edit; }}>
            ${this.edit ? S.done : S.edit}</button>
        </div>
        <div class="stats">
          ${this.stat(S.reserve, html`${ag(a.cubes)}${icon("argent", 14)} <small>+</small> ${cu(a.cubes)}${icon("cube", 14)}`, "cubes", S.reserveSub)}
          ${this.stat(S.engine, html`${icon("moteur")}${a.moteur}`, "moteur", S.engineSub)}
          ${this.stat(S.counter, html`${icon("pv")}${a.compteur} <small>${S.vp(vpOf(a))}</small>`, "compteur", S.counterSub)}
          ${this.stat(S.tr, html`${icon("nt")}${a.nt}`, "nt")}
        </div>
        ${(st.track || []).length >= 2
          ? html`<tr-curve legend .track=${st.track ?? []}></tr-curve><tr-curve legend kind="crans" .track=${st.track ?? []}></tr-curve>`
          : html`<p style="font-size:13px;color:var(--muted)">${S.curveSoon}</p>`}
      </section>`;
  }
}
customElements.define("automa-status", AutomaStatus);

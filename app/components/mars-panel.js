import { html } from "lit";
import { LightElement } from "./light-element.js";
import { MAX, tempC, pntOf } from "../engine.js";
import { t } from "../i18n.js";
import { icon } from "./ui.js";
import "./param-stepper.js";
/** @typedef {import("../engine.js").Game} Game */

/** @typedef {import("../engine.js").Param} Param */
/** @typedef {import("./ui.js").IconName} IconName */

/** @param {number} n */
const signed = n => (n > 0 ? "+" : "") + n;

/* Mars: oxygen, temperature, oceans and the player's TR, set by the player during the game.
   It turns each stepper's `step` into an event that says what to change:
   `param` ({key, delta}) or `player-tr` (delta). */
export class MarsPanel extends LightElement {
  static properties = { game: { attribute: false } };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
  }

  /** @param {Param} key @param {unknown} label @param {string} value @param {IconName} ic @param {string} name */
  param(key, label, value, ic, name) {
    const v = this.game.p[key];
    return html`
      <param-stepper .label=${label} .icon=${icon(ic)} .value=${value} name=${name}
        .progress=${v / MAX[key]} ?max=${v >= MAX[key]}
        @step=${(/** @type {CustomEvent<number>} */ e) => this.emit("param", { key, delta: e.detail })}></param-stepper>`;
  }

  render() {
    const p = this.game.p, M = t.mars;
    return html`
      <section class="panel" aria-label=${M.aria}>
        <span class="lab">${M.title}</span>
        <div class="params">
          ${this.param("oxy", M.oxy, `${p.oxy} %`, "oxy", M.oxyName)}
          ${this.param("temp", html`<span class="full">${M.temp}</span><span class="short">${M.tempShort}</span>`, `${signed(tempC(p.temp))} °C`, "temp", M.tempName)}
          ${this.param("oce", M.oce, `${p.oce} / 9`, "ocean", M.oceName)}
        </div>
        <param-stepper inline .label=${M.tr} .icon=${icon("nt")} .value=${pntOf(this.game)} name=${M.trName}
          @step=${(/** @type {CustomEvent<number>} */ e) => this.emit("player-tr", e.detail)}></param-stepper>
      </section>`;
  }
}
customElements.define("mars-panel", MarsPanel);

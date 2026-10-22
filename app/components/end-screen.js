import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { allMax, scoreAutoma, pntOf, playerStepsPerAction, playerStepsOutsideAction } from "../engine.js";
import { t } from "../i18n.js";
import { icon } from "./ui.js";
import "./tr-curve.js";
/** @typedef {import("../engine.js").Game} Game */
/** @typedef {import("../engine.js").PlayerScore} PlayerScore */
/** @typedef {keyof PlayerScore} ScoreKey */

/** @type {ScoreKey[]} */
const FIELDS = ["nt", "forets", "cartes", "autres"];
const EMPTY = { nt: "", forets: "", cartes: "", autres: "" };
/** @param {string} v */
const toNumber = v => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

/* Final scoring. The player's score is typed in parts (TR, prefilled, then forests, cards and
   other VP), kept in the component until "Enregistrer", then sent up with `save`
   ({playerScore, remark, player}). `resume` goes back to the game if it was stopped by mistake. */
export class EndScreen extends LightElement {
  static properties = {
    game: { attribute: false },
    fields: { state: true },
    remark: { state: true }
  };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
    /** @type {Record<ScoreKey, string> | undefined} what is typed, field by field */
    this.fields = undefined;
    this.remark = "";
  }

  /* willUpdate runs before each render: the place to prepare state from new properties.
     Here, the fields start from what the game already holds. */
  /** @param {Map<PropertyKey, unknown>} changed */
  willUpdate(changed) {
    if (changed.has("game") && this.fields === undefined) {
      const f = this.game.playerFinal;
      this.fields = {
        nt: String(f?.nt ?? pntOf(this.game)), forets: String(f?.forets ?? ""),
        cartes: String(f?.cartes ?? ""), autres: String(f?.autres ?? "")
      };
      this.remark = this.game.remark ?? "";
    }
  }

  /** @returns {PlayerScore} */
  get player() {
    const f = this.fields ?? EMPTY;
    return { nt: toNumber(f.nt), forets: toNumber(f.forets), cartes: toNumber(f.cartes), autres: toNumber(f.autres) };
  }

  /** @param {ScoreKey} key @param {InputEvent} e */
  onField(key, e) {
    this.fields = { ...(this.fields ?? EMPTY), [key]: /** @type {HTMLInputElement} */ (e.target).value };
  }
  /** @param {InputEvent} e */
  onRemark(e) { this.remark = /** @type {HTMLInputElement} */ (e.target).value; }

  save() {
    const player = this.player;
    this.emit("save", { playerScore: player.nt + player.forets + player.cartes + player.autres, remark: this.remark.trim(), player });
  }

  /* the player's steps, for the balancing: per Action phase and outside them */
  steps() {
    const st = this.game, per = playerStepsPerAction(st), outside = playerStepsOutsideAction(st);
    if (!per.length && !outside) return nothing;
    const total = per.reduce((s, x) => s + x, 0);
    const detail = per.length ? t.end.perAction(t.decimal(total / per.length), per.join(", ")) : "";
    return html`<p class="note"><b>${t.end.stepsTitle}</b> ${t.end.steps(total, per.length, detail, outside)}</p>`;
  }

  render() {
    const st = this.game, sc = scoreAutoma(st.a), p = this.player, f = this.fields ?? EMPTY, E = t.end;
    const total = p.nt + p.forets + p.cartes + p.autres;
    return html`
      <section class="panel">
        <h2 style="font-size:32px;font-style:italic;text-transform:uppercase">${E.title}</h2>
        <p>${allMax(st.p) ? E.maxed : E.stopped}${E.scoring}</p>
        <div class="scroll"><table><thead><tr><th>${E.automa}</th><th class="n">${E.vp}</th></tr></thead><tbody>
          <tr><td>${icon("nt")} ${E.tr}</td><td class="n">${sc.nt}</td></tr>
          <tr><td>${icon("argent", 14)} ${E.silverLeft}</td><td class="n">${sc.fin}</td></tr>
          <tr><td>${icon("pv")} ${E.counter}</td><td class="n">${sc.pv}</td></tr>
          <tr><td><b>${E.total}</b></td><td class="n"><b>${sc.total}</b></td></tr>
        </tbody></table></div>
        <div><span class="lab">${E.playerScore(total, sc.total)}</span>
          <div class="fgrid" style="margin-top:6px">
            ${FIELDS.map(key => html`
              <div class="field"><label for="e-${key}">${E.fields[key]}</label>
                <input type="number" id="e-${key}" min="0" inputmode="numeric" .value=${f[key]} ?disabled=${st.saved}
                  @input=${(/** @type {InputEvent} */ e) => this.onField(key, e)}></div>`)}
          </div>
        </div>
        ${this.steps()}
        <tr-curve legend .track=${st.track ?? []}></tr-curve>
        <tr-curve legend kind="crans" .track=${st.track ?? []}></tr-curve>
        <div class="field"><label for="e-rem">${E.remark}</label>
          <input type="text" id="e-rem" maxlength="300" .value=${this.remark} ?disabled=${st.saved} @input=${this.onRemark}></div>
        <div class="row">
          <button type="button" class="cta" ?disabled=${st.saved} @click=${this.save}>${st.saved ? E.saved : E.save}</button>
          ${st.saved ? nothing : html`<button type="button" class="ghost" @click=${() => this.emit("resume")}>${E.resume}</button>`}
        </div>
        ${st.saved ? html`<p class="toast">${E.savedToast}</p>` : nothing}
      </section>`;
  }
}
customElements.define("end-screen", EndScreen);

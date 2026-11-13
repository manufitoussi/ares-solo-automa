import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { allMax, scoreAutoma, pntOf, playerStepsPerAction, playerStepsOutsideAction, tracksMars, hasBoard } from "../engine.js";
import { t } from "../i18n.js";
import { icon, undoButton } from "./ui.js";
import "./tr-curve.js";
/** @typedef {import("../engine.js").Game} Game */
/** @typedef {import("../engine.js").PlayerScore} PlayerScore */
/** @typedef {keyof PlayerScore} ScoreKey */
/** @typedef {"nt" | "compteur" | "argents"} AutomaField  the automa board, counted on the table */

/** @type {ScoreKey[]} */
const FIELDS = ["nt", "forets", "cartes", "autres"];
const EMPTY = { nt: "", forets: "", cartes: "", autres: "" };
/** @type {AutomaField[]} */
const AUTOMA_FIELDS = ["nt", "compteur", "argents"];
const AUTOMA_EMPTY = { nt: "", compteur: "", argents: "" };
/** @param {string} v */
const toNumber = v => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

/* Final scoring. The player's score is typed in parts (TR, prefilled in detailed tracking, then
   forests, cards and other VP), kept in the component until "Enregistrer", then sent up with
   `save` ({playerScore, remark, player, automa}). The automa's score is computed from its board
   in the app; with its board on the table, it is typed too (`automa`: its TR, counter cubes and
   silver left; null otherwise). `resume` goes back to the game if it was ended by mistake. */
export class EndScreen extends LightElement {
  static properties = {
    game: { attribute: false },
    canUndo: { type: Boolean },
    fields: { state: true },
    automa: { state: true },
    remark: { state: true }
  };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
    this.canUndo = false;
    /** @type {Record<ScoreKey, string> | undefined} what is typed, field by field */
    this.fields = undefined;
    /** @type {Record<AutomaField, string>} the automa board on the table, field by field */
    this.automa = AUTOMA_EMPTY;
    this.remark = "";
  }

  /* willUpdate runs before each render: the place to prepare state from new properties.
     Here, the fields start from what the game already holds. */
  /** @param {Map<PropertyKey, unknown>} changed */
  willUpdate(changed) {
    if (changed.has("game") && this.fields === undefined) {
      const st = this.game, f = st.playerFinal;
      this.fields = {
        /* the app only knows the player's TR in detailed tracking */
        nt: String(f?.nt ?? (tracksMars(st) ? pntOf(st) : "")), forets: String(f?.forets ?? ""),
        cartes: String(f?.cartes ?? ""), autres: String(f?.autres ?? "")
      };
      this.remark = st.remark ?? "";
      if (!hasBoard(st) && st.saved) this.automa = { nt: String(st.a.nt), compteur: String(st.a.compteur), argents: String(st.a.pvFin) };
    }
  }

  /** @returns {PlayerScore} */
  get player() {
    const f = this.fields ?? EMPTY;
    return { nt: toNumber(f.nt), forets: toNumber(f.forets), cartes: toNumber(f.cartes), autres: toNumber(f.autres) };
  }

  /** the automa board counted on the table */
  get automaBoard() {
    const f = this.automa;
    return { nt: toNumber(f.nt), compteur: toNumber(f.compteur), silver: toNumber(f.argents) };
  }

  /** @param {ScoreKey} key @param {InputEvent} e */
  onField(key, e) {
    this.fields = { ...(this.fields ?? EMPTY), [key]: /** @type {HTMLInputElement} */ (e.target).value };
  }
  /** @param {AutomaField} key @param {InputEvent} e */
  onAutoma(key, e) {
    this.automa = { ...this.automa, [key]: /** @type {HTMLInputElement} */ (e.target).value };
  }
  /** @param {InputEvent} e */
  onRemark(e) { this.remark = /** @type {HTMLInputElement} */ (e.target).value; }

  save() {
    const player = this.player;
    this.emit("save", {
      playerScore: player.nt + player.forets + player.cartes + player.autres, remark: this.remark.trim(), player,
      automa: hasBoard(this.game) ? null : this.automaBoard
    });
  }

  /* the player's steps, for the balancing: per Action phase and outside them */
  steps() {
    const st = this.game, per = playerStepsPerAction(st), outside = playerStepsOutsideAction(st);
    if (!per.length && !outside) return nothing;
    const total = per.reduce((s, x) => s + x, 0);
    const detail = per.length ? t.end.perAction(t.decimal(total / per.length), per.join(", ")) : "";
    return html`<p class="note"><b>${t.end.stepsTitle}</b> ${t.end.steps(total, per.length, detail, outside)}</p>`;
  }

  /** the automa's score, from its board in the app */
  automaTable() {
    const sc = scoreAutoma(this.game.a), E = t.end;
    return html`
      <div class="scroll"><table><thead><tr><th>${E.automa}</th><th class="n">${E.vp}</th></tr></thead><tbody>
        <tr><td>${icon("nt")} ${E.tr}</td><td class="n">${sc.nt}</td></tr>
        <tr><td>${icon("argent", 14)} ${E.silverLeft}</td><td class="n">${sc.fin}</td></tr>
        <tr><td>${icon("pv")} ${E.counter}</td><td class="n">${sc.pv}</td></tr>
        <tr><td><b>${E.total}</b></td><td class="n"><b>${sc.total}</b></td></tr>
      </tbody></table></div>`;
  }

  /** the automa's board on the table, counted by the player @param {number} total */
  automaFields(total) {
    const st = this.game, E = t.end;
    return html`
      <div><span class="lab">${E.automaScore(total)}</span>
        <p style="font-size:14px;color:var(--muted)">${E.automaCount}.${E.lastRoundTable}</p>
        <div class="fgrid" style="margin-top:6px">
          ${AUTOMA_FIELDS.map(key => html`
            <div class="field"><label for="a-${key}">${E.automaFields[key]}</label>
              <input type="number" id="a-${key}" min="0" inputmode="numeric" .value=${this.automa[key]} ?disabled=${st.saved}
                @input=${(/** @type {InputEvent} */ e) => this.onAutoma(key, e)}></div>`)}
        </div>
      </div>`;
  }

  render() {
    const st = this.game, p = this.player, f = this.fields ?? EMPTY, E = t.end, track = tracksMars(st), board = hasBoard(st);
    const b = this.automaBoard;
    const automaTotal = board ? scoreAutoma(st.a).total : b.nt + b.compteur + b.silver;
    const total = p.nt + p.forets + p.cartes + p.autres;
    const why = st.terraformed ? E.terraformed : allMax(st.p) ? E.maxed : E.stopped;
    return html`
      <section class="panel">
        <h2 style="font-size:32px;font-style:italic;text-transform:uppercase">${E.title}</h2>
        <p>${why}${E.scoring}</p>
        ${board ? this.automaTable() : this.automaFields(automaTotal)}
        <div><span class="lab">${E.playerScore(total, automaTotal)}</span>
          <div class="fgrid" style="margin-top:6px">
            ${FIELDS.map(key => html`
              <div class="field"><label for="e-${key}">${E.fields[key]}</label>
                <input type="number" id="e-${key}" min="0" inputmode="numeric" .value=${f[key]} ?disabled=${st.saved}
                  @input=${(/** @type {InputEvent} */ e) => this.onField(key, e)}></div>`)}
          </div>
        </div>
        ${track ? html`
          ${this.steps()}
          <tr-curve legend .track=${st.track ?? []}></tr-curve>
          <tr-curve legend kind="crans" .track=${st.track ?? []}></tr-curve>` : nothing}
        <div class="field"><label for="e-rem">${E.remark}</label>
          <input type="text" id="e-rem" maxlength="300" .value=${this.remark} ?disabled=${st.saved} @input=${this.onRemark}></div>
        <div class="row actions">
          ${st.saved ? nothing : undoButton(this, this.canUndo)}
          <button type="button" class="cta" ?disabled=${st.saved} @click=${this.save}>${st.saved ? E.saved : E.save}</button>
          ${st.saved ? nothing : html`<button type="button" class="ghost" @click=${() => this.emit("resume")}>${E.resume}</button>`}
        </div>
        ${st.saved ? html`<p class="toast">${E.savedToast}</p>` : nothing}
      </section>`;
  }
}
customElements.define("end-screen", EndScreen);

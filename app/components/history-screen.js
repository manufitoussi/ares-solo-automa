import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { gameRecord, pntOf } from "../engine.js";
import { recordKey } from "../transfer.js";
import { t } from "../i18n.js";
import { actionIcon } from "./ui.js";
import "./tr-curve.js";
/** @typedef {import("../engine.js").Game} Game */
/** @typedef {import("../engine.js").GameRecord} GameRecord */
/** @typedef {"all" | "current" | string} Which  everything, the game in progress, or a saved game (its key) */

/** @param {GameRecord} h */
const winner = h => h.scoreJoueur == null ? "—"
  : h.scoreJoueur > h.scoreAutoma ? t.history.winner.player : h.scoreJoueur < h.scoreAutoma ? t.history.winner.automa : t.history.winner.tie;

/** the player's mean steps per Action phase, for the games that recorded them @param {GameRecord} h */
const stepsPerAction = h => {
  const per = h.joueur?.cransParAction;
  return per?.length ? t.decimal(per.reduce((s, x) => s + x, 0) / per.length) : "—";
};

/* The games of this browser: the game in progress first (unless it is already saved), then
   the saved ones, most recent first; and the backup of the data.
   Each game reports `export`, `copy` and `delete` (detail: which game); the backup section
   reports them for "all", plus `import` (detail: the chosen file) and `import-text` (detail:
   the pasted text). `back` returns to the game; `notice` is the result of the last action. */
export class HistoryScreen extends LightElement {
  static properties = {
    games: { attribute: false },
    game: { attribute: false },
    notice: { attribute: false },
    pasting: { state: true },
    pasted: { state: true }
  };

  constructor() {
    super();
    this.games = /** @type {GameRecord[]} */ ([]);
    this.game = /** @type {Game | null} */ (null);
    this.notice = /** @type {{ error: boolean, text: string } | null} */ (null);
    this.pasting = false;
    this.pasted = "";
  }

  /** the game in progress, as a row of the history, unless it is already saved @returns {GameRecord | null} */
  get current() {
    const g = this.game;
    if (!g || g.saved) return null;
    const player = g.playerFinal ?? { nt: pntOf(g), forets: 0, cartes: 0, autres: 0 };
    return gameRecord(g, { playerScore: g.playerScore ?? null, remark: g.remark ?? "", date: new Date(g.savedAt).toISOString(), player });
  }

  /** @param {Which} which @param {string} date */
  actions(which, date) {
    const H = t.history;
    /* icon buttons: the action is said by the tooltip and to screen readers */
    /** @param {"export" | "copy" | "delete"} name @param {string} label */
    const button = (name, label) => html`
      <button type="button" class="ghost icon-btn ${name === "delete" ? "danger" : ""}" title=${label} aria-label=${H.actionAria(label, date)}
        @click=${() => this.emit(name, which)}>${actionIcon(name)}</button>`;
    return html`<div class="row" style="flex-wrap:nowrap;gap:4px">${button("export", H.export)}${button("copy", H.copy)}${button("delete", H.delete)}</div>`;
  }

  /** @param {GameRecord} h @param {boolean} [current] */
  row(h, current = false) {
    const date = new Date(h.date).toLocaleDateString(t.locale);
    const state = current ? (this.game?.status === "ended" ? t.history.unsaved : t.history.current) : winner(h);
    return html`
      <tr style=${current ? "background:var(--panel2)" : ""}>
        <td>${this.actions(current ? "current" : recordKey(h), date)}</td>
        <td>${date}</td>
        <td>${t.level[h.niveau] || h.niveau}</td>
        <td>${h.version || "—"}</td>
        <td class="n">${h.tours}</td>
        <td class="n">${h.scoreJoueur ?? "—"}</td>
        <td class="n">${h.joueur ? h.joueur.nt : "—"}</td>
        <td class="n">${stepsPerAction(h)}</td>
        <td class="n">${h.scoreAutoma}</td>
        <td>${current ? html`<b>${state}</b>` : state}</td>
        <td><tr-curve .track=${h.courbe} width="120" height="40"></tr-curve></td>
        <td><tr-curve kind="crans" .track=${h.courbe} width="120" height="40"></tr-curve></td>
        <td style="min-width:160px">${h.remarque || ""}</td>
      </tr>`;
  }

  /** the file input is hidden: the Import button opens it */
  pickFile() { /** @type {HTMLInputElement | null} */ (this.querySelector("#import-file"))?.click(); }

  /** @param {Event} e */
  onFile(e) {
    const input = /** @type {HTMLInputElement} */ (e.target), file = input.files?.[0];
    if (file) this.emit("import", file);
    input.value = "";
  }

  importText() {
    this.emit("import-text", this.pasted);
    this.pasted = "";
    this.pasting = false;
  }

  backup() {
    const T = t.transfer, n = this.notice, any = !!this.game || this.games.length > 0;
    return html`
      <div class="fcard">
        <span class="lab">${T.title}</span>
        <p style="font-size:14px">${T.intro}</p>
        <div class="row">
          <button type="button" class="ghost" ?disabled=${!any} @click=${() => this.emit("export", "all")}>${actionIcon("export")}${T.exportAll}</button>
          <button type="button" class="ghost" ?disabled=${!any} @click=${() => this.emit("copy", "all")}>${actionIcon("copy")}${T.copyAll}</button>
          <button type="button" class="ghost" @click=${this.pickFile}>${actionIcon("import")}${T.import}</button>
          <input type="file" id="import-file" accept=".json,application/json" hidden @change=${this.onFile}>
          <button type="button" class="ghost" aria-expanded=${this.pasting} @click=${() => { this.pasting = !this.pasting; }}>${actionIcon("paste")}${T.paste}</button>
        </div>
        ${this.pasting ? html`
          <div class="field"><label for="paste-text">${T.pasteLabel}</label>
            <textarea id="paste-text" rows="4" .value=${this.pasted} style="border:1.5px solid var(--line);background:var(--panel);border-radius:8px;padding:8px 10px;width:100%;font:inherit;font-size:13px"
              @input=${(/** @type {InputEvent} */ e) => { this.pasted = /** @type {HTMLTextAreaElement} */ (e.target).value; }}></textarea></div>
          <div class="row"><button type="button" class="cta" ?disabled=${!this.pasted.trim()} @click=${this.importText}>${T.importText}</button></div>` : nothing}
      </div>`;
  }

  render() {
    const games = this.games, n = games.length, current = this.current;
    const won = games.filter(h => h.scoreJoueur != null && h.scoreJoueur > h.scoreAutoma).length;
    return html`
      <section class="panel">
        <div class="row" style="justify-content:space-between">
          <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">${t.history.title}</h2>
          <button type="button" class="ghost" @click=${() => this.emit("back")}>${t.history.back}</button>
        </div>
        ${n ? html`<p>${t.history.summary(n, won)}</p>` : html`<p>${t.history.empty}</p>`}
        ${this.notice ? html`<p class="toast" role="status" style=${this.notice.error ? "color:var(--danger)" : ""}>${this.notice.text}</p>` : nothing}
        ${n || current ? html`
          <div class="scroll"><table>
            <thead><tr>${t.history.cols.map((c, i) => html`<th class=${[4, 5, 6, 7, 8].includes(i) ? "n" : ""}>${c}</th>`)}</tr></thead>
            <tbody>${current ? this.row(current, true) : nothing}${games.map(h => this.row(h))}</tbody>
          </table></div>` : nothing}
        ${this.backup()}
      </section>`;
  }
}
customElements.define("history-screen", HistoryScreen);

import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { t } from "../i18n.js";
import "./tr-curve.js";
/** @typedef {import("../engine.js").GameRecord} GameRecord */

/** @param {GameRecord} h */
const winner = h => h.scoreJoueur == null ? "—"
  : h.scoreJoueur > h.scoreAutoma ? t.history.winner.player : h.scoreJoueur < h.scoreAutoma ? t.history.winner.automa : t.history.winner.tie;

/** the player's mean steps per Action phase, for the games that recorded them @param {GameRecord} h */
const stepsPerAction = h => {
  const per = h.joueur?.cransParAction;
  return per?.length ? t.decimal(per.reduce((s, x) => s + x, 0) / per.length) : "—";
};

/* The saved games of this browser, most recent first, and the backup of the data.
   Reports `back` to return to the game, `export`, `copy`, `import` (detail: the chosen file)
   and `import-text` (detail: the pasted text);
   `notice` is the result of the last import, set by the parent. */
export class HistoryScreen extends LightElement {
  static properties = {
    games: { attribute: false },
    canExport: { type: Boolean },
    notice: { attribute: false },
    pasting: { state: true },
    pasted: { state: true }
  };

  constructor() {
    super();
    this.games = /** @type {GameRecord[]} */ ([]);
    this.canExport = false;
    this.notice = /** @type {{ error: boolean, text: string } | null} */ (null);
    this.pasting = false;
    this.pasted = "";
  }

  importText() {
    this.emit("import-text", this.pasted);
    this.pasted = "";
    this.pasting = false;
  }

  /** the file input is hidden: the Import button opens it */
  pickFile() { /** @type {HTMLInputElement | null} */ (this.querySelector("#import-file"))?.click(); }

  /** @param {Event} e */
  onFile(e) {
    const input = /** @type {HTMLInputElement} */ (e.target), file = input.files?.[0];
    if (file) this.emit("import", file);
    input.value = "";
  }

  backup() {
    const T = t.transfer, n = this.notice;
    return html`
      <div class="fcard">
        <span class="lab">${T.title}</span>
        <p style="font-size:14px">${T.intro}</p>
        <div class="row">
          <button type="button" class="ghost" ?disabled=${!this.canExport} @click=${() => this.emit("export")}>${T.export}</button>
          <button type="button" class="ghost" @click=${this.pickFile}>${T.import}</button>
          <input type="file" id="import-file" accept=".json,application/json" hidden @change=${this.onFile}>
          <button type="button" class="ghost" ?disabled=${!this.canExport} @click=${() => this.emit("copy")}>${T.copy}</button>
          <button type="button" class="ghost" aria-expanded=${this.pasting} @click=${() => { this.pasting = !this.pasting; }}>${T.paste}</button>
        </div>
        ${this.pasting ? html`
          <div class="field"><label for="paste-text">${T.pasteLabel}</label>
            <textarea id="paste-text" rows="4" .value=${this.pasted} style="border:1.5px solid var(--line);background:var(--panel);border-radius:8px;padding:8px 10px;width:100%;font:inherit;font-size:13px"
              @input=${(/** @type {InputEvent} */ e) => { this.pasted = /** @type {HTMLTextAreaElement} */ (e.target).value; }}></textarea></div>
          <div class="row"><button type="button" class="cta" ?disabled=${!this.pasted.trim()} @click=${this.importText}>${T.importText}</button></div>` : nothing}
        ${n ? html`<p class="toast" role="status" style=${n.error ? "color:var(--danger)" : ""}>${n.text}</p>` : nothing}
      </div>`;
  }

  /** @param {GameRecord} h */
  row(h) {
    return html`
      <tr>
        <td>${new Date(h.date).toLocaleDateString(t.locale)}</td>
        <td>${t.level[h.niveau] || h.niveau}</td>
        <td>${h.version || "—"}</td>
        <td class="n">${h.tours}</td>
        <td class="n">${h.scoreJoueur ?? "—"}</td>
        <td class="n">${h.joueur ? h.joueur.nt : "—"}</td>
        <td class="n">${stepsPerAction(h)}</td>
        <td class="n">${h.scoreAutoma}</td>
        <td>${winner(h)}</td>
        <td><tr-curve .track=${h.courbe} width="120" height="40"></tr-curve></td>
        <td><tr-curve kind="crans" .track=${h.courbe} width="120" height="40"></tr-curve></td>
        <td style="min-width:160px">${h.remarque || ""}</td>
      </tr>`;
  }

  render() {
    const games = this.games, n = games.length;
    const won = games.filter(h => h.scoreJoueur != null && h.scoreJoueur > h.scoreAutoma).length;
    return html`
      <section class="panel">
        <div class="row" style="justify-content:space-between">
          <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">${t.history.title}</h2>
          <button type="button" class="ghost" @click=${() => this.emit("back")}>${t.history.back}</button>
        </div>
        ${n ? html`
          <p>${t.history.summary(n, won)}</p>
          <div class="scroll"><table>
            <thead><tr>${t.history.cols.map((c, i) => html`<th class=${[3, 4, 5, 6, 7].includes(i) ? "n" : ""}>${c}</th>`)}</tr></thead>
            <tbody>${games.map(h => this.row(h))}</tbody>
          </table></div>`
        : html`<p>${t.history.empty}</p>`}
        ${this.backup()}
      </section>`;
  }
}
customElements.define("history-screen", HistoryScreen);

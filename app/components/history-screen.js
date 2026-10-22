import { html } from "lit";
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

/* The saved games of this browser, most recent first. Reports `back` to return to the game. */
export class HistoryScreen extends LightElement {
  static properties = { games: { attribute: false } };

  constructor() {
    super();
    this.games = /** @type {GameRecord[]} */ ([]);
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
      </section>`;
  }
}
customElements.define("history-screen", HistoryScreen);

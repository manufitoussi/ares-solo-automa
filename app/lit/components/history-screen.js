import { html } from "lit";
import { LightElement } from "./light-element.js";
import { NIV } from "../engine.js";
import "./tr-curve.js";

const winner = h => h.scoreJoueur == null ? "—"
  : h.scoreJoueur > h.scoreAutoma ? "Joueur" : h.scoreJoueur < h.scoreAutoma ? "Automa" : "Égalité";

/* The saved games of this browser, most recent first. Reports `back` to return to the game. */
export class HistoryScreen extends LightElement {
  static properties = { games: { attribute: false } };

  constructor() {
    super();
    this.games = [];
  }

  row(h) {
    return html`
      <tr>
        <td>${new Date(h.date).toLocaleDateString("fr-FR")}</td>
        <td>${NIV[h.niveau] || h.niveau}</td>
        <td>${h.version || "—"}</td>
        <td class="n">${h.tours}</td>
        <td class="n">${h.scoreJoueur ?? "—"}</td>
        <td class="n">${h.scoreAutoma}</td>
        <td>${winner(h)}</td>
        <td><tr-curve .track=${h.courbe} width="120" height="40"></tr-curve></td>
        <td style="min-width:160px">${h.remarque || ""}</td>
      </tr>`;
  }

  render() {
    const games = this.games, n = games.length;
    const won = games.filter(h => h.scoreJoueur != null && h.scoreJoueur > h.scoreAutoma).length;
    return html`
      <section class="panel">
        <div class="row" style="justify-content:space-between">
          <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">Historique</h2>
          <button type="button" class="ghost" @click=${() => this.emit("back")}>Retour à la partie</button>
        </div>
        ${n ? html`
          <p>${n} partie${n > 1 ? "s" : ""} · ${won} victoire${won > 1 ? "s" : ""} du joueur contre l'automa.</p>
          <div class="scroll"><table>
            <thead><tr><th>Date</th><th>Niveau</th><th>Règles</th><th class="n">Tours</th><th class="n">Joueur</th><th class="n">Automa</th><th>Gagnant</th><th>NT par tour</th><th>Remarques</th></tr></thead>
            <tbody>${games.map(h => this.row(h))}</tbody>
          </table></div>`
        : html`<p>Aucune partie enregistrée pour l'instant. À la fin d'une partie, l'enregistrer depuis l'écran de décompte : elle apparaîtra ici.</p>`}
      </section>`;
  }
}
customElements.define("history-screen", HistoryScreen);

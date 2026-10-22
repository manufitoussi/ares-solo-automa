import { html, styleMap } from "lit";
import { LightElement } from "./light-element.js";
import { PH, ORDER, CIB, CARDS, canPick } from "../engine.js";
import { PHASE_COLOR, REACT_COLOR } from "./ui.js";

const cardLabel = cd => cd.react ? cd.react : `${PH[cd.ph].court} · ${CIB[cd.c].nom}`;
const pad = n => String(n).padStart(2, "0");

/* Planning: the player picks their phase, then the automa card is drawn.
   It only displays the game it receives and reports `pick` (a phase) and `draw`
   (a card number with the printed cards, null when the app draws). */
export class PlanScreen extends LightElement {
  static properties = { game: { attribute: false } };

  phaseButton(ph) {
    const st = this.game, P = PH[ph], C = PHASE_COLOR[ph], last = st.lastPlayerPhase === ph;
    /* styleMap sets inline styles from an object; `?disabled` adds or removes a boolean attribute */
    return html`
      <button type="button" class="phb" style=${styleMap({ background: C.col, color: C.dark ? "#1F1A24" : null })}
        aria-pressed=${st.playerPhase === ph} ?disabled=${!canPick(st, ph)}
        aria-label="${P.nom}${last ? ", déjà jouée au tour précédent" : ""}"
        @click=${() => this.emit("pick", ph)}>
        <span class="r">${ph}</span><span class="n">${P.nom}</span><span class="short">${P.court}</span>
      </button>`;
  }

  /* with the printed cards: one button per card, the ones already out are greyed */
  printedCards() {
    const st = this.game, full = !st.deck.length;
    return html`
      <div><span class="lab">${st.playerPhase ? "Retourner sa carte, puis toucher son numéro" : "D'abord la phase du joueur"}</span>
        ${full ? html`<p class="note" style="margin-top:6px"><b>Pioche vide</b> Remélanger ses 15 cartes avant de tirer.</p>` : ""}
        <div class="pick15" style="margin-top:6px">
          ${CARDS.map(cd => {
            const used = !full && !st.deck.includes(cd.n);
            return html`
              <button type="button" ?disabled=${!st.playerPhase || used} @click=${() => this.emit("draw", cd.n)}
                aria-label="Carte ${cd.n}, ${cardLabel(cd)}${used ? ", déjà sortie" : ""}">
                <i style=${styleMap({ background: cd.react ? REACT_COLOR : PHASE_COLOR[cd.ph].col })}></i><b>${pad(cd.n)}</b>${cardLabel(cd)}
              </button>`;
          })}
        </div>
        <p style="font-size:13px;color:var(--muted);margin-top:6px">Les cartes déjà sorties depuis le dernier mélange sont grisées.</p>
      </div>`;
  }

  render() {
    const st = this.game, n = st.deck.length;
    return html`
      <section class="panel">
        <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">Planification</h2>
        <p>Phase choisie par le joueur${st.lastPlayerPhase ? ` (pas ${PH[st.lastPlayerPhase].nom}, jouée au tour précédent)` : ""}, puis la carte de l'automa.</p>
        <div class="phases">${ORDER.map(ph => this.phaseButton(ph))}</div>
        ${st.pioche === "cartes" ? this.printedCards() : html`
          <div class="row">
            <button type="button" class="cta" ?disabled=${!st.playerPhase} @click=${() => this.emit("draw", null)}>Retourner la carte automa</button>
            <span class="lab">${n} carte${n > 1 ? "s" : ""} dans la pioche</span>
          </div>`}
      </section>`;
  }
}
customElements.define("plan-screen", PlanScreen);

import { html } from "lit";
import { LightElement } from "./light-element.js";
import { CIB, COST, computePhase, effCible, plural } from "../engine.js";
import { phaseChip } from "./ui.js";
import "./automa-card.js";
/** @typedef {import("../engine.js").Game} Game */

/* The card is revealed: what the automa will do this round, phase by phase.
   Reports `start` when the player is ready to resolve the phases. */
export class RevealScreen extends LightElement {
  static properties = { game: { attribute: false } };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
  }

  /** @param {import("../engine.js").Phase} ph */
  phaseLine(ph) {
    const st = this.game;
    const who = [st.playerPhase === ph ? "phase du joueur" : "", st.automaPhase === ph ? "phase de l'automa" : ""].filter(Boolean).join(" et ");
    const c = computePhase(st, ph).ch;
    let what = "+1 cuivre";
    if (ph === "I") what += st.a.cubes + 1 >= COST ? ", puis moteur +1 pour 1 argent" : " : pas d'argent pour le moteur";
    else if (ph === "II") what += ", puis 1 cube sur son compteur de PV";
    else if (ph === "III") what += c.nt ? `, puis environ ${plural(c.nt, "cran")} sur sa cible` : " : pas d'argent pour sa cible";
    else if (ph === "IV") what += `, puis ${plural(st.a.moteur, "cube")} (moteur)`;
    return html`<li>${phaseChip(ph)} <span style="font-size:13px;color:var(--muted)">(${who})</span><br>${what}.</li>`;
  }

  render() {
    const st = this.game, cible = /** @type {import("../engine.js").Target} */ (st.cible), cib = effCible(cible, st.p);
    return html`
      <section class="panel">
        <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">Carte de l'automa</h2>
        <div class="reveal">
          <automa-card .number=${st.card ?? undefined} .phase=${st.automaPhase ?? undefined} .target=${cible} .why=${st.why}></automa-card>
          <div>
            <div class="todo"><span class="lab">Ce tour, pour l'automa</span>
              <ul style="list-style:none;padding-left:0;gap:10px">${st.queue.map(ph => this.phaseLine(ph))}</ul></div>
            <p class="note"><b>Sa cible</b>${st.queue.includes("III")
              ? ` Elle sert en phase Action : c'est le paramètre qu'il monte${cib !== cible ? ` (au maximum : il vise ${CIB[cib].nom.toLowerCase()} à la place)` : ""}.`
              : " Elle ne sert qu'en phase Action. Pas de phase Action ce tour : on l'ignore."}</p>
            <p style="font-size:14px;color:var(--muted)">Rien à faire pour l'instant. Les phases se résolvent dans l'ordre ; la carte reste affichée.</p>
            <div class="row"><button type="button" class="cta" @click=${() => this.emit("start")}>Résoudre les phases</button></div>
          </div>
        </div>
      </section>`;
  }
}
customElements.define("reveal-screen", RevealScreen);

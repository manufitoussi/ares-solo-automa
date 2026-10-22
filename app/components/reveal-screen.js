import { html } from "lit";
import { LightElement } from "./light-element.js";
import { COST, computePhase, effCible } from "../engine.js";
import { t } from "../i18n.js";
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
    const R = t.reveal;
    const who = [st.playerPhase === ph ? R.playerPhase : "", st.automaPhase === ph ? R.automaPhase : ""].filter(Boolean).join(R.and);
    const c = computePhase(st, ph).ch;
    const what = ph === "I" ? R.whatI(st.a.cubes + 1 >= COST) : ph === "II" ? R.whatII
      : ph === "III" ? R.whatIII(c.nt) : ph === "IV" ? R.whatIV(st.a.moteur) : R.whatV;
    return html`<li>${phaseChip(ph)} <span style="font-size:13px;color:var(--muted)">(${who})</span><br>${what}.</li>`;
  }

  render() {
    const st = this.game, cible = /** @type {import("../engine.js").Target} */ (st.cible), cib = effCible(cible, st.p);
    return html`
      <section class="panel">
        <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">${t.reveal.title}</h2>
        <div class="reveal">
          <automa-card .number=${st.card ?? undefined} .phase=${st.automaPhase ?? undefined} .target=${cible} .why=${t.why(st.why)}></automa-card>
          <div>
            <div class="todo"><span class="lab">${t.reveal.todo}</span>
              <ul style="list-style:none;padding-left:0;gap:10px">${st.queue.map(ph => this.phaseLine(ph))}</ul></div>
            <p class="note"><b>${t.reveal.targetTitle}</b>${st.queue.includes("III")
              ? t.reveal.targetAction(cib !== cible ? t.targetLower[cib] : null)
              : t.reveal.targetNoAction}</p>
            <p style="font-size:14px;color:var(--muted)">${t.reveal.wait}</p>
            <div class="row"><button type="button" class="cta" @click=${() => this.emit("start")}>${t.reveal.start}</button></div>
          </div>
        </div>
      </section>`;
  }
}
customElements.define("reveal-screen", RevealScreen);

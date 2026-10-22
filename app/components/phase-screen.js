import { html, nothing, styleMap } from "lit";
import { LightElement } from "./light-element.js";
import { COST, MAX, computePhase, effCible, allMax, cu, vpOf } from "../engine.js";
import { t } from "../i18n.js";
import { PHASE_COLOR, phaseChip, icon } from "./ui.js";
import "./param-stepper.js";
import "./automa-card.js";
/** @typedef {import("../engine.js").Game} Game */

/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Target} Target */
/** @typedef {import("../engine.js").Automa} Automa */

/* One phase of the round: what to do on the automa board, computed by the engine from the
   current state. Mars can still change in the side panel: Lit re-renders and the plan follows.
   Reports `apply` once the player has done it on the table. */
export class PhaseScreen extends LightElement {
  static properties = { game: { attribute: false } };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
  }

  /** @param {Phase} ph @param {ReturnType<typeof computePhase>} r @param {Automa} a0 */
  todo(ph, r, a0) {
    const ch = r.ch, P = t.phaseScreen;
    const items = [html`${icon("cube")} ${P.gain(cu(a0.cubes) === COST - 1)}`];
    if (ph === "I") items.push(ch.moteur ? html`${icon("argent")} ${P.engineUp(a0.moteur, r.a.moteur)}` : html`${icon("moteur")} ${P.engineNo(a0.moteur)}`);
    if (ph === "II") items.push(html`${icon("pv")} ${P.counter(r.a.compteur, vpOf(r.a))}`);
    if (ph === "IV") items.push(ch.prod ? html`${icon("cube")} ${P.prod(ch.prod)}` : html`${icon("moteur")} ${P.prodNone}`);
    if (ph === "III") {
      if (ch.oxy) items.push(html`${icon("oxy")} ${P.oxy(ch.oxy)}`);
      if (ch.temp) items.push(html`${icon("temp")} ${P.temp(ch.temp)}`);
      if (ch.oce) items.push(html`${icon("ocean")} ${P.ocean(ch.oce)}`);
      if (ch.nt) items.push(html`${icon("nt")} ${P.nt(ch.nt, a0.nt, r.a.nt)}`);
      if (!ch.spent) items.push(P.noSilver);
    }
    return items;
  }

  /* In the Action phase, the player raises their steps here, before the automa spends its
     silver: each step goes up to <automa-app> as a `param` event, like in the Mars panel. */
  playerSteps() {
    const st = this.game, M = t.mars;
    const done = (st.playerSteps ?? []).filter(x => x.t === st.turn && x.at === "III").reduce((s, x) => s + x.d, 0);
    /** @param {import("../engine.js").Param} key @param {string} label @param {import("./ui.js").IconName} ic @param {string} name */
    const one = (key, label, ic, name) => html`
      <param-stepper .label=${label} .icon=${icon(ic)} .value=${String(st.p[key])} name=${name}
        .progress=${st.p[key] / MAX[key]} ?max=${st.p[key] >= MAX[key]}
        @step=${(/** @type {CustomEvent<number>} */ e) => this.emit("param", { key, delta: e.detail })}></param-stepper>`;
    return html`
      <div class="fcard">
        <span class="lab">${t.phaseScreen.stepsTitle(done)}</span>
        <div class="params">
          ${one("oxy", M.oxy, "oxy", M.oxyName)}${one("temp", M.tempShort, "temp", M.tempName)}${one("oce", M.oce, "ocean", M.oceName)}
        </div>
        <p style="font-size:13px;color:var(--muted)">${t.phaseScreen.stepsNote}</p>
      </div>`;
  }

  render() {
    const st = this.game, ph = st.queue[st.qi], r = computePhase(st, ph), a0 = st.a, C = PHASE_COLOR[ph], P = t.phaseScreen;
    const cible = /** @type {Target} */ (st.cible), eff = effCible(cible, st.p);
    return html`
      <section class="panel">
        <div class="steps">${st.queue.map((x, i) => phaseChip(x, i < st.qi ? "done" : i === st.qi ? "cur" : ""))}</div>
        <div class="reveal">
          <automa-card still .number=${st.card ?? undefined} .phase=${st.automaPhase ?? undefined} .target=${cible} .why=${t.why(st.why)}></automa-card>
          <div>
            <div class="ban ${C.dark ? "dark" : ""}" style=${styleMap({ background: C.col })}>
              <span class="r">${ph}</span><div><span class="nm">${t.phase[ph]}</span><span class="tg">${P.tag[ph]}</span></div>
            </div>
            ${ph === "III" ? this.playerSteps() : nothing}
            <div class="todo"><span class="lab">${P.todo}</span>
              <ul>${this.todo(ph, r, a0).map(item => html`<li>${item}</li>`)}</ul>
              <p style="font-size:14px;color:var(--muted)">${P.reserve(a0.cubes, r.a.cubes)}${ph === "III"
                ? P.target(t.target[cible], eff !== cible ? t.targetLower[eff] : null) : ""}${P.noBonus}</p>
            </div>
            ${ph === "III" && allMax(r.p) ? html`<p class="note"><b>${P.lastRoundTitle}</b> ${P.lastRound}</p>` : nothing}
            <p style="font-size:14px;color:var(--muted)">${st.playerPhase === ph ? P.playerBonus : P.playerNoBonus}</p>
            <div class="row"><button type="button" class="cta" @click=${() => this.emit("apply")}>${P.done}</button></div>
          </div>
        </div>
      </section>`;
  }
}
customElements.define("phase-screen", PhaseScreen);

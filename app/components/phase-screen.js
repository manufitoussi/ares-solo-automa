import { html, nothing, styleMap } from "lit";
import { LightElement } from "./light-element.js";
import { PH, CIB, COST, MAX, computePhase, effCible, allMax, cu, purse, plural, vpOf } from "../engine.js";
import { PHASE_COLOR, phaseChip, icon } from "./ui.js";
import "./param-stepper.js";
import "./automa-card.js";
/** @typedef {import("../engine.js").Game} Game */

/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Target} Target */
/** @typedef {import("../engine.js").Automa} Automa */

/** @type {Record<Phase, string>} */
const TAGS = {
  I: "+1 cuivre, puis moteur +1 pour 1 argent.", II: "+1 cuivre, puis 1 cube sur son compteur de PV.",
  III: "+1 cuivre, puis tous ses argents sur sa cible.", IV: "+1 cuivre, puis autant de cuivres que son moteur.", V: "+1 cuivre. Rien de plus."
};

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
    const st = this.game, ch = r.ch;
    const items = [html`${icon("cube")} <b>+1 cuivre</b> dans sa réserve${cu(a0.cubes) === COST - 1 ? " : avec 5 cuivres, l'échanger contre 1 argent" : ""}`];
    if (ph === "I") items.push(ch.moteur
      ? html`${icon("argent")} <b>Dépenser 1 argent</b> et monter son moteur : ${a0.moteur} → ${r.a.moteur}`
      : html`${icon("moteur")} Aucun argent : le moteur reste à ${a0.moteur}`);
    if (ph === "II") items.push(html`${icon("pv")} <b>1 cube sur son compteur de PV</b> (${plural(r.a.compteur, "cube")}, ${vpOf(r.a)} PV)`);
    if (ph === "IV") items.push(ch.prod
      ? html`${icon("cube")} <b>+${plural(ch.prod, "cuivre")}</b> grâce à son moteur`
      : html`${icon("moteur")} Moteur à 0 : rien de plus`);
    if (ph === "III") {
      if (ch.oxy) items.push(html`${icon("oxy")} <b>Oxygène +${plural(ch.oxy, "cran")}</b> (sans forêt)`);
      if (ch.temp) items.push(html`${icon("temp")} <b>Température +${plural(ch.temp, "cran")}</b>`);
      if (ch.oce) items.push(html`${icon("ocean")} <b>Retourner ${ch.oce} tuile${ch.oce > 1 ? "s" : ""} océan</b> : +1 cuivre par tuile, quel que soit le bonus imprimé (déjà compté)`);
      if (ch.nt) items.push(html`${icon("nt")} <b>NT de l'automa +${ch.nt}</b> (${a0.nt} → ${r.a.nt})`);
      if (!ch.spent) items.push(html`Aucun argent : rien sur sa cible`);
    }
    return items;
  }

  /* In the Action phase, the player raises their steps here, before the automa spends its
     silver: each step goes up to <automa-app> as a `param` event, like in the Mars panel. */
  playerSteps() {
    const st = this.game;
    const done = (st.playerSteps ?? []).filter(x => x.t === st.turn && x.at === "III").reduce((s, x) => s + x.d, 0);
    /** @param {import("../engine.js").Param} key @param {string} label @param {import("./ui.js").IconName} ic @param {string} name */
    const one = (key, label, ic, name) => html`
      <param-stepper .label=${label} .icon=${icon(ic)} .value=${String(st.p[key])} name=${name}
        .progress=${st.p[key] / MAX[key]} ?max=${st.p[key] >= MAX[key]}
        @step=${(/** @type {CustomEvent<number>} */ e) => this.emit("param", { key, delta: e.detail })}></param-stepper>`;
    return html`
      <div class="fcard">
        <span class="lab">Le joueur monte ses crans · ${plural(done, "cran")} dans cette Action</span>
        <div class="params">
          ${one("oxy", "Oxygène", "oxy", "l'oxygène")}${one("temp", "Temp.", "temp", "la température")}${one("oce", "Océans", "ocean", "les océans")}
        </div>
        <p style="font-size:13px;color:var(--muted)">Avant de résoudre l'automa. Chaque cran donne aussi 1 NT au joueur ; le plan de l'automa se recalcule.</p>
      </div>`;
  }

  render() {
    const st = this.game, ph = st.queue[st.qi], r = computePhase(st, ph), a0 = st.a, C = PHASE_COLOR[ph];
    const cible = /** @type {Target} */ (st.cible), eff = effCible(cible, st.p);
    return html`
      <section class="panel">
        <div class="steps">${st.queue.map((x, i) => phaseChip(x, i < st.qi ? "done" : i === st.qi ? "cur" : ""))}</div>
        <div class="reveal">
          <automa-card still .number=${st.card ?? undefined} .phase=${st.automaPhase ?? undefined} .target=${cible} .why=${st.why}></automa-card>
          <div>
            <div class="ban ${C.dark ? "dark" : ""}" style=${styleMap({ background: C.col })}>
              <span class="r">${ph}</span><div><span class="nm">${PH[ph].nom}</span><span class="tg">${TAGS[ph]}</span></div>
            </div>
            ${ph === "III" ? this.playerSteps() : nothing}
            <div class="todo"><span class="lab">À faire sur son plateau</span>
              <ul>${this.todo(ph, r, a0).map(t => html`<li>${t}</li>`)}</ul>
              <p style="font-size:14px;color:var(--muted)">Réserve : ${purse(a0.cubes)} → ${purse(r.a.cubes)} (5 cuivres = 1 argent).${ph === "III"
                ? ` Cible : ${CIB[cible].nom}${eff !== cible ? ` au maximum, il passe à ${CIB[eff].nom.toLowerCase()}` : ""}.` : ""} Pas de bonus pour l'automa.</p>
            </div>
            ${ph === "III" && allMax(r.p) ? html`<p class="note"><b>Dernier tour</b> Tous les paramètres sont au maximum : chaque argent qu'il lui reste vaut 1 PV.</p>` : nothing}
            <p style="font-size:14px;color:var(--muted)">${st.playerPhase === ph ? "Le joueur a choisi cette phase : il prend son bonus." : "Le joueur joue aussi cette phase, sans bonus."}</p>
            <div class="row"><button type="button" class="cta" @click=${() => this.emit("apply")}>C'est fait</button></div>
          </div>
        </div>
      </section>`;
  }
}
customElements.define("phase-screen", PhaseScreen);

import { html, nothing, styleMap } from "lit";
import { LightElement } from "./light-element.js";
import { PH, CIB, COST, computePhase, effCible, allMax, cu, purse, plural, vpOf } from "../engine.js";
import { PHASE_COLOR, phaseChip, icon } from "./ui.js";
import "./automa-card.js";

const TAGS = {
  I: "+1 cuivre, puis moteur +1 pour 1 argent.", II: "+1 cuivre, puis 1 cube sur son compteur de PV.",
  III: "+1 cuivre, puis tous ses argents sur sa cible.", IV: "+1 cuivre, puis autant de cuivres que son moteur.", V: "+1 cuivre. Rien de plus."
};

/* One phase of the round: what to do on the automa board, computed by the engine from the
   current state. Mars can still change in the side panel: Lit re-renders and the plan follows.
   Reports `apply` once the player has done it on the table. */
export class PhaseScreen extends LightElement {
  static properties = { game: { attribute: false } };

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

  render() {
    const st = this.game, ph = st.queue[st.qi], r = computePhase(st, ph), a0 = st.a, C = PHASE_COLOR[ph];
    const eff = effCible(st.cible, st.p);
    return html`
      <section class="panel">
        <div class="steps">${st.queue.map((x, i) => phaseChip(x, i < st.qi ? "done" : i === st.qi ? "cur" : ""))}</div>
        <div class="reveal">
          <automa-card still number=${st.card} phase=${st.automaPhase} target=${st.cible} why=${st.why}></automa-card>
          <div>
            <div class="ban ${C.dark ? "dark" : ""}" style=${styleMap({ background: C.col })}>
              <span class="r">${ph}</span><div><span class="nm">${PH[ph].nom}</span><span class="tg">${TAGS[ph]}</span></div>
            </div>
            <div class="todo"><span class="lab">À faire sur son plateau</span>
              <ul>${this.todo(ph, r, a0).map(t => html`<li>${t}</li>`)}</ul>
              <p style="font-size:14px;color:var(--muted)">Réserve : ${purse(a0.cubes)} → ${purse(r.a.cubes)} (5 cuivres = 1 argent).${ph === "III"
                ? ` Cible : ${CIB[st.cible].nom}${eff !== st.cible ? ` au maximum, il passe à ${CIB[eff].nom.toLowerCase()}` : ""}.` : ""} Pas de bonus pour l'automa.</p>
            </div>
            ${ph === "III" ? html`<p class="note"><b>Mars en direct</b> Ce plan suit les paramètres de Mars. Si le joueur vient d'en monter un, le mettre à jour dans le panneau Mars : le plan se recalcule.</p>` : nothing}
            ${ph === "III" && allMax(r.p) ? html`<p class="note"><b>Dernier tour</b> Tous les paramètres sont au maximum : chaque argent qu'il lui reste vaut 1 PV.</p>` : nothing}
            <p style="font-size:14px;color:var(--muted)">${st.playerPhase === ph ? "Le joueur a choisi cette phase : il prend son bonus." : "Le joueur joue aussi cette phase, sans bonus."}</p>
            <div class="row"><button type="button" class="cta" @click=${() => this.emit("apply")}>C'est fait</button></div>
          </div>
        </div>
      </section>`;
  }
}
customElements.define("phase-screen", PhaseScreen);

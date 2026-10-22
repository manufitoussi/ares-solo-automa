import { html } from "lit";
import { LightElement } from "./light-element.js";
import { LEVELS, NIV, MOTEUR0 } from "../engine.js";
import { levelText } from "./ui.js";
import "./choice-group.js";

const LEVEL_OPTIONS = LEVELS.map(k => ({ value: k, title: NIV[k], text: levelText(k) }));
const DECK_OPTIONS = [
  { value: "app", title: "L'appli tire", text: "L'assistant tire la carte automa au hasard." },
  { value: "cartes", title: "Cartes imprimées", text: "Le joueur retourne la carte imprimée et indique son numéro." }
];

/* The "new game" screen. The choices stay inside this component until the game starts,
   then they go up to <automa-app> with a `begin` event. */
export class SetupScreen extends LightElement {
  /* `state: true`: a reactive property private to the component, not part of its public API */
  static properties = { setup: { state: true } };

  constructor() {
    super();
    this.setup = { niveau: "normal", pioche: "app", oxy: 0, temp: 0, oce: 0 };
  }

  /* Lit compares the old and new value with ===: changing a field in place
     (this.setup.niveau = k) would not re-render. A new object does. */
  set(k, v) { this.setup = { ...this.setup, [k]: v }; }

  render() {
    const s = this.setup;
    return html`
      <section class="panel">
        <h2 style="font-size:30px;font-style:italic;text-transform:uppercase">Nouvelle partie</h2>
        <p>L'assistant joue l'automa : il tire ses cartes, compte ses cuivres et ses argents et dit quoi faire sur son plateau. Le plateau et les cartes projet restent sur la table.</p>
        <choice-group label="Niveau" .options=${LEVEL_OPTIONS} .value=${s.niveau}
          @choose=${e => this.set("niveau", e.detail)}></choice-group>
        <choice-group label="Pioche de l'automa" columns="2" .options=${DECK_OPTIONS} .value=${s.pioche}
          @choose=${e => this.set("pioche", e.detail)}></choice-group>
        <div class="note"><b>Mise en place</b> Un plateau joueur pour l'automa, un marqueur sur le 5 de la piste de NT, le marqueur de production des MC sur ${MOTEUR0[s.niveau]} (son moteur), des cubes cuivre et argent. Réserve et compteur de PV vides. Ni corporation, ni main.</div>
        <div class="row"><button type="button" class="cta" @click=${() => this.emit("begin", this.setup)}>Commencer la partie</button></div>
      </section>`;
  }
}
customElements.define("setup-screen", SetupScreen);

import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { LEVELS, MOTEUR0 } from "../engine.js";
import { t } from "../i18n.js";
import { levelText } from "./ui.js";
import "./choice-group.js";
/** @typedef {import("../engine.js").Setup} Setup */
/** @typedef {import("../engine.js").Level} Level */
/** @typedef {import("../engine.js").DeckMode} DeckMode */
/** @typedef {import("./choice-group.js").Choice} Choice */

/** @type {Choice[]} */
const LEVEL_OPTIONS = LEVELS.map(k => ({ value: k, title: t.level[k], text: levelText(k) }));
/** @type {Choice[]} */
const DECK_OPTIONS = [
  { value: "app", ...t.setup.deckApp },
  { value: "cartes", ...t.setup.deckCards }
];

/* The "new game" screen. The choices stay inside this component until the game starts,
   then they go up to <automa-app> with a `begin` event (detail: the setup).
   Mode "jeu" (the default) replaces the printed cards; detailed tracking ("suivi") also follows
   Mars and the player, keeps the automa board in the app and may use the printed automa cards. */
export class SetupScreen extends LightElement {
  /* `state: true`: a reactive property private to the component, not part of its public API */
  static properties = { setup: { state: true } };

  constructor() {
    super();
    /** @type {Required<Setup>} */
    this.setup = { niveau: "normal", pioche: "app", oxy: 0, temp: 0, oce: 0, mode: "jeu", plateau: true };
  }

  /* Lit compares the old and new value with ===: changing a field in place
     (this.setup.niveau = k) would not re-render. A new object does. */
  /** @param {Partial<Setup>} change */
  set(change) { this.setup = { ...this.setup, ...change }; }

  /* Event listeners written as methods: Lit calls them with `this` set to the component. */
  /** @param {CustomEvent<Level>} e */
  onLevel(e) { this.set({ niveau: e.detail }); }
  /** @param {CustomEvent<DeckMode>} e */
  onDeck(e) { this.set({ pioche: e.detail }); }
  /** @param {CustomEvent<string>} e */
  onBoard(e) { this.set({ plateau: e.detail === "app" }); }
  /* in detailed tracking, the automa board is also on the table: the app mirrors it */
  /** @param {Event} e */
  onTracking(e) { this.set({ mode: /** @type {HTMLInputElement} */ (e.target).checked ? "suivi" : "jeu" }); }

  /** what goes to the engine: detailed tracking forces the board in the app; the printed
      cards are only an option of detailed tracking @returns {Setup} */
  get chosen() {
    const s = this.setup, suivi = s.mode === "suivi";
    return { ...s, plateau: suivi || s.plateau, pioche: suivi ? s.pioche : "app" };
  }

  render() {
    const s = this.setup, S = t.setup, suivi = s.mode === "suivi", board = suivi || s.plateau;
    /** @type {Choice[]} */
    const boardOptions = [
      { value: "app", ...S.boardApp },
      { value: "table", ...S.boardTable, disabled: suivi }
    ];
    return html`
      <section class="panel">
        <h2 style="font-size:30px;font-style:italic;text-transform:uppercase">${S.title}</h2>
        <p>${S.intro}</p>
        <choice-group label=${S.level} .options=${LEVEL_OPTIONS} .value=${s.niveau} @choose=${this.onLevel}></choice-group>
        <choice-group label=${S.board} columns="2" .options=${boardOptions} .value=${board ? "app" : "table"} @choose=${this.onBoard}></choice-group>
        ${suivi ? html`<p style="font-size:14px;color:var(--muted)">${S.boardForced}</p>` : nothing}
        <label class="check big-check">
          <input type="checkbox" .checked=${suivi} @change=${this.onTracking}>
          <span><b>${S.tracking}</b><br><span style="font-size:14px;color:var(--muted)">${S.trackingText}</span></span>
        </label>
        ${suivi ? html`<choice-group label=${S.deck} columns="2" .options=${DECK_OPTIONS} .value=${s.pioche} @choose=${this.onDeck}></choice-group>` : nothing}
        <div class="note"><b>${S.setupTitle}</b> ${board && !suivi ? S.setupApp(MOTEUR0[s.niveau]) : S.setup(MOTEUR0[s.niveau])}</div>
        <div class="row"><button type="button" class="cta" @click=${() => this.emit("begin", this.chosen)}>${S.begin}</button></div>
      </section>`;
  }
}
customElements.define("setup-screen", SetupScreen);

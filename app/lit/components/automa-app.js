import { html, nothing } from "lit";
import { LightElement } from "./light-element.js";
import * as E from "../engine.js";
import "./setup-screen.js";
import "./plan-screen.js";
import "./automa-status.js";
import "./mars-panel.js";
import "./reveal-screen.js";
import "./phase-screen.js";
import "./end-turn-screen.js";
import "./end-screen.js";
import { loadGame, saveGame, addToHistory } from "../storage.js";

const UNDO_MAX = 30;

/* The root of the app: the only component that holds the game.
   Data goes down to the children through properties (.game=${...}), what the player does
   comes back up through events, and every change is a call to the engine. */
export class AutomaApp extends LightElement {
  static properties = {
    game: { state: true },
    undo: { state: true },
    confirmNew: { state: true }
  };

  constructor() {
    super();
    this.game = loadGame();
    this.undo = [];
    this.confirmNew = false;
  }

  /* updated runs after each render, with the properties that changed: saving here covers
     every way the game can change (a move, undo, a new game) in one place. */
  updated(changed) {
    if (changed.has("game")) saveGame(this.game);
  }

  /* Every change of the game goes through here. The engine returns a new state and never
     changes the old one, so undo only has to keep the previous states, and Lit sees the
     new object and re-renders. Some changes are not worth an undo step (picking a phase). */
  play(next, { undoable = true } = {}) {
    if (next === this.game) return;
    if (undoable) this.undo = [...this.undo, this.game].slice(-UNDO_MAX);
    this.game = next;
  }

  begin(setup) {
    this.undo = [];
    this.game = E.newGame(setup);
  }

  undoLast() {
    if (!this.undo.length) return;
    this.game = this.undo.at(-1);
    this.undo = this.undo.slice(0, -1);
  }

  /* first tap asks for a confirmation for 4 seconds when a game is under way */
  askNew() {
    if (!this.confirmNew && this.game && this.game.status !== "ended") {
      this.confirmNew = true;
      setTimeout(() => { this.confirmNew = false; }, 4000);
      return;
    }
    this.confirmNew = false;
    this.game = null;
    this.undo = [];
  }

  renderTop() {
    return html`
      <header class="top">
        <div class="brand"><b>Automa hybride</b><span>Expérience Lit · v${E.RULES} brouillon</span></div>
        <button class="tb" aria-label="Annuler" ?disabled=${!this.undo.length} @click=${this.undoLast}>
          <span class="full">Annuler</span><span class="short" aria-hidden="true">↶</span></button>
        <button class=${this.confirmNew ? "tb warn" : "tb"} @click=${this.askNew}
          aria-label=${this.confirmNew ? "Confirmer la nouvelle partie" : "Nouvelle partie"}>
          ${this.confirmNew
            ? html`<span class="full">Confirmer ?</span><span class="short" aria-hidden="true">Sûr ?</span>`
            : html`<span class="full">Nouvelle partie</span><span class="short" aria-hidden="true">Nouvelle</span>`}
        </button>
      </header>`;
  }

  applyPhase() {
    this.play(E.applyPhase(this.game));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* the record goes to the history; the game keeps the score and remark, marked as saved */
  saveResult({ playerScore, remark }) {
    addToHistory(E.gameRecord(this.game, { playerScore, remark }));
    this.game = { ...this.game, playerScore, remark, saved: true };
  }

  /* the screen of the current step; each one only reports what the player did */
  renderStep() {
    const st = this.game;
    if (st.status === "ended") return html`
      <end-screen .game=${st} @save=${e => this.saveResult(e.detail)}
        @resume=${() => this.play(E.resumeGame(st))}></end-screen>`;
    switch (st.step) {
      case "plan": return html`
        <plan-screen .game=${st}
          @pick=${e => this.play(E.pickPhase(st, e.detail), { undoable: false })}
          @draw=${e => this.play(E.draw(st, { n: e.detail }))}></plan-screen>`;
      case "reveal": return html`<reveal-screen .game=${st} @start=${() => this.play(E.startPhases(st))}></reveal-screen>`;
      case "phase": return html`<phase-screen .game=${st} @apply=${this.applyPhase}></phase-screen>`;
      default: return html`
        <end-turn-screen .game=${st} @next=${() => this.play(E.nextTurn(st))}
          @end=${() => this.play(E.endGame(st))}></end-turn-screen>`;
    }
  }

  renderGame() {
    const st = this.game;
    return html`
      <div class="layout">
        <div class="main">${this.renderStep()}</div>
        <aside class="side">
          <automa-status .game=${st} @correct=${e => this.play(E.adjustAutoma(st, e.detail.key, e.detail.delta))}></automa-status>
          <mars-panel .game=${st}
            @param=${e => this.play(E.adjustParam(st, e.detail.key, e.detail.delta))}
            @player-tr=${e => this.play(E.adjustPlayerTR(st, e.detail))}></mars-panel>
        </aside>
        ${st.log.length ? html`
          <div class="logz"><details class="panel"><summary>Journal (${st.log.length})</summary>
            <ol class="log" reversed>${st.log.map(l => html`<li>${l}</li>`)}</ol></details></div>` : nothing}
      </div>`;
  }

  /* No escaping to do, unlike the prototype's esc(): Lit inserts ${...} values as text. */
  render() {
    return html`
      ${this.renderTop()}
      ${this.game ? this.renderGame() : html`
        <div class="solo"><setup-screen @begin=${e => this.begin(e.detail)}></setup-screen></div>`}`;
  }
}
customElements.define("automa-app", AutomaApp);

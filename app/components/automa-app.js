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
import "./history-screen.js";
import { loadGame, saveGame, addToHistory, loadHistory, saveHistory } from "../storage.js";
import { exportData, parseImport, mergeHistory, ImportError } from "../transfer.js";
import { t, lang, setLang } from "../i18n.js";
/** @typedef {import("../engine.js").Game} Game */
/** @typedef {import("../engine.js").Setup} Setup */
/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Param} Param */
/** @typedef {import("../engine.js").AutomaKey} AutomaKey */
/** @typedef {import("../engine.js").GameRecord} GameRecord */

const UNDO_MAX = 30;

/* The root of the app: the only component that holds the game.
   Data goes down to the children through properties (.game=${...}), what the player does
   comes back up through events, and every change is a call to the engine. */
export class AutomaApp extends LightElement {
  static properties = {
    game: { state: true },
    undo: { state: true },
    confirmNew: { state: true },
    view: { state: true },       /* "game" or "history" */
    history: { state: true },
    notice: { state: true }      /* the result of the last import, shown in the history */
  };

  constructor() {
    super();
    /** @type {Game | null} null until a game starts */
    this.game = loadGame();
    /* the previous states, most recent last */
    this.undo = /** @type {Game[]} */ ([]);
    this.confirmNew = false;
    /** @type {"game" | "history"} */
    this.view = "game";
    this.history = /** @type {GameRecord[]} */ ([]);
    this.notice = /** @type {{ error: boolean, text: string } | null} */ (null);
  }

  /* The tag holds the start screen of index.html: clear it before the first render,
     otherwise Lit would render next to it (in the light DOM, it adds, it does not replace). */
  createRenderRoot() {
    this.replaceChildren();
    return this;
  }

  /* updated runs after each render, with the properties that changed: saving here covers
     every way the game can change (a move, undo, a new game) in one place. */
  /** @param {Map<PropertyKey, unknown>} changed */
  updated(changed) {
    if (changed.has("game")) saveGame(this.game);
  }

  /* Every change of the game goes through here. The engine returns a new state and never
     changes the old one, so undo only has to keep the previous states, and Lit sees the
     new object and re-renders. Some changes are not worth an undo step (picking a phase). */
  /** @param {Game} next @param {{ undoable?: boolean }} [options] */
  play(next, { undoable = true } = {}) {
    if (next === this.game) return;
    if (undoable && this.game) this.undo = [...this.undo, this.game].slice(-UNDO_MAX);
    this.game = next;
  }

  /** @param {CustomEvent<Setup>} e */
  begin(e) {
    this.undo = [];
    this.game = E.newGame(e.detail);
  }

  undoLast() {
    const last = this.undo.at(-1);
    if (!last) return;
    this.game = last;
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
    this.view = "game";
  }

  showHistory() {
    this.history = loadHistory();
    this.notice = null;
    this.view = "history";
  }

  /* the game in progress and the history, as a file to save */
  exportFile() {
    const data = exportData({ game: this.game, history: loadHistory() });
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: t.transfer.fileName(data.exportedAt.slice(0, 10)) });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** the history of the file is added; its game replaces the one in progress, once confirmed
      @param {CustomEvent<File>} e */
  async importFile(e) {
    const T = t.transfer;
    try {
      const data = parseImport(await e.detail.text());
      const { history, added } = mergeHistory(loadHistory(), data.history);
      saveHistory(history);
      this.history = history;
      const busy = this.game && this.game.status !== "ended" && this.game.createdAt !== data.game?.createdAt;
      const replace = !!data.game && (!busy || window.confirm(T.replace));
      if (replace && data.game) { this.game = data.game; this.undo = []; }
      this.notice = { error: false, text: T.done(replace, added) + (data.game && !replace ? ` ${T.kept}` : "") };
    } catch (err) {
      this.notice = { error: true, text: err instanceof ImportError ? T.error[err.code] : T.error.json };
    }
  }

  renderTop() {
    const T = t.top;
    return html`
      <header class="top">
        <a class="brand" href="../" title=${T.back}><b>${T.brand}</b><span>${T.sub(E.RULES)}</span></a>
        <button class="tb" aria-label=${T.undo} ?disabled=${!this.undo.length || this.view !== "game"} @click=${this.undoLast}>
          <span class="full">${T.undo}</span><span class="short" aria-hidden="true">${T.undoShort}</span></button>
        <button class="tb" aria-label=${T.history} @click=${this.showHistory}>
          <span class="full">${T.history}</span><span class="short" aria-hidden="true">${T.historyShort}</span></button>
        <button class=${this.confirmNew ? "tb warn" : "tb"} @click=${this.askNew}
          aria-label=${this.confirmNew ? T.confirmAria : T.newGame}>
          ${this.confirmNew
            ? html`<span class="full">${T.confirm}</span><span class="short" aria-hidden="true">${T.confirmShort}</span>`
            : html`<span class="full">${T.newGame}</span><span class="short" aria-hidden="true">${T.newShort}</span>`}
        </button>
        <button class="tb" lang=${lang === "fr" ? "en" : "fr"} aria-label=${T.otherAria} @click=${() => setLang(lang === "fr" ? "en" : "fr")}>${T.other}</button>
      </header>`;
  }

  applyPhase() {
    if (!this.game) return;
    this.play(E.applyPhase(this.game));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* the record goes to the history; the game keeps the score and remark, marked as saved */
  /** @param {CustomEvent<{ playerScore: number, remark: string, player: import("../engine.js").PlayerScore }>} e */
  saveResult(e) {
    if (!this.game) return;
    const { playerScore, remark, player } = e.detail;
    addToHistory(E.gameRecord(this.game, { playerScore, remark, player }));
    this.game = { ...this.game, playerScore, remark, playerFinal: player, saved: true };
  }

  /* the screen of the current step; each one only reports what the player did */
  /** @param {Game} st */
  renderStep(st) {
    if (st.status === "ended") return html`
      <end-screen .game=${st} @save=${this.saveResult}
        @resume=${() => this.play(E.resumeGame(st))}></end-screen>`;
    switch (st.step) {
      case "plan": return html`
        <plan-screen .game=${st}
          @pick=${(/** @type {CustomEvent<Phase>} */ e) => this.play(E.pickPhase(st, e.detail), { undoable: false })}
          @draw=${(/** @type {CustomEvent<number | null>} */ e) => this.play(E.draw(st, { n: e.detail }))}></plan-screen>`;
      case "reveal": return html`<reveal-screen .game=${st} @start=${() => this.play(E.startPhases(st))}></reveal-screen>`;
      case "phase": return html`
        <phase-screen .game=${st} @apply=${this.applyPhase}
          @param=${(/** @type {CustomEvent<{ key: Param, delta: number }>} */ e) => this.play(E.adjustParam(st, e.detail.key, e.detail.delta))}></phase-screen>`;
      default: return html`
        <end-turn-screen .game=${st} @next=${() => this.play(E.nextTurn(st))}
          @end=${() => this.play(E.endGame(st))}></end-turn-screen>`;
    }
  }

  /** @param {Game} st */
  renderGame(st) {
    return html`
      <div class="layout">
        <div class="main">${this.renderStep(st)}</div>
        <aside class="side">
          <automa-status .game=${st} @correct=${(/** @type {CustomEvent<{ key: AutomaKey, delta: number }>} */ e) => this.play(E.adjustAutoma(st, e.detail.key, e.detail.delta))}></automa-status>
          <mars-panel .game=${st}
            @param=${(/** @type {CustomEvent<{ key: Param, delta: number }>} */ e) => this.play(E.adjustParam(st, e.detail.key, e.detail.delta))}
            @player-tr=${(/** @type {CustomEvent<number>} */ e) => this.play(E.adjustPlayerTR(st, e.detail))}></mars-panel>
        </aside>
        ${st.log.length ? html`
          <div class="logz"><details class="panel"><summary>${t.journal(st.log.length)}</summary>
            <ol class="log" reversed>${st.log.map(l => html`<li>${t.log(l)}</li>`)}</ol></details></div>` : nothing}
      </div>`;
  }

  /* No escaping to do, unlike the prototype's esc(): Lit inserts ${...} values as text. */
  render() {
    return html`
      ${this.renderTop()}
      ${this.view === "history" ? html`
        <history-screen .games=${this.history} .notice=${this.notice} ?canExport=${!!this.game || this.history.length > 0}
          @back=${() => { this.view = "game"; }} @export=${this.exportFile} @import=${this.importFile}></history-screen>`
      : this.game ? this.renderGame(this.game) : html`
        <div class="solo"><setup-screen @begin=${this.begin}></setup-screen></div>`}`;
  }
}
customElements.define("automa-app", AutomaApp);

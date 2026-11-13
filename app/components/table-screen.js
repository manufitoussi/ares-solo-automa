import { html, nothing, styleMap } from "lit";
import { LightElement } from "./light-element.js";
import { ORDER, CARDS, TARGETS, COST, canPick, computePhase, effCible, hasBoard, tracksMars, question } from "../engine.js";
import { t } from "../i18n.js";
import { PHASE_COLOR, PHASE_TINT, REACT_COLOR, phaseChip, icon, undoButton } from "./ui.js";
import { playerBlock, automaBlock, playerCard } from "./phase-info.js";
import "./automa-card.js";
/** @typedef {import("../engine.js").Game} Game */
/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Card} Card */
/** @typedef {import("../engine.js").Target} Target */

/** @param {Card} cd */
const cardLabel = cd => cd.react ?? `${t.phaseShort[/** @type {Phase} */ (cd.ph)]} · ${t.target[/** @type {Target} */ (cd.c)]}`;
/** @param {number} n */
const pad = n => String(n).padStart(2, "0");
const NARROW = "(max-width: 520px)";

/* The table: the player's phase card and the automa card side by side, for the steps
   "plan" (pick a phase, flip the automa card), "ask" (a reactive card needs an answer) and
   "reveal" (what the automa does this round). The automa card is flipped where its back lay,
   and both cards stay in view until the phases are resolved.
   Reports `pick` (a phase), `draw` (a card number with the printed cards, null when the app
   draws), `opportunist` (has it at least 1 silver), `course` (the least advanced target),
   `start` (resolve the phases) and `undo`. */
export class TableScreen extends LightElement {
  static properties = {
    game: { attribute: false },
    canUndo: { type: Boolean },
    narrow: { state: true }
  };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
    this.canUndo = false;
    /* on a phone, the automa card uses its short texts */
    this.media = window.matchMedia(NARROW);
    this.narrow = this.media.matches;
    this.onMedia = () => { this.narrow = this.media.matches; };
  }

  connectedCallback() { super.connectedCallback(); this.media.addEventListener("change", this.onMedia); }
  disconnectedCallback() { super.disconnectedCallback(); this.media.removeEventListener("change", this.onMedia); }

  /** @param {Phase} ph */
  phaseButton(ph) {
    const st = this.game, C = PHASE_COLOR[ph], last = st.lastPlayerPhase === ph;
    return html`
      <button type="button" class="phb" style=${styleMap({ background: C.col, color: C.dark ? "#1F1A24" : null })}
        aria-pressed=${st.playerPhase === ph} ?disabled=${!canPick(st, ph)}
        aria-label="${t.phase[ph]}${last ? t.plan.lastPlayed : ""}"
        @click=${() => this.emit("pick", ph)}>
        <span class="r">${ph}</span><span class="n">${t.phase[ph]}</span><span class="short">${t.phaseShort[ph]}</span>
      </button>`;
  }

  /* the automa card: its back until it is drawn; touching the back flips it */
  automaCard() {
    const st = this.game, T = t.table;
    if (st.step === "plan") {
      const canFlip = !!st.playerPhase && st.pioche !== "cartes";
      return html`
        <div class="cw"><button type="button" class="cback" ?disabled=${!canFlip} aria-label=${t.plan.draw}
          @click=${() => this.emit("draw", null)}>
          <span class="q">?</span><span class="b">${T.automa}</span><span class="n">${t.plan.inDeck(st.deck.length)}</span>
        </button></div>`;
    }
    const known = st.step === "reveal";
    return html`<div class="cw"><automa-card size=${this.narrow ? "tiny" : nothing} .number=${st.card ?? undefined}
      .phase=${known ? st.automaPhase ?? undefined : undefined} .target=${known ? st.cible ?? undefined : undefined}
      .why=${known ? t.why(st.why) : ""}></automa-card></div>`;
  }

  /* with the printed cards: one button per card, the ones already out are greyed */
  printedCards() {
    const st = this.game, full = !st.deck.length;
    return html`
      <div><span class="lab">${st.playerPhase ? t.plan.pickCard : t.plan.pickPhaseFirst}</span>
        ${full ? html`<p class="note" style="margin-top:6px"><b>${t.plan.emptyTitle}</b> ${t.plan.empty}</p>` : ""}
        <div class="pick15" style="margin-top:6px">
          ${CARDS.map(cd => {
            const used = !full && !st.deck.includes(cd.n);
            return html`
              <button type="button" ?disabled=${!st.playerPhase || used} @click=${() => this.emit("draw", cd.n)}
                aria-label=${t.plan.cardAria(cd.n, cardLabel(cd), used)}>
                <i style=${styleMap({ background: cd.react ? REACT_COLOR : PHASE_COLOR[/** @type {Phase} */ (cd.ph)].col })}></i><b>${pad(cd.n)}</b>${cardLabel(cd)}
              </button>`;
          })}
        </div>
        <p style="font-size:13px;color:var(--muted);margin-top:6px">${t.plan.usedNote}</p>
        <div class="row">${undoButton(this, this.canUndo)}</div>
      </div>`;
  }

  plan() {
    const st = this.game;
    return html`
      ${st.playerPhase ? html`
        <div class="side-blocks">${playerBlock(st.playerPhase, true)}${automaBlock(st, st.playerPhase)}</div>
        <p class="muted small">${t.plan.revealed}</p>` : nothing}
      ${st.pioche === "cartes" ? this.printedCards() : html`
        <div class="row">
          ${undoButton(this, this.canUndo)}
          <button type="button" class="cta" ?disabled=${!st.playerPhase} @click=${() => this.emit("draw", null)}>${t.plan.draw}</button>
        </div>`}`;
  }

  ask() {
    const A = t.ask;
    const answers = question(this.game) === "course" ? html`
      <p class="question">${A.courseQuestion}</p>
      <p class="note">${A.courseHow}</p>
      <div class="answers three">
        ${TARGETS.map(x => html`
          <button type="button" class="answer" aria-label=${A.courseAria(t.targetLower[x])} @click=${() => this.emit("course", x)}>
            ${icon(x, 28)}<b>${t.target[x]}</b></button>`)}
      </div>` : html`
      <p class="question">${A.oppQuestion}</p>
      <div class="answers">
        <button type="button" class="answer" @click=${() => this.emit("opportunist", true)}><b>${A.oppYes}</b><span>${A.oppYesText}</span></button>
        <button type="button" class="answer" @click=${() => this.emit("opportunist", false)}><b>${A.oppNo}</b><span>${A.oppNoText}</span></button>
      </div>`;
    return html`${answers}<div class="row">${undoButton(this, this.canUndo)}</div>`;
  }

  /** @param {Phase} ph */
  phaseLine(ph) {
    const st = this.game, R = t.reveal;
    const who = [st.playerPhase === ph ? R.playerPhase : "", st.automaPhase === ph ? R.automaPhase : ""].filter(Boolean).join(R.and);
    const c = hasBoard(st) ? computePhase(st, ph).ch : null;
    const what = !c ? t.info.rule[ph] : `${ph === "I" ? R.whatI(st.a.cubes + 1 >= COST) : ph === "II" ? R.whatII
      : ph === "III" ? R.whatIII(c.nt) : ph === "IV" ? R.whatIV(st.a.moteur) : R.whatV}.`;
    /* both sides of the phase: the player's skill (and bonus when they chose it), then the automa */
    return html`<li>${phaseChip(ph)} <span class="muted small">(${who})</span>
      <div class="who-line"><b>${t.info.player}</b> ${t.info.skill[ph]}${st.playerPhase === ph
        ? html` <span class="bonus-inline"><b>${t.info.bonus}</b>${t.info.bonusText[ph]}</span>` : ""}</div>
      <div class="who-line"><b>${t.info.automa}</b> ${what}</div></li>`;
  }

  reveal() {
    const st = this.game, cible = /** @type {Target} */ (st.cible);
    /* without Mars, the app does not know whether the target is maxed: it gives the rule */
    const cib = tracksMars(st) ? effCible(cible, st.p) : cible;
    return html`
      <div class="todo"><span class="lab">${t.reveal.todo}</span>
        <ul style="list-style:none;padding-left:0;gap:10px">${st.queue.map(ph => this.phaseLine(ph))}</ul></div>
      <p class="note"><b>${t.reveal.targetTitle}</b>${st.queue.includes("III")
        ? t.reveal.targetAction(cib !== cible ? t.targetLower[cib] : null)
        : t.reveal.targetNoAction}</p>
      ${st.queue.includes("III") && !tracksMars(st) ? html`<p class="muted small">${t.info.targetRule}</p>` : nothing}
      <p class="muted small">${t.reveal.wait}</p>
      <div class="row">
        ${undoButton(this, this.canUndo)}
        <button type="button" class="cta" @click=${() => this.emit("start")}>${t.reveal.start}</button>
      </div>`;
  }

  render() {
    const st = this.game, T = t.table;
    const title = st.step === "ask" ? t.ask.title : st.step === "reveal" ? t.reveal.title : t.plan.title;
    return html`
      <section class="panel">
        <div class="row" style="justify-content:space-between">
          <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">${title}</h2>
          <span class="lab">${t.plan.turn(st.turn)}</span>
        </div>
        ${st.step === "plan" ? html`
          <p>${t.plan.intro(st.lastPlayerPhase ? t.phase[st.lastPlayerPhase] : null)}</p>
          <div class="phases">${ORDER.map(ph => this.phaseButton(ph))}</div>` : nothing}
        <div class="table2">
          <div class="tslot"><span class="lab">${T.player}</span>${playerCard(st.playerPhase)}</div>
          <div class="tslot"><span class="lab">${T.automa}</span>${this.automaCard()}</div>
        </div>
        ${st.step === "plan" && !st.playerPhase ? html`<p class="muted small">${t.plan.hint}</p>` : nothing}
        ${st.step === "ask" ? this.ask() : st.step === "reveal" ? this.reveal() : this.plan()}
      </section>`;
  }
}
customElements.define("table-screen", TableScreen);

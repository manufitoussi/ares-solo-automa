import { html } from "lit";
import { LightElement } from "./light-element.js";
import { TARGETS, question } from "../engine.js";
import { t } from "../i18n.js";
import { icon, undoButton } from "./ui.js";
import "./automa-card.js";
/** @typedef {import("../engine.js").Game} Game */

/* A reactive card needs an answer before it is revealed, when the app lacks what it knows on
   the table: Opportuniste without the board in the app (`opportunist`, detail: has it at
   least 1 silver), Course without Mars (`course`, detail: the least advanced target). */
export class AskScreen extends LightElement {
  static properties = { game: { attribute: false }, canUndo: { type: Boolean } };

  constructor() {
    super();
    /** @type {Game} */
    this.game;
    this.canUndo = false;
  }

  opportunist() {
    const A = t.ask;
    return html`
      <p class="question">${A.oppQuestion}</p>
      <div class="answers">
        <button type="button" class="answer" @click=${() => this.emit("opportunist", true)}><b>${A.oppYes}</b><span>${A.oppYesText}</span></button>
        <button type="button" class="answer" @click=${() => this.emit("opportunist", false)}><b>${A.oppNo}</b><span>${A.oppNoText}</span></button>
      </div>`;
  }

  course() {
    const A = t.ask;
    return html`
      <p class="question">${A.courseQuestion}</p>
      <p class="note">${A.courseHow}</p>
      <div class="answers three">
        ${TARGETS.map(x => html`
          <button type="button" class="answer" aria-label=${A.courseAria(t.targetLower[x])} @click=${() => this.emit("course", x)}>
            ${icon(x, 28)}<b>${t.target[x]}</b></button>`)}
      </div>`;
  }

  render() {
    const st = this.game, q = question(st);
    return html`
      <section class="panel">
        <h2 style="font-size:28px;font-style:italic;text-transform:uppercase">${t.ask.title}</h2>
        <div class="reveal">
          <automa-card size="small" .number=${st.card ?? undefined}></automa-card>
          <div>${q === "course" ? this.course() : this.opportunist()}
            <div class="row">${undoButton(this, this.canUndo)}</div></div>
        </div>
      </section>`;
  }
}
customElements.define("ask-screen", AskScreen);

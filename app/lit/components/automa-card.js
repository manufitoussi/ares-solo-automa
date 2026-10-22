import { LitElement, html, css, nothing, styleMap } from "lit";
import { PH, CIB, card } from "../engine.js";
import { PHASE_COLOR, REACT_COLOR, PHASE_TINT, TARGET_COLOR, EFFECT, PLAYER, EFFECT_SHORT, PLAYER_SHORT, TARGET_SHORT, REACT_RULE, icon } from "./ui.js";
/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Target} Target */
/** @typedef {import("../engine.js").Card} Card */

/* An automa card, drawn like the printed card. Unlike the other components, it renders in a
   shadow root with its own styles: it looks the same in the app and on any other page, and
   the page's CSS cannot break it. It only needs plain attributes:
     <automa-card number="5"></automa-card>
     <automa-card number="13" phase="II" why="Phase du joueur au tour précédent." size="small"></automa-card>
   `phase` and `target` default to the ones printed on the card. A reactive card (13 to 15)
   depends on the game: without `phase`, it shows its general rule.
   `still` turns off the flip animation, for when the card stays on screen.

   What a page can still change from outside:
   - `size`: tiny (8.4rem, shorter texts, for an illustration), small (200px), normal (260px)
     or large (320px);
   - CSS custom properties, which go through the shadow root:
       --automa-card-width       the width; every size inside follows (default 260px)
       --automa-card-font        the text font (default Source Serif 4)
       --automa-card-display-font  the title font (default Barlow Condensed)
       --automa-card-background  (default white)
       --automa-card-shadow      (default a soft drop shadow)
   - ::part(card | banner | effect | target | player), to style one area directly.
   The fonts themselves must be declared by the page (@font-face does not work in a shadow root). */
export class AutomaCard extends LitElement {
  static properties = {
    number: { type: Number },
    phase: { type: String },
    target: { type: String },
    why: { type: String },
    still: { type: Boolean, reflect: true },
    size: { type: String, reflect: true }
  };

  /* Every length is in cqi, 1% of the card width (the host is a size container):
     changing the width scales the whole card, text included. 1 px at 260 px = 0.385cqi. */
  static styles = css`
    :host {
      display: inline-block;
      flex-shrink: 0;
      width: var(--automa-card-width, 260px);
      max-width: 100%;
      container-type: inline-size;
      --display: var(--automa-card-display-font, 'Barlow Condensed', 'Arial Narrow', sans-serif);
      /* the phase colours are part of the card: set here, so they do not depend on the page */
      --p1: #3D7A47; --p2g: linear-gradient(100deg,#2E5A8A 0%,#2E5A8A 30%,#B5342A 100%);
      --p3: #24719E; --p4: #B84D18; --p5: #E2BE2C;
    }
    :host([size="small"]) { --automa-card-width: 200px; }
    :host([size="large"]) { --automa-card-width: 320px; }
    /* tiny: an illustration, as on the landing page. Shorter texts (see render), set larger
       for the card width, and no "Cible" label. */
    :host([size="tiny"]) { --automa-card-width: 8.4rem; }
    :host([size="tiny"]) .card { padding: 3cqi; gap: 2cqi; }
    :host([size="tiny"]) .kban .r { font-size: 10.7cqi; }
    :host([size="tiny"]) .kban .nm { font-size: 8.6cqi; padding-inline: 3cqi; }
    :host([size="tiny"]) .meta { font-size: 5.4cqi; }
    :host([size="tiny"]) .au, :host([size="tiny"]) .why { font-size: 7.2cqi; line-height: 1.25; padding: 3cqi; }
    :host([size="tiny"]) .cib { padding: 1.5cqi 2.5cqi; gap: 1.5cqi; }
    :host([size="tiny"]) .cib .l { display: none; }
    :host([size="tiny"]) .cn, :host([size="tiny"]) .cc { font-size: 7.2cqi; }
    :host([size="tiny"]) .vous { font-size: 6cqi; line-height: 1.25; padding-top: 1.5cqi; }
    :host([size="tiny"]) .vous .t { font-size: 6cqi; }
    :host([size="tiny"]) .pi { width: 7.2cqi; height: 7.2cqi; vertical-align: -1.2cqi; }
    :host([size="tiny"]) .ti .pi { width: 9cqi; height: 9cqi; }
    :host([hidden]) { display: none; }
    * { box-sizing: border-box; }
    p { margin: 0; }

    .card {
      width: 100cqi; aspect-ratio: 63/88; display: flex; flex-direction: column; gap: 2.31cqi;
      padding: 3.85cqi; border: 1px solid #BDBDBD; border-radius: 3.85cqi;
      background: var(--automa-card-background, #fff); color: #1F1A24;
      font-family: var(--automa-card-font, 'Source Serif 4', Georgia, serif); line-height: 1.5;
      box-shadow: var(--automa-card-shadow, 0 2.31cqi 6.92cqi rgba(0,0,0,.18));
    }
    .kban { display: grid; grid-template-columns: 16.15cqi minmax(0,1fr); height: 17.31cqi; color: #fff; clip-path: polygon(0 0,calc(100% - 5.77cqi) 0,100% 5.77cqi,100% 100%,3.08cqi 100%,0 calc(100% - 3.08cqi)); box-shadow: inset 0 -1.54cqi 0 rgba(0,0,0,.22); }
    .kban .r { display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.26); font-family: var(--display); font-style: italic; font-weight: 800; font-size: 9.23cqi; padding-bottom: 1.54cqi; }
    .kban .nm { display: flex; align-items: center; padding: 0 3.85cqi 1.54cqi; font-family: var(--display); font-style: italic; font-weight: 800; font-size: 6.92cqi; text-transform: uppercase; white-space: nowrap; }
    .meta { display: flex; justify-content: space-between; font-family: var(--display); font-weight: 600; font-size: 3.85cqi; letter-spacing: .16em; text-transform: uppercase; color: #1B5A7E; border-bottom: 1.3px solid #2FB6C0; padding-bottom: 1.15cqi; }
    .why { font-size: 4.81cqi; line-height: 1.35; background: #E3F2F3; border-radius: 2.31cqi; padding: 2.31cqi 3.08cqi; }
    .au { display: flex; gap: 3.08cqi; align-items: center; border-radius: 2.31cqi; padding: 3.46cqi 3.08cqi; font-size: 5.38cqi; line-height: 1.4; }
    .au b { font-weight: 600; }
    .sp { flex: 1; }
    .cib { display: flex; align-items: center; gap: 2.31cqi; border: 1.5px solid; border-radius: 1.92cqi; padding: 2.31cqi 3.08cqi; }
    .cib .l { font-family: var(--display); font-weight: 700; font-size: 3.85cqi; letter-spacing: .18em; text-transform: uppercase; color: #6E625A; }
    .cn { font-family: var(--display); font-style: italic; font-weight: 800; font-size: 6.92cqi; text-transform: uppercase; line-height: 1; }
    .cc { margin-left: auto; font-family: var(--display); font-weight: 700; font-size: 5.77cqi; display: flex; align-items: center; gap: 1.15cqi; white-space: nowrap; }
    .vous { display: flex; gap: 2.31cqi; align-items: flex-start; font-size: 4.42cqi; line-height: 1.3; color: #33302E; border-top: 1.2px dashed #B9A48C; padding-top: 1.92cqi; }
    .vous .t { flex-shrink: 0; font-family: var(--display); font-style: italic; font-weight: 800; font-size: 4.23cqi; text-transform: uppercase; background: #E2BE2C; color: #1F1A24; padding: 1px 2.69cqi .77cqi; }
    /* icons: 14px in the text, 24px for the target, whatever their width attribute */
    .pi { display: inline-block; flex-shrink: 0; width: 5.38cqi; height: 5.38cqi; vertical-align: -.77cqi; }
    .ti .pi { width: 9.23cqi; height: 9.23cqi; vertical-align: middle; }

    @media (prefers-reduced-motion: no-preference) {
      :host(:not([still])) .card { animation: flip .35s ease-out; }
      @keyframes flip { from { transform: rotateY(70deg); opacity: .2; } to { transform: none; opacity: 1; } }
    }
  `;

  constructor() {
    super();
    /** @type {number | undefined} */
    this.number = undefined;
    /** @type {Phase | undefined} the phase played; a reactive card needs it, see above */
    this.phase = undefined;
    /** @type {Target | undefined} */
    this.target = undefined;
    this.why = "";
    this.still = false;
    /** @type {"tiny" | "small" | "large" | undefined} */
    this.size = undefined;
  }

  /** the target box; Course shown outside a game has no target yet: the least advanced one
      @param {Target | null} target @param {boolean} tiny */
  targetBox(target, tiny) {
    if (!target) return html`
      <div class="cib" part="target" style="border-color:#2FB6C0">
        <span class="ti">${icon("oxy", 24)}${icon("temp", 24)}${icon("ocean", 24)}</span><span class="cn">Le moins avancé</span>
      </div>`;
    return html`
      <div class="cib" part="target" style=${styleMap({ borderColor: TARGET_COLOR[target] })}>
        <span class="l">Cible</span><span class="ti">${icon(target, 24)}</span>
        <span class="cn">${tiny ? TARGET_SHORT[target] : CIB[target].nom}</span>
        <span class="cc">1 ${icon("argent", 14)}</span>
      </div>`;
  }

  /** what the card says the automa does: its effect, or the general rule of a reactive card
      shown outside a game @param {Card} cd @param {Phase | null} ph @param {boolean} tiny */
  effect(cd, ph, tiny) {
    if (!ph || (cd.react && !this.phase)) return html`
      <div class="au" part="effect" style="background:#E3F2F3"><p>${cd.react ? REACT_RULE[cd.react] : ""}</p></div>`;
    return html`
      ${cd.react ? html`<div class="why">Il joue : <b>${PH[ph].nom}</b>. ${this.why}</div>` : nothing}
      <div class="au" part="effect" style=${styleMap({ background: PHASE_TINT[ph] })}><p>${(tiny ? EFFECT_SHORT : EFFECT)[ph]}</p></div>`;
  }

  render() {
    const cd = this.number == null ? undefined : card(this.number);
    if (!cd) return nothing;
    const tiny = this.size === "tiny";
    /* The attributes come from any HTML page: an unknown phase or target draws nothing.
       Course always plays Action, so its phase is known even outside a game. */
    /** @type {Phase | null} */
    const ph = this.phase || cd.ph || (cd.react === "Course" ? "III" : null);
    /** @type {Target | null} */
    const target = this.target || (cd.c === "low" ? null : cd.c);
    if ((ph && !PH[ph]) || (target && !CIB[target])) return nothing;
    const C = ph ? PHASE_COLOR[ph] : null;
    const banner = cd.react || !C
      ? { background: REACT_COLOR, color: null }
      : { background: C.col, color: C.dark ? "#1F1A24" : null };
    return html`
      <div class="card" part="card" role="img" aria-label="Carte automa ${cd.n}">
        <div class="kban" part="banner" style=${styleMap(banner)}>
          ${cd.react || !ph
            ? html`<span class="r" style="color:#8FE3E8">?</span><span class="nm">${cd.react}</span>`
            : html`<span class="r">${ph}</span><span class="nm">${PH[ph].nom}</span>`}
        </div>
        <div class="meta"><span>Automa${cd.react && !tiny ? " · réactive" : ""}</span><span>${String(cd.n).padStart(2, "0")} / 15</span></div>
        ${this.effect(cd, ph, tiny)}
        <div class="sp"></div>
        ${this.targetBox(target, tiny)}
        ${ph ? html`<div class="vous" part="player"><span class="t">Joueur</span><p>${(tiny ? PLAYER_SHORT : PLAYER)[ph]}</p></div>` : nothing}
      </div>`;
  }
}
customElements.define("automa-card", AutomaCard);

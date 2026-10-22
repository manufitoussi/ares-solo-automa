import { html, nothing, classMap, styleMap } from "lit";
import { LightElement } from "./light-element.js";
import { t } from "../i18n.js";

/* A value with − and + buttons, and a progress bar when `progress` (0 to 1) is set.
   It does not change the value itself: it reports `step` with -1 or +1. */
export class ParamStepper extends LightElement {
  static properties = {
    label: { attribute: false },   /* text or a template, e.g. html`<span class="full">…</span>` */
    icon: { attribute: false },
    value: { attribute: false },
    name: { type: String },        /* for the button labels read by screen readers: "Raise <name>" */
    progress: { type: Number },
    max: { type: Boolean },
    inline: { type: Boolean }
  };

  constructor() {
    super();
    /* text or templates: anything Lit can render */
    this.label = /** @type {unknown} */ ("");
    this.icon = /** @type {unknown} */ (undefined);
    this.value = /** @type {unknown} */ ("");
    this.name = "";
    /** @type {number | undefined} */
    this.progress = undefined;
    this.max = false;
    this.inline = false;
  }

  render() {
    return html`
      <div class=${classMap({ param: true, max: this.max, inline: this.inline })}>
        <span class="lab" style="display:flex;align-items:center;gap:5px">${this.icon}${this.label}</span>
        <span class="v num">${this.value}</span>
        ${this.progress == null ? nothing : html`
          <span class="bar"><i style=${styleMap({ width: `${Math.round(this.progress * 100)}%` })}></i></span>`}
        <div class="adj">
          <button type="button" aria-label=${t.mars.lower(this.name)} @click=${() => this.emit("step", -1)}>−</button>
          <button type="button" aria-label=${t.mars.raise(this.name)} @click=${() => this.emit("step", 1)}>+</button>
        </div>
      </div>`;
  }
}
customElements.define("param-stepper", ParamStepper);

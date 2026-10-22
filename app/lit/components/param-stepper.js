import { html, nothing, classMap, styleMap } from "lit";
import { LightElement } from "./light-element.js";

/* A value with − and + buttons, and a progress bar when `progress` (0 to 1) is set.
   It does not change the value itself: it reports `step` with -1 or +1. */
export class ParamStepper extends LightElement {
  static properties = {
    label: { attribute: false },   /* text or a template, e.g. html`<span class="full">…</span>` */
    icon: { attribute: false },
    value: { attribute: false },
    name: { type: String },        /* for the button labels read by screen readers: "Monter <name>" */
    progress: { type: Number },
    max: { type: Boolean },
    inline: { type: Boolean }
  };

  render() {
    return html`
      <div class=${classMap({ param: true, max: this.max, inline: this.inline })}>
        <span class="lab" style="display:flex;align-items:center;gap:5px">${this.icon}${this.label}</span>
        <span class="v num">${this.value}</span>
        ${this.progress == null ? nothing : html`
          <span class="bar"><i style=${styleMap({ width: `${Math.round(this.progress * 100)}%` })}></i></span>`}
        <div class="adj">
          <button type="button" aria-label="Baisser ${this.name}" @click=${() => this.emit("step", -1)}>−</button>
          <button type="button" aria-label="Monter ${this.name}" @click=${() => this.emit("step", 1)}>+</button>
        </div>
      </div>`;
  }
}
customElements.define("param-stepper", ParamStepper);

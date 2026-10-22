import { html, classMap } from "lit";
import { LightElement } from "./light-element.js";

/** @typedef {{ value: string, title: string, text: string, disabled?: boolean }} Choice */

/* A group of buttons where one option is chosen, as for the level or the automa deck.
   It is "controlled": it shows the value it receives and only reports a click with a
   `choose` event (detail: the value); the parent decides and passes the new value back down. */
export class ChoiceGroup extends LightElement {
  /* Reactive properties: assigning one of them re-renders the component.
     `attribute: false` means it is only set from JS (`.options=${...}` in a template),
     never from an HTML attribute, which suits arrays and objects. */
  static properties = {
    label: { type: String },
    options: { attribute: false },
    value: { type: String },
    columns: { type: Number }
  };

  constructor() {
    super();
    this.label = "";
    this.options = /** @type {Choice[]} */ ([]);
    this.value = "";
    this.columns = 3;
  }

  render() {
    /* classMap adds each class whose value is true */
    return html`
      <span class="lab">${this.label}</span>
      <div class=${classMap({ lvl: true, two: this.columns === 2 })} style="margin-top:6px" role="group" aria-label=${this.label}>
        ${this.options.map(o => html`
          <button type="button" aria-pressed=${o.value === this.value} ?disabled=${o.disabled}
            @click=${() => this.emit("choose", o.value)}>
            <b>${o.title}</b><span>${o.text}</span>
          </button>`)}
      </div>`;
  }
}
customElements.define("choice-group", ChoiceGroup);

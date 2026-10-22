import { LitElement } from "lit";

/* Base class of the app components.
   By default a LitElement renders into a shadow root, which isolates its CSS from the page.
   Returning `this` renders into the element itself (light DOM): the global styles.css,
   copied from the prototype, then applies to every component. The trade-off: no <slot>,
   and nothing protects a component's styles from the rest of the page. */
export class LightElement extends LitElement {
  createRenderRoot() { return this; }

  /* Tell the parent something happened. The event does not bubble: the parent listens on
     this element in its own template (@name=${...}), so events go up one level at a time
     and each component decides what to pass on. */
  emit(name, detail) { this.dispatchEvent(new CustomEvent(name, { detail })); }
}

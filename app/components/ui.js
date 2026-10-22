import { html, svg } from "lit";
import { MOTEUR0 } from "../engine.js";
import { t } from "../i18n.js";
/** @typedef {import("lit").TemplateResult} TemplateResult */
/** @typedef {import("../engine.js").Phase} Phase */
/** @typedef {import("../engine.js").Target} Target */
/** @typedef {import("../engine.js").Level} Level */

/* What only the interface needs: colours, icons and help texts. The rules stay in engine.js. */

/** @type {Record<Phase, { col: string, dark?: boolean }>} */
export const PHASE_COLOR = {
  I: { col: "var(--p1)" }, II: { col: "var(--p2g)" }, III: { col: "var(--p3)" },
  IV: { col: "var(--p4)" }, V: { col: "var(--p5)", dark: true }
};
export const REACT_COLOR = "#12202B";
/** @param {Level} k */
export const levelText = k => t.levelText(MOTEUR0[k]);

/* Icons, drawn as in the prototype. Elements inside an <svg> need the `svg` tag:
   with `html`, the browser would create them as HTML elements and draw nothing. */
/** a project card, its band in the colour of the card type @param {string} [col] */
const cardPath = (col = "#6E625A") => svg`<rect x="4" y="1.5" width="12" height="17" rx="2" fill="#FFFFFF" stroke="#1F1A24" stroke-width="1.2"/><rect x="5.5" y="3" width="9" height="4" fill=${col}/>`;
const PATHS = {
  cube: svg`<path d="M10 2l7 3.8v8.4L10 18l-7-3.8V5.8z" fill="#B87333"/><path d="M10 2l7 3.8-7 3.8-7-3.8z" fill="#D9985A"/><path d="M10 2l7 3.8v8.4L10 18l-7-3.8V5.8zM3 5.8l7 3.8 7-3.8M10 9.6V18" fill="none" stroke="#5E3A17" stroke-width="1.1" stroke-linejoin="round"/>`,
  argent: svg`<path d="M10 2l7 3.8v8.4L10 18l-7-3.8V5.8z" fill="#AEB6BD"/><path d="M10 2l7 3.8-7 3.8-7-3.8z" fill="#E4E9ED"/><path d="M10 2l7 3.8v8.4L10 18l-7-3.8V5.8zM3 5.8l7 3.8 7-3.8M10 9.6V18" fill="none" stroke="#4F5B62" stroke-width="1.1" stroke-linejoin="round"/>`,
  moteur: svg`<rect x="2" y="11" width="4" height="7" rx="1" fill="#B84D18"/><rect x="8" y="7" width="4" height="11" rx="1" fill="#B84D18"/><rect x="14" y="3" width="4" height="15" rx="1" fill="#B84D18"/>`,
  pv: svg`<path d="M10 1.8l2.4 5 5.4.7-4 3.8 1 5.4L10 14.1l-4.8 2.6 1-5.4-4-3.8 5.4-.7z" fill="#E2BE2C" stroke="#8A6D0B" stroke-width="1.2" stroke-linejoin="round"/>`,
  nt: svg`<circle cx="10" cy="10" r="8.5" fill="#C4572E" stroke="#7A2E14" stroke-width="1.2"/><path d="M5 9h10M6.5 13h7" stroke="#FCE3C6" stroke-width="1.2"/>`,
  oxy: svg`<circle cx="6.8" cy="11" r="5" fill="#D9534A" stroke="#7A1F18" stroke-width="1.2"/><circle cx="13.2" cy="9" r="5" fill="#E8776D" stroke="#7A1F18" stroke-width="1.2"/><path d="M11 6.6a2.6 2.6 0 0 1 2.2-1" stroke="#FFFFFF" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
  temp: svg`<rect x="7.5" y="1.5" width="5" height="12" rx="2.5" fill="#FFFFFF" stroke="#7A1F18" stroke-width="1.2"/><rect x="9" y="6" width="2" height="8" fill="#C2362B"/><circle cx="10" cy="15" r="3.8" fill="#C2362B" stroke="#7A1F18" stroke-width="1.2"/>`,
  ocean: svg`<polygon points="10,1 17.8,5.5 17.8,14.5 10,19 2.2,14.5 2.2,5.5" fill="#2E6FA8" stroke="#183F66" stroke-width="1.2" stroke-linejoin="round"/><path d="M5.5 11c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0" stroke="#FFFFFF" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  mc: svg`<rect x="1.5" y="1.5" width="17" height="17" rx="4" fill="#E2BE2C" stroke="#8A6D0B" stroke-width="1.2"/><text x="10" y="13.6" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="700" font-size="9" fill="#3A2C00">MC</text>`,
  chaleur: svg`<path d="M10 1.5c.6 3.2 5 5.2 5 10.2a5 5 0 0 1-10 0c0-2.6 1.4-4.1 2.6-5.1.1 1.7.8 2.8 1.9 3.2-.1-3.2-.4-5.8.5-8.3z" fill="#E0702E" stroke="#8F3A10" stroke-width="1.2" stroke-linejoin="round"/>`,
  plantes: svg`<path d="M3 17C3 8.5 8.5 3 17 3c0 8.5-5.5 14-14 14z" fill="#5A9A3C" stroke="#2F5F1E" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.5 15.5L12.5 7.5" stroke="#2F5F1E" stroke-width="1.2"/>`,
  cartes: cardPath()
};
/** @typedef {keyof typeof PATHS} IconName */

/** @param {IconName} name @param {number} [size] */
export const icon = (name, size = 18) =>
  html`<svg class="pi" width=${size} height=${size} viewBox="0 0 20 20" aria-hidden="true">${PATHS[name]}</svg>`;
/** @param {string} col @param {number} [size] */
export const cardIcon = (col, size = 14) =>
  html`<svg class="pi" width=${size} height=${size} viewBox="0 0 20 20" aria-hidden="true">${cardPath(col)}</svg>`;

/* ---------- The automa card ---------- */
/** @type {Record<Target, string>} */
export const TARGET_COLOR = { oxy: "#A33B33", temp: "#C2362B", ocean: "#2E6FA8" };
/** @type {Record<Phase, string>} */
export const PHASE_TINT = { I: "#DCEADB", II: "linear-gradient(100deg,#DAE3EF,#F3DCD8)", III: "#D6E9F3", IV: "#F6DCCB", V: "#F6EBBF" };
/** a small phase label, as in the list of the phases of the round @param {Phase} ph @param {string} [cls] */
export const phaseChip = (ph, cls = "") => {
  const C = PHASE_COLOR[ph];
  return html`<span class="chip ${cls}" style="background:${C.col};${C.dark ? "color:#1F1A24" : ""}"><i>${ph}</i>${t.phase[ph]}</span>`;
};

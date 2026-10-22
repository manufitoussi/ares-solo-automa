import { html, svg, nothing } from "lit";
import { LightElement } from "./light-element.js";
import { t } from "../i18n.js";
/** @typedef {import("../engine.js").TrackPoint} TrackPoint */
/** @typedef {"a" | "p" | "ca" | "cj"} Who  a series of a track point */

/* each kind of curve: its title, then the automa's and the player's series */
const KINDS = {
  nt: { title: () => t.curve.nt, automa: /** @type {Who} */ ("a"), player: /** @type {Who} */ ("p") },
  crans: { title: () => t.curve.crans, automa: /** @type {Who} */ ("ca"), player: /** @type {Who} */ ("cj") }
};

/* The TR (kind="nt", the default) or the Mars steps raised so far (kind="crans") of the player
   and of the automa, round by round.
   With `legend`, it is drawn in a frame with a caption; without, only the small chart. */
export class TrCurve extends LightElement {
  static properties = {
    track: { attribute: false },   /* [{t: round, a: automa TR, p: player TR or null}] */
    width: { type: Number },
    height: { type: Number },
    legend: { type: Boolean },
    kind: { type: String }
  };

  constructor() {
    super();
    this.track = /** @type {TrackPoint[]} */ ([]);
    this.width = 320;
    this.height = 110;
    this.legend = false;
    /** @type {"nt" | "crans"} */
    this.kind = "nt";
  }

  get series() { return KINDS[this.kind] ?? KINDS.nt; }

  chart() {
    const S = this.series, pts = (this.track || []).filter(x => x && x.t), w = this.width, h = this.height;
    const vals = /** @type {number[]} */ (pts.flatMap(x => [x[S.automa], x[S.player]]).filter(v => v != null));
    const lo = Math.min(...vals), hi = Math.max(...vals, lo + 1), t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const pad = 4, X = (/** @type {number} */ t) => pad + (t - t0) / Math.max(1, t1 - t0) * (w - 2 * pad), Y = (/** @type {number} */ v) => h - pad - (v - lo) / (hi - lo) * (h - 2 * pad);
    /** @param {Who} k @param {string} col @param {boolean} [dash] */
    const line = (k, col, dash) => {
      const q = pts.filter(x => x[k] != null);
      return q.length > 1
        ? svg`<polyline fill="none" stroke=${col} stroke-width="2" stroke-dasharray=${dash ? "4 3" : "none"} stroke-linejoin="round"
            points=${q.map(x => `${X(x.t).toFixed(1)},${Y(/** @type {number} */ (x[k])).toFixed(1)}`).join(" ")}/>`
        : nothing;
    };
    return html`<svg width=${w} height=${h} viewBox="0 0 ${w} ${h}" style="max-width:100%;height:auto" role="img"
      aria-label=${t.curve.aria(S.title())}>${line(S.automa, "var(--muted)", true)}${line(S.player, "var(--p4)")}</svg>`;
  }

  render() {
    /** @type {TrackPoint[]} a saved record may have no curve */
    const track = this.track || [];
    const S = this.series, pts = track.filter(x => x[S.automa] != null);
    if (pts.length < 2) return this.legend ? nothing : html`—`;
    if (!this.legend) return this.chart();
    const last = pts[pts.length - 1];
    return html`
      <div class="fcard"><span class="lab">${S.title()}</span>${this.chart()}
        <p style="font-size:13px;color:var(--muted)"><span style="color:var(--p4);font-weight:700">━ ${t.curve.player}</span>${last[S.player] != null ? ` (${last[S.player]})` : ""}
          · <span style="font-weight:700">┅ ${t.curve.automa}</span> (${last[S.automa]}) · ${t.curve.rounds(pts[0].t, last.t)}</p>
      </div>`;
  }
}
customElements.define("tr-curve", TrCurve);

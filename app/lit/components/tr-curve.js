import { html, svg, nothing } from "lit";
import { LightElement } from "./light-element.js";

/* The TR of the player and of the automa, round by round.
   With `legend`, it is drawn in a frame with a caption; without, only the small chart. */
export class TrCurve extends LightElement {
  static properties = {
    track: { attribute: false },   /* [{t: round, a: automa TR, p: player TR or null}] */
    width: { type: Number },
    height: { type: Number },
    legend: { type: Boolean }
  };

  constructor() {
    super();
    this.track = [];
    this.width = 320;
    this.height = 110;
    this.legend = false;
  }

  chart() {
    const pts = (this.track || []).filter(x => x && x.t), w = this.width, h = this.height;
    const vals = pts.flatMap(x => [x.a, x.p]).filter(v => v != null);
    const lo = Math.min(...vals), hi = Math.max(...vals, lo + 1), t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const pad = 4, X = t => pad + (t - t0) / Math.max(1, t1 - t0) * (w - 2 * pad), Y = v => h - pad - (v - lo) / (hi - lo) * (h - 2 * pad);
    const line = (k, col, dash) => {
      const q = pts.filter(x => x[k] != null);
      return q.length > 1
        ? svg`<polyline fill="none" stroke=${col} stroke-width="2" stroke-dasharray=${dash ? "4 3" : "none"} stroke-linejoin="round"
            points=${q.map(x => `${X(x.t).toFixed(1)},${Y(x[k]).toFixed(1)}`).join(" ")}/>`
        : nothing;
    };
    return html`<svg width=${w} height=${h} viewBox="0 0 ${w} ${h}" style="max-width:100%;height:auto" role="img"
      aria-label="NT par tour : le joueur en orange, l'automa en pointillés">${line("a", "var(--muted)", true)}${line("p", "var(--p4)")}</svg>`;
  }

  render() {
    const track = this.track || [];
    if (track.length < 2) return this.legend ? nothing : html`—`;
    if (!this.legend) return this.chart();
    const last = track[track.length - 1];
    return html`
      <div class="fcard"><span class="lab">NT par tour</span>${this.chart()}
        <p style="font-size:13px;color:var(--muted)"><span style="color:var(--p4);font-weight:700">━ Joueur</span>${last.p != null ? ` (${last.p})` : ""}
          · <span style="font-weight:700">┅ Automa</span> (${last.a}) · tours ${track[0].t} à ${last.t}</p>
      </div>`;
  }
}
customElements.define("tr-curve", TrCurve);

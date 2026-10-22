// Types of lit-all.min.js, the all-in-one bundle the import map gives as "lit".
// The npm package's root ("lit") only has the core; the bundle also has every directive
// and the static templates (but no decorators). jsconfig.json maps "lit" to this file,
// so the type check sees exactly what the browser gets. The types come from the npm package.
// the core: what the npm package's root exports ("lit" itself is mapped to this file)
export * from "lit-element/lit-element.js";
export * from "lit-html/is-server.js";
export * from "lit/directive.js";
export * from "lit/async-directive.js";
export * from "lit/directive-helpers.js";
export { html as staticHtml, svg as staticSvg, literal, unsafeStatic, withStatic } from "lit/static-html.js";
export * from "lit/directives/async-append.js";
export * from "lit/directives/async-replace.js";
export * from "lit/directives/cache.js";
export * from "lit/directives/choose.js";
export * from "lit/directives/class-map.js";
export * from "lit/directives/guard.js";
export * from "lit/directives/if-defined.js";
export * from "lit/directives/join.js";
export * from "lit/directives/keyed.js";
export * from "lit/directives/live.js";
export * from "lit/directives/map.js";
export * from "lit/directives/range.js";
export * from "lit/directives/ref.js";
export * from "lit/directives/repeat.js";
export * from "lit/directives/style-map.js";
export * from "lit/directives/template-content.js";
export * from "lit/directives/unsafe-html.js";
export * from "lit/directives/unsafe-svg.js";
export * from "lit/directives/until.js";
export * from "lit/directives/when.js";

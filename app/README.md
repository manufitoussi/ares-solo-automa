# app/

L'appli, une PWA en [Lit](https://lit.dev), publiée sous `/ares-solo-automa/app/`. Elle n'a **pas de build** : le navigateur charge ces fichiers tels quels, et le build du site (`npm run build`) les copie dans `_site/app/`, sans le prototype, les tests, les types ni la démo.

- `index.html` : la page, son écran de démarrage, l'import map qui fait pointer `lit` vers `vendor/lit-all.min.js`, et l'enregistrement du service worker.
- `engine.js` : les règles de l'automa (v0.6), pures, sans DOM. Chaque action rend un nouvel état. Testé par `engine.test.js`, et utilisé aussi par le simulateur d'équilibrage du dépôt de conception.
- `storage.js` : la partie en cours et l'historique, dans `localStorage`.
- `transfer.js` : l'export et l'import d'un fichier JSON avec la partie en cours et l'historique (page Historique, section Sauvegarde), pour changer d'appareil ou garder une copie. À l'import, l'historique s'ajoute sans doublons ; la partie remplace celle en cours, après confirmation. Testé par `transfer.test.js`.
- `i18n.js` et `i18n/` : la langue (celle choisie sur le site, sinon celle du navigateur) et tous les textes, en français (`fr.js`, la référence) et en anglais (`en.js`). Les textes statiques de `index.html`, affichés avant le chargement, ont leur anglais dans un attribut `data-en`.
- `components/` : les composants Lit. `automa-app` tient la partie ; les écrans et panneaux reçoivent la partie et renvoient des événements. Ils s'affichent dans le DOM de la page (sans Shadow DOM) avec `styles.css`, sauf `automa-card`, la carte automa, qui a ses propres styles et s'utilise aussi hors de l'appli (voir `card-demo.html`).
- `vendor/` : Lit 3.3.1 en un fichier (licence BSD-3-Clause), et ses types pour la vérification.
- `sw.js` : le service worker. Le build y met la version et la liste des fichiers ; non rempli, il ne fait rien.
- `manifest.webmanifest`, `icons/` (tirées de `site/assets/icon.svg`), `fonts/` (Barlow Condensed et Source Serif 4, licence SIL OFL, fichiers `OFL-*.txt`).
- `prototype/assistant-automa.html` : le premier assistant, en un seul fichier HTML, créé dans claude.ai. Remplacé par l'appli, il n'est plus publié ; il reste comme référence.

Pour travailler dessus : `npm install`, `npm test`, puis servir la racine du dépôt (`python3 -m http.server`) et ouvrir `/app/`.

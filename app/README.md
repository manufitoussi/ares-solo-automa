# app/

Sources de l'appli, publiée sous `/ares-solo-automa/app/` : le build du site (`npm run build`) copie `lit/` dans `_site/app/`.

## lit/ : l'appli

Une PWA en [Lit](https://lit.dev), **sans build** : le navigateur charge ces fichiers tels quels.

- `index.html` : la page, son écran de démarrage, l'import map qui fait pointer `lit` vers `vendor/lit-all.min.js`, et l'enregistrement du service worker.
- `engine.js` : les règles de l'automa (v0.6), pures, sans DOM. Chaque action rend un nouvel état. Testé par `engine.test.js`, et utilisé aussi par le simulateur d'équilibrage du dépôt de conception.
- `storage.js` : la partie en cours et l'historique, dans `localStorage`.
- `components/` : les composants Lit. `automa-app` tient la partie ; les écrans et panneaux reçoivent la partie et renvoient des événements. Ils s'affichent dans le DOM de la page (sans Shadow DOM) avec `styles.css`, sauf `automa-card`, la carte automa, qui a ses propres styles et s'utilise aussi hors de l'appli (voir `card-demo.html`).
- `vendor/` : Lit 3.3.1 en un fichier (licence BSD-3-Clause), et ses types pour la vérification.
- `sw.js` : le service worker. Le build y met la version et la liste des fichiers ; non rempli, il ne fait rien.
- `manifest.webmanifest`, `icons/` (tirées de `site/assets/icon.svg`), `fonts/` (Barlow Condensed et Source Serif 4, licence SIL OFL, fichiers `OFL-*.txt`).

Pour travailler dessus : `npm install`, `npm test`, puis servir la racine du dépôt (`python3 -m http.server`) et ouvrir `/app/lit/`.

## prototype/ : l'ancien prototype

`assistant-automa.html` : le premier assistant, en un seul fichier HTML, créé dans claude.ai. Remplacé par `lit/`, il n'est plus publié ; il reste comme référence.

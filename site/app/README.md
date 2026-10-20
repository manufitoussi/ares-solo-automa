# app/

Appli servie sous `/ares-solo-automa/app/`.

Pour l'instant, `index.html` est une copie du prototype [app/prototype/assistant-automa.html](../../app/prototype/assistant-automa.html) (les deux fichiers doivent rester identiques), emballée en PWA minimale :

- `manifest.webmanifest` : nom, icônes, affichage plein écran ; l'appli peut s'installer sur l'écran d'accueil d'un téléphone ou d'une tablette.
- `sw.js` : service worker. La page est servie depuis le réseau quand il y en a, sinon depuis le cache ; polices et icônes viennent du cache. Monter `VERSION` à chaque changement.
- `icons/` : icônes PNG (dont une version « maskable » et l'icône Apple), tirées de `../assets/icon.svg`.
- `fonts/` : Barlow Condensed et Source Serif 4, sous licence SIL OFL (fichiers `OFL-*.txt`).

La future PWA remplacera le prototype ; sa technologie n'est pas encore choisie : voir les décisions ouvertes dans [CLAUDE.md](../../CLAUDE.md).

# CLAUDE.md

Instructions pour Claude Code sur ce dépôt. Lire d'abord [CONTRIBUTING.md](CONTRIBUTING.md) (organisation, build du site, branches) : ce fichier n'ajoute que ce qu'il ne dit pas. Garder les deux fichiers cohérents.

## Projet

Un automa solo **non officiel**, créé par des fans, pour le jeu de société *Terraforming Mars: Ares Expedition* (FryxGames / Stronghold Games).

**La conception se fait dans le dépôt privé `ares-solo-automa-lab`**, cloné à côté (`../ares-solo-automa-lab`) : résumé des règles, décisions, comptes rendus de parties, backlog, charte visuelle, sources des cartes et du livret, PDF de travail. Son CLAUDE.md est la source de vérité. **Ce dépôt public ne reçoit que le résultat publié** :

1. **L'appli** (règles v0.6, brouillon) : une PWA en Lit, sans build, dont les sources sont dans `app/` et qui est publiée sous `/ares-solo-automa/app/`. Elle joue un ou plusieurs automas contre un joueur solo (tirage des cartes automa, calcul de leurs gains et achats, suivi des scores) et, en option, tient le plateau de chaque automa.
2. **Le livret de règles** publié, en PDF, dans `rules/<langue>/` : français d'abord, puis anglais.
3. **Les cartes à imprimer** publiées (PDF A4), dans `cards/<langue>/`.

Le livret et les cartes sont générés dans le lab et copiés ici par son script `scripts/publish.py`.

**Ne jamais ajouter ici** de document de conception, de compte rendu de partie, de backlog, de source de cartes ou de livret, ni de PDF de travail : tout cela va dans le lab. Une question de règle se tranche dans le lab (décision, puis résumé des règles), jamais ici. Ne jamais inventer une règle : une information manquante est marquée `TODO`.

## Organisation

- `site/` : ce que GitHub Pages publie, HTML et CSS statiques qui fonctionnent sans JS. `index.html` (redirige vers `fr/` ou `en/` selon le choix enregistré ou la langue du navigateur ; sans JS, deux liens), `fr/`, `en/`, `assets/`, `manifest.webmanifest` (le `<link rel="manifest">` est en commentaire dans les pages, à activer avec la PWA).
- `app/` : l'appli, servie telle quelle (voir [app/README.md](app/README.md)) : `engine.js` (les règles, pures et testées), `components/` (composants Lit), `vendor/` (Lit 3.3.1 en un fichier, et ses types), `sw.js`, `manifest.webmanifest`, `icons/`, `fonts/` (polices SIL OFL). `app/prototype/` : l'ancien prototype en un fichier, gardé comme référence, exclu du build.
- `scripts/build-site.mjs` : copie `site/` dans `_site/`, copie `app/` dans `_site/app/` (sans le prototype, les tests, les types ni la démo) et remplit son service worker (liste des fichiers, version calculée sur leur contenu), copie les PDF de `rules/<langue>/` et `cards/<langue>/` dans `_site/downloads/rules|cards/<langue>/`, et remplace dans les pages les blocs `<!-- downloads <dossier> -->` … `<!-- /downloads -->` par la liste des fichiers (sinon la mention « bientôt » reste).
- `.github/workflows/pages.yml` : build et déploiement sur GitHub Pages à chaque push sur `main`.

## Conventions

- Le mainteneur échange en français. L'interface et les textes sont en français d'abord, puis internationalisés (anglais ensuite). Le code, ses commentaires et les messages de commit sont en anglais.
- La PWA doit fonctionner **hors ligne** et sur une **tablette ou un téléphone posé sur la table** : grandes cibles tactiles, lisible de loin, utilisable d'une main, sans dépendre du réseau pendant une partie.
- **Aucun contenu officiel du jeu** : ni illustration, ni logo, ni texte de carte recopié, ni police ou iconographie officielles. Désigner une carte par son nom ou ses caractéristiques suffit. L'avertissement « projet de fans non officiel » reste en tête du README et en pied de page de chaque page du site.
- `main` est la branche des versions publiées, `develop` la branche de stabilisation. Un changement d'un seul commit va directement sur `develop`, sans branche. Un changement de plusieurs commits va sur une branche, fusionnée dans `develop` en historique semi-linéaire : rebaser la branche sur `develop`, puis `git merge --no-ff` (message `Merge branch '<branche>' into develop`). `develop` passe sur `main` par une pull request. Ne jamais pousser directement sur `main` : chaque push y redéploie le site.

## Décisions ouvertes

Côté appli (les questions de règles sont suivies dans le lab) :

- **Mode plusieurs automas** : comment les automas se partagent les phases, les cibles et le tirage des cartes.
- **Plateau automa en option** : l'appli peut tenir le plateau de chaque automa, mais le jeu doit rester jouable avec un plateau physique.

## Pièges

- L'appli n'a **pas de build** : le navigateur charge les fichiers de `app/` tels quels, et une import map fait pointer `lit` vers `vendor/lit-all.min.js`. Ne pas y importer le paquet npm `lit` : il ne sert qu'aux types.
- Le service worker (`app/sw.js`) ne fait rien tant qu'il n'est pas rempli par le build : la version et la liste des fichiers s'y mettent seules. Hors ligne, l'appli tourne sur le cache de la dernière visite.
- `npm test` vérifie les types (TypeScript sur le JS et ses commentaires JSDoc, `jsconfig.json`), les templates (`lit-analyzer`) et lance les tests du moteur. Le moteur ne doit pas diverger des règles du lab : une règle change d'abord dans le lab.
- L'appli garde la partie et l'historique dans `localStorage`, sous les clés du prototype (`automa-hybride-partie`, `automa-hybride-historique`) : ne pas les changer sans reprendre les données existantes.
- Ne pas déposer de PDF dans `site/downloads/` (ignoré par git) : les PDF publiés vivent dans `rules/` et `cards/`.
- Les liens des pages sont relatifs (le site est servi sous `/ares-solo-automa/`, pas à la racine du domaine).

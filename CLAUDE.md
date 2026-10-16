# CLAUDE.md

Instructions pour Claude Code sur ce dépôt. Lire d'abord [CONTRIBUTING.md](CONTRIBUTING.md) (organisation, build du site, branches) : ce fichier n'ajoute que ce qu'il ne dit pas. Garder les deux fichiers cohérents.

## Projet

Un automa solo **non officiel**, créé par des fans, pour le jeu de société *Terraforming Mars: Ares Expedition* (FryxGames / Stronghold Games).

**La conception se fait dans le dépôt privé `ares-solo-automa-lab`**, cloné à côté (`../ares-solo-automa-lab`) : résumé des règles, décisions, comptes rendus de parties, backlog, charte visuelle, sources des cartes et du livret, PDF de travail. Son CLAUDE.md est la source de vérité. **Ce dépôt public ne reçoit que le résultat publié** :

1. **L'appli** : le prototype `app/prototype/assistant-automa.html` (règles v0.4, brouillon), publié sous `site/app/index.html`, puis la future PWA dans `site/app/`. Elle joue un ou plusieurs automas contre un joueur solo (tirage des cartes automa, calcul de leurs gains et achats, suivi des scores) et, en option, tient le plateau de chaque automa.
2. **Le livret de règles** publié, en PDF, dans `rules/<langue>/` : français d'abord, puis anglais.
3. **Les cartes à imprimer** publiées (PDF A4), dans `cards/<langue>/`.

Le livret et les cartes sont générés dans le lab et copiés ici par son script `scripts/publish.py`.

**Ne jamais ajouter ici** de document de conception, de compte rendu de partie, de backlog, de source de cartes ou de livret, ni de PDF de travail : tout cela va dans le lab. Une question de règle se tranche dans le lab (décision, puis résumé des règles), jamais ici. Ne jamais inventer une règle : une information manquante est marquée `TODO`.

## Organisation

- `site/` : ce que GitHub Pages publie, HTML et CSS statiques qui fonctionnent sans JS. `index.html` (accueil FR + EN), `fr/`, `en/`, `assets/`, `app/`, `manifest.webmanifest` (le `<link rel="manifest">` est en commentaire dans les pages, à activer avec la PWA).
- `app/` : les sources de l'appli (pour l'instant, le prototype).
- `scripts/build-site.mjs` : copie `site/` dans `_site/`, copie les PDF de `rules/<langue>/` et `cards/<langue>/` dans `_site/downloads/rules|cards/<langue>/`, et remplace dans les pages les blocs `<!-- downloads <dossier> -->` … `<!-- /downloads -->` par la liste des fichiers (sinon la mention « bientôt » reste).
- `.github/workflows/pages.yml` : build et déploiement sur GitHub Pages à chaque push sur `main`.

## Conventions

- Le mainteneur échange en français. L'interface et les textes sont en français d'abord, puis internationalisés (anglais ensuite). Le code, ses commentaires et les messages de commit sont en anglais.
- La PWA doit fonctionner **hors ligne** et sur une **tablette ou un téléphone posé sur la table** : grandes cibles tactiles, lisible de loin, utilisable d'une main, sans dépendre du réseau pendant une partie.
- **Aucun contenu officiel du jeu** : ni illustration, ni logo, ni texte de carte recopié, ni police ou iconographie officielles. Désigner une carte par son nom ou ses caractéristiques suffit. L'avertissement « projet de fans non officiel » reste en tête du README et en pied de page de chaque page du site.
- `main` est la branche des versions publiées, `develop` la branche de stabilisation. Un changement d'un seul commit va directement sur `develop`, sans branche. Un changement de plusieurs commits va sur une branche, fusionnée dans `develop` en historique semi-linéaire : rebaser la branche sur `develop`, puis `git merge --no-ff` (message `Merge branch '<branche>' into develop`). `develop` passe sur `main` par une pull request. Ne jamais pousser directement sur `main` : chaque push y redéploie le site.

## Décisions ouvertes

Côté appli (les questions de règles sont suivies dans le lab) :

- **Technologie de l'appli** : Svelte / SvelteKit en génération statique est une piste, à confirmer. L'appli sera servie sous `/ares-solo-automa/app/` sur GitHub Pages : prévoir ce chemin de base.
- **Mode plusieurs automas** : comment les automas se partagent les phases, les cibles et le tirage des cartes.
- **Plateau automa en option** : l'appli peut tenir le plateau de chaque automa, mais le jeu doit rester jouable avec un plateau physique.

## Pièges

- Le prototype existe en deux copies identiques, `app/prototype/assistant-automa.html` et `site/app/index.html` : ne le modifier que pour corriger un défaut, dans les deux fichiers.
- Ne pas déposer de PDF dans `site/downloads/` (ignoré par git) : les PDF publiés vivent dans `rules/` et `cards/`.
- Les liens des pages sont relatifs (le site est servi sous `/ares-solo-automa/`, pas à la racine du domaine).

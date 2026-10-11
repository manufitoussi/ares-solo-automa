# Contribuer

Merci de votre intérêt pour *Ares Solo Automa* ! Les retours de parties, les idées, les traductions et les pull requests sont bienvenus. *English speakers: issues and pull requests in English are welcome too.*

Rappel : c'est un projet de fans **non officiel**. N'ajoutez jamais de contenu officiel du jeu : ni illustration, ni logo, ni texte de carte recopié. Parlez des cartes par leur nom ou par leurs caractéristiques (couleur, coût, prérequis), sans en reproduire le texte.

## Signaler quelque chose

Ouvrez une [issue](https://github.com/manufitoussi/ares-solo-automa/issues/new/choose) :

- **Retour de partie** : le niveau de difficulté, le nombre d'automas, les scores, la durée, ce qui a bien marché, ce qui a coincé, les règles ambiguës.
- **Bug appli** : l'appareil, le navigateur, ce que vous attendiez et ce qui s'est passé.

Pour une idée de règle, ouvrez une issue avant de proposer un changement : une règle se discute et se teste avant d'être adoptée.

## Les règles

- Les règles sont conçues et testées en dehors de ce dépôt, qui ne contient que les versions publiées : le livret et les cartes en PDF, et l'appli.
- Une idée de règle ou un retour de partie passe par une issue. Ils sont discutés, testés, puis, s'ils sont retenus, intégrés à la version suivante du livret et des cartes.
- Les règles sont écrites en français d'abord, puis traduites. Une traduction suit la version française publiée : pour proposer une traduction, ouvrez d'abord une issue.

## Le livret et les cartes

- Le livret publié d'une langue est dans `rules/<langue>/`, les cartes publiées dans `cards/<langue>/`. Leurs sources ne sont pas dans ce dépôt.
- Les PDF sont au format A4.
- Ne déposez pas de PDF dans `site/downloads/` : le build du site les y copie depuis `rules/` et `cards/`.

## Le site

Le site est dans `site/` : du HTML et du CSS statiques, sans framework pour l'instant, qui fonctionnent sans JavaScript.

```bash
npm run build                      # construit le site dans _site/ (Node.js 22+)
python3 -m http.server -d _site    # puis http://localhost:8000/
```

Le build copie les PDF de `rules/` et `cards/` dans `_site/downloads/` et remplit les listes de téléchargement des pages (entre les commentaires `<!-- downloads rules/fr -->` et `<!-- /downloads -->`). Sans fichier, la mention « bientôt » reste affichée.

À chaque push sur `main`, le workflow `.github/workflows/pages.yml` construit et publie le site sur GitHub Pages.

L'appli (PWA) sera dans `site/app/`. Sa technologie n'est pas encore choisie. En attendant, `site/app/index.html` publie le prototype de l'assistant, dont la source est `app/prototype/` (voir [app/README.md](app/README.md)).

## Branches et commits

- `main` est la branche des versions publiées : chaque push y déploie le site. `develop` est la branche de stabilisation, où arrivent les changements.
- Créez votre branche depuis un `develop` à jour, avec un préfixe pour son sujet : `regles/...`, `cartes/...`, `appli/...`, `site/...` ou `docs/...`. Ouvrez la pull request vers `develop`, pas vers `main`.
- `develop` passe sur `main` par une pull request, quand une version est prête à être publiée.
- Un message de commit a un titre court à l'impératif, puis, si besoin, un corps qui explique quoi et pourquoi. Le code et les messages de commit sont en anglais ; les règles, la conception et l'interface sont en français d'abord.

## Outils d'IA

Les contributions assistées par une IA sont bienvenues. Vous êtes responsable de ce que vous soumettez : relisez, comprenez et testez chaque ligne. Les instructions pour les agents de code sont dans [CLAUDE.md](CLAUDE.md).

## Licence

En contribuant, vous acceptez que votre code soit sous [licence MIT](LICENSE) et vos règles, textes et cartes sous [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).

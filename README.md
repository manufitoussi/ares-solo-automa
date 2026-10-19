# Ares Solo Automa

> **Projet de fans non officiel**, non affilié à FryxGames ni à Stronghold Games. *Terraforming Mars* est une marque de FryxGames. Nécessite le jeu original.
>
> **Unofficial fan-made project**, not affiliated with FryxGames or Stronghold Games. *Terraforming Mars* is a trademark of FryxGames. Requires the original game.

🌐 Site : <https://manufitoussi.github.io/ares-solo-automa/>

[Français](#français) · [English](#english)

---

## Français

Un automa pour jouer en solo à *Terraforming Mars: Ares Expedition* contre un ou plusieurs adversaires simulés.

Le projet a trois volets :

1. **Le livret de règles**, à télécharger, en français d'abord puis en anglais.
2. **Les cartes à imprimer** (PDF A4) : le paquet automa de 15 cartes, les aides-mémoire et les cartes de phase joueur.
3. **Une appli web (PWA)**, *en préparation* : elle jouera un ou plusieurs automas (tirage des cartes, gains, achats, scores) et pourra, en option, tenir leur plateau. Elle fonctionnera hors ligne, sur une tablette ou un téléphone posé sur la table.

### État

Les règles (v0.5) sont en cours de conception et de test. Le livret, les cartes et le prototype de l'appli sont sur le [site](https://manufitoussi.github.io/ares-solo-automa/).

### Organisation du dépôt

| Dossier | Contenu |
| --- | --- |
| `site/` | le site publié sur GitHub Pages (accueil, pages par langue, appli dans `site/app/`) |
| `app/prototype/` | le prototype de l'assistant de partie, référence pour la future appli |
| `rules/<langue>/` | le livret de règles publié (PDF) |
| `cards/<langue>/` | les cartes à imprimer publiées (PDF) |
| `scripts/` | la construction du site |

À chaque push sur `main`, GitHub Actions construit le site (`npm run build`) : les PDF de `rules/` et `cards/` sont copiés dans `downloads/`, puis le site est publié.

### Participer

Les retours de parties sont précieux : ouvrez une issue [« Retour de partie »](https://github.com/manufitoussi/ares-solo-automa/issues/new/choose). Voir [CONTRIBUTING.md](CONTRIBUTING.md).

### Licences

- Le code : [MIT](LICENSE).
- Les règles, textes et cartes : [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).

Aucune illustration, aucun logo ni aucun texte de carte officiels ne sont inclus.

---

## English

An automa to play *Terraforming Mars: Ares Expedition* solo against one or more simulated opponents.

The project has three parts:

1. **The rulebook**, to download, in French first, then in English.
2. **The print & play cards** (A4 PDF): the 15-card automa deck, the reference cards and the player phase cards.
3. **A web app (PWA)**, *in preparation*: it will play one or more automas (card draws, income, purchases, scores) and may, optionally, keep track of their boards. It will work offline, on a tablet or a phone lying on the table.

### Status

The rules (v0.5) are being designed and playtested. The rulebook, the cards and the app prototype are on the [website](https://manufitoussi.github.io/ares-solo-automa/).

### Repository layout

| Folder | Content |
| --- | --- |
| `site/` | the website published on GitHub Pages (home page, pages per language, app in `site/app/`) |
| `app/prototype/` | the prototype of the game assistant, reference for the future app |
| `rules/<language>/` | the published rulebook (PDF) |
| `cards/<language>/` | the published print & play cards (PDF) |
| `scripts/` | the website build |

On each push to `main`, GitHub Actions builds the website (`npm run build`): the PDF files of `rules/` and `cards/` are copied to `downloads/`, then the website is published.

### Contributing

Playtest feedback is very welcome: open a ["Retour de partie" (playtest report)](https://github.com/manufitoussi/ares-solo-automa/issues/new/choose) issue, in French or English. See [CONTRIBUTING.md](CONTRIBUTING.md).

### Licenses

- The code: [MIT](LICENSE).
- The rules, texts and cards: [CC BY-NC-SA 4.0](LICENSE-CONTENT.md).

No official artwork, logo or card text is included.

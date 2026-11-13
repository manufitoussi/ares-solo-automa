# Ares Solo Automa

> **Projet de fans non officiel**, non affilié à FryxGames ni à Stronghold Games. *Terraforming Mars* est une marque de FryxGames. Nécessite le jeu original.
>
> **Unofficial fan-made project**, not affiliated with FryxGames or Stronghold Games. *Terraforming Mars* is a trademark of FryxGames. Requires the original game.

**▶ Jouer sans rien imprimer : [ouvrir l'appli](https://ares-automa.softef.com/app/)** · *Play without printing anything: [open the app](https://ares-automa.softef.com/app/)*

🌐 Site : <https://ares-automa.softef.com/>

[Français](#français) · [English](#english)

---

## Français

Un automa pour jouer en solo à *Terraforming Mars: Ares Expedition* contre un ou plusieurs adversaires simulés.

Le projet a trois volets :

1. **Une appli web (PWA)**, pour jouer sans rien imprimer : elle tire les cartes de l'automa, résout les phases une par une avec vous et, au choix, tient son plateau. Elle s'installe sur l'écran d'accueil et marche hors ligne après une première visite, sur une tablette ou un téléphone posé sur la table.
2. **Le livret de règles**, à télécharger, en français d'abord puis en anglais.
3. **Les cartes à imprimer** (PDF A4) : le paquet automa de 15 cartes, les aides-mémoire et les cartes de phase joueur.

### État

Version 0.7. Les règles sont en cours de test. Elles n'ont pas changé depuis la v0.6, dont le livret et les cartes restent valables. L'appli, le livret et les cartes sont sur le [site](https://ares-automa.softef.com/).

### Organisation du dépôt

| Dossier | Contenu |
| --- | --- |
| `site/` | le site publié sur GitHub Pages (accueil, pages par langue), auquel le build ajoute l'appli |
| `app/` | l'appli, et l'ancien prototype gardé comme référence (`app/prototype/`) |
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

1. **A web app (PWA)**, to play without printing anything: it draws the automa's cards, resolves the phases one by one with you and, if you like, keeps its board. It can be added to the home screen and works offline after a first visit, on a tablet or a phone lying on the table.
2. **The rulebook**, to download, in French first, then in English.
3. **The print & play cards** (A4 PDF): the 15-card automa deck, the reference cards and the player phase cards.

### Status

Version 0.7. The rules are being playtested. They have not changed since v0.6, whose rulebook and cards remain valid. The app, the rulebook and the cards are on the [website](https://ares-automa.softef.com/).

### Repository layout

| Folder | Content |
| --- | --- |
| `site/` | the website published on GitHub Pages (home page, pages per language), to which the build adds the app |
| `app/` | the app, and the former prototype kept as a reference (`app/prototype/`) |
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

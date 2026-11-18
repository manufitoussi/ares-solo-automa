# Statistiques de visite

Le site et l'appli mesurent leur usage avec [Umami](https://umami.is), un outil libre et auto-hébergé, **sans cookies** et **sans donnée personnelle**. Il n'y a donc pas de bandeau de consentement. Ce document liste tout ce qui est envoyé. Si le code envoie autre chose, c'est une erreur : signalez-la dans une issue.

## Pourquoi

Pour savoir si l'automa est joué, comment, et surtout s'il est bien équilibré : les résultats des parties donnent le taux de victoire par niveau, ce que quelques testeurs seuls ne peuvent pas donner.

## Ce qui n'est jamais envoyé

- Votre nom, une adresse e-mail, un identifiant de compte (il n'y en a pas).
- La remarque libre que vous écrivez à la fin d'une partie.
- Le détail des tours, des phases ou des cartes tirées : il reste dans l'historique de votre appareil.
- L'heure exacte de vos parties.
- Votre adresse IP : Umami s'en sert seulement pour en déduire le pays, puis ne la garde pas.

## Où et quand

- **Le site** (`ares-automa.softef.com/fr/` et `/en/`) et **l'appli** (`/app/`) chargent le script d'Umami depuis `stats.softef.com`.
- Sur toute autre adresse (copie du site, aperçu), rien n'est chargé. En développement (`localhost`), les données vont dans un site Umami de test, séparé.
- **Hors ligne**, les événements de l'appli attendent sur votre appareil (au plus 100, pendant 30 jours) et partent à la prochaine ouverture en ligne. Umami les date alors du moment de l'envoi : ceux qui ont attendu plus d'une minute portent `late: true`.
- Si un bloqueur de publicité bloque le script, rien n'est envoyé et l'appli fonctionne pareil.

## Comment refuser

- Activez « Do Not Track » dans votre navigateur : il est respecté.
- Ou ouvrez l'appli avec `?notrack` à la fin de l'adresse (`https://ares-automa.softef.com/app/?notrack`). Les statistiques sont alors coupées sur cet appareil, pour le site et l'appli, et les événements en attente sont effacés. `?track` les réactive. Chaque navigateur a son propre réglage, et sur iPhone l'appli installée aussi.

## Ce qu'Umami compte de lui-même

À chaque page vue : l'adresse de la page (avec ses paramètres, par exemple `?utm_source=qr` pour le QR code du site : ces paramètres `utm_` sont envoyés avec la première page vue, puis retirés de la barre d'adresse pour qu'un favori ou un lien partagé ne les répète pas), la page d'où vous venez, le pays, la langue du navigateur, la taille de l'écran, le type d'appareil, le navigateur et le système. Umami reconnaît un même visiteur sans cookie, avec une empreinte calculée à partir de l'adresse IP et du navigateur, brouillée avec une valeur qui change régulièrement : elle ne permet pas de remonter jusqu'à vous.

**Erreurs** : si l'appli plante, Umami reçoit le message d'erreur technique et l'endroit du code concerné, pour corriger les bugs que personne ne signale.

## Les événements

Chaque événement a un nom et quelques propriétés. Plusieurs reprennent la **forme de la partie** :

| Propriété | Valeurs | Sens |
| --- | --- | --- |
| `mode` | `jeu`, `suivi` | l'appli remplace les cartes, ou suit aussi Mars en détail |
| `level` | `tresfacile`, `facile`, `normal`, `difficile`, `tresdifficile` | le niveau de l'automa |
| `board` | `app`, `table` | le plateau de l'automa est tenu par l'appli ou sur la table |
| `deck` | `app`, `cartes` | l'appli tire les cartes, ou le joueur retourne les cartes imprimées |
| `rules` | `0.7`… | la version des règles |

### Sur le site

| Événement | Quand | Propriétés |
| --- | --- | --- |
| `open-app` | clic sur « Ouvrir l'appli » | `from` : `hero` (en haut de page) ou `app-tile` (bloc de l'appli) |
| `download` | téléchargement d'un PDF | `file` : le fichier, par exemple `rules/fr/Automa-hybride-livret.pdf` |
| `switch-lang` | changement de langue | `from` : `site`, `to` : `fr` ou `en` |
| `github` | clic vers GitHub | `to` : `report` (partager un compte rendu) ou `repo` (le dépôt) |

### Dans l'appli

| Événement | Quand | Propriétés |
| --- | --- | --- |
| `app-open` | ouverture de l'appli | `display` : `installed` (appli installée) ou `browser`, `game` : `none`, `playing` ou `ended` (la partie sauvegardée), `lang` |
| `install` | installation de l'appli | aucune |
| `game-start` | nouvelle partie | la forme de la partie, `lang` |
| `game-end` | fin de partie | la forme de la partie, `turns` (tours joués), `end`, `undos` |
| `game-result` | résultat enregistré dans l'historique | la forme de la partie, `turns`, `end`, `undos`, `player` (score du joueur), `automa` (score de l'automa), `diff` (joueur moins automa), `result` : `win`, `loss` ou `tie` (du point de vue du joueur) |
| `game-abandon` | partie quittée avant sa fin (« Nouvelle partie » ou abandon dans l'historique) | la forme de la partie, `turn` (le tour en cours), `undos` |
| `history-open` | ouverture de l'historique | aucune |
| `export` | sauvegarde exportée | `what` : `all`, `current` ou `game`, `how` : `file` ou `copy` |
| `import` | sauvegarde importée | `how` : `file` ou `paste`, `games` (parties ajoutées), `replaced` (la partie en cours a été remplacée) |
| `import-error` | import refusé | `how`, `code` : `json`, `format` ou `empty` |
| `switch-lang` | changement de langue dans l'appli | `from` : `app`, `to` |

- `end` dit comment la partie s'est terminée : `terraformed` (le joueur a déclaré Mars terraformé), `maxed` (l'appli a vu les trois paramètres au maximum) ou `stopped` (partie arrêtée à la main).
- `undos` compte les retours en arrière pendant la partie, sur l'appareil où elle se joue.
- Une partie terminée, reprise puis terminée à nouveau compte deux `game-end`. `game-result` ne compte qu'une fois par partie.

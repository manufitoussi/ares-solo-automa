# app/

Sources de l'appli. La version publiée est dans [site/app/](../site/app/).

- `prototype/assistant-automa.html` : prototype de l'assistant de partie (règles v0.4, brouillon), un seul fichier HTML sans dépendance, créé dans claude.ai. Il contient toute la logique de l'automa : tirage, cartes réactives, prise de carte, achats en Action, production, suivi du NT, historique. Il sauvegarde la partie dans `localStorage`. C'est la **référence pour la logique de la future PWA**.

Le prototype n'est pas modifié, à part le pied de page « projet non officiel ». Il est publié tel quel sous `site/app/index.html` : une correction se fait dans les deux fichiers, qui doivent rester identiques.

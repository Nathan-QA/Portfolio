# Atelier : recomposition réelle du portfolio

Cette version intègre la direction des maquettes dans le site, plutôt qu'une correction d'accent.

## Structure

Navigation au-dessus de l'aquarelle, nom et rôle intégrés dans la bannière.
Quatre jeux dans une grille de deux colonnes, puis trois articles dans une grille éditoriale.
Les légendes des jeux sont sur le papier sous les images, sans assombrir celles-ci.
Les compétences, le parcours, le contact et les fenêtres de lecture utilisent le même langage typographique.
Jour et nuit partagent exactement la même structure. Les visuels des jeux ne sont pas repeints ni remplacés par ceux des maquettes.

## Fichiers

- `index.html` : structure de l'accueil, bannière et sections
- `ux.css` : couche graphique complète et responsive, tokens jour/nuit regroupés au début
- `js/header.js` : navigation persistante et menu mobile
- `js/notebook.js` : disposition des légendes dans les cartes existantes, compatible avec les changements de langue
- `js/config.js` : textes d'introduction et légendes de sections FR/EN

Les originaux de `assets/`, les fiches JSON des jeux/articles, le lecteur de trailers et le code des feuilles restent conservés.
Les particules sont affichées derrière les contenus et dans la marge droite, le décor ne masque plus les contrôles.
Aucune police téléchargée : Georgia ou une serif système pour les titres, police système sans-serif pour le corps.

## Vérifications

Les anciennes assertions de mise en page ont été adaptées aux changements intentionnels : nom dans la bannière, rôle séparé, trois articles sur une rangée et flèche vers les projets.
Les parcours fonctionnels existants restent exécutés, nouveaux tests pour l'ordre des sections, les légendes, les couleurs de texte, la traduction et le contraste sur papier.
Les tests YouTube simulent le contrat du fournisseur, pas sa disponibilité réseau réelle.
Les captures locales sont des rendus HTML/CSS avec ressources locales. La navigation native est vérifiée par Playwright dans la CI.

Branche de travail uniquement : `fix/ux-main-faithful`. Pas d'autorisation de fusion sur `main`.

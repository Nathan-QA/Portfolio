# Atelier : recomposition réelle du portfolio

Navigation au-dessus de l'aquarelle, nom et rôle intégrés dans la bannière.
Quatre jeux dans une grille de deux colonnes, puis trois articles dans une grille éditoriale.
Les légendes des jeux sont sur le papier sous les images, sans assombrir celles-ci.
Les compétences, le parcours, le contact et les fenêtres de lecture partagent le même langage typographique.
Jour et nuit ont la même structure. Les images des jeux ne sont pas repeintes ni remplacées par les maquettes.

## Fichiers

- index.html : structure de l'accueil, bannière et sections
- ux.css : couche graphique complète et responsive, tokens jour/nuit regroupés au début
- js/header.js : navigation persistante et menu mobile
- js/notebook.js : disposition des légendes, compatible avec les changements de langue
- js/config.js : introduction et légendes de sections FR/EN

Les originaux de assets/, les fiches JSON, le lecteur des trailers et le code des feuilles sont conservés.
Les particules sont derrière les contenus et dans la marge droite, pas au-dessus des contrôles.
Aucune police téléchargée : Georgia ou serif système pour les titres, sans-serif système pour le corps.

## Vérifications

Les anciennes assertions de mise en page sont adaptées aux changements intentionnels : nom dans la bannière, rôle séparé, trois articles sur une rangée et flèche vers les projets.
Les parcours fonctionnels restent exécutés. Nouveaux contrôles pour l'ordre des sections, les légendes, la traduction et le contraste sur papier.
Les tests YouTube simulent le contrat du fournisseur, pas sa disponibilité réelle.
Les captures locales sont des rendus HTML/CSS. La navigation native est vérifiée par Playwright dans la CI.

## Isolation

Branche : feat/atelier-implemented
Base de travail : b2d9e434fca59046376dee58a8078b2e694a125d
La branche fix/ux-main-faithful a avancé vers 04ddcf0 pendant cette passe.
Son envoi a été refusé comme non fast-forward. Aucun force-push effectué.
La nouvelle proposition est donc isolée, la modification concurrente est conservée.
Aucune fusion ni modification de main.

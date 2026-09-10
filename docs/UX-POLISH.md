# Seconde passe UX, sur la DA de main

Cette passe complète `docs/UX-MAIN.md`, sur la même branche `fix/ux-main-faithful`
La PR reste un brouillon, aucune fusion ni publication sur main n'est autorisée

## Changements

Invitation discrète dans la bannière, nom cliquable pour revenir en haut
Cartes projets avec rôle et moteur quand il est renseigné de façon concise, accès direct à l'étude associée
Titres courts pour les cartes d'articles, textes et titres complets conservés dans la fenêtre
Recherche et filtre conservés dans l'URL (`q` et `topic`), réinitialisation disponible même avec des résultats
Mode Lecture explicite : contexte et médias de présentation masqués, contenu intégral conservé, colonne de lecture resserrée
Sommaire accessible depuis la barre de la fenêtre et lien direct vers une section, bouton de copie du lien
Galeries avec compteur, navigation tactile et restauration du focus sur le déclencheur
Miniatures utilisables au clavier, header compact sur téléphone, CV accessible dans le menu
Survols et pressions des cartes, sans modification du scroll ni des animations de décor

## Contenu

Les nouveaux titres de cartes sont dans `content/presentation.json`, clé `articleTitles`
Une fiche peut aussi définir `cardTitle: { "fr": "…", "en": "…" }`, qui prend la priorité
Le titre original de l'article reste dans `title`, le contenu long n'est pas modifié
Les relations projet/article continuent d'utiliser `projects` dans les fiches existantes

## Code

`js/ux.js` : cartes, recherche, navigation et accessibilité des couches
`js/reading.js` : outils des fenêtres de détail, sommaire et mode Lecture
`ux.css` : ajustements visuels avec les tokens existants, pas de nouvelle palette
`tests/refinements.spec.mjs` : scénarios supplémentaires, exécutés avec les tests existants

`style.css`, `js/config.js`, `js/ui.js` et les assets restent inchangés par cette passe
Les vérifications complètes se font via `npm run check`, `npm run build` et `npm test`
Les ressources tierces ne font pas partie des tests d'interface

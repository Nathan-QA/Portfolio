# Direction auteur intégrée au site

Branche : `fix/ux-main-faithful`, PR 4 en brouillon, pas de fusion sur main
Base : `c572b169f4d1b6dbb4b5be3e4ddf6efb041a1c66`

## Intégration

La direction est réalisée en HTML, CSS et JavaScript, pas avec une capture de maquette comme fond de page
Les illustrations de bannière jour/nuit, le portrait, les images des jeux, l'arbre et ses sprites sont les fichiers d'origine
Les captures des jeux ne sont pas repeintes ou filtrées selon le thème

La navigation passe au-dessus du grand cadre et reste collante
L'identité Production / QA / Level Design et le texte d'introduction sont intégrés au cadre, sélectionnables et traduits
Sur téléphone, le texte passe sous l'illustration pour ne pas écraser la zone de lecture
Les quatre jeux restent avant les trois articles, puis viennent les compétences et le contact

Les accents d'interface sont sauge/olive le jour et olive clair la nuit, sans soulignements bleus
La typographie de titres, les filets de pinceau, le grain léger et les petites feuilles issues des sprites existants sont communs à toutes les sections et aux fenêtres de détail
Il n'y a pas de police web à télécharger, les titres utilisent la pile système Georgia / Times New Roman
La police du texte courant reste la pile système sans serif existante

Les légendes projets sont sorties du lecteur vidéo : titres et rôles restent lisibles pendant les previews
Une seule entrée par carte est conservée, pas de duplication des CTA
Recherche, filtres, sommaire, galeries et comportement de navigation restent actifs
Le code du hover trailer et le mouvement original de l'arbre sont inchangés dans cette passe
Un masque atténue les feuilles sur les colonnes de texte et les conserve dans la marge

## Maintenance

- `ux.css` : système visuel consolidé, variables des deux thèmes en tête de fichier
- `js/config.js` : textes d'accueil FR/EN, sans changement des dates historiques
- `js/author.js` : présentation des légendes projets, décor des cartes, idempotent après changement de langue
- `content/presentation.json` : titres courts et résumés existants
- `content/content_manifest.json` et les fiches JSON : projets et articles

Les anciennes images générées de maquettes ne sont pas publiées
Les fichiers `style.css`, `js/ui.js`, `js/hover-preview.js` et les contenus détaillés restent intacts

## Vérification

La recette existante est conservée, le test de positionnement vérifie maintenant la ligne de rôle et non le H1 qui porte le nom
`tests/author.spec.mjs` ajoute les contrôles des thèmes, contrastes des légendes, ordre des sections, absence de doublons, tailles mobiles et conservation des images

Les tests de preview utilisent un lecteur YouTube simulé : ce n'est pas une vérification de disponibilité du service externe
Les rendus locaux ont été inspectés dans Chromium avec les ressources servies depuis les fichiers, les parcours réels de navigation sont exécutés dans GitHub Actions

# Production, QA et Level Design

Troisième passe sur `fix/ux-main-faithful`, à partir de `b47cbdd`
Aucune autorisation de fusion sur main

## Page d'accueil

Le profil est désormais Production / QA / Level Design, et non Level Designer avec un background QA et production
Les libellés FR/EN se trouvent dans `js/config.js`, les résumés et titres courts des cartes dans `content/presentation.json`
Les quatre projets et leurs contenus détaillés sont conservés, ainsi que les trois articles et les 29 compétences
Les familles de compétences sont présentées dans l'ordre production, QA, design, puis outils et langues
La mention finale datée de mai 2026 « recherche d'un nouveau projet » n'est plus affichée, elle ne constitue pas une information actuelle vérifiée
Les dates historiques des missions ne sont pas réécrites à partir d'une supposition

Une seule entrée par carte projet, un titre cliquable et une carte également cliquable
Les études associées restent dans les fiches projets et dans la section Articles
Suppression du doublon CV/projets dans l'introduction, des boutons « Lire » sous les articles, des paragraphes qui expliquaient les sections, des CTA répétés dans le contact
Le CV reste dans le header et dans le menu mobile, le contact contient un seul mailto, une copie d'adresse et LinkedIn

`ux.css` a été réorganisé en une couche unique pour cette variante : navigation soulignée, rayons courts, titres mesurés, liste d'articles plus compacte et espacement constant
La palette, les images, la police, le rideau, l'arbre et les particules de main ne changent pas
Le contrôle du fichier config a été restreint aux paramètres du décor, puisque les textes de positionnement sont maintenant volontairement modifiables

## Lecture

Les articles s'ouvrent en lecture par défaut, contexte et médias restent accessibles dans la barre
Dans les fiches projets, les contributions sont visibles et les textes de contexte regroupés sous une disclosure native
Aucun texte long n'est réécrit ou supprimé des données

## Previews vidéo

Module : `js/hover-preview.js`, branché par `refreshUX`
Champ de contenu : `trailer`, YouTube (ID ou URL) ou fichier MP4/WebM
Survol de 280 ms, lecture muette, une seule preview à la fois
La couverture reste visible tant que le lecteur n'a pas confirmé la lecture, retour à la couverture en cas d'erreur, refus d'autoplay ou délai dépassé
Arrêt au départ du pointeur, ouverture d'une fiche, sortie du viewport, masquage de l'onglet, navigation ou changement de langue
Pas d'autoplay tactile, en économie de données ou avec réduction des animations
L'API YouTube est chargée uniquement après le survol, pas au chargement de la page
Cela peut contacter YouTube sans clic, le mode nocookie ne signifie pas absence de transmission de données au fournisseur
La disponibilité des vidéos et les restrictions d'autoplay restent celles du navigateur et de YouTube

Références techniques :
- https://developers.google.com/youtube/iframe_api_reference
- https://developers.google.com/youtube/player_parameters

## Vérification

`npm run check` vérifie les empreintes de la feuille de style et des assets du décor, les paramètres CURTAIN et les contenus bilingues
`npm test` exécute les parcours Chromium/Firefox et les captures dans la CI
Les tests de preview simulent le contrat de l'API YouTube : mute avant play, une instance, annulation, erreur, autoplay bloqué, interaction tactile et mouvement réduit
Ils ne prouvent pas la disponibilité d'un trailer YouTube réel et ne doivent pas être présentés comme tels
Les scénarios existants ont été adaptés aux changements voulus : navigation par le menu au lieu du CTA supprimé, étude accessible depuis la fiche et lecture par défaut

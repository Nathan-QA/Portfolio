# Correction UX à partir de main

Base : `d9bce83cad8b259d68fc51c4a387bfd828196c82`

Les propositions « Carnet » et « Editorial » ne sont pas la base de cette version
Aucune fusion vers main n’est autorisée par cette livraison

## Direction visuelle conservée

Le fichier `style.css`, la configuration du thème, les images originales et l’implémentation de l’arbre et de ses particules sont conservés à l’identique
Les ajustements dans `ux.css` reprennent uniquement les variables de couleur, les polices, les cadres et les composants existants
Pas de serif, pas de nouvelles textures, pas de nouvelle palette, pas de numérotation éditoriale des sections

## Changements ciblés

Introduction resserrée, accès direct aux projets, parcours complet déplacé après les travaux et dépliable, compétences détaillées à la demande
Les cartes conservent leurs illustrations, leur construction et leur contraste, avec des titres calibrés et des résumés courts non tronqués
Articles et études de cas dans la même section, filtre par projet et recherche sans distinction d’accents
Fenêtres de détail conservées, contribution personnelle présentée avant les informations secondaires du jeu, fermeture persistante et sommaire des articles
Liens directs et historique navigateur rétablis, focus clavier, menu mobile activable au clavier, retour au contenu lors de la fermeture
Vidéos disponibles dans les projets, mais plus de démarrage en passant accidentellement sur une carte
Contact par e-mail direct et copie de l’adresse, sans faux formulaire d’envoi

## Modifier le contenu

Les contenus restent dans les JSON existants de `content/`, listés dans `content/content_manifest.json`
Les résumés courts des cartes se trouvent dans `content/presentation.json`, les textes longs ne sont pas réécrits
Un article peut avoir `projects: []` pour parler d’un autre sujet
`published: false` garde une fiche en brouillon même si elle apparaît dans le manifeste

Créer un brouillon : `npm run new:article -- mon-sujet`
Compléter les versions FR/EN, les médias et les éventuels projets associés, puis passer `published` à `true`
Une fiche projet peut être ajoutée en copiant une fiche existante et en la référençant dans `projects` du manifeste

## Prévisualiser

Node.js 22 ou supérieur

```sh
npm run build
npm run preview
```

Les deux commandes ne nécessitent aucune installation de dépendances
Ouvrir l’adresse locale affichée dans le terminal
Les fichiers de `dist/` sont uniquement générés, ne pas les modifier à la main

## Vérifier

```sh
npm run check
npm install
npx playwright install chromium firefox
npm test
```

Le contrôle statique compare les empreintes des éléments visuels conservés à celles de main
Les scénarios navigateur et les captures sont exécutés par le workflow de la branche de travail
Les vidéos et ressources tierces sont exclues des tests d’interface
Les captures hors ligne intermédiaires ne constituent pas une validation du déploiement

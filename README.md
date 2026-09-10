# Nathan Tandille · Portfolio

Portfolio éditorial bilingue FR/EN : projets, journal, compétences et contact. Les illustrations aquarellées d’origine, les ambiances jour/nuit et l’arbre animé sont conservés.

## Démarrer

Node.js 22 ou plus récent est nécessaire pour construire le site. Aucune base de données, aucun compte tiers ni clé API ne sont nécessaires.

```sh
npm install
npm run build
npm run check
npm run preview
```

Ouvrir `http://127.0.0.1:4173`. Le dossier **dist/** contient le site statique à publier. Il est fourni déjà construit dans le ZIP de livraison. Pour prévisualiser ce build sans installer les dépendances : `node scripts/serve.mjs` à la racine du projet. Ne pas ouvrir les pages en `file://` : les liens sont relatifs à la racine du site.

## Ajouter du contenu

```sh
npm run new:article -- mon-sujet
npm run new:project -- mon-projet
```

La commande crée une fiche FR/EN en brouillon et l’ajoute au manifeste. Compléter le fichier indiqué, ajouter les images dans `assets/projects/`, puis passer `published` à `true` et reconstruire. Un article peut être rattaché à plusieurs projets ou à aucun. Aucun composant d’interface n’est à modifier.

- `content/content_manifest.json` : ordre et liste des fiches
- `content/content_projects_*.json` : projets existants
- `content/content_cases_*.json` : articles existants conservés intégralement
- `content/site.json` : présentation, contact, liens, illustrations et réglages d’accueil
- `content/editorial.json` : accroches courtes des cartes, distinctes des textes longs
- `content/skills.json` : compétences et liens vers leurs exemples

Voir **docs/CONTENU.md** pour le contrat de contenu et les formats d’articles.

## Architecture

Le générateur dans `scripts/build.mjs` fabrique le HTML des deux langues. `src/pages.mjs` contient les composants partagés, `src/style.css` le système visuel et `src/app.js` les améliorations interactives. Les images sont optimisées en WebP avec Sharp et plusieurs résolutions ; les fichiers d’origine restent intacts. Le cache `.cache/images` accélère les reconstructions et n’est pas publié.

Les pages sont entièrement rendues avant publication : elles restent lisibles et navigables sans JavaScript. Celui-ci ajoute le choix d’ambiance, les filtres, la lightbox, les repères de lecture et l’animation. Il n’existe aucune dépendance JavaScript tierce exécutée par le navigateur, aucun formulaire à configurer et aucun service d’authentification.

## Tests

```sh
npm run check
npx playwright install chromium
npm test
```

La vérification statique contrôle les liens internes, les ancres, les images, les identifiants et les métadonnées. Playwright couvre les routes, le retour navigateur, les thèmes, les filtres, le mobile, la lightbox, l’absence de JavaScript, les animations réduites et les captures visuelles. Le workflow GitHub Actions exécute les mêmes commandes et conserve les résultats sept jours.

## Publication

La configuration `vercel.json` fournit `npm run build` et le répertoire de sortie `dist`. Le code de la refonte reste sur `refactor/editorial-portfolio` tant qu’il n’est pas fusionné. Pour un hébergeur statique classique, publier le contenu de `dist` à la racine du domaine. Les routes terminent par `/` et possèdent leur propre `index.html`.

Les anciens liens `#project=...`, `#kase=...`, `#cases` et `#about` sont pris en charge. Les ancres normales ne sont pas réinitialisées au chargement.

## Périmètre éditorial

Les projets, contributions et articles proviennent des fichiers existants. La refonte n’atteste pas à nouveau chaque affirmation, date de sortie ou rôle dans ces textes. Le CV fourni est le PDF français existant, y compris depuis l’interface anglaise. Aucun article fictif, chiffre de performance inventé ou information privée provenant d’autres conversations n’a été publié.

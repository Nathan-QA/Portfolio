# Nathan Tandille · Portfolio / Carnet

Refonte du portfolio autour de trois niveaux : découvrir les projets, lire les articles du carnet, approfondir les compétences. L’univers aquarelle, les illustrations jour/nuit, l’arbre et ses particules sont conservés.

## Récupérer et lancer les sources

La dernière version Carnet est intégrée sur `feat/portfolio-carnet`. L’autre proposition, `refactor/editorial-portfolio`, reste séparée. Ne pas fusionner les deux implémentations entre elles.

Depuis un clone du dépôt, avec Node.js 22 ou supérieur :

```sh
git fetch origin
git switch feat/portfolio-carnet
git pull --ff-only
npm install
npm run build
npm run preview
```

Ouvrir `http://127.0.0.1:4173`. Arrêter le serveur avec `Ctrl+C`.

`dist/` est généré par la construction et n’est pas versionné. Dans le ZIP livré séparément, il est déjà construit : `LANCER_APERCU.bat` utilise Python 3 ou Node.js disponible pour le servir. Après un clone GitHub, construire d’abord le site avant d’utiliser ce lanceur. Ne pas ouvrir `dist/index.html` directement, les pages utilisent des chemins à partir de la racine du site.

## Travailler sur le site

```sh
npm run dev
```

Le mode développement reconstruit le site après les modifications dans `src`, `content` ou `assets`. Actualiser le navigateur après la reconstruction. Il ne fait pas de rechargement automatique.

```sh
npm run build
npm test
```

La construction produit des pages HTML statiques dans `dist/`, optimise les images avec Sharp et valide les références entre les contenus. Aucun serveur applicatif, compte externe ou base de données n’est nécessaire en production.

## Ajouter du contenu

Créer un article avec ses deux fichiers Markdown :

```sh
npm run new -- article mon-sujet
```

Créer une fiche projet :

```sh
npm run new -- project mon-projet
```

Les nouveaux contenus sont créés avec `published: false`. Les compléter, puis passer cette valeur à `true`. Un article peut avoir `projects: []` : il n’est pas obligé de parler d’un projet du portfolio.

La documentation des champs et du Markdown est dans `docs/CONTENT.md`.

## Où modifier quoi

| Fichier ou dossier | Usage |
| --- | --- |
| `content/site.json` | Identité, phrase d’accueil, sélections mises en avant, résumés courts et trois expertises |
| `content/projects/` | Une fiche JSON par projet |
| `content/articles/` | Articles existants en JSON, nouveaux articles en JSON + Markdown |
| `content/skills.json` | Catalogue détaillé des compétences et liens vers les projets |
| `src/i18n.mjs` | Libellés de l’interface en FR et EN |
| `src/templates.mjs` | Structure des pages |
| `src/site.css` | Direction visuelle, thèmes et responsive |
| `src/site.js` | Navigation mobile, filtres, galerie, thèmes et animations |
| `scripts/` | Construction, prévisualisation, création de brouillons |
| `tests/` | Tests du contenu, du serveur et scénarios navigateur |

`dist/`, `.cache/`, les rapports et `node_modules/` sont générés, ne pas les modifier à la main. Les anciens fichiers de l’application restent dans l’historique et sur cette branche sans être utilisés par le nouveau build : modifier les fichiers `src/` et les nouvelles collections, pas l’ancien `js/` ni le `style.css` racine.

## Publication

`vercel.json` et `netlify.toml` configurent `npm run build` et la publication de `dist`. Les previews Vercel reçoivent une directive `noindex`. Sur un autre hébergeur statique, publier le contenu de `dist/`, conserver les chemins de dossiers et configurer `404.html` comme page d’erreur.

La refonte est poussée sur sa branche de travail et proposée en pull request, sans fusion automatique dans `main`. Les intégrations existantes peuvent créer une prévisualisation de branche ou de pull request. La mise en production reste une décision distincte.

Le patch de la livraison initiale n’est plus à appliquer sur cette branche mise à jour. Voir `docs/APPLIQUER_PATCH.md` pour le contexte et la récupération normale des sources.

## Vérifications

```sh
npm test
npx playwright install --with-deps chromium webkit
npm run test:e2e
```

`docs/QA.md` conserve le bilan de la livraison locale. Le workflow `Portfolio review` reconstruit les sources et exécute les tests Node et Playwright. Les résultats de la nouvelle intégration sont ceux du run GitHub Actions associé au commit, pas une validation présumée de tous les scénarios.

Les contenus historiques ont été conservés depuis le dépôt : cette refonte ne certifie pas leur actualité éditoriale. Le CV existant est un PDF français, y compris depuis la version anglaise du site.

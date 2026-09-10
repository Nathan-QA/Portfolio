# Maintenir et enrichir le portfolio

## Trois niveaux, trois usages

**Projet** : comprendre de quel jeu il s’agit, le rôle de Nathan et sa contribution. **Article** : développer une question, une méthode, une expérience ou un prototype. **Compétence** : décrire une pratique et renvoyer à des exemples. Un article n’a pas besoin d’un projet parent.

Le contenu existant est conservé dans ses fichiers actuels. Le nom historique `content_cases_...` ne limite pas les sujets des futurs articles : le manifeste accepte aussi une clé `articles`.

## Créer un article

Exécuter `npm run new:article -- navigation-sans-marqueur`. La commande crée un fichier en brouillon, sans date ou résultat inventé, et refuse d’écraser un fichier existant. Renseigner les deux langues, puis `published: true`.

Champs utiles :

| Champ | Usage |
| --- | --- |
| `id` | Identifiant URL unique, minuscules et tirets |
| `published` | `false` pour exclure un brouillon de toutes les pages |
| `type` | `article`, `case-study`, `note` ou `devlog` |
| `category` | `design`, `qa`, `production` ou `notes` |
| `projects` | Tableau d’identifiants de projets, ou `[]` pour un sujet indépendant |
| `title`, `abstract` | Objets `{ "fr": "...", "en": "..." }` |
| `date` | Facultatif, date réelle au format `YYYY-MM-DD` |
| `timeframe` | Facultatif, période du travail présenté, sans la confondre avec la publication |
| `tags` | Tableau de sujets |
| `cover` | Image locale, par exemple `assets/projects/mon-image.jpg` |
| `article` | Versions `fr` et `en` du texte structuré |

Chaque version contient `intro` (tableau de paragraphes), `sections` et éventuellement `blocks` et `closing`. Une section possède un `heading`, des `paragraphs`, éventuellement `bullets`, `media` et `blocks`. Les paragraphes sont du texte brut : le générateur les échappe, il n’exécute pas de HTML saisi dans les fiches.

Exemple de section :

```json
{
  "heading": "Observer avant de corriger",
  "paragraphs": ["Le contexte...", "La décision..."],
  "bullets": ["Un constat concret", "Un compromis"],
  "media": {
    "images": ["assets/projects/avant.jpg", "assets/projects/apres.jpg"],
    "caption": "Comparaison des deux itérations"
  }
}
```

Blocs complémentaires : `callout` avec `title` et `text`, `quote` avec `text` et `author`, `image` avec `src` et `caption`, `code` avec `text`. Le sommaire et le temps de lecture sont calculés automatiquement. Un article apparaît sur ses projets associés sans avoir à éditer ces projets.

## Créer un projet

Exécuter `npm run new:project -- mon-jeu`. Compléter `title`, `role`, `summary`, `tags`, `overview`, `contribution` en FR/EN. Utiliser `facts` pour les quelques repères rapides et `projectInfo` pour les informations détaillées. `images.cover` est obligatoire ; `images.gallery`, `links` et `trailer` sont facultatifs. Passer `published` à `true` après relecture.

L’ordre dans `content_manifest.json` est l’ordre éditorial. Le premier projet est mis en avant sur l’accueil. `homeProjectLimit` et `homeArticleLimit` dans `site.json` contrôlent le nombre de cartes affichées ; les pages de collection conservent la liste complète.

## Séparer les accroches du texte long

`content/editorial.json` est facultatif pour une nouvelle fiche. Il permet d’écrire une `cardSummary` et, pour un article, un `cardTitle`, tous deux bilingues, sans changer le titre de référence ou le texte complet. Sans surcharge, la carte utilise les champs de la fiche. Le champ `category` peut être défini directement dans la fiche du projet.

## Images

Déposer des JPG, PNG ou WebP locaux dans `assets/`. Conserver des fichiers sources de qualité : le build crée et réutilise des variantes de taille adaptée. Éviter d’insérer des URL d’images tierces : elles ne sont pas optimisées ni nécessaires au fonctionnement du site. Les anciennes icônes d’outils hébergées par Simple Icons ne sont plus chargées ; leurs libellés restent présents dans les compétences.

Les galeries s’ouvrent en lightbox et restent de simples liens vers les images sans JavaScript. Les bandes-annonces restent des liens externes : aucun lecteur ou tracker tiers n’est chargé automatiquement.

## Vérifier avant publication

Exécuter `npm run build && npm run check`, puis relire la fiche dans les deux langues, sur téléphone et en ambiance nuit. Contrôler particulièrement les dates, les noms de rôles, les liens externes et les droits de diffusion des visuels. Les tests techniques ne valident pas ces éléments éditoriaux.

## Modifier l’apparence

Les variables en tête de `src/style.css` contrôlent les couleurs, les espacements et la typographie. Les illustrations et le contact se modifient dans `content/site.json`. Ne pas éditer `dist` : il est régénéré à chaque build. Les polices sont des familles système, sans fichier de police à héberger.

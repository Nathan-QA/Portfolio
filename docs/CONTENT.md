# Ajouter et maintenir le contenu

## L’accueil

`content/site.json` centralise le texte de l’accueil, les coordonnées, les sélections et les résumés éditoriaux.

`featuredProjects` donne les identifiants des projets à afficher sur l’accueil, dans l’ordre. Le premier reçoit le grand format. `featuredArticles` choisit les trois articles du carnet mis en avant. Une liste vide utilise la sélection par défaut.

Les archives affichent tous les contenus publiés. Les articles de l’archive sont ordonnés par `order` lorsqu’il est renseigné, puis par date décroissante et identifiant. La sélection de l’accueil est indépendante de cet ordre.

## Un nouvel article

```sh
npm run new -- article une-question-de-guidage
```

Trois fichiers sont créés dans `content/articles/` : un fichier JSON de métadonnées et deux textes Markdown, FR et EN. L’identifiant doit contenir seulement des minuscules, chiffres et tirets. Le script refuse d’écraser un fichier existant.

Exemple de métadonnées :

```json
{
  "id": "une-question-de-guidage",
  "published": false,
  "title": { "fr": "Une question de guidage", "en": "A question of guidance" },
  "summary": { "fr": "Le sujet en une ou deux phrases", "en": "The topic in one or two sentences" },
  "categories": ["level-design"],
  "projects": ["distant-shore-bretagne"],
  "tags": ["Guidage", "Playtest"],
  "cover": "assets/projects/mon-image.jpg",
  "body": { "fr": "une-question-de-guidage.fr.md", "en": "une-question-de-guidage.en.md" }
}
```

La date est facultative, au format `YYYY-MM-DD`. Ne l’ajouter que pour une vraie date de publication. Les anciennes études affichent une période de travail, pas une date de publication inventée.

`projects` accepte plusieurs identifiants ou une liste vide pour un article indépendant. Les catégories prévues sont `level-design`, `qa`, `production` et `explorations`. Les filtres sont construits à partir des catégories réellement utilisées.

`cardTitle` permet un titre de carte plus court que le titre de l’article. Les deux peuvent être bilingues. `summary` fournit le résumé court. Le temps de lecture et le sommaire sont générés automatiquement.

Passer `published` à `true` lorsque les contenus sont prêts. Le brouillon est exclu du site, du sitemap et des collections. Pour retirer un contenu déjà mis en avant, enlever aussi ses références dans `site.json` et les contenus liés : la construction signale les références cassées au lieu de publier des liens morts.

## Markdown pris en charge

Le moteur utilise volontairement un sous-ensemble léger, pas un interpréteur CommonMark complet : paragraphes, titres, gras, italique, code, listes simples, citations, séparateurs, liens et images. Pas de HTML brut exécutable, de tableaux Markdown ni de listes imbriquées.

```md
Une introduction, avec **un point important** et *une nuance*.

## Le point de départ

Un paragraphe et un [lien](https://example.com).

- Premier constat
- Deuxième constat

![Description de l’image](assets/projects/mon-image.jpg "Légende de l’image")

> Une citation courte ou un principe de travail

## Ce que j’en retiens

Une conclusion.
```

Chaque image doit occuper sa propre ligne. Utiliser des chemins `assets/...`, pas `../../...`. Les images locales sont redimensionnées et converties en WebP au build. Un fichier image manquant bloque la construction avec son chemin dans l’erreur.

Le premier titre de page vient des métadonnées. Les titres de niveau 2 du texte alimentent le sommaire. Les identifiants de titres répétés sont différenciés automatiquement.

## Les études de cas existantes

Les trois études migrées restent dans leur format structuré d’origine, avec `article.fr` et `article.en`. Leurs sections, listes, images, légendes, encadrés et conclusions sont affichés dans le nouveau lecteur. Il n’est pas nécessaire de les convertir en Markdown pour modifier une phrase.

Les anciens textes sont conservés, pas réécrits pour inventer des résultats ou une expérience. La relecture des dates, rôles, formulations et limites de confidentialité reste éditoriale.

## Une nouvelle fiche projet

```sh
npm run new -- project mon-projet
```

Compléter le JSON généré : titre, rôle, résumé, visuel de couverture, présentation et contributions. `facts` contient une liste bilingue de couples `label` / `value`. `projectInfo` contient les informations du jeu, dont moteur, studio et plateformes. `images.gallery` reçoit les chemins des captures.

Les articles sont liés au projet avec leur propre champ `projects`. Ils apparaissent alors automatiquement dans la section carnet de la fiche projet. Il n’est pas nécessaire de recopier la liste sur chaque page.

Un identifiant publié devient une URL. Éviter de le renommer sans prévoir une redirection : changer le titre visible n’oblige pas à changer l’identifiant.

## Traductions, images et CV

Chaque texte éditorial prévu bilingue utilise `fr` et `en`. Une traduction absente peut retomber sur le français : ce mécanisme de secours ne constitue pas une traduction anglaise. Le script de création propose les deux fichiers pour rendre ce besoin visible.

Les images peuvent être PNG, JPEG, WebP ou AVIF. Garder une résolution suffisante pour les captures en grand format. L’optimisation est automatique, il n’est pas nécessaire de fabriquer les différentes tailles à la main.

Le chemin du CV se règle dans `content/site.json`. Le fichier livré reste le CV français du dépôt, sans modification de son contenu. Adapter le libellé anglais et la configuration avant d’ajouter un CV anglais distinct.

## Personnaliser les effets

Les couleurs, espacements et dimensions du cadre sont dans les variables de `src/site.css`. Les illustrations sont toujours les fichiers `bannerD`, `bannerN`, `leaf_right` et `leaf_rightN` du dossier `assets`.

Le déplacement de l’arbre et les particules sont dans la dernière partie de `src/site.js`. Le nombre de particules est limité, réduit sur petit écran et leur animation est suspendue quand l’onglet est caché. Le réglage de réduction des mouvements de l’appareil reste prioritaire sur le bouton du site.

Les anciens logos d’outils et drapeaux chargés depuis des CDN ne sont plus affichés dans les compétences. Les noms, descriptions et exemples locaux restent présents. Les références historiques restent dans le JSON, mais ne créent plus de requête vers ces services.

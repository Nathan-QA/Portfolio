# Direction de la refonte

## Une entrée illustrée, pas un écran à traverser

Le cadre jour/nuit reste l’ouverture du portfolio, mais l’identité et les deux chemins principaux sont lisibles à l’intérieur du cadre dès l’arrivée. Le visiteur n’a plus besoin de franchir une intro pour comprendre où il se trouve.

La palette reprend l’aquarelle avec un papier clair, des verts sourds, une couleur terre cuite et une nuit bleu-vert. Les titres serif, les filets, la numérotation des sections et les petits repères évoquent un carnet, sans simuler une interface de jeu difficile à lire.

L’arbre dépasse du cadre et accompagne le défilement à droite. Les particules existent aussi sur mobile, en quantité réduite. Elles ne capturent jamais le pointeur. Aucun scroll forcé, curseur remplacé ou son automatique n’a été ajouté.

## Trois niveaux de lecture

L’accueil est une sélection. Les projets ont un rôle clairement visible, un résumé court et une carte entièrement cliquable. Le premier projet est mis en avant sans rendre les autres secondaires au point d’être cachés.

Le carnet est visuellement différent de la galerie de projets : il présente des sujets et des retours d’expérience, pas une seconde liste de jeux. Chaque article a son URL, un sommaire, une largeur de lecture limitée, un temps de lecture et des liens contextuels.

Les compétences de l’accueil expliquent trois façons de contribuer. Le catalogue détaillé est une page séparée, avec des accordéons et des liens vers les preuves. Il n’impose pas son volume à tous les visiteurs.

## Navigation et retour

La navigation principale reste disponible en haut. Les projets, articles et compétences détaillées sont de vraies pages statiques. Rechargement, onglet séparé, copie du lien et historique ne dépendent plus d’une grande modale.

Les anciennes adresses `#project=...`, `#kase=...`, `#cases` et `#about` sont prises en charge. Les galeries d’images conservent une lightbox native, fermable au clavier, avec restitution du focus. Sans JavaScript, leurs liens ouvrent directement les images.

Le contact utilise une adresse directe plutôt qu’un formulaire et une authentification non configurés. Le CV est accessible sans modale supplémentaire.

## Maintenance

Les contenus restent distincts des templates et des interactions. Une nouvelle entrée est détectée depuis son dossier, sans ajouter une route à la main. Le build génère les pages FR/EN, le sitemap et les variantes d’images, puis signale les liens internes invalides.

Aucune nouvelle histoire professionnelle, statistique ou étude de cas n’a été inventée pour remplir la mise en page. Les phrases d’accroche et résumés de cartes sont des propositions éditoriales modifiables dans `content/site.json`.

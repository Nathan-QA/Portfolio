# Refonte éditoriale du portfolio

## Identité conservée

Le paysage, le cadre, les versions jour/nuit, l’arbre et les feuilles proviennent des ressources d’origine. L’interface prolonge cette direction avec une palette papier, vert et terre cuite le jour, ardoise et crème la nuit, une texture légère et une typographie éditoriale. Aucun portrait, nouveau visuel généré ou remplacement des images de projets n’a été introduit.

L’arbre accompagne le défilement dans la marge droite sans intercepter les événements. Les feuilles utilisent les sprites d’origine. L’animation se met en pause dans un onglet masqué, respecte les préférences système et possède un contrôle explicite. Sur téléphone, l’ornement est limité à l’ouverture et les particules sont désactivées pour ne pas encombrer la lecture.

## Hiérarchie

L’accueil présente une intention courte, un accès direct aux projets, les projets avec leur rôle, le journal puis trois familles de compétences reliées à des exemples. Les informations de contexte et les contributions longues restent sur les pages de projet. Les trois études de cas existantes sont disponibles intégralement dans le journal. Les 29 compétences détaillées restent accessibles dans un répertoire dédié, avec divulgation progressive.

Les accroches courtes des cartes sont séparées du contenu long, les listes peuvent grandir et les relations article/projet se résolvent automatiquement. Les mentions légales quittent le parcours principal et restent accessibles dans le pied de page.

## Navigation

Les projets et articles ont des pages HTML distinctes, une URL stable et des métadonnées propres. Les boutons du navigateur, le rechargement, les liens copiés et les ancres restent utilisables. Les anciennes routes par fragment sont redirigées lorsqu’elles sont connues. Le menu reste disponible, sa version mobile est actionnable au clavier et les sections actives sont indiquées.

Les articles proposent un sommaire, une progression de lecture, leurs projets associés et un retour au journal. Les collections proposent recherche et filtres avec état conservé dans l’URL. Les galeries disposent d’une lightbox native et d’une restitution du focus à la fermeture.

## Maintenance

Le rendu est statique et dépend d’un générateur Node. Les contenus, les composants, les styles et les interactions sont séparés. Les fiches bilingues existantes sont réutilisées, les nouvelles fiches peuvent être créées en brouillon par commande. Aucun backend, CMS imposé, service de messagerie ou identifiant tiers n’est requis.

La refonte ne met pas à jour les dates ou missions à partir de conversations privées. Elle ne publie pas FCNP ni d’autres projets absents du dépôt existant. La chronologie contradictoire présente dans les anciens fichiers de présentation n’a pas été recopiée comme une affirmation nouvelle ; le CV existant reste consultable.

## Publication et retour arrière

Le code est proposé sur une branche isolée. La branche principale n’est ni remplacée ni fusionnée automatiquement. Les originaux restent dans `assets`, l’historique Git conserve la version précédente. Les vieux fichiers racine et modules applicatifs ne font plus partie de la nouvelle architecture : le site publié est le dossier `dist`.

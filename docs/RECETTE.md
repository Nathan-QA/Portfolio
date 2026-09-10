# Recette technique

Les résultats automatisés détaillés sont produits par GitHub Actions et Playwright. Les tests techniques ne constituent pas une certification d’accessibilité ni une validation éditoriale du contenu.

## Vérification statique

Le script `npm run check` contrôle toutes les pages FR/EN : existence des liens locaux et ancres, absence d’identifiants dupliqués, une seule balise H1, dimensions et alternatives d’images, métadonnées canoniques et linguistiques, absence des anciennes intégrations tierces non configurées.

## Parcours navigateur

La suite Chromium contrôle l’accueil, les URL directes, le retour navigateur, les ancres après rechargement, les anciens liens, les changements de langue et d’ambiance, le menu mobile, les filtres et la recherche, la lightbox au clavier, les compétences liées, les préférences de mouvement et l’absence de JavaScript. Les largeurs 320, 390, 768, 1024 et 1440 px sont vérifiées sur plusieurs types de pages.

Des captures sont générées en ambiances jour/nuit, sur téléphone, sur une page d’article et après défilement. Elles servent à une inspection humaine, pas à un test de comparaison pixel à pixel.

## Limites

Safari, Firefox et les appareils physiques ne font pas partie de cette exécution automatisée. Le bouton d’envoi d’email ouvre le logiciel de messagerie configuré chez le visiteur ; aucun envoi réel n’est déclenché par les tests. Les liens Steam, LinkedIn et autres destinations externes sont conservés sans prétendre vérifier en permanence leur disponibilité. Le CV est le document français d’origine.

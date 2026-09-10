# Vérifications de la livraison

Date : 10 septembre 2026

Ce document conserve le bilan de la livraison locale initiale. Les résultats de l’intégration GitHub sont disponibles dans le workflow `Portfolio review` associé à la branche `feat/portfolio-carnet`.

## Résultats de la livraison locale

- Construction réussie : 24 pages FR/EN, plus la page 404, à partir de 4 projets et 3 études de cas
- 15 tests Node exécutés, 15 réussis : données, routes, validation des relations, brouillons, Markdown, sécurité des liens, intégrité des pages et réponses HTTP
- Les 24 routes construites répondent en HTTP 200 avec du HTML ; une route inconnue renvoie un vrai statut 404
- 24 vérifications de mise en page dans Chromium : 6 modèles à 320, 390, 768 et 1 440 pixels, sans débordement horizontal ni image attendue manquante, un titre principal par page
- 14 interactions vérifiées : jour/nuit, arbre au scroll, pause des animations, préférence de mouvement réduit, menu mobile au clavier, Échap et restauration du focus, recherche et filtres, état vide, réinitialisation, galerie et navigation clavier
- 8 vérifications supplémentaires du header entre 320 et 1 440 pixels : un seul accès au CV visible dans le header ou son menu ouvert, sans débordement

Les rapports bruts de cette livraison sont dans `docs/qa/`. Les 15 tests Node ont également été relancés avec succès avant l’envoi des sources sur GitHub.

## Méthode et limites de la livraison locale

L’environnement initial bloquait la navigation des navigateurs vers un serveur local. Les rendus et interactions ont donc été testés dans Chromium en injectant le HTML généré, ses styles, son JavaScript et ses images locales dans le document. Ce n’est pas une navigation de bout en bout depuis l’adresse du site.

Les écritures d’URL des filtres ont été enregistrées avec un double de test, pas validées dans un véritable historique navigateur. Les routes HTTP ont été vérifiées séparément par des requêtes Node.

La suite Playwright Chromium/WebKit n’avait pas été exécutée lors de la livraison locale. Elle est maintenant incluse dans le workflow GitHub Actions. Consulter le résultat effectif du run : sa présence dans le dépôt ne signifie pas que les scénarios passent.

Aucun résultat Lighthouse, audit complet de conformité WCAG, test Safari réel ou validation sur téléphone physique n’est revendiqué. Les tests axe automatisés ne remplacent pas un audit manuel.

Le presse-papiers, les liens externes, le client e-mail et l’ouverture du lanceur Windows ne sont pas validés dans un environnement utilisateur réel.

La construction locale initiale utilisait Sharp 0.34.1 et Node 22.16.0. Le ZIP inclut son `dist/`, mais GitHub ne versionne que les sources nécessaires pour le régénérer. Les dépendances directes sont épinglées dans `package.json`.

## Contenus et assets

Les 4 fiches projet, les 3 études de cas et le catalogue des compétences sont repris depuis les fichiers du dépôt. Les détails historiques ne sont pas une certification de leur actualité. Les textes courts de l’accueil et des cartes sont une nouvelle couche éditoriale, séparée des contenus longs conservés.

Le CV français existant est conservé, également depuis l’interface anglaise. Les logos de compétences hébergés sur des services externes ne sont plus affichés ; leurs noms, descriptions, exemples et preuves locales restent disponibles. Les textes et images historiques n’ont pas été complétés par des réalisations inventées.

Les images sources utilisées pour la construction locale totalisent environ 55,81 Mio. L’ensemble de toutes leurs variantes responsive totalise environ 20,42 Mio. Ce dernier nombre est le stockage des images sur tout le site, pas le poids de chargement d’une page.

## Intégration GitHub

Source initiale : `Nathan-QA/Portfolio`, commit `d9bce83cad8b259d68fc51c4a387bfd828196c82`.

La branche `feat/portfolio-carnet` avait été préparée au commit `310c28f7146d761ab320df53ec55d715b6b139f6`. Les sources du ZIP Carnet sont intégrées à partir de cette base, avec documentation actualisée et configuration de publication Netlify ajoutée. L’autre proposition sur `refactor/editorial-portfolio` reste indépendante.

Aucune fusion dans `main` n’est effectuée par cette intégration. Le patch de la livraison initiale ne doit plus être appliqué sur la branche mise à jour.

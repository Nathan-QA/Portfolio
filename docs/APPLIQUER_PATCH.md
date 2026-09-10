# Récupérer la refonte intégrée

La refonte Carnet est désormais intégrée sur `feat/portfolio-carnet`. Il n’est plus nécessaire d’appliquer le patch livré précédemment.

Depuis un clone existant, conserver ou committer les modifications personnelles avant de changer de branche :

```sh
git status
git fetch origin
git switch feat/portfolio-carnet
git pull --ff-only
npm install
npm run build
npm test
npm run preview
```

`git pull --ff-only` refuse de réécrire un historique divergent. En cas d’échec, examiner les changements locaux au lieu de forcer.

## Ancien patch

`Nathan-Portfolio-Refonte.patch` ciblait le commit préparatoire `310c28f7146d761ab320df53ec55d715b6b139f6`, avant l’intégration du code. Il reste un artefact de cette livraison, pas une étape à rejouer sur la branche actuelle.

Les assets originaux et le dossier `tmp-review` du dépôt sont conservés. `dist/`, les caches, les dépendances et les captures de test ne sont pas versionnés : le build et le workflow les régénèrent.

Aucune fusion dans `main` n’est déclenchée par ces commandes. La mise en production est indépendante de la récupération de la branche.

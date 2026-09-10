# Finitions visuelles, sans nouvelle direction artistique

Réponse au retour : version trop austère, articles trop petits, manque de finitions
Base : ab907f6, branche fix/ux-main-faithful, PR 4 en brouillon
Aucune fusion sur main

## Ajustements

Les articles retrouvent de grands panneaux illustrés : image proche de la moitié de la carte, cadre intérieur, surface crème existante, titres et texte agrandis
Sur mobile, la grande illustration précède le texte, au lieu d'une petite vignette latérale
Les cartes projets retrouvent du volume, des coins adoucis, un filet intérieur et des survols progressifs
Les sections respirent davantage, avec une hiérarchie et des espacements communs
Les compétences se regroupent dans une seule surface, le contact reste direct
Aucun nouveau slogan, paragraphe de présentation, bouton de conversion ou CTA dupliqué
Positionnement Production / QA / Level Design et module de trailers au survol conservés

La feuille ux.css est modifiée directement, sans nouvelle feuille de surcharges
style.css, js/config.js, les contenus, les illustrations et le code du décor sont inchangés par cette passe

## Navigation dans les articles

Le sommaire calcule sa cible dans les coordonnées de mise en page et fait défiler uniquement la modale
Cela évite de dépendre du rectangle transformé pendant l'animation d'ouverture et de déplacer les ancêtres
Référence : https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo

## Validation

La suite existante est conservée
finish.spec.mjs ajoute des vérifications de taille des illustrations et du texte, de disposition mobile, de focus clavier et d'alignement du sommaire
Les captures attendent le décodage des images locales, pour ne pas valider des images encore vides
Les résultats définitifs sont ceux du run GitHub Actions associé au commit
Les tests YouTube existants utilisent une simulation de l'API et ne valident pas la disponibilité du service externe

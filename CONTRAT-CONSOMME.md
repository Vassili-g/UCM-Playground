# Contrat consommé par le Playground

Le Playground accepte exactement le schéma **10.3**. Les bornes
`VERSION_CONTRAT_MINIMALE` et `VERSION_CONTRAT_MAXIMALE` de
`scripts/version-contrat.mjs` sont égales ; toute autre version est refusée.

L’Exporter écrit actuellement le schéma 11.0. Le Playground reste donc sur les
quatre contrats Figma 10.3 présents dans `src/components/` tant que ces
composants n’ont pas été réexportés et que ses lecteurs n’ont pas été adaptés.

## Forme lue

Un contrat 10.3 fournit notamment :

- `meta.contractVersion`, la traçabilité Figma, `warnings`, `diagnostics` et la
  couverture portable ;
- `props`, les définitions publiques de bindings et les règles d’intention ;
- `variants`, qui énumère uniquement les combinaisons présentes et référence
  une vue par `view` et, lorsqu’il existe, un échantillon par `sample` ;
- `variantViews`, dont chaque entrée porte directement `structure`,
  `typography`, `composes`, `icons` et `paintPlacements` ;
- `structure`, projection de référence et propriétaire des dimensions par
  taille ainsi que de l’ordre des axes ;
- `rendering`, `icons`, `textStyles` et `composes` pour les vocabulaires
  partagés par le composant ;
- `samples`, contenu de maquette indicatif, avec `args`, textes, surcharges,
  remplacements d’instances et compositions imbriquées ;
- `tokensUsed`, index fourni par ce schéma et contrôlé contre les références
  normatives réellement présentes dans le contrat.

Une vue exacte ne reçoit aucun héritage et n’est jamais fusionnée avec la vue
de référence. Les chemins de peintures ciblent la racine avec `[]` ou un slot
publié avec un chemin non vide.

## Lecture par les contrôles

`validation-contrat.mjs` valide la forme attendue. `variant-views.mjs` résout la
vue exacte. `validation-graphe-contrats.mjs` contrôle les dépendances et
`validation-echantillons.mjs` vérifie que les adresses indicatives joignent les
contrats concernés. `references-token.mjs` exclut `samples` et `meta` lorsqu’il
relève les références normatives.

Le JSON Schema copié dans `schema/` aide l’éditeur et fait l’objet d’un test
d’accord. Il ne remplace pas ces validateurs et ne contrôle ni les renvois
internes ni la forme des références de tokens.

## Politique de compatibilité

Une version n’est acceptée qu’après adaptation de tous les lecteurs concernés,
réexport réel des contrats Figma, copie du schéma correspondant, reconstruction
de composants représentatifs et comparaison de leur rendu avec Figma. Les
constantes de version changent en dernier.

Un contrat plus ancien demande un réexport depuis Figma. Un contrat plus récent
demande d’abord une adaptation du Playground ; le réexport seul ne peut pas le
rendre lisible.

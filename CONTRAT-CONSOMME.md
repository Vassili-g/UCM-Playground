# Contrat consommé par le Playground

Le Playground accepte exactement **un** schéma, celui que déclarent
`VERSION_CONTRAT_MINIMALE` et `VERSION_CONTRAT_MAXIMALE` dans
`version-contrat.mjs` du kit (`@ucm-kit/core/lecteurs`). Ce numéro n'est plus
écrit dans ce repository du tout : il arrive avec le paquet, et le monter est un
changement de dépendance. Les deux bornes sont égales ; toute autre version est refusée, majeure
comme mineure.

Les quatre contrats de `src/components/` sont des exports Figma réels. Ils
exercent les chemins de peintures, les pistes FIXED de grille, les côtés
tokenisés clairsemés et les mesures de cellules sous une piste qui hug.

## Forme lue

Un contrat accepté fournit notamment :

- `meta`, avec `contractVersion`, `exportedAt`, la traçabilité Figma,
  `coverage` et, quand l’export a quelque chose à dire, `diagnostics` ;
- `props`, `figmaVariantLabels` et, le cas échéant,
  `propertyBindingDefinitions`, les définitions publiques de l’API visuelle ;
- `variants`, qui énumère uniquement les combinaisons présentes et référence
  une vue par `view` et, lorsqu’il existe, un échantillon par `sample` ;
- `variantViews`, dont chaque entrée porte jusqu’à cinq renvois — `structure`,
  `typography`, `composes`, `icons`, `paintPlacements` — vers les catalogues
  `viewStructures`, `viewTypographies`, `viewComposes`, `viewIcons` et
  `viewPaintPlacements` ;
- `structure`, projection de référence et propriétaire des dimensions par
  taille ainsi que de l’ordre des axes ; elle renvoie elle aussi au catalogue
  des structures ;
- `rendering`, `icons`, `textStyles`, `composes`, `stateModel` et `intent` pour
  les vocabulaires partagés par le composant ;
- `samples`, contenu de maquette indicatif, avec `args`, textes, surcharges,
  remplacements d’instances et compositions imbriquées.

Le contrat ne publie rien qui se dérive de lui : ni index de ses tokens
(`tokensUsed`), ni miroir en texte brut de ses diagnostics (`meta.warnings`).
`references-token.mjs` reconstitue l’index des références en balayant le
contrat, `samples` et `meta` exclus ; `avertissements-export.mjs` lit
`meta.diagnostics`, et retombe sur `meta.warnings` pour un contrat d’un schéma
antérieur.

Une clé qui vaudrait `null`, `{}` ou `[]` n’est pas écrite : son absence dit
« rien à publier », jamais « inconnu ». Sous un dictionnaire en revanche la clé
est une donnée et l’entrée survit à vide — `stateModel.states.default` vaut
`{}`.

Une vue exacte ne reçoit aucun héritage et n’est jamais fusionnée avec la vue
de référence. Les chemins de peintures ciblent la racine avec `[]` ou un slot
publié avec un chemin non vide.

## Lecture par les contrôles

`validation-contrat.mjs` valide la forme attendue, et refuse un contrat qui
publierait encore `tokensUsed` ou `meta.warnings`. `variant-views.mjs` résout la
vue exacte et ses cinq renvois. `validation-graphe-contrats.mjs` contrôle les
dépendances et `validation-echantillons.mjs` vérifie que les adresses
indicatives joignent les contrats concernés. `references-token.mjs` exclut
`samples` et `meta` lorsqu’il relève les références normatives.

Le croisement `nonListes` / `fantomes` de `check-contract.mjs` survit mais ne
s’arme plus : il n’a d’objet que si un contrat publie un `tokensUsed`. Le
contrôle d’existence, lui, reste entier — c’est lui qui protège le design.

Le JSON Schema publié par le paquet (`@ucm-kit/core/schema`) aide l’éditeur.
Il ne remplace pas ces validateurs et ne contrôle ni les renvois internes ni la
forme des références de tokens.

## Politique de compatibilité

Une version n’est acceptée qu’après adaptation de tous les lecteurs concernés,
réexport réel des contrats Figma, copie du schéma correspondant, reconstruction
de composants représentatifs et comparaison de leur rendu avec Figma. Les
constantes de version changent en dernier.

Un contrat plus ancien demande un réexport depuis Figma. Un contrat plus récent
demande d’abord une adaptation du Playground ; le réexport seul ne peut pas le
rendre lisible.

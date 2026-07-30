---
name: consommer-contrat
description: Reconstruire un composant React de validation depuis son contrat UCM. À charger avant un test froid ou toute modification du rendu des tokens, états, focus, icônes ou règles d’usage. Ce workflow évalue le contrat ; il ne génère pas le code de production.
---

# Consommer un contrat de composant

> **Avant tout.** Ce workflow ne s’applique qu’à une reconstruction **explicitement
> demandée**, qui écrit un composant depuis zéro. Il n’autorise jamais à modifier
> un composant existant, pas même pour faire passer un garde-fou : un `.tsx` est
> le livrable du développeur et la preuve du test froid. Devant un contrôle
> rouge, on rapporte. Voir les interdits absolus dans
> [`AGENTS.md`](../../../AGENTS.md).

Le contrat décrit la partie visuelle. Lire `props`, `structure`, `stateModel`,
`rendering`, `icons`, `intent` et `tokensUsed`. Ne compléter que l’API
applicative : événements, accessibilité et attributs natifs.

## 0. Écrire le composant contre le contrat

Le composant **n’importe pas son `.contract.json` et ne l’interprète pas au
runtime** (`../UCM-Exporter/CONCEPT.md`, « Une information, un propriétaire »).
Il écrit ses valeurs — références de tokens, défauts, noms d’icônes — et le
contrat sert ensuite à vérifier que ce sont les bonnes.

Cette vérification n’est possible que si ces valeurs sont **énumérables**. Deux
formes la rendent impossible et sont donc à proscrire :

- **un chemin assemblé à l’exécution** —
  `` `{components.button.colors.${color}.${variant}}` `` : il faudrait exécuter
  le code pour savoir ce qu’il produit, et il fige la convention de nommage du
  design system dans une fonction. Écrire les références en toutes lettres, même
  au prix d’une table ;
- **une donnée du contrat remplacée par une règle** — deviner quel rôle se peint
  à partir de la variante, câbler une correspondance sévérité → icône. La donnée
  existe dans le contrat ; une règle qui la reproduit ne se compare à rien.

Le piège commun : un tel composant rend **exactement** la bonne chose le jour où
il est écrit. C’est le lendemain, quand le design change, qu’il diverge en
silence.

## 1. Tokens

Une référence de token garde la forme `{chemin.du.token}`. La passer telle
quelle à `tokenVar(ref)`, qui produit `var(--chemin-du-token)`.

Ne jamais écrire de couleur, dimension, famille ou poids en dur. Une donnée
visuelle absente du contrat ne s’invente pas.

## 2. Props et intention

- Exposer uniquement les choix visuels déclarés dans `props`.
- Importer les unions générées depuis
  `src/generated/contracts/<IdentifiantCode>.ts`.
- Appliquer les valeurs `default`.
- Respecter `intent.do`, `intent.dont`, `intent.pairs` et les descriptions par
  valeur.

## 3. Variantes et états

`structure.variantAxes` donne l’ordre de lecture de `variantTokens` et
`variantStrokes`. Chaque feuille décrit un état complet : un rôle absent ne
doit pas être repris depuis `default`.

`rendering.roles` indique comment peindre les rôles :

- `background` → `background-color` ;
- `foreground` et `icon` → `color` ou `fill` ;
- `border` → bordure ;
- `ring` extérieur → `box-shadow`.

Ce sont des propriétés **candidates**. Ce qui compte est le rôle peint et le
token employé ; la propriété CSS exacte appartient au développeur, et aucun
contrôle ne la vérifie.

Un stroke avec `width: null` ne se rend pas : le navigateur ne doit pas
inventer une épaisseur.

`stateModel` associe les états aux sélecteurs CSS et donne leur priorité. En
production, utiliser ces pseudo-classes. Pour un test froid en styles inline,
suivre les mêmes états avec les événements Pointer et clavier.

### Focus

Si le contrat définit `focus → :focus-visible` :

1. le ring du contrat remplace le contour natif ;
2. il n’apparaît qu’au focus clavier ;
3. un test inline utilise
   `event.currentTarget.matches(":focus-visible")`.

Les événements Pointer couvrent souris et tactile. Ajouter les événements
clavier nécessaires à l’activation.

## 4. Icônes

Le contrat porte un nom d’icône opaque ; l’application le résout avec son kit.

- `icons.<clé>.slot` indique où rendre l’icône.
- `variants` limite sa présence à certaines combinaisons ; son absence signifie
  toutes les variantes.
- Plusieurs icônes peuvent partager un slot lorsqu’elles s’excluent selon un
  axe.
- Le booléen Figma contrôle la visibilité.
- Pour une icône `modifiable`, la prop runtime `<booléen>Name` choisit le nom ;
  `figmaName` sert de repli.
- `size` définit le carré occupé par l’icône, pas nécessairement la taille
  visible du glyphe.

Convention temporaire du playground :

```ts
const ICON_GLYPH_RATIO = 0.8;
const ICON_STYLE = "fa-regular";
```

Ces constantes appartiennent à l’adaptateur du design system jusqu’à leur
tokenisation. Elles ne doivent pas varier par composant.

## 5. Structure, dimensions et typographie

Utiliser les slots de `structure.children`. La typographie du slot `label`
fournit ses références de tokens.

Les dimensions (`gap`, `padding`, `radius`, taille du texte) vivent à **un seul
endroit, désigné par le contrat** : dans `structure.sizes[<taille>]` lorsqu’un
axe de tailles existe, et au niveau haut de `structure` sinon. Ne pas supposer
`sizes` : un composant sans axe de tailles n’en a pas, et l’y chercher rend un
composant sans espacement ni rayon.

De même, la profondeur de `variantTokens` vaut le nombre d’axes (§3) — trois
niveaux quand `state` en est un, deux quand `stateModel` vaut `null`.

`visibilityProp` masque le slot concerné. `visibilityTargets` décrit une cible
imbriquée par son `figmaPath` et ne doit pas masquer tout le slot direct.

Un slot `composes` rend le composant unifié nommé, jamais une copie de ses
internes.

## 6. Vérification

```sh
npm run check
npm run build
```

Comparer ensuite quelques variantes, états et combinaisons représentatifs avec
Figma. Si le résultat diverge, déterminer si l’information manque au contrat
ou si elle relève du code avant de modifier le format.

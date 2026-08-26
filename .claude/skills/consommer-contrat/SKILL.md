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

Le contrat décrit la partie visuelle. Lire `props`, `variants`, `variantViews`,
`structure`, `stateModel`, `rendering`, `icons`, `textStyles`, `intent` et
`tokensUsed`. Ne compléter que l’API applicative : événements, accessibilité et
attributs natifs.

`samples` **s’ajoute à cette liste pour le CONTENU** — texte des slots, props
des dépendances — et pour lui seul. La section 7 dit ce qu’il n’autorise pas.

## 0. Écrire le composant contre le contrat

Le composant **n’importe pas son `.contract.json` et ne l’interprète pas au
runtime** ([CONCEPT.md](../../../../UCM-Exporter/CONCEPT.md), « Une information,
un propriétaire »).
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

### Le contrat possède l’espace de noms des props

Les props du contrat forment la surface publique du composant. La plateforme
cible peut exposer un attribut du même nom — `title`, `color`, `size`,
`content`, `hidden` — avec un autre type : `props.title` est un **booléen de
visibilité**, alors que l’attribut HTML `title` est une infobulle, donc une
chaîne.

En cas de collision, **la prop du contrat l’emporte** et l’attribut natif
homonyme quitte la surface publique. Ne jamais renommer la prop, ne jamais
changer son type pour satisfaire la cible : ce serait rendre le contrat
invérifiable pour une contrainte qui ne lui appartient pas.

La soustraction se fait **mécaniquement**, jamais par une liste tenue à la
main — sinon elle sera fausse au prochain contrat :

```ts
interface ButtonContractProps {
  color?: ButtonColor;
  label?: boolean;
  /* … une entrée par prop du contrat … */
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {}
```

L’application garde ainsi tous les attributs natifs qui ne collisionnent avec
rien, et le consommateur n’a aucune liste à maintenir.

## 3. Variantes et états

`structure.variantAxes` donne l’ordre public des axes. À partir d’un contrat 8.0,
**ne jamais reconstruire leur produit cartésien** : `variants` énumère les
seules combinaisons réellement présentes. Chaque entrée porte :

- `values`, les coordonnées exactes ;
- `tokens` et `strokes`, deux feuilles complètes ;
- sa vue exacte — directement dans l’entrée en 8.0, ou dans
  `variantViews[variant.view]` à partir de 9.0.

Une vue 9.0 contient `structure`, `typography`, `icons` et `composes`; en 10.0,
elle contient aussi `paintPlacements`. Deux vues ne se complètent pas : aucun
héritage, aucun merge avec la vue de référence. Une clé absente ne doit donc
jamais être reprise depuis `default`.

Les contrats historiques antérieurs à 8.0 emploient encore les index imbriqués
de `structure`. Les lire dans l’ordre de `structure.variantAxes`; ne pas
réintroduire cette représentation dans un lecteur 9.0.

Les clés d’une feuille sont celles du design system. Cinq sont partagées par
tous les contrats :

- `background` → `background-color` ;
- `foreground` et `icon` → `color` ou `fill` ;
- `border` → `box-shadow`, **jamais** une bordure CSS ;
- `ring` extérieur → `outline` ou `box-shadow`.

**Ne pas présumer qu’il n’y en a que cinq.** Un composant qui peint plusieurs
surfaces expose ses propres clés — `scale-1`, `title`, `link` — et
`rendering.roles[clé].cssProperties` dit alors comment les peindre. Chercher la
clé dans `rendering.roles` répond dans tous les cas ; câbler la correspondance
laisse ces couleurs non rendues.

Ce sont des propriétés **candidates**. Ce qui compte est la couleur peinte et le
token employé ; la propriété CSS exacte appartient au développeur, et aucun
contrôle ne la vérifie.

À partir de la 10.0, `paintPlacements.fills[clé]` et
`paintPlacements.strokes[clé]` donnent tous les chemins exacts où appliquer la
clé. Un chemin vide cible la racine ; les autres se résolvent dans
`structure.children`. Ne jamais déduire la cible du nom de la clé. Pour un
contrat antérieur, cette localisation n'est pas disponible.

**Un contour ne prend aucune place.** Dans Figma un `stroke` ne pousse ni son
contenu ni ses voisins ; une `border` CSS, elle, élargit l'élément et décale
tout ce qui l'entoure. Rendre `border` en bordure donne donc la bonne couleur au
prix d'une mise en page fausse. `rendering.roles.border.cssProperties` dit
`box-shadow`, et `align` — publié sur chaque feuille de `strokes` — en donne la
forme :

| `align` | ombre |
|---|---|
| `inside` | `inset 0 0 0 <width> <color>` |
| `outside` | `0 0 0 <width> <color>` |
| `center` | la moitié de la largeur de chaque côté |

Une largeur détaillée par bord se rend en autant d'ombres. Quand plusieurs rôles
visent `box-shadow` sur un même calque — un `border` et un `ring` de focus — ils
se composent en **une** déclaration, séparées par des virgules, les `inset`
d'abord.

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

À partir d’un contrat 9.0, commencer par `variantViews[variant.view].icons` : ce bloc
dit quelles icônes appartiennent à cette combinaison. Le catalogue `icons` au
niveau haut reste l’union publique ; il ne doit pas réintroduire dans une
variante une icône absente de sa vue exacte.

- `icons.<clé>.slot` indique où rendre l’icône.
- `variants` limite sa présence à certaines combinaisons ; son absence signifie
  toutes les variantes.
- Plusieurs icônes peuvent partager un slot lorsqu’elles s’excluent selon un
  axe.
- Le booléen Figma contrôle la visibilité.
- `size` définit le carré occupé par l’icône, pas nécessairement la taille
  visible du glyphe.

### `policy` — qui choisit l’icône

- **`strict`** — l’icône ne peut pas être modifiée. Elle reste la même quoi
  qu’il arrive, et aucune prop runtime ne l’expose. Le contrat nomme la seule
  icône valide : elle se rend telle quelle.
- **`modifiable`** — le consommateur peut la remplacer. La prop runtime
  `<booléen>Name` choisit le nom, et `figmaName` sert de repli.

Les deux politiques se combinent librement avec `variants` : une icône `strict`
peut n’exister que sur certaines combinaisons — c’est le cas d’`Alert`, où
chaque sévérité impose la sienne — et une icône `modifiable` peut l’être tout
autant.

`variants` est le fait que le designer a arrêté. Ce n’est pas une hypothèse à
questionner ni à recouper : que deux valeurs d’un axe partagent le même glyphe
est une décision de design, pas une anomalie. Reprendre ces listes telles
quelles, sans en déduire de règle, est la seule lecture correcte.

Convention temporaire du playground :

```ts
const ICON_GLYPH_RATIO = 0.8;
const ICON_STYLE = "fa-regular";
```

Ces constantes appartiennent à l’adaptateur du design system jusqu’à leur
tokenisation. Elles ne doivent pas varier par composant.

## 5. Structure, dimensions et typographie

À partir d’un contrat 9.0, utiliser les slots de
`variantViews[variant.view].structure.children` et les usages de
`variantViews[variant.view].typography`. Chaque usage associe un `slotPath` à un
style ; `textStyles` relie ce style aux références de tokens. La `structure` de
niveau haut reste la projection de référence et porte les dimensions par taille,
mais elle ne remplace jamais l’arbre exact d’une variante.

Les contrats historiques antérieurs à 8.0 situent leurs usages dans
`structure.variantTypography`. Dans tous les cas, ne jamais déduire un chemin
de token du nom du text style.

Les dimensions (`gap`, `padding`, `radius`) vivent à **un seul
endroit, désigné par le contrat** : dans `structure.sizes[<taille>]` lorsqu'un
axe de tailles existe, et au niveau haut de `structure` sinon. Ne pas supposer
`sizes` : un composant sans axe de tailles n'en a pas, et l'y chercher rend un
composant sans espacement ni rayon.

En 10.0, un objet de `padding`, `radius` ou `stroke.width` peut ne citer que les
côtés réellement tokenisés. Appliquer chaque propriété présente séparément ;
ne pas compléter les côtés absents avec le premier token. Cette règle vaut à
toute profondeur, feuilles graphiques comprises.

Pour les contrats 4.5 historiques, la taille du texte reste dans
`structure.sizes`. En 4.6, toutes les propriétés typographiques viennent du
text style ; ni le slot ni `sizes` ne les recopient.

`structure.sizing` se lit en **trois** temps depuis la 5.2, jamais en deux :

- `fit-content` — le composant se limite à son contenu ;
- `stretch` — il occupe la place qu'on lui donne ; la technique appartient au
  code (`100%`, `flex: 1`, `stretch`), l'intention au contrat ;
- une référence `{…}` — le design system a nommé cette dimension : poser la
  variable du token en `width` / `height`, sans la traduire en pourcentage.

Le troisième cas est celui d'une tuile carrée, ou de tout composant dont la
taille est une décision du design system plutôt que du conteneur. Traiter ce
champ comme un enum de deux valeurs rendrait un tel composant étiré, ce qui
n'est pas ce que le contrat décrit.

`bounds` accompagne ce dimensionnement depuis la 5.3, sur `structure` comme sur
n'importe quel slot : `minWidth`, `maxWidth`, `minHeight` et `maxHeight`,
toujours des références de token à poser telles quelles. Une borne ne remplace
aucun des autres champs et ne s'en déduit pas — un slot peut porter à la fois
`flexGrow: 1` et un `maxWidth`, et c'est le cas courant. Ignorer `bounds` rend le
composant trop large sans qu'aucun contrôle ne s'en aperçoive.

Pour les anciens index imbriqués, leur profondeur vaut le nombre d’axes (§3).
Cette règle ne s’applique pas à `variants[].tokens`, qui est déjà une feuille.

Pour un auto-layout 4.4, recopier `structure.justifyContent` et
`structure.alignItems` sur le conteneur Flex. Chaque slot ne reçoit
`alignSelf` ou `flexGrow` que si le contrat le publie. Leur absence n'autorise
pas à choisir `flex-start`, `stretch` ou un remplissage : elle signifie que le
layer hérite du flux commun ou que la propriété n'est pas applicable.

Sous une grille 10.0, traduire `columnSizes` et `rowSizes` directement en
`grid-template-columns` / `grid-template-rows`. Une piste `…px` est l'exception
structurelle explicite aux dimensions tokenisées : la conserver telle quelle,
sans créer de token. `fit-content(100%)` et les unités `fr` se conservent aussi.

Pour centrer un slot qui remplit l'axe (`alignSelf: "stretch"`) tout en portant
un `bounds.maxWidth`, conserver le remplissage (`width: 100%`), appliquer la
borne, puis centrer la boîte (`align-self: center` ou marges automatiques). Ne
pas laisser une largeur propre du composant composé neutraliser le cadre qui le
porte. À l'inverse, une dépendance telle que TileLink garde toujours son propre
`structure.sizing` tokenisé.

`visibilityProp` masque le slot concerné. `visibilityTargets` décrit une cible
imbriquée par son `figmaPath` et ne doit pas masquer tout le slot direct.

Un slot `composes` rend le composant unifié nommé, jamais une copie de ses
internes.

À partir de 9.0, vérifier la séquence exacte dans
`variantViews[variant.view].composes`. Le `composes` global sert au graphe et à
l’union ordonnée à cardinalité maximale ; il ne prouve pas qu’une dépendance
existe dans toutes les variantes.

Attention à ne pas écraser un slot avec le composant qu'il contient. `composes`
sur le slot lui-même signifie que ce slot EST le composant. Un slot qui publie
un `layout` et des `children` est un **conteneur de ce contrat-ci** : il se rend
comme tel — un élément portant son flux — et le `composes` de son enfant se rend
dedans. C'est le cas du slot d'action d'une `Alert`, dont le cadre remplit la
hauteur pendant que le bouton garde la sienne.

Les fusionner en un seul élément met l'`alignSelf` du cadre sur le composant, où
son propre `structure.sizing` le neutralise : en CSS, une taille transversale
explicite annule `align-self: stretch`. Le cadre et son alignement disparaissent
sans que rien ne le signale.

## 6. Vérification

```sh
npm run check
npm run build
```

Comparer ensuite quelques variantes, états et combinaisons représentatifs avec
Figma. Si le résultat diverge, déterminer si l’information manque au contrat
ou si elle relève du code avant de modifier le format.

## 7. `samples` — le contenu que la maquette montre

`samples` dit ce que la maquette Figma MONTRE : le texte de chaque slot, la
visibilité réelle des slots optionnels, et les props que le composant applique à
chacune de ses dépendances.

**Une reconstruction à froid le lit, au même titre que le reste.** Un composant
qui l’ignore ne rend aucun texte et laisse chaque dépendance à ses défauts :
il ne ressemble à rien, et l’étape 6 — comparer à Figma — devient impossible à
tenir. Le contenu de l’échantillon devient donc le **défaut** des props
applicatives correspondantes, que l’appelant reste libre de remplacer. Chaque
variante a le sien : `variants[].sample` désigne l’entrée à employer, exactement
comme `variants[].view` désigne la vue exacte.

Ce que cette lecture ne change pas : `samples` n’est normatif pour rien. Aucun
contrôle ne le compare au code, il ne dégrade aucune couverture, et il ne
justifie jamais d’écrire une donnée de RENDU — token, couleur, dimension,
layout — qui manquerait ailleurs. Une donnée de rendu absente du contrat
normatif est un défaut de l’export, à corriger là-bas, jamais un trou à combler
avec l’échantillon.

Le rapport dit donc **ce que chaque source a produit** : la structure, les
tokens et la typographie viennent du normatif, le contenu de l’échantillon.
Sans cette séparation, on ne peut plus dire si la ressemblance avec Figma vient
du contrat ou du contenu qu’on lui a recopié.

Trois réserves de lecture :

- `args` est un **sous-ensemble**. Une clé absente ne veut pas dire que la
  maquette ne la pose pas. En cas de désaccord avec une donnée normative, la
  normative l’emporte.
- Une clé d’`args` qui ne correspond à aucune prop du contrat de la dépendance
  n’en devient pas une. L’axe d’états en est le cas courant : `state:
  "default"` décrit un état, pas une prop, et ne se rend pas.
- Le contenu d’une dépendance se lit **en deux temps** : ses défauts dans SON
  contrat — l’échantillon du variant que `args` désigne — et les écarts dans
  `overrides` et `swaps`. Un `overrides` vide signifie « la dépendance montre son propre
  contenu », pas « elle ne montre rien ». Une dépendance incapable de rendre son
  propre échantillon est un défaut de CE composant-là : on le rapporte, on ne
  recopie pas son contenu chez le parent.

Procéder comme un **zipper récursif**, toujours relativement au propriétaire
immédiat :

1. Résoudre le variant exact, sa vue et son `sample`. Appliquer ses `args` et
   ses `text` au composant courant.
2. Pour une dépendance racine du sample, partir de son `slotPath` dans la vue
   courante. Ne jamais chercher son nom dans tout l'arbre.
3. Pour les `composes` imbriqués d'une `SampleInstance`, parcourir la séquence
   des dépendances directes du composant propriétaire dans le même ordre, puis
   rapprocher `component` et `figmaLayer`. Deux occurrences homonymes restent
   deux positions distinctes ; ne jamais les fusionner dans une map par nom.
4. Ouvrir le contrat de la dépendance, choisir son variant avec les valeurs
   connues d'`args`, appliquer d'abord son propre sample, puis superposer les
   `args`, `overrides` et `swaps` fournis par le parent.
5. Recommencer pour ses propres `composes` jusqu'à ce que la séquence soit vide.
   Ne poser aucune limite de profondeur : la profondeur vient des contrats.

Une valeur `false` est explicite et remplace le défaut. Une clé absente ne vaut
jamais `false` : elle laisse le contrat de la dépendance fournir son défaut.
Une adresse absente ou ambiguë fait omettre seulement l'atome indicatif
concerné et se rapporte ; elle n'autorise ni une supposition, ni une recherche
globale, ni la modification d'une donnée normative.

Ce cas devrait rester rare : `npm run check` refuse déjà une adresse qui ne
joint rien — clé d'`args` inconnue de la dépendance, valeur hors de son enum,
`composes` imbriqué qu'elle ne déclare pas, `slotPath` qui ne désigne pas
exactement un slot. Rencontrer une adresse morte à la reconstruction signale
donc d'abord deux contrats exportés à des dates différentes. Le rapporter ;
ne pas compenser.

### `swaps` — l’icône que le parent a mise dans une dépendance

À partir d’un contrat 10.3, `composes[].swaps` dit quels calques d’une
dépendance ce composant a remplacés. C’est le seul canal pour une icône
substituée : la prop runtime d’icône d’un contrat n’existe
pas dans Figma, elle n’apparaît donc jamais dans `args`. Sans cette lecture,
plusieurs occurrences censées montrer des icônes différentes reprennent toutes
le même défaut.

`masterPath` nomme les calques du **composant maître** de la dépendance, pas ceux
de l’instance : c’est le vocabulaire que le contrat de la dépendance publie. La
jointure se fait donc sur son dernier segment, contre `icons.<clé>.figmaName` du
contrat de la dépendance ; l’`icons.<clé>.runtimeProp` qu’on y trouve est la prop
à renseigner, et `component` sa valeur.

```
swaps: [{ masterPath: ["Glyph"], component: "GlyphB" }]
→ Branch.icons.leading.figmaName === "Glyph"
→ Branch.icons.leading.runtimeProp === "leadingName"
→ <Branch leadingName="GlyphB" />
```

Le dernier segment de `masterPath` doit joindre **exactement une** icône. Zéro
correspondance signifie que la dépendance n'expose pas ce remplacement ; plusieurs
correspondances rendent la prop indécidable. Dans les deux cas, rapporter et ne
rien deviner.

Le corollaire vaut aussi à l’envers : le texte d’un slot ne se lit **jamais**
dans `figmaLayer`, qui est une identité Figma. Il se trouve qu’un calque jamais
renommé porte son contenu pour nom — c’est un accident, pas une donnée.

---
name: consommer-contrat
description: Reconstruire à froid un composant React jetable dans le sandbox depuis son contrat UCM, uniquement quand cette reconstruction est explicitement demandée. Utiliser le contrat comme seule source du rendu, sans consulter une ancienne implémentation ni générer un moteur de contrat au runtime.
---

# Reconstruire un composant depuis son contrat

## Périmètre

Ce skill autorise uniquement la reconstruction à froid explicitement demandée.
Le composant est un artefact jetable du sandbox, jamais une implémentation de
production. Le créer ou le remplacer depuis zéro sans consulter son ancien
`.tsx`, l’historique Git, un diff, une sauvegarde ou une capture Figma. Une
comparaison visuelle éventuelle vient après la reconstruction.

Le contrat décrit la partie visuelle. Lire `props`, `variants`, `variantViews`,
`structure`, `stateModel`, `rendering`, `icons`, `textStyles` et `intent`. Ne
compléter que l’API applicative : événements, accessibilité et attributs natifs.

**Depuis la 11.0, un contrat ne recopie plus rien.** Trois conséquences, et il
faut les tenir toutes les trois avant de lire quoi que ce soit d’autre :

1. **Une vue est un jeu de RENVOIS.** `variantViews[variant.view].structure` est
   une CHAÎNE — la clé d’une entrée de `viewStructures` — et non l’arbre
   lui-même. Idem pour `typography` → `viewTypographies`, `composes` →
   `viewComposes`, `icons` → `viewIcons`, `paintPlacements` →
   `viewPaintPlacements`. `structure.view` renvoie au même catalogue de
   structures. **Ne jamais résoudre ces renvois à la main :
   `scripts/variant-views.mjs` le fait, et lui seul.**
2. **Une valeur vide n’est pas écrite.** Une clé absente ne veut pas dire
   « inconnu » : elle veut dire « rien à publier ». `strokes` absent = aucun
   contour lié ; `padding` absent = aucun padding tokenisé ; `props` absent =
   aucune prop. La seule exception est sous un DICTIONNAIRE, où la clé est une
   donnée : `stateModel.states.default` vaut `{}` et existe bel et bien.
3. **Ce qui se dérive n’est plus publié.** `tokensUsed` et `meta.warnings` ont
   disparu. Les références de tokens se relèvent dans le contrat, `samples` et
   `meta` exclus ; les messages de l’export se lisent dans `meta.diagnostics`,
   sans filtrer sur `severity`. Le nom Figma d’un variant vient de
   `figmaVariantLabels` quand `variants[].figmaName` est absent.

Sources autorisées :

- le contrat co-localisé du composant ;
- les contrats des dépendances qu’il compose, récursivement ;
- les types générés, `tokenVar`, `ContractIcon` et les points d’intégration
  publics nécessaires ;
- le code partagé strictement requis pour employer ces APIs.

Ne pas lire un composant voisin comme modèle. Ne modifier ni contrat, ni
`tokens.json`, ni fichier généré, ni garde-fou. Limiter les changements au
composant demandé et à son export public si nécessaire.

Le livrable est une transcription statique du contrat, pas un générateur de
production. Le `.tsx` ne doit ni importer le JSON ni l’interpréter au runtime.

## Lecture minimale

Ne pas afficher linéairement un gros contrat. Le parser avec une commande en
lecture seule et extraire, dans cet ordre :

1. `meta.contractVersion`, `meta.coverage` et `meta.diagnostics` ;
2. `props`, `structure.variantAxes`, `structure.sizing`, `structure.sizes`,
   `stateModel` et `intent` ;
3. pour chaque entrée de `variants`, seulement `values`, `tokens`, `strokes`,
   `view`, `sample` et les éventuels `bindings` ;
4. chaque `variantViews[id]` réellement référencée ;
5. les définitions de binding référencées, puis les entrées utilisées de
   `icons`, `textStyles` et `samples` ;
6. les contrats cités dans les `composes` des vues utilisées.

Lire `meta.figma`, `variants[].nodeId` et `variants[].figmaName` seulement pour
diagnostiquer : ils tracent Figma mais ne décident pas du rendu. À l’inverse,
les `figmaLayer`/`figmaPath` situent certaines jointures et
`icons.*.figmaName` peut être le nom d’icône à rendre. `tokensUsed` est un
inventaire de contrôle, jamais une source de style ou de localisation. Il n’est
normalement pas utile d’ouvrir `tokens.json` : le code conserve les références
du contrat.

Si la couverture est partielle ou qu’un diagnostic annonce une perte utile au
rendu, transcrire ce qui est décrit, signaler précisément le manque et ne rien
inventer pour le masquer.

## Carte du contrat

| Champ | Autorité pour la reconstruction |
|---|---|
| `props` | API visuelle, types et défauts |
| `structure` | entrée générale, ordre des axes, comportement externe et dimensions par taille |
| `variants[]` | seules combinaisons existantes ; couleurs, contours, vue et sample exacts |
| `variantViews[id]` | arbre, typographie, icônes, dépendances et cibles de peinture de cette combinaison |
| `propertyBindingDefinitions` + `variants[].bindings` | prop native, cible et chemin exacts dans chaque variant |
| `stateModel` | déclencheurs runtime et priorité des états |
| `rendering.roles` | nature d’une clé de couleur et propriétés CSS candidates |
| `icons` | politique, nom de repli, taille, visibilité et prop runtime |
| `textStyles` | références typographiques par style |
| `composes` | union ordonnée à cardinalité maximale des dépendances |
| `samples` | contenu indicatif et configuration montrés dans la maquette |
| `intent` | usage et restrictions, sans donnée de rendu |

Une entrée de `variants` et la vue qu’elle référence forment une description
complète. Ne jamais fusionner une vue avec la vue par défaut, la projection
`structure` ou une autre vue. Une clé absente reste absente.

## 1. Construire l’API

- Exposer chaque entrée de `props` et appliquer son `default`.
- Importer les unions d’`enum` depuis les types générés. Employer le type des
  combinaisons exactes pour typer les tables internes quand il existe.
- Garder un `boolean` en `boolean`. Une prop `icon`, `string` ou
  `instance-swap` accepte sa valeur déclarée et `null` lorsque son défaut le
  permet. Une prop `slot` demande une API React explicite ; ne pas lui inventer
  une sémantique absente du contrat.
- Ne pas exposer l’axe de `stateModel` comme prop, sauf s’il existe aussi dans
  `props`. L’état est alors piloté par ses sélecteurs.
- Ajouter seulement les responsabilités applicatives : contenu remplaçable,
  accessibilité, événements, `className`, `style` et attributs natifs.

Le contrat possède ses noms de props. En cas de collision avec un attribut
natif (`title`, `color`, `size`, etc.), la prop contractuelle conserve son nom
et son type. Soustraire les collisions mécaniquement :

```ts
interface XContractProps {
  variant?: XVariant;
  visible?: boolean;
}

export interface XProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof XContractProps>,
    XContractProps {}
```

L’application garde ainsi tous les attributs natifs qui ne collisionnent avec
rien, et le consommateur n’a aucune liste à maintenir.

Le contrôle attend une interface publique `<IdentifiantCode>Props` et une
fonction de composant portant cet identifiant. Tous les booléens contractuels
doivent être effectivement lus.

Pour une liaison native, partir de `variants[].bindings`, ouvrir sa définition,
puis appliquer `prop` à `target` (`visible`, `characters` ou `mainComponent`)
sur le `figmaPath` déclaré. Le `nodeId` distingue les occurrences côté Figma ;
ne jamais remplacer cette adresse par un rapprochement au nom d’une prop ou
d’un slot.

## 2. Transcrire la matrice

`variants` énumère les faits. Construire une table littérale
`values → { tokens, strokes, view, sample }` avec ses seules entrées :

- respecter l’ordre de `structure.variantAxes` pour former une clé stable ;
- conserver chaque référence `{chemin.du.token}` en toutes lettres ;
- ne jamais produire un produit cartésien, un chemin interpolé ou une règle
  métier qui reproduit la table ;
- ne reprendre aucun token d’une autre entrée lorsqu’une clé manque ;
- omettre `sample` lorsqu’il n’est pas publié.

Passer toute référence visuelle à `tokenVar(ref)`. Ne coder en dur ni couleur,
ni dimension tokenisée, ni famille, ni graisse. Les pixels de
`structuralSize` et des pistes de grille sont les seules valeurs structurelles
brutes prévues par le contrat ; ne pas les passer à `tokenVar`.

## 3. Rendre la vue exacte

Résoudre `variantViews[variant.view]`, puis construire son
`structure.children` récursivement et dans l’ordre. Un chemin est une suite de
valeurs `slot`; `[]` désigne la racine. Ne jamais rechercher globalement un
`figmaLayer` pour situer un élément.

### Conteneurs et dimensions

- `flex-row` / `flex-column` → Flex dans la direction indiquée ; `grid` → Grid.
- Recopier les valeurs publiées de `justifyContent`, `alignItems`, `alignSelf`,
  `flexGrow`, `wrap`, `gap`, `rowGap` et `columnGap`. Sous `wrap`, un `rowGap`
  absent reprend `gap` ; ailleurs, une absence n’autorise aucun défaut inventé.
- `sizing.width|height` vaut `fit-content`, `stretch`, ou une référence de
  token à appliquer sur l’axe. Traduire l’intention `stretch` par la technique
  adaptée au conteneur (`100%`, flex, alignement) ; une référence ne devient
  jamais `100%`.
- `bounds` s’ajoute à `sizing` ou `size`; chaque borne est tokenisée.
- Un slot `stretch` borné conserve son remplissage et sa borne, puis centre sa
  boîte ; la taille propre d’une dépendance ne remplace jamais celle du cadre.
- Un `size` chaîne fixe les deux axes. Un objet ne fixe que ses clés présentes.
  Sans `size`, un slot hug son contenu ; sous une grille il remplit sa cellule,
  sauf alignement explicite.
- `structuralSize` contient des pixels qui dimensionnent une piste `HUG` : les
  appliquer tels quels. Une `size` tokenisée l’emporte.
- Appliquer `padding.x|y` et `radius` sous leur forme courte ou côté par côté,
  sans compléter les côtés absents.
- En grille, `columns`/`rows` donnent le nombre de pistes. Conserver les
  éventuels `columnSizes` et `rowSizes` telles quelles dans `grid-template-*`,
  puis appliquer `columnStart`, `rowStart`, `columnSpan`, `rowSpan` et
  `justifySelf` à chaque enfant.
- `position: "absolute"` retire le slot du flux. Appliquer les contraintes
  publiées sans inventer les distances aux bords.
- `optional` ne masque rien à lui seul. `visibilityProp` masque le slot entier ;
  `visibilityTargets` masque seulement les descendants désignés par leur
  `figmaPath`.

Quand `structure.sizes` existe, identifier l’unique prop enum dont les valeurs
correspondent aux clés du catalogue, puis sélectionner exactement son entrée.
Ce groupe remplace `gap`, `rowGap`, `columnGap`, `padding` et `radius` du node de
layout représenté par la projection générale. Dans la vue exacte, ce node est
la racine ou l’unique conteneur dont les enfants correspondent aux
`structure.children` de référence. Si la prop ou le node est introuvable ou
ambigu, rapporter l’ambiguïté au lieu de placer les dimensions au hasard.

Un slot conteneur reste un élément du composant courant. Un enfant portant
`composes` est, lui, l’instance d’une dépendance. Ne jamais fusionner le cadre
et la dépendance : leurs flux et dimensionnements appartiennent à deux contrats
différents.

### Peintures et contours

Les clés d’une feuille sont celles du design system. Cinq sont partagées par
tous les contrats — `background` → `background-color` ; `foreground` et `icon` →
`color` ou `fill` ; `border` → `box-shadow`, **jamais** une bordure CSS ; `ring`
extérieur → `outline` ou `box-shadow`. **Ne pas présumer qu’il n’y en a que
cinq** : un composant qui peint plusieurs surfaces expose ses propres clés —
`scale-1`, `title`, `link`. Ces propriétés sont **candidates** : ce qui compte
est la couleur peinte et le token employé.

Pour chaque clé de `variant.tokens`, lire
`view.paintPlacements.fills[clé]`, résoudre tous ses chemins et appliquer la
référence aux cibles. La clé peut contenir des points et ne nomme pas forcément
un rôle partagé. Utiliser `rendering.roles[clé].cssProperties`; ne jamais
déduire la cible ou la propriété du nom du token.

Procéder de même avec `variant.strokes[clé]` et
`view.paintPlacements.strokes[clé]`. Un stroke Figma ne consomme pas la boîte :
ne jamais utiliser une bordure CSS. Pour `box-shadow` :

- `inside` → `inset 0 0 0 <width> <color>` ;
- `outside` → `0 0 0 <width> <color>` ;
- `center` → moitié de la largeur à l’intérieur et à l’extérieur.

Une largeur par côté se rend côté par côté. Un `width: null` ne se rend pas.
Lorsque plusieurs strokes visent la même cible, composer une seule déclaration,
séparée par des virgules, avec les ombres `inset` d’abord.

Un `ring` se rend avec les propriétés d’outline publiées par
`rendering.roles.ring`; son fallback `box-shadow` ne sert que si l’outline ne
suffit pas. S’il vise la même cible qu’un autre stroke rendu en ombre, composer
leurs ombres sans écraser la bordure. Pour un état `focus` associé à
`:focus-visible`, le ring contractuel remplace le contour natif et n’apparaît
qu’au focus clavier, jamais au simple clic.

### Typographie

Pour chaque usage de `view.typography`, joindre `slotPath` dans l’arbre puis
`textStyles[usage.style]`. Appliquer uniquement les références présentes parmi
`fontFamily`, `fontSize`, `fontWeight`, `lineHeight` et `letterSpacing`, toutes
via `tokenVar`. `figmaName` est une identité, jamais un chemin de token ni un
contenu.

### Icônes

La vue exacte décide quelles icônes existent et où : partir de `view.icons`,
puis joindre sa clé au catalogue global `icons`.

- `slotPath` situe l’icône dans cette vue ;
- `size` définit sa boîte et doit alimenter `ContractIcon` ;
- `strict` rend toujours `figmaName` ;
- `modifiable` rend la valeur de `runtimeProp`, avec `figmaName` comme repli ;
- `visibilityProp` décide seulement si elle est visible, indépendamment du nom
  à rendre.

Ne pas réintroduire dans une vue une icône absente de `view.icons`. Ne pas
transformer les combinaisons de `icons.*.variants` en heuristique : si une
table est nécessaire, la recopier littéralement.

## 4. Rendre les états

`stateModel.states` associe chaque état à son sélecteur et
`stateModel.precedence` les classe du plus fort au plus faible. Sélectionner
ensuite l’entrée de `variants` dont `values[stateModel.axis]` égale l’état
effectif.

En styles inline, reproduire les sélecteurs avec événements Pointer et clavier.
`[disabled]` vient du booléen applicatif correspondant ; `:focus-visible` ne
doit s’activer qu’au focus clavier, par
`currentTarget.matches(":focus-visible")`. À chaque rendu, résoudre tous les
états actifs selon `precedence`, sans coder leur priorité ailleurs. Un état au
sélecteur `null` autre que le défaut n’a pas de déclencheur portable : le
signaler.

## 5. Rendre les dépendances

`view.composes` est la séquence exacte de la combinaison courante. Le
`composes` global est seulement son union ordonnée à cardinalité maximale : il
sert à connaître les imports et le nombre maximal d’occurrences, pas à rendre
toutes les dépendances dans toutes les vues.

Pour chaque slot portant `composes`, importer le composant local correspondant
et le rendre à cet emplacement. Conserver chaque occurrence explicite en JSX :
le contrôle statique compte les balises et une boucle `.map()` n’en montre
qu’une. Conditionner ces occurrences avec la vue exacte lorsqu’elles ne sont
pas toujours présentes. Respecter `visibilityProp` sur l’instance ou son cadre.

Lire le contrat enfant pour son API, sa taille propre et son échantillon. Ne
recopier aucun de ses calques, tokens ou styles dans le parent.

## 6. Appliquer `samples`

`samples` est la seule donnée non normative. Il fournit les contenus et réglages
montrés par la maquette, jamais un token, une dimension ou un layout. Le rendre
comme défaut applicatif remplaçable. En cas de conflit, toute donnée normative
du contrat l’emporte.

Résoudre `variants[].sample`, puis :

1. appliquer `sample.args` seulement aux clés réellement exposées ; l’axe
   d’état sert à choisir la variante mais n’est pas transmis comme prop ;
2. joindre chaque `sample.text[].slotPath` dans la vue et utiliser `value` comme
   contenu par défaut du slot ; ne jamais utiliser `figmaLayer` comme texte ;
3. joindre une dépendance racine par son `slotPath` ;
4. choisir la variante du contrat enfant avec ses `args`, complétés par les
   défauts de l’enfant, puis appliquer d’abord son propre sample ;
5. superposer les `args`, `overrides`, `swaps` et `composes` donnés par le
   parent ; recommencer récursivement sans limite arbitraire.

Pour un `SampleInstance` imbriqué, rester relatif au propriétaire immédiat :
parcourir sa séquence de dépendances directes dans l’ordre, puis rapprocher
`component` et `figmaLayer`. Deux occurrences homonymes sont deux positions,
jamais une map par nom.

Une valeur `false` est explicite ; une clé absente laisse le défaut enfant.
`overrides` ne change que le texte ou la visibilité du chemin `figmaPath` dans
la dépendance. Pour chaque `swap`, joindre le dernier segment de `masterPath` à
exactement un `icons.*.figmaName` du contrat enfant, puis passer `component` à
son `runtimeProp`. Zéro ou plusieurs correspondances : omettre cet atome et
rapporter l’ambiguïté.

## 7. Vérifier

Ne pas créer de test par composant. Ces composants sont des sondes jetables :
leur reconstruction et leur comparaison à Figma évaluent la robustesse du
contrat, pas la pérennité de leur implémentation.

Avant de conclure, relire le composant contre le JSON :

- chaque `visibilityProp` retire sa cible à `false` et la rend à `true` ;
- les variantes représentatives sélectionnent leurs vue, peintures, icônes et
  compositions exactes ;
- les dépendances répétées gardent leur cardinalité ;
- les contenus applicatifs remplacent les valeurs de sample.

Exécuter :

```sh
npm test
npm run check
npm run build
```

Comparer ensuite des variantes, états et combinaisons représentatifs avec
Figma. Attribuer chaque écart soit à une information absente ou ambiguë du
contrat, soit à sa transcription dans le composant jetable.

Ne jamais affaiblir un test ou un contrôle. Un échec, une jointure ambiguë ou
une donnée normative absente est un résultat de la reconstruction : le
rapporter avec le champ et la combinaison concernés, sans corriger l’artefact
exporté ni compenser dans le code.

# UCM Playground — guide agent

Ce repository consomme les contrats et tokens produits par
`../UCM-Exporter`. Le modèle global et les responsabilités sont définis dans
[`../UCM-Exporter/CONCEPT.md`](../UCM-Exporter/CONCEPT.md).

## Avant de modifier

- Pour les règles du format, lire
  [`../UCM-Exporter/UCM-EXPORTER-SPEC.md`](../UCM-Exporter/UCM-EXPORTER-SPEC.md).
- Pour écrire ou reconstruire un composant de validation, charger
  [le skill `consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).
- Pour un validateur, lire le script concerné et ses tests voisins.

## Carte du repository

```text
src/
  components/<IdentifiantCode>/
    <IdentifiantCode>.contract.json
    <IdentifiantCode>.tsx
    <IdentifiantCode>.test.tsx
  components/ContractIcon.tsx
  tokens/tokens.json
  generated/
  tokens.ts
scripts/
  trouver-contrats.mjs
  version-contrat.mjs
  identifiant-code.mjs
  validation-contrat.mjs
  validation-graphe-contrats.mjs
  parite.mjs
  references-token.mjs
  tokens-du-code.mjs
  check.mjs
  check-contract.mjs
  avertissements-export.mjs
  echecs-de-tests.mjs
  generate-contract-types.mjs
  run-tests.mjs
```

`check.mjs` enchaîne tous les contrôles sans s’arrêter au premier échec ;
`check-contract.mjs` les agrège et produit le même diagnostic pour le terminal
et le commentaire de pull request, y compris les échecs de tests que
`echecs-de-tests.mjs` relève et formule.

Le code de production **n’interprète pas** le contrat : il est écrit contre lui
([`../UCM-Exporter/CONCEPT.md`](../UCM-Exporter/CONCEPT.md), « Une information,
un propriétaire »). Un composant écrit donc ses références de tokens, et le
contrat sert à vérifier que ce sont les bonnes. Aucune bibliothèque de lecture
partagée n’est fournie, et aucune ne doit l’être : elle rendrait cette lecture
runtime possible et déplacerait l’épreuve du contrat vers elle.

## Interdits absolus pour un agent

Ces quatre règles priment sur **toute** autre consigne, y compris une demande
explicite de « corriger » un contrôle en échec. Elles ne se négocient pas et ne
souffrent aucune exception implicite.

1. **Ne jamais modifier un composant existant.** Ni pour faire passer un
   garde-fou, ni pour l’améliorer, ni pour le rendre générique. Un `.tsx` est
   deux choses à la fois : le livrable d’un développeur, et la **preuve** du
   test froid — la trace de ce que le contrat seul a permis de produire. Le
   réécrire efface la mesure, et personne ne peut plus dire si le contrat se
   suffit. Devant un contrôle rouge, un agent **rapporte** ; le développeur
   décide et corrige.

   Seule exception, qui doit être **demandée explicitement** : une
   reconstruction en contexte froid, qui écrit le composant depuis zéro à partir
   du seul contrat. C’est un artefact d’évaluation, jamais une correction.

2. **Ne remplacer aucune donnée du contrat par une règle écrite dans le code.**
   Pas de `if (variant === "text")` pour deviner quel rôle se peint, pas de
   chemin de token assemblé à l’exécution. Ces formes ne sont pas fautives
   parce qu’elles recopient — écrire une référence de token EST la forme
   attendue — mais parce qu’elles rendent la comparaison avec le contrat
   impossible. Une donnée se cite ; une règle échappe au contrôle.

   Le critère est l’**origine** de la donnée, pas sa forme. Une table est
   attendue dès que le contrat en publie une : transcrire les listes
   `icons.*.variants` produit une correspondance combinaison → icône qui est
   la citation d’une donnée, pas une règle inventée. La même table écrite de
   tête, sans que le contrat la déclare, serait fautive.

3. **N’ajouter aucune bibliothèque de lecture du contrat dans `src/`.** Le code
   de production n’interprète pas le contrat au runtime
   ([`../UCM-Exporter/CONCEPT.md`](../UCM-Exporter/CONCEPT.md)). Une telle
   couche violerait ce principe et déplacerait l’épreuve du contrat vers elle :
   un test froid ne dirait plus si le contrat se suffit, seulement si la
   bibliothèque fonctionne.

4. **Ne jamais affaiblir, désactiver ni contourner un garde-fou** pour obtenir
   du vert — pas plus qu’un test. Un contrôle rouge est un **résultat**, pas un
   obstacle : il se rapporte tel quel.

## Invariants

- Les contrats et `tokens.json` viennent de l’exporteur ; ne pas les corriger
  à la main.
- Une référence `{chemin.du.token}` est traduite uniquement par
  `tokenVar(ref)`, qui **refuse** tout ce qui n’en est pas une : une valeur
  brute produirait une variable inexistante, donc une perte visuelle muette.
- Un composant **écrit** ses références de tokens, sous forme littérale, et le
  contrat co-localisé sert à vérifier que ce sont les bonnes. `tokens-du-code.mjs`
  refuse les deux formes qui échappent à cette vérification : un chemin assemblé
  à l’exécution, qu’il faudrait exécuter pour connaître, et une référence que le
  contrat ne déclare pas. Seul `tokens.ts`, qui traduit une référence en
  variable CSS, est dispensé du contrôle.
- `references-token.mjs` définit seul ce qu’est une référence : deux
  définitions finiraient par diverger, et un contrôle accepterait ce qu’un autre
  refuse.
- Les unions d’enum viennent de `npm run types`, pas d’une liste écrite dans le
  composant.
- `contract.name` conserve le nom Figma. Le dossier, le fichier, la fonction et
  les types utilisent l’identifiant canonique produit par
  `identifiant-code.mjs`.
- Deux contrats ne peuvent partager ni nom Figma ni identifiant de code.
- Un contrat sans `.tsx` est valide et signalé comme en attente.
- Dès que le `.tsx` existe, toutes les props du contrat doivent appartenir à
  son API publique.
- Un booléen contractuel reste un `boolean` TypeScript et doit être lu par la
  fonction du composant.
- Un composé réutilise les composants déclarés dans `composes`. Les cibles
  possèdent un contrat local, le graphe est acyclique et la cardinalité JSX est
  exacte.
- Les props applicatives supplémentaires restent autorisées.
- La version acceptée est une plage explicitement auditée, actuellement 4.2 à
  9.0. La 4.3 rend `structure.children` récursif pour les parties textuelles ;
  la 4.4 publie l'alignement Flex du conteneur et le remplissage de ses slots ;
  la 4.5 place transitoirement la font size par taille ; la 4.6 publie les text
  styles tokenisés et leurs usages dans `structure.variantTypography` ; la 4.7
  publie `structure.sizing` et ouvre `size` aux slots non carrés ; la 4.8 écrit
  ce dimensionnement en CSS (`width` / `height`, `stretch` / `fit-content`) ;
  la 4.9 distingue le calque qui EST une dépendance de celui qui l'enveloppe ;
  la 5.0 range la doc des états dans `stateModel.states.<état>.description` et
  rend `visibilityProp` facultatif sur une prop d'icône ; la 5.1 fait lire dans
  `rendering.roles` ce qu'une clé de couleur peint ; la 5.2 ouvre chaque axe de
  `structure.sizing` à une référence de token ; la 5.3 publie dans `bounds` les
  bornes de taille tokenisées du composant et de chaque slot, qu'une absence de
  `flexGrow`, d'`alignSelf` et de `size` ne suffit plus à décrire. La 8.0 ajoute
  des vues exactes autonomes par variante
  (structure, tokens, strokes, typographie, icônes et composition), les
  matrices clairsemées, les composants standalone, `INSTANCE_SWAP`, `SLOT` et
  les liaisons natives. Le validateur contrôle leur cohérence, le graphe agrège
  les dépendances conditionnelles et le générateur produit un type discriminé
  des seules combinaisons d'enums présentes ; les champs historiques restent
  consommables par les composants existants. La 9.0 déduplique les blocs
  complets dans `variantViews`, normalise les liaisons dans
  `propertyBindingDefinitions` + `variants[].bindings` et retire les trois
  index historiques de matrice ; les validateurs résolvent la vue avant de
  contrôler son arbre, sa typographie, ses icônes et sa composition. Élargir la
  plage n'est jamais mécanique : c'est un audit de ce que CE repo lit, et son
  résultat vit dans le commentaire de `VERSION_CONTRAT_MAXIMALE`.
- `composes` sur un slot signifie que ce slot EST le composant nommé. Un calque
  qui l'enveloppe publie son propre flux et range la dépendance dans
  `children` : le rendre revient à rendre ce conteneur, puis le composant
  dedans. Les confondre pose l'alignement du cadre sur le composant, dont le
  `structure.sizing` le neutralise.
- Depuis la 8.0, chaque composition de vue exacte doit refléter son arbre et le
  `composes` global en est l'union ordonnée à cardinalité maximale. Le graphe
  ne peut donc perdre une cible présente seulement hors variante de référence.
- Une absence de dimensionnement se lit comme un contenu qui se suffit : un
  remplissage est publié, une dimension figée cite une variable dans `size`, et
  `structure.sizing` dit toujours comment le composant occupe la place qu'on lui
  donne. Un slot se rend donc en `fit-content` quand le contrat ne dit rien —
  et le composant, lui, ne le fait jamais par défaut.
- `structure.sizing` a trois lectures, pas deux : `fit-content`, `stretch`, ou
  une référence de token à poser telle quelle en `width` / `height`. Le
  troisième cas est une dimension que le design system a nommée, et l'étirer la
  perdrait.

L’analyse statique ne prouve pas le rendu conditionnel d’une
`visibilityProp`. Ce comportement appartient à un test de rendu co-localisé
avec l’implémentation : `<IdentifiantCode>.test.tsx` monte le composant avec
`react-dom/server` et vérifie que `false` retire le slot ou la dépendance et que
`true` les rend. Ces tests comparent le rendu à la **donnée du contrat**, jamais
à une valeur attendue écrite dans le test. Lire le contrat **au moment du test**
est de la vérification, pas de l’interprétation runtime que le concept écarte :
c’est ce qui fait de ces tests le contrôle qui signale une donnée du contrat
figée dans le code dès que le design change.

## Ce que les contrôles ne vérifient pas

Aucun de ces points n’est couvert, et aucun ne doit être présenté comme une
garantie.

- **La ressemblance avec Figma.** Rien ne compare des images. Seul un outil de
  régression visuelle le ferait.
- **La fraîcheur d’un export.** Rien ne prouve qu’un contrat corresponde au
  dernier état du document Figma ; seule sa date d’export est affichée.
- **L’ordre de priorité des états.** Vérifier que `disable` l’emporte sur
  `hover` demanderait de piloter un navigateur. Hors périmètre.
- **La propriété CSS employée pour un rôle.** `rendering.roles.cssProperties`
  est une indication d’implémentation, pas une contrainte : peindre un fond avec
  `background` plutôt que `background-color` appartient au développeur.
- **Les données du contrat figées ailleurs que dans un chemin de token.** Une
  table sévérité → icône ou un défaut de prop écrit en clair n’est pas détecté à
  l’écriture ; il l’est par les tests pilotés par le contrat, au premier
  changement de design.

## Artefacts dérivés

- `src/generated/tokens.css` vient de Style Dictionary ;
- `src/generated/contracts/*.ts` vient des enums des contrats ;
- un contrat invalide est diagnostiqué avant la génération des types, dont la
  forme de chaque prop : un enum sans `values`, ou dont le défaut sort de sa
  liste, est nommé par le garde-fou au lieu de faire lever le générateur.

Ces fichiers sont régénérés, jamais utilisés comme nouvelle source de vérité.

## Vérification

```sh
npm test
npm run check
npm run build
```

`run-tests.mjs` découvre deux familles : les tests des validateurs
(`scripts/*.test.mjs`) et les tests de rendu (`src/**/*.test.tsx`), transpilés
par `tsx`. Un nouveau fichier de test n’a rien à déclarer.

La CI exécute `check` et `build`. Sur une pull request, elle publie
`ci-report.md` pour rendre le diagnostic accessible sans lire les logs.

`check.mjs` enchaîne les étapes **sans s’arrêter au premier échec** : les tests
d’abord, puis les tokens, puis `check-contract` qui publie le rapport. Une
pull request refusée doit toujours porter un message — sinon le designer ne
voit qu’un ✗ sans cause. Les échecs de tests voyagent donc jusqu’au rapport
(`echecs-de-tests.mjs`), les sorties anticipées de `check-contract` publient
elles aussi, et le workflow complète le rapport quand la construction échoue
ou quand il manque. Un contrôle qui bloque sans figurer dans le rapport est un
défaut, à corriger du côté du rapport.

Le rapport porte aussi ce qui ne bloque pas. `meta.warnings` dit ce que
l’export **n’a pas pu décrire** : la propriété concernée est alors absente du
contrat, donc personne ne la cite et aucun contrôle n’a d’écart à produire.
Sans `avertissements-export.mjs`, elle passait sous un ✅ — exact quant aux
références, trompeur quant au design. Un rapport vert qui tait un point non
décrit est un défaut au même titre qu’un rouge sans message.

Corollaire pour les diagnostics : une référence du code absente du contrat a
**deux** causes possibles — une migration de tokens, ou une propriété que
l’export n’a pas pu décrire. Un même défaut se manifeste d’ailleurs dans
plusieurs sections à la fois (un test qui échoue **et** une référence
orpheline) : chacune doit donc s’abstenir de conclure, `echecs-de-tests.mjs`
comme `diagnostic-tokens.mjs`. Aucune ne peut disculper Figma sans avoir lu
`meta.warnings` — et « pas d’avertissement » (`[]`) se distingue de « pas
vérifié » (`null`), sans quoi les sorties anticipées innocenteraient l’export
sans l’avoir consulté.

Ce que la CI énonce, ce sont ses propres constats. `CONCEPT.md` lui donne la
détection des écarts contrat ↔ code, pas la cause d’une absence dans le
contrat : cette information appartient à l’export. Elle publie donc le fait
qu’elle a prouvé, le voisinage qu’elle mesure (`voisinesDeclarees` —
**une migration emporte un groupe entier, une variable déliée n’emporte qu’une
feuille**), et un renvoi vers les mots de l’export ; jamais une cause
reconstituée. Les avertissements ne sont cités qu’**une fois**, en tête du
rapport quand il est rouge, et les sections y renvoient.

## Test froid

Le test froid évalue la qualité d’un contrat :

1. reconstruire un composant de validation avec le contrat et le skill ;
2. compiler ;
3. comparer quelques variantes et états représentatifs à Figma ;
4. modifier l’export uniquement si une information design était absente ou
   ambiguë.

Le composant reconstruit pendant ce test n’est pas, par ce seul fait, une
implémentation de production.

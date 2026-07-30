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
  tokens-en-dur.mjs
  check-contract.mjs
  generate-contract-types.mjs
  run-tests.mjs
```

`check-contract.mjs` orchestre les validations et produit le même diagnostic
pour le terminal et le commentaire de pull request.

Chaque composant lit son propre `.contract.json`. Le repository ne fournit
volontairement **aucune bibliothèque de lecture partagée** : une couche
intermédiaire déplacerait l’épreuve du contrat vers elle, et un test froid ne
dirait plus si le contrat se suffit à lui-même.

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

2. **N’écrire aucun code spécifique à un composant.** Pas de
   `if (variant === "text")`, pas de table sévérité → icône, pas de valeur du
   contrat recopiée, pas de profondeur d’arbre supposée. Ce qui est dans le
   contrat se lit dans le contrat. Un composant qui reproduit une règle au lieu
   de la lire rend juste et ne suit plus rien : c’est le pire des états, parce
   qu’il est vert.

3. **N’ajouter aucune bibliothèque de lecture partagée dans `src/`.** Elle
   déplacerait l’épreuve du contrat vers elle : un test froid ne dirait plus si
   le contrat se suffit, seulement si la bibliothèque fonctionne. Chaque
   composant lit son propre contrat.

4. **Ne jamais affaiblir, désactiver ni contourner un garde-fou** pour obtenir
   du vert — pas plus qu’un test. Un contrôle rouge est un **résultat**, pas un
   obstacle : il se rapporte tel quel.

## Invariants

- Les contrats et `tokens.json` viennent de l’exporteur ; ne pas les corriger
  à la main.
- Une référence `{chemin.du.token}` est traduite uniquement par
  `tokenVar(ref)`, qui **refuse** tout ce qui n’en est pas une : une valeur
  brute produirait une variable inexistante, donc une perte visuelle muette.
- Un chemin de token ne s’écrit jamais dans le code : il se **lit** dans le
  contrat. Recopier la matrice d’un contrat donne un composant qui rend
  exactement la même chose et ne suit pourtant plus rien — l’écart devient
  invisible, puisque le code ne cite plus sa source. `tokens-en-dur.mjs` refuse
  toute référence littérale dans un `.ts`/`.tsx`, y compris reconstruite par
  concaténation ; seul `tokens.ts`, qui définit ce qu’est une référence, en est
  dispensé.
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
- La version acceptée est une plage explicitement auditée, actuellement 4.2
  uniquement.

L’analyse statique ne prouve pas le rendu conditionnel d’une
`visibilityProp`. Ce comportement appartient à un test de rendu co-localisé
avec l’implémentation : `<IdentifiantCode>.test.tsx` monte le composant avec
`react-dom/server` et vérifie que `false` retire le slot ou la dépendance et que
`true` les rend. Ces tests comparent le rendu à la **donnée du contrat**, jamais
à une valeur attendue écrite dans le test — sans quoi ils valideraient la copie
plutôt que la lecture. Relisant le contrat à chaque exécution, ce sont eux qui
signalent une valeur recopiée dès que le design change.

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
- **Les recopies autres que les chemins de tokens.** Un nom d’icône ou un défaut
  de prop recopié n’est pas détecté à l’écriture ; il l’est par les tests
  pilotés par le contrat, au premier changement de design.

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

`check` s’arrête aujourd’hui au premier échec, ce qui masque l’état des
contrôles suivants. Le rapport unique prévu par le plan d’action
([`../UCM-Exporter/ROADMAP.md`](../UCM-Exporter/ROADMAP.md)) corrige ce point.

## Test froid

Le test froid évalue la qualité d’un contrat :

1. reconstruire un composant de validation avec le contrat et le skill ;
2. compiler ;
3. comparer quelques variantes et états représentatifs à Figma ;
4. modifier l’export uniquement si une information design était absente ou
   ambiguë.

Le composant reconstruit pendant ce test n’est pas, par ce seul fait, une
implémentation de production.

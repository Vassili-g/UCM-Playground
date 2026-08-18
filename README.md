# UCM Playground

Application de référence qui consomme les artefacts de
[Unified Component Exporter](https://github.com/Vassili-g/UCM-Exporter) :

- `tokens.json`, au format DTCG ;
- un fichier `<IdentifiantCode>.contract.json` par composant.

Le playground vérifie que ces artefacts sont utilisables par une application,
une CI et un agent sans accès direct à Figma. Il n’est pas un moteur de
génération du code de production.

```text
Figma → exporteur → contrat + tokens → types, CSS, contrôles et composants
```

## Démarrage

```sh
npm install
npm run dev
```

| Commande | Rôle |
|---|---|
| `npm test` | Teste les validateurs, la parité et le rendu des composants |
| `npm run tokens` | Génère les variables CSS depuis `tokens.json` |
| `npm run types` | Génère les unions TypeScript depuis les contrats |
| `npm run check` | Exécute les contrôles utilisés en CI |
| `npm run build` | Vérifie TypeScript et construit l’application |

## Consommation des artefacts

### Tokens

Le chemin d’un token est son identifiant stable :

```text
{components.button.sizes.medium.gap}
              ↓
var(--components-button-sizes-medium-gap)
```

Style Dictionary produit les variables CSS sans aplatir les alias. Un composant
utilise `tokenVar(ref)`, qui refuse tout ce qui n’est pas une référence : une
valeur brute produirait une variable inexistante, ignorée sans erreur par le
navigateur.

Le composant **écrit** ses références, il n’interprète pas le contrat au
runtime. Le contrat sert à vérifier que ces références sont les bonnes, ce qui
suppose qu’elles soient énumérables : `tokens-du-code.mjs` refuse un chemin
assemblé à l’exécution, impossible à comparer, et une référence que le contrat
ne déclare pas.

Les modes multi-marques sont conservés dans le JSON, mais ne sont pas encore
projetés dans le CSS runtime.

### Contrats

Un contrat vit dans le dossier de son composant. Il peut être fusionné avant
le fichier `.tsx` : la CI signale alors une implémentation en attente sans
bloquer.

Dès que le `.tsx` existe, la parité vérifie notamment :

- la présence des props visuelles ;
- le type et la consommation des booléens ;
- les dépendances rendues par un composant composé ;
- la cardinalité de ces dépendances.

Les événements, attributs natifs et règles d’accessibilité peuvent compléter
l’API sans créer de nouvelle variante visuelle.

Ce que l’analyse statique ne peut pas prouver — qu’une `visibilityProp` retire
réellement son slot, qu’une icône suive la variante courante — relève d’un test
de rendu co-localisé, `<IdentifiantCode>.test.tsx`. Ces tests comparent le rendu
à la donnée du contrat, qu’ils relisent à chaque exécution.

Le nom Figma reste dans `contract.name`. Les dossiers, fichiers et symboles
utilisent un identifiant PascalCase canonique : `Icon / Button` devient
`IconButton`. Deux noms produisant le même identifiant sont refusés.

### Versions

Le consommateur accepte uniquement les versions de contrat qu’il a
explicitement auditées. La plage actuelle couvre **4.2 à 8.0** ; la 4.3 ajoute
la récursion textuelle de `structure.children`, la 4.4 l'alignement Flex du
conteneur et de ses slots, la 4.5 place transitoirement la font size par taille,
la 4.6 publie les text styles tokenisés sur toute la matrice, la 4.7 publie
`structure.sizing` et ouvre `size` aux slots non carrés, la 4.8 exprime ce
dimensionnement en vocabulaire CSS, la 4.9 distingue le calque qui EST une
dépendance de celui qui l'enveloppe, la 5.0 documente l'axe d'états puis
libère les icônes modifiables de leur booléen de visibilité, la 5.1 fait lire
dans `rendering.roles` ce qu'une clé de couleur peint, la 5.2 ouvre chaque
axe de `structure.sizing` à une référence de token, et la 5.3 publie dans
`bounds` les bornes de taille du composant et de ses slots. La 8.0 ajoute les
variantes portables exactes sans embarquer les données de construction ; le générateur de
types préserve les matrices clairsemées par une union discriminée. Button et
Alert sont encore en 4.9. Une version future n'est pas présumée compatible, majeure comme
mineure : elle entre dans la plage par un audit, tracé dans le commentaire de
`VERSION_CONTRAT_MAXIMALE`.

## Architecture

```text
src/
  components/                 contrats, composants et tests co-localisés
  components/ContractIcon.tsx rendu d’une icône décrite par un contrat
  tokens/tokens.json          export DTCG
  generated/                  CSS et types dérivés, non versionnés
  tokens.ts                   référence de token → variable CSS
  App.tsx                     surface de démonstration
scripts/
  check-contract.mjs          orchestration des contrôles
  validation-contrat.mjs      validation d’un contrat
  validation-graphe-contrats.mjs
  parite.mjs                  contrat ↔ code présent
  references-token.mjs        forme d’une référence de token
  tokens-du-code.mjs          tokens employés par le code ↔ contrat
  generate-contract-types.mjs
  run-tests.mjs               découverte des tests, validateurs et rendu
.github/workflows/ci.yml      contrôle des PR et de main
```

## Test froid

Un test froid consiste à reconstruire un composant de validation depuis son
contrat, puis à comparer quelques états avec Figma. Une erreur révèle soit une
ambiguïté du contrat, soit une responsabilité qui appartient au code.

La procédure de consommation détaillée vit dans
[le skill `consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).

Pour le modèle global, la maturité et les limites, consulter
[le repository de l’exporteur](https://github.com/Vassili-g/UCM-Exporter).

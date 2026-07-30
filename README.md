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

Le chemin lui-même se **lit dans le contrat**, il ne s’écrit pas dans le code.
Un composant qui recopie la matrice de son contrat rend la même chose et cesse
de suivre le design ; l’écart devient invisible, faute de citer sa source.
`tokens-en-dur.mjs` refuse toute référence littérale dans le code, y compris
construite par concaténation.

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
explicitement auditées. La plage actuelle est limitée à **4.2** ; une version
mineure future n’est pas présumée compatible.

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
  tokens-en-dur.mjs           chemins de tokens recopiés dans le code
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

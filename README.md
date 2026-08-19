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

`tokens.json` reste la source de vérité. Si un ancien contrat cite un token qui
n’y existe plus, la CI avertit le designer et nomme le composant à réexporter,
mais ne bloque pas la fusion de l’évolution des tokens.

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

`variants` énumère les seules combinaisons présentes ; chaque entrée porte ses
tokens et ses strokes, puis référence dans `variantViews` une vue complète pour
la structure, la typographie, les icônes, la composition et les chemins de ses
peintures. Une vue ne reçoit aucun héritage implicite d’une autre. Ce que
chaque version a ajouté vit dans [CHANGELOG-CONTRAT.md](./CHANGELOG-CONTRAT.md).

Ce que l’analyse statique ne peut pas prouver — qu’une `visibilityProp` retire
réellement son slot, qu’une icône suive la variante courante — relève d’un test
de rendu co-localisé, `<IdentifiantCode>.test.tsx`. Ces tests comparent le rendu
à la donnée du contrat, qu’ils relisent à chaque exécution.

Le nom Figma reste dans `contract.name`. Les dossiers, fichiers et symboles
utilisent un identifiant PascalCase canonique : `Icon / Button` devient
`IconButton`. Deux noms produisant le même identifiant sont refusés.

### Versions

Le consommateur lit **un seul** schéma, celui que publie
`scripts/version-contrat.mjs` ; toute autre version est refusée, majeure comme
mineure. Les quatre composants viennent d’exports Figma réels de cette version,
qui exercent les chemins de peintures, les pistes FIXED de grille, les côtés
tokenisés clairsemés et les mesures de cellules sous une piste qui hug.

Le refus conserve le SENS de l’écart, parce qu’il désigne qui corrige : un
contrat plus ancien se répare par un réexport, un contrat plus récent par une
adaptation des lecteurs. Passer à un nouveau schéma suit donc un ordre — adapter
les lecteurs, réexporter les contrats, vérifier les tests de rendu, puis changer
`VERSION_CONTRAT_MINIMALE` et `VERSION_CONTRAT_MAXIMALE`. Ce que chaque version
publie et ce qu’un lecteur doit en savoir vivent dans
[CHANGELOG-CONTRAT.md](./CHANGELOG-CONTRAT.md).

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
  verdict-bilan.mjs           sévérité bloquante ou informative d’un bilan
  validation-contrat.mjs      validation d’un contrat
  validation-graphe-contrats.mjs
  variant-views.mjs           résolution des vues exactes 8.0 et 9.0+
  parite.mjs                  contrat ↔ code présent
  references-token.mjs        forme d’une référence de token
  tokens-du-code.mjs          tokens employés par le code ↔ contrat
  generate-contract-types.mjs
  run-tests.mjs               découverte des tests, validateurs et rendu
.github/workflows/ci.yml      contrôle des PR et de main
```

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) — règles de code, de test et de
  documentation ;
- [AGENTS.md](./AGENTS.md) — invariants et limites propres aux agents ;
- [le skill `consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md) —
  procédure d’une reconstruction à froid explicitement demandée ;
- [le concept UCM](https://github.com/Vassili-g/UCM-Exporter/blob/main/CONCEPT.md)
  — responsabilités respectives de Figma, du contrat et du code.

## Test froid

Un test froid consiste à reconstruire un composant de validation depuis son
contrat, puis à comparer quelques états avec Figma. Une erreur révèle soit une
ambiguïté du contrat, soit une responsabilité qui appartient au code.

La procédure de consommation détaillée vit dans
[le skill `consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).

Pour le modèle global, la maturité et les limites, consulter
[le repository de l’exporteur](https://github.com/Vassili-g/UCM-Exporter).

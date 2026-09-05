# UCM Playground

Application de référence qui consomme les artefacts de
[Unified Component Exporter](https://github.com/Vassili-g/UCM-Exporter) :

- `tokens.json`, au format DTCG ;
- un fichier `<IdentifiantCode>.contract.json` par composant.

Le playground vérifie que ces artefacts sont utilisables par une application,
une CI et un agent sans accès direct à Figma. C’est un sandbox : ses composants
React sont des sondes jetables de reconstruction à froid, jamais du code de
production.

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
| `npm test` | Teste les validateurs et le code partagé du playground |
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
runtime. Comparer les références écrites dans un `.tsx` à celles de son contrat
relève d’un linter et non de cette CI : un tel écart accuse le code, et refuser
la pull request d’un designer pour cela arrêterait la seule personne incapable
d’y répondre. `tokenVar` reste le garde-fou de l’écriture, à l’exécution.

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

Un écart y est un avertissement, jamais un blocage : il dit qu’un composant
React est en retard sur son contrat, et seul un développeur le corrige. Sur une
pull request, il n’est affiché que pour les contrats qu’elle modifie — un export
de tokens ne parle donc d’aucun composant.

Les événements, attributs natifs et règles d’accessibilité peuvent compléter
l’API sans créer de nouvelle variante visuelle.

`variants` énumère les seules combinaisons présentes ; chaque entrée porte ses
tokens et ses strokes, puis référence dans `variantViews` une vue complète pour
la structure, la typographie, les icônes, la composition et les chemins de ses
peintures. Une vue ne reçoit aucun héritage implicite d’une autre. La forme
exactement prise en charge est décrite par le producteur, dans
[docs/FORMAT.md](https://github.com/Vassili-g/UCM-Exporter/blob/main/docs/FORMAT.md).

Une entrée peut aussi renvoyer à un échantillon de `samples` : ce que la
maquette montrait — textes, booléens, valeurs d’enum, noms de composants —,
jamais ce qu’elle exige. `validation-echantillons.mjs` en joint les adresses
avec les contrats voisins, sans jamais regarder QUELLE valeur est placée : un
composant qui ignore l’échantillon reste conforme.

Ce que l’analyse statique ne peut pas prouver — qu’une `visibilityProp` retire
réellement son slot, qu’une icône suive la variante courante — est évalué en
reconstruisant le composant depuis zéro, puis en comparant des variantes
représentatives avec Figma. Il n’existe volontairement aucun test par
composant : ces implémentations sont jetables et servent à éprouver le contrat,
pas à constituer une bibliothèque durable.

Le nom Figma reste dans `contract.name`. Les dossiers, fichiers et symboles
utilisent un identifiant PascalCase canonique : `Icon / Button` devient
`IconButton`. Deux noms produisant le même identifiant sont refusés.

### Versions

Le consommateur lit **un seul** schéma, celui que déclare le paquet
`@ucm-kit/core` (`version-contrat.mjs`) — ce numéro n’est plus écrit dans ce
repository, il vient de la version du kit installée. Toute autre version est refusée, majeure comme mineure. Les quatre
contrats présents viennent d’exports Figma réels et exercent les chemins de
peintures, les pistes FIXED de grille, les côtés tokenisés clairsemés et les
mesures de cellules sous une piste qui hug.

Ce numéro peut être en retard sur celui que publie l’Exporter, et il l’est
aujourd’hui : tant qu’il l’est, ce repository lit son propre schéma et refuse
un contrat réexporté à la version suivante. Le rattrapage n’est pas un
changement de constante, mais l’ordre décrit plus bas.

Un contrat ne recopie pas ce qui se dérive de lui : ni index de ses tokens, ni
miroir en texte brut de ses diagnostics, et une valeur vide n’est pas écrite.
`references-token.mjs` dérive donc l’index des références, et
`avertissements-export.mjs` lit `meta.diagnostics`.

Le refus conserve le SENS de l’écart, parce qu’il désigne qui corrige : un
contrat plus ancien se répare par un réexport, un contrat plus récent par une
adaptation des lecteurs. Passer à un nouveau schéma suit donc un ordre — adapter
les lecteurs, réexporter les contrats, reconstruire des composants
représentatifs et les comparer à Figma, puis changer
`VERSION_CONTRAT_MINIMALE` et `VERSION_CONTRAT_MAXIMALE`, qui portent la
version courante ET la précédente : le temps du réexport, les deux se lisent.

La forme de cette version est aussi publiée en JSON Schema, dans le paquet
installé (`@ucm-kit/core/schema`), auquel `.vscode/settings.json` renvoie
directement — ce repository n’en garde aucune copie. L’éditeur s’en sert pour
signaler une forme invalide pendant la lecture d’un `.contract.json`. Il ne
refuse aucune pull request : `validation-contrat.mjs` reste seule autorité, et
le schéma ignore les renvois internes comme le format des valeurs tokenisées.

## Architecture

```text
src/
  components/                 contrats et composants jetables du sandbox
  components/ContractIcon.tsx rendu d’une icône décrite par un contrat
  tokens/tokens.json          export DTCG
  generated/                  CSS et types dérivés, non versionnés
  tokens.ts                   référence de token → variable CSS
  App.tsx                     surface de démonstration
ucm.config.json               où ce repo range ses contrats et ses tokens
scripts/
  check.mjs                   enchaînement complet des contrôles (`npm run check`)
  check-contract.mjs          le pilote : monte l’adaptateur, publie le rapport
  parite.mjs                  l’adaptateur TypeScript : contrat ↔ API publique
  echecs-de-tests.mjs         lit le TAP, et dit quel composant un test met en cause
  generate-contract-types.mjs
  types-variants.mjs          unions TypeScript des variantes
  run-tests.mjs               découverte des tests du repository
.github/workflows/ci.yml      contrôle des PR et de main

node_modules/@ucm-kit/core    LE FORMAT ET LE RAPPORT, installés depuis npm — ce
                              qui juge un contrat, et chaque phrase que le
                              designer en lit, n’appartient plus à ce repository
```

## Documentation

- [AGENTS.md](./AGENTS.md) — invariants et limites propres aux agents ;
- [l’historique des schémas de contrat](https://github.com/Vassili-g/UCM-Exporter/blob/main/docs/CHANGELOG-FORMAT.md)
  — ce que chaque version publie, chez le dépôt qui les publie ;
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

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

## Ce que ce dépôt prouve

Il ne prouve qu’une chose, et c’est pour cela qu’il existe : **un contrat et un
fichier de tokens suffisent**. Une application, une CI et un agent les
consomment ici sans accéder à Figma, sans bibliothèque de lecture partagée, et
sans qu’aucun composant n’interprète son contrat à l’exécution.

Ce qui se passe concrètement, à chaque pull request :

- **Les tokens deviennent du CSS.** Style Dictionary projette
  `{components.button.sizes.medium.gap}` en
  `var(--components-button-sizes-medium-gap)` sans aplatir les alias, et
  `tokenVar(ref)` refuse tout ce qui n’est pas une référence — une valeur brute
  produirait une variable inexistante, que le navigateur ignorerait sans un mot.
- **Les contrats sont jugés.** Forme, version, graphe de composition, adresses
  des échantillons, existence des références dans `tokens.json`. Ce jugement
  n’appartient plus à ce dépôt : il vient du paquet `@ucm-kit/core`, installé
  depuis npm comme n’importe quel consommateur le ferait.
- **Le code est comparé à son contrat.** Un contrat peut être fusionné avant son
  implémentation ; dès qu’elle existe, la parité vérifie les props visuelles,
  le type et la lecture des booléens, les dépendances rendues et leur
  cardinalité. L’adaptateur vient de `@ucm-kit/adapter-typescript`. **Un écart
  avertit, il ne bloque pas** — il accuse le code, et
  refuser la pull request arrêterait le designer, seule personne incapable d’y
  répondre.
- **Le designer reçoit un message.** Le rapport est publié en commentaire de la
  pull request : il n’ouvre pas les logs de CI.

Ce qu’aucune analyse statique ne prouve — qu’une `visibilityProp` retire
réellement son slot, qu’une icône suive la variante courante — est évalué par
reconstruction à froid, puis comparaison avec Figma. C’est le test froid, plus
bas.

**La forme du contrat n’est pas décrite ici.** Elle a un domicile, et c’est le
dépôt qui la publie : [docs/FORMAT.md](https://github.com/Vassili-g/UCM-Exporter/blob/main/docs/FORMAT.md)
champ par champ, [docs/CHANGELOG-FORMAT.md](https://github.com/Vassili-g/UCM-Exporter/blob/main/docs/CHANGELOG-FORMAT.md)
pour ce que chaque version publie. La version lue ici est celle du kit installé
(`@ucm-kit/core`), jamais un numéro écrit dans ce dépôt : elle porte la version
courante ET la précédente, pour qu’un réexport ait le temps d’arriver.

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
  parite.test.mjs             sonde réelle de la parité du composé StressTest
  echecs-de-tests.mjs         lit le TAP, et dit quel composant un test met en cause
  run-tests.mjs               découverte des tests du repository
.github/workflows/ci.yml      contrôle des PR et de main

node_modules/@ucm-kit/core    LE FORMAT ET LE RAPPORT, installés depuis npm — ce
                              qui juge un contrat, et chaque phrase que le
                              designer en lit, n’appartient plus à ce repository
```

## Le test froid

Un test froid reconstruit un composant depuis son contrat SEUL — sans consulter
l’implémentation précédente —, puis compare quelques variantes et états à Figma.
Une erreur y révèle soit une ambiguïté du contrat, soit une responsabilité qui
appartient au code, et c’est la seule épreuve qui distingue les deux.

C’est aussi ce qui fait des composants d’ici des sondes : ils mesurent le
contrat du moment, et se jettent. La procédure vit dans
[le skill `consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).

## Où va le reste

- [AGENTS.md](./AGENTS.md) — la carte de ce dépôt, ses interdits, ses
  invariants, son style et ses commandes. Tout ce qui décrit CE dépôt.
- [le concept UCM](https://github.com/Vassili-g/UCM-Exporter/blob/main/CONCEPT.md)
  — les responsabilités respectives de Figma, du contrat et du code.
- [le repository de l’exporteur](https://github.com/Vassili-g/UCM-Exporter) — le
  modèle, la forme publiée, la maturité et les limites.

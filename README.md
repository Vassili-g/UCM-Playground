# UCM Playground

**Le laboratoire qui vérifie que les artefacts de l'exporteur sont réellement
exploitables dans une application.**

Ce repository met en pratique l'**UCM — Unified Component Model** : le modèle où
chaque **composant unifié** réunit, dans son dossier, son code réel et sa
spécification issue de Figma.

Pour cela, il consomme deux artefacts exportés par Unified Component Exporter :

- un **contrat de composant** `.contract.json`, qui décrit les props visuelles,
  variantes, états, icônes, structure et règles d'usage ;
- des **tokens DTCG**. DTCG signifie **Design Tokens Community Group** : c'est
  le standard utilisé pour transporter les valeurs, types et références des
  design tokens entre Figma, Style Dictionary et le code.

```text
Figma ── Unified Component Exporter ──► tokens.json + Button.contract.json
                                      │
                                      ▼
                              UCM Playground
```

## Ce que le playground cherche à prouver

L'enjeu : qu'un développeur puisse **s'appuyer sur un agent IA en confiance**.
Le playground le démontre en vérifiant que —

- les noms de tokens restent identiques de Figma jusqu'au CSS ;
- un composant peut être implémenté en suivant son contrat ;
- un agent choisit uniquement parmi les variantes visuelles autorisées ;
- les intentions et interdits du design system peuvent guider la composition
  d'une interface.

Le Button présent ici est un composant de **validation**. Le code destiné à la
production sera écrit et maintenu par un développeur ; la reconstruction par un
agent sert uniquement à tester la qualité du contrat.

## Démarrage rapide

```sh
npm install
npm run dev
```

`npm run dev` génère d'abord les variables CSS depuis les tokens, puis démarre
le playground Vite.

Les documents de ce repo renvoient au repo frère par chemin relatif : cloner
[`UCM-Exporter`](https://github.com/Vassili-g/UCM-Exporter) et
`UCM-Playground` côte à côte, sous ces noms.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run tokens` | Génère `src/generated/tokens.css` depuis `src/tokens/tokens.json` |
| `npm run types` | Génère les unions TypeScript `src/generated/contracts/*.ts` depuis les contrats |
| `npm run dev` | Génère tokens et types puis lance le playground local |
| `npm run check` | Régénère les tokens, vérifie que les contrats sont exploitables, que leurs références de tokens existent et que le code expose leurs props, puis régénère les types (lancé en CI) |
| `npm run build` | Typecheck puis construit le bundle de production |

## Comment les artefacts sont consommés

### Tokens

`src/tokens/tokens.json` est la source DTCG exportée par Unified Component Exporter. Style
Dictionary la transforme en variables CSS. Le contrat cite un token comme
référence entre accolades ; `tokenVar` retire les accolades puis effectue la
correspondance mécanique :

```text
{components.button.sizes.medium.gap}
              ▼
var(--components-button-sizes-medium-gap)
```

Aucune couleur ou dimension de design ne doit être recopiée en valeur brute
dans un composant.

Les modes multi-marques exportés par le plugin
(`$extensions["com.ucm.modes"]`) sont préservés dans `tokens.json` mais pas
encore exploités par le pipeline CSS — le multi-marque viendra plus tard.

### Contrats

Chaque contrat reste à côté du composant concerné. Il décrit les props qui
pilotent le rendu, les états, les tailles, les tokens utilisés, les icônes et
les règles d'usage. Les événements, attributs natifs et règles d'accessibilité
peuvent compléter l'API sans créer de nouvelle variante visuelle.

### Polices et icônes

- **Open Sans** est embarquée localement avec `@fontsource/open-sans` ;
- les noms d'icônes restent opaques dans les contrats ;
- le kit FontAwesome chargé dans `index.html` les résout côté application,
  notamment pour les icônes personnalisées du kit. Son identifiant est
  rattaché à un compte FontAwesome : il vit dans `VITE_FA_KIT_ID`, pas dans le
  dépôt. Copier `.env.example` en `.env.local` et y mettre le sien — sans lui,
  les icônes ne s'affichent pas, exactement comme sans kit.

Cette intégration reste propre au playground : la police n'a pas besoin d'être
installée sur la machine, tandis que le contrat et Unified Component Exporter restent
indépendants de FontAwesome. Le kit est une dépendance runtime **assumée**
(contrairement à la police, locale) ; un playground 100 % hors-ligne
remplacerait le kit par les packages npm Font Awesome.

## Architecture

```text
src/
  components/Button/
    Button.contract.json   Contrat de composant exporté depuis Figma
    Button.tsx              Composant React de validation (test froid)
    index.ts                Export public
  tokens/
    tokens.json             Source DTCG exportée depuis Figma
  generated/
    tokens.css              Variables CSS générées, non versionnées
    contracts/              Unions TypeScript dérivées des contrats, non versionnées
  tokens.ts                 Conversion nom de token → variable CSS
  App.tsx                   Surface de démonstration
scripts/
  check-contract.mjs        Garde-fou contrats ↔ tokens (+ rapport pour la PR)
  generate-contract-types.mjs  Unions TypeScript dérivées des contrats
  trouver-contrats.mjs      Parcours partagé des *.contract.json
style-dictionary.config.mjs  Pipeline tokens.json → tokens.css
.github/workflows/ci.yml     Vérification à chaque PR et push sur main
```

## Test froid d'un contrat

Retirer l'implémentation d'un composant, la faire reconstruire par un agent
neuf depuis le seul contrat, comparer le rendu à Figma : si le rendu est faux,
c'est le contrat (ou son export) qu'on corrige. La procédure détaillée est dans
[AGENTS.md](./AGENTS.md#test-froid-dun-contrat) ; le code généré n'est pas le
livrable de production.

## Pour aller plus loin

- [Unified Component Exporter](https://github.com/Vassili-g/UCM-Exporter) — plugin d'export des contrats et tokens DTCG ;
- [Concept du projet](https://github.com/Vassili-g/UCM-Exporter/blob/main/CONCEPT.md) — UCM, arbitrage, co-localisation ;
- [ROADMAP](https://github.com/Vassili-g/UCM-Exporter/blob/main/ROADMAP.md) — objectif MVP, état et prochaines étapes ;
- [Spécification Unified Component Exporter](https://github.com/Vassili-g/UCM-Exporter/blob/main/UCM-EXPORTER-SPEC.md) — format exact des artefacts ;
- [AGENTS.md](./AGENTS.md) — conventions de consommation pour les humains et agents IA.

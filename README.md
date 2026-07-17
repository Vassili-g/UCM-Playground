# Components Playground

**Le laboratoire qui vérifie que les artefacts de TokenLintel sont réellement
exploitables dans une application.**

Ce repository met en pratique l'**UCS — Unified Component Specification**, un
concept qui relie design et développement en réunissant, dans le dossier de
chaque composant, son code réel et sa spécification issue de Figma.

Pour cela, il consomme deux artefacts exportés par TokenLintel :

- un **contrat de composant** `.contract.json`, qui décrit les props visuelles,
  variantes, états, icônes, structure et règles d'usage ;
- des **tokens DTCG**. DTCG signifie **Design Tokens Community Group** : c'est
  le standard utilisé pour transporter les valeurs, types et références des
  design tokens entre Figma, Style Dictionary et le code.

```text
Figma ── TokenLintel ──► tokens.json + Button.contract.json
                                      │
                                      ▼
                          Components Playground
```

## Ce que le playground cherche à prouver

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

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run tokens` | Génère `src/generated/tokens.css` depuis `src/tokens/tokens.json` |
| `npm run dev` | Génère les tokens puis lance le playground local |
| `npm run check` | Vérifie que tous les `tokensUsed` des contrats existent |
| `npm run build` | Typecheck puis construit le bundle de production |

## Comment les artefacts sont consommés

### Tokens

`src/tokens/tokens.json` est la source DTCG exportée par TokenLintel. Style
Dictionary la transforme en variables CSS. `tokenVar("chemin.du.token")`
effectue ensuite la correspondance mécanique :

```text
components.button.sizes.medium.gap
              ▼
var(--components-button-sizes-medium-gap)
```

Aucune couleur ou dimension de design ne doit être recopiée en valeur brute
dans un composant.

### Contrats

Chaque contrat reste à côté du composant concerné. Il décrit les props qui
pilotent le rendu, les états, les tailles, les tokens utilisés, les icônes et
les règles d'usage. Les événements, attributs natifs et règles d'accessibilité
peuvent compléter l'API sans créer de nouvelle variante visuelle.

### Polices et icônes

- **Open Sans** est embarquée localement avec `@fontsource/open-sans` ;
- les noms d'icônes restent opaques dans les contrats ;
- le kit FontAwesome chargé dans `index.html` les résout côté application,
  notamment pour les icônes personnalisées du kit.

Cette intégration reste propre au playground : la police n'a pas besoin d'être
installée sur la machine, tandis que le contrat et TokenLintel restent
indépendants de FontAwesome.

## Architecture

```text
src/
  components/Button/
    Button.contract.json   Contrat de composant exporté depuis Figma
    Button.tsx              Composant React piloté par le contrat
    index.ts                Export public
  tokens/
    tokens.json             Source DTCG exportée depuis Figma
  generated/
    tokens.css              Variables CSS générées, non versionnées
  tokens.ts                 Conversion nom de token → variable CSS
  App.tsx                   Surface de démonstration
scripts/
  check-contract.mjs        Garde-fou contrats ↔ tokens
```

## Test froid d'un contrat

Le test reste volontairement léger :

1. retirer temporairement l'implémentation du composant ;
2. demander à un agent neuf de la reconstruire depuis le contrat et les
   conventions génériques du repository ;
3. compiler puis comparer quelques états représentatifs avec Figma ;
4. modifier le contrat ou son export uniquement si l'information visuelle
   était absente ou ambiguë.

Le code généré pendant ce test n'est pas le livrable de production.

## Pour aller plus loin

- [TokenLintel](https://github.com/Vassili-g/TokenLintel) — plugin d'export des contrats et tokens DTCG ;
- [Vision du projet](https://github.com/Vassili-g/TokenLintel/blob/main/CONCEPT.md) — concept et plan global ;
- [Spécification TokenLintel](https://github.com/Vassili-g/TokenLintel/blob/main/TOKENLINTEL-SPEC.md) — format exact des artefacts ;
- [AGENTS.md](./AGENTS.md) — conventions de consommation pour les humains et agents IA.

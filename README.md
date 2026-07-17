# Components Playground

Laboratoire **consommateur** du design system AI-first. Il transforme les artefacts
exportés de Figma par [TokenLintel](../TokenLintel) — `tokens.json` (DTCG) et
`<Composant>.contract.json` (UCS) — en composants React de test stylés
uniquement par les tokens, et fournit un **playground** où l'on demande à un
agent de composer des interfaces à partir de ces composants.

```
Figma → TokenLintel → { tokens.json + Button.contract.json } → ce repo → playground
```

## Stack

Vite · React · TypeScript · Tailwind (mise en page) · Style Dictionary v4
(tokens → variables CSS). Principe : **le nom du token est son chemin**, donc
aucun nom ne diverge de Figma jusqu'au rendu.

Open Sans est embarquée localement avec `@fontsource/open-sans`. Les noms
d'icônes opaques des contrats sont résolus côté application par le kit
FontAwesome chargé dans `index.html` ; TokenLintel ne dépend d'aucun kit.

## Démarrer

```sh
npm install
npm run dev       # génère les tokens puis lance le playground
```

## Commandes

| Commande | Rôle |
|---|---|
| `npm run tokens` | Génère `src/generated/tokens.css` depuis `src/tokens/tokens.json`. |
| `npm run dev` | Playground en local (regénère les tokens avant). |
| `npm run build` | Typecheck + build de production. |
| `npm run check` | Garde-fou : `tokensUsed` des contrats ⊆ tokens générés. |

## Structure

```
style-dictionary.config.mjs       → pipeline tokens → CSS
src/
  tokens.ts                       → tokenVar(chemin) : pont token → CSS
  tokens/
    tokens.json                   → export DTCG (source des tokens)
  components/Button/
    Button.contract.json          → contrat UCS (source de vérité)
    Button.tsx                     → composant piloté par le contrat
    index.ts                       → export public
  App.tsx                         → le playground
scripts/check-contract.mjs        → garde-fou contrat → tokens
```

## État

Pipeline tokens opérationnel, Button de validation piloté par son contrat,
playground et garde-fou contrat ↔ tokens disponibles. Le futur code de
production sera écrit par un développeur ; la génération froide sert à tester
la qualité du contrat. Voir
[`AGENTS.md`](./AGENTS.md) pour les règles de contribution et
[`../TokenLintel/CONCEPT.md`](../TokenLintel/CONCEPT.md) pour la vision.

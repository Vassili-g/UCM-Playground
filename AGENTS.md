# Components Playground — guide pour agents IA (et nouveaux contributeurs)

Repo **consommateur** du design system AI-first. Il transforme les artefacts
produits par [TokenLintel](../TokenLintel) — `tokens.json` (DTCG) et
`<Composant>.contract.json` (UCS) — en **code React réel** et offre un
**playground** où un agent compose des interfaces à partir de ces composants.

C'est l'aval du pipeline décrit dans `../TokenLintel/concept.md` (Phases A→D) :

```
Figma → TokenLintel → { tokens.json + Button.contract.json } → CE REPO → playground
```

## Ordre de lecture

1. [`../TokenLintel/concept.md`](../TokenLintel/concept.md) — la vision (UCS,
   co-localisation, ce qu'on cherche à prouver). **À lire en premier.**
2. [`../TokenLintel/context.md`](../TokenLintel/context.md) — la forme exacte
   des artefacts consommés ici (schéma du contrat, des tokens).
3. Ce fichier — la carte du repo et les règles de consommation.
4. [`src/components/Button/Button.contract.json`](./src/components/Button/Button.contract.json)
   — un contrat réel : c'est la **source de vérité** d'un composant.

## Principe non négociable : le nom du token EST son chemin

Un token du contrat `components.button.sizes.medium.gap` devient la variable CSS
`--components-button-sizes-medium-gap`. La traduction est mécanique (`.` → `-`,
via [`src/tokens.ts`](./src/tokens.ts)). **Un composant ne style JAMAIS avec une
valeur brute** (`#hex`, `px`, `rem`) : uniquement avec `tokenVar("chemin.du.token")`.
C'est ce qui garantit qu'aucun nom ne diverge de Figma jusqu'au rendu.

## Carte du code

- `tokens/tokens.json` — export DTCG de TokenLintel (source des tokens). **Ne
  pas éditer à la main** : il est ré-exporté depuis Figma.
- `style-dictionary.config.mjs` — pipeline tokens → `src/generated/tokens.css`
  (variables CSS ; chaîne d'alias préservée en `var(--…)`).
- `src/tokens.ts` — `tokenVar(chemin)` : le seul pont token → CSS.
- `src/components/<Nom>/` — **co-localisation** : le `.tsx`, son
  `<Nom>.contract.json` et son `index.ts` vivent ensemble.
- `src/App.tsx` — le playground (surface de démonstration, remplaçable).
- `scripts/check-contract.mjs` — garde-fou : `tokensUsed` ⊆ tokens générés.

## Comment consommer un contrat (règles pour composer une UI)

1. **Lire le contrat** du composant avant de l'utiliser.
2. N'utiliser **que** les `props` et leurs `values` déclarées — rien d'autre.
3. Respecter `intent` : les `dont` sont des interdits, les `do` des consignes,
   `pairs` des associations recommandées. Les `descriptions` par valeur disent
   **quand** choisir chaque option.
4. Ne pas inventer de style : passer par les props. Toute couleur/dimension
   vient déjà des tokens via le composant.

## Commandes

```sh
npm install
npm run tokens    # génère src/generated/tokens.css depuis tokens/tokens.json
npm run dev       # playground en local (regénère les tokens avant)
npm run build     # typecheck + build de production
npm run check     # tokens + garde-fou contrat ↔ tokens (à passer en CI)
```

## Invariants à ne jamais casser

- **Zéro valeur brute** dans un composant : tout passe par `tokenVar`.
- **Contrat = source de vérité** : les props/valeurs du `.tsx` reflètent le
  contrat ; on ne recopie pas les tokens dans Tailwind ni ailleurs.
- **Co-localisation** : contrat et code d'un composant restent dans le même
  dossier.
- **`tokens.json` et les contrats ne s'éditent pas à la main** : ils viennent
  de TokenLintel. Pour les rafraîchir, on ré-exporte depuis Figma.
- Commentaires **systématiques, en français, pour un lecteur débutant**
  (mêmes règles que TokenLintel).

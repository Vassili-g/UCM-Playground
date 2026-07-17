# Components Playground — guide pour agents IA (et nouveaux contributeurs)

Laboratoire **consommateur** du design system AI-first. Il transforme les artefacts
produits par [TokenLintel](../TokenLintel) — `tokens.json` (DTCG) et
`<Composant>.contract.json` (UCS) — en composants React de test et offre un
**playground** où un agent compose des interfaces à partir de ces composants.

C'est l'aval du pipeline décrit dans `../TokenLintel/CONCEPT.md` (Phases A→D) :

```
Figma → TokenLintel → { tokens.json + Button.contract.json } → CE REPO → playground
```

## Ordre de lecture

1. [`../TokenLintel/CONCEPT.md`](../TokenLintel/CONCEPT.md) — la vision (UCS,
   co-localisation, ce qu'on cherche à prouver). **À lire en premier.**
2. [`../TokenLintel/TOKENLINTEL-SPEC.md`](../TokenLintel/TOKENLINTEL-SPEC.md) — la forme exacte
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

- `src/tokens/tokens.json` — export DTCG de TokenLintel (source des tokens). **Ne
  pas éditer à la main** : il est ré-exporté depuis Figma.
- `style-dictionary.config.mjs` — pipeline tokens → `src/generated/tokens.css`
  (variables CSS ; chaîne d'alias préservée en `var(--…)`).
- `src/tokens.ts` — `tokenVar(chemin)` : le seul pont token → CSS.
- `src/components/<Nom>/` — **co-localisation** : le `.tsx`, son contrat et
  `index.ts` vivent ensemble.
- `src/App.tsx` — le playground (surface de démonstration, remplaçable).
- `scripts/check-contract.mjs` — garde-fou : `tokensUsed` ⊆ tokens générés.

## Comment consommer un contrat (règles pour composer une UI)

> **Avant d'écrire ou de régénérer un composant**, charger le skill
> [`consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md) : c'est la
> notice complète (tokens, props/intent, rendu des états + focus, modèle
> d'icônes). Elle contient aussi la **dette non tokenisée** (ratio de glyphe,
> style FontAwesome) à appliquer telle quelle. Une reconstruction froide doit
> retrouver le rendu depuis le contrat + ce skill ; le code de production reste
> écrit et validé par un développeur.

1. **Lire le contrat** du composant avant de l'utiliser.
2. Pour les choix visuels, n'utiliser **que** les `props` et leurs `values`
   déclarées. L'API réelle peut ajouter attributs natifs, événements et props
   d'accessibilité, sans inventer de variante visuelle.
3. Respecter `intent` : les `dont` sont des interdits, les `do` des consignes,
   `pairs` des associations recommandées. Les `descriptions` par valeur disent
   **quand** choisir chaque option.
4. Ne pas inventer de style : passer par les props. Toute couleur/dimension
   vient déjà des tokens via le composant.

## Icônes : résolution côté application (pas dans le contrat)

Le contrat UCS ne stocke qu'un **nom d'icône opaque** (ex. `arrow-left-long`) —
jamais un asset ni un kit précis : TokenLintel reste générique. C'est **ce
repo** (l'application) qui résout ce nom en glyphe réel, via le **kit
FontAwesome** chargé dans [`index.html`](./index.html). Si le kit n'est pas
inclus, les icônes ne s'affichent pas — c'est attendu.

Deux politiques, portées par le contrat :

- `strict` → rendre **exactement** le nom Figma exporté ;
- `modifiable` → le contrat expose une prop runtime (`iconLeftName`,
  `iconRightName`…) où l'agent passe n'importe quel nom du kit ; sans valeur, on
  retombe sur le nom Figma d'origine (`icons.<clé>.figmaName`).

Règle de résolution du nom → classe FA (cf. [`Button.tsx`](./src/components/Button/Button.tsx)) :
`fa-regular fa-{nom}`, en retirant un préfixe `fa-` déjà présent (les noms Figma
ne sont pas homogènes).

## Typographie

Open Sans est installée localement avec `@fontsource/open-sans` et chargée dans
`src/main.tsx` pour les graisses 400, 600 et 700. Les composants choisissent la
famille, la graisse, la taille et l'interligne via les tokens du contrat.

## Test froid d'un contrat

Le test reste léger : supprimer temporairement le code du composant, le faire
reconstruire par un agent neuf depuis le contrat et ces conventions, puis
compiler et comparer quelques états représentatifs à Figma. On ne modifie
l'UCS que si une information visuelle est absente ou ambiguë. Le code généré
n'est pas le livrable de production.

## Commandes

```sh
npm install
npm run tokens    # génère src/generated/tokens.css depuis src/tokens/tokens.json
npm run dev       # playground en local (regénère les tokens avant)
npm run build     # typecheck + build de production
npm run check     # tokens + garde-fou contrat ↔ tokens (à passer en CI)
```

## Invariants à ne jamais casser

- **Zéro valeur brute** dans un composant : tout passe par `tokenVar`.
- **Contrat = source de vérité visuelle** : les props et valeurs qui pilotent
  le rendu reflètent le contrat ; les APIs comportementales restent libres.
- **Co-localisation** : contrat et code d'un composant restent dans le même
  dossier.
- **`src/tokens/tokens.json` et les contrats ne s'éditent pas à la main** : ils viennent
  de TokenLintel. Pour les rafraîchir, on ré-exporte depuis Figma.
- Les commentaires non triviaux sont en français et expliquent les décisions
  (mêmes règles que TokenLintel).

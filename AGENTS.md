# UCM Playground — guide pour agents IA (et nouveaux contributeurs)

Laboratoire **consommateur** du pipeline UCM. Il transforme les artefacts
produits par [Unified Component Exporter](../UCM-Exporter) — `tokens.json` (DTCG) et contrats
de composant `.contract.json` — en composants React de test et offre un
**playground** où un agent compose des interfaces à partir de ces composants.

C'est l'aval du pipeline : le concept est dans `../UCM-Exporter/CONCEPT.md`, les
phases (0→F) et prochaines étapes dans `../UCM-Exporter/ROADMAP.md` :

```
Figma → Unified Component Exporter → { tokens.json + Button.contract.json } → CE REPO → playground
```

## Ordre de lecture

1. [`../UCM-Exporter/CONCEPT.md`](../UCM-Exporter/CONCEPT.md) — le concept (UCM,
   arbitrage, co-localisation). **À lire en premier.** Objectif MVP et ce qu'on
   cherche à prouver : [`../UCM-Exporter/ROADMAP.md`](../UCM-Exporter/ROADMAP.md).
2. [`../UCM-Exporter/UCM-EXPORTER-SPEC.md`](../UCM-Exporter/UCM-EXPORTER-SPEC.md) — la forme exacte
   des artefacts consommés ici (schéma du contrat, des tokens).
3. Ce fichier — la carte du repo et les règles de consommation.
4. [`src/components/Button/Button.contract.json`](./src/components/Button/Button.contract.json)
   — un contrat réel : c'est la **source de vérité** d'un composant.

## Principe non négociable : le nom du token EST son chemin

Le contrat cite un token comme RÉFÉRENCE entre accolades —
`{components.button.sizes.medium.gap}` — comme `tokens.json`. `tokenVar` retire
les accolades puis traduit mécaniquement le chemin (`.` → `-`) en variable CSS
`--components-button-sizes-medium-gap` (via [`src/tokens.ts`](./src/tokens.ts)).
**Un composant ne style JAMAIS avec une valeur brute** (`#hex`, `px`, `rem`) :
uniquement avec `tokenVar(ref)` en passant la référence telle quelle depuis le
contrat.
C'est ce qui garantit qu'aucun nom ne diverge de Figma jusqu'au rendu.

## Carte du code

- `src/tokens/tokens.json` — export DTCG de l'exporteur (source des tokens). **Ne
  pas éditer à la main** : il est ré-exporté depuis Figma.
- `style-dictionary.config.mjs` — pipeline tokens → `src/generated/tokens.css`
  (variables CSS ; chaîne d'alias préservée en `var(--…)`).
- `scripts/generate-contract-types.mjs` — pipeline contrats →
  `src/generated/contracts/<Nom>.ts` (unions TypeScript des enums ; même
  principe que `tokens.css` : dérivé, jamais édité à la main). Il **produit**,
  il ne diagnostique pas : un contrat illisible y est sauté, car son diagnostic
  appartient au garde-fou — qui passe avant lui.
- `src/tokens.ts` — `tokenVar(chemin)` : le seul pont token → CSS.
- `src/components/<Nom>/` — **co-localisation** : le contrat peut ouvrir le
  dossier avant le code ; dès qu'ils existent, le `.tsx`, le contrat et
  `index.ts` vivent ensemble.
- `src/App.tsx` — le playground (surface de démonstration, remplaçable).
- `scripts/check-contract.mjs` — garde-fou : le contrat porte les champs sans
  lesquels il ne décrit aucun composant, ses références `{…}` **relevées dans
  le contrat** existent parmi les tokens générés, son index `tokensUsed`
  correspond exactement à ces références, et tout code déjà présent suit le
  contrat (`scripts/parite.mjs`). On ne se contente jamais de relire
  `tokensUsed` : cet
  index vient de l'exporteur, c'est-à-dire de l'outil que ce script contrôle.
  Il écrit le **même diagnostic pour deux lecteurs** : le terminal
  (développeur) et un rapport markdown publié en commentaire de PR (designer) —
  ne pas retirer l'un en « simplifiant » l'autre.
- `scripts/parite.mjs` — parité contrat ↔ code : un contrat sans `.tsx` est
  autorisé et signalé comme « implémentation en attente » ; dès que le
  composant existe, toute prop du contrat doit appartenir à son API publique.
  Un seul sens de lecture, celui de l'arbitrage des sources ; l'API peut
  s'élargir librement aux attributs natifs et props d'accessibilité, qui ne
  relèvent pas du contrat.
- `.github/workflows/ci.yml` — lance `npm run check` et `npm run build` à chaque
  PR et push sur `main`, puis publie le rapport sur la PR.

## Comment consommer un contrat

> **Toute la notice vit dans le skill**
> [`consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md) — tokens,
> props/intent, rendu des états et du focus, modèle d'icônes, typographie,
> dette non tokenisée. Le charger **avant** d'écrire ou de régénérer un
> composant ; une reconstruction froide doit retrouver le rendu depuis le
> contrat + ce skill. Le code de production reste écrit et validé par un
> développeur.

En résumé : lire le contrat avant d'utiliser le composant ; pour les choix
visuels, seules ses `props`/`values` existent ; respecter `intent` (`dont` =
interdits) ; aucune valeur brute — tout style passe par `tokenVar`. Les
attributs natifs, événements et props d'accessibilité complètent librement
l'API sans inventer de variante visuelle.

Un point d'architecture reste propre à ce repo : le contrat ne porte qu'un
**nom d'icône opaque** (jamais un asset ni un kit) ; c'est le **kit
FontAwesome** chargé dans [`index.html`](./index.html) qui le résout en glyphe
réel. Son identifiant vient de `VITE_FA_KIT_ID` (`.env.example` → `.env.local`,
ignoré par git) : c'est un identifiant de compte, il n'est pas versionné. Sans
kit — ou sans variable — les icônes ne s'affichent pas, c'est attendu. Les
politiques `strict`/`modifiable` et la règle nom → classe FA sont dans le skill.

## Test froid d'un contrat

Le test reste volontairement léger :

1. retirer temporairement l'implémentation du composant ;
2. demander à un agent neuf de la reconstruire depuis le contrat et le skill
   [`consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md) ;
3. compiler puis comparer quelques états représentatifs avec Figma ;
4. modifier le contrat ou son export **uniquement** si l'information visuelle
   était absente ou ambiguë.

Le code généré pendant ce test n'est pas le livrable de production.

## Commandes

```sh
npm install
npm test          # tests des garde-fous du repository
npm run tokens    # génère src/generated/tokens.css depuis src/tokens/tokens.json
npm run dev       # playground en local (regénère les tokens avant)
npm run build     # typecheck + build de production
npm run check     # tests + tokens + garde-fous + types (lancé en CI)
```

## Invariants à ne jamais casser

- **Zéro valeur brute** dans un composant : tout passe par `tokenVar`.
- **Contrat = source de vérité visuelle** : les props et valeurs qui pilotent
  le rendu reflètent le contrat ; les APIs comportementales restent libres.
- **Co-localisation progressive** : un nouveau contrat peut être fusionné
  avant son implémentation. Le futur `.tsx` reste attendu dans le même dossier
  et sous le même nom (`Alert.contract.json` → `Alert.tsx`) ; cette convention
  active la parité sans configuration.
- **Toute prop du contrat existe dans le composant dès qu'il est implémenté** :
  l'absence du `.tsx` est informative et autorisée ; sa présence rend la
  parité bloquante. Le design fait foi sur l'API visuelle, le code s'aligne
  (`npm run check` bloque sinon). L'inverse est libre : attributs natifs,
  événements et accessibilité complètent l'API.
- **Plancher de version de contrat** : ce repo refuse un contrat produit par
  une version de schéma antérieure à celle qu'il consomme
  (`VERSION_CONTRAT_MINIMALE` dans `scripts/check-contract.mjs`). Un contrat
  trop ancien tait des informations dont le code dépend — la prop existe, la
  parité la voit, et le rendu ne fait rien. Relever ce plancher quand le code
  se met à dépendre d'un ajout de schéma.
- **`src/tokens/tokens.json` et les contrats ne s'éditent pas à la main** : ils viennent
  de l'exporteur. Pour les rafraîchir, on ré-exporte depuis Figma.
- Les commentaires non triviaux sont en français et expliquent les décisions
  (mêmes règles que l'exporteur).
- **Toute modification se termine par une revue des `.md`** : mettre à jour ce
  qui ne décrit plus la réalité, en décrivant l'état actuel et sans rien
  répéter (règles de rédaction :
  [`../UCM-Exporter/CONTRIBUTING.md`](../UCM-Exporter/CONTRIBUTING.md),
  « Mettre à jour la documentation »).

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
  `src/generated/contracts/<IdentifiantCode>.ts` (unions TypeScript des enums ; même
  principe que `tokens.css` : dérivé, jamais édité à la main). Il **produit**,
  il ne diagnostique pas : un contrat illisible y est sauté, car son diagnostic
  appartient au garde-fou — qui passe avant lui.
- `src/tokens.ts` — `tokenVar(chemin)` : le seul pont token → CSS.
- `src/components/<IdentifiantCode>/` — **co-localisation** : le contrat peut ouvrir le
  dossier avant le code ; dès qu'ils existent, le `.tsx`, le contrat et
  `index.ts` vivent ensemble. `contract.name` garde le nom Figma exact ;
  `scripts/identifiant-code.mjs` en dérive l'identifiant PascalCase commun au
  fichier, au dossier, à la fonction React et à l'interface.
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
- `scripts/validation-contrat.mjs` — validation pure des champs requis par la
  version du contrat, et des ajouts optionnels lorsqu'ils sont présents. Le
  `slot` d'une icône est vérifié contre les slots réels : c'est lui qui situe
  une icône absente du variant de référence, donc absente de `children`.
- `scripts/validation-graphe-contrats.mjs` — validation pure du graphe :
  cibles locales, cohérence slots ↔ `composes`, cardinalité, noms uniques et
  absence de cycles. Deux noms Figma qui convergent vers le même identifiant de
  code sont refusés avant qu'un fichier ou un type en écrase un autre.
- `scripts/parite.mjs` — parité contrat ↔ code : un contrat sans `.tsx` est
  autorisé et signalé comme « implémentation en attente » ; dès que le
  composant existe, toute prop du contrat doit appartenir à son API publique
  et chaque prop contractuelle BOOLEAN doit y rester typée `boolean` puis être
  effectivement lue par la fonction du composant. Pour un composé, la parité
  est **récursive et exacte** : chaque occurrence de `composes` doit être
  rendue une fois en JSX dans la fonction du composant — le JSX d'une preview
  ou d'un helper extérieur ne compte pas, une occurrence ne peut pas en
  satisfaire deux et un rendu en surplus bloque également. Sinon le composant
  redessinerait ou dupliquerait sa dépendance et la composition ne serait plus
  qu'un commentaire.
  Tout se lit **dans la fonction du composant**, retrouvée à travers les
  emballages React (`forwardRef`, `memo`) ou par l'export par défaut ; si elle
  reste introuvable, le garde-fou le dit une fois au lieu d'accuser chaque prop
  et chaque dépendance.
  Cette analyse statique ne prétend pas prouver qu'une `visibilityProp` entoure
  le bon JSX : dès que le composé est implémenté, un test de rendu vérifie
  séparément que `false` retire la dépendance et que `true` la rend. Elle compte
  des occurrences JSX littérales : rendre `n` dépendances par une itération est
  un écart à déclarer, pas un cas qu'elle sait reconnaître.
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
  et sous le même identifiant canonique (`IconButton.contract.json` →
  `IconButton.tsx`), même si `contract.name` vaut `Icon / Button` ; cette
  convention active la parité sans configuration.
- **Toute prop du contrat existe dans le composant dès qu'il est implémenté** :
  l'absence du `.tsx` est informative et autorisée ; sa présence rend la
  parité bloquante. Le design fait foi sur l'API visuelle, le code s'aligne
  (`npm run check` bloque sinon). Une prop BOOLEAN du contrat doit aussi être
  un `boolean` dans l'interface TypeScript et être consommée par le composant :
  la déclarer sans la lire ne suffit pas. L'inverse est libre : attributs natifs,
  événements et accessibilité complètent l'API.
- **Plage explicite de versions de contrat** : ce repo refuse tout schéma qu'il
  n'a pas audité, trop ancien comme trop récent
  (`VERSION_CONTRAT_MINIMALE` / `VERSION_CONTRAT_MAXIMALE` dans
  `scripts/version-contrat.mjs`, aujourd'hui **4.2 uniquement**). Une mineure
  n'est jamais présumée compatible : le 4.2 a déjà porté une rupture. Étendre
  la plage seulement après avoir adapté et testé le consommateur.
- **Un composé ne redessine pas ce qu'il embarque** : les dimensions vivent au
  seul endroit que le contrat leur donne (`sizes`, ou le niveau haut de
  `structure` faute d'axe de tailles), et un slot marqué `composes` se rend en
  réutilisant le composant nommé. Chaque cible possède un contrat local, les
  slots et `composes` gardent le même ordre et la même cardinalité, et le graphe
  ne contient aucun cycle. Dès que le `.tsx` existe, le nombre d'occurrences JSX
  doit être exactement celui de `composes` ; sans `.tsx`, le contrat reste
  fusionnable et simplement signalé « en attente ».
- **`src/tokens/tokens.json` et les contrats ne s'éditent pas à la main** : ils viennent
  de l'exporteur. Pour les rafraîchir, on ré-exporte depuis Figma.
- Les commentaires non triviaux sont en français et expliquent les décisions
  (mêmes règles que l'exporteur).
- **Toute modification se termine par une revue des `.md`** : mettre à jour ce
  qui ne décrit plus la réalité, en décrivant l'état actuel et sans rien
  répéter (règles de rédaction :
  [`../UCM-Exporter/CONTRIBUTING.md`](../UCM-Exporter/CONTRIBUTING.md),
  « Mettre à jour la documentation »).

---
name: consommer-contrat
description: Règles pour transformer un contrat de composant (`<Composant>.contract.json`) en composant React réel du design system, ou pour le régénérer from scratch. Couvre tokens, props/intent, states (stateModel + rendering, focus-visible), et icônes (modèle conteneur+glyphe, style FontAwesome). À charger AVANT d'écrire ou de régénérer un composant du playground, ou dès qu'on parle de rendu d'états, de focus, ou d'icônes d'un composant.
---

# Consommer un contrat de composant

Objectif : une reconstruction froide depuis le contrat + ces règles doit
retrouver fidèlement le rendu, sans re-deviner. C'est un test du contrat, pas la
méthode de production : l'implémentation finale reste écrite par un développeur.
Toute connaissance de rendu vit ici ou dans le contrat, jamais dans un cas
particulier caché dans un `.tsx`.

Le contrat (`<Composant>.contract.json`) est **la source de vérité**. On lit :
`props`, `structure` (children, sizes, variantTokens, variantStrokes),
`stateModel`, `rendering`, `icons`, `intent`, `tokensUsed`.

## 1. Tokens — jamais de valeur brute

Le **nom du token EST son chemin**. On style uniquement via
`tokenVar("chemin.du.token")` (→ `var(--chemin-du-token)`). Aucun `#hex`, `px`,
`rem` ni poids en dur. Une couleur/dimension absente du contrat ne s'invente pas.

## 2. Props & intent

- Pour les choix visuels, n'exposer que les `props` et `values` du contrat.
- Les attributs natifs, événements et props d'accessibilité peuvent compléter
  l'API publique, sans introduire de nouvelle variante visuelle.
- Figer les valeurs d'enum en types TypeScript (l'agent ne peut proposer que du valide).
- Respecter `intent` : `dont` = interdits, `do` = consignes, `descriptions` par
  valeur = **quand** choisir quoi. Les défauts viennent de `props.<x>.default`.

## 3. States — `stateModel` + `rendering`

`stateModel.states[nom].selector` donne le déclencheur web de chaque état
(`:hover`, `:focus-visible`, `:active`, `[disabled]`…), et `stateModel.precedence`
la priorité quand plusieurs sont actifs (ex. `disable > press > focus > hover > default`).

`rendering.roles` dit comment peindre chaque rôle :
- `background` → `background-color` ; `foreground` → `color` (les icônes en héritent) ;
- `border` (align `inside`) → bordure ; `ring` (align `outside`) → **repli `box-shadow`**
  (`0 0 0 <width> <color>`), car il se dessine à l'extérieur sans pousser la mise en page.

Les couleurs/épaisseurs par état viennent de `structure.variantTokens` (peintures)
et `structure.variantStrokes` (contours, avec largeur **tokenisée**). Chaque état
Figma est complet : un rôle absent signifie **ne pas rendre ce rôle**. Ne jamais
fusionner implicitement l'état courant avec `default`.

### Règle focus (impérative)

Le contour natif du navigateur et notre `ring` se **cumulent** au focus clavier
si on n'y prend pas garde. Donc, quand le contrat porte `focus → :focus-visible` :

1. **Supprimer** le contour natif : `outline: "none"` sur l'élément. Notre `ring`
   (rôle du contrat) le remplace — tout aussi visible et accessible.
2. N'afficher le ring de focus **qu'au clavier**. En style inline (pas de
   pseudo-classe), tester `event.currentTarget.matches(":focus-visible")` dans
   `onFocus` : `true` = focus clavier (ring affiché), `false` = focus souris après
   clic (rien, comme dans Figma).

> Les pseudo-classes ne s'expriment pas en style inline : on suit `hover` /
> `focus` / `press` via des événements React (`onMouseEnter`, `onFocus`,
> `onMouseDown`…), aux noms 1:1 avec `stateModel.states`.

## 4. Icônes — modèle conteneur + glyphe

Le contrat ne porte qu'un **nom d'icône opaque** (`icons.<clé>.figmaName`, ex.
`arrow-left-long`). Le glyphe réel est résolu par le **kit FontAwesome** de
`index.html` (intégration côté app, jamais dans le contrat).

- **Visibilité** : booléen du contrat (`iconLeft`…), nom **venu de Figma**.
- **Quelle icône** (`modifiable`) : prop runtime `<booléen>Name` (`iconLeftName`…) ;
  sans valeur → on retombe sur `figmaName`.
- **Classe FA** : `${ICON_STYLE} fa-{nom}`, en retirant un préfixe `fa-` déjà présent.
- **Taille** : le token `size` du slot (`components.icons.sizes.*`) est le **carré
  de sécurité** (footprint + espacement au label), **pas** la taille du glyphe.
  Rendre : conteneur = carré (token) ; glyphe centré à `carré × RATIO`.

```tsx
<span aria-hidden style={{ width: tokenVar(size), height: tokenVar(size),
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      fontSize:`calc(${tokenVar(size)} * ${ICON_GLYPH_RATIO})` }}>
  <i className={faClass(nom)} />
</span>
```

> ⚠️ **Dette assumée — NON tokenisé (pour le moment).** Deux valeurs de rendu
> d'icône ne sont **pas** dans le contrat/les tokens et sont donc des
> **constantes de convention DS**, à appliquer telles quelles jusqu'à leur
> tokenisation future (côté Figma/TokenLintel) :
> - `ICON_GLYPH_RATIO = 0.8` — part visible de l'icône dans le carré de sécurité ;
> - `ICON_STYLE = "fa-regular"` — style FontAwesome du DS (trait fin).
>
> Ce ne sont **pas** des choix libres du composant : ce sont des règles DS
> écrites ici. Le jour où elles deviennent des tokens, remplacer la constante par
> `tokenVar(...)` (ex. `calc(carré × var(--layouts-icons-glyph-ratio))`) — sans
> autre changement de logique.

## 5. Typographie

Depuis `structure.children` (slot `label`) : `fontFamily`, `fontWeight`,
`fontSize`, `lineHeight` — **tous en tokens**. (Les valeurs Figma non-CSS comme
`SemiBold` sont corrigées en amont par les transforms Style Dictionary : le
composant fait juste `tokenVar(...)`.)

## 6. Garde-fou

Après coup : `npm run check` (les `tokensUsed` du contrat ⊆ tokens générés) et
`npm run build`. Les deux verts avant de considérer le composant conforme.

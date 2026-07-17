# Components Playground

Commence par lire [`AGENTS.md`](./AGENTS.md) : il donne l'ordre de lecture, la
carte du code, les commandes et les invariants à ne jamais casser.

Ce repo est l'**aval** du pipeline design system AI-first : il consomme les
artefacts de [`../TokenLintel`](../TokenLintel) (`tokens.json` + contrats UCS)
pour produire du **code React réel** et un **playground** de démonstration.

Rappels critiques :

- **Le nom du token EST son chemin** : styler uniquement via
  `tokenVar("chemin.du.token")`, **jamais** de valeur brute (`#hex`, `px`).
- **Le contrat fait foi** : n'utiliser que les `props`/`values` déclarées et
  respecter `intent` (`dont` = interdits, `descriptions` = quand choisir quoi).
- `tokens/tokens.json` et les `*.contract.json` **ne s'éditent pas à la main** :
  ils sont ré-exportés depuis Figma par TokenLintel.
- Avant PR : `npm run check` (tokens + garde-fou contrat) et `npm run build`,
  les deux verts.
- Commentaires **systématiques en français**, pour un lecteur débutant.

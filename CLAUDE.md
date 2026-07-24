# Components Playground

Commence par lire [`AGENTS.md`](./AGENTS.md) : il donne l'ordre de lecture, la
carte du code, les commandes et les invariants à ne jamais casser.

Ce repo est l'**aval** du pipeline design system AI-first : il consomme les
artefacts de [`../TokenLintel`](../TokenLintel) (`tokens.json` + contrats de composant)
pour produire un **playground** de démonstration et tester la robustesse des
contrats avant l'écriture du code de production par un développeur.

Rappels critiques :

- **Le nom du token EST son chemin** : le contrat le cite comme référence
  `{chemin.du.token}` ; styler uniquement via `tokenVar(ref)` (qui retire les
  accolades), **jamais** de valeur brute (`#hex`, `px`).
- **Le contrat fait foi pour le rendu** : n'utiliser que ses `props`/`values`
  pour les choix visuels et respecter `intent`. Événements, attributs natifs et
  props d'accessibilité peuvent compléter l'API sans inventer de style.
- `src/tokens/tokens.json` et les `*.contract.json` **ne s'éditent pas à la main** :
  ils sont ré-exportés depuis Figma par TokenLintel.
- Avant PR : `npm run check` (tokens + garde-fou contrat) et `npm run build`,
  les deux verts.
- Les commentaires non triviaux sont en français et expliquent les décisions.

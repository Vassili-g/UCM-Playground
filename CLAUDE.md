# UCM Playground

Commence par lire [`AGENTS.md`](./AGENTS.md) : carte du code, invariants à ne
jamais casser et commandes. Pour écrire ou régénérer un composant, charger le
skill [`consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).

> **Interdits absolus** — un agent **ne modifie jamais** un composant `.tsx`
> existant (c’est le livrable du développeur *et* la preuve du test froid),
> n’écrit **aucun** code spécifique à un composant, n’ajoute **aucune**
> bibliothèque de lecture partagée dans `src/`, et n’affaiblit **jamais** un
> garde-fou ou un test pour obtenir du vert. Devant un contrôle rouge : on
> rapporte, on ne répare pas. Détail et unique exception (la reconstruction à
> froid, explicitement demandée) dans [`AGENTS.md`](./AGENTS.md).

Ce repo est l'**aval** du pipeline UCM : il consomme les artefacts de
[`../UCM-Exporter`](../UCM-Exporter) (`tokens.json` + contrats de composant)
pour produire un playground de démonstration. Avant PR : `npm run check` et
`npm run build`, les deux verts.

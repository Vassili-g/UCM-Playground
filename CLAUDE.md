# UCM Playground

Commence par lire [`AGENTS.md`](./AGENTS.md) : carte du code, invariants à ne
jamais casser et commandes. Pour écrire ou régénérer un composant, charger le
skill [`consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).

Ce repo est l'**aval** du pipeline UCM : il consomme les artefacts de
[`../UCM-Exporter`](../UCM-Exporter) (`tokens.json` + contrats de composant)
pour produire un playground de démonstration. Avant PR : `npm run check` et
`npm run build`, les deux verts.

# UCM Playground

Commence par lire [`AGENTS.md`](./AGENTS.md) : carte du code, invariants,
style, tests et commandes — tout y est. Pour écrire ou régénérer un composant, charger le skill
[`consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).

> **Sandbox d’évaluation** — les composants `.tsx` sont des artefacts jetables,
> créés ou remplacés pendant une reconstruction à froid pour mesurer ce que le
> contrat seul permet de produire. Ils ne sont jamais du code de production.
> Un agent n’invente aucune donnée absente du contrat, n’ajoute aucune
> bibliothèque de lecture partagée dans `src/` et n’affaiblit jamais un
> garde-fou ou un test pour obtenir du vert.

Ce repo est l'**aval** du pipeline UCM : il consomme les artefacts de
[`../UCM-Exporter`](../UCM-Exporter) (`tokens.json` + contrats de composant)
pour produire un playground de démonstration. Avant PR : `npm run check` et
`npm run build`, les deux verts.

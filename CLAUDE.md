# UCM Playground

Commence par lire [`AGENTS.md`](./AGENTS.md) et
[`CONTRIBUTING.md`](./CONTRIBUTING.md) : carte du code, invariants, style et
commandes. Pour écrire ou régénérer un composant, charger le skill
[`consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).

> ⚠ **Documentation en partie périmée.** Le code a dépassé des règles écrites
> ici et ailleurs — dont deux invariants de ce fichier. La table
> « Contradictions doc ↔ code » de
> [`../UCM-Exporter/PLAN-INDUSTRIALISATION.md`](../UCM-Exporter/PLAN-INDUSTRIALISATION.md)
> les recense, et chacune porte une **BALISE-PERIMEE** à l'endroit exact où la
> règle fausse est écrite. Avant de traiter une règle documentée comme acquise,
> ouvrir le fichier qu'elle décrit.
> Ce bloc est lui-même une balise : il disparaît avec la dernière (T8.8).

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

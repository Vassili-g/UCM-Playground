# Schéma du contrat — copie

`ucm-contract.schema.json` est **produit par l'exporteur**, dans
`UCM-Exporter/schema/`, où il est dérivé de `src/contract/types.ts`. Le fichier
présent ici en est une copie octet pour octet.

Comme les contrats et `tokens.json`, il ne se corrige pas à la main : il se
recopie depuis l'exporteur. Il n'est ni un artefact dérivé localement — aucun
script de ce repository ne le construit — ni une source de vérité.

## À quoi il sert ici

- `.vscode/settings.json` l'associe à `**/*.contract.json` : l'éditeur signale
  une forme invalide pendant la lecture.
- `scripts/schema-contrat.test.mjs` constate qu'il décrit encore les contrats
  du repository. C'est le seul endroit où sa péremption se voit.

## À quoi il ne sert pas

Il ne refuse aucune pull request. `scripts/validation-contrat.mjs` reste seule
autorité sur la forme d'un contrat : deux autorités sur la même convention
finiraient par diverger, et un contrôle accepterait ce qu'un autre refuse.

Il ne décrit d'ailleurs que la forme. Les renvois internes — une entrée de
`variants` citant une vue absente de `variantViews`, une icône citant un slot
absent — et le format des valeurs tokenisées lui échappent, et sa propre
`description` le dit.

## Quand le rafraîchir

À chaque montée de `VERSION_CONTRAT_MAXIMALE`, et dès qu'un test d'accord
échoue. Copier le fichier depuis `UCM-Exporter/schema/`, sans le modifier.

# Contribuer à UCM Playground

Le Playground prouve qu’un repository peut consommer les contrats et tokens de
l’UCM sans accès à Figma. Le modèle et la répartition des responsabilités sont
définis dans
[le concept UCM](https://github.com/Vassili-g/UCM-Exporter/blob/main/CONCEPT.md).

## Code

- Préférer des fonctions courtes, pures et nommées dans le vocabulaire du
  contrat.
- Garder une seule autorité pour chaque convention : version, identifiant de
  code, référence de token et résolution d’une vue exacte.
- Ne jamais conditionner un validateur au nom d’un composant.
- Ne pas importer un contrat dans le code de production pour décider du rendu.
- Écrire les références de tokens littéralement afin qu’elles restent
  comparables au contrat.
- Limiter les dépendances et conserver TypeScript `strict`.

Les commentaires sont en français. Ils expliquent une décision, une limite du
contrat ou une raison de compatibilité ; ils ne paraphrasent pas le code. Une
fonction exportée non triviale précise son contrat.

## Artefacts et composants

Les fichiers `*.contract.json` et `src/tokens/tokens.json` viennent de
l’Exporter. Ils sont relus, puis fusionnés tels quels ; ils ne sont jamais
retouchés pour satisfaire un contrôle. `schema/ucm-contract.schema.json` vient
de la même source et suit la même règle.

Un contrat peut précéder son composant. Dès qu’un `.tsx` existe, la parité, les
références de tokens du code et les tests co-localisés s’appliquent. Une
référence conservée par un ancien contrat mais absente de `tokens.json` est un
avertissement pour le designer : la source DTCG fait foi et n’est pas retenue
par ses consommateurs. Les événements, l’accessibilité et les attributs natifs
peuvent compléter l’API visuelle.

Les composants existants sont des livrables développeur et des preuves de test
froid. Un agent ne les modifie pas pour obtenir du vert ; les règles détaillées
et l’exception d’une reconstruction explicitement demandée vivent dans
[AGENTS.md](./AGENTS.md).

## Compatibilité

Ce repository lit un seul schéma de contrat. En changer adapte d’abord les
validateurs, le graphe, la génération de types et les tests, réexporte les
contrats, recopie `schema/ucm-contract.schema.json` depuis l’Exporter, vérifie
que les tests de rendu passent, et touche seulement ensuite
`VERSION_CONTRAT_MINIMALE` et `VERSION_CONTRAT_MAXIMALE` dans
`scripts/version-contrat.mjs`. Ce sont les tests qui prouvent l’adaptation, pas
une note écrite à côté du changement.

La compatibilité 8.0 et 9.0+ passe par `scripts/variant-views.mjs`. En 10.0,
les chemins de peintures, les pistes FIXED et les groupes tokenisés partiels
doivent rester validés par les mêmes lecteurs. Aucun lecteur ne doit
réimplémenter localement la résolution d’une vue exacte.

## Tests et rapport

Tout bug corrigé reçoit un test de régression. `scripts/run-tests.mjs` découvre
automatiquement `scripts/*.test.mjs` et `src/**/*.test.tsx`.

Un contrôle bloquant doit apparaître dans le rapport commun. Ajouter une sortie
isolée qui fait échouer la CI sans diagnostic exploitable est un défaut.

Les messages du rapport suivent la charte « Messages destinés au designer » de
[`../UCM-Exporter/CONTRIBUTING.md`](../UCM-Exporter/CONTRIBUTING.md). Le problème
vient avant les éléments concernés. Chaque section donne ensuite les écarts,
l’action, son responsable et l’état de la fusion. Les détails techniques ne
doivent pas interrompre cette lecture.

Avant une pull request :

```sh
npm test
npm run check
npm run build
```

## Documentation

Chaque document a une autorité limitée :

| Document | Rôle |
|---|---|
| `README.md` | Installation, consommation et état du repository |
| `CONTRIBUTING.md` | Règles de code, de test et de documentation |
| `AGENTS.md` | Instructions opérationnelles et interdits propres aux agents |
| `.claude/skills/consommer-contrat/SKILL.md` | Procédure d’un test froid explicitement demandé |
| `.agents/skills/rediger-diagnostics-ucm/SKILL.md` | Rédaction et revue des messages destinés au designer |

Une modification se termine par une revue des documents concernés. Décrire
l’état actuel, supprimer les formulations périmées, préférer un lien à une
répétition et laisser l’historique à Git.

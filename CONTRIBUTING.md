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
retouchés pour satisfaire un contrôle. Le JSON Schema du contrat vient de la
même source, mais ce repository n’en garde aucune copie : il le lit dans le
paquet installé, `@ucm-kit/core/schema`.

Un contrat peut précéder son composant. Dès qu’un `.tsx` existe, la parité et
les références de tokens du code s’appliquent. Un écart de parité **avertit
sans bloquer** : il accuse le composant React, pas le contrat, et personne ne
le corrige en réexportant — refuser la pull request arrêterait le designer,
seule personne incapable d’y répondre. Une
référence conservée par un ancien contrat mais absente de `tokens.json` est un
avertissement pour le designer : la source DTCG fait foi et n’est pas retenue
par ses consommateurs. Les événements, l’accessibilité et les attributs natifs
peuvent compléter l’API visuelle.

Les composants sont des artefacts jetables du sandbox. Ils existent uniquement
pour éprouver à froid la capacité des contrats à décrire des composants Figma
quelconques ; ils ne constituent ni une bibliothèque de production ni des
livrables à préserver. Une reconstruction explicitement demandée peut remplacer
le composant visé, toujours depuis le contrat seul.

## Compatibilité

Ce repository lit un seul schéma de contrat. En changer adapte d’abord les
validateurs, le graphe, la génération de types et leurs tests, réexporte les
contrats, reconstruit des composants représentatifs et les compare à Figma, puis touche
seulement ensuite
`VERSION_CONTRAT_MINIMALE` et `VERSION_CONTRAT_MAXIMALE`. Ce sont les tests qui
prouvent l’adaptation, pas une note écrite à côté du changement.

⚠ **Ces deux constantes ne vivent plus ici.** Elles appartiennent au format, et
donc au paquet `@ucm-kit/core` (`version-contrat.mjs` du kit). Monter la version
lue par ce repository, c’est désormais installer une version du kit qui la lit —
la plage n’est plus un réglage local.

Le repository accepte exactement le contrat décrit dans
[CONTRAT-CONSOMME.md](./CONTRAT-CONSOMME.md).
`variant-views.mjs`, dans `@ucm-kit/core`, est l’unique autorité pour résoudre
une vue exacte ;
aucun lecteur ne réimplémente cette résolution localement. Les chemins de
peintures, pistes FIXED, groupes tokenisés partiels, mesures structurelles et
échantillons restent validés par leurs propriétaires dédiés.

## Tests et rapport

Tout bug d’un validateur ou du code partagé reçoit un test de régression.
`scripts/run-tests.mjs` découvre automatiquement les fichiers `*.test.mjs`,
`*.test.ts` et `*.test.tsx` sous `scripts/` et `src/`. Il n’existe pas de test
propre à chaque composant jetable.

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
| `CONTRAT-CONSOMME.md` | Version acceptée et obligations de lecture du contrat |
| `.claude/skills/consommer-contrat/SKILL.md` | Procédure d’un test froid explicitement demandé |
| `.agents/skills/rediger-diagnostics-ucm/SKILL.md` | Rédaction et revue des messages destinés au designer |

L’historique de compatibilité des schémas n’est plus de ce tableau : il décrit
ce que le producteur publie, et vit chez lui, dans
[`../UCM-Exporter/docs/CHANGELOG-FORMAT.md`](../UCM-Exporter/docs/CHANGELOG-FORMAT.md).

Une modification se termine par une revue des documents concernés. Décrire
l’état actuel, supprimer les formulations périmées, préférer un lien à une
répétition et laisser l’historique à Git.

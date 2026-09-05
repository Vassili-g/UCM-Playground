# UCM Playground — guide agent

Ce repository consomme les contrats et tokens produits par
`../UCM-Exporter`. Le modèle global et les responsabilités sont définis dans
[`../UCM-Exporter/CONCEPT.md`](../UCM-Exporter/CONCEPT.md).

Le repository est un sandbox d’évaluation de l’Exporter. Ses composants React
sont jetables : ils servent uniquement à vérifier, par reconstruction à froid,
qu’un contrat suffit à décrire n’importe quel composant Figma. Ils ne sont ni
des livrables durables ni des implémentations de production.

## Avant de modifier

- Lire [CONTRIBUTING.md](./CONTRIBUTING.md) pour les règles de code, de test et
  de documentation.
- Pour les règles du format, lire
  [`../UCM-Exporter/docs/FORMAT.md`](../UCM-Exporter/docs/FORMAT.md). Ce qu'un
  contrat CONTIENT s'y lit ; ce que le plugin lit dans Figma pour le produire est
  dans
  [`../UCM-Exporter/packages/plugin/SPEC.md`](../UCM-Exporter/packages/plugin/SPEC.md),
  et ne concerne pas ce repository.
- Pour écrire ou reconstruire un composant de validation, charger
  [le skill `consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md).
- Pour un validateur, lire le script concerné et ses tests voisins.
- Pour créer ou modifier un message destiné au designer, charger la skill
  [`rediger-diagnostics-ucm`](./.agents/skills/rediger-diagnostics-ucm/SKILL.md).

> ⚠ **Documentation en partie périmée.** Le code a dépassé des règles écrites
> ici et ailleurs — dont un invariant de ce fichier. La table
> « Contradictions doc ↔ code » de
> [`../UCM-Exporter/PLAN-INDUSTRIALISATION.md`](../UCM-Exporter/PLAN-INDUSTRIALISATION.md)
> les recense, et chacune porte une **BALISE-PERIMEE** à l'endroit exact où la
> règle fausse est écrite. Avant de traiter une règle documentée comme acquise,
> ouvrir le fichier qu'elle décrit.
> Ce bloc est lui-même une balise : il disparaît avec la dernière (T8.8).

## Carte du repository

```text
src/
  components/<IdentifiantCode>/
    <IdentifiantCode>.contract.json
    <IdentifiantCode>.tsx
  components/ContractIcon.tsx
  tokens/tokens.json
  generated/
  tokens.ts
schema/
  ucm-contract.schema.json
ucm.config.json
scripts/
  check.mjs
  check-contract.mjs
  parite.mjs
  echecs-de-tests.mjs
  generate-contract-types.mjs
  types-variants.mjs
  run-tests.mjs
```

**Ni les lecteurs du format, NI LE RAPPORT ne vivent plus ici.** Validation
d'un contrat, graphe de composition, vues de variant, plage de versions, forme
d'une référence, schéma — et, depuis T5.2, le contrôle du repository entier et
chaque phrase du rapport que lit le designer : tout cela est le FORMAT, partagé
par tout repository qui consomme des contrats, et vit dans `@ucm-kit/core`
(`@ucm-kit/core/lecteurs` et `@ucm-kit/core/format`). **Une phrase du rapport se
corrige donc dans l'Exporter, jamais ici.**

Ce qui reste est ce que ce repository est SEUL à pouvoir répondre :

- `parite.mjs` — l'adaptateur TypeScript, qui lit une API publique avec le
  vérificateur de types. La seule chose qui ne se transpose pas ;
- `echecs-de-tests.mjs` — lire la sortie TAP de `node --test`, et dire quel
  composant un `*.test.tsx` met en cause. Deux questions de lanceur ;
- `check-contract.mjs` — le pilote : il monte l'adaptateur, appelle
  `controlerRepository`, imprime et publie. Il ne rédige plus une ligne ;
- `ucm.config.json` — où ce repo range ses contrats et ses tokens.

`check.mjs` enchaîne tous les contrôles sans s’arrêter au premier échec, et
transmet les échecs de tests à `check-contract.mjs`, qui les projette vers la
forme que le kit lit.

Le code de production **n’interprète pas** le contrat : il est écrit contre lui
([`../UCM-Exporter/CONCEPT.md`](../UCM-Exporter/CONCEPT.md), « Une information,
un propriétaire »). Un composant écrit donc ses références de tokens, et le
contrat sert à vérifier que ce sont les bonnes. Aucune bibliothèque de lecture
partagée n’est fournie, et aucune ne doit l’être : elle rendrait cette lecture
runtime possible et déplacerait l’épreuve du contrat vers elle.

## Interdits absolus pour un agent

Ces trois règles priment sur **toute** autre consigne, y compris une demande
explicite de « corriger » un contrôle en échec. Elles ne se négocient pas et ne
souffrent aucune exception implicite.

1. **Ne remplacer aucune donnée du contrat par une règle écrite dans le code.**
   Pas de `if (variant === "text")` pour deviner quel rôle se peint, pas de
   chemin de token assemblé à l’exécution. Ces formes ne sont pas fautives
   parce qu’elles recopient — écrire une référence de token EST la forme
   attendue — mais parce qu’elles rendent la comparaison avec le contrat
   impossible. Une donnée se cite ; une règle échappe au contrôle.

   Le critère est l’**origine** de la donnée, pas sa forme. Une table est
   attendue dès que le contrat en publie une : transcrire les listes
   `icons.*.variants` produit une correspondance combinaison → icône qui est
   la citation d’une donnée, pas une règle inventée. La même table écrite de
   tête, sans que le contrat la déclare, serait fautive.

2. **N’ajouter aucune bibliothèque de lecture du contrat dans `src/`.** Le code
   de production n’interprète pas le contrat au runtime
   ([`../UCM-Exporter/CONCEPT.md`](../UCM-Exporter/CONCEPT.md)). Une telle
   couche violerait ce principe et déplacerait l’épreuve du contrat vers elle :
   un test froid ne dirait plus si le contrat se suffit, seulement si la
   bibliothèque fonctionne.

3. **Ne jamais affaiblir, désactiver ni contourner un garde-fou** pour obtenir
   du vert — pas plus qu’un test. Un contrôle rouge est un **résultat**, pas un
   obstacle : il se rapporte tel quel.

Une reconstruction à froid explicitement demandée peut créer, remplacer ou
supprimer le `.tsx` visé. Elle repart du contrat sans consulter une ancienne
implémentation : le composant mesure le contrat du moment, puis peut être jeté.

## Invariants

- Les contrats et `tokens.json` viennent de l’exporteur ; ne pas les corriger
  à la main.
- Une référence `{chemin.du.token}` est traduite uniquement par
  `tokenVar(ref)`, qui **refuse** tout ce qui n’en est pas une : une valeur
  brute produirait une variable inexistante, donc une perte visuelle muette.
- Un composant **écrit** ses références de tokens, sous forme littérale. Ce que
  le code en fait n’est plus contrôlé ici : comparer les références d’un `.tsx`
  à son contrat relève d’un linter, dont c’est le métier, et pas d’un contrôle
  qui refuse la pull request d’un designer pour l’état du code. `tokenVar`
  reste le garde-fou de l’écriture, à l’exécution.
- `tokens.json` est la source de vérité. Une référence qu'un ancien contrat y
  cherche encore est signalée au designer mais ne bloque pas la fusion ; le
  contrat sera rafraîchi au prochain export du composant. `verdict-bilan.mjs`
  du kit porte seul cette décision de sévérité.
  Le contrôle cherche la référence dans `tokens.json` à son chemin exact, sans
  passer par `tokens.css` ni par aucune traduction de nom : le nom d'un token
  EST son chemin. `tokens-dtcg.mjs`, dans `@ucm-kit/core/lecteurs`, en porte la
  seule définition.
- `@ucm-kit/core/format` définit seul ce qu’est une référence : deux
  définitions finiraient par diverger, et un contrôle accepterait ce qu’un autre
  refuse. Ce repository n’en écrit aucune — `src/tokens.ts` et les scripts
  importent `isTokenReference` et `refPath`. `references-token.mjs` du kit ne
  garde que ce qu’il est seul à savoir faire : ce qui, DANS UN CONTRAT, se
  relève.
- `validation-contrat.mjs` décide seule ce qu’est un contrat acceptable ici. Le
  schéma vendu dans `schema/` ne double pas cette décision : il sert l’éditeur,
  et un test constate qu’il décrit encore les contrats du repository. En faire
  une seconde porte de CI rouvrirait exactement le défaut ci-dessus.
- Les unions d’enum viennent de `npm run types`, pas d’une liste écrite dans le
  composant.
- `contract.name` conserve le nom Figma. Le dossier, le fichier, la fonction et
  les types utilisent l’identifiant canonique produit par `codeIdentifier`, dans
  `@ucm-kit/core/format` — une seule implémentation, celle du kit.
- Deux contrats ne peuvent partager ni nom Figma ni identifiant de code.
- Un contrat sans `.tsx` est valide et signalé comme en attente.
- Dès que le `.tsx` existe, toutes les props du contrat doivent appartenir à
  son API publique.
- Un booléen contractuel reste un `boolean` TypeScript et doit être lu par la
  fonction du composant.
- Un composé réutilise les composants déclarés dans `composes`. Les cibles
  possèdent un contrat local, le graphe est acyclique et la cardinalité JSX est
  exacte.
- Les props applicatives supplémentaires restent autorisées.
- Le repository lit la plage de schémas que publie `version-contrat.mjs` du
  kit (`@ucm-kit/core/lecteurs`) — une seule version d’ordinaire, deux le temps
  d’une migration. Toute autre version
  est refusée, majeure comme mineure. La plage est refermée sur une seule
  version, et les quatre contrats du corpus la portent.
  `variant-views.mjs` est l’unique autorité pour résoudre ce qu’un contrat ne
  recopie pas : une vue exacte — cinq renvois vers cinq catalogues de parties —,
  la projection de référence, le nom Figma d’un variant, l’identifiant
  d’un calque de liaison et les messages de l’export. Y résoudre un renvoi à la
  main, même une fois, finirait par lire une vue que le contrat ne contient pas.
  Les lecteurs valident ensuite la vue sans héritage ni merge.
- Une valeur vide n’est pas écrite : une clé absente dit « rien à
  publier », jamais « inconnu ». Sous un DICTIONNAIRE en revanche la clé est une
  donnée, et l’entrée survit à vide — `stateModel.states.default` vaut `{}`.
  Et ce qui se dérive n’est pas publié : ni index de tokens, ni miroir en texte
  brut des diagnostics. `CHANGELOG-CONTRAT.md` porte l’historique des schémas et
  lui seul. Changer de schéma n’est jamais
  mécanique, et l’ordre compte : adapter les lecteurs, réexporter les contrats,
  vérifier les tests de rendu, PUIS toucher les constantes. Ce sont les tests
  qui prouvent l’adaptation, pas une note écrite à côté du changement ; ce que
  chaque version publie vit dans `CHANGELOG-CONTRAT.md`.
- `composes` sur un slot signifie que ce slot EST le composant nommé. Un calque
  qui l'enveloppe publie son propre flux et range la dépendance dans
  `children` : le rendre revient à rendre ce conteneur, puis le composant
  dedans. Les confondre pose l'alignement du cadre sur le composant, dont le
  `structure.sizing` le neutralise.
- Un slot `stretch` borné garde son remplissage et sa borne, puis centre sa boîte ;
  la taille propre d'une dépendance composée ne remplace jamais celle du cadre.
- Chaque composition de vue exacte reflète son arbre et le `composes` global en
  est l'union ordonnée à cardinalité maximale. Le graphe ne peut donc perdre une
  cible présente seulement hors variante de référence.
- Une absence de dimensionnement se lit comme un contenu qui se suffit : un
  remplissage est publié, une dimension figée cite une variable dans `size`, et
  `structure.sizing` dit toujours comment le composant occupe la place qu'on lui
  donne. Un slot se rend donc en `fit-content` quand le contrat ne dit rien —
  et le composant, lui, ne le fait jamais par défaut.
- `structure.sizing` a trois lectures, pas deux : `fit-content`, `stretch`, ou
  une référence de token à poser telle quelle en `width` / `height`. Le
  troisième cas est une dimension que le design system a nommée, et l'étirer la
  perdrait.

L’analyse statique ne prouve ni le rendu conditionnel d’une `visibilityProp`,
ni la sélection d’une icône, d’une vue ou d’un état. Il n’existe volontairement
aucun test par composant : ces comportements s’évaluent pendant la
reconstruction à froid, puis par comparaison de variantes représentatives avec
Figma. Le skill porte la checklist de cette lecture ; la CI ne doit pas être
présentée comme une preuve visuelle.

## Ce que les contrôles ne vérifient pas

Aucun de ces points n’est couvert, et aucun ne doit être présenté comme une
garantie.

- **La ressemblance avec Figma.** Rien ne compare des images. Seul un outil de
  régression visuelle le ferait.
- **La fraîcheur d’un export.** Rien ne prouve qu’un contrat corresponde au
  dernier état du document Figma ; seule sa date d’export est affichée.
- **L’ordre de priorité des états.** Vérifier que `disable` l’emporte sur
  `hover` demanderait de piloter un navigateur. Hors périmètre.
- **La propriété CSS employée pour un rôle.** `rendering.roles.cssProperties`
  est une indication d’implémentation, pas une contrainte : peindre un fond avec
  `background` plutôt que `background-color` appartient au développeur.
- **Les données du contrat figées ailleurs que dans un chemin de token.** Une
  table sévérité → icône ou un défaut de prop écrit en clair n’est pas détecté
  par la CI ; une reconstruction à froid et sa comparaison à Figma rendent cet
  écart visible.
- **Le contenu de maquette.** `samples` n’est comparé à rien : ni à la parité,
  ni aux références de tokens, ni à un test de composant. Une reconstruction à
  froid s’en sert comme défaut de contenu — c’est ce que la maquette montre —
  mais rien ne le vérifie, et un contrôle rouge ne se « corrige » jamais en y
  touchant. Le texte d’un slot ne se lit pas davantage dans `figmaLayer`, qui
  est une identité Figma : il se lit dans `samples`, ou nulle part.

Une reconstruction rapproche `samples` récursivement, relativement au
propriétaire immédiat : `slotPath` pour une racine, puis ordre de la séquence +
`component` + `figmaLayer` pour les dépendances imbriquées. Elle ne cherche
jamais un nom dans tout l’arbre, ne fusionne pas les homonymes et ne borne pas
la profondeur. Une valeur `false` est explicite ; une clé absente laisse le
contrat enfant fournir son défaut. La procédure complète vit dans
[le skill `consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md#47-échantillons).

Ces adresses sont vérifiées, jamais devinées. `validation-echantillons.mjs` en
est l’unique propriétaire et pose une seule question — cette adresse joint-elle
quelque chose ? Chaque clé d’`args` désigne une prop ou l’axe d’états que la
dépendance publie, et une valeur d’enum est l’une des siennes ; chaque
`masterPath` joint exactement une icône ; chaque `composes` imbriqué est une
dépendance déclarée par son propriétaire immédiat, sans dépasser sa cardinalité
maximale ; chaque `slotPath` — d’une racine comme d’un texte — désigne
exactement un slot de la vue exacte. Ce que ces contrôles ne disent jamais :
QUELLE valeur est la bonne. Une racine omise reste tolérée, parce que
l’Exporter retire sous simple avertissement une dépendance que l’arbre publié
ne situe pas, et qu’un échantillon ne doit jamais dégrader.

## Artefacts dérivés

- `src/generated/tokens.css` vient de Style Dictionary ;
- `src/generated/contracts/*.ts` vient des enums des contrats ;
- un contrat invalide est diagnostiqué avant la génération des types, dont la
  forme de chaque prop : un enum sans `values`, ou dont le défaut sort de sa
  liste, est nommé par le garde-fou au lieu de faire lever le générateur.

Ces fichiers sont régénérés, jamais utilisés comme nouvelle source de vérité.

`schema/ucm-contract.schema.json` n’entre pas dans cette famille : rien ici ne
le construit. C’est une copie de l’artefact publié par l’exporteur, au même
titre qu’un contrat ou que `tokens.json`, et elle se recopie au lieu de se
corriger. Voir [schema/README.md](./schema/README.md).

## Vérification

```sh
npm test
npm run check
npm run build
```

`run-tests.mjs` découvre les tests des validateurs et du code partagé dans
`scripts/` et `src/`, puis les exécute avec `tsx`. Il n’existe pas de suite de
tests par composant : le rendu est éprouvé par reconstruction à froid.

La CI exécute `check` et `build`. Sur une pull request, elle publie
`ci-report.md` pour rendre le diagnostic accessible sans lire les logs.

`check.mjs` enchaîne les étapes **sans s’arrêter au premier échec** : les tests
d’abord, puis les tokens, puis `check-contract` qui publie le rapport. Une
pull request refusée doit toujours porter un message — sinon le designer ne
voit qu’un ✗ sans cause. Les échecs de tests voyagent donc jusqu’au rapport
(`echecs-de-tests.mjs` les relève, `check-contract.mjs` les projette pour le
kit), les abandons du contrôle publient eux aussi, et le workflow complète le
rapport quand la construction échoue ou quand il manque. Un contrôle qui bloque sans figurer dans le rapport est un
défaut, à corriger du côté du rapport.

Le rapport porte aussi ce qui ne bloque pas, et la réciproque ne vaut donc pas :
figurer au rapport ne refuse pas la pull request. Ce que l’export ne peut ni
causer ni corriger s’écrit en ⚠ et laisse fusionner — sans quoi le rapport
arrêterait la seule personne incapable d’y répondre. Deux constats relèvent de
cette règle : les références conservées par les contrats mais absentes de
`tokens.json`, puisque les tokens font foi ; et l’écart contrat ↔ code, qui
accuse un `.tsx` en retard et attend un développeur (`diagnostic-parite.mjs`
du kit).
Corollaire sur les titres : ils disent littéralement ce qui a été trouvé, et
« N contrats invalides » ne s’écrit que si N contrats le sont — l’autorité de
cette définition est `bilanEstBloquant`, celle du titre `enteteDuVerdict`. `meta.diagnostics` conserve les messages destinés au lecteur —
son miroir en texte brut n’existe plus — et il rend avec
`meta.coverage` la projection portable vérifiable. Un `UCM_PORTABLE_PROJECTION_WARNING` dit ce que
l’export **n’a pas pu décrire** ; un `UCM_EXPORT_NOTICE` peut expliquer une
valeur correctement publiée, comme une piste FIXED de grille en pixels.
Sans `avertissements-export.mjs`, elle passait sous un ✅ — exact quant aux
références, trompeur quant au design. Un rapport vert qui tait un point non
décrit est un défaut au même titre qu’un rouge sans message.

Corollaire pour les diagnostics : une référence du code absente du contrat a
**deux** causes possibles — une migration de tokens, ou une propriété que
l’export n’a pas pu décrire. Un même défaut se manifeste d’ailleurs dans
plusieurs sections à la fois (un test qui échoue **et** une référence
orpheline) : chacune doit donc s’abstenir de conclure, `echecs-de-tests.mjs`
comme `diagnostic-tokens.mjs`. Aucune ne peut disculper Figma sans avoir lu les messages de l’export
(`messagesDExport()`, qui lit `meta.diagnostics` puis, sur un contrat d’un
schéma antérieur, `meta.warnings`) — et « pas d’avertissement » (`[]`) se distingue de
« pas vérifié » (`null`), sans quoi les sorties anticipées innocenteraient
l’export sans l’avoir consulté.

Ce que la CI énonce, ce sont ses propres constats. `CONCEPT.md` lui donne la
détection des écarts contrat ↔ code, pas la cause d’une absence dans le
contrat : cette information appartient à l’export. Elle publie donc le fait
qu’elle a prouvé, le voisinage qu’elle mesure (`voisinesDeclarees` —
**une migration emporte un groupe entier, une variable déliée n’emporte qu’une
feuille**), et un renvoi vers les mots de l’export ; jamais une cause
reconstituée. Les avertissements ne sont cités qu’**une fois**, en tête du
rapport quand il est rouge, et les sections y renvoient.

## Test froid

Le test froid évalue la qualité d’un contrat :

1. reconstruire un composant de validation avec le contrat et le skill ;
2. compiler ;
3. comparer quelques variantes et états représentatifs à Figma ;
4. modifier l’export uniquement si une information design était absente ou
   ambiguë.

Le composant reconstruit pendant ce test n’est pas, par ce seul fait, une
implémentation de production.

# UCM Playground — guide agent

Ce repository consomme les contrats et tokens produits par
`../UCM-Exporter`. Le modèle global et les responsabilités sont définis dans
[`../UCM-Exporter/CONCEPT.md`](../UCM-Exporter/CONCEPT.md).

Le repository est un sandbox d’évaluation de l’Exporter. Ses composants React
sont jetables : ils servent uniquement à vérifier, par reconstruction à froid,
qu’un contrat suffit à décrire n’importe quel composant Figma. Ils ne sont ni
des livrables durables ni des implémentations de production.

## Avant de modifier

- Les règles de code, de test et de documentation vivent plus bas dans ce
  fichier : ce dépôt n’a plus de `CONTRIBUTING.md` distinct.
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
  composant un `*.test.tsx` met en cause. Deux questions de lanceur. **Ici, la
  seconde répond toujours `null`** : voir « Ce que le rapport de ce dépôt ne
  peut pas dire » ;
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

**Ce que ce repository est seul à porter.** Tout ce qui décrit la FORME du
contrat a son autorité chez le producteur, et une règle recopiée ici finirait
par contredire celle qui décide. Les renvois ci-dessous sont vérifiés par
`liens-documents.test.mjs`, qui exige le clone frère : un lien mort rend une
règle introuvable au lieu de la répéter, et c'est le seul échange acceptable.

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
- `validation-contrat.mjs` décide seule ce qu’est un contrat acceptable ici. Le
  JSON Schema ne double pas cette décision : il sert l’éditeur, il est lu dans
  le paquet installé (`@ucm-kit/core/schema`), et ce repository n’en garde
  aucune copie. En faire une seconde porte de CI rouvrirait exactement le
  défaut ci-dessus.
- Les unions d’enum viennent de `npm run types`, pas d’une liste écrite dans le
  composant.
- Deux contrats ne peuvent partager ni nom Figma ni identifiant de code :
  `validation-graphe-contrats.mjs` refuse la collision, parce que l’identifiant
  nomme un DOSSIER et un fichier ici.
- Un contrat sans implémentation est valide et signalé comme en attente.
- Dès que l’implémentation existe, toutes les props du contrat doivent
  appartenir à son API publique.
- Un booléen contractuel reste un `boolean` TypeScript et doit être lu par la
  fonction du composant.
- Un composé réutilise les composants déclarés dans `composes`. Les cibles
  possèdent un contrat local, le graphe est acyclique et la cardinalité JSX est
  exacte.
- Les props applicatives supplémentaires restent autorisées.
- Le repository lit la plage de schémas que publie `version-contrat.mjs` du
  kit (`@ucm-kit/core/lecteurs`) : la version COURANTE et la PRÉCÉDENTE. Toute
  autre est refusée, majeure comme mineure. Ce numéro n’est plus écrit ici du
  tout — il arrive avec le paquet, et le monter est un changement de dépendance.
- **Les constantes de version changent en DERNIER.** Une version ne s’accepte
  qu’après avoir adapté les lecteurs concernés, réexporté réellement les
  contrats depuis Figma, reconstruit des composants représentatifs et comparé
  leur rendu à Figma. Un contrat plus ancien que la fenêtre demande un réexport ;
  un contrat plus récent demande d’abord une adaptation, et le réexport seul ne
  le rendra pas lisible.
- Résoudre un renvoi d’un contrat se fait par `variant-views.mjs`, jamais à la
  main : une vue exacte, la projection de référence, le nom Figma d’un variant,
  l’identifiant d’un calque de liaison. Le faire soi-même, même une fois, finit
  par lire une vue que le contrat ne contient pas.

**La forme du contrat elle-même n’est pas décrite ici.** Ce qu’un contrat
publie, ce que son silence dit, comment une vue se partage, ce qu’une dimension
absente signifie, ce que `composes` désigne exactement, ce qu’un échantillon a
le droit de porter — tout cela a UN domicile, et il est chez le producteur :

- la forme, champ par champ :
  [`../UCM-Exporter/docs/FORMAT.md`](../UCM-Exporter/docs/FORMAT.md) ;
- les invariants et leurs bornes, groupés par domaine —
  [portée et forme](../UCM-Exporter/AGENTS.md#portée-et-forme-du-contrat),
  [tokens](../UCM-Exporter/AGENTS.md#tokens-et-variables),
  [composition](../UCM-Exporter/AGENTS.md#composition),
  [arbre des slots](../UCM-Exporter/AGENTS.md#arbre-des-slots),
  [layout et dimensions](../UCM-Exporter/AGENTS.md#layout-dimensions-et-bornes),
  [échantillon de maquette](../UCM-Exporter/AGENTS.md#échantillon-de-maquette).

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
  ni aux références de tokens, ni à un test de composant. Un contrôle rouge ne
  se « corrige » donc jamais en y touchant.

Ce que les contrôles VÉRIFIENT du côté des échantillons, c’est une seule chose :
chaque adresse joint-elle quelque chose ? `validation-echantillons.mjs` en est
l’unique propriétaire, et il ne dit jamais QUELLE valeur est la bonne. La
grammaire de ces adresses — ce qu’un `slotPath`, un `masterPath`, un `args` ou un
`composes` imbriqué désigne, et comment une reconstruction les rapproche — vit
chez le producteur, dans
[`../UCM-Exporter/docs/FORMAT.md`](../UCM-Exporter/docs/FORMAT.md) et
[ses invariants d’échantillon](../UCM-Exporter/AGENTS.md#échantillon-de-maquette),
et la procédure de lecture dans
[le skill `consommer-contrat`](./.claude/skills/consommer-contrat/SKILL.md#47-échantillons).

## Ce que le rapport de ce dépôt ne peut pas dire

**Il n’existe aucun `*.test.tsx` ici, par décision** — les composants sont des
sondes remplaçables, et ce fichier écrit plus bas qu’il n’y a pas de test propre
à chacune. `composantTeste()` ne reconnaissant qu’un `*.test.tsx`, la réponse
`composant` de l’adaptateur vaut `null` pour TOUS les échecs de ce dépôt.

Le tri du kit (`repartirEchecs`) range dans `gardeFous` tout ce qui n’a pas de
composant. **Deux des trois sections du rapport de tests sont donc
structurellement inatteignables depuis ici** : « Le code n’est plus conforme
aux contrats » et « Les tests n’ont pas pu vérifier la conformité ». Elles ne
sont pas mortes — elles s’écrivent chez un repo qui a des tests par composant.

**Ne pas en conclure que `composantTeste` et `assertion` sont du code mort.**
C’est la surface qu’un paquet publié DEMANDE à un adaptateur
(`diagnostic-tests.mjs`, « seul l’adaptateur peut répondre ») ; la couper ferait
mentir le kit sur ce qu’il attend. Elle est couverte sur fixtures par
`scripts/echecs-de-tests.test.mjs`, qui lui donne les `.test.tsx` que ce dépôt
n’a pas.

## Ce qui ne bouge pas d’ici, et pourquoi

Cette liste existe pour qu’une prochaine passe de ménage ne repose pas les
mêmes questions. Elle dit ce qui a été PESÉ et gardé, pas ce qu’on n’a pas
regardé.

- **`scripts/parite.mjs` reste ici.** Pas parce qu’« un adaptateur reste chez
  son consommateur » — le noyau doit être utile seul, et il l’est déjà : ce
  script lui PASSE son adaptateur pendant qu’`ucm check` appelle la même
  orchestration sans. L’obstacle réel est que `parite.mjs` importe
  `typescript`. Faire entrer un compilateur dans un paquet dont l’argument est
  « le format ne dépend de personne » est le prix à peser, et c’est T6.3 qui
  le pèse.
- **`style-dictionary.config.mjs` ne relève pas du même argument.** Sa table
  « nom de graisse → poids » est une connaissance du format et entre dans le
  kit ; la projection CSS reste dans le preset. Ce n’est pas un paquet à
  publier, c’est un objet à déplacer, au prix d’une montée de version.
- **`App.tsx`, `index.html`, Vite, Tailwind, `@fontsource`.** L’étape 3 du test
  froid compare des variantes à Figma : elle demande un navigateur.
- **`.claude/skills/consommer-contrat/SKILL.md`.** Un skill se charge depuis le
  dépôt où l’on travaille, et une reconstruction à froid se fait ici.
- **`scripts/liens-documents.test.mjs`.** Il a déjà attrapé une ancre morte et
  un renvoi cassé par la scission de la spécification. Il rétrécit avec les
  documents ; il ne part pas avec eux.

## Artefacts dérivés

- `src/generated/tokens.css` vient de Style Dictionary ;
- `src/generated/contracts/*.ts` vient des enums des contrats ;
- un contrat invalide est diagnostiqué avant la génération des types, dont la
  forme de chaque prop : un enum sans `values`, ou dont le défaut sort de sa
  liste, est nommé par le garde-fou au lieu de faire lever le générateur.

Ces fichiers sont régénérés, jamais utilisés comme nouvelle source de vérité.

Le JSON Schema du contrat n’est pas de cette famille et n’est pas non plus une
copie d’ici : il est lu dans le paquet installé, `@ucm-kit/core/schema`. Ce
repository en portait un exemplaire jusqu’à T9.1 ; il ne le comparait à rien,
parce que le lecteur qui prétendait le vérifier ouvrait déjà celui du paquet.

## Style et dépendances

Ce que ce dépôt attend d’un changement, au-delà des interdits ci-dessus et des
invariants : des fonctions courtes, pures, nommées dans le vocabulaire du
contrat ; **une seule autorité par convention** — version, identifiant de code,
référence de token, résolution d’une vue exacte —, ce qui vaut aussi entre les
deux dépôts ; des dépendances rares et TypeScript `strict`.

**Aucun validateur ne se conditionne au nom d’un composant.** C’est la même
règle que le producteur s’applique — « aucune logique liée au nom d’un
composant » —, et pour la même raison : un contrôle qui connaît ses sujets ne
mesure plus rien sur le suivant.

Les commentaires sont en français. Ils expliquent une décision, une limite du
contrat ou une raison de compatibilité ; ils ne paraphrasent pas le code. Une
fonction exportée non triviale précise son contrat.

## Les composants sont jetables

Les composants existent uniquement pour éprouver à froid la capacité des
contrats à décrire des composants Figma quelconques. Ils ne constituent ni une
bibliothèque de production ni des livrables à préserver, et une reconstruction
explicitement demandée peut remplacer celui qu’elle vise, toujours depuis le
contrat seul.

Deux conséquences qui se lisent ailleurs dans ce fichier, et qui viennent de
là : il n’existe aucun test propre à un composant, et un écart de parité
avertit sans bloquer — il accuse le composant, pas le contrat, et personne ne
le corrige en réexportant. Refuser la pull request arrêterait le designer,
seule personne incapable d’y répondre.

Les événements, l’accessibilité et les attributs natifs peuvent compléter l’API
visuelle : le contrat décrit le visuel, pas le comportement applicatif.

## Vérification

```sh
npm test
npm run check
npm run build
```

Tout bug d’un validateur ou du code partagé reçoit un test de régression.

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

La FORME de ces messages n’est pas décidée ici. Elle suit la charte « Messages
destinés au designer » de
[`../UCM-Exporter/CONTRIBUTING.md`](../UCM-Exporter/CONTRIBUTING.md), et le
skill [`rediger-diagnostics-ucm`](./.agents/skills/rediger-diagnostics-ucm/SKILL.md)
en porte la procédure : le problème vient avant les éléments concernés, chaque
section donne ensuite les écarts, l’action, son responsable et l’état de la
fusion, et les détails techniques n’interrompent pas cette lecture. Les phrases
elles-mêmes vivent dans le kit depuis T5.2 — une formulation se corrige donc
chez le producteur, jamais ici.

## Documentation

Il reste trois documents et deux skills, et chacun a une autorité limitée :

| Document | Rôle |
|---|---|
| `README.md` | Ce qu’est ce dépôt, comment le lancer, ce qu’il prouve |
| `AGENTS.md` | Carte, interdits, invariants, style, tests et commandes |
| `CLAUDE.md` | Pointeur, et le rappel que les composants sont jetables |
| `.claude/skills/consommer-contrat/SKILL.md` | Procédure d’un test froid explicitement demandé |
| `.agents/skills/rediger-diagnostics-ucm/SKILL.md` | Rédaction et revue des messages destinés au designer |

Tout ce qui décrit le FORMAT vit chez le producteur, à un lien de distance, et
`scripts/liens-documents.test.mjs` vérifie que ces liens atteignent encore leur
cible. `scripts/surface-documentaire.test.mjs` compte les octets de ces
documents et **interdit qu’ils regrossissent** : la tentation, quand une règle
manque, est de la réécrire ici plutôt que d’aller voir où elle est décidée.

Une modification se termine par une revue des documents concernés. Décrire
l’état actuel, supprimer les formulations périmées, préférer un lien à une
répétition et laisser l’historique à Git.

## Test froid

Le test froid évalue la qualité d’un contrat :

1. reconstruire un composant de validation avec le contrat et le skill ;
2. compiler ;
3. comparer quelques variantes et états représentatifs à Figma ;
4. modifier l’export uniquement si une information design était absente ou
   ambiguë.

Le composant reconstruit pendant ce test n’est pas, par ce seul fait, une
implémentation de production.

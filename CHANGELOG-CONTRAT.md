# Historique des schémas de contrat

Ce repository lit **un seul** schéma à la fois. La version exacte vit dans
`scripts/version-contrat.mjs`, et tout écart est refusé — dans les deux sens,
parce que le geste correctif n'appartient pas à la même personne : un contrat
plus ancien se répare par un réexport, un contrat plus récent par une
adaptation des lecteurs.

Ce fichier n'est pas un garde-fou et ne prouve rien. Ce qui protège le
consommateur, ce sont les validateurs et les tests de rendu, qui échouent
quand un contrat n'est pas lisible. Ces notes servent autre chose : relire un
contrat ancien, reprendre un composant écrit contre une version antérieure, ou
reconstruire un composant à froid en sachant ce que sa version publie.

Une entrée se rédige quand la version est adoptée, et décrit ce que le lecteur
doit en savoir — jamais qu'une relecture a eu lieu.

## 4.2

renomme les slots d'icônes. C'est la rupture qui a servi de leçon : une
version mineure peut casser un lecteur, donc aucune version future n'est
présumée compatible, majeure comme mineure.

## 4.3

4.3 rend `structure.children` récursif sur les branches textuelles : un slot
qui contient plusieurs calques texte décrit ses parts au lieu de leur imposer
une typographie unique. La borne basse reste 4.2, dont la forme est un
sous-ensemble — un contrat déjà fusionné garde sa validité, et gagnera ses
parts au prochain réexport. Un composant à un seul texte produit d'ailleurs la
même structure dans les deux versions.

## 4.4

4.4 ajoute l'alignement du conteneur Flex et le remplissage de ses slots : une
reconstruction à froid n'a plus à choisir `alignItems` ou `flexGrow`.

## 4.5

4.5 désigne `structure.sizes.<taille>.fontSize` comme l'unique autorité de la
taille de police quand le composant possède un axe de tailles : le slot de
référence ne doit plus prétendre décrire toutes les tailles.

## 4.6

4.6 remplace cette description par un catalogue de text styles liés aux tokens
et leurs usages complets dans `structure.variantTypography`.

## 4.7

4.7 ferme le dimensionnement : `structure.sizing` publie le comportement du
composant, et `size` décrit la dimension figée de n'importe quel slot, côté par
côté. Une absence se lit dès lors comme un contenu qui se suffit.

## 4.8

4.8 exprime ce comportement en CSS — `width` et `height` valant `stretch` ou
`fit-content` — là où la 4.7 reprenait les axes et les mots de Figma. Les
contrats 4.7 déjà fusionnés restent valides dans leur forme.

## 4.9

4.9 distingue le calque qui EST une dépendance de celui qui l'ENVELOPPE : le
second publie son flux et range la dépendance dans `children`, au lieu de
porter `composes` et de se confondre avec le composant. Un contrat 4.8 reste
valide : sa forme est celle d'un slot-instance, et un cadre gagnera ses
propriétés au prochain réexport.

## 5.0

5.0 documente l'axe d'états et libère les icônes modifiables. Une règle `@prop`
visant `State`/`Status` pose sa description dans
`stateModel.states.<état>.description`, et `props.<icône>Name` peut exister
sans `visibilityProp` : une icône toujours visible est remplaçable comme une
autre, et sa prop runtime prend alors le nom du calque. Audit du consommateur :
les deux changements sont ADDITIFS pour lui. Aucun script ni composant ne lit
`visibilityProp` sur une prop d'icône — les seuls lecteurs de ce nom visent
`structure.children[].visibilityTargets` et les dépendances de composition,
tous deux inchangés — et une description d'état est une donnée neuve, que la
reconstruction à froid peut lire sans rien adapter. Un contrat 4.9 reste donc
valide dans sa forme.

## 5.1

5.1 lit sur le calque ce qu'une couleur peint, au lieu de l'exiger dans le nom
du token. Le dernier segment reste la CLÉ d'une couleur dans
`structure.variantTokens` ; `rendering.roles` gagne une entrée par clé qui ne
nomme aucun des cinq rôles partagés, avec ses `cssProperties`. Audit du
consommateur : la forme du JSON est inchangée et les cinq rôles restent publiés
à l'identique, donc un contrat 5.0 reste valide. Ce qui change pour lui est une
PRÉSOMPTION : une feuille de `variantTokens` peut désormais porter des clés
hors des cinq rôles, et il faut alors lire `rendering.roles[clé].cssProperties`
au lieu de câbler la correspondance. Aucun composant du repo n'est concerné —
Alert, Button et TileLink n'ont que des clés qui nomment un rôle — mais une
reconstruction à froid doit le savoir.

## 5.2

5.2 ouvre chaque axe de `structure.sizing` à une référence de token. Une
dimension figée SANS variable reste `stretch`, comme avant : c'est une taille
de maquette, qui aligne les variants d'un component set. Une dimension figée
qui CITE une variable publie désormais sa référence — le design system a nommé
cette taille, et le composant la porte quel que soit son conteneur. Audit du
consommateur : le champ cesse d'être un enum de deux valeurs. Un axe se lit
donc en trois temps — `fit-content`, `stretch`, ou une référence à poser telle
quelle en `width` / `height`. TileLink est concerné : sa tuile carrée publiait
`stretch` sur les deux axes alors que ses côtés citent un token.

## 5.3

5.3 rend les bornes de taille contractuelles. `bounds` publie `minWidth`,
`maxWidth`, `minHeight` et `maxHeight`, tokenisées, sur `structure` comme sur
n'importe quel slot. Le contrat avait jusqu'ici l'habitude de demander au
designer de RETIRER une borne qu'il ne savait pas écrire ; il la nomme
désormais. Audit du consommateur : le champ est ADDITIF et facultatif, donc un
contrat 5.2 reste valide dans sa forme. Ce qui change pour lui est qu'une
absence de `flexGrow`, d'`alignSelf` et de `size` ne suffit plus à décrire la
taille d'un layer : `bounds` peut la retenir, et l'ignorer rend un composant
trop large. Aucun composant du repo n'est concerné aujourd'hui — ni Alert, ni
Button, ni TileLink ne posent de borne.

## 5.4

5.4 rend le passage à la ligne contractuel. `wrap` publie qu'un conteneur
déborde sur plusieurs lignes, et `rowGap` l'espace entre ces lignes ; les deux
vivent sur `structure` comme sur n'importe quel slot conteneur. La même version
élargit ce qu'un cadre de dépendances publie : ses calques voisins reçoivent
désormais leur slot, leur typographie et leur visibilité au lieu de disparaître
sous un avertissement. Audit du consommateur : les deux champs sont ADDITIFS et
facultatifs, donc un contrat 5.3 reste valide dans sa forme. Ce qui change pour
lui tient en deux lectures. Un `wrap` doit devenir `flex-wrap: wrap`, sans quoi
le rendu tient sur une ligne ce que la maquette étale sur plusieurs ; et un
`rowGap` ABSENT sous `wrap` vaut le `gap` — c'est la lecture de Figma, qui
synchronise ses deux champs, et celle de CSS, dont un `gap` unique vaut pour
les deux axes. Un cadre de dépendances, enfin, ne peut plus être présumé ne
contenir que des `composes`. Aucun composant du repo n'est concerné : ni Alert,
ni Button, ni TileLink ne passent à la ligne, et le cadre d'action d'Alert ne
range que son bouton. Le champ est donc audité sans être encore exercé par un
test de rendu — il le sera avec le premier composant qui emploiera le wrap.

## 5.5

5.5 ferme la perte que la 5.1 laissait ouverte : deux couleurs d'un même
variant dont les variables finissent par le même segment ne se disputent plus
une clé. La clé garde ce segment comme BASE et s'allonge des segments qui
séparent les deux couleurs — `userinput.background` et `divider.background` —
là où l'export n'en publiait qu'une. Audit du consommateur : la forme du JSON
est inchangée, les feuilles restent des objets de références, et un composant
dont aucune clé n'est contestée produit un contrat identique — un contrat 5.4
reste donc valide dans sa forme. Ce qui change pour lui tient en deux
PRÉSOMPTIONS à abandonner. Une clé de feuille peut contenir des POINTS, et ne
doit donc plus être traitée comme un identifiant simple ni comparée à la liste
des cinq rôles ; c'est `rendering.roles[clé].cssProperties` qui répond, clés
allongées comprises. Et aucun des cinq rôles n'est garanti présent : indexer
`feuille.background` en dur cesse d'être sûr sur un composant à plusieurs
surfaces, il faut parcourir les clés de la feuille. Aucun composant du repo
n'est concerné — Alert, Button et TileLink ne peignent qu'une surface par rôle,
donc aucune de leurs clés n'est contestée — mais une reconstruction à froid
doit le savoir. Le champ est audité sans être encore exercé.

## 6.0

6.0 fait descendre `structure.children` partout. L'arbre ne s'arrêtait qu'aux
branches de texte et de dépendance ; il descend désormais dès qu'un descendant
porte une information qu'une feuille ne sait pas exprimer — une couleur, une
taille, un padding — à n'importe quelle profondeur. La même version rend
contractuelles deux dispositions que l'export se contentait d'avertir : la
grille (`layout: "grid"`, `columns`, `rows`, `columnGap`, et `columnSpan` /
`rowSpan` / `justifySelf` sur chaque enfant) et la position absolue (`position:
"absolute"` et `constraints`, les bords d'accroche en vocabulaire CSS). Audit
du consommateur : un contrat 5.5 reste valide dans sa forme, mais TROIS
présomptions tombent. Un enfant de `children` n'est plus forcément un texte ou
une dépendance : il faut parcourir l'arbre récursivement sans supposer la
nature des branches. Un `layout` peut valoir `grid`, et un conteneur qui
l'annonce porte des lignes SANS passer à la ligne — son `rowGap` n'implique
donc plus `wrap`. Et un chemin de `variantTypography` gagne un étage dès qu'un
texte est rangé dans son propre cadre. Aucun composant du repo n'est concerné :
ni Alert, ni Button, ni TileLink n'emploient de grille ou de position absolue.

## 7.0

7.0 ferme deux pertes qu'un composant d'épreuve a rendues visibles. Un champ à
quatre côtés publie désormais le DÉTAIL quand ses côtés citent des variables
différentes : `padding.x`, `padding.y`, `radius` et la largeur d'un stroke
cessent d'être des chaînes et deviennent une référence — la forme courte, quand
tous les côtés la partagent — OU un objet par côté (`left`/`right`,
`top`/`bottom`, `topLeft`/`topRight`/`bottomRight`/`bottomLeft`). Et sous une
grille, c'est la CELLULE qui décide de la boîte : les pistes sont publiées
(`columnSizes`, `rowSizes`, en `1fr` / `fit-content`, `null` pour une piste
figée à la main) et chaque enfant publie son ancre (`columnStart`, `rowStart`,
comptées à partir de 1 comme en CSS). Audit du consommateur : la première
moitié est une RUPTURE de type. Un composant qui écrivait `padding.x` ou
`radius` directement dans une chaîne de style doit tester la forme avant de
l'employer, sinon il produit `[object Object]`. La seconde est additive, avec
une lecture à changer : sous un parent `layout: "grid"`, l'absence de `size` ne
vaut plus `fit-content` mais « la cellule décide » — remplir sa cellule est le
défaut d'un enfant de grille, et ce sont les pistes et son ancre qui disent la
place qu'il occupe. Alert, Button et TileLink ne sont pas concernés : leurs
quatre côtés partagent leur variable, donc leurs contrats gardent la forme
courte, et aucun n'emploie de grille. Les deux formes sont donc auditées sans
être encore exercées par un test de rendu.

## 8.0

8.0 rend la projection portable exacte par variante. `variants` décrit chaque
combinaison réellement présente, y compris une matrice clairsemée et un
COMPONENT standalone ; `propertyBindings` situe les component properties
natives, et `meta.diagnostics` / `meta.coverage` rendent les limites lisibles
par machine. `INSTANCE_SWAP` et `SLOT` deviennent des types de props. Audit du
consommateur : les composants existants restent écrits contre les champs
historiques, mais le validateur contrôle la cohérence de ces nouvelles vues
avant de laisser entrer le contrat. Chaque variante porte aussi ses tokens,
strokes, usages typographiques, icônes situées et dépendances ; le générateur
produit les unions de chaque enum ET le type discriminé des seules combinaisons
réellement présentes. Les props non-enum restent vérifiées par la parité de
l'API publique.

## 9.0

9.0 normalise cette projection sans la réduire. Les blocs complets identiques
vivent dans `variantViews` et chaque variant les référence par `view` ; ses
tokens et strokes restent inline. Les définitions stables des liaisons vivent
dans `propertyBindingDefinitions`, tandis que chaque variant conserve les
`nodeId` exacts de ses cibles. Les trois index historiques de matrice sont
retirés de `structure`, leur information étant déjà portée sans perte par les
vues exactes. Audit du consommateur : les validateurs résolvent la vue avant de
contrôler arbre, typographie, icônes et composition ; le générateur de types
continue de lire les coordonnées inline de `variants`.

## 10.0

10.0 ferme les quatre ambiguïtés révélées par StressTest. Une piste FIXED de
grille conserve exceptionnellement sa valeur CSS en pixels ; les groupes de
padding, radius et stroke width peuvent ne publier que leurs côtés tokenisés
lorsque les autres sont neutres ; le radius appartient aussi aux feuilles ; et
`variantViews.*.paintPlacements` situe chaque clé de fill/stroke par des
chemins de slots exacts. Le consommateur valide et applique ces chemins sans
déduire une cible depuis le nom de la clé.

## 10.1

10.1 ferme la dernière perte d'une grille. Une piste `HUG` se dimensionne sur
son contenu et n'a aucune valeur à publier ; la mesure ne vit que sur l'enfant,
et sans elle la piste retombait à zéro. `structuralSize` la publie donc en
pixels sur un enfant dont TOUTES les pistes couvertes sur un axe sont `HUG`. La
même version fait avertir toute peinture unie posée à la main sur un calque
parcouru : elle disparaissait en silence, et `coverage.portable` annonçait
quand même `complete`. Audit du consommateur : le champ est ADDITIF et
facultatif, donc un contrat 10.0 reste valide dans sa forme, et le second
changement ne touche que `meta`. Ce qui change pour lui tient en une lecture :
`structuralSize` n'est PAS `size` et ne porte jamais de référence — ses valeurs
sont des pixels à poser tels quels, et les passer au résolveur de tokens
produirait une variable CSS fantôme. Sous une piste qui hug, l'absence de
`size` ne suffit donc plus à décrire la boîte d'un enfant : ignorer
`structuralSize` rend la piste vide. StressTest est concerné — les quatre
dernières lignes de sa grille en dépendent — et un test de rendu l'exerce.

## 10.2

10.2 publie ce que la maquette MONTRE, dans une clé racine `samples` que chaque
entrée de `variants` référence par `sample` — la mécanique de `variantViews`,
appliquée au contenu. Ce contenu était déjà là, mais par accident : Figma nomme
un calque texte d'après ce qu'il dit tant que personne ne l'a renommé, si bien
que `figmaLayer` répondait tantôt « quel calque », tantôt « quel texte ». Dans
StressTest, « Titre » a été renommé et son contenu était perdu, quand la
description voisine ne l'avait jamais été. **`figmaLayer` est une identité
Figma ; le contenu d'un slot se lit dans `samples`, ou nulle part.**

Un échantillon porte trois choses. `args` donne les valeurs appliquées dans CE
variant — notamment la visibilité RÉELLE d'un slot optionnel, que `optional` ne
disait pas : il annonçait qu'un slot PEUT être masqué, jamais qu'il l'EST ici.
`text` donne le contenu des slots qu'aucune prop ne porte, situé par son chemin
de slots ET par le nom de son calque. `composes` donne l'usage de chaque
dépendance : ses `args` aux clés publiques de SON contrat, `overrides` pour ce
que ce parent a écrit dedans, et ses propres `composes` pour les imbriquées.

Audit du consommateur, en trois points.

**Rien n'est vérifié.** Aucun contrôle ne compare un échantillon au code, et
aucun ne doit le faire — ni la parité, ni les références de tokens, ni les tests
de rendu. `references-token.mjs` exclut explicitement le champ : un texte de
maquette de la forme « {montant.total} » n'est pas une référence, et le traiter
comme telle enverrait au designer un diagnostic sur une variable que personne
n'a voulue. Seule la FORME est validée : le catalogue existe, chaque renvoi
désigne une entrée réelle, aucune entrée n'est orpheline.

**Le champ est additif et isolable.** Retirer `samples` et les
`variants[].sample` redonne exactement un contrat 10.1, `meta` mis à part. Un
composant écrit contre la 10.1 n'a donc rien à changer, et le contenu ne peut
pas dégrader ce qui l'entoure : il vit hors de `variantViews` pour que le texte,
volatil, ne fasse pas éclater la déduplication des vues, qui est stable. Mesuré
sur les quatre contrats : +1,9 % sur Button (90 variants, un seul échantillon),
+3,9 % sur Alert, +18,1 % sur StressTest, dont les deux variants embarquent
chacun une dizaine de dépendances.

**Le contenu d'une dépendance se lit en deux temps.** Ses valeurs par défaut
vivent dans SON contrat — l'échantillon du variant que `args` désigne — et les
écarts dans `overrides`. C'est la mécanique de Figma elle-même, composant plus
surcharges, et elle évite de recopier le contenu d'Alert dans chaque contrat qui
l'emploie. `overrides` ne porte que `text` et `visible` : toute autre surcharge
décrirait du RENDU, et signalerait alors un manque du contrat NORMATIF de la
dépendance, pas de l'échantillon.

Ce que `args` ne porte pas est énoncé dans la spécification de l'Exporter : il
est publié comme un SOUS-ENSEMBLE, et une clé absente ne veut pas dire que la
maquette ne la pose pas. En cas de désaccord avec une donnée normative, **la
normative l'emporte** : l'échantillon décrit la maquette du jour de l'export.

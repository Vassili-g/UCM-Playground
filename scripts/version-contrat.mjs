/**
 * Compatibilité entre la version de schéma d'un contrat et celle que ce repo
 * sait consommer.
 *
 * Un écart de version a DEUX sens opposés, et les confondre envoie le lecteur
 * dans le mur : un contrat trop ancien tait des informations dont le code
 * dépend, et un ré-export le corrige ; un contrat trop récent vient d'un
 * plugin en avance sur ce repo, et aucun ré-export n'y changera rien — c'est
 * le repo qui doit rattraper. Le verdict distingue donc les deux.
 */

/**
 * Plage de schémas explicitement auditée par ce repo.
 *
 * Les deux bornes sont intentionnelles : l'historique contient des mineures
 * incompatibles (4.2 change le nom des slots d'icônes). Accepter par principe
 * toute future 4.x ferait donc passer un schéma inconnu au vert. Une nouvelle
 * version n'entre dans cette plage qu'après adaptation et validation du
 * consommateur.
 *
 * 4.3 rend `structure.children` récursif sur les branches textuelles : un slot
 * qui contient plusieurs calques texte décrit ses parts au lieu de leur
 * imposer une typographie unique. La borne basse reste 4.2, dont la forme est
 * un sous-ensemble — un contrat déjà fusionné garde sa validité, et gagnera ses
 * parts au prochain réexport. Un composant à un seul texte produit d'ailleurs
 * la même structure dans les deux versions.
 * 4.4 ajoute l'alignement du conteneur Flex et le remplissage de ses slots :
 * une reconstruction à froid n'a plus à choisir `alignItems` ou `flexGrow`.
 * 4.5 désigne `structure.sizes.<taille>.fontSize` comme l'unique autorité de
 * la taille de police quand le composant possède un axe de tailles : le slot
 * de référence ne doit plus prétendre décrire toutes les tailles.
 * 4.6 remplace cette description par un catalogue de text styles liés aux
 * tokens et leurs usages complets dans `structure.variantTypography`.
 * 4.7 ferme le dimensionnement : `structure.sizing` publie le comportement du
 * composant, et `size` décrit la dimension figée de n'importe quel slot, côté
 * par côté. Une absence se lit dès lors comme un contenu qui se suffit.
 * 4.8 exprime ce comportement en CSS — `width` et `height` valant `stretch` ou
 * `fit-content` — là où la 4.7 reprenait les axes et les mots de Figma. Les
 * contrats 4.7 déjà fusionnés restent valides dans leur forme.
 * 4.9 distingue le calque qui EST une dépendance de celui qui l'ENVELOPPE : le
 * second publie son flux et range la dépendance dans `children`, au lieu de
 * porter `composes` et de se confondre avec le composant. Un contrat 4.8 reste
 * valide : sa forme est celle d'un slot-instance, et un cadre gagnera ses
 * propriétés au prochain réexport.
 * 5.0 documente l'axe d'états et libère les icônes modifiables. Une règle
 * `@prop` visant `State`/`Status` pose sa description dans
 * `stateModel.states.<état>.description`, et `props.<icône>Name` peut exister
 * sans `visibilityProp` : une icône toujours visible est remplaçable comme une
 * autre, et sa prop runtime prend alors le nom du calque. Audit du
 * consommateur : les deux changements sont ADDITIFS pour lui. Aucun script ni
 * composant ne lit `visibilityProp` sur une prop d'icône — les seuls lecteurs
 * de ce nom visent `structure.children[].visibilityTargets` et les dépendances
 * de composition, tous deux inchangés — et une description d'état est une
 * donnée neuve, que la reconstruction à froid peut lire sans rien adapter. Un
 * contrat 4.9 reste donc valide dans sa forme.
 * 5.1 lit sur le calque ce qu'une couleur peint, au lieu de l'exiger dans le
 * nom du token. Le dernier segment reste la CLÉ d'une couleur dans
 * `structure.variantTokens` ; `rendering.roles` gagne une entrée par clé qui ne
 * nomme aucun des cinq rôles partagés, avec ses `cssProperties`. Audit du
 * consommateur : la forme du JSON est inchangée et les cinq rôles restent
 * publiés à l'identique, donc un contrat 5.0 reste valide. Ce qui change pour
 * lui est une PRÉSOMPTION : une feuille de `variantTokens` peut désormais
 * porter des clés hors des cinq rôles, et il faut alors lire
 * `rendering.roles[clé].cssProperties` au lieu de câbler la correspondance.
 * Aucun composant du repo n'est concerné — Alert, Button et TileLink n'ont que
 * des clés qui nomment un rôle — mais une reconstruction à froid doit le savoir.
 * 5.2 ouvre chaque axe de `structure.sizing` à une référence de token. Une
 * dimension figée SANS variable reste `stretch`, comme avant : c'est une taille
 * de maquette, qui aligne les variants d'un component set. Une dimension figée
 * qui CITE une variable publie désormais sa référence — le design system a nommé
 * cette taille, et le composant la porte quel que soit son conteneur. Audit du
 * consommateur : le champ cesse d'être un enum de deux valeurs. Un axe se lit
 * donc en trois temps — `fit-content`, `stretch`, ou une référence à poser
 * telle quelle en `width` / `height`. TileLink est concerné : sa tuile carrée
 * publiait `stretch` sur les deux axes alors que ses côtés citent un token.
 * 5.3 rend les bornes de taille contractuelles. `bounds` publie `minWidth`,
 * `maxWidth`, `minHeight` et `maxHeight`, tokenisées, sur `structure` comme sur
 * n'importe quel slot. Le contrat avait jusqu'ici l'habitude de demander au
 * designer de RETIRER une borne qu'il ne savait pas écrire ; il la nomme
 * désormais. Audit du consommateur : le champ est ADDITIF et facultatif, donc un
 * contrat 5.2 reste valide dans sa forme. Ce qui change pour lui est qu'une
 * absence de `flexGrow`, d'`alignSelf` et de `size` ne suffit plus à décrire la
 * taille d'un layer : `bounds` peut la retenir, et l'ignorer rend un composant
 * trop large. Aucun composant du repo n'est concerné aujourd'hui — ni Alert, ni
 * Button, ni TileLink ne posent de borne.
 * 5.4 rend le passage à la ligne contractuel. `wrap` publie qu'un conteneur
 * déborde sur plusieurs lignes, et `rowGap` l'espace entre ces lignes ; les deux
 * vivent sur `structure` comme sur n'importe quel slot conteneur. La même
 * version élargit ce qu'un cadre de dépendances publie : ses calques voisins
 * reçoivent désormais leur slot, leur typographie et leur visibilité au lieu de
 * disparaître sous un avertissement. Audit du consommateur : les deux champs sont
 * ADDITIFS et facultatifs, donc un contrat 5.3 reste valide dans sa forme. Ce qui
 * change pour lui tient en deux lectures. Un `wrap` doit devenir
 * `flex-wrap: wrap`, sans quoi le rendu tient sur une ligne ce que la maquette
 * étale sur plusieurs ; et un `rowGap` ABSENT sous `wrap` vaut le `gap` — c'est
 * la lecture de Figma, qui synchronise ses deux champs, et celle de CSS, dont un
 * `gap` unique vaut pour les deux axes. Un cadre de dépendances, enfin, ne peut
 * plus être présumé ne contenir que des `composes`. Aucun composant du repo n'est
 * concerné : ni Alert, ni Button, ni TileLink ne passent à la ligne, et le cadre
 * d'action d'Alert ne range que son bouton. Le champ est donc audité sans être
 * encore exercé par un test de rendu — il le sera avec le premier composant qui
 * emploiera le wrap.
 * 5.5 ferme la perte que la 5.1 laissait ouverte : deux couleurs d'un même
 * variant dont les variables finissent par le même segment ne se disputent plus
 * une clé. La clé garde ce segment comme BASE et s'allonge des segments qui
 * séparent les deux couleurs — `userinput.background` et `divider.background` —
 * là où l'export n'en publiait qu'une. Audit du consommateur : la forme du JSON
 * est inchangée, les feuilles restent des objets de références, et un composant
 * dont aucune clé n'est contestée produit un contrat identique — un contrat 5.4
 * reste donc valide dans sa forme. Ce qui change pour lui tient en deux
 * PRÉSOMPTIONS à abandonner. Une clé de feuille peut contenir des POINTS, et ne
 * doit donc plus être traitée comme un identifiant simple ni comparée à la
 * liste des cinq rôles ; c'est `rendering.roles[clé].cssProperties` qui répond,
 * clés allongées comprises. Et aucun des cinq rôles n'est garanti présent :
 * indexer `feuille.background` en dur cesse d'être sûr sur un composant à
 * plusieurs surfaces, il faut parcourir les clés de la feuille. Aucun composant
 * du repo n'est concerné — Alert, Button et TileLink ne peignent qu'une surface
 * par rôle, donc aucune de leurs clés n'est contestée — mais une reconstruction
 * à froid doit le savoir. Le champ est audité sans être encore exercé.
 * 6.0 fait descendre `structure.children` partout. L'arbre ne s'arrêtait qu'aux
 * branches de texte et de dépendance ; il descend désormais dès qu'un descendant
 * porte une information qu'une feuille ne sait pas exprimer — une couleur, une
 * taille, un padding — à n'importe quelle profondeur. La même version rend
 * contractuelles deux dispositions que l'export se contentait d'avertir : la
 * grille (`layout: "grid"`, `columns`, `rows`, `columnGap`, et `columnSpan` /
 * `rowSpan` / `justifySelf` sur chaque enfant) et la position absolue
 * (`position: "absolute"` et `constraints`, les bords d'accroche en vocabulaire
 * CSS). Audit du consommateur : un contrat 5.5 reste valide dans sa forme, mais
 * TROIS présomptions tombent. Un enfant de `children` n'est plus forcément un
 * texte ou une dépendance : il faut parcourir l'arbre récursivement sans
 * supposer la nature des branches. Un `layout` peut valoir `grid`, et un
 * conteneur qui l'annonce porte des lignes SANS passer à la ligne — son `rowGap`
 * n'implique donc plus `wrap`. Et un chemin de `variantTypography` gagne un
 * étage dès qu'un texte est rangé dans son propre cadre. Aucun composant du repo
 * n'est concerné : ni Alert, ni Button, ni TileLink n'emploient de grille ou de
 * position absolue.
 * 7.0 ferme deux pertes qu'un composant d'épreuve a rendues visibles. Un champ à
 * quatre côtés publie désormais le DÉTAIL quand ses côtés citent des variables
 * différentes : `padding.x`, `padding.y`, `radius` et la largeur d'un stroke
 * cessent d'être des chaînes et deviennent une référence — la forme courte,
 * quand tous les côtés la partagent — OU un objet par côté (`left`/`right`,
 * `top`/`bottom`, `topLeft`/`topRight`/`bottomRight`/`bottomLeft`). Et sous une
 * grille, c'est la CELLULE qui décide de la boîte : les pistes sont publiées
 * (`columnSizes`, `rowSizes`, en `1fr` / `fit-content`, `null` pour une piste
 * figée à la main) et chaque enfant publie son ancre (`columnStart`, `rowStart`,
 * comptées à partir de 1 comme en CSS). Audit du consommateur : la première
 * moitié est une RUPTURE de type. Un composant qui écrivait `padding.x` ou
 * `radius` directement dans une chaîne de style doit tester la forme avant de
 * l'employer, sinon il produit `[object Object]`. La seconde est additive, avec
 * une lecture à changer : sous un parent `layout: "grid"`, l'absence de `size`
 * ne vaut plus `fit-content` mais « la cellule décide » — remplir sa cellule est
 * le défaut d'un enfant de grille, et ce sont les pistes et son ancre qui disent
 * la place qu'il occupe. Alert, Button et TileLink ne sont pas concernés : leurs
 * quatre côtés partagent leur variable, donc leurs contrats gardent la forme
 * courte, et aucun n'emploie de grille. Les deux formes sont donc auditées sans
 * être encore exercées par un test de rendu.
 * 8.0 rend la projection portable exacte par variante. `variants` décrit chaque
 * combinaison réellement présente, y compris une matrice clairsemée et un
 * COMPONENT standalone ; `propertyBindings` situe les component properties
 * natives, et `meta.diagnostics` / `meta.coverage` rendent les limites lisibles
 * par machine. `INSTANCE_SWAP` et `SLOT` deviennent des types de props. Audit du
 * consommateur : les composants existants restent écrits contre les champs
 * historiques, mais le validateur contrôle la cohérence de ces nouvelles vues
 * avant de laisser entrer le contrat. Chaque variante porte aussi ses
 * tokens, strokes, usages typographiques, icônes situées et dépendances ; le
 * générateur produit les unions de chaque enum ET le type discriminé des seules
 * combinaisons réellement présentes. Les props non-enum restent vérifiées par
 * la parité de l'API publique.
 * 9.0 normalise cette projection sans la réduire. Les blocs complets identiques
 * vivent dans `variantViews` et chaque variant les référence par `view` ; ses
 * tokens et strokes restent inline. Les définitions stables des liaisons vivent
 * dans `propertyBindingDefinitions`, tandis que chaque variant conserve les
 * `nodeId` exacts de ses cibles. Les trois index historiques de matrice sont
 * retirés de `structure`, leur information étant déjà portée sans perte par les
 * vues exactes. Audit du consommateur : les validateurs résolvent la vue avant
 * de contrôler arbre, typographie, icônes et composition ; le générateur de
 * types continue de lire les coordonnées inline de `variants`.
 */
export const VERSION_CONTRAT_MINIMALE = "4.2";
export const VERSION_CONTRAT_MAXIMALE = "9.0";

/** Parse strictement une version de schéma `majeure.mineure`. */
function lireVersion(version) {
  const resultat = /^(\d+)\.(\d+)$/.exec(String(version));
  return resultat ? [Number(resultat[1]), Number(resultat[2])] : null;
}

/** Compare deux couples `[majeure, mineure]`. */
function comparerVersions(gauche, droite) {
  return gauche[0] - droite[0] || gauche[1] - droite[1];
}

/**
 * Verdict sur une version de contrat : `ok`, `ancien` ou `recent`.
 *
 * Une version hors de la plage explicitement supportée est refusée, même si
 * seule sa mineure diffère. Une version illisible est traitée comme ancienne :
 * c'est le seul cas qu'un ré-export peut effectivement corriger.
 *
 * @example verdictDeVersion('4.2') // → 'ok'
 * @example verdictDeVersion('4.1') // → 'ancien'
 * @example verdictDeVersion('4.10') // → 'recent'
 */
export function verdictDeVersion(
  version,
  {
    minimum = VERSION_CONTRAT_MINIMALE,
    maximum = VERSION_CONTRAT_MAXIMALE,
  } = {},
) {
  const courante = lireVersion(version);
  const borneMinimale = lireVersion(minimum);
  const borneMaximale = lireVersion(maximum);

  if (!courante) return "ancien";
  if (!borneMinimale || !borneMaximale || comparerVersions(borneMinimale, borneMaximale) > 0) {
    throw new Error(`Plage de versions de contrat invalide : ${minimum} → ${maximum}.`);
  }
  if (comparerVersions(courante, borneMinimale) < 0) return "ancien";
  if (comparerVersions(courante, borneMaximale) > 0) return "recent";
  return "ok";
}

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
 */
export const VERSION_CONTRAT_MINIMALE = "4.2";
export const VERSION_CONTRAT_MAXIMALE = "5.1";

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

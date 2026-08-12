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
 */
export const VERSION_CONTRAT_MINIMALE = "4.2";
export const VERSION_CONTRAT_MAXIMALE = "4.4";

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
 * @example verdictDeVersion('4.5') // → 'recent'
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

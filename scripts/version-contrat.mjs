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
 * Version de schéma que ce repo sait consommer. Un contrat plus ancien peut
 * **taire** une information dont le code dépend : la prop existe, la parité la
 * voit, et le rendu ne fait pourtant rien. C'est arrivé avec `visibilityProp`
 * sur le label, apparu en 3.1 — un `label={false}` sans effet, tout au vert.
 * Un plancher de version transforme ce silence en refus.
 */
export const VERSION_CONTRAT_MINIMALE = "4.0";

/**
 * Verdict sur une version de contrat : `ok`, `ancien` ou `recent`.
 *
 * Majeure différente = rupture de schéma ; mineure supérieure = ajout
 * compatible, donc accepté. Une version illisible est traitée comme ancienne :
 * c'est le seul cas qu'un ré-export peut effectivement corriger.
 *
 * @example verdictDeVersion('4.1', '4.0') // → 'ok'
 * @example verdictDeVersion('3.2', '4.0') // → 'ancien'
 * @example verdictDeVersion('5.0', '4.0') // → 'recent'
 */
export function verdictDeVersion(version, plancher = VERSION_CONTRAT_MINIMALE) {
  const [majeure, mineure] = String(version).split(".").map(Number);
  const [plancherMajeure, plancherMineure] = String(plancher).split(".").map(Number);

  if (!Number.isInteger(majeure) || !Number.isInteger(mineure)) return "ancien";
  if (majeure > plancherMajeure) return "recent";
  if (majeure < plancherMajeure) return "ancien";
  return mineure >= plancherMineure ? "ok" : "ancien";
}

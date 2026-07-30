/**
 * Forme d'une référence de token, et relevé des références d'un contrat.
 *
 * Un seul module définit ce qu'est une référence, pour la même raison que
 * l'exporteur n'a qu'un `normalizeName()` : deux définitions finiraient par
 * diverger, et un contrôle accepterait ce qu'un autre refuse.
 */

/**
 * Référence complète : la chaîne ENTIÈRE est entre accolades et porte au moins
 * un point séparateur, sans espace ni accolade interne. C'est ce qui distingue
 * `{components.button.sizes.medium.gap}` d'une phrase écrite par le designer
 * dans `intent` ou d'une note comme `{à définir}`.
 */
export const REFERENCE = /^\{[^{}\s]+\.[^{}\s]+\}$/;

/**
 * Début de référence, accolade fermante non exigée.
 *
 * Sert à repérer un chemin **construit** par concaténation, dont seul le début
 * est écrit — `` `{components.button.colors.${color}…` ``. C'est le motif le
 * plus trompeur : il a l'air dynamique alors qu'il fige la convention de
 * nommage du design system dans le code.
 */
export const DEBUT_DE_REFERENCE = /\{[a-z0-9-]+(?:\.[a-z0-9-]+)+/i;

/**
 * Ramasse toute référence présente dans une valeur, à profondeur quelconque.
 * Aucune connaissance du schéma du contrat n'est nécessaire : un champ ajouté
 * plus tard est couvert sans toucher à ce module.
 */
export function collecterReferences(valeur, trouvees = new Set()) {
  if (typeof valeur === "string") {
    if (REFERENCE.test(valeur)) trouvees.add(valeur);
  } else if (Array.isArray(valeur)) {
    for (const item of valeur) collecterReferences(item, trouvees);
  } else if (valeur && typeof valeur === "object") {
    for (const item of Object.values(valeur)) collecterReferences(item, trouvees);
  }
  return trouvees;
}

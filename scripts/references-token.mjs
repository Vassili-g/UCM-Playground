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
 * Chemin du groupe auquel une référence appartient : tout sauf son dernier
 * segment. `{components.button.sizes.medium.gap}` vit dans
 * `components.button.sizes.medium`.
 */
export function cheminParent(reference) {
  const chemin = reference.replace(/^\{|\}$/g, "");
  const dernierPoint = chemin.lastIndexOf(".");
  return dernierPoint === -1 ? null : chemin.slice(0, dernierPoint);
}

/**
 * Références déclarées qui partagent le groupe d'une référence donnée.
 *
 * Ce que ce voisinage permet de distinguer, et c'est le seul fait mesurable
 * dont on dispose : **une migration de tokens emporte un groupe entier, une
 * variable Figma déliée n'emporte qu'une feuille.** Si le contrat déclare
 * encore `…sizes.medium.padding-x` alors que le code cite en vain
 * `…sizes.medium.gap`, le groupe est intact et une seule valeur y manque.
 *
 * Attention à ce que ce compte n'est PAS : une cause. Il ne prouve pas qu'une
 * liaison manque dans Figma, et l'annoncer ainsi retomberait dans le travers
 * qu'on corrige — la CI affirmant un fait dont elle n'est pas propriétaire
 * (cf. `../UCM-Exporter/CONCEPT.md`, « Une information, un propriétaire »).
 * C'est un constat qu'elle possède, à poser à côté de ce que l'export a dit.
 */
export function voisinesDeclarees(reference, declarees) {
  const groupe = cheminParent(reference);
  if (groupe === null) return [];
  return [...declarees].filter(
    (candidate) => candidate !== reference && cheminParent(candidate) === groupe,
  ).sort();
}

/**
 * Ramasse toute référence présente dans une valeur, à profondeur quelconque.
 * Aucune connaissance du schéma du contrat n'est nécessaire : un champ ajouté
 * plus tard est couvert sans toucher à ce module.
 */
/**
 * Le contrat privé de ce qui n'est pas normatif.
 *
 * `collecterReferences` ne connaît volontairement aucun schéma : elle ramasse
 * toute chaîne en forme de référence, à profondeur quelconque. C'est ce qui la
 * rend robuste aux champs ajoutés plus tard — sauf pour celui-ci, qui porte du
 * TEXTE écrit par un designer. « Montant : {montant.total} » dans une maquette
 * n'est pas une référence de token, et la traiter comme telle enverrait au
 * designer un diagnostic sur une variable que personne n'a jamais voulu créer.
 *
 * L'exclusion vit ici, avec la définition d'une référence, plutôt qu'à chacun
 * des deux appels : deux `delete` finiraient par diverger, et l'un des deux
 * contrôles accepterait ce que l'autre refuse.
 */
export function sansEchantillon(contrat) {
  if (!contrat || typeof contrat !== "object") return contrat;
  const { samples: _echantillons, meta: _meta, ...corps } = contrat;
  return corps;
}

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

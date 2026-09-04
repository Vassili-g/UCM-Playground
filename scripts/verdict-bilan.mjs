/**
 * Décide si le bilan d'un contrat doit refuser la pull request.
 *
 * Ce que cette fonction rend est vrai au sens propre : le CONTRAT est
 * inexploitable, incompatible ou incohérent. Deux écarts en sont donc absents,
 * pour la même raison — ils ne disent rien du contrat et personne ne les
 * corrige en réexportant :
 *
 * - les références absentes de `tokens.json`, la source DTCG faisant foi
 *   (publiées par `diagnostic-tokens.mjs`) ;
 * - l'écart de parité contrat ↔ code, qui accuse l'implémentation et attend un
 *   développeur (publié par `check-contract.mjs`, cf. `pariteEnEcart`).
 *
 * Les deux sont des avertissements. Un verdict qui les inclurait refuserait la
 * pull request d'un designer pour l'état du repository, sous un titre qui
 * mentirait sur son contrat.
 */
/**
 * Écrit l'en-tête du rapport rouge, et rien d'autre que ce qui est vrai.
 *
 * « N contrats invalides » accuse un fichier produit par l'export, donc le
 * designer qui l'a produit : ce titre ne s'écrit que si un contrat l'est
 * réellement, au sens de `bilanEstBloquant`, et il annonce alors le compte
 * exact plutôt qu'un « des contrats » suivi d'un « (1 contrat) » qui le
 * dément. Dès qu'aucun contrat n'est en
 * cause, le rapport bascule sur un titre qui nomme le repository — même quand
 * une pull request est refusée par ailleurs. Un rapport peut ainsi refuser une
 * fusion sans jamais désigner le mauvais coupable.
 */
export function enteteDuVerdict(contratsFautifs, avecAvertissements = false) {
  if (contratsFautifs > 0) {
    const pluriel = contratsFautifs === 1 ? "" : "s";
    return [
      `## ❌ ${contratsFautifs} contrat${pluriel} invalide${pluriel}`,
      "",
      "Les contrôles ont détecté des contrats inexploitables, incompatibles ou incohérents.",
      "",
    ];
  }
  return [
    "## ❌ Les contrôles du repository bloquent la fusion",
    "",
    avecAvertissements
      ? "Les contrats sont valides. Les avertissements d'export sont présentés séparément et ne bloquent pas à eux seuls."
      : "Les contrats sont valides. Les sections suivantes indiquent les contrôles en échec.",
    "",
  ];
}

export function bilanEstBloquant(bilan) {
  return bilan.illisible
    || bilan.champsAbsents.length > 0
    || Boolean(bilan.version)
    || bilan.graphe.length > 0
    || bilan.nonListes.length + bilan.fantomes.length > 0
    || bilan.typesTypographiques.length > 0;
}

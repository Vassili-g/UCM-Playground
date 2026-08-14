/**
 * Remonte dans le rapport de CI ce que l'export a signalé.
 *
 * L'exporteur écrit ses avertissements dans `meta.warnings`, et le plugin les
 * publie déjà dans le corps de la pull request. Mais le rapport de CI, lui, se
 * taisait : un composant dont une propriété n'a pas pu être décrite pouvait
 * finir en « ✅ Contrats et tokens cohérents » sans que rien ne le nuance. Le
 * verdict était exact — toutes les références citées existent — et pourtant il
 * se lisait comme un feu vert sur le design, parce qu'une propriété absente du
 * contrat n'est citée par personne et n'a donc aucun écart à produire.
 *
 * Ce module ne juge pas les avertissements : il ne fait que les remettre sous
 * les yeux du designer, au même endroit que le verdict.
 *
 * Un seul est écarté, et c'est un manque du schéma actuel : `meta.warnings` ne
 * porte que de la prose, donc rien ne distingue ce que le designer peut
 * corriger de ce que personne ne peut. Le lien Figma absent tombe à CHAQUE
 * export et n'est corrigeable par personne (l'API ne le donne qu'aux plugins
 * privés d'organisation) : le compter ferait afficher « 1 point signalé » sur
 * tous les exports du monde, et le signal ne voudrait plus rien dire. On le
 * reconnaît donc par son texte, faute de mieux. Le jour où `meta.warnings`
 * portera un `code` et une sévérité, ce filtre disparaîtra au profit de lui.
 * Source du message : `UCM-Exporter/src/contract/exportComponent.ts`.
 */
const AVERTISSEMENTS_STRUCTURELS = [/^Lien vers Figma absent du contrat/];

/** Vrai si l'avertissement décrit une limite que personne ne peut lever. */
function estStructurel(avertissement) {
  return AVERTISSEMENTS_STRUCTURELS.some((motif) => motif.test(avertissement));
}

/** Avertissements d'un contrat sur lesquels le designer peut agir. */
export function avertissementsCorrigeables(contrat) {
  const warnings = contrat?.meta?.warnings;
  if (!Array.isArray(warnings)) return [];
  return warnings.filter((avertissement) =>
    typeof avertissement === "string" && !estStructurel(avertissement));
}

/**
 * Section markdown listant, par contrat, ce que l'export n'a pas pu décrire.
 *
 * Rend un tableau vide quand il n'y a rien à dire : le rapport reste alors
 * exactement ce qu'il était.
 */
export function sectionAvertissementsExport(bilans) {
  const concernes = bilans.filter((bilan) => bilan.avertissements.length > 0);
  if (concernes.length === 0) return [];

  const total = concernes.reduce((somme, bilan) => somme + bilan.avertissements.length, 0);
  const lignes = [
    "",
    `### ⚠️ ${total} point(s) que l'export n'a pas pu décrire`,
    "",
    "Ces points ne bloquent pas la fusion : ce qui a été exporté est cohérent. " +
      "Mais l'information ci-dessous **n'est pas dans le contrat**, donc le composant React ne pourra pas la suivre. " +
      "Chaque point se corrige dans Figma, puis se réexporte.",
    "",
  ];
  for (const bilan of concernes) {
    lignes.push(`**\`${bilan.fichier}\`**`, "");
    lignes.push(...bilan.avertissements.map((avertissement) => `- ${avertissement}`));
    lignes.push("");
  }
  return lignes;
}

/** Résumé d'une ligne pour le terminal, vide s'il n'y a rien à signaler. */
export function resumeTerminalAvertissements(bilans) {
  const total = bilans.reduce((somme, bilan) => somme + bilan.avertissements.length, 0);
  return total === 0
    ? null
    : `⚠ ${total} point(s) signalé(s) par l'export : une information n'a pas pu être décrite ` +
      "dans le contrat. Voir le rapport publié.";
}

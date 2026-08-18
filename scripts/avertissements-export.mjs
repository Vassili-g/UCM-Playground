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
 * Depuis la v8, `meta.diagnostics` distingue une perte portable
 * (`UCM_PORTABLE_PROJECTION_WARNING`) d'une explication
 * (`UCM_EXPORT_NOTICE`). Seule la première demande une correction Figma. Le
 * filtre textuel du lien Figma reste le repli des contrats historiques.
 */
const AVERTISSEMENTS_STRUCTURELS = [/^Lien vers Figma absent du contrat/];

/** Vrai si l'avertissement décrit une limite que personne ne peut lever. */
function estStructurel(avertissement) {
  return AVERTISSEMENTS_STRUCTURELS.some((motif) => motif.test(avertissement));
}

/** Avertissements d'un contrat sur lesquels le designer peut agir. */
export function avertissementsCorrigeables(contrat) {
  const diagnostics = contrat?.meta?.diagnostics;
  if (Array.isArray(diagnostics)) {
    return diagnostics
      .filter((diagnostic) => (
        diagnostic?.code === "UCM_PORTABLE_PROJECTION_WARNING"
        && typeof diagnostic.message === "string"
      ))
      .map((diagnostic) => diagnostic.message);
  }
  const warnings = contrat?.meta?.warnings;
  if (!Array.isArray(warnings)) return [];
  return warnings.filter((avertissement) =>
    typeof avertissement === "string" && !estStructurel(avertissement));
}

/** Titre de la section, cité par les diagnostics qui y renvoient. */
export const TITRE_AVERTISSEMENTS = "⚠️ Ce que l'export n'a pas pu décrire";

/**
 * Section markdown listant, par contrat, ce que l'export n'a pas pu décrire.
 *
 * Rend un tableau vide quand il n'y a rien à dire : le rapport reste alors
 * exactement ce qu'il était.
 *
 * `bloquant` dit si la pull request est refusée par ailleurs. Sur un rapport
 * vert, ces points sont un rappel — rien ne les rattache à un blocage. Sur un
 * rapport rouge, ils en sont une cause possible, et prétendre qu'ils « ne
 * bloquent pas » enverrait chercher ailleurs.
 */
export function sectionAvertissementsExport(bilans, { bloquant = false } = {}) {
  const concernes = bilans.filter((bilan) => bilan.avertissements.length > 0);
  if (concernes.length === 0) return [];

  const total = concernes.reduce((somme, bilan) => somme + bilan.avertissements.length, 0);
  const lignes = [
    "",
    `### ${TITRE_AVERTISSEMENTS} (${total})`,
    "",
    bloquant
      ? "L'information ci-dessous **n'est pas dans le contrat** : le composant React ne peut donc pas la suivre, " +
        "et les contrôles qui la relisent échouent tant qu'elle manque. **Commencez par là** — chaque point se " +
        "corrige dans Figma, puis se réexporte."
      : "Ces points ne bloquent rien pour le moment : ce qui a été exporté est cohérent. " +
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

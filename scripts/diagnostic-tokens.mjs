import { TITRE_AVERTISSEMENTS } from "./avertissements-export.mjs";
import { libelleNombre, rendreDiagnostic } from "./diagnostic-markdown.mjs";

/**
 * Avertit qu'un contrat conserve des références absentes de la source DTCG.
 *
 * `tokens.json` fait foi : un contrat plus ancien ne doit ni empêcher son
 * évolution ni imposer un alias de compatibilité. L'écart reste visible afin
 * que le designer sache quels composants réexporter, mais il n'entre pas dans
 * le verdict bloquant de `check-contract.mjs`.
 */
export function sectionTokensManquants(bilans, { tokensModifies, sourceTokens }) {
  const concernes = bilans.filter((bilan) => bilan.manquants.length > 0);
  if (concernes.length === 0) return [];

  const total = concernes.reduce((somme, bilan) => somme + bilan.manquants.length, 0);
  const details = concernes.flatMap((bilan) =>
    bilan.manquants.map((token) => `**\`${bilan.fichier}\`** : \`${token}\``));

  return rendreDiagnostic({
    severity: "warning",
    title: "Des contrats utilisent des tokens absents de la source",
    count: total,
    itemSingular: "référence",
    summary: `\`${sourceTokens}\` est la source de vérité. Les références ci-dessous n'y existent pas.`,
    detailsTitle: "Références à mettre à jour",
    details,
    action: tokensModifies
      ? "Réexportez les composants concernés pour aligner leurs contrats sur les tokens de cette pull request."
      : "Vérifiez que l'export de tokens est à jour, puis réexportez les composants concernés.",
    status: "Cet avertissement ne bloque pas la fusion.",
  });
}

export function resumeTerminalTokensManquants(bilans, sourceTokens) {
  const total = bilans.reduce((somme, bilan) => somme + bilan.manquants.length, 0);
  return total === 0
    ? null
    : `⚠ ${libelleNombre(total, "référence")} de contrat absente${total === 1 ? "" : "s"} de ${sourceTokens}. ` +
      "Réexportez les composants concernés. Ce point ne bloque pas la fusion.";
}

/**
 * Explique les références présentes dans un `.tsx` mais absentes de son
 * contrat.
 *
 * Ce diagnostic AFFIRMAIT sa cause : une migration de tokens, donc « ne
 * relancez pas l'export ». C'était faux dès qu'une propriété n'avait pas pu
 * être exportée — elle disparaît alors du contrat, le code qui la cite devient
 * fautif sans avoir changé, et le geste appartient au designer. La consigne
 * envoyait exactement à l'opposé.
 *
 * La correction n'est pas de deviner mieux. `CONCEPT.md` donne à la CI la
 * détection des écarts contrat ↔ code, pas la cause d'une absence dans le
 * contrat — cette information appartient à l'export, qui l'a écrite dans
 * `meta.diagnostics`. La CI énonce donc ce qu'elle possède :
 *
 * - le fait qu'elle a prouvé (la référence est citée, elle n'est pas déclarée) ;
 * - l'état du groupe auquel elle appartient (`voisines`), qu'elle mesure ;
 * - l'existence de ce que l'export a signalé, en renvoyant à ses propres mots.
 *
 * Les deux constats posés côte à côte, la lecture est immédiate pour un humain
 * sans qu'aucune machine ait eu à conclure. C'est aussi pourquoi ce module ne
 * fusionne pas ce bloc avec celui des tests en échec : les rapprocher
 * supposerait une cause commune que rien ici ne prouve.
 *
 * `avertissements` porte les points que l'export n'a pas pu décrire. Ce module
 * ne les recopie pas — le rapport les publie une fois, en tête — il compte et
 * renvoie.
 */
export function diagnosticReferencesCodeNonDeclarees(inconnus, avertissements = []) {
  const avecContrat = inconnus.filter(({ sansContrat }) => !sansContrat);
  const sansContrat = inconnus.filter(({ sansContrat: absent }) => absent);
  const lignes = [];

  if (avecContrat.length > 0) {
    const details = avecContrat.map(({ fichier, ligne, reference, voisines }) => {
      const voisinage = (voisines?.length ?? 0) > 0
        ? `Groupe encore déclaré : ${voisines
          .slice(0, 3)
          .map((voisine) => `\`${voisine}\``)
          .join(", ")}${voisines.length > 3 ? ", …" : ""}.`
        : "Aucune autre référence du groupe n'est déclarée.";
      return `\`${fichier}\`, ligne ${ligne} : \`${reference}\`. ${voisinage}`;
    });
    const action = avertissements.length > 0
      ? [
        `Vérifiez les ${libelleNombre(avertissements.length, "avertissement")} dans la section « ${TITRE_AVERTISSEMENTS} ».`,
        "Si l'un concerne la même propriété, corrigez Figma puis réexportez. Sinon, un développeur doit mettre à jour le code.",
      ]
      : "Un développeur doit remplacer ou retirer ces références pour suivre les contrats à jour.";

    lignes.push(...rendreDiagnostic({
      severity: "error",
      title: "Le code React utilise des tokens absents des contrats",
      count: avecContrat.length,
      itemSingular: "référence",
      summary: "Les références suivantes ne sont pas déclarées par les contrats co-localisés.",
      detailsTitle: "Références détectées",
      details,
      action,
      status: "La fusion reste bloquée.",
    }));
  }

  if (sansContrat.length > 0) {
    lignes.push(...rendreDiagnostic({
      severity: "error",
      title: "Des fichiers React utilisent des tokens sans contrat",
      count: sansContrat.length,
      itemSingular: "référence",
      summary: "La CI ne peut pas vérifier ces références sans contrat co-localisé.",
      detailsTitle: "Références détectées",
      details: sansContrat.map(
        ({ fichier, ligne, reference }) => `\`${fichier}\`, ligne ${ligne} : \`${reference}\``,
      ),
      action: "Un développeur doit ajouter le contrat correspondant ou retirer ces références.",
      status: "La fusion reste bloquée.",
    }));
  }

  return lignes;
}

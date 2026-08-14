import { TITRE_AVERTISSEMENTS } from "./avertissements-export.mjs";

/** Conseils contextuels lorsque des contrats citent des tokens absents. */
export function conseilTokensManquants({ tokensModifies, sourceTokens }) {
  if (tokensModifies) {
    return [
      `Cette pull request modifie \`${sourceTokens}\` et retire ou déplace des tokens encore ` +
        "cités par les contrats listés ci-dessus. Relancer le même export de tokens ne corrigera rien.",
      "",
      "1. dans Figma, réexportez les composants concernés avec Unified Component Exporter ;",
      "2. adaptez leurs implémentations aux nouvelles références ;",
      "3. regroupez tokens, contrats et code dans une même migration, ou conservez temporairement des alias de compatibilité.",
      "",
    ];
  }

  return [
    `Ces tokens sont absents de \`${sourceTokens}\`. C'est le signe habituel qu'un token a ` +
      "été **renommé, déplacé ou ajouté dans Figma** sans que les tokens du repository aient suivi.",
    "",
    "1. dans Figma, lancez **Exporter les tokens** avec Unified Component Exporter ;",
    "2. validez la pull request qu'il ouvre : elle met `tokens.json` à jour ;",
    "3. cette vérification repassera alors au vert toute seule.",
    "",
  ];
}

export function conseilTerminalTokensManquants({ tokensModifies, sourceTokens }) {
  return tokensModifies
    ? `Tokens retirés ou déplacés par cette PR dans ${sourceTokens} : réexportez les composants ` +
      "concernés et regroupez la migration ; ne relancez pas le même export de tokens."
    : `Tokens absents de ${sourceTokens} : réexportez les tokens depuis Figma ` +
      "(« Exporter les tokens »), puis relancez « npm run check ».";
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
 * `meta.warnings`. La CI énonce donc ce qu'elle possède :
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
    // Un groupe encore déclaré distingue la feuille manquante de la famille
    // disparue. On le dit référence par référence : deux écarts du même
    // fichier n'ont pas forcément la même histoire.
    const groupesIntacts = avecContrat.filter(({ voisines }) => (voisines?.length ?? 0) > 0);

    lignes.push(
      "### 🧩 Le code React cite des tokens absents du contrat",
      "",
      "Ces lignes citent des tokens qui ne font pas partie du contrat co-localisé :",
      "",
      ...avecContrat.map(({ fichier, ligne, reference, voisines }) => {
        const voisinage = (voisines?.length ?? 0) > 0
          ? ` — son groupe est pourtant toujours déclaré (${voisines
            .slice(0, 3)
            .map((voisine) => `\`${voisine}\``)
            .join(", ")}${voisines.length > 3 ? ", …" : ""})`
          : " — aucune référence de son groupe n'est déclarée";
        return `- \`${fichier}\`, ligne ${ligne} : \`${reference}\`${voisinage}`;
      }),
      "",
    );

    if (avertissements.length > 0) {
      lignes.push(
        `Cet export a par ailleurs signalé ${avertissements.length} information(s) qu'il n'a pas pu décrire — voir « ${TITRE_AVERTISSEMENTS} » en tête de ce rapport. Une propriété non décrite est absente du contrat, et le code qui la cite reste fautif tant qu'elle manque. **Si l'un de ces points correspond à l'une des références ci-dessus, le geste est dans Figma** : corrigez-le, réexportez, et ces lignes redeviendront valides sans qu'on touche au code.`,
        "",
      );
    }

    if (groupesIntacts.length > 0 && avertissements.length === 0) {
      lignes.push(
        "Aucun point non décrit n'a été signalé par cet export, et le groupe de ces références y est toujours déclaré : ce sont donc des valeurs que le design ne porte plus.",
        "",
      );
    }

    lignes.push(
      "**Action attendue :** si rien dans Figma n'explique ces absences, un développeur adapte ces composants aux contrats à jour, dans cette même pull request. La fusion est bloquée jusque-là pour ne pas conserver un rendu fondé sur une structure de tokens qui n'existe plus.",
      "",
    );
  }

  if (sansContrat.length > 0) {
    lignes.push(
      "### 🧩 Des fichiers React citent des tokens sans contrat co-localisé",
      "",
      ...sansContrat.map(
        ({ fichier, ligne, reference }) => `- \`${fichier}\`, ligne ${ligne} : \`${reference}\``,
      ),
      "",
      "Ajoutez le contrat correspondant ou retirez ces références : sans contrat, la CI ne peut pas vérifier que le code suit Figma.",
      "",
    );
  }

  return lignes;
}

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
 * contrat. Le contrat et ses tokens ont déjà passé leurs propres contrôles :
 * conseiller un nouvel export renverrait donc le designer vers une étape
 * terminée, alors que le geste restant appartient au développeur.
 *
 * Sauf dans un cas, et il est fréquent : l'export a signalé qu'une propriété
 * n'a pas pu être décrite. Elle disparaît alors du contrat, et le code qui la
 * cite encore devient fautif — sans que le développeur y soit pour rien. Le
 * geste appartient au designer, et « ne relancez pas l'export » serait
 * exactement l'inverse de ce qu'il faut faire. On ne peut pas relier une
 * référence orpheline à un avertissement précis — `meta.warnings` ne porte que
 * de la prose, pas le champ de contrat concerné — mais on peut cesser
 * d'affirmer une cause quand une autre est ouvertement possible.
 *
 * `avecAvertissements` dit si au moins un des contrats concernés a signalé un
 * point non décrit.
 */
export function diagnosticReferencesCodeNonDeclarees(inconnus, avecAvertissements = false) {
  const avecContrat = inconnus.filter(({ sansContrat }) => !sansContrat);
  const sansContrat = inconnus.filter(({ sansContrat: absent }) => absent);
  const lignes = [];

  if (avecContrat.length > 0) {
    lignes.push(
      "### 🧩 Le code React cite des tokens absents du contrat",
      "",
      "Toutes les références que le contrat déclare existent bien. " +
        "Les lignes ci-dessous appartiennent au code existant : elles citent des tokens qui ne font pas partie du contrat co-localisé.",
      "",
      ...avecContrat.map(
        ({ fichier, ligne, reference }) => `- \`${fichier}\`, ligne ${ligne} : \`${reference}\``,
      ),
      "",
    );
    lignes.push(
      ...(avecAvertissements
        ? [
          "**Deux causes possibles, et il faut les distinguer avant d’agir :**",
          "",
          "1. **Une propriété n’a pas pu être exportée.** Cet export a signalé des points non décrits (voir la section ⚠️ de ce rapport). Une propriété qu’il n’a pas pu décrire disparaît du contrat, et le code qui la cite encore devient fautif sans avoir changé. **Commencez par là :** corrigez ces points dans Figma, réexportez, et ces lignes redeviendront valides toutes seules.",
          "2. **Une migration de tokens.** Si les points ci-dessus ne concernent aucune de ces références, alors le code est resté sur l’ancienne structure : un développeur doit adapter ces composants aux nouveaux contrats, dans cette même pull request.",
          "",
          "La fusion est bloquée jusque-là pour éviter de conserver un rendu fondé sur une structure de tokens qui n’existe plus.",
          "",
        ]
        : [
          "**Action attendue :** ne relancez pas l’export — il n’a signalé aucun point non décrit, donc rien ne manque au contrat. Le code est resté sur l’ancienne structure : un développeur doit reconstruire ou adapter ces composants à partir des nouveaux contrats, puis inclure cette mise à jour dans la pull request. La fusion est bloquée jusque-là pour éviter de conserver un rendu fondé sur l’ancienne structure des tokens.",
          "",
        ]),
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

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
 */
export function diagnosticReferencesCodeNonDeclarees(inconnus) {
  const avecContrat = inconnus.filter(({ sansContrat }) => !sansContrat);
  const sansContrat = inconnus.filter(({ sansContrat: absent }) => absent);
  const lignes = [];

  if (avecContrat.length > 0) {
    lignes.push(
      "### 🧩 Les contrats sont à jour ; le code React n’est pas encore aligné",
      "",
      "L’export Figma est valide et toutes les références qu’il déclare existent. " +
        "Les lignes ci-dessous appartiennent au code existant : elles citent des tokens qui ne font pas partie du contrat co-localisé. Après une migration de tokens, ce sont généralement des références de l’ancienne structure.",
      "",
      ...avecContrat.map(
        ({ fichier, ligne, reference }) => `- \`${fichier}\`, ligne ${ligne} : \`${reference}\``,
      ),
      "",
      "**Action attendue :** ne relancez pas l’export. Un développeur doit reconstruire ou adapter ces composants à partir des nouveaux contrats, puis inclure cette mise à jour dans la pull request. La fusion est bloquée jusque-là pour éviter de conserver un rendu fondé sur l’ancienne structure des tokens.",
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

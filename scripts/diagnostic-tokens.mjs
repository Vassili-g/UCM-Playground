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

/**
 * Configuration Style Dictionary v4 — pipeline « tokens → CSS ».
 *
 * Rôle : transformer `tokens/tokens.json` (format DTCG produit par TokenLintel)
 * en variables CSS consommables par les composants React.
 *
 * Principe directeur (cf. CONCEPT.md, Phase A) : **le nom du token EST son
 * chemin**. Un token `components.button.colors.primary.contained.default.background`
 * devient la variable CSS `--components-button-colors-primary-contained-default-background`.
 * Aucun renommage : le même nom vaut de Figma jusqu'au CSS, donc un composant
 * ne peut pas diverger du contrat.
 *
 * `outputReferences: true` préserve la chaîne d'alias jusque dans le CSS
 * (`--brand-tokens-primary-default: var(--brands-intencial-primary-400)`),
 * fidèle au principe TokenLintel « on n'aplatit jamais un alias ».
 */
export default {
  // `tokens.json` utilise la syntaxe DTCG (`$value` / `$type`) : on l'active.
  usesDtcg: true,
  source: ["tokens/tokens.json"],
  platforms: {
    css: {
      // `css` applique `name/kebab` : le chemin du token, segments joints par
      // des tirets et en minuscules — exactement notre convention de nommage.
      transformGroup: "css",
      buildPath: "src/generated/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            // Garde la chaîne d'alias visible en `var(--…)` au lieu de l'aplatir.
            outputReferences: true,
          },
        },
      ],
    },
  },
};

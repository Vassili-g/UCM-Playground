/**
 * Configuration Style Dictionary v4 — pipeline « tokens → CSS ».
 *
 * Rôle : transformer `tokens/tokens.json` (format DTCG produit par TokenLintel)
 * en variables CSS consommables par les composants React.
 *
 * Principe directeur (cf. TokenLintel/CONCEPT.md, Phase A) : **le nom du token EST son
 * chemin**. Un token `components.button.colors.primary.contained.default.background`
 * devient la variable CSS `--components-button-colors-primary-contained-default-background`.
 * Aucun renommage : le même nom vaut de Figma jusqu'au CSS, donc un composant
 * ne peut pas diverger du contrat.
 *
 * `outputReferences: true` préserve la chaîne d'alias jusque dans le CSS
 * (`--brand-tokens-primary-default: var(--brands-intencial-primary-400)`),
 * fidèle au principe TokenLintel « on n'aplatit jamais un alias ».
 *
 * Deux transforms « valeur » corrigent des tokens dont la valeur Figma n'est
 * pas du CSS valide (le NOM/chemin du token, lui, ne change jamais) :
 * - la graisse est exportée comme nom de style Figma (« SemiBold ») ; le CSS
 *   veut un nombre (600) ;
 * - la famille est exportée nue (« Open Sans ») ; le CSS veut des guillemets
 *   quand il y a une espace, plus un repli générique.
 * C'est exactement le rôle d'un transform Style Dictionary (traduire une valeur
 * vers une plateforme). Figma garde ses valeurs, le composant garde `tokenVar`.
 */
import StyleDictionary from "style-dictionary";

/** Noms de graisses Figma → poids CSS numériques (comparaison sans casse ni
 *  séparateur : « Semi Bold », « semibold »… tombent tous sur 600). */
const FONT_WEIGHTS = {
  thin: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  book: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
};

StyleDictionary.registerTransform({
  name: "fontWeight/name-to-number",
  type: "value",
  transitive: true,
  // On cible le groupe `layouts.fontweight.*` par son chemin, sans jamais coder
  // en dur un token précis (générique : tout token de graisse est concerné).
  filter: (token) => token.path.includes("fontweight"),
  transform: (token) => {
    // En mode DTCG, la valeur vit sur `$value` (repli sur `value` sinon).
    const raw = token.$value ?? token.value;
    const key = String(raw).toLowerCase().replace(/[\s_-]/g, "");
    return FONT_WEIGHTS[key] ?? raw;
  },
});

StyleDictionary.registerTransform({
  name: "fontFamily/css-quote",
  type: "value",
  transitive: true,
  filter: (token) => token.path.includes("fontfamily"),
  transform: (token) => {
    const family = String(token.$value ?? token.value).trim();
    // Guillemets si la famille contient une espace, puis repli sans-serif.
    const quoted = /\s/.test(family) ? `"${family}"` : family;
    return `${quoted}, sans-serif`;
  },
});

// On étend le groupe `css` standard avec nos deux transforms, sans réécrire la
// liste (robuste aux évolutions de Style Dictionary).
StyleDictionary.registerTransformGroup({
  name: "css-ds",
  transforms: StyleDictionary.hooks.transformGroups.css.concat([
    "fontWeight/name-to-number",
    "fontFamily/css-quote",
  ]),
});

export default {
  // `tokens.json` utilise la syntaxe DTCG (`$value` / `$type`) : on l'active.
  usesDtcg: true,
  source: ["tokens/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css-ds",
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

/**
 * Configuration Style Dictionary v4 — pipeline « tokens → CSS ».
 *
 * Rôle : transformer `tokens.json` (format DTCG produit par Unified Component Exporter)
 * en variables CSS consommables par les composants React.
 *
 * Principe directeur (cf. UCM-Exporter/CONCEPT.md) : **le nom du token EST son
 * chemin**. Un token `components.button.colors.primary.contained.default.background`
 * devient la variable CSS `--components-button-colors-primary-contained-default-background`.
 * Aucun renommage : le même nom vaut de Figma jusqu'au CSS, donc un composant
 * ne peut pas diverger du contrat.
 *
 * `outputReferences: true` préserve la chaîne d'alias jusque dans le CSS
 * (`--brand-tokens-primary-default: var(--brands-intencial-primary-400)`),
 * fidèle au principe Unified Component Exporter « on n'aplatit jamais un alias ».
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
import { poidsDeGraisse, tokenCssVariable } from "@ucm-kit/core/format";

StyleDictionary.registerTransform({
  name: "fontWeight/name-to-number",
  type: "value",
  transitive: true,
  // On cible le groupe `layouts.fontweight.*` par son chemin, sans jamais coder
  // en dur un token précis (générique : tout token de graisse est concerné).
  filter: (token) => token.path.includes("fontweight"),
  transform: (token) => {
    // En mode DTCG, la valeur vit sur `$value` (repli sur `value` sinon).
    const brut = token.$value ?? token.value;
    // La TABLE vient du kit (T6.1) : « SemiBold » vaut 600 partout, et un
    // preset iOS lira la même. Ce transform ne garde que la PROJECTION, qui
    // est propre au CSS. Un nom inconnu rend `null` et repart tel quel : la
    // table ne décide pas ce qu'un design system a le droit de nommer.
    return poidsDeGraisse(brut) ?? brut;
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

/**
 * Le NOM d'une variable CSS vient du kit, et de nulle part ailleurs.
 *
 * C'est T6.0. La projection « chemin de token → propriété personnalisée »
 * existait en deux exemplaires — `tokenVar` côté React, le `name/kebab` de
 * Style Dictionary ici — qu'aucun test ne comparait. Elles divergeaient sur les
 * quatre `layouts.sizing.0,5` : `tokenVar` rendait `var(--layouts-sizing-0,5)`,
 * où la virgule sépare en CSS une variable de sa valeur de repli. Le navigateur
 * lisait « variable `--layouts-sizing-0`, repli `5` », trouvait cette variable,
 * et peignait 0px là où le contrat demandait 2px — sans erreur ni repli.
 *
 * Les faire s'accorder ne suffisait pas : deux formules égales aujourd'hui
 * redivergent demain. `tokenCssVariable` est donc l'unique autorité, et les
 * deux côtés l'APPELLENT — celui-ci par ce transform, `tokenVar` par un import.
 * `src/tokens-accord.test.ts` vérifie l'accord sur les 721 tokens réels ; il ne
 * peut plus échouer par divergence, seulement par collision, qui est une autre
 * question et qu'il pose séparément.
 *
 * Le nom du transform est `name/ucm` et non `name/kebab` : ce n'est pas un
 * kebabCase. Celui de Style Dictionary coupe aussi sur les bosses de casse
 * (`semiBold` → `semi-bold`), comportement de `change-case` et non du format.
 * Sur le corpus actuel les deux rendent les mêmes 721 noms — le remplacement ne
 * renomme aucune variable, il déplace seulement l'autorité.
 */
StyleDictionary.registerTransform({
  name: "name/ucm",
  type: "name",
  // Style Dictionary veut le nom NU ; les deux tirets sont posés par le format
  // `css/variables` au moment d'écrire la déclaration.
  transform: (token) => tokenCssVariable(token.path.join(".")).slice(2),
});

// On étend le groupe `css` standard avec nos transforms, sans réécrire la liste
// (robuste aux évolutions de Style Dictionary). `name/kebab` en sort : deux
// transforms de type `name` s'écraseraient, et c'est le nôtre qui doit rester.
StyleDictionary.registerTransformGroup({
  name: "css-ds",
  transforms: StyleDictionary.hooks.transformGroups.css
    .filter((nom) => nom !== "name/kebab")
    .concat(["name/ucm", "fontWeight/name-to-number", "fontFamily/css-quote"]),
});

export default {
  // `tokens.json` utilise la syntaxe DTCG (`$value` / `$type`) : on l'active.
  usesDtcg: true,
  source: ["tokens.json"],
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

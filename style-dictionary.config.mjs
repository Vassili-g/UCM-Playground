/**
 * Configuration Style Dictionary — `tokens.json` (DTCG) → variables CSS.
 *
 * Ce dépôt consomme les artefacts d'un export : il n'installe aucun outil de
 * leur producteur et n'importe aucune bibliothèque pour les lire. Les trois
 * transforms ci-dessous sont donc les conventions de CETTE application, et
 * elles n'engagent qu'elle.
 *
 * **Le nom d'une variable est le chemin du token.** `components.button.sizes`
 * `.medium.gap` donne `--components-button-sizes-medium-gap`. Tout ce qui
 * n'est ni lettre ni chiffre devient un tiret — la règle vaut aussi pour la
 * virgule de `layouts.sizing.0,5`, qui séparerait sinon en CSS une variable de
 * sa valeur de repli : le navigateur lirait « variable `--layouts-sizing-0`,
 * repli `5` », peindrait 0px, et ne dirait rien. Les composants reconstruits
 * appliquent la même règle sur la référence qu'ils citent.
 *
 * **Deux valeurs Figma ne sont pas du CSS**, et seule leur PROJECTION est
 * traitée ici : la graisse arrive comme nom de style (« SemiBold »), le CSS
 * veut un nombre ; la famille arrive nue (« Open Sans »), le CSS veut des
 * guillemets dès qu'elle contient une espace. Un nom de graisse inconnu repart
 * tel quel : cette table dit ce que l'application sait traduire, pas ce qu'un
 * design system a le droit de nommer.
 *
 * `outputReferences: true` garde la chaîne d'alias visible dans le CSS au lieu
 * de l'aplatir : c'est ce que `tokens.json` publie.
 */
import StyleDictionary from "style-dictionary";

/** Chemin de token → propriété personnalisée CSS. */
function variableCss(chemin) {
  return chemin
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Noms de graisse que cette application sait traduire en poids CSS. */
const POIDS_PAR_NOM = {
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
  filter: (token) => token.path.includes("fontweight"),
  transform: (token) => {
    const brut = token.$value ?? token.value;
    const cle = String(brut).toLowerCase().replace(/[^a-z0-9]/g, "");
    return POIDS_PAR_NOM[cle] ?? brut;
  },
});

StyleDictionary.registerTransform({
  name: "fontFamily/css-quote",
  type: "value",
  transitive: true,
  filter: (token) => token.path.includes("fontfamily"),
  transform: (token) => {
    const famille = String(token.$value ?? token.value).trim();
    return `${/\s/.test(famille) ? `"${famille}"` : famille}, sans-serif`;
  },
});

StyleDictionary.registerTransform({
  name: "name/chemin",
  type: "name",
  // Style Dictionary veut le nom NU : les deux tirets sont posés par le format
  // `css/variables` au moment d'écrire la déclaration.
  transform: (token) => variableCss(token.path.join(".")),
});

// Le groupe `css` standard, sans son `name/kebab` : deux transforms de nom
// s'écraseraient, et celui qui doit rester est le nôtre. `name/kebab` coupe en
// plus sur les bosses de casse (`semiBold` → `semi-bold`), ce que le chemin
// d'un token ne demande pas.
StyleDictionary.registerTransformGroup({
  name: "css-ds",
  transforms: StyleDictionary.hooks.transformGroups.css
    .filter((nom) => nom !== "name/kebab")
    .concat(["name/chemin", "fontWeight/name-to-number", "fontFamily/css-quote"]),
});

export default {
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
          options: { outputReferences: true },
        },
      ],
    },
  },
};

/**
 * Configuration Style Dictionary — `tokens.json` (DTCG) → variables CSS.
 *
 * Ce dépôt consomme les artefacts d'un export : il n'installe aucun outil de
 * leur producteur et n'importe aucune bibliothèque pour les lire. Les deux
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
 * **Une valeur Figma n'est pas du CSS**, et seule sa PROJECTION est traitée
 * ici : la famille arrive nue (« Open Sans »), le CSS veut des guillemets
 * dès qu'elle contient une espace.
 *
 * La graisse, elle, arrive déjà en nombre : le fichier de tokens la publie en
 * `$type: "number"`. Une graisse qui arriverait encore en chaîne est une
 * graisse que l'exporteur n'a pas su décider, et la retraduire ici effacerait
 * cette information au lieu de la montrer.
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
    .concat(["name/chemin", "fontFamily/css-quote"]),
});

export default {
  usesDtcg: true,
  source: ["src/tokens/tokens.json"],
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

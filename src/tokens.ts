/**
 * Pont entre une référence de token du contrat de composant et sa variable CSS.
 *
 * Principe (cf. TokenLintel/CONCEPT.md) : le nom du token EST son chemin. Le
 * contrat cite un token comme RÉFÉRENCE entre accolades — `{components.button.sizes.medium.gap}` —
 * exactement comme `tokens.json`. On retire les accolades, puis on convertit
 * mécaniquement le chemin (`.` → `-`) en variable CSS générée par Style
 * Dictionary. La correspondance est donc impossible à désynchroniser : un
 * composant ne peut styler qu'avec des noms qui existent.
 *
 * @example
 * tokenVar("{components.button.sizes.medium.gap}")
 * // → "var(--components-button-sizes-medium-gap)"
 */
export function tokenVar(tokenName: string): string {
  const path = tokenName.replace(/^\{(.*)\}$/, "$1");
  return `var(--${path.replaceAll(".", "-")})`;
}

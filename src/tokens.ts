/**
 * Pont entre un nom de token du contrat de composant et sa variable CSS.
 *
 * Principe (cf. TokenLintel/CONCEPT.md) : le nom du token EST son chemin. Un token du
 * contrat comme `components.button.sizes.medium.gap` correspond à la variable
 * CSS `--components-button-sizes-medium-gap` générée par Style Dictionary.
 * La correspondance est purement mécanique (`.` → `-`), donc impossible à
 * désynchroniser : un composant ne peut styler qu'avec des noms qui existent.
 *
 * @example
 * tokenVar("components.button.sizes.medium.gap")
 * // → "var(--components-button-sizes-medium-gap)"
 */
export function tokenVar(tokenName: string): string {
  return `var(--${tokenName.replaceAll(".", "-")})`;
}

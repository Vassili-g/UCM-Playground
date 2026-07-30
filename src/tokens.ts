/**
 * Pont entre une référence de token du contrat et sa variable CSS.
 *
 * Principe (cf. ../UCM-Exporter/CONCEPT.md) : le nom du token EST son chemin. Le
 * contrat cite un token comme RÉFÉRENCE entre accolades —
 * `{components.button.sizes.medium.gap}` — exactement comme `tokens.json`. On
 * retire les accolades, puis on convertit mécaniquement le chemin (`.` → `-`)
 * en variable CSS générée par Style Dictionary. La correspondance est donc
 * impossible à désynchroniser : un composant ne peut styler qu'avec des noms
 * qui existent.
 *
 * @example
 * tokenVar("{components.button.sizes.medium.gap}")
 * // → "var(--components-button-sizes-medium-gap)"
 */

/**
 * Forme d'une référence, identique à celle que le garde-fou relève dans les
 * contrats (`scripts/check-contract.mjs`) : la chaîne ENTIÈRE est entre
 * accolades et porte au moins un point séparateur.
 */
const REFERENCE = /^\{[^{}\s]+\.[^{}\s]+\}$/;

/**
 * Traduit une référence en variable CSS, et REFUSE tout le reste.
 *
 * Sans ce contrôle, `tokenVar("16px")` produisait `var(--16px)` : une variable
 * qui n'existe pas, que le navigateur ignore sans erreur ni repli. Le style
 * disparaissait donc en silence, et aucun garde-fou ne pouvait le voir — celui
 * des contrats ne relève que les chaînes déjà de la forme `{a.b}`, si bien
 * qu'une valeur brute n'était ni collectée, ni comparée à `tokensUsed`, ni
 * signalée. Une perte visuelle muette est le pire des deux mondes : lever ici
 * transforme un bug de rendu introuvable en erreur immédiate et localisée.
 *
 * Ce n'est pas un contrôle de donnée — les contrats sont validés ailleurs —
 * mais un contrôle de programmation : la seule façon d'y arriver est d'avoir
 * écrit une valeur au lieu de la lire dans le contrat.
 */
export function tokenVar(reference: string): string {
  if (!REFERENCE.test(reference)) {
    throw new Error(
      `tokenVar attend une référence de token du contrat, par exemple `
        + `"{components.button.sizes.medium.gap}", et a reçu ${JSON.stringify(reference)}. `
        + `Un style ne s'écrit jamais en valeur brute : lisez la référence dans le contrat.`,
    );
  }
  return `var(--${reference.slice(1, -1).replaceAll(".", "-")})`;
}

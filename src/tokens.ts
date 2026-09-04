/**
 * Pont entre une référence de token du contrat et sa variable CSS.
 *
 * Principe (cf. ../UCM-Exporter/CONCEPT.md) : le nom du token EST son chemin. Le
 * contrat cite un token comme RÉFÉRENCE entre accolades —
 * `{components.button.sizes.medium.gap}` — exactement comme `tokens.json`. On
 * retire les accolades, puis on demande au format le nom de la variable que
 * Style Dictionary écrira pour ce chemin. La correspondance est impossible à
 * désynchroniser parce que les deux côtés appellent la MÊME fonction, et non
 * parce qu'ils appliquent la même formule : un composant ne peut styler qu'avec
 * des noms qui existent.
 *
 * @example
 * tokenVar("{components.button.sizes.medium.gap}")
 * // → "var(--components-button-sizes-medium-gap)"
 */
import { isTokenReference, refPath, tokenCssVariable } from "@ucm-kit/core/format";

/*
 * Ni la forme d'une référence, ni le nom de la variable ne sont écrits ici.
 *
 * Les deux venaient d'une copie locale, et c'étaient les DEUX dernières du
 * projet : la quatrième copie de la regex (T2.7) et la deuxième de la
 * projection (T6.0). Aucune n'était fautive le jour où elle a été écrite —
 * elles le deviennent en dérivant, et une projection qui dérive produit le
 * défaut le plus cher du projet, parce qu'il est muet. `var(--layouts-sizing-0,5)`
 * se lit en CSS « variable `--layouts-sizing-0`, repli `5` » : la variable
 * existe, vaut 0px, et le contrat demandait 2px.
 *
 * Le kit tranche les deux, et Style Dictionary appelle la même
 * `tokenCssVariable` dans `style-dictionary.config.mjs` : la variable que ce
 * module nomme et celle que la feuille déclare ne peuvent plus différer.
 */

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
  if (!isTokenReference(reference)) {
    throw new Error(
      `tokenVar attend une référence de token du contrat, par exemple `
        + `"{components.button.sizes.medium.gap}", et a reçu ${JSON.stringify(reference)}. `
        + `Un style ne s'écrit jamais en valeur brute : lisez la référence dans le contrat.`,
    );
  }
  return `var(${tokenCssVariable(refPath(reference))})`;
}

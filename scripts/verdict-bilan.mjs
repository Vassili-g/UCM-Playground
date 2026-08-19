/**
 * Décide si le bilan d'un contrat doit refuser la pull request.
 *
 * Les références absentes de `tokens.json` n'entrent volontairement pas dans
 * cette décision : la source DTCG fait foi et l'écart est publié comme
 * avertissement par `diagnostic-tokens.mjs`.
 */
export function bilanEstBloquant(bilan, ecartDeParite) {
  return bilan.illisible
    || bilan.champsAbsents.length > 0
    || Boolean(bilan.version)
    || bilan.graphe.length > 0
    || bilan.nonListes.length + bilan.fantomes.length > 0
    || bilan.typesTypographiques.length > 0
    || ecartDeParite;
}

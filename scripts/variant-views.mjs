/** Résout la vue exacte d'un variant, inline en v8 et cataloguée depuis la v9. */
export function vueExacteDuVariant(contrat, variant) {
  const major = Number.parseInt(String(contrat?.meta?.contractVersion), 10);
  if (major >= 9) {
    return contrat?.variantViews?.[variant?.view];
  }
  return variant;
}

/** Dépendances exactes d'un variant, quelle que soit sa représentation. */
export function compositionsExactesDuVariant(contrat, variant) {
  const vue = vueExacteDuVariant(contrat, variant);
  return Array.isArray(vue?.composes) ? vue.composes : [];
}

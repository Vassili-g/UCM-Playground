/**
 * Identifiant de code canonique d'un nom Figma libre.
 *
 * Cette fonction recopie volontairement la règle publiée par l'exporteur :
 * le JSON garde le nom Figma exact dans `name`, tandis que fichiers, dossiers,
 * fonctions React et interfaces utilisent cet identifiant PascalCase.
 */
export function identifiantCode(nom) {
  const ascii = String(nom ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const mots = ascii.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const identifiant = mots
    .map((mot) => mot[0].toUpperCase() + mot.slice(1))
    .join("");
  const sur = identifiant || "Component";
  return /^[0-9]/.test(sur) ? `Component${sur}` : sur;
}

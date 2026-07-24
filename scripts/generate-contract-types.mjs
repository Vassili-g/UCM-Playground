/**
 * Génère les unions TypeScript dérivées des contrats de composant.
 *
 * Même principe que Style Dictionary pour tokens.css : le fichier produit est
 * un artefact DÉRIVÉ, jamais édité à la main. Chaque prop enum d'un
 * `<Nom>.contract.json` devient une union littérale
 * (`export type ButtonColor = "secondary" | "primary"`), si bien qu'aucune
 * valeur d'API design n'est recopiée manuellement dans le code : un composant
 * importe ses types depuis `src/generated/contracts/<Nom>.ts`.
 *
 * Lancé par « npm run types » (branché sur dev, build et check).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { trouverContrats } from "./trouver-contrats.mjs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const dossierSortie = join(racine, "src/generated/contracts");

/** « iconLeft » → « IconLeft » ; retire tout caractère hors identifiant TS. */
function pascal(nom) {
  return nom
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, lettre) => lettre.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(/^./, (lettre) => lettre.toUpperCase());
}

mkdirSync(dossierSortie, { recursive: true });

for (const chemin of trouverContrats(join(racine, "src"))) {
  const contrat = JSON.parse(readFileSync(chemin, "utf8"));
  const composant = pascal(contrat.name ?? "Component");
  const enums = Object.entries(contrat.props ?? {}).filter(
    ([, prop]) => prop.type === "enum",
  );
  if (enums.length === 0) continue;

  const types = enums.map(([nom, prop]) => {
    const union = prop.values.map((valeur) => JSON.stringify(valeur)).join(" | ");
    return `/** Valeurs de la prop « ${nom} » du contrat. */\nexport type ${composant}${pascal(nom)} = ${union};`;
  });

  const contenu = [
    "/**",
    ` * Types dérivés de ${composant}.contract.json — NE PAS ÉDITER À LA MAIN.`,
    " * Régénéré par « npm run types » : ces unions reflètent mécaniquement les",
    " * enums du contrat, comme tokens.css reflète tokens.json.",
    " */",
    "",
    types.join("\n\n"),
    "",
  ].join("\n");

  writeFileSync(join(dossierSortie, `${composant}.ts`), contenu);
  console.log(
    `✓ ${composant}: ${enums.length} union(s) générée(s) → src/generated/contracts/${composant}.ts`,
  );
}

/**
 * Garde-fou « contrat ↔ tokens » (cf. UCM-Exporter/ROADMAP.md, Phase C1).
 *
 * Vérifie que chaque token listé dans `tokensUsed` d'un contrat existe bien
 * parmi les variables CSS générées depuis `tokens.json` : un contrat ne peut
 * pas référencer un token qui n'existe pas dans le design system. La parité
 * code ↔ contrat, elle, viendra avec l'étape 4 de la ROADMAP (Phase C2).
 *
 * Lancer après `npm run tokens` (fait par le script `npm run check`).
 * Sort en erreur (code 1) si un token manque : utilisable tel quel en CI.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { trouverContrats } from "./trouver-contrats.mjs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

// 1. Extraire les noms de variables CSS générées (`--nom:`), sans le `--`.
const cssPath = join(racine, "src/generated/tokens.css");
let css;
try {
  css = readFileSync(cssPath, "utf8");
} catch {
  console.error(
    `✗ ${cssPath} introuvable. Lancez d'abord « npm run tokens ».`,
  );
  process.exit(1);
}
const varsGenerees = new Set(
  [...css.matchAll(/--([a-z0-9-]+)\s*:/gi)].map((m) => m[1]),
);

// 2. Retrouver tous les contrats co-localisés (parcours partagé avec
// generate-contract-types.mjs : même périmètre pour les deux garde-fous).
const contrats = trouverContrats(join(racine, "src"));
let manquants = 0;

for (const chemin of contrats) {
  const contrat = JSON.parse(readFileSync(chemin, "utf8"));
  const tokensUtilises = contrat.tokensUsed ?? [];
  // Compteur par contrat : le marqueur ✓/✗ reflète CE contrat, pas le cumul
  // des précédents (sinon un contrat sain après un contrat cassé s'affiche mal).
  let manquantsContrat = 0;
  for (const token of tokensUtilises) {
    // Même règle que `tokenVar` côté runtime : on retire les accolades de la
    // référence `{chemin}` puis le chemin devient le nom de var (`.` → `-`).
    const nomVar = token.replace(/^\{(.*)\}$/, "$1").replaceAll(".", "-");
    if (!varsGenerees.has(nomVar)) {
      console.error(`✗ ${contrat.name}: token absent des tokens générés → ${token}`);
      manquantsContrat++;
    }
  }
  manquants += manquantsContrat;
  console.log(
    `${manquantsContrat === 0 ? "✓" : "✗"} ${contrat.name}: ${tokensUtilises.length} tokens vérifiés (${chemin.replace(racine, ".")})`,
  );
}

if (manquants > 0) {
  console.error(`\n✗ ${manquants} token(s) du contrat introuvable(s) dans le design system.`);
  process.exit(1);
}
console.log(`\n✓ Tous les tokens des contrats existent dans le design system.`);

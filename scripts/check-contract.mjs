/**
 * Garde-fou « code ↔ contrat ↔ tokens » (cf. concept.md, Phase C).
 *
 * Vérifie que chaque token listé dans `tokensUsed` d'un contrat existe bien
 * parmi les variables CSS générées depuis `tokens.json`. C'est la preuve
 * automatisable du principe fondateur : un composant ne peut pas référencer un
 * token qui n'existe pas dans le design system — aucun nom ne peut diverger.
 *
 * Lancer après `npm run tokens` (fait par le script `npm run check`).
 * Sort en erreur (code 1) si un token manque : utilisable tel quel en CI.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

// 2. Retrouver tous les contrats co-localisés (`*.contract.json`).
function trouverContrats(dossier) {
  const trouves = [];
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) {
      if (entree.name === "node_modules") continue;
      trouves.push(...trouverContrats(chemin));
    } else if (entree.name.endsWith(".contract.json")) {
      trouves.push(chemin);
    }
  }
  return trouves;
}

const contrats = trouverContrats(join(racine, "src"));
let manquants = 0;

for (const chemin of contrats) {
  const contrat = JSON.parse(readFileSync(chemin, "utf8"));
  const tokensUtilises = contrat.tokensUsed ?? [];
  for (const token of tokensUtilises) {
    // Même règle que `tokenVar` côté runtime : le chemin devient le nom de var.
    const nomVar = token.replaceAll(".", "-");
    if (!varsGenerees.has(nomVar)) {
      console.error(`✗ ${contrat.name}: token absent des tokens générés → ${token}`);
      manquants++;
    }
  }
  console.log(
    `${manquants === 0 ? "✓" : "…"} ${contrat.name}: ${tokensUtilises.length} tokens vérifiés (${chemin.replace(racine, ".")})`,
  );
}

if (manquants > 0) {
  console.error(`\n✗ ${manquants} token(s) du contrat introuvable(s) dans le design system.`);
  process.exit(1);
}
console.log(`\n✓ Tous les tokens des contrats existent dans le design system.`);

/**
 * Garde-fou « contrat ↔ tokens » (cf. UCM-Exporter/ROADMAP.md, Phase C1).
 *
 * Vérifie que chaque token listé dans `tokensUsed` d'un contrat existe bien
 * parmi les variables CSS générées depuis `tokens.json` : un contrat ne peut
 * pas référencer un token qui n'existe pas dans le design system. La parité
 * code ↔ contrat, elle, viendra avec l'étape 4 de la ROADMAP (Phase C2).
 *
 * Le même diagnostic est écrit pour deux lecteurs très différents : le
 * terminal pour un développeur, et un rapport markdown pour le **designer**,
 * qui valide les pull requests d'export sans jamais ouvrir un log de CI
 * (cf. .github/workflows/ci.yml).
 *
 * Lancer après `npm run tokens` (fait par le script `npm run check`).
 * Sort en erreur (code 1) si un contrat est fautif : utilisable tel quel en CI.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { trouverContrats } from "./trouver-contrats.mjs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_TOKENS = "src/tokens/tokens.json";

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

/** Nom de variable CSS attendu pour une référence `{chemin.du.token}`. */
function nomVariable(reference) {
  return reference.replace(/^\{(.*)\}$/, "$1").replaceAll(".", "-");
}

/**
 * Analyse un contrat sans jamais lever : un fichier illisible est un
 * diagnostic à afficher, pas un plantage du garde-fou (une stack trace Node
 * n'aide personne, et surtout pas la personne qui a produit l'export).
 */
function analyser(chemin) {
  const fichier = basename(chemin);
  const relatif = chemin.replace(racine, ".");
  let contrat;
  try {
    // Un BOM en tête de fichier ferait échouer JSON.parse : on le retire.
    contrat = JSON.parse(readFileSync(chemin, "utf8").replace(/^﻿/, ""));
  } catch {
    return { fichier, relatif, illisible: true, manquants: [], total: 0 };
  }

  const references = contrat.tokensUsed ?? [];
  return {
    fichier,
    relatif,
    illisible: false,
    manquants: references.filter((ref) => !varsGenerees.has(nomVariable(ref))),
    total: references.length,
  };
}

/** Rapport markdown destiné au designer : ce qui bloque, et quoi faire. */
function rapportMarkdown(bilans, fautifs) {
  if (fautifs.length === 0) {
    const tokens = bilans.reduce((somme, bilan) => somme + bilan.total, 0);
    return [
      "## ✅ Contrats et tokens cohérents",
      "",
      `${bilans.length} contrat(s) vérifié(s), ${tokens} références de tokens : toutes existent dans \`${SOURCE_TOKENS}\`.`,
    ].join("\n");
  }

  const lignes = ["## ❌ Cet export ne peut pas être fusionné en l'état", ""];

  for (const bilan of fautifs) {
    if (bilan.illisible) {
      lignes.push(
        `### \`${bilan.fichier}\` n'est pas un fichier JSON valide`,
        "",
        "Il a sans doute été tronqué, ou modifié à la main.",
        "",
      );
      continue;
    }
    lignes.push(
      `### \`${bilan.fichier}\` cite ${bilan.manquants.length} token(s) qui n'existent pas`,
      "",
      ...bilan.manquants.map((token) => `- \`${token}\``),
      "",
    );
  }

  lignes.push("### Que faire ?", "");
  if (fautifs.some((bilan) => bilan.manquants.length > 0)) {
    lignes.push(
      `Ces tokens sont absents de \`${SOURCE_TOKENS}\`. C'est le signe habituel qu'un token a été **renommé, déplacé ou ajouté dans Figma** sans que les tokens du repository aient suivi.`,
      "",
      "1. dans Figma, lancez **Exporter les tokens** avec Unified Component Exporter ;",
      "2. validez la pull request qu'il ouvre : elle met `tokens.json` à jour ;",
      "3. cette vérification repassera alors au vert toute seule.",
      "",
    );
  }
  if (fautifs.some((bilan) => bilan.illisible)) {
    lignes.push(
      "Pour un fichier illisible, ré-exportez le composant depuis Figma plutôt que de corriger le JSON à la main.",
      "",
    );
  }
  return lignes.join("\n");
}

/**
 * Publie le rapport là où GitHub sait l'afficher sans dérouler un log : le
 * résumé du run, et `ci-report.md` que le workflow reprend en commentaire
 * de pull request. En local, on n'écrit aucun fichier.
 */
function publier(markdown) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }
  if (process.env.CI) {
    writeFileSync(join(racine, "ci-report.md"), `${markdown}\n`);
  }
}

const bilans = trouverContrats(join(racine, "src")).map(analyser);
const fautifs = bilans.filter((bilan) => bilan.illisible || bilan.manquants.length > 0);

for (const bilan of bilans) {
  if (bilan.illisible) {
    console.error(`✗ ${bilan.fichier} : JSON illisible (${bilan.relatif})`);
    continue;
  }
  for (const token of bilan.manquants) {
    console.error(`✗ ${bilan.fichier} : token absent des tokens générés → ${token}`);
  }
  const marque = bilan.manquants.length === 0 ? "✓" : "✗";
  console.log(`${marque} ${bilan.fichier} : ${bilan.total} tokens vérifiés (${bilan.relatif})`);
}

publier(rapportMarkdown(bilans, fautifs));

if (fautifs.length > 0) {
  // Chaque cause a son geste correctif : on n'affiche que ceux qui s'appliquent.
  console.error(`\n✗ ${fautifs.length} contrat(s) en défaut.`);
  if (fautifs.some((bilan) => bilan.manquants.length > 0)) {
    console.error(
      `  Tokens absents de ${SOURCE_TOKENS} : ré-exportez les tokens depuis Figma` +
        ` (« Exporter les tokens »), puis relancez « npm run check ».`,
    );
  }
  if (fautifs.some((bilan) => bilan.illisible)) {
    console.error('  JSON illisible : ré-exportez le composant depuis Figma.');
  }
  process.exit(1);
}
console.log("\n✓ Tous les tokens des contrats existent dans le design system.");

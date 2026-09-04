/**
 * Fait tourner `check-contract.mjs` sur un repository jouet, et rend tout ce
 * qu'il produit.
 *
 * Pourquoi un repository jouet et pas le vrai : le script déduit sa racine de
 * sa PROPRE position (`scripts/..`), et n'accepte aucun argument. Le seul moyen
 * de lui donner un autre corpus est donc de le recopier ailleurs, avec ses
 * voisins — ce que fait `prepararerRepo`. Un jour `ucm check` prendra un
 * `--report` et une racine (T3.3), et ce détour disparaîtra.
 *
 * Pourquoi le jouet vit DANS le repository et pas dans le dossier temporaire du
 * système : `parite.mjs` importe `typescript`, que Node résout en
 * remontant les dossiers parents. Sous `%TEMP%`, il n'y a aucun
 * `node_modules` à trouver.
 */
import { execFileSync } from "node:child_process";
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const racineReelle = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * Monte un repository jouet et rend sa racine.
 *
 * `composants` est un dictionnaire `Nom → { contrat, tsx }` : `contrat` est
 * l'objet à écrire, `tsx` la source du composant, absente si le scénario veut
 * une implémentation manquante.
 */
export function preparerRepo({ composants = {}, tokens = {}, css = "", tsconfig = true }) {
  const racine = mkdtempSync(join(racineReelle, ".tmp-caracterisation-"));

  // Les scripts doivent vivre à `<racine>/scripts` : c'est de là que le script
  // testé déduit la racine du repository qu'il inspecte.
  mkdirSync(join(racine, "scripts"), { recursive: true });
  // Les tests ne sont pas recopiés : `run-tests.mjs` balaie le repository en
  // profondeur, et un repo jouet qu'un plantage aurait laissé derrière lui
  // ferait sinon tourner une seconde fois toute la suite.
  cpSync(join(racineReelle, "scripts"), join(racine, "scripts"), {
    recursive: true,
    filter: (source) => !source.includes("caracterisation") && !source.endsWith(".test.mjs"),
  });

  mkdirSync(join(racine, "src", "tokens"), { recursive: true });
  mkdirSync(join(racine, "src", "generated"), { recursive: true });
  writeFileSync(join(racine, "src/tokens/tokens.json"), JSON.stringify(tokens, null, 2));
  writeFileSync(join(racine, "src/generated/tokens.css"), css);

  for (const [nom, { contrat, tsx }] of Object.entries(composants)) {
    const dossier = join(racine, "src", "components", nom);
    mkdirSync(dossier, { recursive: true });
    if (contrat !== undefined) {
      writeFileSync(join(dossier, `${nom}.contract.json`), JSON.stringify(contrat, null, 2));
    }
    if (tsx !== undefined) writeFileSync(join(dossier, `${nom}.tsx`), tsx);
  }

  // `lireApiPublique` lit un tsconfig à la racine ; sans lui, la parité ne peut
  // rien dire d'un `.tsx` présent.
  if (tsconfig) {
    cpSync(join(racineReelle, "tsconfig.json"), join(racine, "tsconfig.json"));
  }
  return racine;
}

/** Lance le script sur un repository jouet et relève tout ce qu'il produit. */
export function lancer(racine, env = {}) {
  let code = 0;
  let sortie = "";
  try {
    sortie = execFileSync(
      process.execPath,
      [join(racine, "scripts", "check-contract.mjs")],
      { cwd: racine, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, CI: "true", ...env } },
    );
  } catch (erreur) {
    code = erreur.status ?? 1;
    sortie = `${erreur.stdout ?? ""}${erreur.stderr ?? ""}`;
  }
  const cheminRapport = join(racine, "ci-report.md");
  return {
    code,
    sortie,
    rapport: existsSync(cheminRapport) ? readFileSync(cheminRapport, "utf8") : null,
  };
}

/** Efface le repository jouet ; un test qui échoue ne doit pas en laisser un. */
export function nettoyer(racine) {
  rmSync(racine, { recursive: true, force: true });
}

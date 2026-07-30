/**
 * Lance TOUS les tests du repository, en un seul processus.
 *
 * Deux familles cohabitent et doivent tourner ensemble : les tests des
 * garde-fous (`scripts/*.test.mjs`, du JavaScript pur) et les tests de rendu
 * (`src/**\/*.test.tsx`, qui montent réellement un composant React). Les seconds
 * ont besoin d'être transpilés — d'où `tsx`, déjà le choix de l'exporteur pour
 * ses tests TypeScript : un seul outil pour les deux repositories.
 *
 * Pourquoi lister les fichiers plutôt que passer un motif : `node --test` ne
 * développe les globs qu'à partir de Node 22, or la CI et les postes de
 * développement ne sont pas forcément sur la même version. Et pourquoi les
 * découvrir plutôt que les énumérer dans package.json : une liste écrite à la
 * main laisse un nouveau test hors du lot, silencieusement et jusqu'en CI.
 */
import { readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Fichiers de test sous `dossier`, quelle que soit leur profondeur. */
function trouverTests(dossier, trouves = []) {
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) {
      if (entree.name === "node_modules" || entree.name === "generated") continue;
      trouverTests(chemin, trouves);
    } else if (/\.test\.(mjs|ts|tsx)$/.test(entree.name)) {
      trouves.push(relative(racine, chemin).replaceAll("\\", "/"));
    }
  }
  return trouves;
}

const fichiers = [
  ...trouverTests(join(racine, "scripts")),
  ...trouverTests(join(racine, "src")),
].sort();

if (fichiers.length === 0) {
  console.error("Aucun fichier de test trouvé dans scripts/ ni src/.");
  process.exit(1);
}

const resultat = spawnSync("npx", ["tsx", "--test", ...fichiers], {
  cwd: racine,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(resultat.status ?? 1);

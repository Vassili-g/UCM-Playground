/**
 * Lance TOUS les tests du repository, en un seul processus.
 *
 * Deux familles PEUVENT cohabiter et doivent alors tourner ensemble : les tests
 * des garde-fous (`scripts/*.test.mjs`, du JavaScript pur) et les tests de rendu
 * (`src/**\/*.test.tsx`, qui montent réellement un composant React). Les
 * seconds ont besoin d'être transpilés — d'où `tsx`, déjà le choix de
 * l'exporteur pour ses tests TypeScript : un seul outil pour les deux
 * repositories.
 *
 * **Ce dépôt-ci n'a aucun test de rendu, et c'est une décision** — les
 * composants sont des sondes remplaçables (`AGENTS.md`). Le découvreur
 * reste ouvert aux deux familles quand même : c'est ce qui fait que le jour où
 * un `.test.tsx` apparaît, il tourne sans qu'on y pense. Ce que l'absence coûte
 * au rapport est écrit dans `echecs-de-tests.mjs`.
 *
 * Pourquoi lister les fichiers plutôt que passer un motif : `node --test` ne
 * développe les globs qu'à partir de Node 22, or la CI et les postes de
 * développement ne sont pas forcément sur la même version. Et pourquoi les
 * découvrir plutôt que les énumérer dans package.json : une liste écrite à la
 * main laisse un nouveau test hors du lot, silencieusement et jusqu'en CI.
 *
 * Le lancement produit deux sorties : celle que lit un développeur, et une
 * sortie TAP écrite à côté, dont `check.mjs` tire les échecs à publier dans le
 * rapport de pull request. Un test rouge n'est pas seulement un exit code : il
 * doit arriver jusqu'au designer qui attend son export (cf.
 * `echecs-de-tests.mjs`).
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { echecsDuTap } from "./echecs-de-tests.mjs";

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

/**
 * Exécute la suite complète et rend son verdict détaillé.
 *
 * Le TAP part dans un fichier temporaire plutôt que sur la sortie standard :
 * le développeur garde le rapport lisible de `spec`, et l'analyse ne dépend
 * pas de ce que le terminal a bien voulu afficher. Le fichier est supprimé
 * ensuite — un reste d'exécution précédente ferait dire au rapport de CI qu'un
 * test échoue alors qu'il vient de passer.
 */
export function lancerLesTests() {
  const fichiers = [
    ...trouverTests(join(racine, "scripts")),
    ...trouverTests(join(racine, "src")),
  ].sort();

  if (fichiers.length === 0) {
    console.error("Aucun fichier de test trouvé dans scripts/ ni src/.");
    return { code: 1, echecs: [] };
  }

  const dossierTap = mkdtempSync(join(tmpdir(), "ucm-tests-"));
  const fichierTap = join(dossierTap, "resultats.tap");
  try {
    const resultat = spawnSync(
      "npx",
      [
        "tsx",
        "--test",
        "--test-reporter=spec",
        "--test-reporter-destination=stdout",
        "--test-reporter=tap",
        `--test-reporter-destination=${fichierTap}`,
        ...fichiers,
      ],
      { cwd: racine, stdio: "inherit", shell: process.platform === "win32" },
    );

    const code = resultat.status ?? 1;
    if (code === 0) return { code, echecs: [] };

    let tap = "";
    try {
      tap = readFileSync(fichierTap, "utf8");
    } catch {
      // Le lanceur n'est pas allé jusqu'à écrire son TAP : l'échec reste
      // signalé, sans détail — c'est déjà ce que le rapport doit dire.
    }
    return { code, echecs: echecsDuTap(tap, racine) };
  } finally {
    rmSync(dossierTap, { recursive: true, force: true });
  }
}

// Lancé directement (`npm test`), le script reste un simple exécuteur.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(lancerLesTests().code);
}

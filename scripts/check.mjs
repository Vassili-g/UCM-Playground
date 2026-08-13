/**
 * Enchaîne les contrôles du repository sans s'arrêter au premier échec.
 *
 * Le rapport lu par le designer est écrit par `check-contract.mjs`, à la fin
 * de la chaîne. Tant que les étapes s'enchaînaient avec `&&`, un test rouge
 * arrêtait tout avant lui : la pull request d'export était refusée, aucun
 * `ci-report.md` n'était produit, et le designer n'avait plus qu'un ✗ sans une
 * ligne d'explication. Le blocage était réel, le diagnostic manquait.
 *
 * D'où cette règle : **toute étape qui refuse une pull request doit laisser un
 * message.** Les contrôles tournent donc tous, et leurs constats convergent
 * vers le rapport unique plutôt que de s'annuler l'un l'autre.
 *
 * Une seule exception à l'enchaînement complet : la génération des types n'est
 * pas tentée quand le rapport est rouge. Le garde-fou a déjà nommé le défaut,
 * et laisser le générateur lever sur un contrat invalide n'ajouterait qu'une
 * stack trace par-dessus le diagnostic. Rien n'est perdu pour autant : la
 * construction regénère les types (`prebuild`).
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { lancerLesTests } from "./run-tests.mjs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Lance un script npm du repository et rend son succès. */
function lancerScript(nom, env = {}) {
  console.log(`\n▶ npm run ${nom}`);
  const resultat = spawnSync("npm", ["run", nom], {
    cwd: racine,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });
  return (resultat.status ?? 1) === 0;
}

console.log("▶ npm test");
const tests = lancerLesTests();

const tokens = lancerScript("tokens");

// Les échecs de tests voyagent avec la chaîne plutôt que par un fichier : un
// artefact oublié d'une exécution précédente ferait rapporter un test rouge
// déjà corrigé.
const contrats = lancerScript("check:contract", {
  UCM_ECHECS_DE_TESTS: JSON.stringify({
    echoue: tests.code !== 0,
    echecs: tests.echecs,
  }),
});

const types = contrats ? lancerScript("types") : null;

const echecs = [
  ["tests", tests.code === 0],
  ["tokens", tokens],
  ["contrats", contrats],
  ["types", types],
].filter(([, succes]) => succes === false);

if (echecs.length === 0) process.exit(0);

console.error(
  `\n✗ Étape(s) en échec : ${echecs.map(([nom]) => nom).join(", ")}.` +
    (types === null ? " Génération des types non tentée." : "") +
    "\n  Le diagnostic destiné au designer est le rapport publié ci-dessus par check:contract.",
);
process.exit(1);

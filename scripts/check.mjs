/**
 * Enchaîne les contrôles du repository sans s'arrêter au premier échec.
 *
 * Règle que sert cet enchaînement : **toute étape qui refuse une pull request
 * laisse un message au designer.** Le rapport qui le porte est écrit par
 * `check-contract.mjs`, en fin de chaîne ; une étape qui s'arrêterait avant lui
 * refuserait la fusion sans que rien ne l'explique. Les contrôles tournent donc
 * tous, et leurs constats convergent vers ce rapport unique.
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
import { libelleNombre } from "@ucm-kit/core/lecteurs";

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

// Les tokens se génèrent AVANT les tests, parce qu'un test les lit. Depuis
// T6.0a, `src/tokens-accord.test.ts` ouvre `src/generated/tokens.css` pour
// confronter la projection de `tokenVar` au CSS réellement écrit — or ce
// dossier est ignoré par git. Sur le poste du mainteneur le fichier traîne
// d'une exécution précédente et le test dit ce qu'il a à dire ; sur un
// checkout neuf il est absent, et le test échouait sur un ENOENT au lieu de
// son constat. Un contrôle rouge pour la mauvaise raison ne vaut pas mieux
// qu'un contrôle absent : il fait lire un défaut d'installation là où il y a
// un défaut de projection. `predev` et `prebuild` ordonnent déjà les deux
// ainsi, pour la même raison.
const tokens = lancerScript("tokens");

console.log("\n▶ npm test");
const tests = lancerLesTests();

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
  `\n✗ ${libelleNombre(echecs.length, "étape")} en échec : ${echecs.map(([nom]) => nom).join(", ")}.` +
    (types === null ? " Génération des types non tentée." : "") +
    "\n  Le diagnostic destiné au designer est le rapport publié ci-dessus par check:contract.",
);
process.exit(1);

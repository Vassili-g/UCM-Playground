/**
 * Le garde-fou « contrat ↔ code ↔ tokens » de ce repository.
 *
 * **Ce fichier n'est plus qu'un pilote, et c'est T5.2.** Le contrôle et le
 * rapport vivent dans `@ucm-kit/core/lecteurs` ; ici il ne reste que ce qui
 * appartient VRAIMENT à ce repo :
 *
 * 1. l'**adaptateur TypeScript** (`parite.mjs`), la seule chose qui ne se
 *    transpose pas — lire une API publique avec le vérificateur de types ;
 * 2. la **projection des échecs de tests** vers la forme que le rapport lit,
 *    parce que reconnaître un `*.test.tsx` et distinguer une `AssertionError`
 *    d'une erreur d'exécution sont des questions de lanceur ;
 * 3. la **publication** du rapport — le résumé du run GitHub et `ci-report.md`.
 *
 * Le CONTENU du rapport est du format, sa PUBLICATION est de l'outil : c'est
 * cette ligne qui permet à `ucm check` et à ce script de rendre exactement le
 * même rapport sans qu'aucun des deux ne le réécrive. Avant T5.2 il y en avait
 * un seul et il vivait ici ; en écrire un second ailleurs aurait produit deux
 * verdicts qui divergent en silence.
 *
 * Ce rapport est le SEUL message que reçoit le designer qui valide une pull
 * request d'export : il n'ouvre pas les logs de la CI. Tout ce qui refuse une
 * fusion doit donc y figurer, y compris ce qui se constate ailleurs — d'où les
 * échecs de tests, que `check.mjs` transmet.
 *
 * Lancer après `npm run tokens` (ce que fait `npm run check`). Sort en erreur
 * si un contrôle bloquant échoue : utilisable tel quel en CI.
 *
 * *Pourquoi ce script existe encore alors que `ucm check` fait le même travail :*
 * `ucm check` n'a pas d'adaptateur, donc pas de parité TypeScript, et ne reçoit
 * pas les échecs de la suite de tests. Ce repo a les deux. Le jour où
 * l'adaptateur devient un paquet (T6.3), ce fichier peut disparaître.
 */
import { appendFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { controlerRepository, lireConfiguration } from "@ucm-kit/core/lecteurs";

import { pourLeRapport } from "./echecs-de-tests.mjs";
import {
  ecartsDeParite,
  lireApiPublique,
  nomInterfaceAttendue,
} from "./parite.mjs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * L'adaptateur de ce repository, exactement à la forme que le noyau attend.
 *
 * Trois fonctions, et pas une de plus : c'est la surface entière par laquelle
 * une connaissance de stack entre dans le contrôle. Le noyau, lui, ne sait ni
 * ce qu'est React, ni ce qu'est un `.tsx`.
 */
const adaptateur = { lireApiPublique, nomInterfaceAttendue, ecartsDeParite };

/**
 * Le verdict de la suite de tests, transmis par `check.mjs`.
 *
 * Lancé seul (`npm run check:contract`), ce script n'a rien à en dire : sans
 * variable, il ne rapporte aucun test — il n'en invente surtout pas le succès.
 * Une variable illisible, en revanche, se lit comme un échec : c'est le seul
 * des deux qui ne peut pas disculper le repository à tort.
 */
const echecsDeTests = (() => {
  try {
    const transmis = JSON.parse(process.env.UCM_ECHECS_DE_TESTS ?? "{}");
    return {
      echoue: transmis.echoue === true,
      echecs: pourLeRapport(transmis.echecs ?? []),
    };
  } catch {
    return { echoue: true, echecs: [] };
  }
})();

const { configuration, erreur } = lireConfiguration(racine);
if (erreur) {
  // Un `ucm.config.json` présent et mal formé arrête tout : retomber sur les
  // défauts ferait chercher les contrats ailleurs et rendre un rapport vert
  // sur un repository qu'on n'a pas regardé.
  console.error(`✗ ${erreur}`);
  process.exit(1);
}

const verdict = controlerRepository(racine, {
  configuration,
  adaptateur,
  echecsDeTests,
  contratsModifies: process.env.UCM_CONTRATS_MODIFIES,
  tokensModifies: process.env.UCM_TOKENS_MODIFIES === "true",
});

const flux = { log: console.log, warn: console.warn, error: console.error };
for (const { flux: canal, texte } of verdict.terminal) flux[canal](texte);

/**
 * Publie le rapport là où GitHub sait l'afficher sans dérouler un log : le
 * résumé du run, et `ci-report.md` que le workflow reprend en commentaire de
 * pull request. En local, on n'écrit aucun fichier.
 */
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${verdict.rapport}\n`);
}
if (process.env.CI) {
  writeFileSync(join(racine, "ci-report.md"), `${verdict.rapport}\n`);
}

if (verdict.bloquant) process.exit(1);

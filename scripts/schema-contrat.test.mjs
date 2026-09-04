/**
 * La copie vendue du schéma décrit-elle encore les contrats de ce repository ?
 *
 * Le schéma ne bloque aucune fusion : ce test est le seul endroit où sa
 * péremption se voit. Il compare deux jugements sur les MÊMES contrats réels —
 * celui de `validation-contrat.mjs`, qui fait autorité ici, et celui du schéma
 * publié par l'exporteur. Un désaccord signale une copie en retard, retouchée,
 * ou plus stricte que la forme réellement produite.
 *
 * Le sens de la comparaison compte : on n'exige pas que le schéma refuse ce que
 * le validateur refuse. Il en est incapable par construction — il ignore les
 * renvois internes et le format des valeurs tokenisées, et le dit lui-même.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  VERSION_CONTRAT_MAXIMALE,
  champsInvalidesDuContrat,
  trouverContrats,
  valideurDeSchema,
  verdictDeVersion,
  versionDuSchema,
} from "@ucm-kit/core/lecteurs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Contrats co-localisés du repository, lus comme le fait check-contract.mjs. */
function contratsDuRepository() {
  return trouverContrats(join(racine, "src")).map((chemin) => ({
    chemin,
    contrat: JSON.parse(readFileSync(chemin, "utf8").replace(/^\uFEFF/, "")),
  }));
}

test("la copie du schéma décrit la version de contrat que ce repository lit", () => {
  assert.equal(versionDuSchema(), VERSION_CONTRAT_MAXIMALE);
});

test("tout contrat accepté par la validation du repository l'est aussi par le schéma", () => {
  const valider = valideurDeSchema();
  const contrats = contratsDuRepository();
  assert.ok(contrats.length > 0, "aucun contrat co-localisé n'a été trouvé");

  for (const { chemin, contrat } of contrats) {
    // Un contrat d'une autre version n'est pas du ressort de ce schéma : il en
    // décrit une SEULE, celle qu'il déclare. Pendant une migration, la plage de
    // versions lues est plus large que le schéma vendu — un contrat encore dans
    // l'ancienne forme est donc « ok » ici sans relever de ce schéma-là.
    if (verdictDeVersion(contrat?.meta?.contractVersion) !== "ok") continue;
    if (contrat?.meta?.contractVersion !== versionDuSchema()) continue;
    if (champsInvalidesDuContrat(contrat).length > 0) continue;

    assert.ok(
      valider(contrat),
      `${chemin} est valide ici mais refusé par le schéma vendu : `
        + `${JSON.stringify(valider.errors?.slice(0, 3))}. `
        + "Recopiez schema/ucm-contract.schema.json depuis UCM-Exporter.",
    );
  }
});

test("le schéma vendu refuse un contrat vidé de sa substance", () => {
  // Sans ce contrôle, un schéma tronqué ou remplacé par `{}` laisserait le
  // test d'accord ci-dessus passer au vert sans rien prouver.
  assert.equal(valideurDeSchema()({}), false);
});

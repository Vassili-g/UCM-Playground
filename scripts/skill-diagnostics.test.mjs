/**
 * Le skill `rediger-diagnostics-ucm` existe dans les deux repositories, et les
 * deux copies doivent dire la MÊME chose.
 *
 * **Pourquoi deux copies plutôt qu'une.** Un skill se charge depuis le
 * repository où l'on travaille ; le supprimer d'un côté le rendrait
 * inaccessible là où des messages destinés au designer s'écrivent encore. La
 * copie est donc assumée — comme celle de `schema/ucm-contract.schema.json`,
 * pour la même raison et avec le même remède : ce n'est pas la copie qui est
 * dangereuse, c'est la copie que rien ne compare.
 *
 * **Ce qu'elles avaient le droit de faire diverger, et rien d'autre : l'adresse
 * du `CONTRIBUTING.md` qui porte la charte.** Elle vit dans l'exporteur ; ce
 * repository-ci la joint par un chemin plus long. Une adresse n'est pas une
 * règle — c'est la même exception que la scission de la spécification s'est
 * accordée. Tout le reste se compare caractère par caractère.
 *
 * **Ce qui avait réellement divergé, avant T8.5 :** la copie d'ici avait perdu
 * la règle « un message qui ne demande aucun geste est une NOTE, et part dans
 * `infos`, jamais dans `warnings` », et la forme de l'avertissement unitaire.
 * Deux règles absentes d'un côté, sans qu'aucune décision ne l'ait voulu.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const RELATIF = ".agents/skills/rediger-diagnostics-ucm/SKILL.md";
const VOISIN = resolve(racine, "..", "UCM-Exporter");

/** Le texte, les cibles de lien neutralisées : une adresse n'est pas une règle. */
function sansAdresses(contenu) {
  return contenu.replace(/\]\([^)\s]+\)/g, "](…)").replace(/\r\n/g, "\n");
}

test("le skill de diagnostic dit la même chose dans les deux repositories", () => {
  const ici = join(racine, RELATIF);
  assert.ok(existsSync(ici), `${RELATIF} est absent de ce repository`);

  assert.ok(
    existsSync(join(VOISIN, RELATIF)),
    `Le clone frère est absent (${VOISIN}) : ce contrôle ne peut pas comparer les deux `
      + `copies du skill, et un contrôle qui ne mesure rien se lit vert. Cloner UCM-Exporter `
      + `à côté de ce repository.`,
  );

  assert.equal(
    sansAdresses(readFileSync(ici, "utf8")),
    sansAdresses(readFileSync(join(VOISIN, RELATIF), "utf8")),
    "les deux copies du skill rediger-diagnostics-ucm ont divergé ailleurs que dans une adresse",
  );
});

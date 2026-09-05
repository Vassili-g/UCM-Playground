/** Le consommateur réel tient la cardinalité que son contrat attend. */
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { lireApiPublique } from "@ucm-kit/adapter-typescript";

test("la composition de StressTest est relevée dans ses trois vues locales", () => {
  const scripts = dirname(fileURLToPath(import.meta.url));
  const racine = join(scripts, "..");
  const stressTest = join(racine, "src", "components", "StressTest", "StressTest.tsx");
  const { composants } = lireApiPublique([stressTest], racine).get(stressTest);

  assert.deepEqual(Object.fromEntries(composants), {
    Alert: 1,
    Button: 3,
    TileLink: 7,
  });
});

/**
 * Verrouille la politique de parité : un contrat peut précéder son `.tsx`,
 * mais toute implémentation existante doit exposer les props du contrat.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { ecartsDeParite, pariteBloquante } from "./parite.mjs";

const contrat = {
  props: {
    variant: { type: "enum" },
    disabled: { type: "boolean" },
  },
};

test("un nouveau contrat sans .tsx est informatif et non bloquant", () => {
  const ecarts = ecartsDeParite(contrat, undefined, "AlertProps");

  assert.equal(ecarts.implementationAbsente, true);
  assert.equal(pariteBloquante(ecarts), false);
});

test("une implémentation sans interface publique reste bloquante", () => {
  const ecarts = ecartsDeParite(contrat, null, "AlertProps");

  assert.equal(ecarts.interfaceAbsente, "AlertProps");
  assert.equal(pariteBloquante(ecarts), true);
});

test("une implémentation qui omet une prop du contrat reste bloquante", () => {
  const ecarts = ecartsDeParite(contrat, ["variant"], "AlertProps");

  assert.deepEqual(ecarts.manquantes, ["disabled"]);
  assert.equal(pariteBloquante(ecarts), true);
});

test("une implémentation conforme ne bloque pas", () => {
  const ecarts = ecartsDeParite(
    contrat,
    ["variant", "disabled", "onClick"],
    "AlertProps",
  );

  assert.deepEqual(ecarts.manquantes, []);
  assert.equal(pariteBloquante(ecarts), false);
});

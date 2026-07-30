/**
 * Verrouille la politique de parité : un contrat peut précéder son `.tsx`,
 * mais toute implémentation existante doit exposer les props du contrat.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ecartsDeParite,
  lireApiPublique,
  pariteBloquante,
} from "./parite.mjs";

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
  const ecarts = ecartsDeParite(
    contrat,
    {
      variant: {
        type: "autre",
        typescript: '"info" | "error" | undefined',
        utilisee: true,
      },
    },
    "AlertProps",
  );

  assert.deepEqual(ecarts.manquantes, ["disabled"]);
  assert.equal(pariteBloquante(ecarts), true);
});

test("une prop BOOLEAN exposée sous un autre type reste bloquante", () => {
  const ecarts = ecartsDeParite(
    contrat,
    {
      variant: {
        type: "autre",
        typescript: '"info" | "error" | undefined',
        utilisee: true,
      },
      disabled: { type: "autre", typescript: "string | undefined", utilisee: true },
    },
    "AlertProps",
  );

  assert.deepEqual(ecarts.typesIncorrects, [
    { prop: "disabled", attendu: "boolean", recu: "string | undefined" },
  ]);
  assert.equal(pariteBloquante(ecarts), true);
});

test("une prop BOOLEAN déclarée mais jamais lue reste bloquante", () => {
  const ecarts = ecartsDeParite(
    contrat,
    {
      variant: {
        type: "autre",
        typescript: '"info" | "error" | undefined',
        utilisee: true,
      },
      disabled: {
        type: "boolean",
        typescript: "boolean | undefined",
        utilisee: false,
      },
    },
    "AlertProps",
  );

  assert.deepEqual(ecarts.booleensNonUtilises, ["disabled"]);
  assert.equal(pariteBloquante(ecarts), true);
});

test("une implémentation conforme ne bloque pas", () => {
  const ecarts = ecartsDeParite(
    contrat,
    {
      variant: {
        type: "autre",
        typescript: '"info" | "error" | undefined',
        utilisee: true,
      },
      disabled: {
        type: "boolean",
        typescript: "boolean | undefined",
        utilisee: true,
      },
      onClick: { type: "autre", typescript: "() => void", utilisee: true },
    },
    "AlertProps",
  );

  assert.deepEqual(ecarts.manquantes, []);
  assert.deepEqual(ecarts.typesIncorrects, []);
  assert.deepEqual(ecarts.booleensNonUtilises, []);
  assert.equal(pariteBloquante(ecarts), false);
});

test("lireApiPublique résout les types hérités avec le vérificateur TypeScript", () => {
  const scripts = dirname(fileURLToPath(import.meta.url));
  const racine = join(scripts, "..");
  const fixture = join(scripts, "fixtures", "ParityFixture.tsx");
  const api = lireApiPublique([fixture], racine).get(fixture);

  assert.equal(api.enabled.type, "boolean");
  assert.equal(api.enabled.utilisee, true);
  assert.equal(api.invalid.type, "autre");
  assert.match(api.invalid.typescript, /string/);
  assert.equal(api.nullable.type, "autre");
  assert.equal(api.ignored.utilisee, false);
});

/**
 * Verrouille la politique de parité : un contrat peut précéder son `.tsx`,
 * mais toute implémentation existante doit exposer les props du contrat et
 * rendre réellement les composants qu'elle déclare embarquer.
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

/** Relevé de code conforme au contrat ci-dessus, à ajuster test par test. */
const releveConforme = {
  props: {
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
  },
  composants: new Set(),
};

test("un nouveau contrat sans .tsx est informatif et non bloquant", () => {
  const ecarts = ecartsDeParite(contrat, undefined, "AlertProps");

  assert.equal(ecarts.implementationAbsente, true);
  assert.equal(pariteBloquante(ecarts), false);
});

test("une implémentation sans interface publique reste bloquante", () => {
  const ecarts = ecartsDeParite(contrat, { props: null }, "AlertProps");

  assert.equal(ecarts.interfaceAbsente, "AlertProps");
  assert.equal(pariteBloquante(ecarts), true);
});

test("une implémentation qui omet une prop du contrat reste bloquante", () => {
  const ecarts = ecartsDeParite(
    contrat,
    { props: { variant: releveConforme.props.variant }, composants: new Set() },
    "AlertProps",
  );

  assert.deepEqual(ecarts.manquantes, ["disabled"]);
  assert.equal(pariteBloquante(ecarts), true);
});

test("une prop BOOLEAN exposée sous un autre type reste bloquante", () => {
  const ecarts = ecartsDeParite(
    contrat,
    {
      props: {
        variant: releveConforme.props.variant,
        disabled: { type: "autre", typescript: "string | undefined", utilisee: true },
      },
      composants: new Set(),
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
      props: {
        variant: releveConforme.props.variant,
        disabled: { type: "boolean", typescript: "boolean | undefined", utilisee: false },
      },
      composants: new Set(),
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
      props: {
        ...releveConforme.props,
        onClick: { type: "autre", typescript: "() => void", utilisee: true },
      },
      composants: new Set(),
    },
    "AlertProps",
  );

  assert.deepEqual(ecarts.manquantes, []);
  assert.deepEqual(ecarts.typesIncorrects, []);
  assert.deepEqual(ecarts.booleensNonUtilises, []);
  assert.equal(pariteBloquante(ecarts), false);
});

test("une dépendance déclarée mais jamais rendue reste bloquante", () => {
  // Déclarer `composes` sans rendre le composant reviendrait à redessiner un
  // Button à la main : la composition ne serait plus qu'un commentaire.
  const compose = { ...contrat, composes: [{ component: "Button", figmaLayer: "action" }] };
  const ecarts = ecartsDeParite(compose, releveConforme, "AlertProps");

  assert.deepEqual(ecarts.compositionsAbsentes, ["Button"]);
  assert.equal(pariteBloquante(ecarts), true);
});

test("une dépendance réellement rendue ne bloque pas", () => {
  const compose = { ...contrat, composes: [{ component: "Button", figmaLayer: "action" }] };
  const ecarts = ecartsDeParite(
    compose,
    { ...releveConforme, composants: new Set(["Button"]) },
    "AlertProps",
  );

  assert.deepEqual(ecarts.compositionsAbsentes, []);
  assert.equal(pariteBloquante(ecarts), false);
});

test("un contrat sans composes n’impose aucune composition", () => {
  const ecarts = ecartsDeParite(contrat, releveConforme, "AlertProps");

  assert.deepEqual(ecarts.compositionsAbsentes, []);
  assert.equal(pariteBloquante(ecarts), false);
});

test("lireApiPublique résout les types hérités avec le vérificateur TypeScript", () => {
  const scripts = dirname(fileURLToPath(import.meta.url));
  const racine = join(scripts, "..");
  const fixture = join(scripts, "fixtures", "ParityFixture.tsx");
  const { props } = lireApiPublique([fixture], racine).get(fixture);

  assert.equal(props.enabled.type, "boolean");
  assert.equal(props.enabled.utilisee, true);
  assert.equal(props.invalid.type, "autre");
  assert.match(props.invalid.typescript, /string/);
  assert.equal(props.nullable.type, "autre");
  assert.equal(props.ignored.utilisee, false);
});

test("lireApiPublique relève les composants rendus, même importés sous un autre nom", () => {
  const scripts = dirname(fileURLToPath(import.meta.url));
  const racine = join(scripts, "..");
  const fixture = join(scripts, "fixtures", "ComposedFixture.tsx");
  const { composants } = lireApiPublique([fixture], racine).get(fixture);

  // La fixture rend `<Renomme />` : sans résolution de l'alias, un contrat qui
  // déclare embarquer « ParityFixture » serait déclaré fautif à tort.
  assert.equal(composants.has("ParityFixture"), true);
  assert.equal(composants.has("Renomme"), true);
  // Une balise HTML minuscule n'est jamais un composant.
  assert.equal(composants.has("div"), false);
});

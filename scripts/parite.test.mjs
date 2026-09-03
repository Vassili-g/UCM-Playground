/**
 * Verrouille la politique de parité : un contrat peut précéder son `.tsx`,
 * mais toute implémentation existante doit exposer les props du contrat et
 * rendre réellement les composants qu'elle déclare embarquer.
 *
 * Ce qui se verrouille ici est la DÉTECTION de l'écart, pas une sanction :
 * l'écart est publié comme avertissement et ne refuse aucune pull request
 * (cf. `pariteEnEcart` et le rapport de `check-contract.mjs`).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ecartsDeParite,
  lireApiPublique,
  pariteEnEcart,
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
  composants: new Map(),
};

test("un nouveau contrat sans .tsx n’est pas un écart de parité", () => {
  const ecarts = ecartsDeParite(contrat, undefined, "AlertProps");

  assert.equal(ecarts.implementationAbsente, true);
  assert.equal(pariteEnEcart(ecarts), false);
});

test("une implémentation sans interface publique est un écart", () => {
  const ecarts = ecartsDeParite(contrat, { props: null }, "AlertProps");

  assert.equal(ecarts.interfaceAbsente, "AlertProps");
  assert.equal(pariteEnEcart(ecarts), true);
});

test("une implémentation qui omet une prop du contrat est un écart", () => {
  const ecarts = ecartsDeParite(
    contrat,
    { props: { variant: releveConforme.props.variant }, composants: new Map() },
    "AlertProps",
  );

  assert.deepEqual(ecarts.manquantes, ["disabled"]);
  assert.equal(pariteEnEcart(ecarts), true);
});

test("une prop BOOLEAN exposée sous un autre type est un écart", () => {
  const ecarts = ecartsDeParite(
    contrat,
    {
      props: {
        variant: releveConforme.props.variant,
        disabled: { type: "autre", typescript: "string | undefined", utilisee: true },
      },
      composants: new Map(),
    },
    "AlertProps",
  );

  assert.deepEqual(ecarts.typesIncorrects, [
    { prop: "disabled", attendu: "boolean", recu: "string | undefined" },
  ]);
  assert.equal(pariteEnEcart(ecarts), true);
});

test("une prop BOOLEAN déclarée mais jamais lue est un écart", () => {
  const ecarts = ecartsDeParite(
    contrat,
    {
      props: {
        variant: releveConforme.props.variant,
        disabled: { type: "boolean", typescript: "boolean | undefined", utilisee: false },
      },
      composants: new Map(),
    },
    "AlertProps",
  );

  assert.deepEqual(ecarts.booleensNonUtilises, ["disabled"]);
  assert.equal(pariteEnEcart(ecarts), true);
});

test("une implémentation conforme ne produit aucun écart", () => {
  const ecarts = ecartsDeParite(
    contrat,
    {
      props: {
        ...releveConforme.props,
        onClick: { type: "autre", typescript: "() => void", utilisee: true },
      },
      composants: new Map(),
    },
    "AlertProps",
  );

  assert.deepEqual(ecarts.manquantes, []);
  assert.deepEqual(ecarts.typesIncorrects, []);
  assert.deepEqual(ecarts.booleensNonUtilises, []);
  assert.equal(pariteEnEcart(ecarts), false);
});

test("une dépendance déclarée mais jamais rendue est un écart", () => {
  // Déclarer `composes` sans rendre le composant reviendrait à redessiner un
  // Button à la main : la composition ne serait plus qu'un commentaire.
  const compose = { ...contrat, composes: [{ component: "Button", figmaLayer: "action" }] };
  const ecarts = ecartsDeParite(compose, releveConforme, "AlertProps");

  assert.deepEqual(ecarts.compositionsIncorrectes, [
    { component: "Button", attendu: 1, rendu: 0 },
  ]);
  assert.equal(pariteEnEcart(ecarts), true);
});

test("une dépendance réellement rendue ne produit aucun écart", () => {
  const compose = { ...contrat, composes: [{ component: "Button", figmaLayer: "action" }] };
  const ecarts = ecartsDeParite(
    compose,
    { ...releveConforme, composants: new Map([["Button", 1]]) },
    "AlertProps",
  );

  assert.deepEqual(ecarts.compositionsIncorrectes, []);
  assert.equal(pariteEnEcart(ecarts), false);
});

test("une dépendance rendue en surplus est un écart dès que le TSX existe", () => {
  const compose = { ...contrat, composes: [{ component: "Button", figmaLayer: "action" }] };
  const ecarts = ecartsDeParite(
    compose,
    { ...releveConforme, composants: new Map([["Button", 2]]) },
    "AlertProps",
  );

  assert.deepEqual(ecarts.compositionsIncorrectes, [
    { component: "Button", attendu: 1, rendu: 2 },
  ]);
  assert.equal(pariteEnEcart(ecarts), true);
});

test("la composition rapproche le nom Figma libre de son identifiant JSX canonique", () => {
  const compose = {
    ...contrat,
    composes: [{ component: "Icon / Button", figmaLayer: "action" }],
  };
  const ecarts = ecartsDeParite(
    compose,
    { ...releveConforme, composants: new Map([["IconButton", 1]]) },
    "AlertProps",
  );

  assert.deepEqual(ecarts.compositionsIncorrectes, []);
});

test("un contrat sans composes n’impose aucune composition", () => {
  const ecarts = ecartsDeParite(contrat, releveConforme, "AlertProps");

  assert.deepEqual(ecarts.compositionsIncorrectes, []);
  assert.equal(pariteEnEcart(ecarts), false);
});

test("une occurrence JSX ne satisfait pas deux dépendances identiques", () => {
  const compose = {
    ...contrat,
    composes: [
      { component: "Button", figmaLayer: "primaire" },
      { component: "Button", figmaLayer: "secondaire" },
    ],
  };
  const ecarts = ecartsDeParite(
    compose,
    { ...releveConforme, composants: new Map([["Button", 1]]) },
    "CardProps",
  );

  assert.deepEqual(ecarts.compositionsIncorrectes, [
    { component: "Button", attendu: 2, rendu: 1 },
  ]);
  assert.equal(pariteEnEcart(ecarts), true);
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

  // La fixture rend `<Renomme />` : seul le nom exporté est contractuel.
  assert.equal(composants.get("ParityFixture"), 1);
  assert.equal(composants.has("Renomme"), false);
  // Une balise HTML minuscule n'est jamais un composant.
  assert.equal(composants.has("div"), false);
});

test("lireApiPublique ignore le JSX situé hors de la fonction du composant", () => {
  const scripts = dirname(fileURLToPath(import.meta.url));
  const racine = join(scripts, "..");
  const fixture = join(scripts, "fixtures", "CompositionHorsComposantFixture.tsx");
  const { composants } = lireApiPublique([fixture], racine).get(fixture);

  assert.equal(composants.has("ParityFixture"), false);
});

test("lireApiPublique lit un composant emballé dans memo(forwardRef(…))", () => {
  const scripts = dirname(fileURLToPath(import.meta.url));
  const racine = join(scripts, "..");
  const fixture = join(scripts, "fixtures", "EmballeFixture.tsx");
  const { props, composants, fonctionTrouvee } = lireApiPublique([fixture], racine).get(fixture);

  // Sans la traversée des emballages, la prop passerait pour non lue et la
  // dépendance pour non rendue : deux écarts bloquants entièrement faux.
  assert.equal(fonctionTrouvee, true);
  assert.equal(props.action.utilisee, true);
  assert.equal(composants.get("ParityFixture"), 1);
});

test("une fonction de composant introuvable donne un diagnostic, pas une cascade", () => {
  const scripts = dirname(fileURLToPath(import.meta.url));
  const racine = join(scripts, "..");
  const fixture = join(scripts, "fixtures", "SansFonctionFixture.tsx");
  const releve = lireApiPublique([fixture], racine).get(fixture);
  assert.equal(releve.fonctionTrouvee, false);

  const compose = {
    name: "SansFonctionFixture",
    props: { action: { type: "boolean" } },
    composes: [{ component: "Button", figmaLayer: "action" }],
  };
  const ecarts = ecartsDeParite(compose, releve, "SansFonctionFixtureProps");

  assert.equal(ecarts.fonctionAbsente, "SansFonctionFixture");
  assert.deepEqual(ecarts.booleensNonUtilises, []);
  assert.deepEqual(ecarts.compositionsIncorrectes, []);
  assert.equal(pariteEnEcart(ecarts), true);
});

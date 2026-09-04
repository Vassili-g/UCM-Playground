/**
 * Verrouille la politique de parité : un contrat peut précéder son `.tsx`,
 * mais toute implémentation existante doit exposer les props du contrat et
 * rendre réellement les composants qu'elle déclare embarquer.
 *
 * Ce qui se verrouille ici est la DÉTECTION de l'écart, pas une sanction :
 * l'écart est publié comme avertissement et ne refuse aucune pull request.
 *
 * `pariteEnEcart` vient du kit depuis T5.2 : MESURER un écart demande le
 * vérificateur de types et reste ici, DÉCIDER qu'un relevé en porte un ne
 * demande que sa forme. Les deux se testent ensemble parce que c'est ensemble
 * qu'elles servent.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pariteEnEcart } from "@ucm-kit/core/lecteurs";
import {
  cheminDuComposant,
  composantPresent,
  ecartsDeParite,
  lireApiPublique,
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
  assert.equal(ecarts.implementationNonLue, null);
  assert.equal(pariteEnEcart(ecarts), false);
});

/*
 * Les trois tests qui suivent sont T2.3, et ils tiennent une distinction que le
 * moteur ne faisait pas : « pas de relevé » avait une seule cause déclarée et
 * en avait deux réelles.
 */
test("une implémentation présente mais non lue n’est PAS annoncée en attente", () => {
  // Le défaut exact : sans tsconfig, `lireApiPublique` rend une Map vide, donc
  // aucun relevé. Un repo Swift dont le composant est écrit s'entendait dire
  // « implémentation en attente » — sur la pull request d'export elle-même,
  // celle que le designer lit. Une affirmation fausse au seul endroit qui
  // compte, et l'inverse exact de la vérité.
  const ecarts = ecartsDeParite(contrat, undefined, "AlertProps", {
    presente: true,
    chemin: "Alert.swift",
  });

  assert.equal(ecarts.implementationAbsente, false);
  assert.equal(ecarts.implementationNonLue, "Alert.swift");
});

test("une implémentation non lue n’est pas non plus un reproche", () => {
  // Elle ne bloque pas et n'avertit pas : il n'y a personne à qui adresser un
  // geste correctif. Le code est peut-être parfait — c'est l'adaptateur qui ne
  // sait pas le lire, et sa limite n'est pas la faute du développeur.
  const ecarts = ecartsDeParite(contrat, undefined, "AlertProps", {
    presente: true,
    chemin: "Alert.swift",
  });

  assert.equal(pariteEnEcart(ecarts), false);
});

test("sans indication de présence, l’absence reste le verdict par défaut", () => {
  // La compatibilité compte ici : `presente` non renseigné doit continuer de
  // signifier « pas de fichier », sinon tout appelant non mis à jour se met à
  // mentir dans l'autre sens.
  const ecarts = ecartsDeParite(contrat, undefined, "AlertProps", {});

  assert.equal(ecarts.implementationAbsente, true);
  assert.equal(ecarts.implementationNonLue, null);
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

/*
 * T2.3 de bout en bout, sur le disque et non sur un simulacre.
 *
 * Les tests ci-dessus posent la distinction sur des objets fabriqués ; celui-ci
 * la fait parcourir le vrai chemin — un contrat, un motif de cible, un fichier
 * qui existe pour de bon, et le relevé que l'adaptateur TypeScript en tire.
 *
 * Une précision mesurée en l'écrivant, qui corrige ce que le plan supposait :
 * ce n'est pas l'absence de `tsconfig.json` qui vide le relevé — sans lui,
 * TypeScript applique ses options par défaut et le programme se construit quand
 * même. C'est l'absence des FICHIERS (`parite.mjs`, le filtre d'existence en
 * tête de `lireApiPublique`). La conséquence pour un repo non-React est la
 * même, et le défaut reste entier : il n'a simplement pas la cause annoncée.
 */
test("une cible non-React implémentée n’est ni absente ni conforme, mais non lue", () => {
  const scripts = dirname(fileURLToPath(import.meta.url));
  const racine = join(scripts, "..");
  const contratSwift = join(scripts, "fixtures", "CibleNonReact.contract.json");
  const motif = "{dir}/{id}.swift";

  // Le fichier Swift existe ; le `.tsx` que ce repo cherche par défaut, non.
  assert.equal(composantPresent(contratSwift, motif), true);
  assert.equal(composantPresent(contratSwift), false);

  // L'adaptateur TypeScript n'en tire rien : le chemin qu'il interroge n'existe
  // pas, donc `lireApiPublique` ne rend aucune entrée pour lui.
  const composant = cheminDuComposant(contratSwift);
  assert.equal(lireApiPublique([composant], racine).size, 0);

  const ecarts = ecartsDeParite({ props: {} }, undefined, "CibleNonReactProps", {
    presente: composantPresent(contratSwift, motif),
    chemin: "CibleNonReact.swift",
  });

  // Le verdict d'avant T2.3 était `implementationAbsente: true` — « ce composant
  // n'est pas encore écrit », dit à un repo qui l'a écrit.
  assert.equal(ecarts.implementationAbsente, false);
  assert.equal(ecarts.implementationNonLue, "CibleNonReact.swift");
  assert.equal(pariteEnEcart(ecarts), false);
});

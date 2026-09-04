/**
 * Le chemin qui mène un test rouge jusqu'au designer.
 *
 * Ce qui se joue ici n'est pas qu'un test échoue, mais qu'une pull request
 * refusée porte un message. Depuis T5.2, ce fichier ne couvre plus qu'un des
 * deux bouts : ce que le TAP permet de RELEVER, et les deux réponses que ce
 * repository est seul à pouvoir donner sur un échec. Ce que le rapport en DIT
 * est du vocabulaire du format, et se teste dans le kit.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { echecsDuTap, pourLeRapport } from "./echecs-de-tests.mjs";

const RACINE = "/repo";

/** Bloc TAP d'un test en échec, tel que node --test l'écrit. */
function tapEnEchec({ numero = 1, nom, fichier, type = "testCodeFailure", indentation = "" }) {
  return [
    `${indentation}# Subtest: ${nom}`,
    `${indentation}not ok ${numero} - ${nom}`,
    `${indentation}  ---`,
    `${indentation}  duration_ms: 1.5`,
    `${indentation}  type: 'test'`,
    `${indentation}  location: '${fichier}:12:3'`,
    `${indentation}  failureType: '${type}'`,
    `${indentation}  error: 'peu importe'`,
    `${indentation}  ...`,
  ].join("\n");
}

function tapEnErreurTechnique({ nom, fichier }) {
  return tapEnEchec({ nom, fichier }).replace(
    "  error: 'peu importe'",
    "  error: \"Cannot read properties of undefined (reading 'primary')\"\n  name: 'TypeError'",
  );
}

test("un test en échec est relevé avec le fichier qui le porte", () => {
  const tap = [
    "TAP version 13",
    "# Subtest: un test qui passe",
    "ok 1 - un test qui passe",
    tapEnEchec({
      numero: 2,
      nom: "le flux Flex 4.4 reprend toutes les propriétés du contrat",
      fichier: "/repo/src/components/Alert/Alert.test.tsx",
    }),
    "1..2",
  ].join("\n");

  assert.deepEqual(echecsDuTap(tap, RACINE), [
    {
      fichier: "src/components/Alert/Alert.test.tsx",
      test: "le flux Flex 4.4 reprend toutes les propriétés du contrat",
      erreur: "peu importe",
    },
  ]);
});

test("un chemin Windows échappé par TAP redevient un chemin du repository", () => {
  const tap = tapEnEchec({
    nom: "un test en échec",
    fichier: "A:\\\\projets\\\\UCM-Playground\\\\src\\\\components\\\\Alert\\\\Alert.test.tsx",
  });

  assert.deepEqual(echecsDuTap(tap, "A:\\projets\\UCM-Playground"), [
    { fichier: "src/components/Alert/Alert.test.tsx", test: "un test en échec", erreur: "peu importe" },
  ]);
});

test("un parent qui n'échoue que par ses sous-tests n'est pas compté deux fois", () => {
  const tap = [
    "TAP version 13",
    tapEnEchec({
      nom: "sous-test en échec",
      fichier: "/repo/src/components/Alert/Alert.test.tsx",
      indentation: "    ",
    }),
    tapEnEchec({
      numero: 3,
      nom: "groupe",
      fichier: "/repo/src/components/Alert/Alert.test.tsx",
      type: "subtestsFailed",
    }),
  ].join("\n");

  assert.deepEqual(echecsDuTap(tap, RACINE).map(({ test: nom }) => nom), [
    "sous-test en échec",
  ]);
});

test("un fichier qui ne s'importe même pas reste relevé", () => {
  const tap = tapEnEchec({
    nom: "/repo/src/components/Alert/Alert.test.tsx",
    fichier: "/repo/src/components/Alert/Alert.test.tsx",
  });

  assert.equal(echecsDuTap(tap, RACINE).length, 1);
});

/**
 * Les deux réponses que seul ce repository peut donner, et que le kit consomme
 * sans jamais savoir comment elles ont été obtenues.
 *
 * `composant` vient d'une convention de co-localisation — `X.test.tsx` à côté
 * de `X.tsx` — qu'un repo Swift n'aurait pas. `assertion` vient des noms
 * d'erreur de `node:test`. Les deux sont des questions de stack, et c'est pour
 * cela qu'elles restent ici.
 */
test("la projection répond « quel composant » et « le test a-t-il conclu »", () => {
  const projete = pourLeRapport([
    { fichier: "src/components/Alert/Alert.test.tsx", test: "un rendu" },
    {
      fichier: "src/components/Button/Button.test.tsx",
      test: "un test cassé",
      nomErreur: "TypeError",
      erreur: "Cannot read properties of undefined",
    },
    { fichier: "scripts/parite.test.mjs", test: "un garde-fou" },
    { fichier: null, test: "un lanceur muet" },
  ]);

  assert.deepEqual(
    projete.map(({ composant, assertion }) => [composant, assertion]),
    [["Alert", true], ["Button", false], [null, true], [null, true]],
  );
  // Le détail voyage tel quel : le kit l'affiche, il ne le réinterprète pas.
  assert.equal(projete[1].erreur, "Cannot read properties of undefined");
});

/**
 * Une assertion rouge et une erreur d'exécution n'ont pas le même lecteur : la
 * première compare le code au contrat, la seconde dit seulement que la
 * comparaison n'a pas eu lieu. `node:test` nomme la première `AssertionError`,
 * et c'est la seule chose que ce module sait d'elle.
 */
test("une AssertionError reste un verdict, toute autre erreur est une interruption", () => {
  const tap = tapEnErreurTechnique({
    nom: "le token de fond suit le contrat",
    fichier: "/repo/src/components/Button/Button.test.tsx",
  });
  const [echec] = pourLeRapport(echecsDuTap(tap, RACINE));

  assert.equal(echec.nomErreur, "TypeError");
  assert.equal(echec.assertion, false);
  assert.equal(echec.composant, "Button");
});

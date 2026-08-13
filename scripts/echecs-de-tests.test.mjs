/**
 * Le chemin qui mène un test rouge jusqu'au designer.
 *
 * Ce qui se joue ici n'est pas qu'un test échoue, mais qu'une pull request
 * refusée porte un message. Les cas couvrent donc les deux bouts : ce que le
 * TAP permet de relever, et ce que le rapport en dit.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  diagnosticEchecsDeTests,
  echecsDuTap,
  repartirEchecs,
} from "./echecs-de-tests.mjs";

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
    },
  ]);
});

test("un chemin Windows échappé par TAP redevient un chemin du repository", () => {
  const tap = tapEnEchec({
    nom: "un test en échec",
    fichier: "A:\\\\projets\\\\UCM-Playground\\\\src\\\\components\\\\Alert\\\\Alert.test.tsx",
  });

  assert.deepEqual(echecsDuTap(tap, "A:\\projets\\UCM-Playground"), [
    { fichier: "src/components/Alert/Alert.test.tsx", test: "un test en échec" },
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

test("un test de rendu et un test de garde-fou ne s'adressent pas au même lecteur", () => {
  const { rendu, gardeFous } = repartirEchecs([
    { fichier: "src/components/Alert/Alert.test.tsx", test: "un rendu" },
    { fichier: "scripts/parite.test.mjs", test: "un garde-fou" },
    { fichier: null, test: "un lanceur muet" },
  ]);

  assert.deepEqual(rendu.map(({ test: nom }) => nom), ["un rendu"]);
  assert.deepEqual(gardeFous.map(({ test: nom }) => nom), ["un garde-fou", "un lanceur muet"]);
});

test("le rapport nomme le composant et écarte le ré-export", () => {
  const rapport = diagnosticEchecsDeTests({
    echoue: true,
    echecs: [
      { fichier: "src/components/Alert/Alert.test.tsx", test: "le flux Flex 4.4" },
    ],
  }).join("\n");

  assert.match(rapport, /Alert/);
  assert.match(rapport, /le flux Flex 4\.4/);
  assert.match(rapport, /Ré-exporter depuis Figma n’y changera rien|Ré-exporter depuis Figma n'y changera rien/);
});

test("une suite interrompue avant son verdict le dit quand même", () => {
  const rapport = diagnosticEchecsDeTests({ echoue: true, echecs: [] }).join("\n");

  assert.notEqual(rapport, "");
  assert.match(rapport, /export n’est pas en cause|export n'est pas en cause/);
});

test("une suite au vert n'ajoute aucune section au rapport", () => {
  assert.deepEqual(diagnosticEchecsDeTests({ echoue: false, echecs: [] }), []);
});

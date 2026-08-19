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

test("un test de rendu et un test de garde-fou ne s'adressent pas au même lecteur", () => {
  const { rendu, testsComposants, gardeFous } = repartirEchecs([
    { fichier: "src/components/Alert/Alert.test.tsx", test: "un rendu" },
    { fichier: "src/components/Button/Button.test.tsx", test: "un test cassé", nomErreur: "TypeError" },
    { fichier: "scripts/parite.test.mjs", test: "un garde-fou" },
    { fichier: null, test: "un lanceur muet" },
  ]);

  assert.deepEqual(rendu.map(({ test: nom }) => nom), ["un rendu"]);
  assert.deepEqual(testsComposants.map(({ test: nom }) => nom), ["un test cassé"]);
  assert.deepEqual(gardeFous.map(({ test: nom }) => nom), ["un garde-fou", "un lanceur muet"]);
});

test("une TypeError dans un test de composant est rapportée sans accuser le rendu", () => {
  const tap = tapEnErreurTechnique({
    nom: "le token de fond suit le contrat",
    fichier: "/repo/src/components/Button/Button.test.tsx",
  });
  const echecs = echecsDuTap(tap, RACINE);
  const rapport = diagnosticEchecsDeTests({ echoue: true, echecs }, []).join("\n");

  assert.equal(echecs[0].nomErreur, "TypeError");
  assert.match(rapport, /tests n'ont pas pu vérifier la conformité/);
  assert.match(rapport, /Cannot read properties of undefined/);
  assert.match(rapport, /vérifier la lecture du contrat/);
  assert.doesNotMatch(rapport, /Le code n'est plus conforme aux contrats/);
});

const ECHEC_DE_RENDU = {
  echoue: true,
  echecs: [{ fichier: "src/components/Alert/Alert.test.tsx", test: "le flux Flex 4.4" }],
};

test("le rapport nomme le composant et écarte le ré-export quand l’export n’a rien signalé", () => {
  const rapport = diagnosticEchecsDeTests(ECHEC_DE_RENDU, []).join("\n");

  assert.match(rapport, /Alert/);
  assert.match(rapport, /le flux Flex 4\.4/);
  assert.match(rapport, /Réexporter depuis Figma ne corrigera pas ces écarts/);
});

test("un point non décrit interdit d’écarter le ré-export", () => {
  // Une propriété que l'export n'a pas pu décrire manque au contrat, et le
  // test qui la relit échoue pour cette seule raison : c'est bien un ré-export
  // qui débloquera. Affirmer le contraire envoyait le designer à l'opposé.
  const rapport = diagnosticEchecsDeTests(ECHEC_DE_RENDU, [
    "Layer « Size=Medium », gap (variant « medium ») : aucune variable Figma n'est reliée.",
  ]).join("\n");

  assert.match(rapport, /Vérifiez les 1 avertissement/);
  assert.match(rapport, /L'export n'a pas pu décrire certaines informations/);
  assert.match(rapport, /corrigez ce point dans Figma puis réexportez/);
  assert.doesNotMatch(rapport, /Réexporter depuis Figma ne corrigera pas/);
});

test("sans avoir consulté l’export, le rapport ne disculpe pas Figma", () => {
  // Les sorties anticipées publient avant d'avoir lu le moindre contrat :
  // elles ne savent pas si l'export a signalé quelque chose. `null` dit cette
  // ignorance, là où une liste vide affirmerait qu'il n'y a rien.
  const rapport = diagnosticEchecsDeTests(ECHEC_DE_RENDU).join("\n");

  assert.match(rapport, /Alert/);
  assert.doesNotMatch(rapport, /Ré-exporter depuis Figma n’y changera rien|Ré-exporter depuis Figma n'y changera rien/);
  assert.doesNotMatch(rapport, /l'export a signalé/);
});

test("une suite interrompue avant son verdict le dit quand même", () => {
  const rapport = diagnosticEchecsDeTests({ echoue: true, echecs: [] }).join("\n");

  assert.notEqual(rapport, "");
  assert.match(rapport, /consulter les logs de la CI/);
  assert.match(rapport, /La fusion reste bloquée/);
});

test("le problème précède la liste des composants et les écarts", () => {
  const rapport = diagnosticEchecsDeTests({
    echoue: true,
    echecs: [
      { fichier: "src/components/Alert/Alert.test.tsx", test: "le texte suit son style" },
      { fichier: "src/components/Button/Button.test.tsx", test: "le fond suit son token" },
    ],
  }, []).join("\n");

  assert.match(rapport, /^### ❌ Le code n'est plus conforme aux contrats \(2 composants\)/);
  assert.ok(rapport.indexOf("- Alert") < rapport.indexOf("#### Écarts détectés"));
  assert.ok(rapport.indexOf("- Button") < rapport.indexOf("#### Écarts détectés"));
  assert.ok(rapport.indexOf("#### Écarts détectés") < rapport.indexOf("#### Action"));
  assert.doesNotMatch(rapport, /—|Action attendue|Votre export est arrivé|Que faire/);
});

test("une suite au vert n'ajoute aucune section au rapport", () => {
  assert.deepEqual(diagnosticEchecsDeTests({ echoue: false, echecs: [] }), []);
});

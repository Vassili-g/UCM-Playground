/**
 * Tests purs du schéma minimal et du graphe de composition des contrats.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { champsInvalidesDuContrat } from "./validation-contrat.mjs";
import { validerGrapheDesContrats } from "./validation-graphe-contrats.mjs";

function contrat(nom, composes = [], children = []) {
  return {
    name: nom,
    meta: {
      contractVersion: "4.0",
      exportedAt: "2026-07-30T00:00:00.000Z",
      figma: {},
      warnings: [],
    },
    props: {},
    structure: {
      children,
      variantAxes: [],
      variantTokens: {},
      variantStrokes: {},
    },
    stateModel: null,
    rendering: { roles: {} },
    icons: {},
    composes,
    tokensUsed: [],
    intent: null,
  };
}

const document = (chemin, valeur) => ({ chemin, contrat: valeur });

test("un contrat 4.0 complet accepte les blocs vides et les valeurs null prévues", () => {
  assert.deepEqual(champsInvalidesDuContrat(contrat("Button")), []);
});

/**
 * La forme de CHAQUE prop est validée, pas seulement celle du bloc `props`.
 * Sans cela, un enum sans valeurs passait au vert ici puis faisait lever le
 * générateur de types : un plantage de script au lieu d'un diagnostic.
 */
test("une prop enum sans valeurs est diagnostiquée, pas laissée au générateur", () => {
  const casse = contrat("Button");
  casse.props = { size: { type: "enum" } };
  assert.deepEqual(champsInvalidesDuContrat(casse), ["props.size.values"]);
});

test("une liste de valeurs vide ou mal typée est refusée", () => {
  for (const values of [[], ["ok", ""], ["ok", 3]]) {
    const casse = contrat("Button");
    casse.props = { size: { type: "enum", values } };
    assert.deepEqual(champsInvalidesDuContrat(casse), ["props.size.values"]);
  }
});

test("une prop sans type est refusée", () => {
  const casse = contrat("Button");
  casse.props = { size: { values: ["big"] } };
  assert.deepEqual(champsInvalidesDuContrat(casse), ["props.size.type"]);
});

test("un défaut d'enum hors de ses valeurs est refusé", () => {
  const casse = contrat("Button");
  casse.props = { size: { type: "enum", values: ["big", "small"], default: "medium" } };
  assert.deepEqual(champsInvalidesDuContrat(casse), ["props.size.default"]);
});

test("une prop booléenne reste valide sans liste de valeurs", () => {
  const valide = contrat("Button");
  valide.props = { disabled: { type: "boolean", default: false } };
  assert.deepEqual(champsInvalidesDuContrat(valide), []);
});

test("un contrat 4.0 tronqué ne transforme pas composes absent en composant simple", () => {
  const incomplet = contrat("Button");
  delete incomplet.composes;
  delete incomplet.meta.warnings;
  delete incomplet.rendering;

  assert.deepEqual(champsInvalidesDuContrat(incomplet), [
    "meta.warnings",
    "rendering.roles",
    "composes",
  ]);
});

test("les ajouts 4.1 optionnels sont validés lorsqu’ils sont présents", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.1";
  valeur.structure.children = [{
    slot: "content",
    visibilityTargets: [{ visibilityProp: "title", figmaPath: [] }],
  }];
  valeur.icons = {
    circleCheck: {
      policy: "strict",
      figmaName: "circle-check",
      variants: [],
    },
  };

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.children[0].visibilityTargets",
    "icons.circleCheck.variants",
  ]);
});

test("les ajouts 4.2 relient chaque icône à un slot réel", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.2";
  valeur.structure.children = [{ slot: "icon", figmaLayer: "circle-info" }];
  valeur.icons = {
    // Les deux icônes se relaient sur le même slot : c'est le cas que la 4.2
    // rend rendable, et il doit rester valide.
    circleInfo: { policy: "strict", figmaName: "circle-info", slot: "icon", size: "{a.base}" },
    circleCheck: { policy: "strict", figmaName: "circle-check", slot: "icon", size: "{a.base}" },
  };

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);

  // Un slot qui n'existe nulle part rendrait l'icône impossible à placer.
  valeur.icons.circleCheck.slot = "icon-2";
  valeur.icons.circleInfo.size = "";
  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "icons.circleInfo.size",
    "icons.circleCheck.slot",
  ]);
});

test("le graphe refuse une cible sans contrat local", () => {
  const alert = contrat(
    "Alert",
    [{ component: "Ghost", figmaLayer: "Action" }],
    [{ slot: "action", composes: "Ghost" }],
  );
  const erreurs = validerGrapheDesContrats([document("Alert.json", alert)]);

  assert.deepEqual(erreurs.get("Alert.json"), [
    "La dépendance « Ghost » n’a aucun contrat local.",
  ]);
});

test("le graphe compare la séquence et la cardinalité des slots composés", () => {
  const alert = contrat(
    "Alert",
    [
      { component: "Button", figmaLayer: "Primaire" },
      { component: "Button", figmaLayer: "Secondaire" },
    ],
    [{ slot: "action", composes: "Button" }],
  );
  const erreurs = validerGrapheDesContrats([
    document("Alert.json", alert),
    document("Button.json", contrat("Button")),
  ]);

  assert.deepEqual(erreurs.get("Alert.json"), [
    "`composes` et `structure.children[].composes` ne décrivent pas la même séquence de dépendances.",
  ]);
});

test("le graphe refuse les noms de contrat dupliqués", () => {
  const erreurs = validerGrapheDesContrats([
    document("a/Button.json", contrat("Button")),
    document("b/Button.json", contrat("Button")),
  ]);

  assert.deepEqual(erreurs.get("a/Button.json"), [
    "Plusieurs contrats déclarent le composant « Button ».",
  ]);
  assert.deepEqual(erreurs.get("b/Button.json"), [
    "Plusieurs contrats déclarent le composant « Button ».",
  ]);
});

test("le graphe refuse deux noms Figma qui produisent le même identifiant de code", () => {
  const erreurs = validerGrapheDesContrats([
    document("a/IconButton.json", contrat("Icon Button")),
    document("b/IconButton.json", contrat("Icon/Button")),
  ]);

  const message =
    "Les noms Figma « Icon Button » et « Icon/Button » donnent le même identifiant de code « IconButton ».";
  assert.deepEqual(erreurs.get("a/IconButton.json"), [message]);
  assert.deepEqual(erreurs.get("b/IconButton.json"), [message]);
});

test("le graphe détecte un cycle de composition", () => {
  const alert = contrat(
    "Alert",
    [{ component: "Card", figmaLayer: "Card" }],
    [{ slot: "card", composes: "Card" }],
  );
  const card = contrat(
    "Card",
    [{ component: "Alert", figmaLayer: "Alert" }],
    [{ slot: "alert", composes: "Alert" }],
  );
  const erreurs = validerGrapheDesContrats([
    document("Alert.json", alert),
    document("Card.json", card),
  ]);

  assert.match(erreurs.get("Alert.json")[0], /Alert → Card → Alert/);
  assert.match(erreurs.get("Card.json")[0], /Alert → Card → Alert/);
});

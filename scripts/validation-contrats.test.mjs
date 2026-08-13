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

test("la 4.3 valide les parties textuelles à toute profondeur", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.3";
  valeur.structure.children = [{
    slot: "label",
    figmaLayer: "Text",
    layout: "flex-column",
    gap: "{components.alert.sizes.text-gap}",
    children: [
      {
        slot: "label",
        figmaLayer: "Titre",
        visibilityProp: "title",
        typography: { fontSize: "{components.alert.sizes.title-size}" },
      },
      {
        slot: "label-2",
        figmaLayer: "Description",
        typography: { fontSize: "{components.alert.sizes.description-size}" },
      },
    ],
  }];

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);
});

test("la 4.3 refuse une récursion ambiguë ou mal formée", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.3";
  valeur.structure.children = [
    {
      slot: "label",
      typography: { fontSize: "{a.title}" },
      layout: "diagonal",
      gap: 8,
      children: [{ slot: "", typography: {} }],
    },
    { slot: "content", children: "pas-un-tableau" },
    { slot: "leaf", layout: "flex-row", gap: "{a.gap}" },
  ];

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.children[0].typography",
    "structure.children[0].layout",
    "structure.children[0].gap",
    "structure.children[0].children[0].slot",
    "structure.children[0].children[0].typography",
    "structure.children[1].children",
    "structure.children[2].layout",
    "structure.children[2].gap",
  ]);
});

test("un contrat 4.2 ne peut pas annoncer la récursion introduite en 4.3", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.2";
  valeur.structure.children = [{ slot: "label", children: [{ slot: "label" }] }];

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.children[0].children",
  ]);
});

test("la 4.4 valide le placement Flex du conteneur et de ses slots", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.4";
  valeur.structure.justifyContent = "flex-start";
  valeur.structure.alignItems = "center";
  valeur.structure.children = [
    { slot: "icon" },
    { slot: "label", flexGrow: 1 },
    { slot: "action", alignSelf: "stretch" },
  ];

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);
});

test("la 4.4 refuse un placement Flex incomplet ou hors vocabulaire", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.4";
  valeur.structure.justifyContent = "around";
  valeur.structure.children = [
    { slot: "icon", alignSelf: "middle", flexGrow: 0 },
    { slot: "content", children: [{ slot: "label" }], alignItems: "center" },
  ];

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.justifyContent",
    "structure.alignItems",
    "structure.children[0].alignSelf",
    "structure.children[0].flexGrow",
    "structure.children[1].justifyContent",
  ]);
});

test("un contrat 4.3 ne peut pas annoncer les propriétés Flex introduites en 4.4", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.3";
  valeur.structure.justifyContent = "flex-start";
  valeur.structure.alignItems = "center";
  valeur.structure.children = [{ slot: "label", flexGrow: 1, alignSelf: "stretch" }];

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.justifyContent",
    "structure.alignItems",
    "structure.children[0].alignSelf",
    "structure.children[0].flexGrow",
  ]);
});

test("la 4.5 réserve la font size des slots à la carte des tailles", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.5";
  valeur.structure.sizes = {
    compact: { gap: null, padding: { x: null, y: null }, radius: null, fontSize: "{a.compact}" },
    comfortable: { gap: null, padding: { x: null, y: null }, radius: null, fontSize: "{a.comfortable}" },
  };
  valeur.structure.children = [{
    slot: "content",
    children: [{ slot: "label", typography: { fontWeight: "{a.weight}" } }],
  }];

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);

  valeur.structure.children[0].children[0].typography.fontSize = "{a.reference}";
  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.children[0].children[0].typography.fontSize",
  ]);
});

test("la 4.6 relie chaque texte de chaque variant à un text style tokenisé", () => {
  const valeur = contrat("Alert");
  valeur.meta.contractVersion = "4.6";
  valeur.structure.variantAxes = ["severity"];
  valeur.structure.children = [{
    slot: "content",
    children: [
      { slot: "label", figmaLayer: "Titre" },
      { slot: "label-2", figmaLayer: "Description" },
    ],
  }];
  valeur.textStyles = {
    "body.large": {
      figmaName: "Body/Large",
      tokens: {
        fontSize: "{typography.body.large.fontsize}",
        letterSpacing: "{typography.body.large.letterspacing}",
      },
    },
    "body.small": {
      figmaName: "Body/Small",
      tokens: { fontSize: "{typography.body.small.fontsize}" },
    },
  };
  valeur.structure.variantTypography = {
    info: [
      { slotPath: ["content", "label"], style: "body.large" },
      { slotPath: ["content", "label-2"], style: "body.small" },
    ],
  };

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);
});

test("la 4.6 refuse les anciennes autorités et les liens typographiques orphelins", () => {
  const valeur = contrat("Button");
  valeur.meta.contractVersion = "4.6";
  valeur.structure.children = [{
    slot: "label",
    typography: "Label/Large",
  }];
  valeur.structure.sizes = {
    big: {
      gap: null,
      padding: { x: null, y: null },
      radius: null,
      fontSize: "{legacy.fontsize}",
    },
  };
  valeur.textStyles = {
    "label.large": {
      figmaName: "Label/Large",
      tokens: { fontSize: "{typography.label.large.fontsize}" },
    },
    unused: {
      figmaName: "Unused",
      tokens: { fontSize: "{typography.unused.fontsize}" },
    },
  };
  valeur.structure.variantTypography = {
    default: [
      { slotPath: ["missing"], style: "label.large" },
      { slotPath: ["label"], style: "unknown" },
    ],
  };

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.children[0].typography",
    "structure.sizes.big.fontSize",
    "structure.variantTypography.default[0].slotPath",
    "structure.variantTypography.default[1].style",
    "textStyles.unused",
  ]);
});

/**
 * La 4.7 rend une absence lisible : sans elle, un slot sans `flexGrow` pouvait
 * aussi bien hug que porter une largeur imposée que rien ne publiait.
 */
test("la 4.7 publie le dimensionnement du composant et les deux côtés d’un slot", () => {
  const valeur = contrat("Card");
  valeur.meta.contractVersion = "4.7";
  valeur.structure.sizing = { horizontal: "fill", vertical: "hug" };
  valeur.structure.children = [
    { slot: "icon", size: "{components.icons.sizes.base}" },
    { slot: "media", size: { width: "{components.card.width}", height: "{components.card.height}" } },
    { slot: "label", size: { width: "{components.card.label-width}" } },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);
});

test("la 4.7 refuse un dimensionnement incomplet ou une taille vide", () => {
  const valeur = contrat("Card");
  valeur.meta.contractVersion = "4.7";
  valeur.structure.sizing = { horizontal: "stretch", vertical: "hug" };
  valeur.structure.children = [
    { slot: "media", size: {} },
    { slot: "label", size: { depth: "{components.card.depth}" } },
    { slot: "icon", size: { width: "16px" } },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.sizing",
    "structure.children[0].size",
    "structure.children[1].size",
    "structure.children[2].size",
  ]);
});

test("un contrat 4.7 sans dimensionnement est incomplet, pas silencieusement hug", () => {
  const valeur = contrat("Card");
  valeur.meta.contractVersion = "4.7";
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), ["structure.sizing"]);
});

test("un contrat 4.6 ne peut pas annoncer le dimensionnement introduit en 4.7", () => {
  const valeur = contrat("Card");
  valeur.meta.contractVersion = "4.6";
  valeur.structure.sizing = { horizontal: "fill", vertical: "hug" };
  valeur.structure.children = [
    { slot: "media", size: { width: "{components.card.width}" } },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.sizing",
    "structure.children[0].size",
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
    "`composes` et les slots récursifs de `structure.children` ne décrivent pas la même séquence de dépendances.",
  ]);
});

test("le graphe 4.3 relève une composition descendue dans l'arbre textuel", () => {
  const alert = contrat(
    "Alert",
    [{ component: "Button", figmaLayer: "Action" }],
    [{
      slot: "content",
      children: [{ slot: "action", composes: "Button" }],
    }],
  );
  alert.meta.contractVersion = "4.3";

  const erreurs = validerGrapheDesContrats([
    document("Alert.json", alert),
    document("Button.json", contrat("Button")),
  ]);

  assert.deepEqual(erreurs.get("Alert.json"), []);
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

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
 * Le dimensionnement rend une absence lisible : sans lui, un slot sans
 * `flexGrow` couvre aussi bien un contenu qui se suffit qu'une largeur imposée.
 */
test("la 4.8 publie le dimensionnement du composant et les deux côtés d’un slot", () => {
  const valeur = contrat("Card");
  valeur.meta.contractVersion = "4.8";
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
  valeur.structure.children = [
    { slot: "icon", size: "{components.icons.sizes.base}" },
    { slot: "media", size: { width: "{components.card.width}", height: "{components.card.height}" } },
    { slot: "label", size: { width: "{components.card.label-width}" } },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);
});

test("la 4.8 refuse un dimensionnement incomplet ou une taille vide", () => {
  const valeur = contrat("Card");
  valeur.meta.contractVersion = "4.8";
  // `fill` est le mot de Figma : la 4.8 attend celui de CSS.
  valeur.structure.sizing = { width: "fill", height: "fit-content" };
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

test("un contrat 4.8 sans dimensionnement est incomplet, pas silencieusement fit-content", () => {
  const valeur = contrat("Card");
  valeur.meta.contractVersion = "4.8";
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), ["structure.sizing"]);
});

test("la 5.2 accepte un axe du composant dimensionné par un token", () => {
  // Une tuile carrée dont le design system nomme le côté : la dimension figée
  // décrit le composant, elle ne présente plus le component set.
  const valeur = contrat("TileLink");
  valeur.meta.contractVersion = "5.2";
  valeur.structure.sizing = {
    width: "{components.tilelink.sizes.tile}",
    height: "{components.tilelink.sizes.tile}",
  };
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);

  // Les deux mots CSS restent valides : un axe qui hug ou qui s'étire n'a
  // aucun token à citer.
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
  assert.deepEqual(champsInvalidesDuContrat(valeur), []);

  // Une dimension brute reste refusée — c'est tout l'objet de la règle.
  valeur.structure.sizing = { width: "96px", height: "fit-content" };
  assert.deepEqual(champsInvalidesDuContrat(valeur), ["structure.sizing"]);
});

test("un contrat 5.1 ne peut pas annoncer un dimensionnement tokenisé", () => {
  const valeur = contrat("TileLink");
  valeur.meta.contractVersion = "5.1";
  valeur.structure.sizing = {
    width: "{components.tilelink.sizes.tile}",
    height: "{components.tilelink.sizes.tile}",
  };
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), ["structure.sizing"]);
});

/**
 * Une borne n'est pas une taille : elle s'applique quel que soit le menu de
 * dimensionnement, et le cas courant est celui qu'aucun `size` ne sait écrire —
 * un layer qui remplit son axe sans dépasser une largeur.
 */
test("la 5.3 publie les bornes du composant et celles d’un slot", () => {
  const valeur = contrat("Divider");
  valeur.meta.contractVersion = "5.3";
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
  valeur.structure.bounds = { maxWidth: "{components.divider.max-width}" };
  valeur.structure.children = [
    {
      slot: "rule",
      flexGrow: 1,
      bounds: {
        minWidth: "{components.divider.min-width}",
        maxWidth: "{components.divider.max-width}",
      },
    },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);
});

test("la 5.3 refuse une borne brute, inconnue ou vide", () => {
  const valeur = contrat("Divider");
  valeur.meta.contractVersion = "5.3";
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
  // Un nombre écrit à la main est une mesure de maquette : l'Exporter avertit
  // au lieu de le publier, et le validateur refuse qu'il arrive ici.
  valeur.structure.bounds = { maxWidth: "640px" };
  valeur.structure.children = [
    { slot: "rule", bounds: {} },
    { slot: "gutter", bounds: { maxDepth: "{components.divider.max-depth}" } },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.bounds",
    "structure.children[0].bounds",
    "structure.children[1].bounds",
  ]);
});

test("un contrat 5.2 ne peut pas annoncer de bornes", () => {
  const valeur = contrat("Divider");
  valeur.meta.contractVersion = "5.2";
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
  valeur.structure.bounds = { maxWidth: "{components.divider.max-width}" };
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), ["structure.bounds"]);
});

test("un contrat 4.7 déjà fusionné garde les axes et les mots de Figma", () => {
  const valeur = contrat("Card");
  valeur.meta.contractVersion = "4.7";
  valeur.structure.sizing = { horizontal: "fill", vertical: "hug" };
  valeur.structure.children = [
    { slot: "media", size: { width: "{components.card.width}" } },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);

  // La forme CSS appartient à la 4.8 : sous 4.7, elle n'est pas reconnue.
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
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

test("le graphe v8 conserve une dépendance présente seulement dans un variant non-référence", () => {
  const alert = contratV8();
  alert.name = "Alert";
  alert.composes = [{ component: "Button", figmaLayer: "Action" }];
  alert.structure.children = [];
  alert.variants = [
    {
      ...alert.variants[0],
      nodeId: "10:1",
      figmaName: "State=Default",
      values: { state: "default" },
      structure: { ...alert.variants[0].structure, children: [] },
      composes: [],
    },
    {
      ...alert.variants[0],
      nodeId: "10:2",
      figmaName: "State=With action",
      values: { state: "with-action" },
      structure: {
        ...alert.variants[0].structure,
        children: [{ slot: "action", composes: "Button" }],
      },
      composes: [{ component: "Button", figmaLayer: "Action" }],
    },
  ];

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

/**
 * Le passage à la ligne, introduit par la 5.4.
 *
 * `wrap` n'a qu'une valeur légale : le contrat ne publie que les exceptions, et
 * une absence dit déjà « une seule ligne ». `rowGap` n'existe que sous `wrap` —
 * et son absence y vaut le `gap`, la lecture de Figma comme celle de CSS.
 */
test("la 5.4 publie le wrap du composant et celui d’un slot conteneur", () => {
  const valeur = contrat("Tags");
  valeur.meta.contractVersion = "5.4";
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
  valeur.structure.wrap = true;
  valeur.structure.rowGap = "{components.tags.sizes.row-gap}";
  valeur.structure.children = [
    {
      slot: "ligne",
      layout: "flex-row",
      justifyContent: "flex-start",
      alignItems: "center",
      wrap: true,
      rowGap: "{components.tags.sizes.row-gap}",
      children: [{ slot: "label", figmaLayer: "Tag" }],
    },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), []);
});

test("la 5.4 refuse un wrap qui n’est pas true et un rowGap sans wrap", () => {
  const valeur = contrat("Tags");
  valeur.meta.contractVersion = "5.4";
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
  valeur.structure.wrap = "wrap";
  valeur.structure.children = [
    { slot: "ligne", rowGap: "{components.tags.sizes.row-gap}" },
  ];
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), [
    "structure.wrap",
    "structure.children[0].rowGap",
  ]);
});

test("un contrat 5.3 ne peut pas annoncer de wrap", () => {
  const valeur = contrat("Tags");
  valeur.meta.contractVersion = "5.3";
  valeur.structure.sizing = { width: "stretch", height: "fit-content" };
  valeur.structure.wrap = true;
  valeur.textStyles = {};
  valeur.structure.variantTypography = { default: [] };

  assert.deepEqual(champsInvalidesDuContrat(valeur), ["structure.wrap"]);
});

/** Un contrat de la version demandée, dont la structure est réglée sur mesure. */
function contratVersionne(version, structure) {
  const valeur = contrat("Galerie");
  valeur.meta.contractVersion = version;
  // Depuis la 4.6, la typographie vit dans son propre catalogue et ses usages.
  valeur.textStyles = {};
  valeur.structure = {
    ...valeur.structure,
    layout: "flex-column",
    sizing: { width: "stretch", height: "fit-content" },
    variantTypography: { default: [] },
    ...structure,
  };
  return valeur;
}

/**
 * La grille de la 6.0 et ses pistes de la 7.0.
 *
 * Un conteneur de grille porte des LIGNES sans passer à la ligne : exiger `wrap`
 * à côté de son `rowGap` refusait toute grille correctement tokenisée — c'est ce
 * qui a bloqué le premier export 7.0.
 */
test("une grille complète de la 7.0 est acceptée", () => {
  const valide = contratVersionne("7.0", {
    children: [{
      slot: "tilesgrid",
      layout: "grid",
      columns: 2,
      rows: 2,
      columnSizes: ["1fr", "1fr"],
      rowSizes: [null, "fit-content"],
      columnGap: "{sizes.gap-col}",
      rowGap: "{sizes.gap-row}",
      children: [
        { slot: "tile", columnStart: 1, rowStart: 1 },
        { slot: "tile-2", columnStart: 2, rowStart: 1, columnSpan: 2, justifySelf: "center" },
      ],
    }],
  });
  assert.deepEqual(champsInvalidesDuContrat(valide), []);
});

test("un rowGap sans wrap reste refusé hors d’une grille", () => {
  const casse = contratVersionne("7.0", {
    children: [{
      slot: "cadre",
      layout: "flex-row",
      rowGap: "{sizes.gap-row}",
      children: [{ slot: "label" }],
    }],
  });
  assert.deepEqual(champsInvalidesDuContrat(casse), ["structure.children[0].rowGap"]);
});

test("un champ de grille porteur d’une valeur hors d’une grille est refusé", () => {
  const casse = contratVersionne("7.0", {
    children: [{
      slot: "cadre",
      layout: "flex-row",
      columns: 3,
      children: [{ slot: "label" }],
    }],
  });
  assert.deepEqual(champsInvalidesDuContrat(casse), ["structure.children[0].columns"]);
});

test("un columnGap null hors d’une grille n’affirme rien et passe", () => {
  // La convention du contrat partout ailleurs : `null` dit qu'il n'y a rien à
  // publier, pas qu'il y a une grille.
  const valide = contratVersionne("7.0", { columnGap: null, rowGap: null });
  assert.deepEqual(champsInvalidesDuContrat(valide), []);
});

test("un tableau de pistes qui contredit le nombre de pistes est refusé", () => {
  const casse = contratVersionne("7.0", {
    children: [{
      slot: "tilesgrid",
      layout: "grid",
      rows: 3,
      rowSizes: ["1fr", "1fr"],
      children: [{ slot: "tile" }],
    }],
  });
  assert.deepEqual(champsInvalidesDuContrat(casse), ["structure.children[0].rowSizes"]);
});

test("une grille annoncée par un contrat antérieur à la 6.0 est refusée", () => {
  const casse = contratVersionne("5.5", {
    children: [{ slot: "tilesgrid", layout: "grid", children: [{ slot: "tile" }] }],
  });
  assert.deepEqual(champsInvalidesDuContrat(casse), ["structure.children[0].layout"]);
});

test("les pistes et les ancres sont refusées à un contrat 6.0", () => {
  const casse = contratVersionne("6.0", {
    children: [{
      slot: "tilesgrid",
      layout: "grid",
      rowSizes: ["1fr"],
      children: [{ slot: "tile", rowStart: 1 }],
    }],
  });
  assert.deepEqual(champsInvalidesDuContrat(casse), [
    "structure.children[0].rowSizes",
    "structure.children[0].children[0].rowStart",
  ]);
});

function contratV8() {
  const valeur = contratVersionne("8.0", {});
  valeur.props = {
    icon: {
      type: "instance-swap",
      default: "1:2",
      preferredValues: [{ type: "COMPONENT_SET", key: "icon-key" }],
    },
    content: {
      type: "slot",
      default: "",
      preferredValues: [],
      settings: { stretchChildOnInsert: true },
    },
  };
  const structure = {
    layout: "flex-row",
    sizing: { width: "stretch", height: "fit-content" },
    children: [],
  };
  valeur.variants = [{
    nodeId: "10:1",
    figmaName: "Variant=Default",
    values: {},
    structure,
    tokens: {},
    strokes: {},
    typography: [],
    composes: [],
    icons: {},
  }];
  valeur.propertyBindings = [{
    prop: "icon",
    figmaPropName: "Icon#4:2",
    target: "mainComponent",
    nodeId: "10:4",
    figmaPath: ["Icon"],
    variant: {},
  }];
  valeur.meta.diagnostics = [];
  valeur.meta.coverage = { portable: "complete" };
  return valeur;
}

test("un contrat 8.0 valide sa projection portable exacte", () => {
  assert.deepEqual(champsInvalidesDuContrat(contratV8()), []);
});

test("une icône modifiable peut réutiliser sa prop INSTANCE_SWAP native", () => {
  const valeur = contratV8();
  valeur.icons = {
    glyph: {
      policy: "modifiable",
      figmaName: "Glyph",
      runtimeProp: "icon",
    },
  };
  assert.deepEqual(champsInvalidesDuContrat(valeur), []);

  valeur.icons.glyph.runtimeProp = "content";
  assert.deepEqual(champsInvalidesDuContrat(valeur), ["icons.glyph.runtimeProp"]);
});

test("une prop enum de wrapper reste valide sans devenir un axe de variante", () => {
  const valeur = contratV8();
  valeur.props.wrapperMode = {
    type: "enum",
    values: ["compact", "comfortable"],
    default: "comfortable",
  };
  assert.deepEqual(champsInvalidesDuContrat(valeur), []);
});

test("les feuilles exactes refusent les tokens bruts et les strokes incomplets", () => {
  const casse = contratV8();
  casse.variants[0].tokens = { background: "#fff" };
  casse.variants[0].strokes = {
    border: { color: "{colors.border}", width: { top: "{sizes.stroke}" }, align: "inside" },
  };
  assert.deepEqual(champsInvalidesDuContrat(casse), [
    "variants[0].tokens.background",
    "variants[0].strokes.border",
  ]);
});

test("une liaison v8 doit viser une prop et une combinaison réellement publiées", () => {
  const casse = contratV8();
  casse.propertyBindings[0].prop = "inconnue";
  assert.deepEqual(champsInvalidesDuContrat(casse), ["propertyBindings[0]"]);
});

test("une valeur d'enum absente de l'API publique est refusée dans une variante exacte", () => {
  const casse = contratV8();
  casse.props.size = { type: "enum", values: ["small", "large"], default: "small" };
  casse.structure.variantAxes = ["size"];
  casse.variants = [
    { ...casse.variants[0], values: { size: "small" } },
    { ...casse.variants[0], nodeId: "10:2", figmaName: "Medium", values: { size: "medium" } },
  ];
  casse.propertyBindings[0].variant = { size: "small" };
  assert.deepEqual(champsInvalidesDuContrat(casse), ["variants[1].values.size"]);
});

test("les valeurs par défaut des enums doivent former une variante réellement présente", () => {
  const casse = contratV8();
  casse.props.variant = { type: "enum", values: ["contained", "outlined"], default: "contained" };
  casse.props.size = { type: "enum", values: ["small", "large"], default: "large" };
  casse.structure.variantAxes = ["variant", "size"];
  casse.structure.variantTypography = {
    contained: { small: [] },
    outlined: { large: [] },
  };
  casse.variants = [
    { ...casse.variants[0], values: { variant: "contained", size: "small" } },
    { ...casse.variants[0], nodeId: "10:2", figmaName: "Outlined", values: { variant: "outlined", size: "large" } },
  ];
  casse.propertyBindings[0].variant = { variant: "contained", size: "small" };
  assert.deepEqual(champsInvalidesDuContrat(casse), ["variants.defaults"]);
});

test("un layer hors flux publie ses bords d’accroche, et seulement des bords connus", () => {
  const valide = contratVersionne("6.0", {
    children: [{
      slot: "badge",
      position: "absolute",
      constraints: { horizontal: "right", vertical: "top" },
    }],
  });
  assert.deepEqual(champsInvalidesDuContrat(valide), []);

  const casse = contratVersionne("6.0", {
    children: [{ slot: "badge", position: "absolute", constraints: { horizontal: "MAX", vertical: "top" } }],
  });
  assert.deepEqual(champsInvalidesDuContrat(casse), ["structure.children[0].constraints"]);
});

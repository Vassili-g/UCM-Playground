/**
 * Tests de la forme d'une référence et de son voisinage.
 *
 * Le voisinage porte le seul fait mesurable qui distingue une migration de
 * tokens d'une variable Figma déliée : une migration emporte un groupe entier,
 * une liaison manquante n'emporte qu'une feuille. Le rapport de pull request
 * s'appuie dessus pour cesser d'affirmer une cause qu'il ne possède pas.
 */
import assert from "node:assert/strict";
import test from "node:test";

import {
  cheminParent,
  collecterReferences,
  sansEchantillon,
  voisinesDeclarees,
} from "./references-token.mjs";

test("le groupe d’une référence est son chemin privé du dernier segment", () => {
  assert.equal(
    cheminParent("{components.button.sizes.medium.gap}"),
    "components.button.sizes.medium",
  );
  assert.equal(cheminParent("{components.alert.sizes.gap}"), "components.alert.sizes");
});

test("une feuille manquante dans un groupe intact garde ses voisines", () => {
  // Le cas vécu : le gap du variant « medium » a été délié dans Figma, donc il
  // a disparu du contrat, mais paddings et radius du même variant y sont.
  const declarees = new Set([
    "{components.button.sizes.medium.padding-x}",
    "{components.button.sizes.medium.padding-y}",
    "{components.button.sizes.big.gap}",
  ]);

  assert.deepEqual(voisinesDeclarees("{components.button.sizes.medium.gap}", declarees), [
    "{components.button.sizes.medium.padding-x}",
    "{components.button.sizes.medium.padding-y}",
  ]);
});

test("une migration emporte le groupe entier, donc aucune voisine", () => {
  const declarees = new Set([
    "{components.alert.typography.title.size}",
    "{components.alert.spacing.gap}",
  ]);

  assert.deepEqual(voisinesDeclarees("{components.alert.sizes.title-size}", declarees), []);
});

test("une référence ne se compte pas elle-même comme voisine", () => {
  const declarees = new Set(["{components.button.sizes.medium.gap}"]);
  assert.deepEqual(voisinesDeclarees("{components.button.sizes.medium.gap}", declarees), []);
});

test("le voisinage ne franchit pas la frontière d’un groupe", () => {
  // `sizes.big.gap` n'est PAS voisine de `sizes.medium.gap` : leurs groupes
  // diffèrent. Sans cela, tout token du design system serait voisin de tout
  // autre, et le signal ne distinguerait plus rien.
  const declarees = new Set(["{components.button.sizes.big.gap}"]);
  assert.deepEqual(voisinesDeclarees("{components.button.sizes.medium.gap}", declarees), []);
});

test("un texte de maquette en forme de référence n'est pas une référence", () => {
  // Le cas qui a motivé l'exclusion : un DS d'assurance écrit « {montant.total} »
  // dans une maquette. Sans elle, le rapport enverrait le designer relier une
  // variable que personne n'a jamais voulu créer.
  const contrat = {
    tokensUsed: ["{colors.surface}"],
    structure: { children: [] },
    variants: [{ tokens: { surface: "{colors.surface}" }, sample: "s1" }],
    samples: {
      s1: {
        text: [
          // `REFERENCE` est ancrée : seul un texte qui EST une référence compte.
          { slotPath: ["a"], figmaLayer: "Gabarit", value: "{montant.total}" },
          { slotPath: ["b"], figmaLayer: "Phrase", value: "Total : {montant.total}" },
        ],
        composes: [{ figmaLayer: "B", component: "Button", args: { label: "{piege.absolu}" } }],
      },
    },
  };

  assert.deepEqual(
    [...collecterReferences(sansEchantillon(contrat))].sort(),
    ["{colors.surface}"],
  );
  // Sans l'exclusion, les deux pièges remonteraient.
  assert.equal(collecterReferences(contrat).size, 3);
});

test("sansEchantillon laisse tout le reste intact et ne mute pas son entrée", () => {
  const contrat = { name: "X", samples: { s1: {} }, props: {} };
  const corps = sansEchantillon(contrat);
  assert.deepEqual(corps, { name: "X", props: {} });
  assert.ok(contrat.samples, "l'original garde son catalogue");
  assert.equal(sansEchantillon(null), null);
});

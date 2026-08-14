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

import { cheminParent, voisinesDeclarees } from "./references-token.mjs";

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

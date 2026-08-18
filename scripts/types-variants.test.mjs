import assert from "node:assert/strict";
import test from "node:test";
import { nomsEnumsDeVariantes, typeVariantesExactes } from "./types-variants.mjs";

test("le type exact ne réintroduit pas les combinaisons absentes d'une matrice clairsemée", () => {
  const type = typeVariantesExactes("Button", ["variant", "size"], [
    { values: { variant: "contained", size: "small", state: "default" } },
    { values: { variant: "outlined", size: "large", state: "hover" } },
    { values: { variant: "outlined", size: "large", state: "focus" } },
  ]);

  assert.equal(type, `/** Combinaisons de props réellement présentes dans Figma. */
export type ButtonVariantProps =
  | { "variant": "contained"; "size": "small" }
  | { "variant": "outlined"; "size": "large" };`);
  assert.doesNotMatch(type, /contained.*large/);
  assert.doesNotMatch(type, /outlined.*small/);
});

test("aucun type exact n'est inventé quand une variante ne renseigne pas tous les enums", () => {
  assert.equal(typeVariantesExactes("Button", ["variant", "size"], [
    { values: { variant: "contained" } },
  ]), null);
});

test("une prop enum de wrapper n'est pas prise pour un axe de la matrice", () => {
  assert.deepEqual(
    nomsEnumsDeVariantes(["variant", "size", "wrapperMode"], ["variant", "size", "state"]),
    ["variant", "size"],
  );
});

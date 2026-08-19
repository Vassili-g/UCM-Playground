import assert from "node:assert/strict";
import test from "node:test";
import { bilanEstBloquant } from "./verdict-bilan.mjs";

function bilan(overrides = {}) {
  return {
    illisible: false,
    champsAbsents: [],
    version: null,
    graphe: [],
    manquants: [],
    nonListes: [],
    fantomes: [],
    typesTypographiques: [],
    ...overrides,
  };
}

test("une référence absente des tokens ne bloque pas le contrat", () => {
  assert.equal(bilanEstBloquant(bilan({ manquants: ["{ancien.token}"] }), false), false);
});

test("les incohérences internes du contrat restent bloquantes", () => {
  assert.equal(bilanEstBloquant(bilan({ nonListes: ["{token.non.indexe}"] }), false), true);
  assert.equal(bilanEstBloquant(bilan(), true), true);
});

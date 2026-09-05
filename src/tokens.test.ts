/**
 * Tests du seul pont token → CSS du repository.
 *
 * `tokenVar` porte l'invariant « le nom du token EST son chemin » : tout style
 * de tout composant passe par lui.
 *
 * **Ce que ce fichier ne teste plus, et pourquoi (T9.9).** La PROJECTION
 * elle-même — comment un chemin devient un nom de variable — appartient au kit
 * depuis T6.0/T6.2 : `tokenCssVariable` en est l'unique autorité et
 * `names.test.ts` la couvre là-bas. Trois tests d'ici la reprenaient point par
 * point ; les garder, c'était juger deux fois la même fonction et faire croire
 * qu'une divergence serait vue ici. Reste ce que `tokenVar` fait EN PROPRE :
 * envelopper en `var(…)`, et refuser tout ce qui n'est pas une référence.
 * L'accord avec le CSS réellement généré est `tokens-accord.test.ts`, sur les
 * 721 tokens du corpus.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { toRef, tokenCssVariable } from "@ucm-kit/core/format";

import { tokenVar } from "./tokens.ts";

test("une référence est enveloppée dans var(), autour du nom que le kit produit", () => {
  // Ce que ce test juge est l'ENVELOPPE, pas la projection : le nom attendu
  // vient de `tokenCssVariable`, et non d'une chaîne écrite à la main qui
  // serait une quatrième copie de la règle.
  const chemin = "components.button.sizes.medium.gap";
  assert.equal(tokenVar(toRef(chemin)), `var(${tokenCssVariable(chemin)})`);
});

/**
 * Le cœur du contrôle : une valeur brute produisait `var(--16px)`, que le
 * navigateur ignore sans erreur. Le style disparaissait en silence et aucun
 * garde-fou ne pouvait le voir. Mieux vaut lever tout de suite.
 */
test("une valeur brute est refusée au lieu de produire une variable fantôme", () => {
  for (const brute of ["16px", "#ff0000", "SemiBold", "1.5rem", ""]) {
    assert.throws(() => tokenVar(brute), /référence de token/, `« ${brute} » aurait dû être refusé`);
  }
});

test("une chaîne accolée sans point n'est pas une référence", () => {
  assert.throws(() => tokenVar("{aDéfinir}"), /référence de token/);
});

test("une référence non close est refusée", () => {
  assert.throws(() => tokenVar("{components.button.sizes"), /référence de token/);
});

/**
 * Tests du seul pont token → CSS du repository.
 *
 * `tokenVar` porte l'invariant « le nom du token EST son chemin » : tout style
 * de tout composant passe par lui. Il était pourtant la seule fonction non
 * testée du consommateur.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { tokenVar } from "./tokens.ts";

test("une référence devient la variable CSS de même chemin", () => {
  assert.equal(
    tokenVar("{components.button.sizes.medium.gap}"),
    "var(--components-button-sizes-medium-gap)",
  );
});

test("tous les points du chemin sont convertis, pas seulement le premier", () => {
  assert.equal(tokenVar("{a.b.c.d}"), "var(--a-b-c-d)");
});

test("un tiret déjà présent dans un segment est conservé tel quel", () => {
  assert.equal(
    tokenVar("{components.alert.sizes.border-radius}"),
    "var(--components-alert-sizes-border-radius)",
  );
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

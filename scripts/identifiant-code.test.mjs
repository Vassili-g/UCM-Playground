import assert from "node:assert/strict";
import test from "node:test";
import { identifiantCode } from "./identifiant-code.mjs";

test("identifiantCode traduit les noms Figma libres en identifiants TypeScript stables", () => {
  assert.equal(identifiantCode("Icon / Button"), "IconButton");
  assert.equal(identifiantCode("bouton-primaire"), "BoutonPrimaire");
  assert.equal(identifiantCode("État vide"), "EtatVide");
  assert.equal(identifiantCode("2e bouton"), "Component2eBouton");
  assert.equal(identifiantCode("///"), "Component");
});

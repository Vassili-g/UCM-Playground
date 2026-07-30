/**
 * Verrouille le sens de l'écart de version : un contrat trop récent ne doit
 * jamais être annoncé comme trop ancien. Le cas s'est produit en vrai — un
 * export 4.0 reçu par un repo au plancher 3.1 conseillait un ré-export qui
 * n'aurait rien pu corriger.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { verdictDeVersion } from "./version-contrat.mjs";

test("une mineure supérieure reste compatible", () => {
  assert.equal(verdictDeVersion("4.0", "4.0"), "ok");
  assert.equal(verdictDeVersion("4.3", "4.0"), "ok");
});

test("une mineure inférieure est un contrat trop ancien", () => {
  assert.equal(verdictDeVersion("4.0", "4.1"), "ancien");
});

test("une majeure inférieure est un contrat trop ancien", () => {
  assert.equal(verdictDeVersion("3.2", "4.0"), "ancien");
});

test("une majeure supérieure est un contrat trop récent pour ce repo", () => {
  assert.equal(verdictDeVersion("5.0", "4.0"), "recent");
  // Le cas réel : le plugin a livré du 4.0 avant que le repo relève son plancher.
  assert.equal(verdictDeVersion("4.0", "3.1"), "recent");
});

test("une version illisible est traitée comme trop ancienne", () => {
  // C'est le seul verdict qu'un ré-export peut effectivement corriger.
  assert.equal(verdictDeVersion(undefined), "ancien");
  assert.equal(verdictDeVersion("brouillon"), "ancien");
});

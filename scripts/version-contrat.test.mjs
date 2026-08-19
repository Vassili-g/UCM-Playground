/**
 * Verrouille la plage de schémas explicitement auditée par le consommateur.
 * Une version inconnue reste refusée même si seule sa mineure change : le 4.2
 * a déjà prouvé qu'une mineure pouvait porter une rupture.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { verdictDeVersion } from "./version-contrat.mjs";

test("seule la plage explicitement supportée est compatible", () => {
  // Toute la plage auditée, 4.2 → 5.5, bornes comprises.
  assert.equal(verdictDeVersion("4.2"), "ok");
  assert.equal(verdictDeVersion("4.3"), "ok");
  assert.equal(verdictDeVersion("4.4"), "ok");
  assert.equal(verdictDeVersion("4.5"), "ok");
  assert.equal(verdictDeVersion("4.6"), "ok");
  assert.equal(verdictDeVersion("4.9"), "ok");
  assert.equal(verdictDeVersion("5.0"), "ok");
  assert.equal(verdictDeVersion("5.1"), "ok");
  assert.equal(verdictDeVersion("5.2"), "ok");
  assert.equal(verdictDeVersion("5.3"), "ok");
  assert.equal(verdictDeVersion("5.4"), "ok");
  assert.equal(verdictDeVersion("5.5"), "ok");
  assert.equal(verdictDeVersion("6.0"), "ok");
  assert.equal(verdictDeVersion("7.0"), "ok");
  assert.equal(verdictDeVersion("8.0"), "ok");
  assert.equal(verdictDeVersion("9.0"), "ok");
  assert.equal(verdictDeVersion("10.0"), "ok");
  assert.equal(
    verdictDeVersion("4.1", { minimum: "4.0", maximum: "4.2" }),
    "ok",
  );
});

test("une mineure inférieure est un contrat trop ancien", () => {
  assert.equal(verdictDeVersion("4.1"), "ancien");
});

test("une majeure inférieure est un contrat trop ancien", () => {
  assert.equal(verdictDeVersion("3.2"), "ancien");
});

test("une version supérieure, même mineure, reste inconnue jusqu'à son audit", () => {
  // La mineure qui suivrait la borne haute, et celle qui aurait suivi la 4.9 si
  // l'exporteur avait continué la série au lieu de passer à la 5.0.
  assert.equal(verdictDeVersion("10.2"), "recent");
  assert.equal(verdictDeVersion("11.0"), "recent");
  assert.equal(verdictDeVersion("4.10", { minimum: "4.2", maximum: "4.9" }), "recent");
});

test("une plage de support incohérente fait échouer le garde-fou", () => {
  assert.throws(
    () => verdictDeVersion("4.2", { minimum: "4.3", maximum: "4.2" }),
    /Plage de versions de contrat invalide/,
  );
});

test("une version illisible est traitée comme trop ancienne", () => {
  // C'est le seul verdict qu'un ré-export peut effectivement corriger.
  assert.equal(verdictDeVersion(undefined), "ancien");
  assert.equal(verdictDeVersion("brouillon"), "ancien");
});

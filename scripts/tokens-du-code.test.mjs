/**
 * Tests du garde-fou « tokens du code ↔ contrat ».
 *
 * Le point sensible est la frontière : une référence littérale est la forme
 * ATTENDUE — le code est écrit contre le contrat, il ne l'interprète pas — et
 * seule une référence qu'on ne peut pas comparer constitue un écart.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { referencesDuCode } from "./tokens-du-code.mjs";

test("une référence littérale est relevée comme vérifiable", () => {
  const source = `const GAP = "{components.alert.sizes.gap}";`;
  const { litterales, construites } = referencesDuCode("exemple.ts", source);
  assert.deepEqual(litterales, [{ ligne: 1, reference: "{components.alert.sizes.gap}" }]);
  assert.deepEqual(construites, []);
});

test("une table de références littérales est entièrement relevée", () => {
  const source = [
    "const SIZES = {",
    '  medium: "{components.button.sizes.medium.gap}",',
    '  big: "{components.button.sizes.big.gap}",',
    "};",
  ].join("\n");
  const { litterales, construites } = referencesDuCode("exemple.ts", source);
  assert.equal(litterales.length, 2);
  assert.deepEqual(construites, []);
});

test("un chemin assemblé à l'exécution est un écart", () => {
  const source = [
    "function colorToken(severity, variant, role) {",
    "  return `{components.alert.colors.${severity}.${variant}.${role}}`;",
    "}",
  ].join("\n");
  const { litterales, construites } = referencesDuCode("exemple.ts", source);
  assert.deepEqual(litterales, []);
  assert.equal(construites.length, 1);
  assert.equal(construites[0].ligne, 2);
});

test("un début de chemin concaténé avec autre chose est un écart", () => {
  const source = `const ref = "{components.button.colors." + color + "}";`;
  const { construites } = referencesDuCode("exemple.ts", source);
  assert.equal(construites.length, 1);
});

/**
 * Un chemin cité dans un COMMENTAIRE explique le format ; il ne style rien.
 * Le relever rendrait la documentation du code impossible à écrire — c'est
 * pourquoi le contrôle passe par l'AST et non par le texte.
 */
test("un chemin cité en commentaire n'est pas relevé", () => {
  const source = [
    '/** @example tokenVar("{components.button.sizes.medium.gap}") */',
    "// voir aussi {layouts.stroke.outline}",
    "export const rien = 1;",
  ].join("\n");
  const { litterales, construites } = referencesDuCode("exemple.ts", source);
  assert.deepEqual(litterales, []);
  assert.deepEqual(construites, []);
});

test("les chaînes CSS ordinaires ne sont pas confondues avec des références", () => {
  const source = [
    'const style = { flex: "0 0 auto", display: "inline-flex" };',
    "const ombre = `0 0 0 ${largeur} ${couleur}`;",
    "const glyphe = `calc(${cote} * 0.8)`;",
    'const classe = `fa-regular fa-${nom}`;',
  ].join("\n");
  const { litterales, construites } = referencesDuCode("exemple.ts", source);
  assert.deepEqual(litterales, []);
  assert.deepEqual(construites, []);
});

test("le JSX ne perturbe pas l'analyse", () => {
  const source = [
    "export function Composant() {",
    '  return <span style={{ gap: tokenVar("{a.b}") }} />;',
    "}",
  ].join("\n");
  const { litterales } = referencesDuCode("exemple.tsx", source);
  assert.equal(litterales.length, 1);
});

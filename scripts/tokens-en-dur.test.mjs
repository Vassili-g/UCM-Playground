/**
 * Tests du garde-fou « aucun chemin de token écrit en dur ».
 *
 * Les cas ci-dessous sont ceux réellement produits par une reconstruction en
 * contexte froid : une table de chemins recopiés, et un chemin reconstruit par
 * concaténation — le plus trompeur, puisqu'il a l'air dynamique.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { tokensEnDur } from "./tokens-en-dur.mjs";

test("une référence complète recopiée dans le code est relevée", () => {
  const source = `const GAP = "{components.alert.sizes.gap}";`;
  const trouves = tokensEnDur("exemple.ts", source);
  assert.equal(trouves.length, 1);
  assert.equal(trouves[0].ligne, 1);
});

test("un chemin reconstruit par concaténation est relevé", () => {
  const source = [
    "function colorToken(severity, variant, role) {",
    "  return `{components.alert.colors.${severity}.${variant}.${role}}`;",
    "}",
  ].join("\n");
  const trouves = tokensEnDur("exemple.ts", source);
  assert.equal(trouves.length, 1, "le fragment de gabarit doit suffire à le détecter");
  assert.equal(trouves[0].ligne, 2);
});

test("une table de chemins signale chacun de ses membres", () => {
  const source = [
    "const SIZES = {",
    '  medium: "{components.button.sizes.medium.gap}",',
    '  big: "{components.button.sizes.big.gap}",',
    "};",
  ].join("\n");
  assert.equal(tokensEnDur("exemple.ts", source).length, 2);
});

/**
 * Un chemin cité dans un COMMENTAIRE explique le format ; il ne style rien.
 * Le relever rendrait la documentation du code impossible à écrire — c'est
 * pourquoi le contrôle passe par l'AST et non par le texte.
 */
test("un chemin cité en commentaire n'est pas un chemin écrit en dur", () => {
  const source = [
    "/** @example tokenVar(\"{components.button.sizes.medium.gap}\") */",
    "// voir aussi {layouts.stroke.outline}",
    "export const rien = 1;",
  ].join("\n");
  assert.deepEqual(tokensEnDur("exemple.ts", source), []);
});

test("un composant qui lit son contrat ne déclenche rien", () => {
  const source = [
    'import contract from "./Button.contract.json";',
    "const dimensions = contract.structure.sizes[size];",
    "const style = { gap: tokenVar(dimensions.gap) };",
  ].join("\n");
  assert.deepEqual(tokensEnDur("exemple.ts", source), []);
});

test("les chaînes CSS ordinaires ne sont pas confondues avec des chemins", () => {
  const source = [
    'const style = { flex: "0 0 auto", display: "inline-flex" };',
    "const ombre = `0 0 0 ${largeur} ${couleur}`;",
    "const glyphe = `calc(${cote} * 0.8)`;",
    'const classe = `fa-regular fa-${nom}`;',
  ].join("\n");
  assert.deepEqual(tokensEnDur("exemple.ts", source), []);
});

test("le JSX ne perturbe pas l'analyse", () => {
  const source = [
    "export function Composant() {",
    '  return <span style={{ gap: tokenVar("{a.b}") }} />;',
    "}",
  ].join("\n");
  assert.equal(tokensEnDur("exemple.tsx", source).length, 1);
});

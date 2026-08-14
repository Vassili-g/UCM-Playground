import assert from "node:assert/strict";
import test from "node:test";
import {
  avertissementsCorrigeables,
  resumeTerminalAvertissements,
  sectionAvertissementsExport,
} from "./avertissements-export.mjs";

const LIEN_FIGMA =
  "Lien vers Figma absent du contrat : l’API ne le fournit qu’aux plugins privés d’organisation.";
const GAP_NON_LIE =
  "Layer « Severity=Info, Variant=Standard » — gap : aucune variable Figma n'est reliée.";

const contrat = (warnings) => ({ meta: { warnings } });

test("le lien Figma absent ne compte pas comme un point à corriger", () => {
  // Il tombe à chaque export et personne ne peut le lever : le compter ferait
  // afficher un avertissement sur toutes les pull requests, indéfiniment.
  assert.deepEqual(avertissementsCorrigeables(contrat([LIEN_FIGMA])), []);
});

test("une liaison Figma manquante reste un point à corriger", () => {
  assert.deepEqual(avertissementsCorrigeables(contrat([LIEN_FIGMA, GAP_NON_LIE])), [GAP_NON_LIE]);
});

test("un contrat sans champ warnings ne fait pas tomber la lecture", () => {
  assert.deepEqual(avertissementsCorrigeables({}), []);
  assert.deepEqual(avertissementsCorrigeables(contrat("pas un tableau")), []);
  assert.deepEqual(avertissementsCorrigeables(null), []);
});

test("sans rien à signaler, le rapport reste exactement ce qu’il était", () => {
  assert.deepEqual(sectionAvertissementsExport([{ fichier: "Button.contract.json", avertissements: [] }]), []);
  assert.equal(resumeTerminalAvertissements([{ fichier: "Button.contract.json", avertissements: [] }]), null);
});

test("un point non décrit apparaît sous le verdict, sans se donner pour un blocage", () => {
  // Le cas qui a motivé ce module : le contrat est cohérent, donc rien ne
  // bloquait, et le gap resté en valeur brute passait sous un ✅ silencieux.
  const markdown = sectionAvertissementsExport([
    { fichier: "Button.contract.json", avertissements: [GAP_NON_LIE] },
  ]).join("\n");

  assert.match(markdown, /1 point\(s\) que l'export n'a pas pu décrire/);
  assert.match(markdown, /Button\.contract\.json/);
  assert.match(markdown, /aucune variable Figma n'est reliée/);
  assert.match(markdown, /ne bloquent pas la fusion/);
  assert.match(markdown, /n'est pas dans le contrat/);
});

test("le total additionne les points de tous les contrats de la pull request", () => {
  const markdown = sectionAvertissementsExport([
    { fichier: "Alert.contract.json", avertissements: [GAP_NON_LIE] },
    { fichier: "Button.contract.json", avertissements: [GAP_NON_LIE, "Autre point"] },
  ]).join("\n");

  assert.match(markdown, /3 point\(s\)/);
  assert.match(resumeTerminalAvertissements([
    { fichier: "Alert.contract.json", avertissements: [GAP_NON_LIE] },
    { fichier: "Button.contract.json", avertissements: [GAP_NON_LIE, "Autre point"] },
  ]), /3 point\(s\)/);
});

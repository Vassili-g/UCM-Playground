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
const contratV8 = (diagnostics) => ({ meta: { warnings: [], diagnostics } });

test("le lien Figma absent ne compte pas comme un point à corriger", () => {
  // Il tombe à chaque export et personne ne peut le lever : le compter ferait
  // afficher un avertissement sur toutes les pull requests, indéfiniment.
  assert.deepEqual(avertissementsCorrigeables(contrat([LIEN_FIGMA])), []);
});

test("une liaison Figma manquante reste un point à corriger", () => {
  assert.deepEqual(avertissementsCorrigeables(contrat([LIEN_FIGMA, GAP_NON_LIE])), [GAP_NON_LIE]);
});

test("une notice v10 explique une piste FIXED sans devenir un point à corriger", () => {
  const pisteFixe = "La ligne 1 est publiée en pixels, exception propre aux grilles.";
  assert.deepEqual(avertissementsCorrigeables(contratV8([{
    code: "UCM_EXPORT_NOTICE",
    severity: "warning",
    message: pisteFixe,
  }])), []);
});

test("un diagnostic structuré de perte portable reste corrigeable", () => {
  assert.deepEqual(avertissementsCorrigeables(contratV8([{
    code: "UCM_PORTABLE_PROJECTION_WARNING",
    severity: "warning",
    message: GAP_NON_LIE,
  }])), [GAP_NON_LIE]);
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

test("un point non décrit apparaît sous un verdict vert, sans se donner pour un blocage", () => {
  // Le cas qui a motivé ce module : le contrat est cohérent, donc rien ne
  // bloquait, et le gap resté en valeur brute passait sous un ✅ silencieux.
  const markdown = sectionAvertissementsExport([
    { fichier: "Button.contract.json", avertissements: [GAP_NON_LIE] },
  ]).join("\n");

  assert.match(markdown, /Ce que l'export n'a pas pu décrire \(1\)/);
  assert.match(markdown, /Button\.contract\.json/);
  assert.match(markdown, /aucune variable Figma n'est reliée/);
  assert.match(markdown, /ne bloquent rien pour le moment/);
  assert.match(markdown, /n'est pas dans le contrat/);
});

test("sur un rapport rouge, ces points cessent d’être présentés comme inoffensifs", () => {
  // Ils sont alors une cause possible du refus : dire qu'ils ne bloquent pas
  // enverrait le designer chercher ailleurs que là où est son geste.
  const markdown = sectionAvertissementsExport(
    [{ fichier: "Button.contract.json", avertissements: [GAP_NON_LIE] }],
    { bloquant: true },
  ).join("\n");

  assert.match(markdown, /Commencez par là/);
  assert.match(markdown, /les contrôles qui la relisent échouent/);
  assert.doesNotMatch(markdown, /ne bloquent rien/);
});

test("le total additionne les points de tous les contrats de la pull request", () => {
  const markdown = sectionAvertissementsExport([
    { fichier: "Alert.contract.json", avertissements: [GAP_NON_LIE] },
    { fichier: "Button.contract.json", avertissements: [GAP_NON_LIE, "Autre point"] },
  ]).join("\n");

  assert.match(markdown, /Ce que l'export n'a pas pu décrire \(3\)/);
  assert.match(resumeTerminalAvertissements([
    { fichier: "Alert.contract.json", avertissements: [GAP_NON_LIE] },
    { fichier: "Button.contract.json", avertissements: [GAP_NON_LIE, "Autre point"] },
  ]), /3 point\(s\)/);
});

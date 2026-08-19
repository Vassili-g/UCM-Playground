import assert from "node:assert/strict";
import test from "node:test";
import {
  diagnosticReferencesCodeNonDeclarees,
  resumeTerminalTokensManquants,
  sectionTokensManquants,
} from "./diagnostic-tokens.mjs";

const sourceTokens = "src/tokens/tokens.json";

const CONTRAT_AVEC_REFERENCE_ABSENTE = [{
  fichier: "StressTest.contract.json",
  manquants: ["{components.stresstest.info.scalewrap.colors.scale-1}"],
}];

test("une référence de contrat absente des tokens est un avertissement non bloquant", () => {
  const markdown = sectionTokensManquants(CONTRAT_AVEC_REFERENCE_ABSENTE, {
    tokensModifies: true,
    sourceTokens,
  }).join("\n");
  const terminal = resumeTerminalTokensManquants(CONTRAT_AVEC_REFERENCE_ABSENTE, sourceTokens);

  assert.match(markdown, /tokens\.json` est la source de vérité/);
  assert.match(markdown, /ne bloque pas la fusion/);
  assert.match(markdown, /StressTest\.contract\.json/);
  assert.match(markdown, /components\.stresstest\.info\.scalewrap\.colors\.scale-1/);
  assert.match(markdown, /réexportez les composants concernés/i);
  assert.doesNotMatch(markdown, /adaptez leurs implémentations/);
  assert.match(terminal, /ne bloque pas la fusion/);
});

test("hors PR de tokens, le designer vérifie d'abord que la source est à jour", () => {
  const markdown = sectionTokensManquants(CONTRAT_AVEC_REFERENCE_ABSENTE, {
    tokensModifies: false,
    sourceTokens,
  }).join("\n");

  assert.match(markdown, /Vérifiez que l'export de tokens est à jour/);
  assert.match(markdown, /réexportez les composants concernés/);
});

test("aucune référence absente ne produit de section", () => {
  assert.deepEqual(sectionTokensManquants([], { tokensModifies: true, sourceTokens }), []);
  assert.equal(resumeTerminalTokensManquants([], sourceTokens), null);
});

const REFERENCE_ORPHELINE = [
  {
    fichier: "Button.tsx",
    ligne: 486,
    reference: "{components.button.sizes.medium.gap}",
    voisines: ["{components.button.sizes.medium.padding-x}"],
    sansContrat: false,
  },
];

const GAP_NON_LIE =
  "Layer « Size=Medium », gap (variant « medium ») : aucune variable Figma n'est reliée.";

test("sans point signalé par l’export, le diagnostic demande une mise à jour du code", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE).join("\n");

  assert.match(markdown, /Un développeur doit remplacer ou retirer ces références/);
  assert.match(markdown, /La fusion reste bloquée/);
  assert.doesNotMatch(markdown, /corrigez Figma/i);
});

test("le rapport renvoie à l’export au lieu de conclure à sa place", () => {
  // Le cas vécu : le gap du variant « medium » avait été délié dans Figma. Le
  // diagnostic affirmait une migration de tokens et interdisait de réexporter,
  // soit l'inverse du geste à faire. La CI possède l'écart contrat ↔ code,
  // pas la cause d'une absence dans le contrat : elle pose les deux constats
  // côte à côte et laisse la lecture au designer.
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE, [GAP_NON_LIE])
    .join("\n");

  assert.match(markdown, /Vérifiez les 1 avertissement/);
  assert.match(markdown, /L'export n'a pas pu décrire certaines informations/);
  assert.match(markdown, /corrigez Figma puis réexportez/);
  // La citation vit dans la section dédiée, publiée une seule fois en tête.
  assert.doesNotMatch(markdown, /> Layer « Size=Medium »/);
  // Plus aucune cause affirmée, dans un sens comme dans l'autre.
  assert.doesNotMatch(markdown, /ne relancez pas l’export/);
  assert.doesNotMatch(markdown, /Réexporter depuis Figma ne corrigera pas/);
});

test("le voisinage déclaré est énoncé comme un fait, pas comme une cause", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE, [GAP_NON_LIE])
    .join("\n");

  assert.match(markdown, /Groupe encore déclaré/);
  assert.match(markdown, /components\.button\.sizes\.medium\.padding-x/);
});

test("une famille entièrement disparue se lit comme telle", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees([
    { fichier: "Legacy.tsx", ligne: 12, reference: "{components.legacy.sizes.gap}", voisines: [], sansContrat: false },
  ]).join("\n");

  assert.match(markdown, /Aucune autre référence du groupe n'est déclarée/);
});

test("une référence sans contrat garde un diagnostic distinct", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees([
    {
      fichier: "Legacy.tsx",
      ligne: 12,
      reference: "{legacy.color}",
      sansContrat: true,
    },
  ]).join("\n");

  assert.match(markdown, /sans contrat co-localisé/);
  assert.match(markdown, /ajouter le contrat correspondant/);
  assert.match(markdown, /La fusion reste bloquée/);
});

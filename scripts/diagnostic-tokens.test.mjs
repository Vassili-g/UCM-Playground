import assert from "node:assert/strict";
import test from "node:test";
import {
  conseilTerminalTokensManquants,
  conseilTokensManquants,
  diagnosticReferencesCodeNonDeclarees,
} from "./diagnostic-tokens.mjs";

const sourceTokens = "src/tokens/tokens.json";

test("une PR de tokens ne conseille pas de relancer le même export", () => {
  const markdown = conseilTokensManquants({ tokensModifies: true, sourceTokens }).join("\n");
  const terminal = conseilTerminalTokensManquants({ tokensModifies: true, sourceTokens });

  assert.match(markdown, /modifie `src\/tokens\/tokens\.json`/);
  assert.match(markdown, /réexportez les composants concernés/);
  assert.doesNotMatch(markdown, /lancez \*\*Exporter les tokens\*\*/);
  assert.match(terminal, /ne relancez pas le même export/);
});

test("une PR de contrat sans tokens conseille toujours leur export", () => {
  const markdown = conseilTokensManquants({ tokensModifies: false, sourceTokens }).join("\n");
  assert.match(markdown, /Exporter les tokens/);
  assert.match(markdown, /tokens du repository aient suivi/);
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
  "Layer « Size=Medium » — gap (variant « medium ») : aucune variable Figma n'est reliée.";

test("sans point signalé par l’export, le diagnostic conclut à l’ancienne structure", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE).join("\n");

  assert.match(markdown, /Aucun point non décrit n'a été signalé/);
  assert.match(markdown, /des valeurs que le design ne porte plus/);
});

test("le rapport renvoie à l’export au lieu de conclure à sa place", () => {
  // Le cas vécu : le gap du variant « medium » avait été délié dans Figma. Le
  // diagnostic affirmait une migration de tokens et interdisait de réexporter,
  // soit l'inverse du geste à faire. La CI possède l'écart contrat ↔ code,
  // pas la cause d'une absence dans le contrat : elle pose les deux constats
  // côte à côte et laisse la lecture au designer.
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE, [GAP_NON_LIE])
    .join("\n");

  assert.match(markdown, /a par ailleurs signalé 1 information\(s\)/);
  assert.match(markdown, /Ce que l'export n'a pas pu décrire/);
  assert.match(markdown, /le geste est dans Figma/);
  // La citation vit dans la section dédiée, publiée une seule fois en tête.
  assert.doesNotMatch(markdown, /> Layer « Size=Medium »/);
  // Plus aucune cause affirmée, dans un sens comme dans l'autre.
  assert.doesNotMatch(markdown, /ne relancez pas l’export/);
  assert.doesNotMatch(markdown, /Aucun point non décrit n'a été signalé/);
});

test("le voisinage déclaré est énoncé comme un fait, pas comme une cause", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE, [GAP_NON_LIE])
    .join("\n");

  assert.match(markdown, /son groupe est pourtant toujours déclaré/);
  assert.match(markdown, /components\.button\.sizes\.medium\.padding-x/);
});

test("une famille entièrement disparue se lit comme telle", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees([
    { fichier: "Legacy.tsx", ligne: 12, reference: "{components.legacy.sizes.gap}", voisines: [], sansContrat: false },
  ]).join("\n");

  assert.match(markdown, /aucune référence de son groupe n'est déclarée/);
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
  assert.match(markdown, /Ajoutez le contrat correspondant/);
});

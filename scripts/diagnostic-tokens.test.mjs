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
    fichier: "Alert.tsx",
    ligne: 51,
    reference: "{components.alert.sizes.title-size}",
    sansContrat: false,
  },
];

test("un TSX resté sur l’ancienne structure ne renvoie pas le designer vers Figma", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE).join("\n");

  assert.match(markdown, /ne relancez pas l’export/);
  assert.match(markdown, /reconstruire ou adapter/);
  assert.doesNotMatch(markdown, /Ré-exportez ce composant/);
});

test("un export ayant signalé un point non décrit n’impose plus la cause « migration »", () => {
  // Le cas vécu : le gap d'Alert avait été délié dans Figma, donc `structure.gap`
  // avait disparu du contrat et le TSX qui le citait encore devenait fautif.
  // Le diagnostic affirmait alors une migration de tokens et interdisait de
  // réexporter — soit exactement l'inverse du geste à faire.
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE, true).join("\n");

  assert.match(markdown, /Deux causes possibles/);
  assert.match(markdown, /n’a pas pu être exportée/);
  assert.match(markdown, /Commencez par là/);
  assert.doesNotMatch(markdown, /ne relancez pas l’export/);
});

test("sans point signalé, le diagnostic dit pourquoi il exclut Figma", () => {
  const markdown = diagnosticReferencesCodeNonDeclarees(REFERENCE_ORPHELINE, false).join("\n");

  assert.match(markdown, /il n’a signalé aucun point non décrit/);
  assert.doesNotMatch(markdown, /Deux causes possibles/);
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

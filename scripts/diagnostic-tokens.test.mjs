import assert from "node:assert/strict";
import test from "node:test";
import {
  conseilTerminalTokensManquants,
  conseilTokensManquants,
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

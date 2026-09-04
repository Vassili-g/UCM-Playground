/**
 * T6.0a — la projection de `tokenVar` et le CSS réellement généré disent-ils la
 * même chose ?
 *
 * Deux projections indépendantes traduisent un chemin de token en nom de
 * variable CSS : `tokenVar` ici, et le `name/kebab` de Style Dictionary dans la
 * chaîne de build. Aucun test ne les comparait, et elles divergent sur les
 * données réelles.
 *
 * Ce que ce fichier vérifie n'est donc pas le comportement d'une fonction —
 * `tokens.test.ts` s'en charge — mais un ACCORD entre deux artefacts du
 * repository : `src/tokens/tokens.json`, ce que le design system publie, et
 * `src/generated/tokens.css`, ce que le navigateur recevra.
 *
 * Pourquoi ce contrôle n'a pas besoin d'un navigateur, alors que le défaut
 * qu'il attrape est un défaut de rendu. Un désaccord de projection produit une
 * variable qui n'existe pas, et une variable absente ne lève RIEN : elle se
 * résout au repli, ou fait tomber la déclaration. Il n'y a donc rien à observer
 * dans un rendu — il faut comparer les noms en amont. `jsdom` ne résout de
 * toute façon pas les `var()` en cascade et n'aurait pas vu ce défaut.
 *
 * Pourquoi il est écrit AVANT la correction (T6.0 et T6.2) : un contrôle écrit
 * après sa correction ne prouve que lui-même. Celui-ci part rouge, sur quatre
 * tokens nommés `layouts.sizing.0,5` … `3,5`, et c'est ce qui donnera à la
 * correction une preuve au lieu d'une confiance.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { indexerTokensDtcg } from "@ucm-kit/core/lecteurs";
import { toRef, tokenCssVariable } from "@ucm-kit/core/format";

import { tokenVar } from "./tokens";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Les chemins de tokens du fichier DTCG.
 *
 * L'index vient du kit plutôt que d'un parcours écrit ici : « qu'est-ce qu'une
 * feuille DTCG » est exactement la question que `tokens-dtcg.mjs` porte pour le
 * contrôle d'existence (T2.4). Deux réponses à cette question feraient juger
 * deux arbres différents à partir du même fichier — la faute que T2.4 a
 * justement fermée.
 */
function cheminsDesTokens(): string[] {
  const tokens = JSON.parse(readFileSync(join(racine, "src/tokens/tokens.json"), "utf8"));
  return [...indexerTokensDtcg(tokens).keys()];
}

/**
 * Les propriétés personnalisées réellement DÉCLARÉES par la feuille générée.
 *
 * On ne retient que le côté gauche d'une déclaration (`--nom:`), jamais un
 * `var(--nom)` en valeur : `outputReferences: true` fait citer à un token la
 * variable d'un autre, et compter ces citations ferait passer pour déclaré un
 * nom que rien ne définit.
 */
function variablesDeclarees(): Set<string> {
  const css = readFileSync(join(racine, "src/generated/tokens.css"), "utf8");
  return new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(([, nom]) => nom));
}

test("chaque token du design system nomme une variable CSS qui existe", () => {
  const declarees = variablesDeclarees();
  assert.ok(declarees.size > 0, "aucune variable lue : le CSS généré est absent ou vide");

  const desaccords: string[] = [];
  for (const chemin of cheminsDesTokens()) {
    // `var(--nom)` → `--nom`. On passe par `tokenVar` et non par sa formule
    // pour que le test juge le chemin d'appel réel, y compris son refus.
    const nom = tokenVar(toRef(chemin)).slice("var(".length, -1);
    if (!declarees.has(nom)) desaccords.push(`${chemin} → ${nom}`);
  }

  assert.deepEqual(
    desaccords,
    [],
    `${desaccords.length} token(s) nomment une variable absente du CSS généré. `
      + `Les deux côtés appellent pourtant la même \`tokenCssVariable\` (T6.0), donc `
      + `ce n'est plus une divergence de projection : cherchez un token que Style `
      + `Dictionary n'a pas écrit — filtré par un transform, ou écrasé par la `
      + `collision que le test suivant relève.`,
  );
});

/**
 * Le sens inverse, et il ne dit pas la même chose.
 *
 * Le test ci-dessus attrape le token qu'un composant ne saura pas atteindre.
 * Celui-ci attrape la PERTE D'INFORMATION : deux chemins distincts que Style
 * Dictionary écrase sur un même nom. Le premier gagnant l'emporte, le second
 * disparaît, et aucune des deux projections ne s'en aperçoit — un composant
 * recevrait alors la valeur d'un autre token, ce qui est pire qu'une valeur
 * absente.
 *
 * Le cas connu est le `%` : `kebabCase` le retire, donc `50%` et `50`
 * produiraient la même variable. Aucun token du corpus actuel n'en porte ;
 * ce test tient la porte fermée.
 */
test("deux tokens distincts ne produisent jamais la même variable CSS", () => {
  // La projection vient du kit, comme partout ailleurs. L'écrire ici en aurait
  // fait une copie de plus — dans le fichier même dont le rôle est d'empêcher
  // les copies de diverger.
  const parVariable = new Map<string, string[]>();
  for (const chemin of cheminsDesTokens()) {
    const nom = tokenCssVariable(chemin);
    parVariable.set(nom, [...(parVariable.get(nom) ?? []), chemin]);
  }

  const collisions = [...parVariable.entries()]
    .filter(([, chemins]) => chemins.length > 1)
    .map(([nom, chemins]) => `${nom} ← ${chemins.join(", ")}`);

  assert.deepEqual(collisions, [], "des tokens distincts se rejoignent sur une même variable");
});

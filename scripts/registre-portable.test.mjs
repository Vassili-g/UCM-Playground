/**
 * Le rapport parle-t-il une langue qu'un repo non-React puisse lire ?
 *
 * C'est T2.6, et sans ce test la tâche ne tient pas : renommer des chaînes une
 * fois ne coûte rien, les laisser renommées coûte une vigilance que personne
 * n'a. Le mot revient au premier message écrit dans l'urgence, et il revient là
 * où il fait le plus de dégâts — dans une phrase lue par un designer.
 *
 * La règle est celle de la Cible du plan, pas une préférence de style : « ce qui
 * décrit la STACK est un adaptateur optionnel ». Ces modules-là, eux, décrivent
 * le MOTEUR ; ils rejoindront le kit en T5.2 et seront alors imprimés par des
 * repos dont aucun n'écrira de `.tsx`. Un message qui promet un fichier `.tsx`
 * à un repo Swift n'est pas maladroit, il est faux — et il est faux sur la pull
 * request d'export, la seule que le designer ouvre.
 *
 * Ce qui n'est PAS contrôlé ici, et le choix est délibéré : `parite.mjs`,
 * `run-tests.mjs` et `echecs-de-tests.mjs`. Les trois SONT des adaptateurs de
 * cette stack — le premier lit une API publique avec le vérificateur de types
 * TypeScript, les deux autres balaient de vrais `*.test.tsx`. Leur interdire le
 * mot juste les obligerait à mentir dans l'autre sens.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scripts = dirname(fileURLToPath(import.meta.url));

/**
 * Les modules qui décrivent le moteur, et dont le texte finit sous les yeux
 * d'un lecteur qui n'a pas choisi la stack.
 */
const MODULES_DU_MOTEUR = [
  "check-contract.mjs",
  "diagnostic-parite.mjs",
  "diagnostic-tokens.mjs",
  "verdict-bilan.mjs",
  "perimetre-rapport.mjs",
];

/**
 * Les mots à bannir, et rien de plus large.
 *
 * `TypeScript` n'y est pas : `check-contract.mjs` a le droit de dire qu'il
 * délègue à un adaptateur TypeScript, puisque c'est exactement ce qu'il fait.
 * Ce qu'on refuse, c'est de PROMETTRE une stack au lecteur — un fichier `.tsx`
 * à créer, un composant React à corriger, un Playground à adapter.
 */
const MOTS_BANNIS = [/\bReact\b/, /\.tsx\b/, /\bTSX\b/, /\bPlayground\b/];

test("aucun module du moteur ne promet une stack au lecteur", () => {
  const fautes = [];
  for (const module of MODULES_DU_MOTEUR) {
    const source = readFileSync(join(scripts, module), "utf8");
    source.split("\n").forEach((ligne, index) => {
      for (const mot of MOTS_BANNIS) {
        if (mot.test(ligne)) fautes.push(`${module}:${index + 1} — ${ligne.trim()}`);
      }
    });
  }

  assert.deepEqual(
    fautes,
    [],
    "un mot de stack est revenu dans le moteur. S'il décrit un adaptateur, "
      + "le module n'a rien à faire dans MODULES_DU_MOTEUR ; sinon, dites "
      + "« l'implémentation », « le code », « ce repository ».",
  );
});

test("le filet couvre bien les modules, et n’est pas une liste vide", () => {
  // Un test qui balaie zéro fichier passe toujours. Renommer un module sans
  // toucher à cette liste le sortirait du contrôle en silence — exactement la
  // panne que ce filet existe pour empêcher.
  assert.ok(MODULES_DU_MOTEUR.length >= 5);
  for (const module of MODULES_DU_MOTEUR) {
    assert.doesNotThrow(
      () => readFileSync(join(scripts, module), "utf8"),
      `${module} est listé mais introuvable : le filet ne contrôle plus rien.`,
    );
  }
});

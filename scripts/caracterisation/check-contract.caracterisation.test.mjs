/**
 * Ce que `check-contract.mjs` produit AUJOURD'HUI, verrouillé avant réécriture.
 *
 * Ce fichier ne dit pas ce que le rapport DEVRAIT écrire. Il enregistre ce
 * qu'il écrit, pour que cinq tâches à venir — D1, T2.3, T2.4, T2.6 et T5.2 —
 * modifient ce script en voyant exactement ce qu'elles déplacent.
 * `check-contract.mjs` fait 663 lignes et n'a aucun test, ni direct ni
 * transitif ; c'est le morceau le plus lu par des humains et le plus difficile
 * à corriger une fois publié.
 *
 * Un test de caractérisation qui échoue ne signale donc pas forcément une
 * régression : il signale un CHANGEMENT. La question à se poser est « est-ce
 * celui que je voulais », et la réponse s'écrit en mettant l'attendu à jour
 * dans le même commit que le changement — jamais en affaiblissant l'assertion
 * pour retrouver du vert.
 *
 * Les sept scénarios touchent chacun un chemin qu'une tâche à venir va
 * modifier ; ils ne couvrent pas le script, et n'essaient pas de le faire :
 *
 * | Scénario                      | Tâche qui le changera     |
 * |-------------------------------|---------------------------|
 * | tout valide                   | T2.6 (vocabulaire)        |
 * | référence absente du CSS      | T2.4 (source réelle)      |
 * | token du code non déclaré     | D1 (contrôle retiré)      |
 * | implémentation absente        | T2.3 (parité scindée)     |
 * | version non lue               | T2.1b (ordre du verdict)  |
 * | contrat cassé                 | — (témoin)                |
 * | tokens illisibles ou absents  | T2.4 (filets reportés)    |
 *
 * Le corpus est SYNTHÉTIQUE, jamais celui du repository : les quatre contrats
 * réels changent à chaque réexport, et un test de caractérisation assis dessus
 * mesurerait Figma au lieu de mesurer ce script.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { lancer, nettoyer, preparerRepo } from "./harnais.mjs";

/** Contrat 12.0 minimal et valide, citant une seule référence de token. */
function contrat() {
  return {
    name: "Widget",
    meta: {
      contractVersion: "12.0",
      exportedAt: "2026-01-01T00:00:00.000Z",
      figma: { fileName: "f", nodeId: "1:1" },
      coverage: { portable: "complete" },
    },
    viewStructures: {
      st1: {
        layout: "flex-row",
        sizing: { width: "fit-content", height: "fit-content" },
        children: [{ slot: "label", tokens: { color: "{couleurs.texte.principal}" } }],
      },
    },
    variantViews: { v1: { structure: "st1" } },
    variants: [{ nodeId: "1:2", figmaName: "Default", values: {}, tokens: {}, view: "v1" }],
    structure: { view: "st1" },
    rendering: { roles: {} },
  };
}

const TOKENS = { couleurs: { texte: { principal: { $type: "color", $value: "#111111" } } } };
const CSS = ":root{--couleurs-texte-principal:#111111;}";
const TSX = `export interface WidgetProps { children?: unknown }
export function Widget(_props: WidgetProps) { return null; }
`;

/**
 * Monte un repository jouet, le passe au script, rend son verdict, et le
 * démonte — même quand l'assertion échoue, sinon un test rouge laisserait un
 * dossier derrière lui à chaque exécution.
 */
function verdict({ composants, tokens = TOKENS, css = CSS, casser } = {}) {
  const racine = preparerRepo({
    composants: composants ?? { Widget: { contrat: contrat(), tsx: TSX } },
    tokens,
    css,
  });
  try {
    if (casser) casser(racine);
    return lancer(racine);
  } finally {
    nettoyer(racine);
  }
}

test("tout valide : sortie 0, et un rapport qui ne réclame rien", () => {
  const { code, rapport } = verdict();

  assert.equal(code, 0);
  assert.equal(
    rapport,
    "## ✅ Aucun blocage détecté\n\n"
      + "1 contrat et 1 référence de token contrôlés. Les contrôles bloquants sont passés.\n",
  );
});

/**
 * Le seul contrôle qui protège le design. Il compare aujourd'hui les
 * références du contrat aux variables CSS générées, alors que son message dit
 * lire `tokens.json` : T2.4 fera faire au code ce que le message annonce déjà.
 * Ici la référence EXISTE dans `tokens.json` et ne manque qu'au CSS — l'écart
 * est donc signalé à tort, et c'est exactement celui que T2.4 supprime.
 */
test("référence absente du CSS : avertissement, et la fusion reste ouverte", () => {
  const { code, rapport } = verdict({ css: ":root{}" });

  assert.equal(code, 0, "un token absent n'a jamais bloqué : nul ne le corrige en réexportant");
  assert.match(rapport, /^## ✅ Aucun blocage détecté$/m);
  assert.match(rapport, /### ⚠️ Des contrats utilisent des tokens absents de la source \(1 référence\)/);
  assert.match(rapport, /- \*\*`Widget\.contract\.json`\*\* : `\{couleurs\.texte\.principal\}`/);
  assert.match(rapport, /Cet avertissement ne bloque pas la fusion\./);
});

/**
 * Le contrôle que D1 retire en entier. Il BLOQUE aujourd'hui, ce qui contredit
 * l'en-tête du script — un constat que l'export ne peut ni causer ni corriger
 * est censé laisser fusionner. Le verrouiller rend le retrait lisible : ce test
 * doit DISPARAÎTRE avec le contrôle, jamais être affaibli pour survivre.
 */
test("token écrit dans le code et non déclaré : sortie 1 aujourd'hui", () => {
  const { code, rapport } = verdict({
    composants: {
      Widget: {
        contrat: contrat(),
        tsx: `import { tokenVar } from "../../tokens";
export interface WidgetProps { children?: unknown }
export function Widget(_props: WidgetProps) {
  return tokenVar("{couleurs.texte.inconnu}");
}
`,
      },
    },
  });

  assert.equal(code, 1);
  assert.match(rapport, /^## ❌ Les contrôles du repository bloquent la fusion$/m);
  assert.match(rapport, /### ❌ Le code React utilise des tokens absents des contrats \(1 référence\)/);
  assert.match(rapport, /`Widget\.tsx`, ligne 4 : `\{couleurs\.texte\.inconnu\}`/);
  assert.match(rapport, /La fusion reste bloquée\./);
});

/**
 * T2.3 scinde ce constat : l'existence au noyau, la comparaison à l'adaptateur.
 * Le message actuel promet un `.tsx`, ce qui est faux dans un repo Swift — et
 * faux sur la pull request d'export elle-même, la seule que le designer lise.
 */
test("implémentation absente : état d'avancement, pas erreur", () => {
  const { code, rapport } = verdict({ composants: { Widget: { contrat: contrat() } } });

  assert.equal(code, 0, "l'absence d'implémentation est un avancement, pas un échec");
  assert.match(rapport, /^## ✅ Aucun blocage détecté$/m);
  assert.match(rapport, /### ℹ️ Un composant n'a pas encore d'implémentation \(1 composant\)/);
  assert.match(rapport, /dès qu'un fichier `\.tsx` co-localisé sera ajouté/);
});

/**
 * Critère de réussite n° 4 du plan : un contrat d'une version non lue est
 * refusé par un message qui dit QUI corrige. La section le dit correctement ;
 * le TITRE, lui, écrit déjà « contrat invalide » et accuse le designer, alors
 * que ce contrat est parfaitement formé — seule sa version n'est pas lue.
 * T2.1b devra corriger cet écart ; ce test est ce qui l'empêche de passer
 * inaperçu, et il montre que le défaut existe AVANT tout élagage.
 */
test("version non lue : refus, et la section désigne le développeur", () => {
  const futur = contrat();
  futur.meta.contractVersion = "99.0";
  const { code, rapport } = verdict({ composants: { Widget: { contrat: futur, tsx: TSX } } });

  assert.equal(code, 1);
  assert.match(rapport, /### ❌ La version du contrat n'est pas prise en charge : `Widget\.contract\.json`/);
  assert.match(rapport, /Le contrat utilise le schéma 99\.0\. Le repository prend en charge les schémas 12\.0\./);
  assert.match(rapport, /Un développeur doit auditer le nouveau schéma[\s\S]*Réexporter ne corrigera pas ce problème\./);
  assert.match(
    rapport,
    /^## ❌ 1 contrat invalide$/m,
    "titre actuel : il accuse le designer pour un contrat que rien ne rend invalide",
  );
});

test("contrat réellement cassé : refus, et le geste correctif est le réexport", () => {
  const casse = contrat();
  delete casse.rendering;
  const { code, rapport } = verdict({ composants: { Widget: { contrat: casse, tsx: TSX } } });

  assert.equal(code, 1);
  assert.match(rapport, /^## ❌ 1 contrat invalide$/m);
  assert.match(rapport, /### ❌ Le contrat est incomplet : `Widget\.contract\.json`/);
  assert.match(rapport, /- `rendering\.roles`/);
  assert.match(rapport, /Réexportez le composant depuis Figma\./);
});

/**
 * Les deux filets que T2.4 doit REPORTER sur `tokens.json` au lieu de les
 * supprimer avec la lecture du CSS : un fichier de tokens absent ou illisible
 * se publie comme le reste, sinon le refus serait muet.
 */
test("tokens illisibles ou absents : le refus porte quand même un message", () => {
  const sansCss = verdict({ casser: (racine) => rmSync(join(racine, "src/generated/tokens.css")) });
  assert.equal(sansCss.code, 1);
  assert.match(sansCss.rapport, /^## ❌ Les variables CSS n'ont pas pu être générées$/m);
  assert.match(sansCss.rapport, /relancez \*\*Exporter les tokens\*\* depuis Figma/);

  const jsonCasse = verdict({
    casser: (racine) => writeFileSync(join(racine, "src/tokens/tokens.json"), "{ pas du json"),
  });
  assert.equal(jsonCasse.code, 1);
  assert.match(jsonCasse.rapport, /^## ❌ `src\/tokens\/tokens\.json` est illisible$/m);
  assert.match(jsonCasse.rapport, /Relancez \*\*Exporter les tokens\*\* depuis Figma plutôt que de le corriger\./);
});

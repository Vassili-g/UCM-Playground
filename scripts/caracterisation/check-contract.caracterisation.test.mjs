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
 * | référence absente des tokens  | T2.4 — fait, source réelle|
 * | nom que la projection perdait | T2.4 — fait, non-régression|
 * | token du code : plus rien     | D1 — fait, contrôle retiré|
 * | implémentation absente        | T2.3 (parité scindée)     |
 * | version non lue               | T2.1b (ordre du verdict)  |
 * | contrat cassé                 | — (témoin)                |
 * | tokens illisibles ou absents  | T2.4 — fait, filets reportés|
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
const TSX = `export interface WidgetProps { children?: unknown }
export function Widget(_props: WidgetProps) { return null; }
`;

/**
 * Monte un repository jouet, le passe au script, rend son verdict, et le
 * démonte — même quand l'assertion échoue, sinon un test rouge laisserait un
 * dossier derrière lui à chaque exécution.
 */
function verdict({ composants, tokens = TOKENS, casser } = {}) {
  const racine = preparerRepo({
    composants: composants ?? { Widget: { contrat: contrat(), tsx: TSX } },
    tokens,
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
 * Le seul contrôle qui protège le design. Depuis T2.4 il interroge
 * `tokens.json`, la source, et non plus les variables CSS qu'elle produit :
 * le scénario donne donc un fichier de tokens VIDE, où la référence n'existe
 * réellement pas.
 */
test("référence absente des tokens : avertissement, et la fusion reste ouverte", () => {
  const { code, rapport } = verdict({ tokens: {} });

  assert.equal(code, 0, "un token absent n'a jamais bloqué : nul ne le corrige en réexportant");
  assert.match(rapport, /^## ✅ Aucun blocage détecté$/m);
  assert.match(rapport, /### ⚠️ Des contrats utilisent des tokens absents de la source \(1 référence\)/);
  assert.match(rapport, /- \*\*`Widget\.contract\.json`\*\* : `\{couleurs\.texte\.principal\}`/);
  assert.match(rapport, /Cet avertissement ne bloque pas la fusion\./);
});

/**
 * Ce que T2.4 a fait cesser, et qu'aucun test ne surveillait : Figma nomme des
 * tokens `layouts.sizing.0,5`, Style Dictionary en fait
 * `--layouts-sizing-0-5`, et la projection `.` → `-` cherchait
 * `layouts-sizing-0,5`. Le token existait, le rapport le déclarait absent.
 * Quatre tokens du corpus réel portent ce nom ; aucun contrat ne les citait
 * encore, ce qui explique que le défaut soit resté invisible.
 */
test("un nom que la projection CSS perdait est reconnu", () => {
  const contratVirgule = contrat();
  contratVirgule.viewStructures.st1.children[0].tokens.gap = "{layouts.sizing.0,5}";

  const { code, rapport } = verdict({
    composants: { Widget: { contrat: contratVirgule, tsx: TSX } },
    tokens: {
      ...TOKENS,
      layouts: { sizing: { "0,5": { $type: "dimension", $value: "4px" } } },
    },
  });

  assert.equal(code, 0);
  assert.doesNotMatch(rapport, /tokens absents de la source/);
});

/**
 * D1 a retiré ce contrôle en entier : il relève d'un linter, projet distinct.
 *
 * Ce test remplace celui qui verrouillait le blocage. Il ne teste plus le
 * contrôle — il teste son ABSENCE, ce qui n'est pas la même chose : sans lui,
 * rien ne dirait qu'un autre contrôle n'a pas repris le blocage au passage.
 * `check-contract.mjs` ne lit plus le code du tout ; un `.tsx` qui cite
 * n'importe quoi ne le regarde plus.
 */
test("token écrit dans le code et non déclaré : plus rien ne le regarde", () => {
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

  assert.equal(code, 0, "le code n'est plus inspecté : rien ici ne peut bloquer");
  assert.match(rapport, /^## ✅ Aucun blocage détecté$/m);
  assert.doesNotMatch(rapport, /Le code React utilise des tokens absents des contrats/);
  assert.doesNotMatch(rapport, /construit des noms de tokens à l'exécution/);
});

/**
 * T2.3 a scindé ce constat : l'existence au noyau, la comparaison à
 * l'adaptateur. Le message promettait un `.tsx`, ce qui est faux dans un repo
 * Swift — et faux sur la pull request d'export elle-même, la seule que le
 * designer lise. T2.6 a retiré le mot ; l'attente ci-dessous est la nouvelle
 * formulation, et c'est elle qui rend la correction visible ici.
 */
test("implémentation absente : état d'avancement, pas erreur", () => {
  const { code, rapport } = verdict({ composants: { Widget: { contrat: contrat() } } });

  assert.equal(code, 0, "l'absence d'implémentation est un avancement, pas un échec");
  assert.match(rapport, /^## ✅ Aucun blocage détecté$/m);
  assert.match(rapport, /### ℹ️ Un composant n'a pas encore d'implémentation \(1 composant\)/);
  assert.match(rapport, /dès que l'implémentation du composant sera ajoutée/);
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
 * Les deux filets, REPORTÉS par T2.4 sur `tokens.json` au lieu de disparaître
 * avec la lecture du CSS : un fichier de tokens absent ou illisible se publie
 * comme le reste, sinon le refus serait muet.
 *
 * Absent et illisible portent des titres DIFFÉRENTS parce qu'ils appellent des
 * gestes différents : régénérer, ou cesser d'éditer le fichier à la main.
 */
test("tokens illisibles ou absents : le refus porte quand même un message", () => {
  const sansTokens = verdict({ casser: (racine) => rmSync(join(racine, "src/tokens/tokens.json")) });
  assert.equal(sansTokens.code, 1);
  assert.match(sansTokens.rapport, /^## ❌ `src\/tokens\/tokens\.json` est introuvable$/m);
  assert.match(sansTokens.rapport, /relancez \*\*Exporter les tokens\*\* depuis Figma/);

  const jsonCasse = verdict({
    casser: (racine) => writeFileSync(join(racine, "src/tokens/tokens.json"), "{ pas du json"),
  });
  assert.equal(jsonCasse.code, 1);
  assert.match(jsonCasse.rapport, /^## ❌ `src\/tokens\/tokens\.json` est illisible$/m);
  assert.match(jsonCasse.rapport, /Relancez \*\*Exporter les tokens\*\* depuis Figma plutôt que de le corriger\./);
});

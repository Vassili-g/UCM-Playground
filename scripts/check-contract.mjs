/**
 * Garde-fou « contrat ↔ tokens » (cf. UCM-Exporter/ROADMAP.md).
 *
 * Vérifie quatre propriétés d'un contrat, sans jamais le croire sur parole :
 *
 * 1. **Existence** — toute référence `{chemin.du.token}` citée par le contrat
 *    correspond à une variable CSS générée depuis `tokens.json`. Les
 *    références sont RELEVÉES DANS LE CONTRAT, pas lues dans son champ
 *    `tokensUsed` : cet index est écrit par l'exporteur, et un garde-fou qui se
 *    contente de relire l'inventaire de l'outil qu'il contrôle ne contrôle
 *    rien — une référence oubliée à l'indexation passerait sans être vue.
 * 2. **Cohérence** — l'index `tokensUsed` correspond exactement aux références
 *    réellement citées. Un écart n'est pas une erreur de design mais un défaut
 *    de l'exporteur : le diagnostic le dit explicitement, parce que le geste
 *    correctif n'appartient alors pas à la même personne.
 * 3. **Parité code** — dès qu'un `.tsx` existe, toutes les props du contrat
 *    appartiennent à son interface publique et les props BOOLEAN y restent
 *    réellement typées `boolean` puis sont lues par le composant. L'absence
 *    du `.tsx` reste autorisée.
 * 4. **Composition** — chaque cible possède un contrat local, les slots et
 *    `composes` décrivent la même séquence, le graphe est acyclique et chaque
 *    occurrence déclarée est rendue exactement une fois dans la fonction React
 *    concernée — ni absente, ni dupliquée.
 *
 * Le même diagnostic est écrit pour deux lecteurs très différents : le
 * terminal pour un développeur, et un rapport markdown pour le **designer**,
 * qui valide les pull requests d'export sans jamais ouvrir un log de CI
 * (cf. .github/workflows/ci.yml).
 *
 * Ce rapport est le SEUL message que reçoit le designer : tout ce qui refuse
 * une pull request y figure, y compris ce qui se constate ailleurs. Les tests
 * pilotés par le contrat sont exécutés en amont par `check.mjs`, qui transmet
 * leurs échecs ici (cf. `echecs-de-tests.mjs`). Aucune sortie anticipée ne
 * reste muette non plus : un fichier de tokens absent ou illisible se publie
 * comme le reste.
 *
 * Lancer après `npm run tokens` (fait par le script `npm run check`).
 * Sort en erreur (code 1) si un contrat est fautif : utilisable tel quel en CI.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { selectionnerBilansDuRapport } from "./perimetre-rapport.mjs";
import {
  avertissementsCorrigeables,
  resumeTerminalAvertissements,
  sectionAvertissementsExport,
} from "./avertissements-export.mjs";
import {
  conseilTerminalTokensManquants,
  conseilTokensManquants,
  diagnosticReferencesCodeNonDeclarees,
} from "./diagnostic-tokens.mjs";
import {
  diagnosticEchecsDeTests,
  resumeTerminalEchecsDeTests,
} from "./echecs-de-tests.mjs";
import {
  VERSION_CONTRAT_MAXIMALE,
  VERSION_CONTRAT_MINIMALE,
  verdictDeVersion,
} from "./version-contrat.mjs";
import { trouverContrats } from "./trouver-contrats.mjs";
import { champsInvalidesDuContrat } from "./validation-contrat.mjs";
import { validerGrapheDesContrats } from "./validation-graphe-contrats.mjs";
import { ecartsDeTokensDuCode } from "./tokens-du-code.mjs";
import { collecterReferences } from "./references-token.mjs";
import { erreursTypesTypographiques } from "./typography-token-types.mjs";
import {
  cheminDuComposant,
  ecartsDeParite,
  lireApiPublique,
  nomInterfaceAttendue,
  pariteBloquante,
} from "./parite.mjs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_TOKENS = "src/tokens/tokens.json";
const TOKENS_MODIFIES = process.env.UCM_TOKENS_MODIFIES === "true";
const VERSIONS_CONTRAT_SUPPORTEES = VERSION_CONTRAT_MINIMALE === VERSION_CONTRAT_MAXIMALE
  ? VERSION_CONTRAT_MINIMALE
  : `${VERSION_CONTRAT_MINIMALE} à ${VERSION_CONTRAT_MAXIMALE}`;

/**
 * Verdict de la suite de tests, transmis par `check.mjs`.
 *
 * Lancé seul (`npm run check:contract`), ce script n'a rien à en dire : sans
 * variable, il ne rapporte aucun test — il n'en invente surtout pas le succès.
 */
const echecsDeTests = (() => {
  try {
    const transmis = JSON.parse(process.env.UCM_ECHECS_DE_TESTS ?? "{}");
    return { echoue: transmis.echoue === true, echecs: transmis.echecs ?? [] };
  } catch {
    return { echoue: true, echecs: [] };
  }
})();

// 1. Extraire les noms de variables CSS générées (`--nom:`), sans le `--`.
// La classe est définie par exclusion (tout sauf les délimiteurs CSS) plutôt
// que par une liste de caractères permis : un nom de token accentué
// (`--couleurs-été`) doit être reconnu, sinon il paraîtrait absent du design
// system alors qu'il est bien généré.
const cssPath = join(racine, "src/generated/tokens.css");
const tokensPath = join(racine, SOURCE_TOKENS);
let css;
try {
  css = readFileSync(cssPath, "utf8");
} catch {
  console.error(
    `✗ ${cssPath} introuvable. Lancez d'abord « npm run tokens ».`,
  );
  abandonner(
    "Les variables CSS n'ont pas pu être générées",
    `Les tokens de \`${SOURCE_TOKENS}\` n'ont produit aucune variable CSS : la génération a échoué avant toute vérification. Si cette pull request modifie les tokens, relancez **Exporter les tokens** depuis Figma ; sinon, signalez-le à un développeur.`,
  );
}
const varsGenerees = new Set(
  [...css.matchAll(/--([^\s:;{}()]+)\s*:/g)].map((m) => m[1]),
);

let tokensDtcg;
try {
  tokensDtcg = JSON.parse(readFileSync(tokensPath, "utf8").replace(/^﻿/, ""));
} catch {
  console.error(`✗ ${tokensPath} est illisible. Relancez l’export de tokens depuis Figma.`);
  abandonner(
    `\`${SOURCE_TOKENS}\` est illisible`,
    "Le fichier de tokens n'est pas du JSON valide : il a sans doute été tronqué ou modifié à la main. Relancez **Exporter les tokens** depuis Figma plutôt que de le corriger.",
  );
}

/** Nom de variable CSS attendu pour une référence `{chemin.du.token}`. */
function nomVariable(reference) {
  return reference.replace(/^\{(.*)\}$/, "$1").replaceAll(".", "-");
}

/**
 * Analyse un contrat sans jamais lever : un fichier illisible est un
 * diagnostic à afficher, pas un plantage du garde-fou (une stack trace Node
 * n'aide personne, et surtout pas la personne qui a produit l'export).
 */
function analyser(chemin, apiPublique, erreursGraphe = []) {
  const fichier = basename(chemin);
  const relatif = chemin.replace(racine, ".");
  const vide = {
    fichier, relatif, illisible: false, champsAbsents: [], version: null,
    avertissements: [],
    manquants: [], nonListes: [], fantomes: [], typesTypographiques: [], total: 0,
    graphe: erreursGraphe,
    parite: {
      implementationAbsente: false,
      interfaceAbsente: null,
      fonctionAbsente: null,
      manquantes: [],
      typesIncorrects: [],
      booleensNonUtilises: [],
      compositionsIncorrectes: [],
    },
  };

  let contrat;
  try {
    // Un BOM en tête de fichier ferait échouer JSON.parse : on le retire.
    contrat = JSON.parse(readFileSync(chemin, "utf8").replace(/^﻿/, ""));
  } catch {
    return { ...vide, illisible: true };
  }

  // Le garde-fou vérifie d'abord qu'il a bien de quoi travailler. Sans ce
  // contrôle, un fichier vidé de sa substance (`{}`, JSON parfaitement valide)
  // passerait au vert : zéro référence citée, donc zéro référence manquante.
  const champsAbsents = champsInvalidesDuContrat(contrat);
  if (champsAbsents.length > 0) return { ...vide, champsAbsents };

  const version = contrat.meta.contractVersion;
  // On garde le SENS de l'écart, pas seulement son existence : c'est lui qui
  // dit à qui appartient le geste correctif.
  const verdict = verdictDeVersion(version);
  const versionIncompatible = verdict === "ok" ? null : { valeur: version, verdict };

  const composant = cheminDuComposant(chemin);
  const parite = ecartsDeParite(
    contrat,
    apiPublique.get(composant),
    nomInterfaceAttendue(composant),
  );

  // `tokensUsed` est l'index qu'on audite : on ne le parcourt pas, sinon la
  // comparaison ci-dessous se vérifierait elle-même.
  const { tokensUsed: index, ...corps } = contrat;
  const citees = collecterReferences(corps);
  const indexees = new Set(index.filter((ref) => typeof ref === "string"));

  // L'existence se contrôle sur la RÉUNION des deux ensembles : ni une
  // référence oubliée de l'index, ni une entrée d'index citée nulle part ne
  // doit échapper au contrôle.
  const toutes = new Set([...citees, ...indexees]);

  return {
    ...vide,
    version: versionIncompatible,
    // Ce que l'export a signalé. Le contrat le porte déjà ; il ne manquait
    // qu'un lecteur du côté de la CI.
    avertissements: avertissementsCorrigeables(contrat),
    parite,
    manquants: [...toutes].filter((ref) => !varsGenerees.has(nomVariable(ref))).sort(),
    nonListes: [...citees].filter((ref) => !indexees.has(ref)).sort(),
    fantomes: [...indexees].filter((ref) => !citees.has(ref)).sort(),
    typesTypographiques: erreursTypesTypographiques(contrat, tokensDtcg),
    total: toutes.size,
  };
}

/** Vrai si une implémentation existante porte un écart contrat ↔ code. */
function aUnEcartDeParite(bilan) {
  return pariteBloquante(bilan.parite);
}

/** Contrats valides qui attendent encore leur première implémentation React. */
function implementationsEnAttente(bilans) {
  return bilans.filter(
    (bilan) =>
      bilan.parite.implementationAbsente
      && !bilan.illisible
      && bilan.champsAbsents.length === 0
      && !bilan.version
      && bilan.graphe.length === 0
      && bilan.manquants.length === 0
      && bilan.nonListes.length === 0
      && bilan.fantomes.length === 0,
  );
}

/** Ajoute au rapport l'état informatif des contrats encore sans `.tsx`. */
function ajouterImplementationsEnAttente(lignes, bilans) {
  const attentes = implementationsEnAttente(bilans);
  if (attentes.length === 0) return;

  lignes.push(
    "",
    "### ℹ️ Implémentation en attente",
    "",
    "Ces contrats sont valides et peuvent être fusionnés avant leur composant React :",
    "",
    ...attentes.map((bilan) => `- \`${bilan.fichier}\` — aucun \`.tsx\` pour le moment`),
    "",
    "Dès qu'un fichier `.tsx` co-localisé sera ajouté, la parité de ses props deviendra automatiquement bloquante.",
  );
}

/**
 * Ajoute au rapport les références de tokens du code que le contrat ne permet
 * pas de vérifier.
 *
 * Ce rapport est lu par le **designer**, qui valide la pull request d'export.
 * Sa première question n'est pas « qu'est-ce qu'une référence de token » mais
 * « est-ce que mon export est en cause, et qu'est-ce qui se passe maintenant ».
 * Le verdict passe donc avant l'explication, et les deux écarts sont séparés
 * parce qu'ils ne s'adressent pas à la même personne : un chemin assemblé est
 * un défaut de code pur, une référence inconnue du contrat vient le plus
 * souvent d'un token renommé dans Figma. Le pourquoi technique reste replié :
 * il éclaire s'il est ouvert, il n'encombre pas s'il ne l'est pas.
 */
function ajouterTokensDuCode(lignes, tokensDuCode, avertissements) {
  if (tokensDuCode.length === 0) return;

  const assembles = tokensDuCode.flatMap(({ chemin, construites }) =>
    construites.map(({ ligne }) => ({ fichier: basename(chemin), ligne })));
  const inconnus = tokensDuCode.flatMap(({ chemin, nonDeclarees, sansContrat }) =>
    nonDeclarees.map(({ ligne, reference, voisines }) => ({
      fichier: basename(chemin), ligne, reference, voisines, sansContrat,
    })));

  if (assembles.length > 0) {
    lignes.push(
      "### ⚙️ Le code React doit être ajusté — votre design n'est pas en cause",
      "",
      "Ni votre maquette ni vos tokens ne sont fautifs, et ré-exporter n'y changerait rien. Un développeur doit reprendre :",
      "",
      ...assembles.map(({ fichier, ligne }) => `- \`${fichier}\`, ligne ${ligne}`),
      "",
      "<details><summary>Pourquoi cela bloque la fusion</summary>",
      "",
      "Ces lignes ne citent pas un token : elles **fabriquent son nom** en recollant des morceaux au moment où la page s'affiche. Le nom complet n'existe donc nulle part dans le code, et rien ne peut vérifier qu'il désigne un token réel. Concrètement : si vous renommez ce token dans Figma, le composant continuerait d'en réclamer un qui n'existe plus, et la couleur disparaîtrait sans qu'aucune alerte ne se déclenche. Chaque référence doit être écrite en entier pour rester vérifiable.",
      "",
      "</details>",
      "",
    );
  }

  if (inconnus.length > 0) {
    lignes.push(...diagnosticReferencesCodeNonDeclarees(inconnus, avertissements));
  }
}

/** Rapport markdown destiné au designer : ce qui bloque, et quoi faire. */
function rapportMarkdown(bilans, fautifs, bilansDuRapport, tokensDuCode) {
  // Un rapport vert alors que la pull request est refusée est pire que pas de
  // rapport du tout : le designer chercherait la panne ailleurs. Le verdict
  // couvre donc aussi ce que ce script n'a pas exécuté lui-même.
  if (fautifs.length === 0 && tokensDuCode.length === 0 && !echecsDeTests.echoue) {
    const tokens = bilans.reduce((somme, bilan) => somme + bilan.total, 0);
    const lignes = [
      "## ✅ Contrats et tokens cohérents",
      "",
      `${bilans.length} contrat(s) vérifié(s), ${tokens} références de tokens : toutes existent dans \`${SOURCE_TOKENS}\`.`,
    ];
    // Le verdict est exact, mais il ne porte que sur ce qui a été exporté. Une
    // propriété que l'export n'a pas pu décrire n'est citée par personne et ne
    // produit donc aucun écart : sans ce rappel, elle passerait sous un ✅.
    lignes.push(...sectionAvertissementsExport(bilansDuRapport));
    ajouterImplementationsEnAttente(lignes, bilansDuRapport);
    return lignes.join("\n");
  }

  // Le titre dit à qui appartient le blocage. Quand aucun contrat n'est fautif,
  // l'export du designer est intact et seul le code du repository retient la
  // fusion : annoncer « cet export ne peut pas être fusionné » lui ferait
  // chercher une faute dans sa maquette, où il n'y en a aucune.
  // « Le blocage ne concerne que le code React » suppose que l'export a tout
  // décrit. Un point non décrit le dément : la propriété manque au contrat, et
  // c'est un ré-export qui la ramènera. Affirmer le contraire enverrait le
  // designer chercher ailleurs qu'où se trouve son geste.
  const avertissements = bilansDuRapport.flatMap((bilan) => bilan.avertissements);
  const exportEnCause = fautifs.length > 0;
  const lignes = exportEnCause
    ? ["## ❌ Cet export ne peut pas être fusionné en l'état", ""]
    : avertissements.length > 0
      ? [
        "## ❌ Cette pull request ne peut pas être fusionnée en l'état",
        "",
        "Les contrats contrôlés sont valides et toutes leurs références existent dans `src/tokens/tokens.json`. Mais l’export a signalé des informations qu’il **n’a pas pu décrire** : elles manquent donc au contrat. Le blocage vient peut-être de là — voyez les citations ci-dessous avant de conclure que le code seul est en cause.",
        "",
      ]
      : [
        "## ❌ La fusion est bloquée par le code du repository",
        "",
        "Les contrats contrôlés sont valides, toutes leurs références existent dans `src/tokens/tokens.json`, et l’export n’a signalé aucune information manquante. **L’export Figma est terminé ; le blocage concerne uniquement le code React.**",
        "",
      ];

  // La cause la plus probable se lit en premier, et une seule fois : les
  // diagnostics qui suivent y renvoient au lieu de recopier les mêmes
  // citations à chaque section.
  lignes.push(...sectionAvertissementsExport(bilansDuRapport, { bloquant: true }));

  for (const bilan of fautifs) {
    if (bilan.illisible) {
      lignes.push(
        `### \`${bilan.fichier}\` n'est pas un fichier JSON valide`,
        "",
        "Il a sans doute été tronqué, ou modifié à la main.",
        "",
      );
      continue;
    }
    if (bilan.champsAbsents.length > 0) {
      lignes.push(
        `### \`${bilan.fichier}\` ne contient pas un contrat exploitable`,
        "",
        "Le fichier est du JSON valide, mais il ne décrit aucun composant. Champs absents ou mal formés :",
        "",
        ...bilan.champsAbsents.map((champ) => `- \`${champ}\``),
        "",
      );
      continue;
    }
    if (bilan.version) {
      lignes.push(
        `### \`${bilan.fichier}\` a été exporté par une version trop ${
          bilan.version.verdict === "recent" ? "récente" : "ancienne"
        } du plugin`,
        "",
        bilan.version.verdict === "recent"
          ? `Contrat en **${bilan.version.valeur}**, alors que ce repo supporte explicitement le schéma **${VERSIONS_CONTRAT_SUPPORTEES}**. L'export vient d'un plugin en avance sur ce repository : ré-exporter n'y changera rien, c'est le code du playground qui doit d'abord auditer ce schéma. Signalez-le à un développeur : l'audit consiste à lire ce que la nouvelle version change, à adapter ce que ce repo en lit, puis à porter la borne dans \`scripts/version-contrat.mjs\` — le commentaire de \`VERSION_CONTRAT_MAXIMALE\` garde la trace de chaque audit.`
          : `Contrat en **${bilan.version.valeur}**, ce repo attend au moins **${VERSION_CONTRAT_MINIMALE}**. Des informations dont le code a besoin peuvent manquer : le composant se compile, mais certaines props restent sans effet.`,
        "",
      );
    }
    if (bilan.graphe.length > 0) {
      lignes.push(
        `### \`${bilan.fichier}\` : graphe de composition incohérent`,
        "",
        ...bilan.graphe.map((erreur) => `- ${erreur}`),
        "",
      );
    }
    if (bilan.manquants.length > 0) {
      lignes.push(
        `### \`${bilan.fichier}\` cite ${bilan.manquants.length} token(s) qui n'existent pas`,
        "",
        ...bilan.manquants.map((token) => `- \`${token}\``),
        "",
      );
    }
    const ecarts = bilan.nonListes.length + bilan.fantomes.length;
    if (ecarts > 0) {
      lignes.push(
        `### \`${bilan.fichier}\` n'est pas cohérent avec son propre index`,
        "",
        ...bilan.nonListes.map((token) => `- \`${token}\` est utilisé par le contrat mais absent de \`tokensUsed\``),
        ...bilan.fantomes.map((token) => `- \`${token}\` est listé dans \`tokensUsed\` mais utilisé nulle part`),
        "",
      );
    }
    if (bilan.typesTypographiques.length > 0) {
      lignes.push(
        `### \`${bilan.fichier}\` : types de tokens typographiques incompatibles`,
        "",
        ...bilan.typesTypographiques.map(({ chemin, reference, attendu, recu }) =>
          `- \`${chemin}\` cite \`${reference}\` de type \`${recu}\`, attendu \`${attendu}\``),
        "",
      );
    }
    if (aUnEcartDeParite(bilan)) {
      lignes.push(`### \`${bilan.fichier}\` : le code ne suit pas le contrat`, "");
      if (bilan.parite.interfaceAbsente) {
        lignes.push(
          `Le composant n'expose pas d'interface \`${bilan.parite.interfaceAbsente}\` : son API publique est illisible.`,
          "",
        );
      } else if (bilan.parite.fonctionAbsente) {
        lignes.push(
          `La fonction du composant \`${bilan.parite.fonctionAbsente}\` est introuvable : ni props lues, ni composition vérifiables. Nommez la fonction comme le fichier, ou exportez-la par défaut.`,
          "",
        );
      } else {
        lignes.push(
          ...bilan.parite.manquantes.map((prop) => `- la prop \`${prop}\` du contrat n'existe pas dans le composant`),
          ...bilan.parite.typesIncorrects.map(
            ({ prop, attendu, recu }) =>
              `- la prop \`${prop}\` doit être \`${attendu}\` selon le contrat, mais le composant expose \`${recu}\``,
          ),
          ...bilan.parite.booleensNonUtilises.map(
            (prop) => `- la prop BOOLEAN \`${prop}\` existe dans l'interface mais n'est jamais lue par le composant`,
          ),
          ...bilan.parite.compositionsIncorrectes.map(
            ({ component, attendu, rendu }) =>
              `- le contrat déclare ${attendu} occurrence(s) de \`${component}\`, mais le composant en rend ${rendu}`,
          ),
          "",
        );
      }
    }
  }

  // Les deux diagnostics reçoivent ce que l'export a signalé, mot pour mot :
  // ni l'un ni l'autre ne conclut à sa place, mais aucun ne peut plus disculper
  // Figma sans l'avoir consulté.
  lignes.push(...diagnosticEchecsDeTests(echecsDeTests, avertissements));
  ajouterTokensDuCode(lignes, tokensDuCode, avertissements);

  // « Que faire ? » ne concerne que les contrats fautifs : les écarts de tokens
  // du code portent déjà leur propre geste correctif, au plus près du constat.
  // Le titre n'apparaît donc que s'il a quelque chose à annoncer — un « Que
  // faire ? » vide laisserait le lecteur chercher une consigne inexistante.
  const conseils = [];
  if (fautifs.some((bilan) => bilan.manquants.length > 0)) {
    conseils.push(...conseilTokensManquants({
      tokensModifies: TOKENS_MODIFIES,
      sourceTokens: SOURCE_TOKENS,
    }));
  }
  if (fautifs.some((bilan) => bilan.illisible || bilan.champsAbsents.length > 0 || bilan.version?.verdict === "ancien")) {
    conseils.push(
      "Pour un fichier illisible, incomplet ou trop ancien, ré-exportez le composant depuis Figma plutôt que de corriger le JSON à la main. Le design n'a pas besoin d'avoir changé : c'est le plugin qui a évolué.",
      "",
    );
  }
  if (fautifs.some((bilan) => bilan.nonListes.length + bilan.fantomes.length > 0)) {
    conseils.push(
      "L'écart avec `tokensUsed` **ne vient pas du design** : le contrat se contredit lui-même, ce qui signale un défaut de l'exporteur. Ré-exporter ne suffira pas — signalez-le à un développeur du plugin.",
      "",
    );
  }
  if (fautifs.some((bilan) => bilan.typesTypographiques.length > 0)) {
    conseils.push(
      "Ces types viennent de `tokens.json`, pas du composant React : corrigez l’exporteur puis réexportez les tokens depuis Figma. Ne modifiez ni le contrat ni le token DTCG à la main.",
      "",
    );
  }
  if (fautifs.some((bilan) => bilan.graphe.length > 0)) {
    conseils.push(
      "Le graphe de composition appartient aux contrats et au repository : vérifiez les contrats co-localisés, les slots composés et les cycles. Ne remplacez jamais une cible manquante par un composant dessiné à la main.",
      "",
    );
  }
  if (fautifs.some(aUnEcartDeParite)) {
    conseils.push(
      "L'écart entre le contrat et le code **ne vient pas du design non plus** : le design a évolué, le composant React doit suivre. Ré-exporter n'y changera rien — c'est à un développeur d'ajouter les props manquantes, de corriger leur type ou de relier les BOOLEAN au comportement dans la même pull request.",
      "",
    );
  }
  if (conseils.length > 0) lignes.push("### Que faire ?", "", ...conseils);
  ajouterImplementationsEnAttente(lignes, bilansDuRapport);
  return lignes.join("\n");
}

/**
 * Publie le rapport là où GitHub sait l'afficher sans dérouler un log : le
 * résumé du run, et `ci-report.md` que le workflow reprend en commentaire
 * de pull request. En local, on n'écrit aucun fichier.
 */
function publier(markdown) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }
  if (process.env.CI) {
    writeFileSync(join(racine, "ci-report.md"), `${markdown}\n`);
  }
}

/**
 * Renonce à vérifier, en le disant.
 *
 * Les préalables du garde-fou (tokens générés, tokens DTCG lisibles) peuvent
 * manquer : il n'a alors rien à contrôler, mais la pull request est refusée
 * quand même. Sortir en silence laisserait le designer devant un ✗ sans cause ;
 * ce rapport minimal nomme le préalable manquant et le geste attendu.
 */
function abandonner(titre, explication) {
  publier([
    `## ❌ ${titre}`,
    "",
    explication,
    "",
    ...diagnosticEchecsDeTests(echecsDeTests),
  ].join("\n"));
  process.exit(1);
}

const contrats = trouverContrats(join(racine, "src"));
const documents = contrats.flatMap((chemin) => {
  try {
    return [{
      chemin,
      contrat: JSON.parse(readFileSync(chemin, "utf8").replace(/^﻿/, "")),
    }];
  } catch {
    return [];
  }
});
const erreursGraphe = validerGrapheDesContrats(documents);
// L'API publique de tous les composants est relevée d'un coup, avant l'analyse :
// un seul programme TypeScript pour l'ensemble du repo (cf. parite.mjs).
const apiPublique = lireApiPublique(contrats.map(cheminDuComposant), racine);
// Contrôle repo-wide : il ne vise aucun contrat en particulier, mais le code
// qui aurait cessé de les lire (cf. tokens-en-dur.mjs).
const tokensDuCode = ecartsDeTokensDuCode(join(racine, "src")).map((ecart) => ({
  ...ecart,
  chemin: ecart.chemin.replace(racine, ".").replaceAll("\\", "/"),
}));

const bilans = contrats.map((chemin) =>
  analyser(chemin, apiPublique, erreursGraphe.get(chemin) ?? []),
);
const fautifs = bilans.filter(
  (bilan) =>
    bilan.illisible ||
    bilan.champsAbsents.length > 0 ||
    Boolean(bilan.version) ||
    bilan.graphe.length > 0 ||
    bilan.manquants.length > 0 ||
    bilan.nonListes.length + bilan.fantomes.length > 0 ||
    bilan.typesTypographiques.length > 0 ||
    aUnEcartDeParite(bilan),
);

for (const bilan of bilans) {
  if (bilan.illisible) {
    console.error(`✗ ${bilan.fichier} : JSON illisible (${bilan.relatif})`);
    continue;
  }
  if (bilan.champsAbsents.length > 0) {
    console.error(`✗ ${bilan.fichier} : contrat inexploitable, champs absents → ${bilan.champsAbsents.join(', ')} (${bilan.relatif})`);
    continue;
  }
  if (bilan.version) {
    console.error(
      bilan.version.verdict === "recent"
        ? `✗ ${bilan.fichier} : contrat en ${bilan.version.valeur}, ce repo supporte jusqu'au schéma ${VERSION_CONTRAT_MAXIMALE} — ce nouveau schéma doit être audité dans le playground`
        : `✗ ${bilan.fichier} : contrat en ${bilan.version.valeur}, ce repo attend au moins ${VERSION_CONTRAT_MINIMALE}`,
    );
  }
  for (const token of bilan.manquants) {
    console.error(`✗ ${bilan.fichier} : token absent des tokens générés → ${token}`);
  }
  for (const token of bilan.nonListes) {
    console.error(`✗ ${bilan.fichier} : utilisé par le contrat mais absent de tokensUsed → ${token}`);
  }
  for (const token of bilan.fantomes) {
    console.error(`✗ ${bilan.fichier} : listé dans tokensUsed mais utilisé nulle part → ${token}`);
  }
  for (const { chemin, reference, attendu, recu } of bilan.typesTypographiques) {
    console.error(
      `✗ ${bilan.fichier} : type typographique incompatible → ${chemin}, ${reference} est ${recu}, attendu ${attendu}`,
    );
  }
  for (const erreur of bilan.graphe) {
    console.error(`✗ ${bilan.fichier} : graphe de composition incohérent → ${erreur}`);
  }
  if (bilan.parite.interfaceAbsente) {
    console.error(`✗ ${bilan.fichier} : interface ${bilan.parite.interfaceAbsente} introuvable dans le composant`);
  }
  if (bilan.parite.fonctionAbsente) {
    console.error(
      `✗ ${bilan.fichier} : fonction du composant ${bilan.parite.fonctionAbsente} introuvable → nommez-la comme le fichier, ou exportez-la par défaut`,
    );
  }
  for (const prop of bilan.parite.manquantes) {
    console.error(`✗ ${bilan.fichier} : prop du contrat absente du composant → ${prop}`);
  }
  for (const { prop, attendu, recu } of bilan.parite.typesIncorrects) {
    console.error(
      `✗ ${bilan.fichier} : type de prop incompatible → ${prop} doit être ${attendu}, reçu ${recu}`,
    );
  }
  for (const prop of bilan.parite.booleensNonUtilises) {
    console.error(
      `✗ ${bilan.fichier} : prop BOOLEAN déclarée mais non utilisée par le composant → ${prop}`,
    );
  }
  for (const { component, attendu, rendu } of bilan.parite.compositionsIncorrectes) {
    console.error(
      `✗ ${bilan.fichier} : cardinalité de composition incorrecte → ${component}, attendu ${attendu}, rendu ${rendu}`,
    );
  }
  const ecartDeParite = aUnEcartDeParite(bilan);
  const tokensSains = bilan.manquants.length + bilan.nonListes.length + bilan.fantomes.length === 0
    && bilan.typesTypographiques.length === 0;
  const marque = tokensSains
    && bilan.graphe.length === 0
    && !ecartDeParite
    && !bilan.version
    ? "✓"
    : "✗";
  const etatDuCode = bilan.parite.implementationAbsente
    ? "implémentation .tsx en attente (autorisé)"
    : ecartDeParite
      ? "code en écart"
      : "code conforme";
  console.log(`${marque} ${bilan.fichier} : ${bilan.total} tokens vérifiés, ${etatDuCode} (${bilan.relatif})`);
}

for (const { chemin, construites, nonDeclarees, sansContrat } of tokensDuCode) {
  for (const { ligne, extrait } of construites) {
    console.error(`✗ ${chemin}:${ligne} : chemin de token assemblé à l'exécution → ${extrait}`);
  }
  for (const { ligne, reference } of nonDeclarees) {
    console.error(
      `✗ ${chemin}:${ligne} : token ${sansContrat ? "cité sans contrat co-localisé" : "absent du contrat"} → ${reference}`,
    );
  }
}

// La validation reste globale. Seuls les états informatifs sont limités aux
// contrats de la PR afin qu'un export ne parle pas d'un autre composant.
const bilansDuRapport = selectionnerBilansDuRapport(
  bilans,
  process.env.UCM_CONTRATS_MODIFIES,
);
publier(rapportMarkdown(bilans, fautifs, bilansDuRapport, tokensDuCode));

if (tokensDuCode.length > 0) {
  console.error(
    "\n✗ Le code React ne suit pas encore les contrats : remplacez les chemins assemblés" +
      " par des références littérales et reconstruisez les composants qui citent l’ancienne structure. Ne réexportez pas les contrats déjà valides.",
  );
}

if (fautifs.length > 0) {
  // Chaque cause a son geste correctif : on n'affiche que ceux qui s'appliquent.
  console.error(`\n✗ ${fautifs.length} contrat(s) en défaut.`);
  if (fautifs.some((bilan) => bilan.manquants.length > 0)) {
    console.error(`  ${conseilTerminalTokensManquants({
      tokensModifies: TOKENS_MODIFIES,
      sourceTokens: SOURCE_TOKENS,
    })}`);
  }
  if (fautifs.some((bilan) => bilan.illisible || bilan.champsAbsents.length > 0)) {
    console.error('  JSON illisible ou incomplet : ré-exportez le composant depuis Figma.');
  }
  if (fautifs.some((bilan) => bilan.nonListes.length + bilan.fantomes.length > 0)) {
    console.error('  Écart avec tokensUsed : défaut de l’exporteur, pas du design — à signaler à un développeur du plugin.');
  }
  if (fautifs.some((bilan) => bilan.typesTypographiques.length > 0)) {
    console.error("  Types typographiques incompatibles : corrigez l’exporteur, puis réexportez les tokens depuis Figma ; ne retouchez pas les contrats ni les TSX.");
  }
  if (fautifs.some((bilan) => bilan.graphe.length > 0)) {
    console.error(
      "  Graphe de composition incohérent : ajoutez les contrats cibles, alignez les slots et supprimez les cycles.",
    );
  }
  if (fautifs.some(aUnEcartDeParite)) {
    console.error('  Écart contrat ↔ code : le design a évolué, le composant doit suivre — à implémenter par un développeur.');
  }
  if (fautifs.some((bilan) => bilan.parite.compositionsIncorrectes.length > 0)) {
    console.error(
      "  Composition incorrecte : le TSX doit rendre exactement la cardinalité déclarée, ni moins ni plus.",
    );
  }
}

// Les tests ont déjà affiché leur propre sortie ; ce rappel sert à ce que le
// dernier mot du terminal dise la même chose que le rapport publié.
for (const ligne of resumeTerminalEchecsDeTests(echecsDeTests)) console.error(ligne);

// Le terminal dit la même chose que le rapport : un point non décrit ne refuse
// pas la pull request, mais il ne doit pas non plus disparaître du fil.
const resumeAvertissements = resumeTerminalAvertissements(bilansDuRapport);
if (resumeAvertissements) console.error(`\n${resumeAvertissements}`);

// Le rapport porte le verdict complet : ce script sort donc en erreur pour ce
// qu'il a relayé comme pour ce qu'il a constaté, sans quoi la chaîne pourrait
// finir au vert avec un rapport rouge.
if (fautifs.length > 0 || tokensDuCode.length > 0 || echecsDeTests.echoue) process.exit(1);

console.log(
  "\n✓ Tokens existants ; parité conforme pour les composants déjà implémentés ;" +
    " tokens du code vérifiés contre leur contrat.",
);

/**
 * Garde-fou « contrat ↔ tokens » (cf. UCM-Exporter/ROADMAP.md).
 *
 * Vérifie quatre propriétés d'un contrat, sans jamais le croire sur parole :
 *
 * 1. **Existence** — toute référence `{chemin.du.token}` citée par le contrat
 *    est cherchée dans `tokens.json`, à son chemin exact. Une absence
 *    est signalée au designer sans bloquer : les tokens sont la source de
 *    vérité et un ancien contrat ne retient pas leur évolution. Les références
 *    sont RELEVÉES DANS LE CONTRAT, `samples` et `meta` exclus — un texte de
 *    maquette peut valoir « {montant.total} » sans nommer aucun token, et une
 *    phrase d'avertissement peut en citer un.
 * 2. **Cohérence** — un contrat portait un index de ses propres références,
 *    `tokensUsed`, et ce contrôle le confrontait au relevé ci-dessus. La 11.0
 *    ne le publie plus : ce qui se dérive du contrat terminé ne s'y écrit pas.
 *    Le contrôle disparaît donc avec son objet — il surveillait l'index, pas le
 *    design, et l'existence (point 1) se calcule sur le relevé, qui reste seul
 *    et intact. Un contrat 10.3 le conserve tant qu'il en publie un.
 * 3. **Parité code** — dès qu'une implémentation existe, toutes les props du contrat
 *    appartiennent à son interface publique, les props BOOLEAN y restent
 *    réellement typées `boolean` puis sont lues par le composant, et chaque
 *    occurrence déclarée est rendue exactement une fois dans le composant
 *    concerné — ni absente, ni dupliquée. L'absence d'implémentation reste autorisée.
 *    Ce contrôle AVERTIT sans bloquer : il accuse le code, pas le
 *    contrat, et son geste correctif appartient à un développeur.
 * 4. **Composition** — chaque cible possède un contrat local, les slots et
 *    `composes` décrivent la même séquence et le graphe est acyclique. Cette
 *    part-là est bloquante : elle se lit dans les contrats seuls.
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
 * La réciproque ne vaut pas : ce qui figure au rapport ne refuse pas forcément
 * la pull request. Un constat que l'export ne peut ni causer ni corriger
 * s'écrit en ⚠ et laisse fusionner — sans quoi le rapport arrêterait la seule
 * personne incapable d'y répondre. Chaque titre dit littéralement ce qu'il a
 * trouvé : « N contrats invalides » n'est écrit que si N contrats le sont
 * (cf. `enteteDuVerdict`).
 *
 * Lancer après `npm run tokens` (fait par le script `npm run check`).
 * Sort en erreur (code 1) si un contrôle bloquant échoue : utilisable tel quel
 * en CI. Une référence de contrat absente des tokens et un écart contrat ↔ code
 * restent des avertissements.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { selectionnerBilansDuRapport } from "./perimetre-rapport.mjs";
import {
  aUnEcartDeParite,
  resumeTerminalEcartsDeParite,
  sectionEcartsDeParite,
} from "./diagnostic-parite.mjs";
import {
  resumeTerminalTokensManquants,
  sectionTokensManquants,
} from "./diagnostic-tokens.mjs";
import {
  diagnosticEchecsDeTests,
  resumeTerminalEchecsDeTests,
} from "./echecs-de-tests.mjs";
import { bilanEstBloquant, enteteDuVerdict } from "./verdict-bilan.mjs";
import {
  VERSION_CONTRAT_MAXIMALE,
  VERSION_CONTRAT_MINIMALE,
  avertissementsCorrigeables,
  champsInvalidesDuContrat,
  collecterReferences,
  erreursTypesTypographiques,
  indexerTokensDtcg,
  libelleNombre,
  referencesAbsentes,
  rendreDiagnostic,
  resumeTerminalAvertissements,
  sansEchantillon,
  sectionAvertissementsExport,
  trouverContrats,
  validerGrapheDesContrats,
  verdictDeVersion,
} from "@ucm-kit/core/lecteurs";
import {
  cheminDuComposant,
  composantPresent,
  ecartsDeParite,
  lireApiPublique,
  nomInterfaceAttendue,
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

// 1. Lire les tokens EUX-MÊMES, et non la sortie CSS qu'ils produisent.
// Le nom d'un token est son chemin, écrit à l'identique dans le contrat et dans
// `tokens.json` : les comparer ne demande aucune traduction. Passer par
// `tokens.css` en imposait une (`.` → `-`), et cette traduction diverge déjà —
// Figma publie `layouts.sizing.0,5`, Style Dictionary écrit
// `--layouts-sizing-0-5`, et la traduction cherchait `layouts-sizing-0,5`.
// Ce contrôle est le seul qui protège le design ; il ne dépend plus d'aucune
// chaîne d'outillage entre les tokens et lui.
const tokensPath = join(racine, SOURCE_TOKENS);
let tokensDtcg;
try {
  tokensDtcg = JSON.parse(readFileSync(tokensPath, "utf8").replace(/^﻿/, ""));
} catch (erreur) {
  // Absent et illisible ne se corrigent pas du même geste : le premier accuse
  // la génération, le second le fichier. Les confondre enverrait le designer
  // réparer un JSON qui n'existe pas.
  const absent = erreur?.code === "ENOENT";
  console.error(
    absent
      ? `✗ ${tokensPath} introuvable. Lancez d'abord « npm run tokens ».`
      : `✗ ${tokensPath} est illisible. Relancez l’export de tokens depuis Figma.`,
  );
  abandonner(
    absent ? `\`${SOURCE_TOKENS}\` est introuvable` : `\`${SOURCE_TOKENS}\` est illisible`,
    absent
      ? `Le fichier de tokens est absent du repository : aucune référence n'a pu être vérifiée. Si cette pull request modifie les tokens, relancez **Exporter les tokens** depuis Figma ; sinon, signalez-le à un développeur.`
      : "Le fichier de tokens n'est pas du JSON valide : il a sans doute été tronqué ou modifié à la main. Relancez **Exporter les tokens** depuis Figma plutôt que de le corriger.",
  );
}

// L'arbre ne change pas d'un contrat à l'autre : il s'indexe une fois.
const tokensExistants = indexerTokensDtcg(tokensDtcg);

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
      implementationNonLue: null,
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

  const version = contrat?.meta?.contractVersion;
  // On garde le SENS de l'écart, pas seulement son existence : c'est lui qui
  // dit à qui appartient le geste correctif.
  const verdict = verdictDeVersion(version);
  const versionIncompatible = verdict === "ok" ? null : { valeur: version, verdict };

  // **La version se juge AVANT les champs, et l'ordre inverse était un défaut.**
  //
  // Les validateurs de ce repo acceptent aujourd'hui les formes anciennes, si
  // bien que l'ordre ne se voyait pas. Il se verrait au premier élagage :
  // `champsInvalidesDuContrat` refuserait un contrat hors fenêtre pour ses
  // champs, `analyser` sortirait tôt, et le verdict de version serait perdu.
  // `enteteDuVerdict` écrirait alors « contrats invalides » — un titre qui
  // accuse le designer pour un contrat parfaitement formé dont seule la version
  // n'est pas lue. C'est le critère de réussite n° 4 du plan qui tombe : le
  // message doit dire QUI corrige.
  //
  // La condition n'est pas « la version est mauvaise » mais « la version est
  // LISIBLE et mauvaise ». Un fichier vidé de sa substance (`{}`, JSON
  // parfaitement valide) n'a pas une version trop ancienne : il n'en a pas, et
  // c'est un contrat cassé, pas un contrat périmé. Sans cette nuance, l'ordre
  // inversé remplacerait une accusation fausse par une autre.
  //
  // *Ce qu'on accepte de perdre, et le plan l'assume :* le diagnostic DÉTAILLÉ
  // d'un contrat hors fenêtre. Il reçoit un verdict de version qui nomme le bon
  // geste et le bon responsable, pas la liste de ses champs manquants — que ce
  // validateur-ci n'a de toute façon pas le droit de dresser pour une grammaire
  // qu'il ne lit pas.
  if (versionIncompatible && typeof version === "string" && version !== "") {
    return { ...vide, version: versionIncompatible };
  }

  // Le garde-fou vérifie ensuite qu'il a bien de quoi travailler. Sans ce
  // contrôle, un fichier vidé de sa substance (`{}`, JSON parfaitement valide)
  // passerait au vert : zéro référence citée, donc zéro référence manquante.
  const champsAbsents = champsInvalidesDuContrat(contrat);
  if (champsAbsents.length > 0) return { ...vide, champsAbsents };

  const composant = cheminDuComposant(chemin);
  // La présence se demande au disque, pas au relevé : c'est elle qui distingue
  // « pas encore écrit » de « écrit, mais illisible par cet adaptateur ».
  const parite = ecartsDeParite(
    contrat,
    apiPublique.get(composant),
    nomInterfaceAttendue(composant),
    { presente: composantPresent(chemin), chemin: basename(composant) },
  );

  // L'index qu'on audite ne se parcourt pas, sinon la comparaison se
  // vérifierait elle-même. Depuis la 11.0 il n'existe plus : le relevé du
  // contrat est alors la seule et unique source.
  const { tokensUsed: index, ...corps } = contrat;
  const citees = collecterReferences(sansEchantillon(corps));
  const indexees = new Set(
    Array.isArray(index) ? index.filter((ref) => typeof ref === "string") : [],
  );

  // L'existence se contrôle sur la RÉUNION des deux ensembles : tant qu'un
  // index existe, ni une référence qu'il oublie ni une entrée citée nulle part
  // ne doit échapper au contrôle.
  const toutes = new Set([...citees, ...indexees]);

  return {
    ...vide,
    version: versionIncompatible,
    // Ce que l'export a signalé. Le contrat le porte déjà ; il ne manquait
    // qu'un lecteur du côté de la CI.
    avertissements: avertissementsCorrigeables(contrat),
    parite,
    manquants: referencesAbsentes(toutes, tokensExistants),
    nonListes: Array.isArray(index)
      ? [...citees].filter((ref) => !indexees.has(ref)).sort()
      : [],
    fantomes: Array.isArray(index)
      ? [...indexees].filter((ref) => !citees.has(ref)).sort()
      : [],
    typesTypographiques: erreursTypesTypographiques(contrat, tokensDtcg),
    total: toutes.size,
  };
}

/** Contrats valides qui attendent encore leur première implémentation. */
function implementationsEnAttente(bilans) {
  return bilans.filter(
    (bilan) =>
      bilan.parite.implementationAbsente
      && !bilan.illisible
      && bilan.champsAbsents.length === 0
      && !bilan.version
      && bilan.graphe.length === 0
      && bilan.nonListes.length === 0
      && bilan.fantomes.length === 0,
  );
}

/** Ajoute au rapport l'état informatif des contrats encore sans implémentation. */
function ajouterImplementationsEnAttente(lignes, bilans) {
  const attentes = implementationsEnAttente(bilans);
  if (attentes.length === 0) return;

  lignes.push("", ...rendreDiagnostic({
    severity: "info",
    title: attentes.length === 1
      ? "Un composant n'a pas encore d'implémentation"
      : "Des composants n'ont pas encore d'implémentation",
    count: attentes.length,
    itemSingular: "composant",
    summary: "Ces contrats sont valides et peuvent être fusionnés avant leur implémentation :",
    items: attentes.map((bilan) => `\`${bilan.fichier}\``),
    status: "La conformité sera vérifiée dès que l'implémentation du composant sera ajoutée, et signalée sans bloquer.",
  }));
}


/** Rapport markdown destiné au designer : ce qui bloque, et quoi faire. */
function rapportMarkdown(bilans, fautifs, bilansDuRapport) {
  // Une PR de tokens peut rendre obsolète n'importe quel contrat : dans ce
  // cas, tous les écarts nouvellement visibles sont utiles. Dans une autre PR,
  // on limite cet avertissement aux contrats effectivement modifiés.
  const bilansTokensManquants = TOKENS_MODIFIES ? bilans : bilansDuRapport;

  // Un rapport vert alors que la pull request est refusée est pire que pas de
  // rapport du tout : le designer chercherait la panne ailleurs. Le verdict
  // couvre donc aussi ce que ce script n'a pas exécuté lui-même.
  if (fautifs.length === 0 && !echecsDeTests.echoue) {
    const tokens = bilans.reduce((somme, bilan) => somme + bilan.total, 0);
    const lignes = [
      "## ✅ Aucun blocage détecté",
      "",
      `${libelleNombre(bilans.length, "contrat")} et ${libelleNombre(tokens, "référence")} de token contrôlés. Les contrôles bloquants sont passés.`,
    ];
    lignes.push(...sectionTokensManquants(bilansTokensManquants, {
      tokensModifies: TOKENS_MODIFIES,
      sourceTokens: SOURCE_TOKENS,
    }));
    // Le verdict est exact, mais il ne porte que sur ce qui a été exporté. Une
    // propriété que l'export n'a pas pu décrire n'est citée par personne et ne
    // produit donc aucun écart : sans ce rappel, elle passerait sous un ✅.
    lignes.push(...sectionAvertissementsExport(bilansDuRapport));
    lignes.push(...sectionEcartsDeParite(bilansDuRapport));
    ajouterImplementationsEnAttente(lignes, bilansDuRapport);
    return lignes.join("\n");
  }

  // Le titre sépare les erreurs internes du contrat des échecs du repository,
  // et il ne dit que ce qui est LITTÉRALEMENT vrai : un contrat invalide est un
  // contrat illisible, incomplet, incompatible ou incohérent — jamais un code
  // en retard, jamais un test rouge ailleurs. `bilanEstBloquant` tient cette
  // définition et rien d'autre n'entre dans `fautifs` ; `enteteDuVerdict` en
  // tire le titre. Une référence absente des tokens et un écart de parité
  // n'entrent dans aucun des deux verdicts : leurs sections avertissent sans
  // laisser croire qu'elles retiennent la fusion.
  const avertissements = bilansDuRapport.flatMap((bilan) => bilan.avertissements);
  const contratBloquant = fautifs.length > 0;
  const lignes = enteteDuVerdict(fautifs, avertissements.length > 0);

  // La cause la plus probable se lit en premier, et une seule fois : les
  // diagnostics qui suivent y renvoient au lieu de recopier les mêmes
  // citations à chaque section.
  lignes.push(...sectionAvertissementsExport(bilansDuRapport, { bloquant: true }));
  lignes.push(...sectionTokensManquants(bilansTokensManquants, {
    tokensModifies: TOKENS_MODIFIES,
    sourceTokens: SOURCE_TOKENS,
  }));

  for (const bilan of fautifs) {
    if (bilan.illisible) {
      lignes.push(...rendreDiagnostic({
        severity: "error",
        title: `Le contrat n'est pas un fichier JSON valide : \`${bilan.fichier}\``,
        summary: "Le repository ne peut pas lire ce fichier.",
        action: "Réexportez le composant depuis Figma. Ne corrigez pas le fichier JSON à la main.",
        status: "La fusion reste bloquée.",
      }));
      continue;
    }
    if (bilan.champsAbsents.length > 0) {
      lignes.push(...rendreDiagnostic({
        severity: "error",
        title: `Le contrat est incomplet : \`${bilan.fichier}\``,
        summary: "Le fichier ne contient pas toutes les informations nécessaires.",
        detailsTitle: "Champs absents ou invalides",
        details: bilan.champsAbsents.map((champ) => `\`${champ}\``),
        action: "Réexportez le composant depuis Figma. Ne corrigez pas le fichier JSON à la main.",
        status: "La fusion reste bloquée.",
      }));
      continue;
    }
    if (bilan.version) {
      const recente = bilan.version.verdict === "recent";
      lignes.push(...rendreDiagnostic({
        severity: "error",
        title: `La version du contrat n'est pas prise en charge : \`${bilan.fichier}\``,
        summary: `Le contrat utilise le schéma ${bilan.version.valeur}. Le repository prend en charge les schémas ${VERSIONS_CONTRAT_SUPPORTEES}.`,
        action: recente
          ? "Un développeur doit auditer le nouveau schéma et adapter ce repository. Réexporter ne corrigera pas ce problème."
          : "Réexportez le composant avec la version actuelle du plugin.",
        status: "La fusion reste bloquée.",
      }));
    }
    if (bilan.graphe.length > 0) {
      lignes.push(...rendreDiagnostic({
        severity: "error",
        title: `La composition du contrat est incohérente : \`${bilan.fichier}\``,
        detailsTitle: "Écarts détectés",
        details: bilan.graphe,
        action: "Un développeur doit vérifier les contrats co-localisés, les slots composés et les cycles.",
        status: "La fusion reste bloquée.",
      }));
    }
    const ecarts = bilan.nonListes.length + bilan.fantomes.length;
    if (ecarts > 0) {
      lignes.push(...rendreDiagnostic({
        severity: "error",
        title: `L'index des tokens du contrat est incohérent : \`${bilan.fichier}\``,
        count: ecarts,
        itemSingular: "écart",
        detailsTitle: "Écarts détectés",
        details: [
          ...bilan.nonListes.map((token) => `\`${token}\` est utilisé mais absent de \`tokensUsed\`.`),
          ...bilan.fantomes.map((token) => `\`${token}\` est listé dans \`tokensUsed\` mais n'est pas utilisé.`),
        ],
        action: "Signalez ce défaut à un développeur du plugin. Réexporter sans corriger l'exporteur ne suffira pas.",
        status: "La fusion reste bloquée.",
      }));
    }
    if (bilan.typesTypographiques.length > 0) {
      lignes.push(...rendreDiagnostic({
        severity: "error",
        title: `Des tokens typographiques ont un type incompatible : \`${bilan.fichier}\``,
        count: bilan.typesTypographiques.length,
        itemSingular: "token",
        detailsTitle: "Écarts détectés",
        details: bilan.typesTypographiques.map(({ chemin, reference, attendu, recu }) =>
          `\`${chemin}\` utilise \`${reference}\` de type \`${recu}\`. Type attendu : \`${attendu}\`.`),
        action: "Un développeur doit corriger l'exporteur, puis un designer doit réexporter les tokens depuis Figma.",
        status: "La fusion reste bloquée.",
      }));
    }
  }

  // Les deux diagnostics reçoivent ce que l'export a signalé, mot pour mot :
  // ni l'un ni l'autre ne conclut à sa place, mais aucun ne peut plus disculper
  // Figma sans l'avoir consulté.
  lignes.push(...diagnosticEchecsDeTests(echecsDeTests, avertissements));

  lignes.push(...sectionEcartsDeParite(bilansDuRapport));
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
// La lambda n'est pas décorative : `map` passe l'index en second argument, et
// `cheminDuComposant` accepte désormais un motif à cette place (T2.3). Le
// raccourci `map(cheminDuComposant)` faisait donc résoudre un motif valant `0`.
const apiPublique = lireApiPublique(contrats.map((chemin) => cheminDuComposant(chemin)), racine);
const bilans = contrats.map((chemin) =>
  analyser(chemin, apiPublique, erreursGraphe.get(chemin) ?? []),
);
const fautifs = bilans.filter(bilanEstBloquant);

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
        ? `✗ ${bilan.fichier} : contrat en ${bilan.version.valeur}. Ce repository lit les schémas ${VERSIONS_CONTRAT_SUPPORTEES}. Un développeur doit adapter les lecteurs ; réexporter n'y changera rien.`
        : `✗ ${bilan.fichier} : contrat en ${bilan.version.valeur}. Ce repository lit les schémas ${VERSIONS_CONTRAT_SUPPORTEES}. Réexportez le composant depuis Figma.`,
    );
  }
  for (const token of bilan.manquants) {
    console.warn(`⚠ ${bilan.fichier} : référence absente de la source de tokens → ${token}`);
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
  // Le terminal marque la parité en ⚠ et non en ✗ : le rapport ne la compte
  // pas parmi les contrats fautifs, et deux symboles contradictoires pour le
  // même constat feraient chercher un blocage qui n'existe pas.
  if (bilan.parite.interfaceAbsente) {
    console.warn(`⚠ ${bilan.fichier} : interface ${bilan.parite.interfaceAbsente} introuvable dans le composant`);
  }
  if (bilan.parite.fonctionAbsente) {
    console.warn(
      `⚠ ${bilan.fichier} : fonction du composant ${bilan.parite.fonctionAbsente} introuvable → nommez-la comme le fichier, ou exportez-la par défaut`,
    );
  }
  for (const prop of bilan.parite.manquantes) {
    console.warn(`⚠ ${bilan.fichier} : prop du contrat absente du composant → ${prop}`);
  }
  for (const { prop, attendu, recu } of bilan.parite.typesIncorrects) {
    console.warn(
      `⚠ ${bilan.fichier} : type de prop incompatible → ${prop} doit être ${attendu}, reçu ${recu}`,
    );
  }
  for (const prop of bilan.parite.booleensNonUtilises) {
    console.warn(
      `⚠ ${bilan.fichier} : prop BOOLEAN déclarée mais non utilisée par le composant → ${prop}`,
    );
  }
  for (const { component, attendu, rendu } of bilan.parite.compositionsIncorrectes) {
    console.warn(
      `⚠ ${bilan.fichier} : cardinalité de composition incorrecte → ${component}, attendu ${attendu}, rendu ${rendu}`,
    );
  }
  const ecartDeParite = aUnEcartDeParite(bilan);
  const tokensValides = bilan.nonListes.length + bilan.fantomes.length === 0
    && bilan.typesTypographiques.length === 0;
  // La validité porte sur le CONTRAT. Un code en retard n'invalide pas le
  // fichier qu'il devrait suivre : il se lit dans `etatDuCode`, juste après.
  const contratValide = tokensValides
    && bilan.graphe.length === 0
    && !bilan.version;
  const aAvertir = bilan.manquants.length > 0 || ecartDeParite;
  const marque = contratValide ? (aAvertir ? "⚠" : "✓") : "✗";
  const etatDuCode = bilan.parite.implementationAbsente
    ? "implémentation en attente (autorisé)"
    // Ne jamais dire « conforme » de ce qu'on n'a pas lu : c'est la moitié du
    // défaut que T2.3 corrige. Le fichier est là, l'adaptateur n'en a rien tiré.
    : bilan.parite.implementationNonLue
      ? `implémentation présente, non lue par l'adaptateur (${bilan.parite.implementationNonLue})`
      : ecartDeParite
        ? "code en écart"
        : "code conforme";
  console.log(`${marque} ${bilan.fichier} : ${libelleNombre(bilan.total, "référence")} contrôlée${bilan.total === 1 ? "" : "s"}, ${etatDuCode} (${bilan.relatif})`);
}

// La validation reste globale. Seuls les états informatifs sont limités aux
// contrats de la PR afin qu'un export ne parle pas d'un autre composant.
const bilansDuRapport = selectionnerBilansDuRapport(
  bilans,
  process.env.UCM_CONTRATS_MODIFIES,
);
publier(rapportMarkdown(bilans, fautifs, bilansDuRapport));

if (fautifs.length > 0) {
  // Chaque cause a son geste correctif : on n'affiche que ceux qui s'appliquent.
  console.error(`\n✗ ${libelleNombre(fautifs.length, "contrat")} en défaut.`);
  if (fautifs.some((bilan) => bilan.illisible || bilan.champsAbsents.length > 0)) {
    console.error('  JSON illisible ou incomplet : ré-exportez le composant depuis Figma.');
  }
  if (fautifs.some((bilan) => bilan.nonListes.length + bilan.fantomes.length > 0)) {
    console.error("  Écart avec tokensUsed : signalez ce défaut de l'exporteur à un développeur du plugin.");
  }
  if (fautifs.some((bilan) => bilan.typesTypographiques.length > 0)) {
    console.error("  Types typographiques incompatibles : corrigez l’exporteur, puis réexportez les tokens depuis Figma ; ne retouchez pas les contrats ni le code.");
  }
  if (fautifs.some((bilan) => bilan.graphe.length > 0)) {
    console.error(
      "  Graphe de composition incohérent : ajoutez les contrats cibles, alignez les slots et supprimez les cycles.",
    );
  }
}

// L'écart contrat ↔ code se rappelle à part, sous son propre verdict : il
// n'entre pas dans le compte des contrats fautifs et ne refuse rien.
const resumeParite = resumeTerminalEcartsDeParite(bilans);
if (resumeParite) console.warn(`\n${resumeParite}`);

// Les tests ont déjà affiché leur propre sortie ; ce rappel sert à ce que le
// dernier mot du terminal dise la même chose que le rapport publié.
for (const ligne of resumeTerminalEchecsDeTests(echecsDeTests)) console.error(ligne);

// Le terminal dit la même chose que le rapport : un point non décrit ne refuse
// pas la pull request, mais il ne doit pas non plus disparaître du fil.
const resumeAvertissements = resumeTerminalAvertissements(bilansDuRapport);
if (resumeAvertissements) console.error(`\n${resumeAvertissements}`);
const resumeTokensManquants = resumeTerminalTokensManquants(bilans, SOURCE_TOKENS);
if (resumeTokensManquants) console.warn(`\n${resumeTokensManquants}`);

// Le rapport porte le verdict complet : ce script sort donc en erreur pour ce
// qu'il a relayé comme pour ce qu'il a constaté, sans quoi la chaîne pourrait
// finir au vert avec un rapport rouge.
if (fautifs.length > 0 || echecsDeTests.echoue) process.exit(1);

console.log(
  "\n✓ Contrats valides." +
    " Les références absentes et les écarts contrat ↔ code éventuels ont été signalés sans bloquer.",
);

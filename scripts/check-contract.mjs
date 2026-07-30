/**
 * Garde-fou « contrat ↔ tokens » (cf. UCM-Exporter/ROADMAP.md, Phase C1).
 *
 * Vérifie trois propriétés d'un contrat, sans jamais le croire sur parole :
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
 *
 * Le même diagnostic est écrit pour deux lecteurs très différents : le
 * terminal pour un développeur, et un rapport markdown pour le **designer**,
 * qui valide les pull requests d'export sans jamais ouvrir un log de CI
 * (cf. .github/workflows/ci.yml).
 *
 * Lancer après `npm run tokens` (fait par le script `npm run check`).
 * Sort en erreur (code 1) si un contrat est fautif : utilisable tel quel en CI.
 */
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { selectionnerBilansDuRapport } from "./perimetre-rapport.mjs";
import { VERSION_CONTRAT_MINIMALE, verdictDeVersion } from "./version-contrat.mjs";
import { trouverContrats } from "./trouver-contrats.mjs";
import {
  cheminDuComposant,
  ecartsDeParite,
  lireApiPublique,
  nomInterfaceAttendue,
  pariteBloquante,
} from "./parite.mjs";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_TOKENS = "src/tokens/tokens.json";

// 1. Extraire les noms de variables CSS générées (`--nom:`), sans le `--`.
// La classe est définie par exclusion (tout sauf les délimiteurs CSS) plutôt
// que par une liste de caractères permis : un nom de token accentué
// (`--couleurs-été`) doit être reconnu, sinon il paraîtrait absent du design
// system alors qu'il est bien généré.
const cssPath = join(racine, "src/generated/tokens.css");
let css;
try {
  css = readFileSync(cssPath, "utf8");
} catch {
  console.error(
    `✗ ${cssPath} introuvable. Lancez d'abord « npm run tokens ».`,
  );
  process.exit(1);
}
const varsGenerees = new Set(
  [...css.matchAll(/--([^\s:;{}()]+)\s*:/g)].map((m) => m[1]),
);

/**
 * Forme d'une référence de token : la chaîne ENTIÈRE est entre accolades et
 * contient au moins un point séparateur, sans espace ni accolade interne.
 * C'est ce qui distingue `{components.button.sizes.medium.gap}` du texte écrit
 * par le designer dans `intent` ou dans une description de valeur : une phrase
 * contient des espaces, et une note comme `{à définir}` n'a pas de point.
 */
const REFERENCE = /^\{[^{}\s]+\.[^{}\s]+\}$/;

/** Nom de variable CSS attendu pour une référence `{chemin.du.token}`. */
function nomVariable(reference) {
  return reference.replace(/^\{(.*)\}$/, "$1").replaceAll(".", "-");
}

/**
 * Ramasse toute référence de token présente dans une valeur, à profondeur
 * quelconque. Aucune connaissance du schéma du contrat n'est nécessaire : un
 * champ ajouté plus tard (`composes`…) est couvert sans toucher à ce script.
 */
function collecterReferences(valeur, trouvees = new Set()) {
  if (typeof valeur === "string") {
    if (REFERENCE.test(valeur)) trouvees.add(valeur);
  } else if (Array.isArray(valeur)) {
    for (const item of valeur) collecterReferences(item, trouvees);
  } else if (valeur && typeof valeur === "object") {
    for (const item of Object.values(valeur)) collecterReferences(item, trouvees);
  }
  return trouvees;
}

/**
 * Champs sans lesquels un contrat ne décrit aucun composant utilisable. On ne
 * valide pas le schéma entier — un JSON Schema viendra (cf. ROADMAP) : on
 * vérifie ce dont un consommateur a besoin pour exister, afin qu'un fichier
 * vidé de sa substance échoue ici, avec un diagnostic, plutôt qu'au build.
 */
const CHAMPS_REQUIS = [
  ["name", (valeur) => typeof valeur === "string" && valeur.trim() !== ""],
  ["meta.contractVersion", (valeur) => typeof valeur === "string" && valeur !== ""],
  ["props", (valeur) => Boolean(valeur) && typeof valeur === "object" && !Array.isArray(valeur)],
  ["structure", (valeur) => Boolean(valeur) && typeof valeur === "object" && !Array.isArray(valeur)],
  ["structure.children", (valeur) => Array.isArray(valeur)],
  ["tokensUsed", (valeur) => Array.isArray(valeur)],
];

/** Lit un chemin pointé sans lever sur un maillon absent. */
function lire(objet, chemin) {
  return chemin.split(".").reduce((valeur, cle) => (valeur == null ? undefined : valeur[cle]), objet);
}

/**
 * Analyse un contrat sans jamais lever : un fichier illisible est un
 * diagnostic à afficher, pas un plantage du garde-fou (une stack trace Node
 * n'aide personne, et surtout pas la personne qui a produit l'export).
 */
function analyser(chemin, apiPublique) {
  const fichier = basename(chemin);
  const relatif = chemin.replace(racine, ".");
  const vide = {
    fichier, relatif, illisible: false, champsAbsents: [], version: null,
    manquants: [], nonListes: [], fantomes: [], total: 0,
    parite: {
      implementationAbsente: false,
      interfaceAbsente: null,
      manquantes: [],
      typesIncorrects: [],
      booleensNonUtilises: [],
      compositionsAbsentes: [],
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
  const champsAbsents = CHAMPS_REQUIS
    .filter(([nom, valide]) => !valide(lire(contrat, nom)))
    .map(([nom]) => nom);
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
    parite,
    manquants: [...toutes].filter((ref) => !varsGenerees.has(nomVariable(ref))).sort(),
    nonListes: [...citees].filter((ref) => !indexees.has(ref)).sort(),
    fantomes: [...indexees].filter((ref) => !citees.has(ref)).sort(),
    total: toutes.size,
  };
}

/** Vrai si une implémentation existante porte un écart contrat ↔ code. */
function aUnEcartDeParite(bilan) {
  return pariteBloquante(bilan.parite);
}

/** Contrats valides qui attendent encore leur première implémentation React. */
function implementationsEnAttente(bilans) {
  return bilans.filter((bilan) => bilan.parite.implementationAbsente);
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

/** Rapport markdown destiné au designer : ce qui bloque, et quoi faire. */
function rapportMarkdown(bilans, fautifs, bilansDuRapport) {
  if (fautifs.length === 0) {
    const tokens = bilans.reduce((somme, bilan) => somme + bilan.total, 0);
    const lignes = [
      "## ✅ Contrats et tokens cohérents",
      "",
      `${bilans.length} contrat(s) vérifié(s), ${tokens} références de tokens : toutes existent dans \`${SOURCE_TOKENS}\`.`,
    ];
    ajouterImplementationsEnAttente(lignes, bilansDuRapport);
    return lignes.join("\n");
  }

  const lignes = ["## ❌ Cet export ne peut pas être fusionné en l'état", ""];

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
        `### \`${bilan.fichier}\` a été exporté par une version trop ancienne du plugin`,
        "",
        bilan.version.verdict === "recent"
          ? `Contrat en **${bilan.version.valeur}**, alors que ce repo consomme le schéma **${VERSION_CONTRAT_MINIMALE}**. L'export vient d'un plugin en avance sur ce repository : ré-exporter n'y changera rien, c'est le code du playground qui doit rattraper. Signalez-le à un développeur.`
          : `Contrat en **${bilan.version.valeur}**, ce repo attend au moins **${VERSION_CONTRAT_MINIMALE}**. Des informations dont le code a besoin peuvent manquer : le composant se compile, mais certaines props restent sans effet.`,
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
    if (aUnEcartDeParite(bilan)) {
      lignes.push(`### \`${bilan.fichier}\` : le code ne suit pas le contrat`, "");
      if (bilan.parite.interfaceAbsente) {
        lignes.push(
          `Le composant n'expose pas d'interface \`${bilan.parite.interfaceAbsente}\` : son API publique est illisible.`,
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
          ...bilan.parite.compositionsAbsentes.map(
            (composant) => `- le contrat déclare embarquer \`${composant}\`, mais le composant ne le rend jamais`,
          ),
          "",
        );
      }
    }
  }

  lignes.push("### Que faire ?", "");
  if (fautifs.some((bilan) => bilan.manquants.length > 0)) {
    lignes.push(
      `Ces tokens sont absents de \`${SOURCE_TOKENS}\`. C'est le signe habituel qu'un token a été **renommé, déplacé ou ajouté dans Figma** sans que les tokens du repository aient suivi.`,
      "",
      "1. dans Figma, lancez **Exporter les tokens** avec Unified Component Exporter ;",
      "2. validez la pull request qu'il ouvre : elle met `tokens.json` à jour ;",
      "3. cette vérification repassera alors au vert toute seule.",
      "",
    );
  }
  if (fautifs.some((bilan) => bilan.illisible || bilan.champsAbsents.length > 0 || bilan.version?.verdict === "ancien")) {
    lignes.push(
      "Pour un fichier illisible, incomplet ou trop ancien, ré-exportez le composant depuis Figma plutôt que de corriger le JSON à la main. Le design n'a pas besoin d'avoir changé : c'est le plugin qui a évolué.",
      "",
    );
  }
  if (fautifs.some((bilan) => bilan.nonListes.length + bilan.fantomes.length > 0)) {
    lignes.push(
      "L'écart avec `tokensUsed` **ne vient pas du design** : le contrat se contredit lui-même, ce qui signale un défaut de l'exporteur. Ré-exporter ne suffira pas — signalez-le à un développeur du plugin.",
      "",
    );
  }
  if (fautifs.some(aUnEcartDeParite)) {
    lignes.push(
      "L'écart entre le contrat et le code **ne vient pas du design non plus** : le design a évolué, le composant React doit suivre. Ré-exporter n'y changera rien — c'est à un développeur d'ajouter les props manquantes, de corriger leur type ou de relier les BOOLEAN au comportement dans la même pull request.",
      "",
    );
  }
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

const contrats = trouverContrats(join(racine, "src"));
// L'API publique de tous les composants est relevée d'un coup, avant l'analyse :
// un seul programme TypeScript pour l'ensemble du repo (cf. parite.mjs).
const apiPublique = lireApiPublique(contrats.map(cheminDuComposant), racine);

const bilans = contrats.map((chemin) => analyser(chemin, apiPublique));
const fautifs = bilans.filter(
  (bilan) =>
    bilan.illisible ||
    bilan.champsAbsents.length > 0 ||
    Boolean(bilan.version) ||
    bilan.manquants.length > 0 ||
    bilan.nonListes.length + bilan.fantomes.length > 0 ||
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
        ? `✗ ${bilan.fichier} : contrat en ${bilan.version.valeur}, ce repo consomme le schéma ${VERSION_CONTRAT_MINIMALE} — c'est le playground qui doit rattraper`
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
  if (bilan.parite.interfaceAbsente) {
    console.error(`✗ ${bilan.fichier} : interface ${bilan.parite.interfaceAbsente} introuvable dans le composant`);
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
  for (const composant of bilan.parite.compositionsAbsentes) {
    console.error(
      `✗ ${bilan.fichier} : dépendance déclarée dans composes mais jamais rendue → ${composant}`,
    );
  }
  const ecartDeParite = aUnEcartDeParite(bilan);
  const tokensSains = bilan.manquants.length + bilan.nonListes.length + bilan.fantomes.length === 0;
  const marque = tokensSains && !ecartDeParite && !bilan.version ? "✓" : "✗";
  const etatDuCode = bilan.parite.implementationAbsente
    ? "implémentation .tsx en attente (autorisé)"
    : ecartDeParite
      ? "code en écart"
      : "code conforme";
  console.log(`${marque} ${bilan.fichier} : ${bilan.total} tokens vérifiés, ${etatDuCode} (${bilan.relatif})`);
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
  console.error(`\n✗ ${fautifs.length} contrat(s) en défaut.`);
  if (fautifs.some((bilan) => bilan.manquants.length > 0)) {
    console.error(
      `  Tokens absents de ${SOURCE_TOKENS} : ré-exportez les tokens depuis Figma` +
        ` (« Exporter les tokens »), puis relancez « npm run check ».`,
    );
  }
  if (fautifs.some((bilan) => bilan.illisible || bilan.champsAbsents.length > 0)) {
    console.error('  JSON illisible ou incomplet : ré-exportez le composant depuis Figma.');
  }
  if (fautifs.some((bilan) => bilan.nonListes.length + bilan.fantomes.length > 0)) {
    console.error('  Écart avec tokensUsed : défaut de l’exporteur, pas du design — à signaler à un développeur du plugin.');
  }
  if (fautifs.some(aUnEcartDeParite)) {
    console.error('  Écart contrat ↔ code : le design a évolué, le composant doit suivre — à implémenter par un développeur.');
  }
  if (fautifs.some((bilan) => bilan.parite.compositionsAbsentes.length > 0)) {
    console.error('  Dépendance déclarée mais non rendue : le composé doit utiliser le composant embarqué, pas le redessiner.');
  }
  process.exit(1);
}
console.log("\n✓ Tokens existants ; parité conforme pour les composants déjà implémentés.");

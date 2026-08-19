import { TITRE_AVERTISSEMENTS } from "./avertissements-export.mjs";
import { libelleNombre, rendreDiagnostic } from "./diagnostic-markdown.mjs";

/**
 * Ce qui a échoué dans la suite de tests, et ce que le designer doit en lire.
 *
 * Les tests pilotés par le contrat (`src/**\/*.test.tsx`) sont un garde-fou au
 * même titre que les contrôles de `check-contract`. Une assertion rouge peut
 * signaler une donnée du contrat figée dans le code ; une erreur d'exécution
 * dit seulement que le test n'a pas pu rendre ce verdict. Les deux doivent
 * atteindre le **même** lecteur, avec des formulations distinctes.
 *
 * Ce module est l'unique autorité sur deux choses : relever les échecs dans la
 * sortie TAP du lanceur, et les formuler pour le rapport. Le lanceur
 * (`run-tests.mjs`) exécute, l'orchestrateur (`check.mjs`) transmet,
 * `check-contract.mjs` publie ; aucun d'eux ne réinterprète un échec.
 */

/** Chemin repo-relatif, en séparateurs `/`, pour un chemin absolu de TAP. */
function cheminRelatif(absolu, racine) {
  // TAP échappe les antislashs Windows dans ses chaînes YAML (`C:\\Users`).
  const chemin = absolu.replaceAll("\\\\", "\\").replaceAll("\\", "/");
  const base = racine.replaceAll("\\", "/").replace(/\/$/, "");
  return chemin.startsWith(`${base}/`) ? chemin.slice(base.length + 1) : chemin;
}

/** Lit les scalaires simples que le reporter TAP écrit entre guillemets. */
function valeurTap(source) {
  if (source.startsWith('"')) {
    try {
      return JSON.parse(source);
    } catch {
      return source;
    }
  }
  if (source.startsWith("'") && source.endsWith("'")) {
    return source.slice(1, -1).replaceAll("''", "'");
  }
  return source;
}

/**
 * Relève les tests en échec dans une sortie TAP.
 *
 * Un `not ok` dont l'échec est `subtestsFailed` n'est pas relevé : il agrège
 * des sous-tests déjà relevés, et le rapport nommerait deux fois le même
 * problème. Le champ `location` fait foi sur le fichier — un test peut être
 * imbriqué, et l'indentation TAP ne dit alors pas d'où il vient.
 */
export function echecsDuTap(tap, racine) {
  const lignes = tap.split(/\r?\n/);
  const echecs = [];

  for (let i = 0; i < lignes.length; i += 1) {
    const entete = lignes[i].match(/^(\s*)not ok \d+ - (.*)$/);
    if (!entete) continue;

    const [, indentation, nom] = entete;
    let fichier = null;
    let agregat = false;
    let erreur;
    let nomErreur;

    // Le bloc YAML qui suit décrit l'échec ; il est indenté de deux espaces de
    // plus que son `not ok` et se referme sur `...`.
    for (let j = i + 1; j < lignes.length; j += 1) {
      const ligne = lignes[j];
      if (!ligne.startsWith(`${indentation}  `)) break;
      if (ligne.trim() === "...") break;
      const emplacement = ligne.match(/^\s*location: '(.*):\d+:\d+'$/);
      if (emplacement) fichier = cheminRelatif(emplacement[1], racine);
      if (/^\s*failureType: 'subtestsFailed'$/.test(ligne)) agregat = true;
      const message = ligne.match(/^\s*error: (.*)$/);
      if (message) erreur = valeurTap(message[1]);
      const type = ligne.match(/^\s*name: (.*)$/);
      if (type) nomErreur = valeurTap(type[1]);
    }

    if (!agregat) {
      const echec = { fichier, test: nom.trim() };
      if (erreur) echec.erreur = erreur;
      if (nomErreur) echec.nomErreur = nomErreur;
      echecs.push(echec);
    }
  }

  return echecs;
}

/** Nom du composant dont un test de rendu dépend, d'après sa co-localisation. */
function composantTeste(fichier) {
  return fichier?.match(/([^/]+)\.test\.tsx$/)?.[1] ?? null;
}

/**
 * Sépare ce qui concerne un composant exporté de ce qui concerne l'outillage.
 *
 * Le propriétaire du constat n'est pas le même : une assertion d'un test de
 * rendu compare le code au contrat, une erreur dans ce test empêche la
 * comparaison, et l'échec d'un test de `scripts/` concerne l'outillage.
 */
export function repartirEchecs(echecs) {
  return {
    rendu: echecs.filter(({ fichier, nomErreur }) =>
      composantTeste(fichier) !== null && (!nomErreur || nomErreur === "AssertionError")),
    testsComposants: echecs.filter(({ fichier, nomErreur }) =>
      composantTeste(fichier) !== null && nomErreur && nomErreur !== "AssertionError"),
    gardeFous: echecs.filter(({ fichier }) => composantTeste(fichier) === null),
  };
}

/** Écart de rendu présenté par composant, sans chemin technique. */
function detailEchecRendu({ fichier, test }) {
  return `**${composantTeste(fichier)}** : ${test}`;
}

/** Erreur technique présentée par composant. */
function detailErreurTest({ fichier, test, nomErreur, erreur }) {
  const detail = nomErreur ? `${nomErreur}${erreur ? ` : ${erreur}` : ""}` : "erreur inconnue";
  return `**${composantTeste(fichier)}** : ${test}. ${detail}`;
}

/**
 * Section du rapport de pull request pour les tests en échec.
 *
 * Le designer lit d'abord un verdict, puis le détail technique nommé par
 * composant, pour le développeur qui reprendra le code dans la même pull
 * request.
 *
 * Ce verdict affirmait « votre export est valide, ré-exporter n'y changera
 * rien ». C'est vrai tant que l'export a tout décrit — et faux sinon : une
 * propriété qu'il n'a pas pu décrire disparaît du contrat, les tests qui la
 * relisent échouent, et c'est bien un ré-export qui débloquera. Disculper
 * Figma est un constat que ce module ne peut pas produire seul ; il lui faut
 * `avertissements`, que l'export a écrits.
 *
 * Trois états, pas deux : une liste vide dit « l'export n'a rien signalé »,
 * et `null` dit « on n'a pas pu le vérifier » — c'est le cas des sorties
 * anticipées, qui publient avant d'avoir lu le moindre contrat. Les confondre
 * ferait disculper Figma sans l'avoir consulté.
 */
export function diagnosticEchecsDeTests({ echoue, echecs }, avertissements = null) {
  if (!echoue) return [];
  if (echecs.length === 0) {
    return rendreDiagnostic({
      severity: "error",
      title: "Les tests n'ont pas terminé",
      summary: "La suite s'est arrêtée avant de produire un résultat exploitable.",
      action: "Un développeur doit consulter les logs de la CI et corriger l'exécution des tests.",
      status: "La fusion reste bloquée.",
    });
  }

  const { rendu, testsComposants, gardeFous } = repartirEchecs(echecs);
  const lignes = [];

  if (rendu.length > 0) {
    const composants = [...new Set(rendu.map(({ fichier }) => composantTeste(fichier)))];
    const action = avertissements === null
      ? "Un développeur doit déterminer si l'écart vient d'une information absente du contrat ou du code, puis corriger la source concernée."
      : avertissements.length > 0
        ? [
          `Vérifiez les ${libelleNombre(avertissements.length, "avertissement")} dans la section « ${TITRE_AVERTISSEMENTS} ».`,
          "Si un avertissement concerne le même composant et la même propriété, corrigez ce point dans Figma puis réexportez. Sinon, un développeur doit mettre à jour le composant.",
        ]
        : [
          "Un développeur doit mettre à jour les composants concernés dans cette pull request.",
          "Réexporter depuis Figma ne corrigera pas ces écarts.",
        ];

    lignes.push(...rendreDiagnostic({
      severity: "error",
      title: "Le code n'est plus conforme aux contrats",
      count: composants.length,
      itemSingular: "composant",
      summary: "Les tests de conformité entre composants et contrats échouent pour :",
      items: composants,
      detailsTitle: "Écarts détectés",
      details: rendu.map(detailEchecRendu),
      action,
      status: "La fusion reste bloquée.",
    }));
  }

  if (testsComposants.length > 0) {
    const composants = [...new Set(testsComposants.map(({ fichier }) => composantTeste(fichier)))];
    lignes.push(...rendreDiagnostic({
      severity: "error",
      title: "Les tests n'ont pas pu vérifier la conformité",
      count: composants.length,
      itemSingular: "composant",
      summary: "Les tests se sont arrêtés avant de comparer le rendu aux contrats pour :",
      items: composants,
      detailsTitle: "Erreurs détectées",
      details: testsComposants.map(detailErreurTest),
      action: "Un développeur doit vérifier la lecture du contrat, puis corriger le test ou le code qui provoque l'erreur.",
      status: "La fusion reste bloquée tant que ces tests ne produisent pas de résultat.",
    }));
  }

  if (gardeFous.length > 0) {
    lignes.push(...rendreDiagnostic({
      severity: "error",
      title: gardeFous.length === 1
        ? "Un garde-fou du repository est en échec"
        : "Des garde-fous du repository sont en échec",
      count: gardeFous.length,
      itemSingular: "test",
      summary: "Ces tests contrôlent l'outillage du repository, pas l'export Figma.",
      detailsTitle: "Tests en échec",
      details: gardeFous.map(({ fichier, test }) => `\`${fichier ?? "?"}\` : ${test}`),
      action: "Un développeur du repository doit corriger ces contrôles.",
      status: "La fusion reste bloquée.",
    }));
  }

  return lignes;
}

/** Même constat, pour le terminal du développeur. */
export function resumeTerminalEchecsDeTests({ echoue, echecs }) {
  if (!echoue) return [];
  if (echecs.length === 0) {
    return ["✗ La suite de tests n'a pas terminé. Consultez la sortie ci-dessus."];
  }
  const { rendu, testsComposants } = repartirEchecs(echecs);
  const lignes = [
    ...echecs.map(({ fichier, test }) => `✗ ${fichier ?? "?"} : ${test}`),
    `\n✗ ${libelleNombre(echecs.length, "test")} en échec.`,
  ];
  if (rendu.length > 0) {
    lignes.push("  Assertions de rendu en échec : le composant React et le contrat ne correspondent plus.");
  }
  if (testsComposants.length > 0) {
    lignes.push("  Tests interrompus par une erreur : vérifier d'abord leur lecture du contrat avant de conclure sur le rendu.");
  }
  return lignes;
}

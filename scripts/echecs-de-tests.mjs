import { TITRE_AVERTISSEMENTS } from "./avertissements-export.mjs";

/**
 * Ce qui a échoué dans la suite de tests, et ce que le designer doit en lire.
 *
 * Les tests pilotés par le contrat (`src/**\/*.test.tsx`) sont un garde-fou au
 * même titre que les contrôles de `check-contract` : ils signalent une donnée
 * du contrat figée dans le code dès que le design change. Leur échec doit donc
 * atteindre le **même** lecteur, par le **même** rapport — sinon la pull
 * request d'export est refusée sans qu'aucun message n'explique pourquoi.
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

    // Le bloc YAML qui suit décrit l'échec ; il est indenté de deux espaces de
    // plus que son `not ok` et se referme sur `...`.
    for (let j = i + 1; j < lignes.length; j += 1) {
      const ligne = lignes[j];
      if (!ligne.startsWith(`${indentation}  `)) break;
      if (ligne.trim() === "...") break;
      const emplacement = ligne.match(/^\s*location: '(.*):\d+:\d+'$/);
      if (emplacement) fichier = cheminRelatif(emplacement[1], racine);
      if (/^\s*failureType: 'subtestsFailed'$/.test(ligne)) agregat = true;
    }

    if (!agregat) echecs.push({ fichier, test: nom.trim() });
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
 * Le propriétaire du constat n'est pas le même : l'échec d'un test de rendu
 * dit que le code ne suit plus le contrat qui vient d'être exporté ; l'échec
 * d'un test de `scripts/` dit que le garde-fou lui-même est cassé, ce dont le
 * designer n'est jamais responsable.
 */
export function repartirEchecs(echecs) {
  return {
    rendu: echecs.filter(({ fichier }) => composantTeste(fichier) !== null),
    gardeFous: echecs.filter(({ fichier }) => composantTeste(fichier) === null),
  };
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
    return [
      "### 🧪 La suite de tests s'est interrompue",
      "",
      "Les tests n'ont pas rendu de verdict exploitable : le lanceur s'est arrêté avant la fin. **Votre export n'est pas en cause** et ré-exporter n'y changerait rien — un développeur doit ouvrir les logs de la CI.",
      "",
    ];
  }

  const { rendu, gardeFous } = repartirEchecs(echecs);
  const lignes = [];

  if (rendu.length > 0) {
    const composants = [...new Set(rendu.map(({ fichier }) => composantTeste(fichier)))];
    lignes.push(
      `### 🧪 ${composants.join(", ")} : le code React ne suit plus le contrat`,
      "",
      "Votre export est arrivé. Ce sont les tests du composant — qui relisent son contrat à chaque exécution — qui échouent : ce que le contrat décrit et ce que le composant rend ont divergé.",
      "",
      ...rendu.map(({ fichier, test }) => `- \`${fichier}\` — ${test}`),
      "",
      ...(avertissements === null
        ? [
          "**Action attendue :** un développeur adapte le composant au contrat dans cette même pull request. La fusion est bloquée jusque-là, pour ne pas livrer un rendu fondé sur l'ancien design.",
          "",
        ]
        : avertissements.length > 0
          ? [
            `**Avant de conclure :** cet export a signalé ${avertissements.length} information(s) qu'il n'a pas pu décrire — voir « ${TITRE_AVERTISSEMENTS} » en tête de ce rapport. Une propriété non décrite manque au contrat, et un test qui la relit échoue pour cette seule raison. **Si c'est le cas ici, le geste est dans Figma** : corrigez ce point et réexportez. Sinon, le design a évolué et un développeur adapte le composant dans cette même pull request.`,
            "",
          ]
          : [
            "Cet export n'a signalé aucun point non décrit : le design a évolué, le composant React n'a pas encore suivi. **Ré-exporter depuis Figma n'y changera rien.**",
            "",
            "**Action attendue :** un développeur adapte le composant au nouveau contrat dans cette même pull request. La fusion est bloquée jusque-là, pour ne pas livrer un rendu fondé sur l'ancien design.",
            "",
          ]),
    );
  }

  if (gardeFous.length > 0) {
    lignes.push(
      "### 🔧 Un garde-fou du repository est en échec",
      "",
      "Ces tests contrôlent l'outillage, pas votre export. **Votre design n'est pas en cause.**",
      "",
      ...gardeFous.map(({ fichier, test }) => `- \`${fichier ?? "?"}\` — ${test}`),
      "",
      "**Action attendue :** un développeur du repository doit reprendre ces contrôles.",
      "",
    );
  }

  return lignes;
}

/** Même constat, pour le terminal du développeur. */
export function resumeTerminalEchecsDeTests({ echoue, echecs }) {
  if (!echoue) return [];
  if (echecs.length === 0) {
    return ["✗ Suite de tests interrompue avant son verdict — voir la sortie ci-dessus."];
  }
  return [
    ...echecs.map(({ fichier, test }) => `✗ ${fichier ?? "?"} : test en échec → ${test}`),
    `\n✗ ${echecs.length} test(s) en échec.`,
    "  Tests pilotés par le contrat : le design a évolué, le composant doit suivre — à implémenter par un développeur, sans ré-export.",
  ];
}

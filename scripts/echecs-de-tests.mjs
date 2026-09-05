/**
 * Ce qui a échoué dans la suite de tests de CE repository — un ADAPTATEUR.
 *
 * Là où un repo en a, les tests pilotés par le contrat (`src/**\/*.test.tsx`)
 * sont un garde-fou au même titre que les contrôles de contrat — ce dépôt-ci
 * n'en a aucun, par décision, et la fin de cet en-tête dit ce que cela coûte. Une assertion rouge peut signaler
 * une donnée du contrat figée dans le code ; une erreur d'exécution dit
 * seulement que le test n'a pas pu rendre ce verdict. Les deux doivent
 * atteindre le **même** lecteur, avec des formulations distinctes — et ces
 * formulations, elles, vivent dans le kit.
 *
 * **Ce module ne rédige plus rien, et c'est la coupure de T5.2.** Il sait deux
 * choses qu'aucun noyau ne peut savoir, parce qu'elles décrivent un lanceur et
 * une convention de repo : lire la sortie TAP de `node --test`, et dire quel
 * composant un fichier de test met en cause. Il rend ces réponses ; le kit
 * écrit le diagnostic. C'est la même coupure que T2.3 a faite pour la parité,
 * au même endroit et pour la même raison.
 *
 * La chaîne : le lanceur (`run-tests.mjs`) exécute, l'orchestrateur
 * (`check.mjs`) transmet, `check-contract.mjs` projette et publie. Aucun d'eux
 * ne réinterprète un échec.
 *
 * ## Ce que ce repository-ci ne peut pas dire, PAR DÉCISION
 *
 * **Il n'existe aucun `*.test.tsx` ici, et il n'en existera pas** :
 * `CONTRIBUTING.md` écrit « il n'existe pas de test propre à chaque composant
 * jetable », parce que les composants sont des sondes remplaçables et qu'un
 * test par sonde figerait ce qu'on veut pouvoir jeter. `composantTeste()` ne
 * reconnaît qu'un `*.test.tsx` : `composant` vaut donc `null` pour TOUS les
 * échecs de ce dépôt.
 *
 * **Conséquence, et il faut la lire dans `repartirEchecs` du kit** : le tri
 * range dans `rendu` et `testsComposants` ce qui a un `composant`, et dans
 * `gardeFous` ce qui n'en a pas. Ici, tout tombe dans `gardeFous`, et les deux
 * sections « Le code n'est plus conforme aux contrats » et « Les tests n'ont
 * pas pu vérifier la conformité » sont **structurellement inatteignables**.
 * Le rapport de ce dépôt ne les a jamais écrites et ne les écrira pas.
 *
 * **Pourquoi `composantTeste` reste quand même, et ne se supprime pas.** La
 * surface `{ composant, assertion }` est celle que `diagnostic-tests.mjs`
 * DEMANDE à un adaptateur, dans un paquet publié : un repo tiers qui a des
 * tests par composant s'en sert. La couper ferait mentir le kit sur ce qu'il
 * attend. Elle est couverte sur fixtures par `echecs-de-tests.test.mjs` —
 * « la projection répond « quel composant » et « le test a-t-il conclu » » et
 * « une AssertionError reste un verdict » —, qui lui donnent les `.test.tsx`
 * que le dépôt n'a pas. Un lecteur qui la croirait morte la supprimerait.
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
 * Projette les échecs relevés vers la forme que le rapport lit.
 *
 * **C'est la coupure de T5.2, et c'est la même que T2.3 avait faite pour la
 * parité.** Le rapport a besoin de deux réponses que seul un adaptateur peut
 * donner, parce qu'elles dépendent d'un lanceur et d'une convention de repo :
 *
 * - `composant` — quel composant exporté ce test met-il en cause ? Ici, la
 *   réponse est dans la co-localisation `X.test.tsx` à côté de `X.tsx`. Un
 *   repo Swift répondrait autrement, et le noyau ne peut répondre du tout.
 * - `assertion` — le test a-t-il RENDU un verdict, ou s'est-il interrompu
 *   avant de pouvoir le rendre ? Une assertion rouge compare le code au
 *   contrat ; une `AssertionError` est le nom que `node:assert` donne à ce
 *   cas, et `node:test` le nomme aussi quand un test échoue sans erreur. Les
 *   deux constats ont des lecteurs et des gestes correctifs différents.
 *
 * Le noyau reçoit les réponses, jamais les règles qui les produisent.
 */
export function pourLeRapport(echecs) {
  return echecs.map(({ fichier, test, nomErreur, erreur }) => ({
    fichier,
    composant: composantTeste(fichier),
    assertion: !nomErreur || nomErreur === "AssertionError",
    test,
    nomErreur,
    erreur,
  }));
}

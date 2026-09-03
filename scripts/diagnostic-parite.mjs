import { libelleNombre, rendreDiagnostic } from "./diagnostic-markdown.mjs";
import { pariteEnEcart } from "./parite.mjs";

/** Vrai si une implémentation existante porte un écart contrat ↔ code. */
export function aUnEcartDeParite(bilan) {
  return pariteEnEcart(bilan.parite);
}

/**
 * Avertit qu'un composant React s'écarte du contrat qu'il devrait suivre.
 *
 * **Avertissement, jamais blocage.** Cet écart n'accuse ni le contrat ni
 * l'export : il dit qu'un `.tsx` est en retard sur ce que le contrat décrit.
 * Le seul geste correctif appartient à un développeur, et réexporter depuis
 * Figma n'y changerait rien. Refuser la pull request reviendrait donc à
 * arrêter la personne qui ne peut pas la débloquer, pour l'état d'un fichier
 * qu'elle ne touche pas — et, dans ce repository, un composant régénéré à
 * froid EST attendu en écart tant que la mesure n'a pas été refaite.
 *
 * Le périmètre suit la même règle que les autres états informatifs : sur une
 * pull request, seuls les contrats qu'elle modifie parlent (cf.
 * `perimetre-rapport.mjs`), de sorte qu'un export de tokens ne mentionne aucun
 * composant. Sur `main` et en local, où le lecteur est un développeur, tous
 * les écarts restent affichés.
 */
export function sectionEcartsDeParite(bilans) {
  return bilans.filter(aUnEcartDeParite).flatMap((bilan) => [
    "",
    ...rendreDiagnostic({
      severity: "warning",
      title: `Le code React est en retard sur le contrat : \`${bilan.fichier}\``,
      summary: "Le contrat est valide. C'est le composant React qui ne le suit pas encore.",
      detailsTitle: "Écarts détectés",
      details: detailsDeLEcart(bilan.parite),
      action: bilan.parite.fonctionAbsente
        ? "Un développeur doit nommer la fonction comme le fichier ou l'exporter par défaut."
        : "Un développeur doit mettre à jour l'API ou le rendu du composant pour suivre le contrat.",
      status: "**Votre design n'est pas en cause** et réexporter depuis Figma n'y changerait rien. Cet écart n'empêche pas la fusion.",
    }),
  ]);
}

/**
 * Détaille l'écart, sans en accumuler les conséquences.
 *
 * Une interface ou une fonction absente rend tout le reste faux : chaque prop
 * paraîtrait manquante et chaque dépendance non rendue. Une seule cause exacte
 * vaut mieux qu'une liste d'accusations dérivées.
 */
function detailsDeLEcart(parite) {
  if (parite.interfaceAbsente) {
    return [`L'interface \`${parite.interfaceAbsente}\` est absente.`];
  }
  if (parite.fonctionAbsente) {
    return [`La fonction \`${parite.fonctionAbsente}\` est introuvable.`];
  }
  return [
    ...parite.manquantes.map((prop) => `La prop \`${prop}\` du contrat n'existe pas dans le composant.`),
    ...parite.typesIncorrects.map(
      ({ prop, attendu, recu }) =>
        `La prop \`${prop}\` doit être \`${attendu}\`, mais le composant expose \`${recu}\`.`,
    ),
    ...parite.booleensNonUtilises.map(
      (prop) => `La prop BOOLEAN \`${prop}\` existe mais n'est jamais lue par le composant.`,
    ),
    ...parite.compositionsIncorrectes.map(
      ({ component, attendu, rendu }) =>
        `Le contrat déclare ${libelleNombre(attendu, "occurrence")} de \`${component}\`, mais le composant en rend ${rendu}.`,
    ),
  ];
}

/**
 * Rappel terminal, sous son propre verdict : l'écart n'entre pas dans le
 * compte des contrats fautifs et ne refuse rien.
 */
export function resumeTerminalEcartsDeParite(bilans) {
  const concernes = bilans.filter(aUnEcartDeParite);
  return concernes.length === 0
    ? null
    : `⚠ ${libelleNombre(concernes.length, "composant")} en retard sur ${concernes.length === 1 ? "son" : "leur"} contrat.` +
      "\n  Un développeur doit mettre à jour l'API ou le rendu ; le TSX doit rendre exactement la cardinalité déclarée, ni moins ni plus." +
      "\n  Ne réexportez pas depuis Figma : le contrat est valide, et la fusion n'est pas bloquée.";
}

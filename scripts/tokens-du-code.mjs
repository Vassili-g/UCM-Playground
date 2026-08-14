/**
 * Garde-fou « tokens du code ↔ contrat ».
 *
 * Le code de production **n'interprète pas** le contrat : il est écrit contre
 * lui (`../UCM-Exporter/CONCEPT.md`, « Une information, un propriétaire »).
 * Un composant écrit donc ses références de tokens, et c'est le contrat qui
 * sert à vérifier que ce sont les bonnes.
 *
 * Cette vérification n'est possible qu'à une condition : les références
 * doivent être **énumérables**. Deux écarts en découlent.
 *
 * 1. **Référence construite.** Un chemin assemblé morceau par morceau —
 *    `` `{components.button.colors.${color}.${variant}}` `` — ne peut être
 *    comparé à rien : il faudrait exécuter le code pour savoir ce qu'il
 *    produit. Il fige aussi la convention de nommage du design system dans une
 *    fonction : le jour où une variante pointe vers un token nommé autrement,
 *    le composant fabrique un nom qui n'existe pas, et le navigateur ignore la
 *    variable sans rien dire.
 *
 * 2. **Référence absente du contrat.** Le composant emploie un token que son
 *    contrat ne déclare pas : soit le token a été renommé côté Figma, soit le
 *    composant peint quelque chose que le design ne décrit pas.
 *
 * Le sens inverse n'est pas un écart : un contrat déclare l'ensemble de sa
 * matrice, alors qu'un composant n'en rend qu'une partie à la fois.
 */
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import ts from "typescript";

import {
  DEBUT_DE_REFERENCE,
  REFERENCE,
  collecterReferences,
  voisinesDeclarees,
} from "./references-token.mjs";

/**
 * Seul fichier dispensé : celui qui DÉFINIT la traduction d'une référence en
 * variable CSS. Il doit pouvoir en citer une pour l'expliquer et refuser tout
 * le reste ; il ne style rien, il traduit.
 */
const PONT_DES_TOKENS = "tokens.ts";

/** Fichiers de code à contrôler, hors sources dérivées et hors tests. */
function fichiersDeCode(dossier, trouves = [], racine = dossier) {
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) {
      // `generated/` est dérivé du contrat : le contrôler reviendrait à
      // reprocher au consommateur ce que l'outil vient d'écrire pour lui.
      if (entree.name === "generated" || entree.name === "node_modules") continue;
      fichiersDeCode(chemin, trouves, racine);
      continue;
    }
    const extension = extname(entree.name);
    if (extension !== ".ts" && extension !== ".tsx") continue;
    // Un test cite des références pour construire ses attentes : c'est son objet.
    if (/\.test\.tsx?$/.test(entree.name)) continue;
    if (dossier === racine && entree.name === PONT_DES_TOKENS) continue;
    trouves.push(chemin);
  }
  return trouves;
}

/**
 * Relève les références d'un fichier de code, en séparant celles qui sont
 * vérifiables de celles qui ne le sont pas.
 *
 * On parcourt l'AST et non le texte : un chemin cité dans un COMMENTAIRE
 * explique le format, il ne style rien et ne doit pas être relevé.
 */
export function referencesDuCode(source, texte) {
  const fichier = ts.createSourceFile(source, texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const litterales = [];
  const construites = [];

  const ligneDe = (noeud) =>
    fichier.getLineAndCharacterOfPosition(noeud.getStart(fichier)).line + 1;

  const visiter = (noeud) => {
    const entier = ts.isStringLiteral(noeud) || ts.isNoSubstitutionTemplateLiteral(noeud);
    const morceau = ts.isTemplateHead(noeud) || ts.isTemplateMiddle(noeud) || ts.isTemplateTail(noeud);

    if (entier && REFERENCE.test(noeud.text)) {
      litterales.push({ ligne: ligneDe(noeud), reference: noeud.text });
    } else if ((entier || morceau) && DEBUT_DE_REFERENCE.test(noeud.text)) {
      // Une chaîne qui contient un début de chemin sans être une référence
      // complète est forcément assemblée avec autre chose.
      construites.push({ ligne: ligneDe(noeud), extrait: noeud.text.trim().slice(0, 60) });
    }
    ts.forEachChild(noeud, visiter);
  };
  visiter(fichier);

  return { litterales, construites };
}

/** Contrat co-localisé d'un fichier de composant, s'il existe. */
function contratCoLocalise(cheminFichier) {
  const composant = basename(cheminFichier, extname(cheminFichier));
  const chemin = join(dirname(cheminFichier), `${composant}.contract.json`);
  try {
    return JSON.parse(readFileSync(chemin, "utf8").replace(/^﻿/, ""));
  } catch {
    return null;
  }
}

/**
 * Compare les références de chaque fichier de code à celles de son contrat.
 * Renvoie un écart par fichier fautif, jamais une exception : un garde-fou
 * diagnostique, il ne plante pas.
 */
export function ecartsDeTokensDuCode(dossier) {
  return fichiersDeCode(dossier)
    .map((chemin) => {
      const { litterales, construites } = referencesDuCode(chemin, readFileSync(chemin, "utf8"));
      if (litterales.length === 0 && construites.length === 0) return null;

      const contrat = contratCoLocalise(chemin);
      // Sans contrat co-localisé, aucune référence n'est vérifiable : la citer
      // ici reviendrait à styler d'après une source que personne ne contrôle.
      if (!contrat) {
        return {
          chemin,
          construites,
          nonDeclarees: litterales,
          sansContrat: true,
        };
      }

      const declarees = collecterReferences(contrat);
      return {
        chemin,
        construites,
        // Chaque écart emporte son voisinage : le rapport pourra dire si le
        // groupe de la référence a disparu du contrat ou s'il y survit, privé
        // de cette seule valeur. C'est ici que les deux ensembles se croisent.
        nonDeclarees: litterales
          .filter(({ reference }) => !declarees.has(reference))
          .map((ecart) => ({ ...ecart, voisines: voisinesDeclarees(ecart.reference, declarees) })),
        sansContrat: false,
      };
    })
    .filter((ecart) => ecart && (ecart.construites.length > 0 || ecart.nonDeclarees.length > 0))
    .sort((gauche, droite) => gauche.chemin.localeCompare(droite.chemin));
}

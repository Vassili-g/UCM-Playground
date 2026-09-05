/**
 * « Épuré au maximum » n'est vérifiable par rien. Ce test le rend vérifiable.
 *
 * **Pourquoi il existe, et c'est un manque de la Phase 9 relevé par sa propre
 * revue.** Chaque autre phase du plan d'industrialisation s'est donné un
 * compteur : la duplication de la scission (`scissionSpec.test.mjs` de
 * l'exporteur), le plancher de renvois de `docLinks`, `versionSuitLeContenu`.
 * La Phase 9 n'avait qu'un paragraphe de prose disant l'intention. Une
 * intention périme comme les autres — c'est même exactement ce que la table des
 * contradictions du plan enregistre —, et sans compteur la prochaine passe de
 * ménage repose les mêmes questions à partir de zéro.
 *
 * **Ce qu'il mesure :** le total d'octets des documents `.md` de ce dépôt. Pas
 * un jugement de qualité, pas un nombre de lignes — des octets, que personne ne
 * peut discuter. Ce dépôt est le CONSOMMATEUR DE RÉFÉRENCE : ce qu'il porte en
 * propre doit être ce qu'il est seul à pouvoir dire, et tout le reste vit chez
 * le producteur, à un lien de distance.
 *
 * **Ce qu'il ne mesure PAS, et il faut le lire avant de croire un vert.** Il ne
 * dit jamais qu'un document est bon, ni qu'une règle n'a pas été perdue en
 * l'allégeant : seul `liens-documents.test.mjs` dit qu'un renvoi atteint encore
 * son autorité. Découper `AGENTS.md` en trois fichiers le laisserait vert. Il
 * dit une chose, faible et non discutable : *la documentation de ce dépôt ne
 * regrossit pas.*
 *
 * **Ce qui est exclu, et pourquoi seulement cela.** `.claude/skills/` porte la
 * procédure d'un test froid — un skill se charge depuis le dépôt où l'on
 * travaille, et une reconstruction à froid se fait ici : ces 439 lignes sont un
 * OUTIL de ce dépôt, pas sa documentation. Rien d'autre n'est exclu.
 * `.agents/skills/` reste compté alors qu'il n'est pas réductible d'ici — il
 * est comparé caractère par caractère avec la copie de l'exporteur — et c'est
 * délibéré : un plancher visible vaut mieux qu'une exclusion qui se justifie.
 *
 * **Durée de vie.** Il part le jour où la cible est atteinte, comme les tests
 * de scission partiront avec le temps 2 de T8.1. Un contrôle qui survit à sa
 * cause devient une information périmée.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Dossiers qui ne portent pas de documentation de ce dépôt. */
const IGNORES = ["node_modules", ".git", "dist", "generated"];

/** Documents comptés : tout `.md` du dépôt, hors `.claude/skills/`. */
function documents(dossier = racine, trouves = []) {
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    if (IGNORES.includes(entree.name)) continue;
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) {
      if (relative(racine, chemin).replaceAll("\\", "/") === ".claude/skills") continue;
      documents(chemin, trouves);
    } else if (entree.name.endsWith(".md")) {
      trouves.push(chemin);
    }
  }
  return trouves;
}

test("la surface documentaire de ce dépôt ne remonte pas", () => {
  const fichiers = documents();
  // Zéro document passerait sans rien contrôler : la faute qu'on empêche.
  assert.ok(fichiers.length > 0, "aucun document markdown trouvé");

  // Les fins de ligne ne comptent pas : ce poste extrait en CRLF, la CI en LF,
  // et un plafond qui dépendrait du poste serait un plafond qui ment.
  const octets = fichiers.reduce(
    (somme, f) => somme + Buffer.byteLength(readFileSync(f, "utf8").replaceAll("\r\n", "\n")),
    0,
  );

  // Le plafond est le relevé du jour où la Phase 9 s'est donné son compteur,
  // pas un objectif. Il n'autorise aucune remontée : T9.3, T9.5, T9.6 et T9.7
  // le descendent, et chaque commit qui allège un document le descend d'autant.
  const PLAFOND = 32_517;
  const detail = fichiers
    .map((f) => `  ${relative(racine, f).replaceAll("\\", "/")}`)
    .sort()
    .join("\n");

  assert.ok(
    octets <= PLAFOND,
    `La documentation de ce dépôt a regrossi : ${octets} octets, contre ${PLAFOND} `
      + `au plus. Ce qui décrit le FORMAT vit chez le producteur, à un lien de `
      + `distance ; ce qui décrit CE dépôt reste ici.\nDocuments comptés :\n${detail}`,
  );
  console.log(`Surface documentaire : ${octets} octets (plafond ${PLAFOND}).`);
});

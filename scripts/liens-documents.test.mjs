/**
 * Les liens entre documents remplacent des règles sinon recopiées. Un lien mort
 * rend donc une règle introuvable au lieu de la répéter.
 *
 * **Ce test existe parce que ce repository n'en avait aucun, et que la scission
 * de la spécification l'a prouvé le jour même.** `AGENTS.md` envoyait « pour les
 * règles du format » vers `../UCM-Exporter/UCM-EXPORTER-SPEC.md`, un fichier
 * partagé la veille en deux documents. L'exporteur, lui, a un contrôle de liens
 * et a routé ses propres renvois dans le commit de la scission ; ce
 * repository-ci n'a rien vu, parce que rien ne regardait.
 *
 * **La moitié qui compte est la seconde, et c'est ce qui distingue ce test de
 * celui de l'exporteur : ici, la plupart des renvois traversent un repository.**
 * Une bonne partie de la documentation de ce repo décrit un format dont
 * l'autorité vit à côté, dans `../UCM-Exporter`, et ces liens supposent deux
 * clones frères. La supposition n'était écrite nulle part et vérifiée nulle
 * part.
 *
 * **Le clone frère est donc EXIGÉ, pas contourné.** L'alternative — sauter les
 * liens croisés quand le voisin manque — rendrait ce test vert précisément dans
 * le cas qu'il existe pour couvrir. Un contrôle qui se lit vert sans rien
 * mesurer est le défaut que les deux repositories poursuivent partout ailleurs.
 * La CI cloner le voisin est ce qui rend la supposition réelle.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const VOISIN = resolve(racine, "..", "UCM-Exporter");

/** Documents markdown du dépôt, hors dépendances et hors sorties construites. */
function documents(dossier = racine, trouves = []) {
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "generated"].includes(entree.name)) continue;
    const chemin = join(dossier, entree.name);
    if (entree.isDirectory()) documents(chemin, trouves);
    else if (entree.name.endsWith(".md")) trouves.push(chemin);
  }
  return trouves;
}

/** Lignes hors blocs de code : un `#` dans du JSON n'est pas un titre. */
function lignesHorsCode(contenu) {
  let dansUnBloc = false;
  const gardees = [];
  for (const ligne of contenu.split(/\r?\n/)) {
    if (/^\s*```/.test(ligne)) {
      dansUnBloc = !dansUnBloc;
      continue;
    }
    if (!dansUnBloc) gardees.push(ligne);
  }
  return gardees;
}

/**
 * Ancre GitHub : minuscules, ponctuation retirée, espaces en tirets, accents
 * conservés. Un slug déjà pris reçoit son rang.
 */
function ancres(contenu) {
  const vues = new Map();
  const resultat = new Set();
  for (const ligne of lignesHorsCode(contenu)) {
    const titre = /^(#{1,6})\s+(.*?)\s*$/.exec(ligne);
    if (!titre) continue;
    const base = titre[2]
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s/g, "-");
    const rang = vues.get(base) ?? 0;
    vues.set(base, rang + 1);
    resultat.add(rang === 0 ? base : `${base}-${rang}`);
  }
  return resultat;
}

/** Liens markdown relatifs, hors blocs de code et hors URL externes. */
function liensRelatifs(contenu) {
  const trouves = [];
  for (const ligne of lignesHorsCode(contenu)) {
    for (const lien of ligne.matchAll(/\]\(([^)\s]+)\)/g)) {
      const cible = lien[1];
      if (/^[a-z]+:/i.test(cible) || cible.startsWith("//")) continue;
      trouves.push(cible);
    }
  }
  return trouves;
}

const ancresConnues = new Map();
function ancresDe(fichier) {
  if (!ancresConnues.has(fichier)) ancresConnues.set(fichier, ancres(readFileSync(fichier, "utf8")));
  return ancresConnues.get(fichier);
}

/** Vérifie une liste de liens et rend ceux qui ne résolvent pas. */
function morts(paires) {
  const casses = [];
  for (const { document, lien } of paires) {
    const [chemin, ancre] = lien.split("#");
    const cible = chemin === "" ? document : resolve(dirname(document), chemin);
    const depuis = relative(racine, document).replaceAll("\\", "/");

    if (!existsSync(cible)) {
      casses.push(`${depuis} → ${lien} (fichier absent)`);
      continue;
    }
    if (!ancre) continue;
    if (!cible.endsWith(".md")) {
      casses.push(`${depuis} → ${lien} (ancre sur un fichier non markdown)`);
      continue;
    }
    if (!ancresDe(cible).has(decodeURIComponent(ancre))) {
      casses.push(`${depuis} → ${lien} (ancre absente)`);
    }
  }
  return casses;
}

/** Tous les liens du dépôt, séparés selon qu'ils sortent ou non du repository. */
function liens() {
  const internes = [];
  const croises = [];
  for (const document of documents()) {
    for (const lien of liensRelatifs(readFileSync(document, "utf8"))) {
      const cible = resolve(dirname(document), lien.split("#")[0] || ".");
      (cible.startsWith(racine) ? internes : croises).push({ document, lien });
    }
  }
  return { internes, croises };
}

test("aucun lien interne ne pointe vers un fichier ou une ancre absente", () => {
  const { internes } = liens();
  // Zéro lien passerait sans rien contrôler : c'est la faute qu'on empêche.
  assert.ok(internes.length > 0, "aucun lien interne trouvé dans les documents");
  assert.deepEqual(morts(internes), [], "des liens internes sont morts");
});

test("les renvois vers l'exporteur atteignent le clone frère", () => {
  const { croises } = liens();
  assert.ok(croises.length > 0, "aucun renvoi vers l'exporteur trouvé");

  assert.ok(
    existsSync(VOISIN),
    `Ce repository porte ${croises.length} renvois vers \`../UCM-Exporter\`, et ce clone `
      + `frère est absent (${VOISIN}). Ces liens ne sont pas une commodité : ils portent les `
      + `règles du format, dont l'autorité vit là-bas. Cloner UCM-Exporter à côté de celui-ci, `
      + `ou ce contrôle ne peut rien dire — et un contrôle qui ne mesure rien se lit vert.`,
  );
  assert.deepEqual(morts(croises), [], "des renvois vers l'exporteur sont morts");
});

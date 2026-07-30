/**
 * Garde-fou « aucun chemin de token écrit en dur dans le code ».
 *
 * Pourquoi il existe. Les autres contrôles vérifient que le CONTRAT est
 * cohérent : ses références existent, son index les liste, ses props sont dans
 * le composant. Aucun ne vérifiait que le composant LIT ce contrat. Un
 * composant peut donc recopier les valeurs qu'il y a lues — chemins de tokens,
 * noms d'icônes, priorités d'états — et rester parfaitement vert : il rend
 * exactement la même chose, tant que le design ne bouge pas. Le jour où un
 * token est déplacé ou un rôle ajouté à un variant, le contrat change, le code
 * non, et rien ne le signale puisque le code ne cite plus le contrat.
 *
 * C'est le cas observé lors d'une reconstruction en contexte froid : les deux
 * composants avaient inliné toute leur matrice de tokens et passaient les
 * garde-fous au vert sans lire une seule fois leur `.contract.json`.
 *
 * Ce que la règle interdit. Toute chaîne du code source qui contient un chemin
 * de token — `"{components.alert.sizes.gap}"` aussi bien que le fragment
 * `` `{components.alert.colors.${severity}` `` d'un chemin reconstruit par
 * concaténation. Une référence ne peut alors venir que d'une lecture du
 * contrat, ce qui est précisément l'invariant « le nom du token EST son chemin,
 * et ce chemin vient du contrat ».
 *
 * Ce qu'elle n'interdit pas : les constantes de convention non tokenisées
 * (`ICON_GLYPH_RATIO`, `ICON_STYLE`), qui ne sont pas des chemins de tokens et
 * restent documentées comme dette assumée.
 */
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import ts from "typescript";

/**
 * Fragment de chemin de token : au moins deux segments pointés derrière une
 * accolade ouvrante. La forme complète `{a.b}` comme le début `{a.b.` d'une
 * concaténation correspondent — c'est la seconde qui attrape les chemins
 * reconstruits, les plus trompeurs puisqu'ils ont l'air dynamiques.
 */
const CHEMIN_DE_TOKEN = /\{[a-z0-9-]+(?:\.[a-z0-9-]+)+/i;

/**
 * Seul fichier dispensé du contrôle : celui qui DÉFINIT ce qu'est une
 * référence. `tokens.ts` doit pouvoir en citer une pour l'expliquer et pour
 * refuser tout le reste ; l'exempter n'ouvre aucune porte, puisqu'il ne style
 * rien — il traduit. Une exemption nommée vaut mieux qu'un contrôle textuel
 * qu'on contournerait sans le dire.
 */
const BRIDGE_DES_TOKENS = "tokens.ts";

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
    // Un test cite forcément des références : c'est son objet.
    if (/\.test\.tsx?$/.test(entree.name)) continue;
    if (dossier === racine && entree.name === BRIDGE_DES_TOKENS) continue;
    trouves.push(chemin);
  }
  return trouves;
}

/**
 * Relève les chemins de tokens écrits en dur dans un fichier.
 *
 * On parcourt l'AST et non le texte : un chemin cité dans un COMMENTAIRE (un
 * exemple d'usage, une explication) n'est pas du code et ne doit pas être
 * signalé. Seules les chaînes et les gabarits comptent.
 */
export function tokensEnDur(source, texte) {
  const fichier = ts.createSourceFile(source, texte, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const trouves = [];

  const visiter = (noeud) => {
    const litteral =
      ts.isStringLiteral(noeud)
      || ts.isNoSubstitutionTemplateLiteral(noeud)
      || ts.isTemplateHead(noeud)
      || ts.isTemplateMiddle(noeud)
      || ts.isTemplateTail(noeud);
    if (litteral && CHEMIN_DE_TOKEN.test(noeud.text)) {
      const { line } = fichier.getLineAndCharacterOfPosition(noeud.getStart(fichier));
      trouves.push({ ligne: line + 1, extrait: noeud.text.trim().slice(0, 60) });
    }
    ts.forEachChild(noeud, visiter);
  };
  visiter(fichier);

  return trouves;
}

/** Contrôle tout le code d'un dossier ; renvoie un écart par fichier fautif. */
export function ecartsDeTokensEnDur(dossier) {
  return fichiersDeCode(dossier)
    .map((chemin) => ({ chemin, occurrences: tokensEnDur(chemin, readFileSync(chemin, "utf8")) }))
    .filter(({ occurrences }) => occurrences.length > 0)
    .sort((gauche, droite) => gauche.chemin.localeCompare(droite.chemin));
}

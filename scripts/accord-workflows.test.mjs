/**
 * Les deux filets que ce dépôt et `ucm init` posent à la fin de leur CI
 * disent-ils encore la même chose ?
 *
 * **Deux workflows existent, et c'est délibéré.** Ce dépôt garde `ci.yml`, qui
 * lance `npm run check` : `check-contract.mjs` y monte l'adaptateur de parité et
 * lui passe les échecs de tests, deux réponses que `ucm check` ne reçoit pas.
 * `ucm init` écrit `ucm.yml` pour un repository quelconque, qui n'a ni l'un ni
 * l'autre. Les deux ne fusionneront pas tant que le chargement d'un adaptateur
 * n'est pas ouvert (T6.3) — et ils ne DOIVENT pas fusionner à la légère : les
 * deux écrivent `ci-report.md`, donc le second écraserait le premier et la pull
 * request recevrait un rapport sans parité ni tests, **plus vert que la
 * réalité**.
 *
 * **Mais leurs deux derniers blocs, eux, ne sont pas propres à une stack.**
 * « Garantir un diagnostic même sans rapport » et « Publier le diagnostic sur la
 * pull request » répondent à la seule chose qui n'a aucun recours : une pull
 * request refusée sans un mot laisse le designer sans rien à lire. Ce sont deux
 * copies du même geste, dans deux dépôts, et jusqu'ici rien ne les comparait.
 * C'est la règle que ce projet applique partout : ce n'est pas la copie qui est
 * dangereuse, c'est la copie que rien ne compare.
 *
 * **Ce qui a le droit de diverger : les commentaires, et rien d'autre.** Le
 * générateur explique son filet unique à un repo qui n'a pas de chaîne de
 * construction ; `ci.yml` explique le sien à un dépôt qui en a deux. Un
 * commentaire n'est pas une exécution — c'est la même exception que
 * `skill-diagnostics.test.mjs` accorde aux adresses de lien.
 *
 * **Le clone frère est EXIGÉ, pas contourné**, pour la raison que
 * `liens-documents.test.mjs` écrit déjà : sauter le contrôle quand le voisin
 * manque rendrait ce test vert précisément dans le cas qu'il existe pour
 * couvrir. La CI clone `../UCM-Exporter`.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const VOISIN = resolve(racine, "..", "UCM-Exporter");
const INIT = join(VOISIN, "packages", "cli", "src", "init.mjs");

/** Les deux blocs comparés, désignés par le `- name:` qui les ouvre. */
const BLOCS = [
  "Garantir un diagnostic même sans rapport",
  "Publier le diagnostic sur la pull request",
];

/**
 * Le workflow que `ucm init` écrirait, reconstitué depuis la source du CLI.
 *
 * Le générateur assemble son fichier en tableau de chaînes, et ce dépôt ne peut
 * pas l'importer : `@ucm-kit/cli` n'est pas installé ici, et l'installer pour un
 * seul test le mettrait sur le chemin critique de la CI.
 *
 * **La borne n'est pas une précaution, elle a servi au premier essai.** Sans
 * elle — en relevant toute chaîne littérale du module —, les messages du reste
 * d'`init.mjs` entraient dans le workflow reconstitué, et un texte parlant de
 * `.gitignore` s'est retrouvé collé à la fin d'un bloc comparé. On ne lit donc
 * que le corps de la fonction du workflow, de sa déclaration à son `].join(`.
 */
function workflowGenere(source) {
  const debut = source.indexOf("function workflow(");
  assert.notEqual(debut, -1, INIT + " ne définit plus la fonction du workflow");
  const fin = source.indexOf("].join(", debut);
  assert.notEqual(fin, -1, "le workflow de " + INIT + " ne se termine plus par un join");

  return source
    .slice(debut, fin)
    .split(/\r?\n/)
    .map((l) => /^\s*(?:"(.*)",?|'(.*)',?|`(.*)`,?)\s*$/.exec(l))
    .filter(Boolean)
    // Le littéral JS est déséchappé en une passe : `\\X` redevient `X`. Sans
    // cela, la continuation de ligne du `gh pr comment` garde ses deux barres
    // obliques et les deux blocs divergent sur un caractère invisible.
    .map((m) => (m[1] ?? m[2] ?? m[3] ?? "").replace(/\\(.)/g, "$1"))
    .join("\n");
}

/**
 * Le bloc d'une étape nommée, des espaces et des commentaires près.
 *
 * Il court du `- name:` jusqu'à la prochaine étape ou la fin. Les lignes de
 * commentaire partent, l'indentation aussi : les deux workflows n'imbriquent
 * pas leur job à la même profondeur, et une indentation n'est pas une règle.
 */
function bloc(workflow, nom) {
  const lignes = workflow.split(/\r?\n/);
  const debut = lignes.findIndex((l) => l.trim() === "- name: " + nom);
  if (debut === -1) return null;

  const gardees = [lignes[debut].trim()];
  for (const ligne of lignes.slice(debut + 1)) {
    if (/^\s*- (name|uses|id|run):/.test(ligne)) break;
    const nu = ligne.trim();
    if (nu.startsWith("#")) continue;
    gardees.push(nu);
  }
  // Le bloc se termine souvent sur du vide : il n'appartient à personne.
  while (gardees.at(-1) === "") gardees.pop();
  return gardees.join("\n");
}

test("les deux filets de fin de CI disent la même chose ici et dans `ucm init`", () => {
  assert.ok(
    existsSync(INIT),
    "Ce test compare la CI de ce dépôt au workflow qu'`ucm init` génère, et ce "
      + "clone frère est absent : " + INIT + ". La CI clone `../UCM-Exporter` ; en "
      + "local, cloner l'exporteur à côté de ce dépôt.",
  );

  const ici = readFileSync(join(racine, ".github", "workflows", "ci.yml"), "utf8");
  const genere = workflowGenere(readFileSync(INIT, "utf8"));

  const ecarts = [];
  for (const nom of BLOCS) {
    const a = bloc(ici, nom);
    const b = bloc(genere, nom);
    if (a === null) ecarts.push("« " + nom + " » est absent de ci.yml");
    else if (b === null) ecarts.push("« " + nom + " » est absent du workflow d'`ucm init`");
    else if (a !== b) {
      ecarts.push("« " + nom + " » diverge :\n--- ci.yml\n" + a + "\n--- ucm init\n" + b);
    }
  }

  assert.deepEqual(
    ecarts,
    [],
    "Les filets de fin de CI ont divergé. Ils ne décrivent aucune stack : ils "
      + "répondent à une pull request refusée sans un mot, et le designer n'a alors "
      + "aucun recours. Corriger l'un sans l'autre laisse un des deux dépôts muet.\n"
      + ecarts.join("\n"),
  );
});

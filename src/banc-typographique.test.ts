/**
 * Le banc typographique d'`index.css` cite-t-il des variables qui existent, et
 * les cite-t-il TOUTES ?
 *
 * **Pourquoi ce fichier existe, et c'est la même question que partout ailleurs
 * ici.** `src/index.css` porte quinze classes `.ucm-type-*` écrites à la main,
 * une par style typographique du design system, chacune citant quatre variables
 * générées. C'est une énumération de ce que `tokens.json` déclare déjà — donc
 * une copie, et jusqu'ici une copie que rien ne comparait. Un groupe de
 * typographie ajouté, renommé ou retiré la laissait périmée en silence : la
 * classe absente ne lève rien, la classe orpheline cite des variables qui ne se
 * résolvent pas, et le bac à sable affiche du texte au style par défaut sans
 * qu'une seule erreur apparaisse.
 *
 * **Ce qui a été décidé (T9.9), plutôt que de trancher entre garder et jeter.**
 * Le banc a un vrai emploi : c'est le seul endroit où un humain VOIT l'échelle
 * typographique que l'export produit, et le seul contrôle de ce dépôt qui ne
 * passe pas par un contrat. On le garde, et on lui donne le remède qui manquait
 * — ce n'est pas la copie qui est dangereuse, c'est la copie que rien ne
 * compare.
 *
 * **Ce qu'il ne prouve pas.** Que le rendu soit juste : personne ici ne lance de
 * navigateur, et une variable déclarée peut porter une valeur absurde. Il dit
 * que les deux inventaires — les styles du design system et les classes du banc
 * — décrivent le même ensemble, et que chaque variable citée est déclarée.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { indexerTokensDtcg } from "@ucm-kit/core/lecteurs";
import { tokenCssVariable } from "@ucm-kit/core/format";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (relatif: string): string => readFileSync(join(racine, relatif), "utf8");

/** Les classes `.ucm-type-<type>-<nom>` déclarées par la feuille du dépôt. */
function classesDuBanc(): Set<string> {
  const css = lire("src/index.css");
  return new Set([...css.matchAll(/^\.ucm-type-([\w-]+)\s*\{/gm)].map(([, nom]) => nom));
}

/** Les variables citées en `var(--…)` par ces classes. */
function variablesCitees(): Set<string> {
  const css = lire("src/index.css");
  return new Set([...css.matchAll(/var\((--[\w-]+)\)/g)].map(([, nom]) => nom));
}

/** Les propriétés personnalisées réellement DÉCLARÉES par le CSS généré. */
function variablesDeclarees(): Set<string> {
  // Même dépendance d'ordre que `tokens-accord.test.ts`, et même diagnostic :
  // `src/generated/` n'est pas versionné, et un ENOENT nu ne dit pas quoi faire.
  let css: string;
  try {
    css = lire("src/generated/tokens.css");
  } catch (erreur) {
    if ((erreur as NodeJS.ErrnoException).code !== "ENOENT") throw erreur;
    throw new Error(
      "src/generated/tokens.css est absent : ce dossier n'est pas versionné. "
        + "Lancez `npm run tokens` d'abord, ou `npm run check`, qui enchaîne les "
        + "deux dans le bon ordre.",
    );
  }
  return new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(([, nom]) => nom));
}

/**
 * Les styles typographiques du design system, sous la forme `<type>-<nom>`.
 *
 * Un style est un GROUPE de `typography.*` qui porte des feuilles : le chemin
 * d'une feuille est `typography.body.large.fontsize`, le style est donc ses
 * deux segments du milieu. L'index vient du kit, comme partout : « qu'est-ce
 * qu'une feuille DTCG » est une question qui a déjà un propriétaire.
 */
function stylesDuDesignSystem(): Set<string> {
  const tokens = JSON.parse(lire("src/tokens/tokens.json"));
  const styles = new Set<string>();
  for (const chemin of indexerTokensDtcg(tokens).keys()) {
    const segments = chemin.split(".");
    if (segments[0] !== "typography" || segments.length < 3) continue;
    styles.add(`${segments[1]}-${segments[2]}`);
  }
  return styles;
}

test("le banc typographique décrit exactement les styles du design system", () => {
  const banc = classesDuBanc();
  const systeme = stylesDuDesignSystem();

  // Deux inventaires vides se ressembleraient parfaitement : la faute qu'on
  // rend impossible avant de comparer quoi que ce soit.
  assert.ok(banc.size > 0, "aucune classe `.ucm-type-*` trouvée dans src/index.css");
  assert.ok(systeme.size > 0, "aucun style `typography.*` trouvé dans tokens.json");

  const orphelines = [...banc].filter((nom) => !systeme.has(nom)).sort();
  const absentes = [...systeme].filter((nom) => !banc.has(nom)).sort();

  assert.deepEqual(
    { orphelines, absentes },
    { orphelines: [], absentes: [] },
    "Le banc typographique et le design system ont divergé. Une classe orpheline "
      + "cite des variables qui ne se résolvent plus, et le bac à sable affiche du "
      + "texte au style par défaut sans lever ; un style absent du banc n'est "
      + "simplement jamais montré. Les deux échouent en silence, c'est pourquoi "
      + "ils se comptent ici.",
  );
});

test("chaque variable citée par le banc est déclarée par le CSS généré", () => {
  const declarees = variablesDeclarees();
  assert.ok(declarees.size > 0, "le CSS généré est absent ou vide : lancez `npm run tokens`");

  // Les variables que le banc se donne à lui-même (`--ucm-*`) ne viennent pas
  // des tokens : elles sont son mécanisme, pas son contenu.
  const fantomes = [...variablesCitees()]
    .filter((nom) => !nom.startsWith("--ucm-"))
    .filter((nom) => !declarees.has(nom))
    .sort();

  assert.deepEqual(
    fantomes,
    [],
    `${fantomes.length} variable(s) citée(s) par src/index.css ne sont déclarées `
      + "nulle part. Une variable absente ne lève rien en CSS : elle se résout au "
      + "repli, ou fait tomber la déclaration.",
  );
});

test("les noms du banc sont ceux que la projection du format produit", () => {
  // Le banc écrit `--typography-body-large-fontsize` à la main. Si la
  // projection du kit changeait, ces noms deviendraient faux sans qu'aucune des
  // deux vérifications ci-dessus ne bouge — le CSS généré changerait AUSSI, et
  // les deux resteraient d'accord sur des noms périmés.
  for (const style of stylesDuDesignSystem()) {
    const [type, nom] = style.split("-");
    const attendu = tokenCssVariable(`typography.${type}.${nom}.fontsize`);
    assert.ok(
      variablesCitees().has(attendu),
      `le banc ne cite pas ${attendu}, que la projection du format produit pour `
        + `typography.${type}.${nom}.fontsize`,
    );
  }
});

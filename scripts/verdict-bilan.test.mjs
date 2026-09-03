import assert from "node:assert/strict";
import test from "node:test";
import { bilanEstBloquant, enteteDuVerdict } from "./verdict-bilan.mjs";

function bilan(overrides = {}) {
  return {
    illisible: false,
    champsAbsents: [],
    version: null,
    graphe: [],
    manquants: [],
    nonListes: [],
    fantomes: [],
    typesTypographiques: [],
    ...overrides,
  };
}

test("une référence absente des tokens ne bloque pas le contrat", () => {
  assert.equal(bilanEstBloquant(bilan({ manquants: ["{ancien.token}"] })), false);
});

test("les incohérences internes du contrat restent bloquantes", () => {
  assert.equal(bilanEstBloquant(bilan({ nonListes: ["{token.non.indexe}"] })), true);
  assert.equal(bilanEstBloquant(bilan({ champsAbsents: ["props"] })), true);
  assert.equal(bilanEstBloquant(bilan({ version: { valeur: "99.0" } })), true);
});

/**
 * Le titre du rapport annonce des CONTRATS invalides. Un `.tsx` qui s'écarte de
 * son contrat n'en rend aucun invalide : le verdict l'ignore, faute de quoi le
 * titre mentirait et la pull request d'un designer serait refusée pour un geste
 * qui ne lui appartient pas.
 */
test("un écart contrat ↔ code ne rend pas le contrat bloquant", () => {
  const enEcart = bilan({
    parite: {
      manquantes: ["disabled"],
      compositionsIncorrectes: [{ component: "TileLink", attendu: 7, rendu: 14 }],
    },
  });

  assert.equal(bilanEstBloquant(enEcart), false);
});

test("le titre n'accuse les contrats que lorsqu'un contrat est en cause", () => {
  assert.match(enteteDuVerdict(1)[0], /^## ❌ 1 contrat invalide$/);
  assert.match(enteteDuVerdict(3)[0], /^## ❌ 3 contrats invalides$/);
});

/**
 * Une pull request peut être refusée par un test rouge ou un build cassé sans
 * qu'aucun contrat n'y soit pour rien. Le titre le dit alors du repository.
 */
test("sans contrat fautif, le titre nomme le repository et disculpe les contrats", () => {
  const entete = enteteDuVerdict(0);

  assert.equal(entete[0], "## ❌ Les contrôles du repository bloquent la fusion");
  assert.match(entete[2], /^Les contrats sont valides\./);
  assert.doesNotMatch(entete.join("\n"), /invalide/);
});

test("les avertissements d'export sont annoncés comme non bloquants à eux seuls", () => {
  assert.match(enteteDuVerdict(0, true)[2], /ne bloquent pas à eux seuls/);
});

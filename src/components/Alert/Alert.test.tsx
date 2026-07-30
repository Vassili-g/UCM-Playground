/**
 * Tests de rendu d'Alert — le contrôle que la parité statique ne peut PAS faire.
 *
 * `scripts/parite.mjs` compte des occurrences JSX et vérifie des types : elle
 * sait qu'un `<Button />` est écrit une fois dans la fonction, jamais qu'il est
 * réellement retiré quand `action` vaut `false`. Elle le dit elle-même. Ce
 * fichier est le contrôle compensatoire annoncé.
 *
 * Il vise aussi ce que le contrat 4.2 a introduit et qu'aucun garde-fou ne peut
 * relire : trois icônes partagent le slot `icon` et ne se distinguent que par
 * leur champ `variants`. Un composant qui apparie les icônes sur `children`
 * — le variant de référence — rend `circle-info` pour toutes les sévérités et
 * passe pourtant tous les autres contrôles au vert.
 *
 * Le rendu passe par `react-dom/server` : il suffit à observer la structure
 * produite, et évite d'installer un DOM complet pour des assertions de présence.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Alert } from "./Alert.tsx";
import contractJson from "./Alert.contract.json";
import type { AlertSeverity, AlertVariant } from "../../generated/contracts/Alert.ts";

const contract = contractJson as unknown as {
  props: { severity: { values: AlertSeverity[] }; variant: { values: AlertVariant[] } };
  composes: { component: string }[];
  icons: Record<string, { figmaName: string; variants?: Record<string, string>[] }>;
};

/** Nombre d'occurrences d'un motif dans le balisage rendu. */
function occurrences(markup: string, motif: RegExp): number {
  return markup.match(new RegExp(motif, "g"))?.length ?? 0;
}

test("la dépendance déclarée dans composes est rendue quand action vaut true", () => {
  const markup = renderToStaticMarkup(<Alert action titleContent="Titre">Message</Alert>);
  assert.equal(
    occurrences(markup, /<button/),
    contract.composes.length,
    "le composé doit rendre exactement les dépendances déclarées",
  );
});

test("la dépendance disparaît quand la visibilityProp vaut false", () => {
  const markup = renderToStaticMarkup(
    <Alert action={false} titleContent="Titre">Message</Alert>,
  );
  assert.equal(occurrences(markup, /<button/), 0);
});

/**
 * L'assertion vise le glyphe D'ALERT (`circle-info`) et non « une icône » :
 * le bouton embarqué rend les siennes, et une Alert sans icône reste donc
 * pleine de `<i class="fa-…">` parfaitement légitimes. Un composé ne se teste
 * pas comme un composant simple.
 */
test("l'icône suit sa visibilityProp, sans emporter celles de la dépendance", () => {
  const avec = renderToStaticMarkup(<Alert icon>Message</Alert>);
  const sans = renderToStaticMarkup(<Alert icon={false}>Message</Alert>);
  assert.match(avec, /fa-circle-info"/);
  assert.doesNotMatch(sans, /fa-circle-info"/);
  assert.match(sans, /<button/, "seule l'icône disparaît, pas le reste du composé");
});

test("visibilityTargets masque le titre sans emporter le corps du message", () => {
  const markup = renderToStaticMarkup(
    <Alert title={false} titleContent="Le titre">Le corps</Alert>,
  );
  assert.doesNotMatch(markup, /Le titre/);
  assert.match(markup, /Le corps/, "le slot entier ne doit pas disparaître avec sa cible");
});

/**
 * La vraie épreuve du modèle d'icônes 4.2 : chaque icône déclare les
 * combinaisons où elle existe, et c'est `icons` qui fait foi — pas le
 * `figmaLayer` du variant de référence.
 */
test("chaque sévérité rend l'icône que le contrat lui associe", () => {
  for (const [, icone] of Object.entries(contract.icons)) {
    for (const combinaison of icone.variants ?? []) {
      const markup = renderToStaticMarkup(
        <Alert
          severity={combinaison.severity as AlertSeverity}
          variant={combinaison.variant as AlertVariant}
        >
          Message
        </Alert>,
      );
      assert.match(
        markup,
        new RegExp(`fa-${icone.figmaName}"`),
        `${combinaison.severity}/${combinaison.variant} doit rendre ${icone.figmaName}`,
      );
    }
  }
});

test("deux sévérités aux icônes différentes ne rendent pas le même glyphe", () => {
  const info = renderToStaticMarkup(<Alert severity="info">Message</Alert>);
  const success = renderToStaticMarkup(<Alert severity="success">Message</Alert>);
  assert.match(info, /fa-circle-info"/);
  assert.match(success, /fa-circle-check"/);
});

test("toutes les combinaisons du contrat se rendent sans valeur brute", () => {
  for (const severity of contract.props.severity.values) {
    for (const variant of contract.props.variant.values) {
      const markup = renderToStaticMarkup(
        <Alert severity={severity} variant={variant}>Message</Alert>,
      );
      // Toute couleur ou dimension issue du contrat passe par une variable CSS :
      // un `#hex` ou un `px` dans le style signalerait une valeur écrite en dur.
      const styles = markup.match(/style="([^"]*)"/g) ?? [];
      for (const style of styles) {
        assert.doesNotMatch(style, /#[0-9a-f]{3,8}\b/i, `${severity}/${variant} : couleur brute`);
      }
    }
  }
});

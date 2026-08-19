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
import { tokenVar } from "../../tokens.ts";
import type { AlertSeverity, AlertVariant } from "../../generated/contracts/Alert.ts";

const contract = contractJson as unknown as {
  props: { severity: { values: AlertSeverity[] }; variant: { values: AlertVariant[] } };
  structure: {
    justifyContent: string;
    alignItems: string;
    children: Array<{
      slot: string;
      justifyContent?: string;
      alignItems?: string;
      alignSelf?: string;
      flexGrow?: number;
    }>;
  };
  variants: Array<{
    values: { severity: AlertSeverity; variant: AlertVariant };
    view: string;
  }>;
  variantViews: Record<string, {
    typography: Array<{ slotPath: string[]; style: string }>;
  }>;
  textStyles: Record<string, { tokens: Record<string, string> }>;
  composes: { component: string }[];
  icons: Record<string, { figmaName: string; variants?: Record<string, string>[] }>;
};

const CSS_TYPOGRAPHY_PROPERTIES: Record<string, string> = {
  fontFamily: "font-family",
  fontSize: "font-size",
  fontWeight: "font-weight",
  letterSpacing: "letter-spacing",
  lineHeight: "line-height",
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

test("chaque texte applique le text style 4.6 déclaré pour son slot", () => {
  const markup = renderToStaticMarkup(
    <Alert titleContent="Titre">Description</Alert>,
  );
  const variant = contract.variants.find(({ values }) =>
    values.severity === "info" && values.variant === "standard");
  assert.ok(variant, "le contrat doit contenir le variant info/standard");
  const usages = contract.variantViews[variant.view]?.typography;
  assert.ok(usages, "le variant info/standard doit référencer une vue typographique");

  for (const { slotPath, style } of usages) {
    const contenu = slotPath[slotPath.length - 1] === "label" ? "Titre" : "Description";
    const styleRendu = markup.match(
      new RegExp(`<span style="([^"]*)">${contenu}</span>`),
    )?.[1] ?? "";

    for (const [propriete, reference] of Object.entries(contract.textStyles[style].tokens)) {
      assert.ok(
        styleRendu.includes(`${CSS_TYPOGRAPHY_PROPERTIES[propriete]}:${tokenVar(reference)}`),
        `${slotPath.join(" > ")} doit appliquer ${propriete} depuis ${style}`,
      );
    }
  }
});

test("le flux Flex 4.4 reprend toutes les propriétés structurelles du contrat", () => {
  const markup = renderToStaticMarkup(<Alert titleContent="Titre">Message</Alert>);
  const rootStyle = markup.match(/<div role="alert" style="([^"]*)"/)?.[1] ?? "";
  const contentStyle = markup.match(/<div style="([^"]*)"/)?.[1] ?? "";
  const actionStyle = markup.match(/<button[^>]*style="([^"]*)"/)?.[1] ?? "";
  const content = contract.structure.children.find((child) => child.slot === "label");
  const action = contract.structure.children.find((child) => child.slot === "action");

  assert.ok(rootStyle.includes(`justify-content:${contract.structure.justifyContent}`));
  assert.ok(rootStyle.includes(`align-items:${contract.structure.alignItems}`));
  assert.ok(content, "le slot label doit être présent dans le contrat");
  assert.ok(action, "le slot action doit être présent dans le contrat");
  assert.ok(contentStyle.includes(`justify-content:${content.justifyContent}`));
  assert.ok(contentStyle.includes(`align-items:${content.alignItems}`));
  assert.ok(contentStyle.includes(`flex-grow:${content.flexGrow}`));
  assert.ok(actionStyle.includes(`align-self:${action.alignSelf}`));
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

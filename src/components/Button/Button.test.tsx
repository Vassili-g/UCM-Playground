/**
 * Tests de rendu de Button.
 *
 * Ils portent sur ce qu'aucune analyse statique ne voit : qu'une prop de
 * visibilité retire réellement son slot, et surtout que le composant LIT sa
 * matrice de variantes au lieu de la reproduire. Une reconstruction en contexte
 * froid avait inliné cette matrice avec des heuristiques (« un `text` n'a de
 * fond qu'au survol ») qui donnaient exactement le bon rendu — jusqu'au jour
 * où le design bouge. Comparer le rendu à la donnée du contrat, et non à une
 * valeur attendue écrite ici, est la seule façon de tester cette lecture.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { Button } from "./Button.tsx";
import contractJson from "./Button.contract.json";
import { tokenVar } from "../../tokens.ts";
import type { ButtonColor, ButtonSize, ButtonVariant } from "../../generated/contracts/Button.ts";

const contract = contractJson as unknown as {
  props: {
    color: { values: ButtonColor[] };
    variant: { values: ButtonVariant[] };
    size: { values: ButtonSize[] };
  };
  structure: {
    sizes: Record<string, { gap: string; radius: string }>;
    variantTokens: Record<string, Record<string, Record<string, Record<string, string>>>>;
  };
};

test("le label se masque sans faire disparaître les icônes", () => {
  const avec = renderToStaticMarkup(<Button label>Suivant</Button>);
  const sans = renderToStaticMarkup(<Button label={false}>Suivant</Button>);
  assert.match(avec, /Suivant/);
  assert.doesNotMatch(sans, /Suivant/);
  assert.match(sans, /fa-arrow-left-long"/, "un bouton à icône seule garde ses icônes");
});

test("chaque icône suit sa propre prop de visibilité", () => {
  const sansGauche = renderToStaticMarkup(<Button iconLeft={false}>Suivant</Button>);
  assert.doesNotMatch(sansGauche, /fa-arrow-left-long"/);
  assert.match(sansGauche, /fa-arrow-right-long"/);
});

test("une icône modifiable accepte le nom passé au runtime", () => {
  const markup = renderToStaticMarkup(<Button iconLeftName="star">Suivant</Button>);
  assert.match(markup, /fa-star"/);
  assert.doesNotMatch(markup, /fa-arrow-left-long"/);
});

test("les dimensions rendues sont celles que le contrat donne pour la taille", () => {
  for (const size of contract.props.size.values) {
    const markup = renderToStaticMarkup(<Button size={size}>Suivant</Button>);
    const attendu = contract.structure.sizes[size];
    assert.ok(markup.includes(`gap:${tokenVar(attendu.gap)}`), `gap manquant en ${size}`);
    assert.ok(
      markup.includes(`border-radius:${tokenVar(attendu.radius)}`),
      `rayon manquant en ${size}`,
    );
  }
});

/**
 * Le test ne regarde que la VALEUR peinte, jamais la propriété CSS employée :
 * `rendering.roles.cssProperties` est une indication d'implémentation, et le
 * choix entre `background` et `background-color` appartient au développeur
 * (cf. AGENTS.md, « Ce que les contrôles ne vérifient pas »).
 *
 * Pour chaque combinaison, le token peint doit être celui de la feuille du
 * contrat, et un état sans rôle `background` ne doit rien peindre du tout.
 */
test("le token de fond de chaque variante est celui de la feuille du contrat", () => {
  for (const color of contract.props.color.values) {
    for (const variant of contract.props.variant.values) {
      const feuille = contract.structure.variantTokens[color][variant].default;
      const style = renderToStaticMarkup(
        <Button color={color} variant={variant}>Suivant</Button>,
      ).match(/<button[^>]*style="([^"]*)"/)?.[1] ?? "";
      const peint = style
        .split(";")
        .filter((declaration) => /^background/.test(declaration))
        .join(" ");

      if (feuille.background === undefined) {
        assert.doesNotMatch(peint, /var\(--/, `${color}/${variant} : aucun fond n'est attendu`);
      } else {
        assert.ok(
          peint.includes(tokenVar(feuille.background)),
          `${color}/${variant} : fond attendu ${tokenVar(feuille.background)}, rendu « ${peint} »`,
        );
      }
    }
  }
});

test("aucune couleur brute ne subsiste dans le rendu", () => {
  for (const color of contract.props.color.values) {
    for (const variant of contract.props.variant.values) {
      const markup = renderToStaticMarkup(
        <Button color={color} variant={variant}>Suivant</Button>,
      );
      assert.doesNotMatch(markup, /#[0-9a-f]{3,8}\b/i, `${color}/${variant}`);
    }
  }
});

test("l'état désactivé est rendu et transmis à l'élément natif", () => {
  const markup = renderToStaticMarkup(<Button disabled>Suivant</Button>);
  const feuille = contract.structure.variantTokens.primary.contained.disable;
  assert.match(markup, /disabled=""/);
  assert.ok(markup.includes(tokenVar(feuille.background)), "le fond doit être celui de l'état disable");
});

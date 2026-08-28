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
// Les renvois d'un contrat 11.0 se résolvent au seul endroit prévu pour ça.
// @ts-expect-error — module JavaScript sans déclarations de types
import { projectionDeReference, vueExacteDuVariant } from "../../../scripts/variant-views.mjs";

const contract = contractJson as unknown as {
  props: {
    color: { values: ButtonColor[] };
    variant: { values: ButtonVariant[] };
    size: { values: ButtonSize[] };
  };
  structure: {
    justifyContent: string;
    alignItems: string;
    sizes: Record<string, { gap: string; radius: string }>;
  };
  variants: Array<{
    values: { color: ButtonColor; variant: ButtonVariant; state: string };
    tokens: Record<string, string>;
    view: string;
  }>;
  variantViews: Record<string, {
    typography: Array<{ slotPath: string[]; style: string }>;
    structure: {
      justifyContent: string;
      alignItems: string;
      children: Array<{ slot: string; justifyContent?: string; alignItems?: string }>;
    };
    paintPlacements: {
      fills: Record<string, string[][]>;
      strokes: Record<string, string[][]>;
    };
  }>;
  textStyles: Record<string, { tokens: Record<string, string> }>;
  icons: Record<string, { size: string }>;
};

const CSS_TYPOGRAPHY_PROPERTIES: Record<string, string> = {
  fontFamily: "font-family",
  fontSize: "font-size",
  fontWeight: "font-weight",
  letterSpacing: "letter-spacing",
  lineHeight: "line-height",
};

/** Retrouve la feuille exacte de la matrice publiée par le contrat v9. */
function variantExacte(color: ButtonColor, variant: ButtonVariant, state: string) {
  const resultat = contract.variants.find(({ values }) =>
    values.color === color && values.variant === variant && values.state === state);
  assert.ok(resultat, `le contrat doit contenir le variant ${color}/${variant}/${state}`);
  return resultat;
}

/**
 * Style inline de l'élément qu'un chemin de slot désigne.
 *
 * La vue exacte part de la VRAIE racine du variant : le bouton rend d'abord son
 * `<button>`, puis le cadre du slot `label` qui porte les dimensions, le fond et
 * la bordure. Les deux premiers attributs `style` du markup sont donc ces deux
 * éléments, dans cet ordre, et la profondeur du chemin suffit à les distinguer.
 */
function styleAuChemin(markup: string, chemin: readonly string[]): string {
  const styles = Array.from(markup.matchAll(/style="([^"]*)"/g), ([, valeur]) => valeur);
  return styles[chemin.length] ?? "";
}

/**
 * Le flux se lit sur la vue exacte, pas sur `structure`.
 *
 * `structure` est la projection du variant de référence : son élection remonte
 * au cadre `sizeWrapperButton`, et son `justifyContent` est donc celui du CADRE.
 * La racine, elle, a le sien. Comparer le style du `<button>` à `structure`
 * confondait les deux calques et exigeait du rendu qu'il centre la racine.
 */
test("le flux du conteneur suit la vue exacte du contrat", () => {
  const vue = vueExacteDuVariant(contract, variantExacte("primary", "contained", "default"));
  const markup = renderToStaticMarkup(<Button>Suivant</Button>);

  const racine = styleAuChemin(markup, []);
  assert.ok(racine.includes(`justify-content:${vue.structure.justifyContent}`));
  assert.ok(racine.includes(`align-items:${vue.structure.alignItems}`));

  const cadre = vue.structure.children[0];
  const style = styleAuChemin(markup, [cadre.slot]);
  assert.ok(style.includes(`justify-content:${cadre.justifyContent}`), "cadre : justifyContent");
  assert.ok(style.includes(`align-items:${cadre.alignItems}`), "cadre : alignItems");
});

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

test("les icônes occupent le carré déclaré par le contrat", () => {
  const markup = renderToStaticMarkup(<Button>Suivant</Button>);
  const taille = tokenVar(contract.icons.arrowLeftLong.size);

  assert.ok(markup.includes(`height:${taille}`));
  assert.ok(markup.includes(`width:${taille}`));
});

test("le label applique le text style 4.6 déclaré pour son slot", () => {
  const markup = renderToStaticMarkup(<Button>Suivant</Button>);
  const styleRendu = markup.match(/<span style="([^"]*)">Suivant<\/span>/)?.[1] ?? "";
  const variant = variantExacte("primary", "contained", "default");
  const usage = vueExacteDuVariant(contract, variant)?.typography.find(
    ({ slotPath }) => slotPath.join(".") === "label.label",
  );

  assert.ok(usage, "le contrat doit relier le slot label à un text style");
  for (const [propriete, reference] of Object.entries(contract.textStyles[usage.style].tokens)) {
    assert.ok(
      styleRendu.includes(`${CSS_TYPOGRAPHY_PROPERTIES[propriete]}:${tokenVar(reference)}`),
      `le label doit appliquer ${propriete} depuis ${usage.style}`,
    );
  }
});

test("les dimensions rendues sont celles que le contrat donne pour la taille", () => {
  for (const size of contract.props.size.values) {
    const markup = renderToStaticMarkup(<Button size={size}>Suivant</Button>);
    const attendu = projectionDeReference(contract).sizes[size];
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
      const exact = variantExacte(color, variant, "default");
      const feuille = exact.tokens;
      // `paintPlacements` dit sur QUEL calque publié la couleur se pose. Le fond
      // du bouton vit sur le slot `label` : le chercher sur la racine le
      // déclarait manquant alors que le rendu le pose là où le contrat l'a situé.
      const cible = vueExacteDuVariant(contract, exact).paintPlacements.fills.background?.[0];
      const markup = renderToStaticMarkup(
        <Button color={color} variant={variant}>Suivant</Button>,
      );
      const peint = styleAuChemin(markup, cible ?? [])
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
  const feuille = variantExacte("primary", "contained", "disable").tokens;
  assert.match(markup, /disabled=""/);
  assert.ok(markup.includes(tokenVar(feuille.background)), "le fond doit être celui de l'état disable");
});

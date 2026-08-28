/**
 * Tests de rendu de StressTest.
 *
 * Ils portent sur la grille, seul endroit du repo où le contrat publie une
 * mesure en PIXELS plutôt qu'une référence. Une piste `HUG` se dimensionne sur
 * son contenu et n'a aucune valeur à publier ; `structuralSize` porte celle de
 * l'enfant, et l'ignorer laissait quatre lignes sur cinq à zéro. Comme partout
 * ici, la valeur attendue est LUE dans le contrat : l'écrire en dur validerait
 * la maquette d'aujourd'hui plutôt que la lecture du contrat.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { StressTest } from "./StressTest.tsx";
import contractJson from "./StressTest.contract.json";
// Les renvois d'un contrat 11.0 se résolvent au seul endroit prévu pour ça.
// @ts-expect-error — module JavaScript sans déclarations de types
import { projectionDeReference, vueExacteDuVariant } from "../../../scripts/variant-views.mjs";

type Tuile = {
  slot: string;
  structuralSize?: { width?: string; height?: string };
};

const contract = contractJson as unknown as {
  variantViews: Record<string, {
    structure: {
      children: Array<{
        slot: string;
        rowSizes?: string[];
        children?: Tuile[];
      }>;
    };
  }>;
};

const grille = vueExacteDuVariant(contract, { view: Object.keys(contract.variantViews)[0] }).structure.children
  .find((child) => child.slot === "tilesgrid");

/** Styles inline du markup, dans l'ordre du document. */
function styles(markup: string): string[] {
  return Array.from(markup.matchAll(/style="([^"]*)"/g), ([, valeur]) => valeur);
}

/**
 * Les douze styles qui suivent celui de la grille : le rendu place ses tuiles
 * juste après elle, dans l'ordre où le contrat les publie.
 */
function stylesDesTuiles(markup: string): string[] {
  const tous = styles(markup);
  const index = tous.findIndex((style) => style.includes("display:grid"));
  assert.notEqual(index, -1, "le slot tilesgrid doit être rendu comme une grille");
  return tous.slice(index + 1, index + 1 + (grille?.children?.length ?? 0));
}

test("les pistes de la grille sont celles que le contrat publie", () => {
  const markup = renderToStaticMarkup(<StressTest />);
  const grid = styles(markup).find((style) => style.includes("display:grid")) ?? "";

  assert.ok(grille?.rowSizes, "le contrat doit publier les pistes de lignes");
  assert.ok(
    grid.includes(`grid-template-rows:${grille.rowSizes.join(" ")}`),
    `pistes attendues « ${grille.rowSizes.join(" ")} », rendu « ${grid} »`,
  );
});

test("chaque tuile porte la mesure que sa piste qui hug attend d’elle", () => {
  const markup = renderToStaticMarkup(<StressTest />);
  const rendus = stylesDesTuiles(markup);
  const tuiles = grille?.children ?? [];

  assert.equal(rendus.length, tuiles.length);
  for (const [index, tuile] of tuiles.entries()) {
    const hauteur = tuile.structuralSize?.height;
    const rendu = rendus[index];
    if (hauteur === undefined) {
      // Piste `FIXED` : la tuile la remplit, lui donner une hauteur la figerait.
      assert.doesNotMatch(rendu, /(^|;)height:/, `${tuile.slot} ne doit pas être figée`);
      continue;
    }
    assert.ok(
      rendu.includes(`height:${hauteur}`),
      `${tuile.slot} : hauteur attendue ${hauteur}, rendu « ${rendu} »`,
    );
  }
});

test("une mesure structurelle n’est jamais résolue comme un token", () => {
  // `structuralSize` ne porte pas de référence. La passer au résolveur
  // produirait `var(--15px)` : une variable CSS qui n'existe nulle part.
  const markup = renderToStaticMarkup(<StressTest />);
  for (const rendu of stylesDesTuiles(markup)) {
    assert.doesNotMatch(rendu, /height:var\(--/, "une hauteur structurelle reste en pixels");
  }
});

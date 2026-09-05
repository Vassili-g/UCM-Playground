import type { CSSProperties } from "react";

import { tokenVar } from "../tokens.ts";

const ICON_GLYPH_RATIO = 0.8;
const ICON_STYLE = "fa-regular";

export interface ContractIconProps {
  name: string;
  sizeToken: string;
  color?: CSSProperties["color"];
}

/**
 * Adapte les noms d'icônes opaques des contrats au kit Font Awesome chargé
 * par l'application.
 *
 * **Ni le jeu d'icônes ni le ratio du glyphe ne sont temporaires : ce sont des
 * décisions de CE repository, et le contrat n'en portera jamais aucune.** Il
 * garantit quand rendre une icône, où, si elle est remplaçable, par quoi, et
 * quel CARRÉ elle occupe ; il ne nomme aucun jeu d'icônes et ne dit rien de la
 * taille du glyphe à l'intérieur de ce carré. La frontière est écrite chez le
 * producteur — `docs/FORMAT.md`, « Ce que le contrat ne dit pas d'une icône »
 * (T8.10) —, et c'est elle qui rend `ICON_STYLE` et `ICON_GLYPH_RATIO`
 * légitimes ici plutôt que provisoires.
 */
export function ContractIcon({
  name,
  sizeToken,
  color,
}: ContractIconProps) {
  const size = tokenVar(sizeToken);

  return (
    <span
      aria-hidden="true"
      style={{
        alignItems: "center",
        color,
        display: "inline-flex",
        flex: "0 0 auto",
        height: size,
        justifyContent: "center",
        width: size,
      }}
    >
      <i
        className={`${ICON_STYLE} fa-${name}`}
        style={{
          fontSize: `calc(${size} * ${ICON_GLYPH_RATIO})`,
        }}
      />
    </span>
  );
}

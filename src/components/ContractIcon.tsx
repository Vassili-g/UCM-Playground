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
 * par l'application. Le contrat définit le carré occupé ; le ratio du glyphe
 * reste une convention temporaire commune au playground.
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

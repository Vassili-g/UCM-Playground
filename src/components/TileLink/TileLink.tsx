import type { AnchorHTMLAttributes } from "react";
import { useState } from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type { TileLinkVariant } from "../../generated/contracts/TileLink.ts";

export type { TileLinkVariant } from "../../generated/contracts/TileLink.ts";

/**
 * Nom d'icône opaque accepté par la prop runtime `chessName`. Le contrat
 * n'énumère aucune liste fermée pour cette icône « modifiable » — seul son
 * défaut (`figmaName: "chess"`) est fixé — donc l'union reste ouverte.
 */
export type TileLinkIconName = string;

/** Dimensions de la tuile : décision du design system, pas du conteneur. */
const TILE_LINK_WIDTH = "{components.tilelink.sizes.width}";
const TILE_LINK_HEIGHT = "{components.tilelink.sizes.height}";
const TILE_LINK_ICON_SIZE = "{components.tilelink.sizes.icon}";

/** Nom Figma de repli de l'icône modifiable `chessName` (policy: modifiable). */
const TILE_LINK_ICON_FALLBACK_NAME = "chess";

type TileLinkState = "default" | "hover";

/**
 * Feuilles `tokens` de `variants[]`, indexées par variante puis par état
 * (`stateModel.axis: "state"`). Recopiées telles quelles depuis le contrat.
 */
const TILE_LINK_TOKENS: Record<
  TileLinkVariant,
  Record<TileLinkState, { background: string; foreground: string }>
> = {
  info: {
    default: {
      background: "{components.tilelink.colors.info.default.background}",
      foreground: "{components.tilelink.colors.info.default.foreground}",
    },
    hover: {
      background: "{components.tilelink.colors.info.hover.background}",
      foreground: "{components.tilelink.colors.info.hover.foreground}",
    },
  },
  success: {
    default: {
      background: "{components.tilelink.colors.success.default.background}",
      foreground: "{components.tilelink.colors.success.default.foreground}",
    },
    hover: {
      background: "{components.tilelink.colors.success.hover.background}",
      foreground: "{components.tilelink.colors.success.hover.foreground}",
    },
  },
};

interface TileLinkContractProps {
  /** props.variant — défaut "info". */
  variant?: TileLinkVariant;
  /** props.chessName — icône modifiable du slot "icon", défaut null (repli figmaName "chess"). */
  chessName?: TileLinkIconName | null;
}

export interface TileLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TileLinkContractProps>,
    TileLinkContractProps {}

/**
 * TileLink — tuile carrée servant de lien vers une autre page
 * (`intent.usage`). Dérivé de TileLink.contract.json (10.3), vue unique "v1".
 */
export function TileLink({
  variant = "info",
  chessName = null,
  style,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: TileLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const state: TileLinkState = isHovered ? "hover" : "default";
  const tokens = TILE_LINK_TOKENS[variant][state];

  const iconName = chessName ?? TILE_LINK_ICON_FALLBACK_NAME;

  return (
    <a
      {...rest}
      onPointerEnter={(event) => {
        setIsHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setIsHovered(false);
        onPointerLeave?.(event);
      }}
      style={{
        alignItems: "center",
        // paintPlacements.fills.background → [[]] (racine)
        backgroundColor: tokenVar(tokens.background),
        display: "flex",
        flexDirection: "row",
        height: tokenVar(TILE_LINK_HEIGHT),
        justifyContent: "center",
        textDecoration: "none",
        width: tokenVar(TILE_LINK_WIDTH),
        ...style,
      }}
    >
      <ContractIcon
        name={iconName}
        sizeToken={TILE_LINK_ICON_SIZE}
        // paintPlacements.fills.foreground → [["icon"]]
        color={tokenVar(tokens.foreground)}
      />
    </a>
  );
}

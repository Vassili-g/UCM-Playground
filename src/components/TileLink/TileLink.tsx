import type { AnchorHTMLAttributes } from "react";
import { useState } from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type { TileLinkVariant } from "../../generated/contracts/TileLink.ts";

export type { TileLinkVariant };

/** Nom d'icône opaque, résolu par ContractIcon via le kit d'icônes de l'application. */
export type TileLinkIconName = string;

/** `stateModel.states` — seuls `default` et `hover` existent pour ce contrat. */
type TileLinkState = "default" | "hover";

interface TileLinkVariantTokens {
  background: string;
  foreground: string;
}

/**
 * Feuilles de `variants[].tokens`, recopiées en toutes lettres — voir
 * TileLink.contract.json. Chaque combinaison variant/état a la sienne ; aucune
 * ne se déduit d'un chemin assemblé à l'exécution.
 */
const TILE_TOKENS: Record<TileLinkVariant, Record<TileLinkState, TileLinkVariantTokens>> = {
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

/** `structure.sizing` — une tuile carrée : le design system a nommé sa taille. */
const TILE_WIDTH = "{components.tilelink.sizes.width}";
const TILE_HEIGHT = "{components.tilelink.sizes.height}";

/** `icons.chess.size`. */
const CHESS_ICON_SIZE = "{components.tilelink.sizes.icon}";

/** `icons.chess.figmaName` — repli quand `chessName` n'est pas fourni (policy « modifiable »). */
const CHESS_ICON_FIGMA_NAME = "chess";

interface TileLinkContractProps {
  variant?: TileLinkVariant;
  /** `null` revient explicitement au repli `icons.chess.figmaName`, comme `undefined`. */
  chessName?: TileLinkIconName | null;
}

export interface TileLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TileLinkContractProps>,
    TileLinkContractProps {}

/**
 * Tuile carrée liant vers une autre page (`intent.usage`). Sa seule
 * information visuelle est un fond coloré et une icône centrée : `variant`
 * choisit la teinte, `chessName` remplace l'icône « chess » du contrat — une
 * icône `modifiable`, jamais masquable, comme le veut l'absence de tout
 * `visibilityProp` sur cette prop.
 *
 * `stateModel` ne déclare que `default` et `hover`, sans stroke ni focus : le
 * survol est donc le seul état à suivre, et il l'est avec les événements
 * Pointer puisque les styles restent inline dans ce test froid.
 */
export function TileLink({
  variant = "info",
  chessName,
  onPointerEnter,
  onPointerLeave,
  style,
  ...rest
}: TileLinkProps) {
  const [hovered, setHovered] = useState(false);
  const state: TileLinkState = hovered ? "hover" : "default";
  const tokens = TILE_TOKENS[variant][state];
  const iconName = chessName ?? CHESS_ICON_FIGMA_NAME;

  return (
    <a
      {...rest}
      onPointerEnter={(event) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        onPointerLeave?.(event);
      }}
      style={{
        alignItems: "center",
        backgroundColor: tokenVar(tokens.background),
        display: "flex",
        flexDirection: "row",
        height: tokenVar(TILE_HEIGHT),
        justifyContent: "center",
        width: tokenVar(TILE_WIDTH),
        ...style,
      }}
    >
      <ContractIcon
        name={iconName}
        sizeToken={CHESS_ICON_SIZE}
        color={tokenVar(tokens.foreground)}
      />
    </a>
  );
}

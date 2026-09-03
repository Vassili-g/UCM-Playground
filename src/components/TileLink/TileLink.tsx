/**
 * Transcription statique de TileLink.contract.json (v11.0) — ne lit ni
 * n'interprète le JSON au runtime. Voir src/components/TileLink/TileLink.contract.json.
 */
import {
  type AnchorHTMLAttributes,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useState,
} from "react";

import type { TileLinkVariant } from "../../generated/contracts/TileLink.ts";
import { tokenVar } from "../../tokens.ts";
import { ContractIcon } from "../ContractIcon.tsx";

export type { TileLinkVariant };

/**
 * `chessName` est `type: "icon"`, policy "modifiable" : le contrat ne publie
 * aucune énumération fermée, seulement un nom de repli (`icons.chess.figmaName`).
 */
export type TileLinkIconName = string;

type TileLinkState = "default" | "hover";

interface TileLinkVariantEntry {
  background: string;
  foreground: string;
}

/** Table littérale transcrite de `variants` (axes `variant` puis `state`). */
const VARIANTS: Record<TileLinkVariant, Record<TileLinkState, TileLinkVariantEntry>> = {
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

/** `structure.view` (st1) : dimensions de la tuile. */
const TILE_WIDTH = "{components.tilelink.sizes.width}";
const TILE_HEIGHT = "{components.tilelink.sizes.height}";
/** `icons.chess.size`. */
const ICON_SIZE = "{components.tilelink.sizes.icon}";
/** `icons.chess.figmaName` : nom de repli d'une icône `policy: "modifiable"`. */
const ICON_FALLBACK_NAME = "chess";

interface TileLinkContractProps {
  variant?: TileLinkVariant;
  chessName?: TileLinkIconName | null;
}

export interface TileLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TileLinkContractProps>,
    TileLinkContractProps {}

export function TileLink({
  variant = "info",
  chessName = null,
  onPointerEnter,
  onPointerLeave,
  style,
  ...rest
}: TileLinkProps) {
  const [hovered, setHovered] = useState(false);

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
      setHovered(true);
      onPointerEnter?.(event);
    },
    [onPointerEnter],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
      setHovered(false);
      onPointerLeave?.(event);
    },
    [onPointerLeave],
  );

  // stateModel.precedence: "hover" > "default".
  const state: TileLinkState = hovered ? "hover" : "default";
  const entry = VARIANTS[variant][state];

  const rootStyle: CSSProperties = {
    alignItems: "center",
    backgroundColor: tokenVar(entry.background),
    display: "flex",
    flexDirection: "row",
    height: tokenVar(TILE_HEIGHT),
    justifyContent: "center",
    textDecoration: "none",
    width: tokenVar(TILE_WIDTH),
    ...style,
  };

  return (
    <a
      style={rootStyle}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      <ContractIcon
        color={tokenVar(entry.foreground)}
        name={chessName ?? ICON_FALLBACK_NAME}
        sizeToken={ICON_SIZE}
      />
    </a>
  );
}

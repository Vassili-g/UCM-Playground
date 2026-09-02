/**
 * Transcription statique de TileLink.contract.json (v10.3) — ne lit ni
 * n'interprète le JSON au runtime. Voir src/components/TileLink/TileLink.contract.json.
 */
import {
  type AnchorHTMLAttributes,
  type CSSProperties,
  useCallback,
  useState,
} from "react";

import type { TileLinkVariant } from "../../generated/contracts/TileLink.ts";
import { tokenVar } from "../../tokens.ts";
import { ContractIcon } from "../ContractIcon.tsx";

export type { TileLinkVariant };

/** `chessName` est `type: "icon"`, policy "modifiable" : aucune énumération
 * fermée n'est publiée, seulement un nom de repli (`icons.chess.figmaName`). */
export type TileLinkIconName = string;

type TileLinkState = "default" | "hover";

interface TileLinkVariantEntry {
  background: string;
  foreground: string;
}

/** Table littérale transcrite de `variants` (2 variantes × 2 états). */
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

/** `stateModel.precedence`, du plus fort au plus faible. */
const STATE_PRECEDENCE: TileLinkState[] = ["hover", "default"];

const TILE_WIDTH = "{components.tilelink.sizes.width}";
const TILE_HEIGHT = "{components.tilelink.sizes.height}";
const ICON_SIZE = "{components.tilelink.sizes.icon}";
/** `icons.chess.figmaName` : nom de repli (policy "modifiable"). */
const ICON_FALLBACK = "chess";

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
  onMouseEnter,
  onMouseLeave,
  style,
  ...rest
}: TileLinkProps) {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = useCallback<NonNullable<TileLinkProps["onMouseEnter"]>>((event) => {
    setHovered(true);
    onMouseEnter?.(event);
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback<NonNullable<TileLinkProps["onMouseLeave"]>>((event) => {
    setHovered(false);
    onMouseLeave?.(event);
  }, [onMouseLeave]);

  const state = STATE_PRECEDENCE.find((candidate) => candidate === "default" || hovered) ?? "default";
  const entry = VARIANTS[variant][state];

  const rootStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: tokenVar(TILE_WIDTH),
    height: tokenVar(TILE_HEIGHT),
    backgroundColor: tokenVar(entry.background),
    textDecoration: "none",
    ...style,
  };

  return (
    <a
      style={rootStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <ContractIcon name={chessName ?? ICON_FALLBACK} sizeToken={ICON_SIZE} color={tokenVar(entry.foreground)} />
    </a>
  );
}

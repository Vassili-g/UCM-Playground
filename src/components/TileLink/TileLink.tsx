import { useState, type AnchorHTMLAttributes, type CSSProperties } from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type { TileLinkVariant } from "../../generated/contracts/TileLink.ts";

export type { TileLinkVariant };

/**
 * Nom d'icône du kit de l'application. Le contrat le porte comme une chaîne
 * opaque : `chessName` peut désigner n'importe quel glyphe, `figmaName` sert de
 * repli.
 */
export type TileLinkIconName = string;

/** Axe d'états du contrat (`stateModel.axis`). */
type TileLinkState = "default" | "hover";

/**
 * Feuilles de couleurs des variantes réellement présentes dans Figma
 * (`variants[].tokens`). Recopiées en toutes lettres : un chemin assemblé à
 * l'exécution ne serait plus comparable au contrat.
 */
const COLORS: Record<TileLinkVariant, Record<TileLinkState, { background: string; foreground: string }>> = {
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

/** `structure.sizing` : deux dimensions que le design system a nommées. */
const WIDTH = "{components.tilelink.sizes.width}";
const HEIGHT = "{components.tilelink.sizes.height}";

/** `icons.chess` : carré occupé par l'icône et repli de son nom. */
const ICON_SIZE = "{components.tilelink.sizes.icon}";
const ICON_FIGMA_NAME = "chess";

/** Props visuelles déclarées par le contrat. */
interface TileLinkContractProps {
  variant?: TileLinkVariant;
  /** `props.chessName.default` vaut `null` : le repli est alors `figmaName`. */
  chessName?: TileLinkIconName | null;
}

export interface TileLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TileLinkContractProps>,
    TileLinkContractProps {}

/**
 * Composant de lien vers une autre page sous la forme d'une tuile carrée
 * (`intent.usage`).
 *
 * Reconstruction en contexte froid : écrite depuis le seul
 * `TileLink.contract.json` (10.1) et le skill `consommer-contrat`.
 *
 * L'état `hover` du contrat correspond à `:hover`. Ces styles étant inline, il
 * est suivi par les événements Pointer, qui couvrent souris et tactile.
 */
export function TileLink({
  variant = "info",
  chessName,
  style,
  onPointerEnter,
  onPointerLeave,
  onPointerCancel,
  ...rest
}: TileLinkProps) {
  const [hovered, setHovered] = useState(false);
  const colors = COLORS[variant][hovered ? "hover" : "default"];

  /** `structure` : flex-row centré sur les deux axes, sans gap ni padding. */
  const rootStyle: CSSProperties = {
    alignItems: "center",
    backgroundColor: tokenVar(colors.background),
    color: tokenVar(colors.foreground),
    display: "flex",
    flexDirection: "row",
    height: tokenVar(HEIGHT),
    justifyContent: "center",
    width: tokenVar(WIDTH),
    ...style,
  };

  return (
    <a
      {...rest}
      style={rootStyle}
      onPointerEnter={(event) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        onPointerLeave?.(event);
      }}
      onPointerCancel={(event) => {
        setHovered(false);
        onPointerCancel?.(event);
      }}
    >
      <ContractIcon name={chessName ?? ICON_FIGMA_NAME} sizeToken={ICON_SIZE} />
    </a>
  );
}

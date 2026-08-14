/**
 * TileLink — reconstruction à froid depuis `TileLink.contract.json` (5.0).
 *
 * `intent.usage` : « Composant de lien vers une autre page sous la forme d'une
 * tuile carrée ». C'est ce qui fait de l'élément rendu une ancre : le contrat
 * décrit la tuile, la navigation appartient au code.
 *
 * Les styles sont inline et les états suivis par événements, comme tout
 * composant de validation du playground : `stateModel` donne `:hover` pour la
 * production, que des styles inline ne savent pas exprimer.
 */
import { useState } from "react";
import type { AnchorHTMLAttributes, CSSProperties, PointerEvent } from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type { TileLinkVariant } from "../../generated/contracts/TileLink.ts";

export type { TileLinkVariant };

/** Nom d'icône opaque : le contrat ne restreint pas les valeurs runtime. */
export type TileLinkIconName = string;

/**
 * `structure.variantTokens`, transcrit tel quel.
 *
 * Les axes sont `["variant", "state"]`, dans cet ordre : deux niveaux, une
 * feuille par combinaison. Chaque feuille décrit un état visuel COMPLET — on
 * ne reprend jamais un rôle depuis `default` pour compléter `hover`.
 */
const TOKENS_DE_VARIANTE = {
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
} as const;

/**
 * `icons.chess` — politique `modifiable`, sans booléen de visibilité.
 *
 * Le contrat ne publie aucune `visibilityProp` pour ce calque : rien ne peut
 * le masquer, l'icône est donc toujours rendue. `chessName` ne décide que de
 * QUELLE icône afficher, et `figmaName` sert de repli quand elle vaut `null`.
 */
const ICONE_CHESS = {
  figmaName: "chess",
  size: "{components.tilelink.sizes.icon}",
} as const;

/** Les props que le contrat déclare, et elles seules. */
interface TileLinkContractProps {
  /** `props.variant` — « info » ou « success ». */
  variant?: TileLinkVariant;
  /** `props.chessName` — icône modifiable, `null` par défaut au contrat. */
  chessName?: TileLinkIconName | null;
}

/**
 * L'espace de noms des props appartient au contrat : les attributs d'ancre
 * homonymes sont retirés mécaniquement, jamais par une liste tenue à la main.
 */
export interface TileLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TileLinkContractProps>,
    TileLinkContractProps {}

export function TileLink({
  variant = "info",
  chessName = null,
  onPointerEnter,
  onPointerLeave,
  style,
  ...attributsNatifs
}: TileLinkProps) {
  const [survole, setSurvole] = useState(false);

  // `stateModel.precedence` vaut ["hover", "default"] : avec deux états
  // seulement, le survol l'emporte et l'absence de survol vaut « default ».
  const etat = survole ? "hover" : "default";
  const tokens = TOKENS_DE_VARIANTE[variant][etat];

  const entrerEnSurvol = (evenement: PointerEvent<HTMLAnchorElement>) => {
    setSurvole(true);
    onPointerEnter?.(evenement);
  };
  const quitterLeSurvol = (evenement: PointerEvent<HTMLAnchorElement>) => {
    setSurvole(false);
    onPointerLeave?.(evenement);
  };

  const styleTuile: CSSProperties = {
    // `structure.alignItems` et `structure.justifyContent`, recopiés.
    alignItems: "center",
    justifyContent: "center",
    // Rôles `background` et `foreground` de la feuille courante, peints selon
    // `rendering.roles`. `color` porte aussi la couleur du glyphe.
    backgroundColor: tokenVar(tokens.background),
    color: tokenVar(tokens.foreground),
    display: "flex",
    // `structure.layout` vaut « flex-row ».
    flexDirection: "row",
    // `structure.sizing` vaut `stretch` sur les deux axes : la tuile occupe la
    // place qu'on lui donne. La technique appartient au code, l'intention au
    // contrat.
    height: "100%",
    width: "100%",
    // `gap`, `padding` et `radius` valent `null` au contrat : rien à poser.
    ...style,
  };

  return (
    <a
      {...attributsNatifs}
      onPointerEnter={entrerEnSurvol}
      onPointerLeave={quitterLeSurvol}
      style={styleTuile}
    >
      {/* Unique slot de `structure.children`, rôle « icon ». */}
      <ContractIcon
        name={chessName ?? ICONE_CHESS.figmaName}
        sizeToken={ICONE_CHESS.size}
      />
    </a>
  );
}

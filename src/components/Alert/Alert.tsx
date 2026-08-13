import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Button, type ButtonProps } from "../Button/index.ts";
import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  AlertSeverity,
  AlertVariant,
} from "../../generated/contracts/Alert.ts";

export type { AlertSeverity, AlertVariant };

/** Styles de texte déclarés par `textStyles`. */
type AlertTextStyle = "body.large" | "body.small";

interface AlertPaint {
  readonly background?: string;
  readonly icon?: string;
  readonly foreground?: string;
}

interface AlertStroke {
  readonly color: string;
  readonly width: string | null;
}

interface AlertStrokes {
  readonly border?: AlertStroke;
}

interface TypographyUsage {
  readonly slotPath: readonly string[];
  readonly style: AlertTextStyle;
}

/** `structure.variantAxes` vaut ["severity", "variant"] : `stateModel` est nul. */
type ByVariant<T> = Record<AlertSeverity, Record<AlertVariant, T>>;

/** `structure.variantTokens`, transcrit feuille par feuille. */
const PAINTS: ByVariant<AlertPaint> = {
  info: {
    standard: { background: "{components.alert.colors.info.standard.background}", icon: "{components.alert.colors.info.standard.icon}", foreground: "{components.alert.colors.info.standard.foreground}" },
    outlined: { icon: "{components.alert.colors.info.outlined.icon}", foreground: "{components.alert.colors.info.outlined.foreground}" },
  },
  success: {
    standard: { background: "{components.alert.colors.success.standard.background}", icon: "{components.alert.colors.success.standard.icon}", foreground: "{components.alert.colors.success.standard.foreground}" },
    outlined: { icon: "{components.alert.colors.success.outlined.icon}", foreground: "{components.alert.colors.success.outlined.foreground}" },
  },
  warning: {
    standard: { background: "{components.alert.colors.warning.standard.background}", icon: "{components.alert.colors.warning.standard.icon}", foreground: "{components.alert.colors.warning.standard.foreground}" },
    outlined: { icon: "{components.alert.colors.warning.outlined.icon}", foreground: "{components.alert.colors.warning.outlined.foreground}" },
  },
  error: {
    standard: { background: "{components.alert.colors.error.standard.background}", icon: "{components.alert.colors.error.standard.icon}", foreground: "{components.alert.colors.error.standard.foreground}" },
    outlined: { icon: "{components.alert.colors.error.outlined.icon}", foreground: "{components.alert.colors.error.outlined.foreground}" },
  },
};

/** `structure.variantStrokes` : bordure intérieure sur la variante contourée. */
const STROKES: ByVariant<AlertStrokes> = {
  info: {
    standard: {},
    outlined: { border: { color: "{components.alert.colors.info.outlined.border}", width: "{layouts.stroke.outline}" } },
  },
  success: {
    standard: {},
    outlined: { border: { color: "{components.alert.colors.success.outlined.border}", width: "{layouts.stroke.outline}" } },
  },
  warning: {
    standard: {},
    outlined: { border: { color: "{components.alert.colors.warning.outlined.border}", width: "{layouts.stroke.outline}" } },
  },
  error: {
    standard: {},
    outlined: { border: { color: "{components.alert.colors.error.outlined.border}", width: "{layouts.stroke.outline}" } },
  },
};

/** `structure.variantTypography` : quel style pour quel chemin de slots. */
const TYPOGRAPHY: ByVariant<readonly TypographyUsage[]> = {
  info: {
    standard: [
      { slotPath: ["label", "label"], style: "body.large" },
      { slotPath: ["label", "label-2"], style: "body.small" },
    ],
    outlined: [
      { slotPath: ["label", "label"], style: "body.large" },
      { slotPath: ["label", "label-2"], style: "body.small" },
    ],
  },
  success: {
    standard: [
      { slotPath: ["label", "label"], style: "body.large" },
      { slotPath: ["label", "label-2"], style: "body.small" },
    ],
    outlined: [
      { slotPath: ["label", "label"], style: "body.large" },
      { slotPath: ["label", "label-2"], style: "body.small" },
    ],
  },
  warning: {
    standard: [
      { slotPath: ["label", "label"], style: "body.large" },
      { slotPath: ["label", "label-2"], style: "body.small" },
    ],
    outlined: [
      { slotPath: ["label", "label"], style: "body.large" },
      { slotPath: ["label", "label-2"], style: "body.small" },
    ],
  },
  error: {
    standard: [
      { slotPath: ["label", "label"], style: "body.large" },
      { slotPath: ["label", "label-2"], style: "body.small" },
    ],
    outlined: [
      { slotPath: ["label", "label"], style: "body.large" },
      { slotPath: ["label", "label-2"], style: "body.small" },
    ],
  },
};

/** `textStyles` : toutes les propriétés typographiques viennent du text style. */
const TEXT_STYLES: Record<AlertTextStyle, {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly fontWeight: string;
  readonly lineHeight: string;
  readonly letterSpacing: string;
}> = {
  "body.large": {
    fontFamily: "{primitives.fontfamily.base}",
    fontSize: "{typography.body.large.fontsize}",
    fontWeight: "{typography.body.large.fontweight}",
    lineHeight: "{typography.body.large.lineheight}",
    letterSpacing: "{typography.body.large.letterspacing}",
  },
  "body.small": {
    fontFamily: "{primitives.fontfamily.base}",
    fontSize: "{typography.body.small.fontsize}",
    fontWeight: "{typography.body.small.fontweight}",
    lineHeight: "{typography.body.small.lineheight}",
    letterSpacing: "{typography.body.small.letterspacing}",
  },
};

/**
 * `icons` — politique `strict` : le contrat nomme la seule icône valide pour
 * chaque combinaison, et aucune prop runtime ne l'expose. Les listes
 * `variants` sont recopiées telles quelles.
 */
const ICONS: readonly {
  readonly key: string;
  readonly figmaName: string;
  readonly size: string;
  readonly variants: readonly { readonly severity: AlertSeverity; readonly variant: AlertVariant }[];
}[] = [
  {
    key: "circleInfo",
    figmaName: "circle-info",
    size: "{components.icons.sizes.base}",
    variants: [
      { severity: "info", variant: "standard" },
      { severity: "info", variant: "outlined" },
    ],
  },
  {
    key: "circleCheck",
    figmaName: "circle-check",
    size: "{components.icons.sizes.base}",
    variants: [
      { severity: "success", variant: "standard" },
      { severity: "success", variant: "outlined" },
    ],
  },
  {
    key: "triangleExclamation",
    figmaName: "triangle-exclamation",
    size: "{components.icons.sizes.base}",
    variants: [
      { severity: "warning", variant: "standard" },
      { severity: "warning", variant: "outlined" },
      { severity: "error", variant: "standard" },
      { severity: "error", variant: "outlined" },
    ],
  },
];

/** `structure` : sans axe de tailles, les dimensions vivent au niveau haut. */
const GAP = "{components.alert.sizes.gap}";
const PADDING_X = "{components.alert.sizes.padding-x}";
const PADDING_Y = "{components.alert.sizes.padding-y}";
const RADIUS = "{components.alert.sizes.border-radius}";

/** Chemins de slots des parties textuelles, tels que `variantTypography` les nomme. */
const SLOT_PATH_TITLE = ["label", "label"] as const;
const SLOT_PATH_DESCRIPTION = ["label", "label-2"] as const;

function textStyleOf(
  usages: readonly TypographyUsage[],
  slotPath: readonly string[],
): CSSProperties {
  const usage = usages.find(
    (candidate) =>
      candidate.slotPath.length === slotPath.length
      && candidate.slotPath.every((slot, index) => slot === slotPath[index]),
  );
  if (!usage) {
    return {};
  }
  const style = TEXT_STYLES[usage.style];
  return {
    fontFamily: tokenVar(style.fontFamily),
    fontSize: tokenVar(style.fontSize),
    fontWeight: tokenVar(style.fontWeight),
    letterSpacing: tokenVar(style.letterSpacing),
    lineHeight: tokenVar(style.lineHeight),
  };
}

function iconOf(severity: AlertSeverity, variant: AlertVariant) {
  return ICONS.find((icon) =>
    icon.variants.some(
      (combination) => combination.severity === severity && combination.variant === variant,
    ),
  );
}

/** Surface publique issue du contrat ; elle l'emporte sur l'attribut natif homonyme. */
interface AlertContractProps {
  /** `props.icon` — affiche ou masque l'icône. */
  icon?: boolean;
  /** `props.title` — affiche ou masque le titre. Booléen, pas l'infobulle HTML. */
  title?: boolean;
  /** `props.action` — affiche ou masque le bouton d'action. */
  action?: boolean;
  /** `props.severity` */
  severity?: AlertSeverity;
  /** `props.variant` */
  variant?: AlertVariant;
}

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof AlertContractProps>,
    AlertContractProps {
  /** Contenu applicatif du slot de titre. */
  titleContent?: ReactNode;
  /** Props applicatives du Button composé dans le slot d'action. */
  actionProps?: ButtonProps;
}

/**
 * Alert — contrat 4.8, `Alert.contract.json`.
 *
 * `stateModel` est nul : le composant n'a pas d'axe d'état.
 */
export function Alert({
  icon = true,
  title = true,
  action = true,
  severity = "info",
  variant = "standard",
  titleContent,
  actionProps,
  children,
  style,
  ...rest
}: AlertProps) {
  const paint = PAINTS[severity][variant];
  const stroke = STROKES[severity][variant];
  const usages = TYPOGRAPHY[severity][variant];
  const glyph = iconOf(severity, variant);

  const border = stroke.border && stroke.border.width !== null
    ? {
        borderColor: tokenVar(stroke.border.color),
        borderStyle: "solid" as const,
        borderWidth: tokenVar(stroke.border.width),
      }
    // Aucune bordure au contrat : rien à peindre, pas d'épaisseur devinée.
    : { borderStyle: "none" as const };

  return (
    <div
      role="alert"
      {...rest}
      style={{
        alignItems: "center",
        backgroundColor: paint.background ? tokenVar(paint.background) : "transparent",
        borderRadius: tokenVar(RADIUS),
        boxSizing: "border-box",
        color: paint.foreground ? tokenVar(paint.foreground) : undefined,
        display: "flex",
        flexDirection: "row",
        gap: tokenVar(GAP),
        height: "fit-content",
        justifyContent: "flex-start",
        paddingBlock: tokenVar(PADDING_Y),
        paddingInline: tokenVar(PADDING_X),
        // `structure.sizing`, en vocabulaire CSS : comment le composant occupe
        // la place qu'on lui donne, sur chaque axe.
        width: "stretch",
        ...border,
        ...style,
      }}
    >
      {icon && glyph ? (
        <ContractIcon
          name={glyph.figmaName}
          sizeToken={glyph.size}
          color={paint.icon ? tokenVar(paint.icon) : undefined}
        />
      ) : null}
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        {title ? <span style={textStyleOf(usages, SLOT_PATH_TITLE)}>{titleContent}</span> : null}
        <span style={textStyleOf(usages, SLOT_PATH_DESCRIPTION)}>{children}</span>
      </div>
      {action ? (
        <Button
          {...actionProps}
          style={{ alignSelf: "stretch", ...actionProps?.style }}
        />
      ) : null}
    </div>
  );
}

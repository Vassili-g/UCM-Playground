/**
 * Alert — reconstruit à froid depuis `Alert.contract.json` (contrat 4.3).
 *
 * `stateModel` vaut `null` : `variantTokens` n'a donc que deux niveaux,
 * `severity` puis `variant`, et aucun état n'est à peindre. Les dimensions
 * vivent au niveau haut de `structure`, faute d'axe de tailles.
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Button } from "../Button/index.ts";
import type { ButtonProps } from "../Button/index.ts";
import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  AlertSeverity,
  AlertVariant,
} from "../../generated/contracts/Alert.ts";

export type { AlertSeverity, AlertVariant };

/** Rôles de `variantTokens[severity][variant]`. */
interface Paint {
  background?: string;
  foreground: string;
  icon: string;
}

/** Rôle `border` de `variantStrokes[severity][variant]`. */
interface Stroke {
  color: string;
  width: string | null;
}

interface Strokes {
  border?: Stroke;
}

/** `structure.gap`, `structure.padding` et `structure.radius`. */
const GAP = "{components.alert.sizes.gap}";
const PADDING_X = "{components.alert.sizes.padding-x}";
const PADDING_Y = "{components.alert.sizes.padding-y}";
const RADIUS = "{components.alert.sizes.border-radius}";

/** `structure.children[].size` du slot `icon`. */
const ICON_SIZE = "{components.icons.sizes.base}";

const OUTLINE_WIDTH = "{layouts.stroke.outline}";

/** Typographie du slot `label` > `label` (calque « Titre »). */
const TITLE_TYPOGRAPHY = {
  fontSize: "{components.alert.sizes.title-size}",
  fontWeight: "{layouts.fontweight.600}",
  lineHeight: "{layouts.lineheight.sm}",
  fontFamily: "{layouts.fontfamily.base}",
};

/** Typographie du slot `label` > `label-2` (calque « Description »). */
const DESCRIPTION_TYPOGRAPHY = {
  fontSize: "{components.alert.sizes.description-size}",
  fontWeight: "{layouts.fontweight.400}",
  lineHeight: "{layouts.lineheight.sm}",
  fontFamily: "{layouts.fontfamily.base}",
};

const PAINTS: Record<AlertSeverity, Record<AlertVariant, Paint>> = {
  info: {
    standard: {
      background: "{components.alert.colors.info.standard.background}",
      icon: "{components.alert.colors.info.standard.icon}",
      foreground: "{components.alert.colors.info.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.info.outlined.icon}",
      foreground: "{components.alert.colors.info.outlined.foreground}",
    },
  },
  success: {
    standard: {
      background: "{components.alert.colors.success.standard.background}",
      icon: "{components.alert.colors.success.standard.icon}",
      foreground: "{components.alert.colors.success.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.success.outlined.icon}",
      foreground: "{components.alert.colors.success.outlined.foreground}",
    },
  },
  warning: {
    standard: {
      background: "{components.alert.colors.warning.standard.background}",
      icon: "{components.alert.colors.warning.standard.icon}",
      foreground: "{components.alert.colors.warning.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.warning.outlined.icon}",
      foreground: "{components.alert.colors.warning.outlined.foreground}",
    },
  },
  error: {
    standard: {
      background: "{components.alert.colors.error.standard.background}",
      icon: "{components.alert.colors.error.standard.icon}",
      foreground: "{components.alert.colors.error.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.error.outlined.icon}",
      foreground: "{components.alert.colors.error.outlined.foreground}",
    },
  },
};

const STROKES: Record<AlertSeverity, Record<AlertVariant, Strokes>> = {
  info: {
    standard: {},
    outlined: {
      border: {
        color: "{components.alert.colors.info.outlined.border}",
        width: OUTLINE_WIDTH,
      },
    },
  },
  success: {
    standard: {},
    outlined: {
      border: {
        color: "{components.alert.colors.success.outlined.border}",
        width: OUTLINE_WIDTH,
      },
    },
  },
  warning: {
    standard: {},
    outlined: {
      border: {
        color: "{components.alert.colors.warning.outlined.border}",
        width: OUTLINE_WIDTH,
      },
    },
  },
  error: {
    standard: {},
    outlined: {
      border: {
        color: "{components.alert.colors.error.outlined.border}",
        width: OUTLINE_WIDTH,
      },
    },
  },
};

/**
 * `icons.*` — trois icônes strictes partagent le slot `icon` et s'excluent
 * selon les axes du contrat. Chaque entrée reprend sa liste `variants` telle
 * quelle : c'est la donnée du contrat qui désigne l'icône, pas une règle
 * déduite de la sévérité.
 */
interface IconEntry {
  figmaName: string;
  variants: { severity: AlertSeverity; variant: AlertVariant }[];
}

const ICONS: IconEntry[] = [
  {
    figmaName: "circle-info",
    variants: [
      { severity: "info", variant: "standard" },
      { severity: "info", variant: "outlined" },
    ],
  },
  {
    figmaName: "circle-check",
    variants: [
      { severity: "success", variant: "standard" },
      { severity: "success", variant: "outlined" },
    ],
  },
  {
    figmaName: "triangle-exclamation",
    variants: [
      { severity: "warning", variant: "standard" },
      { severity: "warning", variant: "outlined" },
      { severity: "error", variant: "standard" },
      { severity: "error", variant: "outlined" },
    ],
  },
];

/**
 * `props.title` est un booléen de visibilité du contrat, alors que l'attribut
 * natif `title` est une chaîne : on écarte le natif plutôt que de renommer la
 * prop du contrat.
 */
export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** `props.severity` — défaut du contrat : `info`. */
  severity?: AlertSeverity;
  /** `props.variant` — défaut du contrat : `standard`. */
  variant?: AlertVariant;
  /** `props.icon` — affiche ou masque le slot `icon`. */
  icon?: boolean;
  /** `props.title` — affiche ou masque le slot `label` > `label`. */
  title?: boolean;
  /** `props.action` — affiche ou masque le slot `action`, qui compose Button. */
  action?: boolean;
  /** Contenu du slot `label` > `label` (calque « Titre »). */
  titleContent?: ReactNode;
  /** Configuration applicative du Button composé. */
  actionProps?: ButtonProps;
  /** Contenu du slot `label` > `label-2` (calque « Description »). */
  children?: ReactNode;
}

export function Alert({
  action = true,
  actionProps,
  children,
  icon = true,
  severity = "info",
  style,
  title = true,
  titleContent,
  variant = "standard",
  ...rest
}: AlertProps) {
  const paint = PAINTS[severity][variant];
  const strokes = STROKES[severity][variant];

  const iconEntry = ICONS.find((entry) =>
    entry.variants.some(
      (combination) =>
        combination.severity === severity && combination.variant === variant,
    ),
  );

  const rootStyle: CSSProperties = {
    alignItems: "flex-start",
    backgroundColor: paint.background
      ? tokenVar(paint.background)
      : "transparent",
    border:
      strokes.border && strokes.border.width !== null
        ? `${tokenVar(strokes.border.width)} solid ${tokenVar(strokes.border.color)}`
        : "none",
    borderRadius: tokenVar(RADIUS),
    boxSizing: "border-box",
    color: tokenVar(paint.foreground),
    display: "flex",
    flexDirection: "row",
    gap: tokenVar(GAP),
    padding: `${tokenVar(PADDING_Y)} ${tokenVar(PADDING_X)}`,
    ...style,
  };

  return (
    <div role="alert" style={rootStyle} {...rest}>
      {icon && iconEntry ? (
        <ContractIcon
          color={tokenVar(paint.icon)}
          name={iconEntry.figmaName}
          sizeToken={ICON_SIZE}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          flex: "1 1 auto",
          flexDirection: "column",
        }}
      >
        {title ? (
          <span
            style={{
              fontFamily: tokenVar(TITLE_TYPOGRAPHY.fontFamily),
              fontSize: tokenVar(TITLE_TYPOGRAPHY.fontSize),
              fontWeight: tokenVar(TITLE_TYPOGRAPHY.fontWeight),
              lineHeight: tokenVar(TITLE_TYPOGRAPHY.lineHeight),
            }}
          >
            {titleContent}
          </span>
        ) : null}
        <span
          style={{
            fontFamily: tokenVar(DESCRIPTION_TYPOGRAPHY.fontFamily),
            fontSize: tokenVar(DESCRIPTION_TYPOGRAPHY.fontSize),
            fontWeight: tokenVar(DESCRIPTION_TYPOGRAPHY.fontWeight),
            lineHeight: tokenVar(DESCRIPTION_TYPOGRAPHY.lineHeight),
          }}
        >
          {children}
        </span>
      </div>
      {action ? <Button {...actionProps} /> : null}
    </div>
  );
}

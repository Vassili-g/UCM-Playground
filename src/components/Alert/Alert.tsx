import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Button } from "../Button/Button.tsx";
import type { ButtonColor, ButtonProps, ButtonSize, ButtonVariant } from "../Button/Button.tsx";
import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type { AlertSeverity, AlertVariant } from "../../generated/contracts/Alert.ts";

export type { AlertSeverity, AlertVariant };

interface AlertStrokeLeaf {
  color: string;
  width: string;
  align: "inside" | "outside" | "center";
}

interface AlertVariantLeaf {
  tokens: {
    background?: string;
    icon: string;
    foreground: string;
  };
  strokes: {
    border?: AlertStrokeLeaf;
  };
}

/**
 * Feuilles de `variants[].tokens` et `variants[].strokes`, recopiées en
 * toutes lettres — voir Alert.contract.json. Chaque combinaison
 * severity/variant a la sienne ; aucune ne se déduit d'un chemin assemblé
 * à l'exécution (cf. skill « consommer-contrat », §0).
 */
const ALERT_VARIANTS: Record<AlertSeverity, Record<AlertVariant, AlertVariantLeaf>> = {
  info: {
    standard: {
      tokens: {
        background: "{components.alert.colors.info.standard.background}",
        icon: "{components.alert.colors.info.standard.icon}",
        foreground: "{components.alert.colors.info.standard.foreground}",
      },
      strokes: {},
    },
    outlined: {
      tokens: {
        icon: "{components.alert.colors.info.outlined.icon}",
        foreground: "{components.alert.colors.info.outlined.foreground}",
      },
      strokes: {
        border: {
          color: "{components.alert.colors.info.outlined.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
  },
  success: {
    standard: {
      tokens: {
        background: "{components.alert.colors.success.standard.background}",
        icon: "{components.alert.colors.success.standard.icon}",
        foreground: "{components.alert.colors.success.standard.foreground}",
      },
      strokes: {},
    },
    outlined: {
      tokens: {
        icon: "{components.alert.colors.success.outlined.icon}",
        foreground: "{components.alert.colors.success.outlined.foreground}",
      },
      strokes: {
        border: {
          color: "{components.alert.colors.success.outlined.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
  },
  warning: {
    standard: {
      tokens: {
        background: "{components.alert.colors.warning.standard.background}",
        icon: "{components.alert.colors.warning.standard.icon}",
        foreground: "{components.alert.colors.warning.standard.foreground}",
      },
      strokes: {},
    },
    outlined: {
      tokens: {
        icon: "{components.alert.colors.warning.outlined.icon}",
        foreground: "{components.alert.colors.warning.outlined.foreground}",
      },
      strokes: {
        border: {
          color: "{components.alert.colors.warning.outlined.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
  },
  error: {
    standard: {
      tokens: {
        background: "{components.alert.colors.error.standard.background}",
        icon: "{components.alert.colors.error.standard.icon}",
        foreground: "{components.alert.colors.error.standard.foreground}",
      },
      strokes: {},
    },
    outlined: {
      tokens: {
        icon: "{components.alert.colors.error.outlined.icon}",
        foreground: "{components.alert.colors.error.outlined.foreground}",
      },
      strokes: {
        border: {
          color: "{components.alert.colors.error.outlined.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
  },
};

/**
 * `icons.<clé>.figmaName`, indexé par sévérité — chaque icône `strict` du
 * contrat publie la liste des combinaisons où elle apparaît
 * (`icons.<clé>.variants`), et cette liste ne varie jamais avec `variant`
 * pour une sévérité donnée. La lire par sévérité est donc une simple
 * retranscription, pas une règle inventée.
 */
const ALERT_ICON_BY_SEVERITY: Record<AlertSeverity, string> = {
  info: "circle-info",
  success: "circle-check",
  warning: "triangle-exclamation",
  error: "triangle-exclamation",
};

const ICON_SIZE = "{components.icons.sizes.base}";

const ROOT_GAP = "{components.alert.sizes.gap}";
const ROOT_PADDING_X = "{components.alert.sizes.padding-x}";
const ROOT_PADDING_Y = "{components.alert.sizes.padding-y}";
const ROOT_RADIUS = "{components.alert.sizes.border-radius}";
const ROOT_JUSTIFY_CONTENT = "flex-start";
const ROOT_ALIGN_ITEMS = "center";

const LABEL_JUSTIFY_CONTENT = "center";
const LABEL_ALIGN_ITEMS = "flex-start";

const ACTION_JUSTIFY_CONTENT = "center";
const ACTION_ALIGN_ITEMS = "center";

/** `textStyles["body.large"].tokens` — slot `label > label` (titre). */
const TITLE_TEXT_STYLE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.large.fontsize}",
  fontWeight: "{typography.body.large.fontweight}",
  lineHeight: "{typography.body.large.lineheight}",
  letterSpacing: "{typography.body.large.letterspacing}",
};

/** `textStyles["body.small"].tokens` — slot `label > label-2` (description). */
const DESCRIPTION_TEXT_STYLE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.small.fontsize}",
  fontWeight: "{typography.body.small.fontweight}",
  lineHeight: "{typography.body.small.lineheight}",
  letterSpacing: "{typography.body.small.letterspacing}",
};

/** `samples.s1.text[].value` — défauts du contenu des slots `label` et `label-2`. */
const DEFAULT_TITLE_TEXT = "Titre";
const DEFAULT_DESCRIPTION_TEXT = "Description";

/**
 * `samples.s1.composes[0].args` / `.overrides` — la Alert de référence compose
 * toujours son `Button` avec ces props, quelle que soit la sévérité : un seul
 * échantillon existe dans le contrat, partagé par les huit combinaisons
 * (`variants[].sample` vaut `"s1"` partout). `state` est un axe, pas une prop,
 * et ne se rend pas (skill « consommer-contrat », §7).
 */
const ACTION_BUTTON_COLOR: ButtonColor = "info";
const ACTION_BUTTON_VARIANT: ButtonVariant = "text";
const ACTION_BUTTON_SIZE: ButtonSize = "small";
const DEFAULT_ACTION_LABEL = "Action";

/**
 * `rendering.roles.border` : un stroke se rend en `box-shadow`, jamais en
 * bordure CSS, pour ne pas pousser la mise en page (skill « consommer-contrat
 * », §3). `align` en donne la forme.
 */
function strokeBoxShadow(stroke: AlertStrokeLeaf | undefined): string | undefined {
  if (!stroke) return undefined;
  const width = tokenVar(stroke.width);
  const color = tokenVar(stroke.color);
  if (stroke.align === "inside") return `inset 0 0 0 ${width} ${color}`;
  if (stroke.align === "outside") return `0 0 0 ${width} ${color}`;
  return `0 0 0 calc(${width} / 2) ${color}`;
}

interface AlertContractProps {
  icon?: boolean;
  title?: boolean;
  action?: boolean;
  severity?: AlertSeverity;
  variant?: AlertVariant;
}

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof AlertContractProps>,
    AlertContractProps {
  /** Contenu du slot `label > label` (titre) — hors surface du contrat, qui n'en publie que la visibilité. */
  titleContent?: ReactNode;
  /** Contenu du slot `label > label-2` (description) — hors surface du contrat. */
  children?: ReactNode;
  /**
   * Props applicatives transmises au `Button` composé dans le slot `action`
   * (couleur, libellé, gestionnaires d'événements…) — hors surface du
   * contrat, qui ne publie que la visibilité de ce slot via `action`.
   */
  actionProps?: ButtonProps;
}

/**
 * Message à but informatif (`intent.usage`), affiché de façon brève ou inclus
 * dans le contenu de la page selon `variant`. `severity` choisit la couleur
 * et l'icône associée — `strict`, non modifiable par une prop runtime.
 * `stateModel` vaut `null` : Alert ne suit aucun état interactif.
 */
export function Alert({
  icon = true,
  title = true,
  action = true,
  severity = "info",
  variant = "standard",
  titleContent = DEFAULT_TITLE_TEXT,
  children = DEFAULT_DESCRIPTION_TEXT,
  actionProps,
  style,
  ...rest
}: AlertProps) {
  const leaf = ALERT_VARIANTS[severity][variant];
  const iconFigmaName = ALERT_ICON_BY_SEVERITY[severity];

  const foreground = tokenVar(leaf.tokens.foreground);
  const iconColor = tokenVar(leaf.tokens.icon);
  const borderShadow = strokeBoxShadow(leaf.strokes.border);

  return (
    <div
      {...rest}
      role="alert"
      style={{
        alignItems: ROOT_ALIGN_ITEMS,
        backgroundColor: leaf.tokens.background ? tokenVar(leaf.tokens.background) : undefined,
        borderRadius: tokenVar(ROOT_RADIUS),
        boxShadow: borderShadow,
        display: "flex",
        flexDirection: "row",
        gap: tokenVar(ROOT_GAP),
        height: "fit-content",
        justifyContent: ROOT_JUSTIFY_CONTENT,
        padding: `${tokenVar(ROOT_PADDING_Y)} ${tokenVar(ROOT_PADDING_X)}`,
        width: "100%",
        ...style,
      } as CSSProperties}
    >
      {icon && (
        <ContractIcon name={iconFigmaName} sizeToken={ICON_SIZE} color={iconColor} />
      )}
      <div
        style={{
          alignItems: LABEL_ALIGN_ITEMS,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: LABEL_JUSTIFY_CONTENT,
        }}
      >
        {title && (
          <span
            style={{
              color: foreground,
              fontFamily: tokenVar(TITLE_TEXT_STYLE.fontFamily),
              fontSize: tokenVar(TITLE_TEXT_STYLE.fontSize),
              fontWeight: tokenVar(TITLE_TEXT_STYLE.fontWeight),
              letterSpacing: tokenVar(TITLE_TEXT_STYLE.letterSpacing),
              lineHeight: tokenVar(TITLE_TEXT_STYLE.lineHeight),
            }}
          >
            {titleContent}
          </span>
        )}
        <span
          style={{
            color: foreground,
            fontFamily: tokenVar(DESCRIPTION_TEXT_STYLE.fontFamily),
            fontSize: tokenVar(DESCRIPTION_TEXT_STYLE.fontSize),
            fontWeight: tokenVar(DESCRIPTION_TEXT_STYLE.fontWeight),
            letterSpacing: tokenVar(DESCRIPTION_TEXT_STYLE.letterSpacing),
            lineHeight: tokenVar(DESCRIPTION_TEXT_STYLE.lineHeight),
          }}
        >
          {children}
        </span>
      </div>
      {action && (
        <div
          style={{
            alignItems: ACTION_ALIGN_ITEMS,
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            justifyContent: ACTION_JUSTIFY_CONTENT,
          }}
        >
          <Button
            color={ACTION_BUTTON_COLOR}
            iconLeft={false}
            iconRight={false}
            label
            size={ACTION_BUTTON_SIZE}
            variant={ACTION_BUTTON_VARIANT}
            {...actionProps}
            style={{ alignSelf: "stretch", ...actionProps?.style }}
          >
            {actionProps?.children ?? DEFAULT_ACTION_LABEL}
          </Button>
        </div>
      )}
    </div>
  );
}

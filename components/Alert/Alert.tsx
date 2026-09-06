import * as React from "react";
import { Button } from "../Button/Button";

export type AlertSeverity = "info" | "success" | "warning" | "error";
export type AlertVariant = "standard" | "outlined";

export interface AlertProps {
  icon?: boolean;
  title?: boolean;
  action?: boolean;
  severity?: AlertSeverity;
  variant?: AlertVariant;
  titleText?: React.ReactNode;
  description?: React.ReactNode;
  actionLabel?: React.ReactNode;
  onAction?: () => void;
  className?: string;
}

// La référence du contrat donne le nom de la variable : tout ce qui n'est ni
// lettre ni chiffre devient un tiret, comme dans style-dictionary.config.mjs.
const tk = (ref: string) =>
  `var(--${ref.slice(1, -1).toLowerCase().replace(/[^a-z0-9]+/g, "-")})`;

const GAP = tk("{components.alert.sizes.gap}");
const PADDING_X = tk("{components.alert.sizes.padding-x}");
const PADDING_Y = tk("{components.alert.sizes.padding-y}");
const RADIUS = tk("{components.alert.sizes.border-radius}");
const ICON_SIZE = tk("{components.icons.sizes.base}");

const BODY_LARGE = {
  fontFamily: tk("{primitives.fontfamily.base}"),
  fontSize: tk("{typography.body.large.fontsize}"),
  fontWeight: tk("{typography.body.large.fontweight}"),
  lineHeight: tk("{typography.body.large.lineheight}"),
  letterSpacing: tk("{typography.body.large.letterspacing}"),
};
const BODY_SMALL = {
  fontFamily: tk("{primitives.fontfamily.base}"),
  fontSize: tk("{typography.body.small.fontsize}"),
  fontWeight: tk("{typography.body.small.fontweight}"),
  lineHeight: tk("{typography.body.small.lineheight}"),
  letterSpacing: tk("{typography.body.small.letterspacing}"),
};

interface VariantEntry {
  severity: AlertSeverity;
  variant: AlertVariant;
  tokens: { background?: string; icon: string; foreground: string };
  strokes?: { border?: { color: string; width: string; align: "inside" | "outside" | "center" } };
}

// Transcription littérale de `variants[]` du contrat.
const VARIANTS: VariantEntry[] = [
  { severity: "info", variant: "standard", tokens: { background: "{components.alert.colors.info.standard.background}", icon: "{components.alert.colors.info.standard.icon}", foreground: "{components.alert.colors.info.standard.foreground}" } },
  { severity: "info", variant: "outlined", tokens: { icon: "{components.alert.colors.info.outlined.icon}", foreground: "{components.alert.colors.info.outlined.foreground}" }, strokes: { border: { color: "{components.alert.colors.info.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { severity: "success", variant: "standard", tokens: { background: "{components.alert.colors.success.standard.background}", icon: "{components.alert.colors.success.standard.icon}", foreground: "{components.alert.colors.success.standard.foreground}" } },
  { severity: "success", variant: "outlined", tokens: { icon: "{components.alert.colors.success.outlined.icon}", foreground: "{components.alert.colors.success.outlined.foreground}" }, strokes: { border: { color: "{components.alert.colors.success.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { severity: "warning", variant: "standard", tokens: { background: "{components.alert.colors.warning.standard.background}", icon: "{components.alert.colors.warning.standard.icon}", foreground: "{components.alert.colors.warning.standard.foreground}" } },
  { severity: "warning", variant: "outlined", tokens: { icon: "{components.alert.colors.warning.outlined.icon}", foreground: "{components.alert.colors.warning.outlined.foreground}" }, strokes: { border: { color: "{components.alert.colors.warning.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { severity: "error", variant: "standard", tokens: { background: "{components.alert.colors.error.standard.background}", icon: "{components.alert.colors.error.standard.icon}", foreground: "{components.alert.colors.error.standard.foreground}" } },
  { severity: "error", variant: "outlined", tokens: { icon: "{components.alert.colors.error.outlined.icon}", foreground: "{components.alert.colors.error.outlined.foreground}" }, strokes: { border: { color: "{components.alert.colors.error.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
];

// Transcription littérale de `icons.*.variants` (choix strict par sévérité).
const ICON_BY_SEVERITY: Record<AlertSeverity, string> = {
  info: "circle-info",
  success: "circle-check",
  warning: "triangle-exclamation",
  error: "triangle-exclamation",
};

// Transcription littérale de `samples.*.composes[0].args` (couleur du Button
// d'action, par sévérité).
const ACTION_BUTTON_COLOR: Record<AlertSeverity, "info" | "success" | "warning" | "error"> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

function findVariant(severity: AlertSeverity, variant: AlertVariant) {
  return VARIANTS.find((v) => v.severity === severity && v.variant === variant);
}

export function Alert({
  icon = true,
  title = true,
  action = true,
  severity = "info",
  variant = "standard",
  titleText = "Titre",
  description = "Description",
  actionLabel = "Action",
  onAction,
  className,
}: AlertProps) {
  const entry = findVariant(severity, variant);
  if (!entry) {
    console.warn(`Alert: aucune entrée de contrat pour ${severity}/${variant}`);
  }

  const rootStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "fit-content",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: GAP,
    padding: `${PADDING_Y} ${PADDING_X}`,
    borderRadius: RADIUS,
    backgroundColor: entry?.tokens.background ? tk(entry.tokens.background) : undefined,
    boxShadow: entry?.strokes?.border
      ? `inset 0 0 0 ${tk(entry.strokes.border.width)} ${tk(entry.strokes.border.color)}`
      : undefined,
  };

  const iconColor = entry ? tk(entry.tokens.icon) : undefined;
  const foregroundColor = entry ? tk(entry.tokens.foreground) : undefined;

  return (
    <div className={["ucm-alert", className].filter(Boolean).join(" ")} style={rootStyle}>
      {icon && (
        <span
          aria-hidden="true"
          data-icon={ICON_BY_SEVERITY[severity]}
          style={{ width: ICON_SIZE, height: ICON_SIZE, display: "inline-block", flexShrink: 0, color: iconColor, fill: iconColor }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "flex-start",
          color: foregroundColor,
        }}
      >
        {title && (
          <span
            style={{
              fontFamily: BODY_LARGE.fontFamily,
              fontSize: BODY_LARGE.fontSize,
              fontWeight: BODY_LARGE.fontWeight,
              lineHeight: BODY_LARGE.lineHeight,
              letterSpacing: BODY_LARGE.letterSpacing,
            }}
          >
            {titleText}
          </span>
        )}
        <span
          style={{
            fontFamily: BODY_SMALL.fontFamily,
            fontSize: BODY_SMALL.fontSize,
            fontWeight: BODY_SMALL.fontWeight,
            lineHeight: BODY_SMALL.lineHeight,
            letterSpacing: BODY_SMALL.letterSpacing,
          }}
        >
          {description}
        </span>
      </div>
      {action && (
        <div
          style={{
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            color={ACTION_BUTTON_COLOR[severity]}
            variant="text"
            size="small"
            iconLeft={false}
            iconRight={false}
            label
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Alert;

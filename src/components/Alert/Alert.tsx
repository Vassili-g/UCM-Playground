import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";

import type {
  AlertSeverity,
  AlertVariant,
} from "../../generated/contracts/Alert.ts";
import { tokenVar } from "../../tokens.ts";
import { Button, type ButtonProps } from "../Button/index.ts";
import { ContractIcon } from "../ContractIcon.tsx";

export type { AlertSeverity, AlertVariant };

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: boolean;
  title?: boolean;
  action?: boolean;
  severity?: AlertSeverity;
  variant?: AlertVariant;
  titleContent?: ReactNode;
  actionProps?: ButtonProps;
  children?: ReactNode;
}

const ICON_SIZE = "{components.icons.sizes.base}";
const GAP = "{components.alert.sizes.gap}";
const PADDING_X = "{components.alert.sizes.padding-x}";
const PADDING_Y = "{components.alert.sizes.padding-y}";
const RADIUS = "{components.alert.sizes.border-radius}";
const TITLE_SIZE = "{components.alert.sizes.title-size}";
const FONT_WEIGHT = "{layouts.fontweight.600}";
const LINE_HEIGHT = "{layouts.lineheight.sm}";
const FONT_FAMILY = "{layouts.fontfamily.base}";
const OUTLINE_WIDTH = "{layouts.stroke.outline}";

const ICON_NAMES: Record<AlertSeverity, string> = {
  info: "circle-info",
  success: "circle-check",
  warning: "triangle-exclamation",
  error: "triangle-exclamation",
};

function colorToken(
  severity: AlertSeverity,
  variant: AlertVariant,
  role: "background" | "foreground" | "icon" | "border",
): string {
  return `{components.alert.colors.${severity}.${variant}.${role}}`;
}

function alertVisualStyle(
  severity: AlertSeverity,
  variant: AlertVariant,
): CSSProperties {
  const outlined = variant === "outlined";

  return {
    background: outlined
      ? "none"
      : tokenVar(colorToken(severity, variant, "background")),
    borderColor: outlined
      ? tokenVar(colorToken(severity, variant, "border"))
      : undefined,
    borderStyle: outlined ? "solid" : "none",
    borderWidth: outlined ? tokenVar(OUTLINE_WIDTH) : undefined,
    borderRadius: tokenVar(RADIUS),
    boxSizing: "border-box",
    color: tokenVar(colorToken(severity, variant, "foreground")),
    display: "flex",
    flexDirection: "row",
    gap: tokenVar(GAP),
    paddingBlock: tokenVar(PADDING_Y),
    paddingInline: tokenVar(PADDING_X),
  };
}

const LABEL_STYLE: CSSProperties = {
  fontFamily: tokenVar(FONT_FAMILY),
  fontSize: tokenVar(TITLE_SIZE),
  fontWeight: tokenVar(FONT_WEIGHT),
  lineHeight: tokenVar(LINE_HEIGHT),
};

export function Alert({
  icon = true,
  title = true,
  action = true,
  severity = "info",
  variant = "standard",
  titleContent,
  actionProps,
  children,
  role = "alert",
  style,
  ...nativeProps
}: AlertProps) {
  return (
    <div
      {...nativeProps}
      role={role}
      style={{
        ...style,
        ...alertVisualStyle(severity, variant),
      }}
    >
      {icon ? (
        <ContractIcon
          color={tokenVar(colorToken(severity, variant, "icon"))}
          name={ICON_NAMES[severity]}
          sizeToken={ICON_SIZE}
        />
      ) : null}
      <div style={LABEL_STYLE}>
        {title ? <div>{titleContent}</div> : null}
        {children}
      </div>
      {action ? <Button {...actionProps} /> : null}
    </div>
  );
}

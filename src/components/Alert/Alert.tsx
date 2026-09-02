/**
 * Transcription statique de Alert.contract.json (v10.3) — ne lit ni
 * n'interprète le JSON au runtime. Voir src/components/Alert/Alert.contract.json.
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import type { AlertSeverity, AlertVariant } from "../../generated/contracts/Alert.ts";
import { tokenVar } from "../../tokens.ts";
import { Button, type ButtonProps } from "../Button/Button.tsx";
import { ContractIcon } from "../ContractIcon.tsx";

export type { AlertSeverity, AlertVariant };

interface AlertVariantEntry {
  background?: string;
  icon: string;
  foreground: string;
  border?: { color: string; width: string; align: "inside" };
}

/** Table littérale transcrite de `variants` (4 sévérités × 2 variantes). */
const VARIANTS: Record<AlertSeverity, Record<AlertVariant, AlertVariantEntry>> = {
  info: {
    standard: {
      background: "{components.alert.colors.info.standard.background}",
      icon: "{components.alert.colors.info.standard.icon}",
      foreground: "{components.alert.colors.info.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.info.outlined.icon}",
      foreground: "{components.alert.colors.info.outlined.foreground}",
      border: { color: "{components.alert.colors.info.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" },
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
      border: { color: "{components.alert.colors.success.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" },
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
      border: { color: "{components.alert.colors.warning.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" },
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
      border: { color: "{components.alert.colors.error.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" },
    },
  },
};

/** `icons.*` : strict — le nom d'icône par sévérité n'est pas remplaçable. */
const SEVERITY_ICON: Record<AlertSeverity, string> = {
  info: "circle-info",
  success: "circle-check",
  warning: "triangle-exclamation",
  error: "triangle-exclamation",
};

const ICON_SIZE = "{components.icons.sizes.base}";

const TITLE_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.body.large.fontsize}"),
  fontWeight: tokenVar("{typography.body.large.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.body.large.lineheight}"),
  letterSpacing: tokenVar("{typography.body.large.letterspacing}"),
};

const DESCRIPTION_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.body.small.fontsize}"),
  fontWeight: tokenVar("{typography.body.small.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.body.small.lineheight}"),
  letterSpacing: tokenVar("{typography.body.small.letterspacing}"),
};

function resolveBorderShadow(border: AlertVariantEntry["border"]): string | undefined {
  if (!border) return undefined;
  return `inset 0 0 0 ${tokenVar(border.width)} ${tokenVar(border.color)}`;
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
  /** `sample.text[label.label]` — contenu du titre, remplaçable. */
  titleContent?: ReactNode;
  /** `sample.text[label.label-2]` — contenu de la description, remplaçable. */
  children?: ReactNode;
  /** `sample.composes[0]` (Button) — props du bouton d'action composé,
   * remplaçables ; superposées aux défauts tirés du sample. */
  actionProps?: ButtonProps;
}

export function Alert({
  icon = true,
  title = true,
  action = true,
  severity = "info",
  variant = "standard",
  titleContent = "Titre",
  children = "Description",
  actionProps,
  style,
  ...rest
}: AlertProps) {
  const entry = VARIANTS[severity][variant];

  const rootStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "fit-content",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: tokenVar("{components.alert.sizes.gap}"),
    paddingLeft: tokenVar("{components.alert.sizes.padding-x}"),
    paddingRight: tokenVar("{components.alert.sizes.padding-x}"),
    paddingTop: tokenVar("{components.alert.sizes.padding-y}"),
    paddingBottom: tokenVar("{components.alert.sizes.padding-y}"),
    borderRadius: tokenVar("{components.alert.sizes.border-radius}"),
    ...(entry.background ? { backgroundColor: tokenVar(entry.background) } : {}),
    ...(entry.border ? { boxShadow: resolveBorderShadow(entry.border) } : {}),
    ...style,
  };

  const foregroundColor = tokenVar(entry.foreground);

  return (
    <div style={rootStyle} {...rest}>
      {icon ? (
        <ContractIcon name={SEVERITY_ICON[severity]} sizeToken={ICON_SIZE} color={tokenVar(entry.icon)} />
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {title ? <span style={{ ...TITLE_TEXT_STYLE, color: foregroundColor }}>{titleContent}</span> : null}
        <span style={{ ...DESCRIPTION_TEXT_STYLE, color: foregroundColor }}>{children}</span>
      </div>
      {action ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "stretch",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            color={severity}
            variant="text"
            size="small"
            iconLeft={false}
            iconRight={false}
            label
            {...actionProps}
          >
            {actionProps?.children ?? "Action"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Transcription statique de Alert.contract.json (v11.0) — ne lit ni
 * n'interprète le JSON au runtime. Voir src/components/Alert/Alert.contract.json.
 */
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import type { AlertSeverity, AlertVariant } from "../../generated/contracts/Alert.ts";
import { tokenVar } from "../../tokens.ts";
import { Button, type ButtonProps } from "../Button/Button.tsx";
import { ContractIcon } from "../ContractIcon.tsx";

export type { AlertSeverity, AlertVariant };

type ViewId = "v1" | "v2" | "v3" | "v4" | "v5" | "v6";

interface AlertVariantEntry {
  background?: string;
  icon: string;
  foreground: string;
  border?: { color: string; width: string; align: "inside" };
  view: ViewId;
}

type AlertVariantKey = `${AlertSeverity}.${AlertVariant}`;

/** Table littérale transcrite de `variants` (8 entrées : 4 sévérités × 2
 * variantes). Clé = `structure.variantAxes` dans l'ordre. */
const VARIANTS: Record<AlertVariantKey, AlertVariantEntry> = {
  "info.standard": { background: "{components.alert.colors.info.standard.background}", icon: "{components.alert.colors.info.standard.icon}", foreground: "{components.alert.colors.info.standard.foreground}", view: "v1" },
  "info.outlined": { icon: "{components.alert.colors.info.outlined.icon}", foreground: "{components.alert.colors.info.outlined.foreground}", border: { color: "{components.alert.colors.info.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "success.standard": { background: "{components.alert.colors.success.standard.background}", icon: "{components.alert.colors.success.standard.icon}", foreground: "{components.alert.colors.success.standard.foreground}", view: "v3" },
  "success.outlined": { icon: "{components.alert.colors.success.outlined.icon}", foreground: "{components.alert.colors.success.outlined.foreground}", border: { color: "{components.alert.colors.success.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v4" },
  "warning.standard": { background: "{components.alert.colors.warning.standard.background}", icon: "{components.alert.colors.warning.standard.icon}", foreground: "{components.alert.colors.warning.standard.foreground}", view: "v5" },
  "warning.outlined": { icon: "{components.alert.colors.warning.outlined.icon}", foreground: "{components.alert.colors.warning.outlined.foreground}", border: { color: "{components.alert.colors.warning.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v6" },
  "error.standard": { background: "{components.alert.colors.error.standard.background}", icon: "{components.alert.colors.error.standard.icon}", foreground: "{components.alert.colors.error.standard.foreground}", view: "v5" },
  "error.outlined": { icon: "{components.alert.colors.error.outlined.icon}", foreground: "{components.alert.colors.error.outlined.foreground}", border: { color: "{components.alert.colors.error.outlined.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v6" },
};

/** `viewIcons[icons]` : figmaName porté par chaque vue (icons.icons ic1/ic2/ic3). */
const ICON_NAME_BY_VIEW: Record<ViewId, string> = {
  v1: "circle-info",
  v2: "circle-info",
  v3: "circle-check",
  v4: "circle-check",
  v5: "triangle-exclamation",
  v6: "triangle-exclamation",
};

/** `viewStructures[st1|st2|st3]` : les trois structures ne diffèrent que par
 * le `figmaLayer` (non normatif) du slot icône ; layout, sizing, gap,
 * padding et radius sont identiques. */
const ROOT_GAP = "{components.alert.sizes.gap}";
const ROOT_PADDING_X = "{components.alert.sizes.padding-x}";
const ROOT_PADDING_Y = "{components.alert.sizes.padding-y}";
const ROOT_RADIUS = "{components.alert.sizes.border-radius}";
const ICON_SIZE = "{components.icons.sizes.base}";

/** `textStyles["body.large"]` (titre) et `textStyles["body.small"]` (description). */
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

const LABEL_WRAPPER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  justifyContent: "center",
  alignItems: "flex-start",
};

const ACTION_WRAPPER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignSelf: "stretch",
  justifyContent: "center",
  alignItems: "center",
};

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
  /** Contenu du slot `label.label` (Titre). `samples.s1..s4`: "Titre". */
  titleContent?: ReactNode;
  /** Contenu du slot `label.label-2` (Description). `samples.s1..s4`: "Description". */
  children?: ReactNode;
  /** Props transmises au bouton composé (`composes.action.button`). Les
   * défauts reproduisent `samples.s1..s4.composes[0]` (color=severity,
   * variant="text", size="small", icônes masquées, texte "Action" via
   * `overrides`) ; toute clé fournie ici les remplace. */
  actionProps?: ButtonProps;
}

function resolveBorderShadow(border: AlertVariantEntry["border"]): string | undefined {
  if (!border) return undefined;
  return `inset 0 0 0 ${tokenVar(border.width)} ${tokenVar(border.color)}`;
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
  const entry = VARIANTS[`${severity}.${variant}`];
  const iconName = ICON_NAME_BY_VIEW[entry.view];

  const rootStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "fit-content",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: tokenVar(ROOT_GAP),
    paddingLeft: tokenVar(ROOT_PADDING_X),
    paddingRight: tokenVar(ROOT_PADDING_X),
    paddingTop: tokenVar(ROOT_PADDING_Y),
    paddingBottom: tokenVar(ROOT_PADDING_Y),
    borderRadius: tokenVar(ROOT_RADIUS),
    ...(entry.background ? { backgroundColor: tokenVar(entry.background) } : {}),
    ...(entry.border ? { boxShadow: resolveBorderShadow(entry.border) } : {}),
    ...style,
  };

  const foregroundColor = tokenVar(entry.foreground);
  const iconColor = tokenVar(entry.icon);

  return (
    <div style={rootStyle} {...rest}>
      {icon ? (
        <ContractIcon name={iconName} sizeToken={ICON_SIZE} color={iconColor} />
      ) : null}
      <div style={LABEL_WRAPPER_STYLE}>
        {title ? <span style={{ ...TITLE_TEXT_STYLE, color: foregroundColor }}>{titleContent}</span> : null}
        <span style={{ ...DESCRIPTION_TEXT_STYLE, color: foregroundColor }}>{children}</span>
      </div>
      {action ? (
        <div style={ACTION_WRAPPER_STYLE}>
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

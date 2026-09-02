/**
 * Transcription statique de Button.contract.json (v10.3) — ne lit ni
 * n'interprète le JSON au runtime. Voir src/components/Button/Button.contract.json.
 */
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useState,
} from "react";

import type { ButtonColor, ButtonSize, ButtonVariant } from "../../generated/contracts/Button.ts";
import { tokenVar } from "../../tokens.ts";
import { ContractIcon } from "../ContractIcon.tsx";

export type { ButtonColor, ButtonSize, ButtonVariant };

/** Le contrat déclare iconLeftName/iconRightName en `type: "icon"`, policy
 * "modifiable" : aucune énumération fermée n'est publiée, seulement un nom
 * de repli par icône (`icons.*.figmaName`). */
export type ButtonIconName = string;

type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

type ViewId = "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7";

interface ButtonVariantEntry {
  background?: string;
  foreground: string;
  border?: { color: string; width: string; align: "inside" };
  ring?: { color: string; width: string; align: "outside" };
  view: ViewId;
}

type ButtonVariantKey = `${ButtonColor}.${ButtonVariant}.${ButtonState}`;

/** variantViews[view].structure.radius — seule différence structurelle entre
 * vues pour ce composant, en dehors des peintures/strokes déjà portées par
 * chaque entrée de `variants`. */
const VIEW_ROOT_RADIUS: Record<ViewId, string | null> = {
  v1: null,
  v2: null,
  v3: null,
  v4: "{layouts.radius.md}",
  v5: "{layouts.radius.md}",
  v6: "{layouts.radius.md}",
  v7: "{layouts.radius.md}",
};

/** Table littérale transcrite de `variants` (90 entrées : 6 couleurs × 3
 * variantes × 5 états). Clé = `structure.variantAxes` dans l'ordre. */
const VARIANTS: Record<ButtonVariantKey, ButtonVariantEntry> = {
  "primary.contained.default": { background: "{components.button.colors.primary.contained.default.background}", foreground: "{components.button.colors.primary.contained.default.foreground}", view: "v1" },
  "primary.contained.hover": { background: "{components.button.colors.primary.contained.hover.background}", foreground: "{components.button.colors.primary.contained.hover.foreground}", view: "v1" },
  "primary.contained.focus": { background: "{components.button.colors.primary.contained.focus.background}", foreground: "{components.button.colors.primary.contained.focus.foreground}", ring: { color: "{components.button.colors.primary.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "primary.contained.press": { background: "{components.button.colors.primary.contained.press.background}", foreground: "{components.button.colors.primary.contained.press.foreground}", ring: { color: "{components.button.colors.primary.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "primary.contained.disable": { background: "{components.button.colors.primary.contained.disable.background}", foreground: "{components.button.colors.primary.contained.disable.foreground}", view: "v1" },
  "primary.outlined.default": { background: "{components.button.colors.primary.outlined.default.background}", foreground: "{components.button.colors.primary.outlined.default.foreground}", border: { color: "{components.button.colors.primary.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "primary.outlined.hover": { background: "{components.button.colors.primary.outlined.hover.background}", foreground: "{components.button.colors.primary.outlined.hover.foreground}", border: { color: "{components.button.colors.primary.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "primary.outlined.focus": { background: "{components.button.colors.primary.outlined.focus.background}", foreground: "{components.button.colors.primary.outlined.focus.foreground}", border: { color: "{components.button.colors.primary.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.primary.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "primary.outlined.press": { background: "{components.button.colors.primary.outlined.press.background}", foreground: "{components.button.colors.primary.outlined.press.foreground}", border: { color: "{components.button.colors.primary.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.primary.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "primary.outlined.disable": { background: "{components.button.colors.primary.outlined.disable.background}", foreground: "{components.button.colors.primary.outlined.disable.foreground}", border: { color: "{components.button.colors.primary.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v6" },
  "primary.text.default": { foreground: "{components.button.colors.primary.text.default.foreground}", view: "v3" },
  "primary.text.hover": { background: "{components.button.colors.primary.text.hover.background}", foreground: "{components.button.colors.primary.text.hover.foreground}", view: "v1" },
  "primary.text.focus": { background: "{components.button.colors.primary.text.focus.background}", foreground: "{components.button.colors.primary.text.focus.foreground}", ring: { color: "{components.button.colors.primary.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "primary.text.press": { background: "{components.button.colors.primary.text.press.background}", foreground: "{components.button.colors.primary.text.press.foreground}", ring: { color: "{components.button.colors.primary.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "primary.text.disable": { foreground: "{components.button.colors.primary.text.disable.foreground}", view: "v7" },

  "secondary.contained.default": { background: "{components.button.colors.secondary.contained.default.background}", foreground: "{components.button.colors.secondary.contained.default.foreground}", view: "v1" },
  "secondary.contained.hover": { background: "{components.button.colors.secondary.contained.hover.background}", foreground: "{components.button.colors.secondary.contained.hover.foreground}", view: "v1" },
  "secondary.contained.focus": { background: "{components.button.colors.secondary.contained.focus.background}", foreground: "{components.button.colors.secondary.contained.focus.foreground}", ring: { color: "{components.button.colors.secondary.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "secondary.contained.press": { background: "{components.button.colors.secondary.contained.press.background}", foreground: "{components.button.colors.secondary.contained.press.foreground}", ring: { color: "{components.button.colors.secondary.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "secondary.contained.disable": { background: "{components.button.colors.secondary.contained.disable.background}", foreground: "{components.button.colors.secondary.contained.disable.foreground}", view: "v1" },
  "secondary.outlined.default": { background: "{components.button.colors.secondary.outlined.default.background}", foreground: "{components.button.colors.secondary.outlined.default.foreground}", border: { color: "{components.button.colors.secondary.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "secondary.outlined.hover": { background: "{components.button.colors.secondary.outlined.hover.background}", foreground: "{components.button.colors.secondary.outlined.hover.foreground}", border: { color: "{components.button.colors.secondary.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "secondary.outlined.focus": { background: "{components.button.colors.secondary.outlined.focus.background}", foreground: "{components.button.colors.secondary.outlined.focus.foreground}", border: { color: "{components.button.colors.secondary.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.secondary.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "secondary.outlined.press": { background: "{components.button.colors.secondary.outlined.press.background}", foreground: "{components.button.colors.secondary.outlined.press.foreground}", border: { color: "{components.button.colors.secondary.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.secondary.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "secondary.outlined.disable": { background: "{components.button.colors.secondary.outlined.disable.background}", foreground: "{components.button.colors.secondary.outlined.disable.foreground}", border: { color: "{components.button.colors.secondary.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v6" },
  "secondary.text.default": { foreground: "{components.button.colors.secondary.text.default.foreground}", view: "v3" },
  "secondary.text.hover": { background: "{components.button.colors.secondary.text.hover.background}", foreground: "{components.button.colors.secondary.text.hover.foreground}", view: "v1" },
  "secondary.text.focus": { background: "{components.button.colors.secondary.text.focus.background}", foreground: "{components.button.colors.secondary.text.focus.foreground}", ring: { color: "{components.button.colors.secondary.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "secondary.text.press": { background: "{components.button.colors.secondary.text.press.background}", foreground: "{components.button.colors.secondary.text.press.foreground}", ring: { color: "{components.button.colors.secondary.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "secondary.text.disable": { foreground: "{components.button.colors.secondary.text.disable.foreground}", view: "v7" },

  "info.contained.default": { background: "{components.button.colors.info.contained.default.background}", foreground: "{components.button.colors.info.contained.default.foreground}", view: "v1" },
  "info.contained.hover": { background: "{components.button.colors.info.contained.hover.background}", foreground: "{components.button.colors.info.contained.hover.foreground}", view: "v1" },
  "info.contained.focus": { background: "{components.button.colors.info.contained.focus.background}", foreground: "{components.button.colors.info.contained.focus.foreground}", ring: { color: "{components.button.colors.info.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "info.contained.press": { background: "{components.button.colors.info.contained.press.background}", foreground: "{components.button.colors.info.contained.press.foreground}", ring: { color: "{components.button.colors.info.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "info.contained.disable": { background: "{components.button.colors.info.contained.disable.background}", foreground: "{components.button.colors.info.contained.disable.foreground}", view: "v1" },
  "info.outlined.default": { background: "{components.button.colors.info.outlined.default.background}", foreground: "{components.button.colors.info.outlined.default.foreground}", border: { color: "{components.button.colors.info.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "info.outlined.hover": { background: "{components.button.colors.info.outlined.hover.background}", foreground: "{components.button.colors.info.outlined.hover.foreground}", border: { color: "{components.button.colors.info.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "info.outlined.focus": { background: "{components.button.colors.info.outlined.focus.background}", foreground: "{components.button.colors.info.outlined.focus.foreground}", border: { color: "{components.button.colors.info.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.info.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "info.outlined.press": { background: "{components.button.colors.info.outlined.press.background}", foreground: "{components.button.colors.info.outlined.press.foreground}", border: { color: "{components.button.colors.info.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.info.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "info.outlined.disable": { background: "{components.button.colors.info.outlined.disable.background}", foreground: "{components.button.colors.info.outlined.disable.foreground}", border: { color: "{components.button.colors.info.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v6" },
  "info.text.default": { foreground: "{components.button.colors.info.text.default.foreground}", view: "v3" },
  "info.text.hover": { background: "{components.button.colors.info.text.hover.background}", foreground: "{components.button.colors.info.text.hover.foreground}", view: "v1" },
  "info.text.focus": { background: "{components.button.colors.info.text.focus.background}", foreground: "{components.button.colors.info.text.focus.foreground}", ring: { color: "{components.button.colors.info.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "info.text.press": { background: "{components.button.colors.info.text.press.background}", foreground: "{components.button.colors.info.text.press.foreground}", ring: { color: "{components.button.colors.info.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "info.text.disable": { foreground: "{components.button.colors.info.text.disable.foreground}", view: "v7" },

  "success.contained.default": { background: "{components.button.colors.success.contained.default.background}", foreground: "{components.button.colors.success.contained.default.foreground}", view: "v1" },
  "success.contained.hover": { background: "{components.button.colors.success.contained.hover.background}", foreground: "{components.button.colors.success.contained.hover.foreground}", view: "v1" },
  "success.contained.focus": { background: "{components.button.colors.success.contained.focus.background}", foreground: "{components.button.colors.success.contained.focus.foreground}", ring: { color: "{components.button.colors.success.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "success.contained.press": { background: "{components.button.colors.success.contained.press.background}", foreground: "{components.button.colors.success.contained.press.foreground}", ring: { color: "{components.button.colors.success.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "success.contained.disable": { background: "{components.button.colors.success.contained.disable.background}", foreground: "{components.button.colors.success.contained.disable.foreground}", view: "v1" },
  "success.outlined.default": { background: "{components.button.colors.success.outlined.default.background}", foreground: "{components.button.colors.success.outlined.default.foreground}", border: { color: "{components.button.colors.success.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "success.outlined.hover": { background: "{components.button.colors.success.outlined.hover.background}", foreground: "{components.button.colors.success.outlined.hover.foreground}", border: { color: "{components.button.colors.success.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "success.outlined.focus": { background: "{components.button.colors.success.outlined.focus.background}", foreground: "{components.button.colors.success.outlined.focus.foreground}", border: { color: "{components.button.colors.success.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.success.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "success.outlined.press": { background: "{components.button.colors.success.outlined.press.background}", foreground: "{components.button.colors.success.outlined.press.foreground}", border: { color: "{components.button.colors.success.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.success.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "success.outlined.disable": { background: "{components.button.colors.success.outlined.disable.background}", foreground: "{components.button.colors.success.outlined.disable.foreground}", border: { color: "{components.button.colors.success.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v6" },
  "success.text.default": { foreground: "{components.button.colors.success.text.default.foreground}", view: "v3" },
  "success.text.hover": { background: "{components.button.colors.success.text.hover.background}", foreground: "{components.button.colors.success.text.hover.foreground}", view: "v1" },
  "success.text.focus": { background: "{components.button.colors.success.text.focus.background}", foreground: "{components.button.colors.success.text.focus.foreground}", ring: { color: "{components.button.colors.success.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "success.text.press": { background: "{components.button.colors.success.text.press.background}", foreground: "{components.button.colors.success.text.press.foreground}", ring: { color: "{components.button.colors.success.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "success.text.disable": { foreground: "{components.button.colors.success.text.disable.foreground}", view: "v7" },

  "warning.contained.default": { background: "{components.button.colors.warning.contained.default.background}", foreground: "{components.button.colors.warning.contained.default.foreground}", view: "v1" },
  "warning.contained.hover": { background: "{components.button.colors.warning.contained.hover.background}", foreground: "{components.button.colors.warning.contained.hover.foreground}", view: "v1" },
  "warning.contained.focus": { background: "{components.button.colors.warning.contained.focus.background}", foreground: "{components.button.colors.warning.contained.focus.foreground}", ring: { color: "{components.button.colors.warning.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "warning.contained.press": { background: "{components.button.colors.warning.contained.press.background}", foreground: "{components.button.colors.warning.contained.press.foreground}", ring: { color: "{components.button.colors.warning.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "warning.contained.disable": { background: "{components.button.colors.warning.contained.disable.background}", foreground: "{components.button.colors.warning.contained.disable.foreground}", view: "v1" },
  "warning.outlined.default": { background: "{components.button.colors.warning.outlined.default.background}", foreground: "{components.button.colors.warning.outlined.default.foreground}", border: { color: "{components.button.colors.warning.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "warning.outlined.hover": { background: "{components.button.colors.warning.outlined.hover.background}", foreground: "{components.button.colors.warning.outlined.hover.foreground}", border: { color: "{components.button.colors.warning.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "warning.outlined.focus": { background: "{components.button.colors.warning.outlined.focus.background}", foreground: "{components.button.colors.warning.outlined.focus.foreground}", border: { color: "{components.button.colors.warning.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.warning.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "warning.outlined.press": { background: "{components.button.colors.warning.outlined.press.background}", foreground: "{components.button.colors.warning.outlined.press.foreground}", border: { color: "{components.button.colors.warning.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.warning.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "warning.outlined.disable": { background: "{components.button.colors.warning.outlined.disable.background}", foreground: "{components.button.colors.warning.outlined.disable.foreground}", border: { color: "{components.button.colors.warning.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v6" },
  "warning.text.default": { foreground: "{components.button.colors.warning.text.default.foreground}", view: "v3" },
  "warning.text.hover": { background: "{components.button.colors.warning.text.hover.background}", foreground: "{components.button.colors.warning.text.hover.foreground}", view: "v1" },
  "warning.text.focus": { background: "{components.button.colors.warning.text.focus.background}", foreground: "{components.button.colors.warning.text.focus.foreground}", ring: { color: "{components.button.colors.warning.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "warning.text.press": { background: "{components.button.colors.warning.text.press.background}", foreground: "{components.button.colors.warning.text.press.foreground}", ring: { color: "{components.button.colors.warning.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "warning.text.disable": { foreground: "{components.button.colors.warning.text.disable.foreground}", view: "v7" },

  "error.contained.default": { background: "{components.button.colors.error.contained.default.background}", foreground: "{components.button.colors.error.contained.default.foreground}", view: "v1" },
  "error.contained.hover": { background: "{components.button.colors.error.contained.hover.background}", foreground: "{components.button.colors.error.contained.hover.foreground}", view: "v1" },
  "error.contained.focus": { background: "{components.button.colors.error.contained.focus.background}", foreground: "{components.button.colors.error.contained.focus.foreground}", ring: { color: "{components.button.colors.error.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "error.contained.press": { background: "{components.button.colors.error.contained.press.background}", foreground: "{components.button.colors.error.contained.press.foreground}", ring: { color: "{components.button.colors.error.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "error.contained.disable": { background: "{components.button.colors.error.contained.disable.background}", foreground: "{components.button.colors.error.contained.disable.foreground}", view: "v1" },
  "error.outlined.default": { background: "{components.button.colors.error.outlined.default.background}", foreground: "{components.button.colors.error.outlined.default.foreground}", border: { color: "{components.button.colors.error.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "error.outlined.hover": { background: "{components.button.colors.error.outlined.hover.background}", foreground: "{components.button.colors.error.outlined.hover.foreground}", border: { color: "{components.button.colors.error.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v2" },
  "error.outlined.focus": { background: "{components.button.colors.error.outlined.focus.background}", foreground: "{components.button.colors.error.outlined.focus.foreground}", border: { color: "{components.button.colors.error.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.error.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "error.outlined.press": { background: "{components.button.colors.error.outlined.press.background}", foreground: "{components.button.colors.error.outlined.press.foreground}", border: { color: "{components.button.colors.error.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" }, ring: { color: "{components.button.colors.error.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v5" },
  "error.outlined.disable": { background: "{components.button.colors.error.outlined.disable.background}", foreground: "{components.button.colors.error.outlined.disable.foreground}", border: { color: "{components.button.colors.error.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" }, view: "v6" },
  "error.text.default": { foreground: "{components.button.colors.error.text.default.foreground}", view: "v3" },
  "error.text.hover": { background: "{components.button.colors.error.text.hover.background}", foreground: "{components.button.colors.error.text.hover.foreground}", view: "v1" },
  "error.text.focus": { background: "{components.button.colors.error.text.focus.background}", foreground: "{components.button.colors.error.text.focus.foreground}", ring: { color: "{components.button.colors.error.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "error.text.press": { background: "{components.button.colors.error.text.press.background}", foreground: "{components.button.colors.error.text.press.foreground}", ring: { color: "{components.button.colors.error.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, view: "v4" },
  "error.text.disable": { foreground: "{components.button.colors.error.text.disable.foreground}", view: "v7" },
};

/** `structure.sizes` : remplace gap/padding/radius du slot `.sizeWrapperButton`
 * selon la prop `size`. */
const SIZE_LAYOUT: Record<ButtonSize, { gap: string; paddingX: string; paddingY: string; radius: string }> = {
  medium: {
    gap: "{components.button.sizes.medium.gap}",
    paddingX: "{components.button.sizes.medium.padding-x}",
    paddingY: "{components.button.sizes.medium.padding-y}",
    radius: "{components.button.sizes.medium.border-radius}",
  },
  big: {
    gap: "{components.button.sizes.big.gap}",
    paddingX: "{components.button.sizes.big.padding-x}",
    paddingY: "{components.button.sizes.big.padding-y}",
    radius: "{components.button.sizes.big.border-radius}",
  },
  small: {
    gap: "{components.button.sizes.small.gap}",
    paddingX: "{components.button.sizes.small.padding-x}",
    paddingY: "{components.button.sizes.small.padding-y}",
    radius: "{components.button.sizes.small.border-radius}",
  },
};

/** `stateModel.precedence`, du plus fort au plus faible. */
const STATE_PRECEDENCE: ButtonState[] = ["disable", "press", "focus", "hover", "default"];

const ICON_SIZE = "{components.icons.sizes.sm}";
/** `icons.arrowLeftLong`/`icons.arrowRightLong` : figmaName de repli (policy "modifiable"). */
const ICON_LEFT_FALLBACK = "arrow-left-long";
const ICON_RIGHT_FALLBACK = "arrow-right-long";

/** `textStyles["label.large"]`. */
const LABEL_TEXT_STYLE: CSSProperties = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.label.large.fontsize}"),
  fontWeight: tokenVar("{typography.label.large.fontweight}") as unknown as CSSProperties["fontWeight"],
  lineHeight: tokenVar("{typography.label.large.lineheight}"),
  letterSpacing: tokenVar("{typography.label.large.letterspacing}"),
};

interface ButtonContractProps {
  disabled?: boolean;
  color?: ButtonColor;
  variant?: ButtonVariant;
  label?: boolean;
  iconRight?: boolean;
  iconLeft?: boolean;
  size?: ButtonSize;
  iconLeftName?: ButtonIconName | null;
  iconRightName?: ButtonIconName | null;
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {
  children?: ReactNode;
}

function resolveBorderShadow(border: ButtonVariantEntry["border"]): string | undefined {
  if (!border) return undefined;
  return `inset 0 0 0 ${tokenVar(border.width)} ${tokenVar(border.color)}`;
}

export function Button({
  disabled = false,
  color = "primary",
  variant = "contained",
  label = true,
  iconRight = true,
  iconLeft = true,
  size = "medium",
  iconLeftName = null,
  iconRightName = null,
  children = "Label",
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  style,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleMouseEnter = useCallback<NonNullable<ButtonProps["onMouseEnter"]>>((event) => {
    setHovered(true);
    onMouseEnter?.(event);
  }, [onMouseEnter]);

  const handleMouseLeave = useCallback<NonNullable<ButtonProps["onMouseLeave"]>>((event) => {
    setHovered(false);
    onMouseLeave?.(event);
  }, [onMouseLeave]);

  const handleFocus = useCallback<NonNullable<ButtonProps["onFocus"]>>((event) => {
    setFocusVisible(event.currentTarget.matches(":focus-visible"));
    onFocus?.(event);
  }, [onFocus]);

  const handleBlur = useCallback<NonNullable<ButtonProps["onBlur"]>>((event) => {
    setFocusVisible(false);
    onBlur?.(event);
  }, [onBlur]);

  const handlePointerDown = useCallback<NonNullable<ButtonProps["onPointerDown"]>>((event) => {
    setPressed(true);
    onPointerDown?.(event);
  }, [onPointerDown]);

  const handlePointerUp = useCallback<NonNullable<ButtonProps["onPointerUp"]>>((event) => {
    setPressed(false);
    onPointerUp?.(event);
  }, [onPointerUp]);

  const handlePointerCancel = useCallback<NonNullable<ButtonProps["onPointerCancel"]>>((event) => {
    setPressed(false);
    onPointerCancel?.(event);
  }, [onPointerCancel]);

  const activeStates: Partial<Record<ButtonState, boolean>> = {
    disable: disabled,
    press: pressed,
    focus: focusVisible,
    hover: hovered,
  };
  const state = STATE_PRECEDENCE.find((candidate) => candidate === "default" || activeStates[candidate]) ?? "default";

  const entry = VARIANTS[`${color}.${variant}.${state}`];
  const rootRadius = VIEW_ROOT_RADIUS[entry.view];
  const sizeLayout = SIZE_LAYOUT[size];

  const rootStyle: CSSProperties = {
    display: "inline-flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "fit-content",
    height: "fit-content",
    padding: 0,
    border: "none",
    background: "none",
    cursor: disabled ? "default" : "pointer",
    ...(rootRadius ? { borderRadius: tokenVar(rootRadius) } : {}),
    ...(entry.ring
      ? {
          outlineStyle: "solid",
          outlineWidth: tokenVar(entry.ring.width),
          outlineColor: tokenVar(entry.ring.color),
          outlineOffset: 0,
        }
      : {}),
    ...style,
  };

  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: tokenVar(sizeLayout.gap),
    paddingLeft: tokenVar(sizeLayout.paddingX),
    paddingRight: tokenVar(sizeLayout.paddingX),
    paddingTop: tokenVar(sizeLayout.paddingY),
    paddingBottom: tokenVar(sizeLayout.paddingY),
    borderRadius: tokenVar(sizeLayout.radius),
    ...(entry.background ? { backgroundColor: tokenVar(entry.background) } : {}),
    ...(entry.border ? { boxShadow: resolveBorderShadow(entry.border) } : {}),
  };

  const foregroundColor = tokenVar(entry.foreground);

  return (
    <button
      type="button"
      disabled={disabled}
      style={rootStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      {...rest}
    >
      <span style={wrapperStyle}>
        {iconLeft ? (
          <ContractIcon name={iconLeftName ?? ICON_LEFT_FALLBACK} sizeToken={ICON_SIZE} color={foregroundColor} />
        ) : null}
        {label ? <span style={{ ...LABEL_TEXT_STYLE, color: foregroundColor }}>{children}</span> : null}
        {iconRight ? (
          <ContractIcon name={iconRightName ?? ICON_RIGHT_FALLBACK} sizeToken={ICON_SIZE} color={foregroundColor} />
        ) : null}
      </span>
    </button>
  );
}

import * as React from "react";

export type ButtonColor =
  | "secondary"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "error";
export type ButtonVariant = "contained" | "outlined" | "text";
export type ButtonSize = "medium" | "big" | "small";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "size"> {
  disabled?: boolean;
  color?: ButtonColor;
  variant?: ButtonVariant;
  label?: boolean;
  iconRight?: boolean;
  iconLeft?: boolean;
  size?: ButtonSize;
  iconLeftName?: string;
  iconRightName?: string;
  children?: React.ReactNode;
}

// La référence du contrat donne le nom de la variable : tout ce qui n'est ni
// lettre ni chiffre devient un tiret, comme dans style-dictionary.config.mjs.
const tk = (ref: string) =>
  `var(--${ref.slice(1, -1).toLowerCase().replace(/[^a-z0-9]+/g, "-")})`;

const SIZES: Record<
  ButtonSize,
  { gap: string; paddingX: string; paddingY: string; radius: string }
> = {
  medium: {
    gap: tk("{components.button.sizes.medium.gap}"),
    paddingX: tk("{components.button.sizes.medium.padding-x}"),
    paddingY: tk("{components.button.sizes.medium.padding-y}"),
    radius: tk("{components.button.sizes.medium.border-radius}"),
  },
  big: {
    gap: tk("{components.button.sizes.big.gap}"),
    paddingX: tk("{components.button.sizes.big.padding-x}"),
    paddingY: tk("{components.button.sizes.big.padding-y}"),
    radius: tk("{components.button.sizes.big.border-radius}"),
  },
  small: {
    gap: tk("{components.button.sizes.small.gap}"),
    paddingX: tk("{components.button.sizes.small.padding-x}"),
    paddingY: tk("{components.button.sizes.small.padding-y}"),
    radius: tk("{components.button.sizes.small.border-radius}"),
  },
};

const ICON_SIZE = tk("{components.icons.sizes.sm}");

const LABEL_TYPOGRAPHY = {
  fontFamily: tk("{primitives.fontfamily.base}"),
  fontSize: tk("{typography.label.large.fontsize}"),
  fontWeight: tk("{typography.label.large.fontweight}"),
  lineHeight: tk("{typography.label.large.lineheight}"),
  letterSpacing: tk("{typography.label.large.letterspacing}"),
};

type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

interface VariantEntry {
  color: ButtonColor;
  variant: ButtonVariant;
  state: ButtonState;
  tokens: { background?: string; foreground?: string };
  strokes?: {
    border?: { color: string; width: string; align: "inside" | "outside" | "center" };
    ring?: { color: string; width: string; align: "inside" | "outside" | "center" };
  };
}

// Transcription littérale de `variants[]` du contrat (props values/tokens/strokes).
const VARIANTS: VariantEntry[] = [
  // state: default — contained
  { color: "primary", variant: "contained", state: "default", tokens: { background: "{components.button.colors.primary.contained.default.background}", foreground: "{components.button.colors.primary.contained.default.foreground}" } },
  { color: "secondary", variant: "contained", state: "default", tokens: { background: "{components.button.colors.secondary.contained.default.background}", foreground: "{components.button.colors.secondary.contained.default.foreground}" } },
  { color: "info", variant: "contained", state: "default", tokens: { background: "{components.button.colors.info.contained.default.background}", foreground: "{components.button.colors.info.contained.default.foreground}" } },
  { color: "success", variant: "contained", state: "default", tokens: { background: "{components.button.colors.success.contained.default.background}", foreground: "{components.button.colors.success.contained.default.foreground}" } },
  { color: "warning", variant: "contained", state: "default", tokens: { background: "{components.button.colors.warning.contained.default.background}", foreground: "{components.button.colors.warning.contained.default.foreground}" } },
  { color: "error", variant: "contained", state: "default", tokens: { background: "{components.button.colors.error.contained.default.background}", foreground: "{components.button.colors.error.contained.default.foreground}" } },
  // state: default — outlined
  { color: "primary", variant: "outlined", state: "default", tokens: { background: "{components.button.colors.primary.outlined.default.background}", foreground: "{components.button.colors.primary.outlined.default.foreground}" }, strokes: { border: { color: "{components.button.colors.primary.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "secondary", variant: "outlined", state: "default", tokens: { background: "{components.button.colors.secondary.outlined.default.background}", foreground: "{components.button.colors.secondary.outlined.default.foreground}" }, strokes: { border: { color: "{components.button.colors.secondary.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "info", variant: "outlined", state: "default", tokens: { background: "{components.button.colors.info.outlined.default.background}", foreground: "{components.button.colors.info.outlined.default.foreground}" }, strokes: { border: { color: "{components.button.colors.info.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "success", variant: "outlined", state: "default", tokens: { background: "{components.button.colors.success.outlined.default.background}", foreground: "{components.button.colors.success.outlined.default.foreground}" }, strokes: { border: { color: "{components.button.colors.success.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "warning", variant: "outlined", state: "default", tokens: { background: "{components.button.colors.warning.outlined.default.background}", foreground: "{components.button.colors.warning.outlined.default.foreground}" }, strokes: { border: { color: "{components.button.colors.warning.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "error", variant: "outlined", state: "default", tokens: { background: "{components.button.colors.error.outlined.default.background}", foreground: "{components.button.colors.error.outlined.default.foreground}" }, strokes: { border: { color: "{components.button.colors.error.outlined.default.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  // state: default — text
  { color: "primary", variant: "text", state: "default", tokens: { foreground: "{components.button.colors.primary.text.default.foreground}" } },
  { color: "secondary", variant: "text", state: "default", tokens: { foreground: "{components.button.colors.secondary.text.default.foreground}" } },
  { color: "info", variant: "text", state: "default", tokens: { foreground: "{components.button.colors.info.text.default.foreground}" } },
  { color: "success", variant: "text", state: "default", tokens: { foreground: "{components.button.colors.success.text.default.foreground}" } },
  { color: "warning", variant: "text", state: "default", tokens: { foreground: "{components.button.colors.warning.text.default.foreground}" } },
  { color: "error", variant: "text", state: "default", tokens: { foreground: "{components.button.colors.error.text.default.foreground}" } },
  // state: hover — contained
  { color: "primary", variant: "contained", state: "hover", tokens: { background: "{components.button.colors.primary.contained.hover.background}", foreground: "{components.button.colors.primary.contained.hover.foreground}" } },
  { color: "secondary", variant: "contained", state: "hover", tokens: { background: "{components.button.colors.secondary.contained.hover.background}", foreground: "{components.button.colors.secondary.contained.hover.foreground}" } },
  { color: "info", variant: "contained", state: "hover", tokens: { background: "{components.button.colors.info.contained.hover.background}", foreground: "{components.button.colors.info.contained.hover.foreground}" } },
  { color: "success", variant: "contained", state: "hover", tokens: { background: "{components.button.colors.success.contained.hover.background}", foreground: "{components.button.colors.success.contained.hover.foreground}" } },
  { color: "warning", variant: "contained", state: "hover", tokens: { background: "{components.button.colors.warning.contained.hover.background}", foreground: "{components.button.colors.warning.contained.hover.foreground}" } },
  { color: "error", variant: "contained", state: "hover", tokens: { background: "{components.button.colors.error.contained.hover.background}", foreground: "{components.button.colors.error.contained.hover.foreground}" } },
  // state: hover — outlined
  { color: "primary", variant: "outlined", state: "hover", tokens: { background: "{components.button.colors.primary.outlined.hover.background}", foreground: "{components.button.colors.primary.outlined.hover.foreground}" }, strokes: { border: { color: "{components.button.colors.primary.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "secondary", variant: "outlined", state: "hover", tokens: { background: "{components.button.colors.secondary.outlined.hover.background}", foreground: "{components.button.colors.secondary.outlined.hover.foreground}" }, strokes: { border: { color: "{components.button.colors.secondary.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "info", variant: "outlined", state: "hover", tokens: { background: "{components.button.colors.info.outlined.hover.background}", foreground: "{components.button.colors.info.outlined.hover.foreground}" }, strokes: { border: { color: "{components.button.colors.info.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "success", variant: "outlined", state: "hover", tokens: { background: "{components.button.colors.success.outlined.hover.background}", foreground: "{components.button.colors.success.outlined.hover.foreground}" }, strokes: { border: { color: "{components.button.colors.success.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "warning", variant: "outlined", state: "hover", tokens: { background: "{components.button.colors.warning.outlined.hover.background}", foreground: "{components.button.colors.warning.outlined.hover.foreground}" }, strokes: { border: { color: "{components.button.colors.warning.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "error", variant: "outlined", state: "hover", tokens: { background: "{components.button.colors.error.outlined.hover.background}", foreground: "{components.button.colors.error.outlined.hover.foreground}" }, strokes: { border: { color: "{components.button.colors.error.outlined.hover.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  // state: hover — text
  { color: "primary", variant: "text", state: "hover", tokens: { background: "{components.button.colors.primary.text.hover.background}", foreground: "{components.button.colors.primary.text.hover.foreground}" } },
  { color: "secondary", variant: "text", state: "hover", tokens: { background: "{components.button.colors.secondary.text.hover.background}", foreground: "{components.button.colors.secondary.text.hover.foreground}" } },
  { color: "info", variant: "text", state: "hover", tokens: { background: "{components.button.colors.info.text.hover.background}", foreground: "{components.button.colors.info.text.hover.foreground}" } },
  { color: "success", variant: "text", state: "hover", tokens: { background: "{components.button.colors.success.text.hover.background}", foreground: "{components.button.colors.success.text.hover.foreground}" } },
  { color: "warning", variant: "text", state: "hover", tokens: { background: "{components.button.colors.warning.text.hover.background}", foreground: "{components.button.colors.warning.text.hover.foreground}" } },
  { color: "error", variant: "text", state: "hover", tokens: { background: "{components.button.colors.error.text.hover.background}", foreground: "{components.button.colors.error.text.hover.foreground}" } },
  // state: focus — contained
  { color: "primary", variant: "contained", state: "focus", tokens: { background: "{components.button.colors.primary.contained.focus.background}", foreground: "{components.button.colors.primary.contained.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.primary.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "secondary", variant: "contained", state: "focus", tokens: { background: "{components.button.colors.secondary.contained.focus.background}", foreground: "{components.button.colors.secondary.contained.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.secondary.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "info", variant: "contained", state: "focus", tokens: { background: "{components.button.colors.info.contained.focus.background}", foreground: "{components.button.colors.info.contained.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.info.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "success", variant: "contained", state: "focus", tokens: { background: "{components.button.colors.success.contained.focus.background}", foreground: "{components.button.colors.success.contained.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.success.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "warning", variant: "contained", state: "focus", tokens: { background: "{components.button.colors.warning.contained.focus.background}", foreground: "{components.button.colors.warning.contained.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.warning.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "error", variant: "contained", state: "focus", tokens: { background: "{components.button.colors.error.contained.focus.background}", foreground: "{components.button.colors.error.contained.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.error.contained.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  // state: focus — outlined
  { color: "primary", variant: "outlined", state: "focus", tokens: { background: "{components.button.colors.primary.outlined.focus.background}", foreground: "{components.button.colors.primary.outlined.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.primary.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.primary.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "secondary", variant: "outlined", state: "focus", tokens: { background: "{components.button.colors.secondary.outlined.focus.background}", foreground: "{components.button.colors.secondary.outlined.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.secondary.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.secondary.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "info", variant: "outlined", state: "focus", tokens: { background: "{components.button.colors.info.outlined.focus.background}", foreground: "{components.button.colors.info.outlined.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.info.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.info.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "success", variant: "outlined", state: "focus", tokens: { background: "{components.button.colors.success.outlined.focus.background}", foreground: "{components.button.colors.success.outlined.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.success.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.success.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "warning", variant: "outlined", state: "focus", tokens: { background: "{components.button.colors.warning.outlined.focus.background}", foreground: "{components.button.colors.warning.outlined.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.warning.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.warning.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "error", variant: "outlined", state: "focus", tokens: { background: "{components.button.colors.error.outlined.focus.background}", foreground: "{components.button.colors.error.outlined.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.error.outlined.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.error.outlined.focus.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  // state: focus — text
  { color: "primary", variant: "text", state: "focus", tokens: { background: "{components.button.colors.primary.text.focus.background}", foreground: "{components.button.colors.primary.text.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.primary.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "secondary", variant: "text", state: "focus", tokens: { background: "{components.button.colors.secondary.text.focus.background}", foreground: "{components.button.colors.secondary.text.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.secondary.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "info", variant: "text", state: "focus", tokens: { background: "{components.button.colors.info.text.focus.background}", foreground: "{components.button.colors.info.text.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.info.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "success", variant: "text", state: "focus", tokens: { background: "{components.button.colors.success.text.focus.background}", foreground: "{components.button.colors.success.text.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.success.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "warning", variant: "text", state: "focus", tokens: { background: "{components.button.colors.warning.text.focus.background}", foreground: "{components.button.colors.warning.text.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.warning.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "error", variant: "text", state: "focus", tokens: { background: "{components.button.colors.error.text.focus.background}", foreground: "{components.button.colors.error.text.focus.foreground}" }, strokes: { ring: { color: "{components.button.colors.error.text.focus.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  // state: press — contained
  { color: "primary", variant: "contained", state: "press", tokens: { background: "{components.button.colors.primary.contained.press.background}", foreground: "{components.button.colors.primary.contained.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.primary.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "secondary", variant: "contained", state: "press", tokens: { background: "{components.button.colors.secondary.contained.press.background}", foreground: "{components.button.colors.secondary.contained.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.secondary.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "info", variant: "contained", state: "press", tokens: { background: "{components.button.colors.info.contained.press.background}", foreground: "{components.button.colors.info.contained.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.info.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "success", variant: "contained", state: "press", tokens: { background: "{components.button.colors.success.contained.press.background}", foreground: "{components.button.colors.success.contained.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.success.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "warning", variant: "contained", state: "press", tokens: { background: "{components.button.colors.warning.contained.press.background}", foreground: "{components.button.colors.warning.contained.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.warning.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "error", variant: "contained", state: "press", tokens: { background: "{components.button.colors.error.contained.press.background}", foreground: "{components.button.colors.error.contained.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.error.contained.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  // state: press — outlined
  { color: "primary", variant: "outlined", state: "press", tokens: { background: "{components.button.colors.primary.outlined.press.background}", foreground: "{components.button.colors.primary.outlined.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.primary.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.primary.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "secondary", variant: "outlined", state: "press", tokens: { background: "{components.button.colors.secondary.outlined.press.background}", foreground: "{components.button.colors.secondary.outlined.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.secondary.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.secondary.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "info", variant: "outlined", state: "press", tokens: { background: "{components.button.colors.info.outlined.press.background}", foreground: "{components.button.colors.info.outlined.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.info.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.info.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "success", variant: "outlined", state: "press", tokens: { background: "{components.button.colors.success.outlined.press.background}", foreground: "{components.button.colors.success.outlined.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.success.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.success.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "warning", variant: "outlined", state: "press", tokens: { background: "{components.button.colors.warning.outlined.press.background}", foreground: "{components.button.colors.warning.outlined.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.warning.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.warning.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "error", variant: "outlined", state: "press", tokens: { background: "{components.button.colors.error.outlined.press.background}", foreground: "{components.button.colors.error.outlined.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.error.outlined.press.ring}", width: "{layouts.stroke.ring}", align: "outside" }, border: { color: "{components.button.colors.error.outlined.press.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  // state: press — text
  { color: "primary", variant: "text", state: "press", tokens: { background: "{components.button.colors.primary.text.press.background}", foreground: "{components.button.colors.primary.text.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.primary.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "secondary", variant: "text", state: "press", tokens: { background: "{components.button.colors.secondary.text.press.background}", foreground: "{components.button.colors.secondary.text.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.secondary.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "info", variant: "text", state: "press", tokens: { background: "{components.button.colors.info.text.press.background}", foreground: "{components.button.colors.info.text.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.info.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "success", variant: "text", state: "press", tokens: { background: "{components.button.colors.success.text.press.background}", foreground: "{components.button.colors.success.text.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.success.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "warning", variant: "text", state: "press", tokens: { background: "{components.button.colors.warning.text.press.background}", foreground: "{components.button.colors.warning.text.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.warning.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  { color: "error", variant: "text", state: "press", tokens: { background: "{components.button.colors.error.text.press.background}", foreground: "{components.button.colors.error.text.press.foreground}" }, strokes: { ring: { color: "{components.button.colors.error.text.press.ring}", width: "{layouts.stroke.ring}", align: "outside" } } },
  // state: disable — contained
  { color: "primary", variant: "contained", state: "disable", tokens: { background: "{components.button.colors.primary.contained.disable.background}", foreground: "{components.button.colors.primary.contained.disable.foreground}" } },
  { color: "secondary", variant: "contained", state: "disable", tokens: { background: "{components.button.colors.secondary.contained.disable.background}", foreground: "{components.button.colors.secondary.contained.disable.foreground}" } },
  { color: "info", variant: "contained", state: "disable", tokens: { background: "{components.button.colors.info.contained.disable.background}", foreground: "{components.button.colors.info.contained.disable.foreground}" } },
  { color: "success", variant: "contained", state: "disable", tokens: { background: "{components.button.colors.success.contained.disable.background}", foreground: "{components.button.colors.success.contained.disable.foreground}" } },
  { color: "warning", variant: "contained", state: "disable", tokens: { background: "{components.button.colors.warning.contained.disable.background}", foreground: "{components.button.colors.warning.contained.disable.foreground}" } },
  { color: "error", variant: "contained", state: "disable", tokens: { background: "{components.button.colors.error.contained.disable.background}", foreground: "{components.button.colors.error.contained.disable.foreground}" } },
  // state: disable — outlined
  { color: "primary", variant: "outlined", state: "disable", tokens: { background: "{components.button.colors.primary.outlined.disable.background}", foreground: "{components.button.colors.primary.outlined.disable.foreground}" }, strokes: { border: { color: "{components.button.colors.primary.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "secondary", variant: "outlined", state: "disable", tokens: { background: "{components.button.colors.secondary.outlined.disable.background}", foreground: "{components.button.colors.secondary.outlined.disable.foreground}" }, strokes: { border: { color: "{components.button.colors.secondary.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "info", variant: "outlined", state: "disable", tokens: { background: "{components.button.colors.info.outlined.disable.background}", foreground: "{components.button.colors.info.outlined.disable.foreground}" }, strokes: { border: { color: "{components.button.colors.info.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "success", variant: "outlined", state: "disable", tokens: { background: "{components.button.colors.success.outlined.disable.background}", foreground: "{components.button.colors.success.outlined.disable.foreground}" }, strokes: { border: { color: "{components.button.colors.success.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "warning", variant: "outlined", state: "disable", tokens: { background: "{components.button.colors.warning.outlined.disable.background}", foreground: "{components.button.colors.warning.outlined.disable.foreground}" }, strokes: { border: { color: "{components.button.colors.warning.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  { color: "error", variant: "outlined", state: "disable", tokens: { background: "{components.button.colors.error.outlined.disable.background}", foreground: "{components.button.colors.error.outlined.disable.foreground}" }, strokes: { border: { color: "{components.button.colors.error.outlined.disable.border}", width: "{layouts.stroke.outline}", align: "inside" } } },
  // state: disable — text
  { color: "primary", variant: "text", state: "disable", tokens: { foreground: "{components.button.colors.primary.text.disable.foreground}" } },
  { color: "secondary", variant: "text", state: "disable", tokens: { foreground: "{components.button.colors.secondary.text.disable.foreground}" } },
  { color: "info", variant: "text", state: "disable", tokens: { foreground: "{components.button.colors.info.text.disable.foreground}" } },
  { color: "success", variant: "text", state: "disable", tokens: { foreground: "{components.button.colors.success.text.disable.foreground}" } },
  { color: "warning", variant: "text", state: "disable", tokens: { foreground: "{components.button.colors.warning.text.disable.foreground}" } },
  { color: "error", variant: "text", state: "disable", tokens: { foreground: "{components.button.colors.error.text.disable.foreground}" } },
];

const STATE_SELECTORS: Record<ButtonState, string> = {
  default: "",
  hover: ":hover",
  focus: ":focus-visible",
  press: ":active",
  disable: ":disabled",
};

// Ordre du moins prioritaire au plus prioritaire (cascade CSS), inverse de
// `stateModel.precedence` ["disable","press","focus","hover","default"].
const STATE_ORDER: ButtonState[] = ["default", "hover", "focus", "press", "disable"];

function buildStyleSheet(): string {
  const rules: string[] = [];
  for (const state of STATE_ORDER) {
    for (const entry of VARIANTS.filter((v) => v.state === state)) {
      const sel = `.ucm-button[data-color="${entry.color}"][data-variant="${entry.variant}"]${STATE_SELECTORS[state]}`;
      const boxDecls: string[] = [];
      if (entry.tokens.background) boxDecls.push(`background-color: ${tk(entry.tokens.background)};`);
      if (entry.tokens.foreground) boxDecls.push(`color: ${tk(entry.tokens.foreground)}; fill: ${tk(entry.tokens.foreground)};`);
      if (entry.strokes?.border) {
        const b = entry.strokes.border;
        const inset = b.align === "outside" ? "" : "inset ";
        boxDecls.push(`box-shadow: ${inset}0 0 0 ${tk(b.width)} ${tk(b.color)};`);
      }
      if (boxDecls.length) rules.push(`${sel} .ucm-button__box { ${boxDecls.join(" ")} }`);

      if (entry.strokes?.ring) {
        const r = entry.strokes.ring;
        rules.push(`${sel} { outline: ${tk(r.width)} solid ${tk(r.color)}; outline-offset: 0; }`);
      } else if (state !== "default") {
        rules.push(`${sel} { outline: none; }`);
      }
    }
  }
  return rules.join("\n");
}

const STYLE_SHEET = buildStyleSheet();

function findVariant(color: ButtonColor, variant: ButtonVariant, state: ButtonState) {
  return VARIANTS.find((v) => v.color === color && v.variant === variant && v.state === state);
}

export function Button({
  disabled = false,
  color = "primary",
  variant = "contained",
  label = true,
  iconRight = true,
  iconLeft = true,
  size = "medium",
  iconLeftName,
  iconRightName,
  children = "Label",
  className,
  ...rest
}: ButtonProps) {
  const sizeTokens = SIZES[size];
  const state: ButtonState = disabled
    ? "disable"
    : "default"; // hover/focus/press sont pilotés par les pseudo-classes CSS ci-dessus.

  // Résolution informative uniquement (garde le contrat vérifiable) : le rendu
  // réel des couleurs par état passe par les pseudo-classes CSS générées
  // depuis VARIANTS, qui couvrent l'intégralité de la matrice.
  const baseVariant = findVariant(color, variant, state);
  if (!baseVariant) {
    // Combinaison absente du contrat : rien à peindre, on le signale au lieu
    // d'inventer un repli.
    console.warn(`Button: aucune entrée de contrat pour ${color}/${variant}/${state}`);
  }

  return (
    <button
      type="button"
      disabled={disabled}
      data-color={color}
      data-variant={variant}
      className={["ucm-button", className].filter(Boolean).join(" ")}
      style={{
        display: "inline-flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "fit-content",
        height: "fit-content",
        padding: 0,
        margin: 0,
        border: "none",
        background: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        font: "inherit",
      }}
      {...rest}
    >
      <style>{STYLE_SHEET}</style>
      <span
        className="ucm-button__box"
        style={{
          display: "inline-flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: sizeTokens.gap,
          padding: `${sizeTokens.paddingY} ${sizeTokens.paddingX}`,
          borderRadius: sizeTokens.radius,
        }}
      >
        {iconLeft && (
          <span
            aria-hidden="true"
            data-icon={iconLeftName ?? "arrow-left-long"}
            style={{ width: ICON_SIZE, height: ICON_SIZE, display: "inline-block", color: "inherit", fill: "currentColor" }}
          />
        )}
        {label && (
          <span
            style={{
              fontFamily: LABEL_TYPOGRAPHY.fontFamily,
              fontSize: LABEL_TYPOGRAPHY.fontSize,
              fontWeight: LABEL_TYPOGRAPHY.fontWeight,
              lineHeight: LABEL_TYPOGRAPHY.lineHeight,
              letterSpacing: LABEL_TYPOGRAPHY.letterSpacing,
            }}
          >
            {children}
          </span>
        )}
        {iconRight && (
          <span
            aria-hidden="true"
            data-icon={iconRightName ?? "arrow-right-long"}
            style={{ width: ICON_SIZE, height: ICON_SIZE, display: "inline-block", color: "inherit", fill: "currentColor" }}
          />
        )}
      </span>
    </button>
  );
}

export default Button;

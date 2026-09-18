import {
  useState,
  type ButtonHTMLAttributes,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Icone } from "../../Icone";

/** `{chemin.du.token}` → `var(--chemin-du-token)`, comme style-dictionary.config.mjs. */
function token(reference: string): string {
  const chemin = reference.slice(1, -1);
  return `var(--${chemin
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")})`;
}

type Color = "secondary" | "primary" | "info" | "success" | "warning" | "error";
type Variant = "contained" | "outlined" | "text";
type Size = "medium" | "big" | "small";
type State = "default" | "hover" | "focus" | "press" | "disable";

interface Stroke {
  color: string;
  width: string;
  align: "inside" | "outside" | "center";
}

interface VariantEntry {
  tokens: { background?: string; foreground?: string };
  strokes?: { border?: Stroke; ring?: Stroke };
  /** Vue exacte du contrat : st2 ajoute le radius du root, requis par le ring. */
  st: "st1" | "st2";
}

/** Transcrit `variants[]` : une entrée par combinaison `color|variant|state`. */
const VARIANTS: Record<string, VariantEntry> = {
  "primary|contained|default": {"tokens":{"background":"{components.button.colors.primary.contained.default.background}","foreground":"{components.button.colors.primary.contained.default.foreground}"},"st":"st1"},
  "secondary|contained|default": {"tokens":{"background":"{components.button.colors.secondary.contained.default.background}","foreground":"{components.button.colors.secondary.contained.default.foreground}"},"st":"st1"},
  "info|contained|default": {"tokens":{"background":"{components.button.colors.info.contained.default.background}","foreground":"{components.button.colors.info.contained.default.foreground}"},"st":"st1"},
  "success|contained|default": {"tokens":{"background":"{components.button.colors.success.contained.default.background}","foreground":"{components.button.colors.success.contained.default.foreground}"},"st":"st1"},
  "warning|contained|default": {"tokens":{"background":"{components.button.colors.warning.contained.default.background}","foreground":"{components.button.colors.warning.contained.default.foreground}"},"st":"st1"},
  "error|contained|default": {"tokens":{"background":"{components.button.colors.error.contained.default.background}","foreground":"{components.button.colors.error.contained.default.foreground}"},"st":"st1"},
  "primary|outlined|default": {"tokens":{"background":"{components.button.colors.primary.outlined.default.background}","foreground":"{components.button.colors.primary.outlined.default.foreground}"},"strokes":{"border":{"color":"{components.button.colors.primary.outlined.default.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "secondary|outlined|default": {"tokens":{"background":"{components.button.colors.secondary.outlined.default.background}","foreground":"{components.button.colors.secondary.outlined.default.foreground}"},"strokes":{"border":{"color":"{components.button.colors.secondary.outlined.default.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "info|outlined|default": {"tokens":{"background":"{components.button.colors.info.outlined.default.background}","foreground":"{components.button.colors.info.outlined.default.foreground}"},"strokes":{"border":{"color":"{components.button.colors.info.outlined.default.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "success|outlined|default": {"tokens":{"background":"{components.button.colors.success.outlined.default.background}","foreground":"{components.button.colors.success.outlined.default.foreground}"},"strokes":{"border":{"color":"{components.button.colors.success.outlined.default.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "warning|outlined|default": {"tokens":{"background":"{components.button.colors.warning.outlined.default.background}","foreground":"{components.button.colors.warning.outlined.default.foreground}"},"strokes":{"border":{"color":"{components.button.colors.warning.outlined.default.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "error|outlined|default": {"tokens":{"background":"{components.button.colors.error.outlined.default.background}","foreground":"{components.button.colors.error.outlined.default.foreground}"},"strokes":{"border":{"color":"{components.button.colors.error.outlined.default.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "primary|text|default": {"tokens":{"foreground":"{components.button.colors.primary.text.default.foreground}"},"st":"st1"},
  "secondary|text|default": {"tokens":{"foreground":"{components.button.colors.secondary.text.default.foreground}"},"st":"st1"},
  "info|text|default": {"tokens":{"foreground":"{components.button.colors.info.text.default.foreground}"},"st":"st1"},
  "success|text|default": {"tokens":{"foreground":"{components.button.colors.success.text.default.foreground}"},"st":"st1"},
  "warning|text|default": {"tokens":{"foreground":"{components.button.colors.warning.text.default.foreground}"},"st":"st1"},
  "error|text|default": {"tokens":{"foreground":"{components.button.colors.error.text.default.foreground}"},"st":"st1"},
  "primary|contained|hover": {"tokens":{"background":"{components.button.colors.primary.contained.hover.background}","foreground":"{components.button.colors.primary.contained.hover.foreground}"},"st":"st1"},
  "secondary|contained|hover": {"tokens":{"background":"{components.button.colors.secondary.contained.hover.background}","foreground":"{components.button.colors.secondary.contained.hover.foreground}"},"st":"st1"},
  "info|contained|hover": {"tokens":{"background":"{components.button.colors.info.contained.hover.background}","foreground":"{components.button.colors.info.contained.hover.foreground}"},"st":"st1"},
  "success|contained|hover": {"tokens":{"background":"{components.button.colors.success.contained.hover.background}","foreground":"{components.button.colors.success.contained.hover.foreground}"},"st":"st1"},
  "warning|contained|hover": {"tokens":{"background":"{components.button.colors.warning.contained.hover.background}","foreground":"{components.button.colors.warning.contained.hover.foreground}"},"st":"st1"},
  "error|contained|hover": {"tokens":{"background":"{components.button.colors.error.contained.hover.background}","foreground":"{components.button.colors.error.contained.hover.foreground}"},"st":"st1"},
  "primary|outlined|hover": {"tokens":{"background":"{components.button.colors.primary.outlined.hover.background}","foreground":"{components.button.colors.primary.outlined.hover.foreground}"},"strokes":{"border":{"color":"{components.button.colors.primary.outlined.hover.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "secondary|outlined|hover": {"tokens":{"background":"{components.button.colors.secondary.outlined.hover.background}","foreground":"{components.button.colors.secondary.outlined.hover.foreground}"},"strokes":{"border":{"color":"{components.button.colors.secondary.outlined.hover.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "info|outlined|hover": {"tokens":{"background":"{components.button.colors.info.outlined.hover.background}","foreground":"{components.button.colors.info.outlined.hover.foreground}"},"strokes":{"border":{"color":"{components.button.colors.info.outlined.hover.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "success|outlined|hover": {"tokens":{"background":"{components.button.colors.success.outlined.hover.background}","foreground":"{components.button.colors.success.outlined.hover.foreground}"},"strokes":{"border":{"color":"{components.button.colors.success.outlined.hover.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "warning|outlined|hover": {"tokens":{"background":"{components.button.colors.warning.outlined.hover.background}","foreground":"{components.button.colors.warning.outlined.hover.foreground}"},"strokes":{"border":{"color":"{components.button.colors.warning.outlined.hover.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "error|outlined|hover": {"tokens":{"background":"{components.button.colors.error.outlined.hover.background}","foreground":"{components.button.colors.error.outlined.hover.foreground}"},"strokes":{"border":{"color":"{components.button.colors.error.outlined.hover.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st1"},
  "primary|text|hover": {"tokens":{"background":"{components.button.colors.primary.text.hover.background}","foreground":"{components.button.colors.primary.text.hover.foreground}"},"st":"st1"},
  "secondary|text|hover": {"tokens":{"background":"{components.button.colors.secondary.text.hover.background}","foreground":"{components.button.colors.secondary.text.hover.foreground}"},"st":"st1"},
  "info|text|hover": {"tokens":{"background":"{components.button.colors.info.text.hover.background}","foreground":"{components.button.colors.info.text.hover.foreground}"},"st":"st1"},
  "success|text|hover": {"tokens":{"background":"{components.button.colors.success.text.hover.background}","foreground":"{components.button.colors.success.text.hover.foreground}"},"st":"st1"},
  "warning|text|hover": {"tokens":{"background":"{components.button.colors.warning.text.hover.background}","foreground":"{components.button.colors.warning.text.hover.foreground}"},"st":"st1"},
  "error|text|hover": {"tokens":{"background":"{components.button.colors.error.text.hover.background}","foreground":"{components.button.colors.error.text.hover.foreground}"},"st":"st1"},
  "primary|contained|focus": {"tokens":{"background":"{components.button.colors.primary.contained.focus.background}","foreground":"{components.button.colors.primary.contained.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.primary.contained.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "secondary|contained|focus": {"tokens":{"background":"{components.button.colors.secondary.contained.focus.background}","foreground":"{components.button.colors.secondary.contained.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.secondary.contained.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "info|contained|focus": {"tokens":{"background":"{components.button.colors.info.contained.focus.background}","foreground":"{components.button.colors.info.contained.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.info.contained.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "success|contained|focus": {"tokens":{"background":"{components.button.colors.success.contained.focus.background}","foreground":"{components.button.colors.success.contained.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.success.contained.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "warning|contained|focus": {"tokens":{"background":"{components.button.colors.warning.contained.focus.background}","foreground":"{components.button.colors.warning.contained.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.warning.contained.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "error|contained|focus": {"tokens":{"background":"{components.button.colors.error.contained.focus.background}","foreground":"{components.button.colors.error.contained.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.error.contained.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "primary|outlined|focus": {"tokens":{"background":"{components.button.colors.primary.outlined.focus.background}","foreground":"{components.button.colors.primary.outlined.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.primary.outlined.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.primary.outlined.focus.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "secondary|outlined|focus": {"tokens":{"background":"{components.button.colors.secondary.outlined.focus.background}","foreground":"{components.button.colors.secondary.outlined.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.secondary.outlined.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.secondary.outlined.focus.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "info|outlined|focus": {"tokens":{"background":"{components.button.colors.info.outlined.focus.background}","foreground":"{components.button.colors.info.outlined.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.info.outlined.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.info.outlined.focus.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "success|outlined|focus": {"tokens":{"background":"{components.button.colors.success.outlined.focus.background}","foreground":"{components.button.colors.success.outlined.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.success.outlined.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.success.outlined.focus.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "warning|outlined|focus": {"tokens":{"background":"{components.button.colors.warning.outlined.focus.background}","foreground":"{components.button.colors.warning.outlined.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.warning.outlined.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.warning.outlined.focus.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "error|outlined|focus": {"tokens":{"background":"{components.button.colors.error.outlined.focus.background}","foreground":"{components.button.colors.error.outlined.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.error.outlined.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.error.outlined.focus.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "primary|text|focus": {"tokens":{"background":"{components.button.colors.primary.text.focus.background}","foreground":"{components.button.colors.primary.text.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.primary.text.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "secondary|text|focus": {"tokens":{"background":"{components.button.colors.secondary.text.focus.background}","foreground":"{components.button.colors.secondary.text.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.secondary.text.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "info|text|focus": {"tokens":{"background":"{components.button.colors.info.text.focus.background}","foreground":"{components.button.colors.info.text.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.info.text.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "success|text|focus": {"tokens":{"background":"{components.button.colors.success.text.focus.background}","foreground":"{components.button.colors.success.text.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.success.text.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "warning|text|focus": {"tokens":{"background":"{components.button.colors.warning.text.focus.background}","foreground":"{components.button.colors.warning.text.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.warning.text.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "error|text|focus": {"tokens":{"background":"{components.button.colors.error.text.focus.background}","foreground":"{components.button.colors.error.text.focus.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.error.text.focus.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "primary|contained|press": {"tokens":{"background":"{components.button.colors.primary.contained.press.background}","foreground":"{components.button.colors.primary.contained.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.primary.contained.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "secondary|contained|press": {"tokens":{"background":"{components.button.colors.secondary.contained.press.background}","foreground":"{components.button.colors.secondary.contained.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.secondary.contained.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "info|contained|press": {"tokens":{"background":"{components.button.colors.info.contained.press.background}","foreground":"{components.button.colors.info.contained.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.info.contained.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "success|contained|press": {"tokens":{"background":"{components.button.colors.success.contained.press.background}","foreground":"{components.button.colors.success.contained.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.success.contained.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "warning|contained|press": {"tokens":{"background":"{components.button.colors.warning.contained.press.background}","foreground":"{components.button.colors.warning.contained.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.warning.contained.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "error|contained|press": {"tokens":{"background":"{components.button.colors.error.contained.press.background}","foreground":"{components.button.colors.error.contained.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.error.contained.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "primary|outlined|press": {"tokens":{"background":"{components.button.colors.primary.outlined.press.background}","foreground":"{components.button.colors.primary.outlined.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.primary.outlined.press.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.primary.outlined.press.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "secondary|outlined|press": {"tokens":{"background":"{components.button.colors.secondary.outlined.press.background}","foreground":"{components.button.colors.secondary.outlined.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.secondary.outlined.press.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.secondary.outlined.press.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "info|outlined|press": {"tokens":{"background":"{components.button.colors.info.outlined.press.background}","foreground":"{components.button.colors.info.outlined.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.info.outlined.press.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.info.outlined.press.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "success|outlined|press": {"tokens":{"background":"{components.button.colors.success.outlined.press.background}","foreground":"{components.button.colors.success.outlined.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.success.outlined.press.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.success.outlined.press.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "warning|outlined|press": {"tokens":{"background":"{components.button.colors.warning.outlined.press.background}","foreground":"{components.button.colors.warning.outlined.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.warning.outlined.press.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.warning.outlined.press.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "error|outlined|press": {"tokens":{"background":"{components.button.colors.error.outlined.press.background}","foreground":"{components.button.colors.error.outlined.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.error.outlined.press.ring}","width":"{layouts.stroke.ring}","align":"outside"},"border":{"color":"{components.button.colors.error.outlined.press.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "primary|text|press": {"tokens":{"background":"{components.button.colors.primary.text.press.background}","foreground":"{components.button.colors.primary.text.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.primary.text.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "secondary|text|press": {"tokens":{"background":"{components.button.colors.secondary.text.press.background}","foreground":"{components.button.colors.secondary.text.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.secondary.text.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "info|text|press": {"tokens":{"background":"{components.button.colors.info.text.press.background}","foreground":"{components.button.colors.info.text.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.info.text.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "success|text|press": {"tokens":{"background":"{components.button.colors.success.text.press.background}","foreground":"{components.button.colors.success.text.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.success.text.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "warning|text|press": {"tokens":{"background":"{components.button.colors.warning.text.press.background}","foreground":"{components.button.colors.warning.text.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.warning.text.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "error|text|press": {"tokens":{"background":"{components.button.colors.error.text.press.background}","foreground":"{components.button.colors.error.text.press.foreground}"},"strokes":{"ring":{"color":"{components.button.colors.error.text.press.ring}","width":"{layouts.stroke.ring}","align":"outside"}},"st":"st2"},
  "primary|contained|disable": {"tokens":{"background":"{components.button.colors.primary.contained.disable.background}","foreground":"{components.button.colors.primary.contained.disable.foreground}"},"st":"st1"},
  "secondary|contained|disable": {"tokens":{"background":"{components.button.colors.secondary.contained.disable.background}","foreground":"{components.button.colors.secondary.contained.disable.foreground}"},"st":"st1"},
  "info|contained|disable": {"tokens":{"background":"{components.button.colors.info.contained.disable.background}","foreground":"{components.button.colors.info.contained.disable.foreground}"},"st":"st1"},
  "success|contained|disable": {"tokens":{"background":"{components.button.colors.success.contained.disable.background}","foreground":"{components.button.colors.success.contained.disable.foreground}"},"st":"st1"},
  "warning|contained|disable": {"tokens":{"background":"{components.button.colors.warning.contained.disable.background}","foreground":"{components.button.colors.warning.contained.disable.foreground}"},"st":"st1"},
  "error|contained|disable": {"tokens":{"background":"{components.button.colors.error.contained.disable.background}","foreground":"{components.button.colors.error.contained.disable.foreground}"},"st":"st1"},
  "primary|outlined|disable": {"tokens":{"background":"{components.button.colors.primary.outlined.disable.background}","foreground":"{components.button.colors.primary.outlined.disable.foreground}"},"strokes":{"border":{"color":"{components.button.colors.primary.outlined.disable.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "secondary|outlined|disable": {"tokens":{"background":"{components.button.colors.secondary.outlined.disable.background}","foreground":"{components.button.colors.secondary.outlined.disable.foreground}"},"strokes":{"border":{"color":"{components.button.colors.secondary.outlined.disable.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "info|outlined|disable": {"tokens":{"background":"{components.button.colors.info.outlined.disable.background}","foreground":"{components.button.colors.info.outlined.disable.foreground}"},"strokes":{"border":{"color":"{components.button.colors.info.outlined.disable.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "success|outlined|disable": {"tokens":{"background":"{components.button.colors.success.outlined.disable.background}","foreground":"{components.button.colors.success.outlined.disable.foreground}"},"strokes":{"border":{"color":"{components.button.colors.success.outlined.disable.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "warning|outlined|disable": {"tokens":{"background":"{components.button.colors.warning.outlined.disable.background}","foreground":"{components.button.colors.warning.outlined.disable.foreground}"},"strokes":{"border":{"color":"{components.button.colors.warning.outlined.disable.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "error|outlined|disable": {"tokens":{"background":"{components.button.colors.error.outlined.disable.background}","foreground":"{components.button.colors.error.outlined.disable.foreground}"},"strokes":{"border":{"color":"{components.button.colors.error.outlined.disable.border}","width":"{layouts.stroke.outline}","align":"inside"}},"st":"st2"},
  "primary|text|disable": {"tokens":{"foreground":"{components.button.colors.primary.text.disable.foreground}"},"st":"st2"},
  "secondary|text|disable": {"tokens":{"foreground":"{components.button.colors.secondary.text.disable.foreground}"},"st":"st2"},
  "info|text|disable": {"tokens":{"foreground":"{components.button.colors.info.text.disable.foreground}"},"st":"st2"},
  "success|text|disable": {"tokens":{"foreground":"{components.button.colors.success.text.disable.foreground}"},"st":"st2"},
  "warning|text|disable": {"tokens":{"foreground":"{components.button.colors.warning.text.disable.foreground}"},"st":"st2"},
  "error|text|disable": {"tokens":{"foreground":"{components.button.colors.error.text.disable.foreground}"},"st":"st2"},
};

/** `structure.sizes` : remplace gap/padding/radius du wrapper selon `size`. */
const SIZES: Record<Size, { gap: string; paddingX: string; paddingY: string; radius: string }> = {
  medium: {
    gap: token("{components.button.sizes.medium.gap}"),
    paddingX: token("{components.button.sizes.medium.padding-x}"),
    paddingY: token("{components.button.sizes.medium.padding-y}"),
    radius: token("{components.button.sizes.medium.border-radius}"),
  },
  big: {
    gap: token("{components.button.sizes.big.gap}"),
    paddingX: token("{components.button.sizes.big.padding-x}"),
    paddingY: token("{components.button.sizes.big.padding-y}"),
    radius: token("{components.button.sizes.big.border-radius}"),
  },
  small: {
    gap: token("{components.button.sizes.small.gap}"),
    paddingX: token("{components.button.sizes.small.padding-x}"),
    paddingY: token("{components.button.sizes.small.padding-y}"),
    radius: token("{components.button.sizes.small.border-radius}"),
  },
};

const ICON_SIZE = token("{components.icons.sizes.sm}");
const OUTER_RADIUS = token("{layouts.radius.md}");

/** `stateModel.precedence`, du plus fort au plus faible. */
const PRECEDENCE: State[] = ["disable", "press", "focus", "hover", "default"];

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  color: Color;
  variant: Variant;
  size: Size;
  disabled?: boolean;
  /** Affiche ou masque le label. */
  label?: boolean;
  /** Contenu du label, remplaçable ; par défaut l'échantillon du contrat. */
  children?: ReactNode;
  /** Affiche ou masque l'icône de gauche. */
  iconLeft?: boolean;
  /** Affiche ou masque l'icône de droite. */
  iconRight?: boolean;
  /** Nom d'icône (kit Font Awesome), modifiable ; replie sur l'icône du contrat. */
  iconLeftName?: string;
  iconRightName?: string;
}

export function Button({
  color,
  variant,
  size,
  disabled = false,
  label = true,
  children = "Label",
  iconLeft = true,
  iconRight = true,
  iconLeftName = "arrow-left-long",
  iconRightName = "arrow-right-long",
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onFocus,
  onBlur,
  style,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const active: Record<State, boolean> = {
    disable: disabled,
    press: pressed,
    focus: focusVisible,
    hover: hovered,
    default: true,
  };
  const state = PRECEDENCE.find((candidate) => active[candidate]) ?? "default";
  const entry = VARIANTS[`${color}|${variant}|${state}`];
  const sizeEntry = SIZES[size];

  const ring = entry.strokes?.ring;
  const border = entry.strokes?.border;

  return (
    <button
      {...rest}
      disabled={disabled}
      onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event: PointerEvent<HTMLButtonElement>) => {
        setHovered(false);
        setPressed(false);
        onPointerLeave?.(event);
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        setPressed(true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event: PointerEvent<HTMLButtonElement>) => {
        setPressed(false);
        onPointerUp?.(event);
      }}
      onFocus={(event: FocusEvent<HTMLButtonElement>) => {
        setFocusVisible(event.target.matches(":focus-visible"));
        onFocus?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLButtonElement>) => {
        setFocusVisible(false);
        onBlur?.(event);
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        width: "fit-content",
        height: "fit-content",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        background: "none",
        border: "none",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        borderRadius: entry.st === "st2" ? OUTER_RADIUS : undefined,
        outlineColor: ring ? token(ring.color) : undefined,
        outlineWidth: ring ? token(ring.width) : undefined,
        outlineStyle: ring ? "solid" : undefined,
        outlineOffset: ring ? 0 : undefined,
        ...style,
      }}
    >
      <span
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: sizeEntry.gap,
          padding: `${sizeEntry.paddingY} ${sizeEntry.paddingX}`,
          borderRadius: sizeEntry.radius,
          backgroundColor: entry.tokens.background ? token(entry.tokens.background) : undefined,
          color: entry.tokens.foreground ? token(entry.tokens.foreground) : undefined,
          boxShadow: border ? `inset 0 0 0 ${token(border.width)} ${token(border.color)}` : undefined,
          fontFamily: token("{primitives.fontfamily.base}"),
          fontSize: token("{typography.label.large.fontsize}"),
          fontWeight: token("{typography.label.large.fontweight}") as unknown as number,
          lineHeight: token("{typography.label.large.lineheight}"),
          letterSpacing: token("{typography.label.large.letterspacing}"),
        }}
      >
        {iconLeft ? <Icone nom={iconLeftName} taille={ICON_SIZE} /> : null}
        {label ? <span>{children}</span> : null}
        {iconRight ? <Icone nom={iconRightName} taille={ICON_SIZE} /> : null}
      </span>
    </button>
  );
}

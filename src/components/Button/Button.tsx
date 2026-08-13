import {
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from "../../generated/contracts/Button.ts";

export type { ButtonColor, ButtonSize, ButtonVariant };

/** Nom d'icône opaque : l'application le résout avec son propre kit. */
export type ButtonIconName = string;

/** Axe « state » du contrat (`stateModel.axis`). */
type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

/** Styles de texte déclarés par `textStyles`. */
type ButtonTextStyle = "label.large";

interface ButtonPaint {
  readonly background?: string;
  readonly foreground?: string;
}

interface ButtonStroke {
  readonly color: string;
  readonly width: string | null;
}

interface ButtonStrokes {
  readonly ring?: ButtonStroke;
  readonly border?: ButtonStroke;
}

interface TypographyUsage {
  readonly slotPath: readonly string[];
  readonly style: ButtonTextStyle;
}

type ByVariant<T> = Record<ButtonColor, Record<ButtonVariant, Record<ButtonState, T>>>;

/**
 * `structure.variantTokens`, transcrit feuille par feuille. Chaque état est
 * complet : un rôle absent ne se reprend jamais depuis `default`.
 */
const PAINTS: ByVariant<ButtonPaint> = {
  secondary: {
    contained: {
      default: { background: "{components.button.colors.secondary.contained.default.background}", foreground: "{components.button.colors.secondary.contained.default.foreground}" },
      hover: { background: "{components.button.colors.secondary.contained.hover.background}", foreground: "{components.button.colors.secondary.contained.hover.foreground}" },
      focus: { background: "{components.button.colors.secondary.contained.focus.background}", foreground: "{components.button.colors.secondary.contained.focus.foreground}" },
      press: { background: "{components.button.colors.secondary.contained.press.background}", foreground: "{components.button.colors.secondary.contained.press.foreground}" },
      disable: { background: "{components.button.colors.secondary.contained.disable.background}", foreground: "{components.button.colors.secondary.contained.disable.foreground}" },
    },
    outlined: {
      default: { background: "{components.button.colors.secondary.outlined.default.background}", foreground: "{components.button.colors.secondary.outlined.default.foreground}" },
      hover: { background: "{components.button.colors.secondary.outlined.hover.background}", foreground: "{components.button.colors.secondary.outlined.hover.foreground}" },
      focus: { background: "{components.button.colors.secondary.outlined.focus.background}", foreground: "{components.button.colors.secondary.outlined.focus.foreground}" },
      press: { background: "{components.button.colors.secondary.outlined.press.background}", foreground: "{components.button.colors.secondary.outlined.press.foreground}" },
      disable: { background: "{components.button.colors.secondary.outlined.disable.background}", foreground: "{components.button.colors.secondary.outlined.disable.foreground}" },
    },
    text: {
      default: { foreground: "{components.button.colors.secondary.text.default.foreground}" },
      hover: { background: "{components.button.colors.secondary.text.hover.background}", foreground: "{components.button.colors.secondary.text.hover.foreground}" },
      focus: { background: "{components.button.colors.secondary.text.focus.background}", foreground: "{components.button.colors.secondary.text.focus.foreground}" },
      press: { background: "{components.button.colors.secondary.text.press.background}", foreground: "{components.button.colors.secondary.text.press.foreground}" },
      disable: { foreground: "{components.button.colors.secondary.text.disable.foreground}" },
    },
  },
  primary: {
    contained: {
      default: { background: "{components.button.colors.primary.contained.default.background}", foreground: "{components.button.colors.primary.contained.default.foreground}" },
      hover: { background: "{components.button.colors.primary.contained.hover.background}", foreground: "{components.button.colors.primary.contained.hover.foreground}" },
      focus: { background: "{components.button.colors.primary.contained.focus.background}", foreground: "{components.button.colors.primary.contained.focus.foreground}" },
      press: { background: "{components.button.colors.primary.contained.press.background}", foreground: "{components.button.colors.primary.contained.press.foreground}" },
      disable: { background: "{components.button.colors.primary.contained.disable.background}", foreground: "{components.button.colors.primary.contained.disable.foreground}" },
    },
    outlined: {
      default: { background: "{components.button.colors.primary.outlined.default.background}", foreground: "{components.button.colors.primary.outlined.default.foreground}" },
      hover: { background: "{components.button.colors.primary.outlined.hover.background}", foreground: "{components.button.colors.primary.outlined.hover.foreground}" },
      focus: { background: "{components.button.colors.primary.outlined.focus.background}", foreground: "{components.button.colors.primary.outlined.focus.foreground}" },
      press: { background: "{components.button.colors.primary.outlined.press.background}", foreground: "{components.button.colors.primary.outlined.press.foreground}" },
      disable: { background: "{components.button.colors.primary.outlined.disable.background}", foreground: "{components.button.colors.primary.outlined.disable.foreground}" },
    },
    text: {
      default: { foreground: "{components.button.colors.primary.text.default.foreground}" },
      hover: { background: "{components.button.colors.primary.text.hover.background}", foreground: "{components.button.colors.primary.text.hover.foreground}" },
      focus: { background: "{components.button.colors.primary.text.focus.background}", foreground: "{components.button.colors.primary.text.focus.foreground}" },
      press: { background: "{components.button.colors.primary.text.press.background}", foreground: "{components.button.colors.primary.text.press.foreground}" },
      disable: { foreground: "{components.button.colors.primary.text.disable.foreground}" },
    },
  },
  info: {
    contained: {
      default: { background: "{components.button.colors.info.contained.default.background}", foreground: "{components.button.colors.info.contained.default.foreground}" },
      hover: { background: "{components.button.colors.info.contained.hover.background}", foreground: "{components.button.colors.info.contained.hover.foreground}" },
      focus: { background: "{components.button.colors.info.contained.focus.background}", foreground: "{components.button.colors.info.contained.focus.foreground}" },
      press: { background: "{components.button.colors.info.contained.press.background}", foreground: "{components.button.colors.info.contained.press.foreground}" },
      disable: { background: "{components.button.colors.info.contained.disable.background}", foreground: "{components.button.colors.info.contained.disable.foreground}" },
    },
    outlined: {
      default: { background: "{components.button.colors.info.outlined.default.background}", foreground: "{components.button.colors.info.outlined.default.foreground}" },
      hover: { background: "{components.button.colors.info.outlined.hover.background}", foreground: "{components.button.colors.info.outlined.hover.foreground}" },
      focus: { background: "{components.button.colors.info.outlined.focus.background}", foreground: "{components.button.colors.info.outlined.focus.foreground}" },
      press: { background: "{components.button.colors.info.outlined.press.background}", foreground: "{components.button.colors.info.outlined.press.foreground}" },
      disable: { background: "{components.button.colors.info.outlined.disable.background}", foreground: "{components.button.colors.info.outlined.disable.foreground}" },
    },
    text: {
      default: { foreground: "{components.button.colors.info.text.default.foreground}" },
      hover: { background: "{components.button.colors.info.text.hover.background}", foreground: "{components.button.colors.info.text.hover.foreground}" },
      focus: { background: "{components.button.colors.info.text.focus.background}", foreground: "{components.button.colors.info.text.focus.foreground}" },
      press: { background: "{components.button.colors.info.text.press.background}", foreground: "{components.button.colors.info.text.press.foreground}" },
      disable: { foreground: "{components.button.colors.info.text.disable.foreground}" },
    },
  },
  success: {
    contained: {
      default: { background: "{components.button.colors.success.contained.default.background}", foreground: "{components.button.colors.success.contained.default.foreground}" },
      hover: { background: "{components.button.colors.success.contained.hover.background}", foreground: "{components.button.colors.success.contained.hover.foreground}" },
      focus: { background: "{components.button.colors.success.contained.focus.background}", foreground: "{components.button.colors.success.contained.focus.foreground}" },
      press: { background: "{components.button.colors.success.contained.press.background}", foreground: "{components.button.colors.success.contained.press.foreground}" },
      disable: { background: "{components.button.colors.success.contained.disable.background}", foreground: "{components.button.colors.success.contained.disable.foreground}" },
    },
    outlined: {
      default: { background: "{components.button.colors.success.outlined.default.background}", foreground: "{components.button.colors.success.outlined.default.foreground}" },
      hover: { background: "{components.button.colors.success.outlined.hover.background}", foreground: "{components.button.colors.success.outlined.hover.foreground}" },
      focus: { background: "{components.button.colors.success.outlined.focus.background}", foreground: "{components.button.colors.success.outlined.focus.foreground}" },
      press: { background: "{components.button.colors.success.outlined.press.background}", foreground: "{components.button.colors.success.outlined.press.foreground}" },
      disable: { background: "{components.button.colors.success.outlined.disable.background}", foreground: "{components.button.colors.success.outlined.disable.foreground}" },
    },
    text: {
      default: { foreground: "{components.button.colors.success.text.default.foreground}" },
      hover: { background: "{components.button.colors.success.text.hover.background}", foreground: "{components.button.colors.success.text.hover.foreground}" },
      focus: { background: "{components.button.colors.success.text.focus.background}", foreground: "{components.button.colors.success.text.focus.foreground}" },
      press: { background: "{components.button.colors.success.text.press.background}", foreground: "{components.button.colors.success.text.press.foreground}" },
      disable: { foreground: "{components.button.colors.success.text.disable.foreground}" },
    },
  },
  warning: {
    contained: {
      default: { background: "{components.button.colors.warning.contained.default.background}", foreground: "{components.button.colors.warning.contained.default.foreground}" },
      hover: { background: "{components.button.colors.warning.contained.hover.background}", foreground: "{components.button.colors.warning.contained.hover.foreground}" },
      focus: { background: "{components.button.colors.warning.contained.focus.background}", foreground: "{components.button.colors.warning.contained.focus.foreground}" },
      press: { background: "{components.button.colors.warning.contained.press.background}", foreground: "{components.button.colors.warning.contained.press.foreground}" },
      disable: { background: "{components.button.colors.warning.contained.disable.background}", foreground: "{components.button.colors.warning.contained.disable.foreground}" },
    },
    outlined: {
      default: { background: "{components.button.colors.warning.outlined.default.background}", foreground: "{components.button.colors.warning.outlined.default.foreground}" },
      hover: { background: "{components.button.colors.warning.outlined.hover.background}", foreground: "{components.button.colors.warning.outlined.hover.foreground}" },
      focus: { background: "{components.button.colors.warning.outlined.focus.background}", foreground: "{components.button.colors.warning.outlined.focus.foreground}" },
      press: { background: "{components.button.colors.warning.outlined.press.background}", foreground: "{components.button.colors.warning.outlined.press.foreground}" },
      disable: { background: "{components.button.colors.warning.outlined.disable.background}", foreground: "{components.button.colors.warning.outlined.disable.foreground}" },
    },
    text: {
      default: { foreground: "{components.button.colors.warning.text.default.foreground}" },
      hover: { background: "{components.button.colors.warning.text.hover.background}", foreground: "{components.button.colors.warning.text.hover.foreground}" },
      focus: { background: "{components.button.colors.warning.text.focus.background}", foreground: "{components.button.colors.warning.text.focus.foreground}" },
      press: { background: "{components.button.colors.warning.text.press.background}", foreground: "{components.button.colors.warning.text.press.foreground}" },
      disable: { foreground: "{components.button.colors.warning.text.disable.foreground}" },
    },
  },
  error: {
    contained: {
      default: { background: "{components.button.colors.error.contained.default.background}", foreground: "{components.button.colors.error.contained.default.foreground}" },
      hover: { background: "{components.button.colors.error.contained.hover.background}", foreground: "{components.button.colors.error.contained.hover.foreground}" },
      focus: { background: "{components.button.colors.error.contained.focus.background}", foreground: "{components.button.colors.error.contained.focus.foreground}" },
      press: { background: "{components.button.colors.error.contained.press.background}", foreground: "{components.button.colors.error.contained.press.foreground}" },
      disable: { background: "{components.button.colors.error.contained.disable.background}", foreground: "{components.button.colors.error.contained.disable.foreground}" },
    },
    outlined: {
      default: { background: "{components.button.colors.error.outlined.default.background}", foreground: "{components.button.colors.error.outlined.default.foreground}" },
      hover: { background: "{components.button.colors.error.outlined.hover.background}", foreground: "{components.button.colors.error.outlined.hover.foreground}" },
      focus: { background: "{components.button.colors.error.outlined.focus.background}", foreground: "{components.button.colors.error.outlined.focus.foreground}" },
      press: { background: "{components.button.colors.error.outlined.press.background}", foreground: "{components.button.colors.error.outlined.press.foreground}" },
      disable: { background: "{components.button.colors.error.outlined.disable.background}", foreground: "{components.button.colors.error.outlined.disable.foreground}" },
    },
    text: {
      default: { foreground: "{components.button.colors.error.text.default.foreground}" },
      hover: { background: "{components.button.colors.error.text.hover.background}", foreground: "{components.button.colors.error.text.hover.foreground}" },
      focus: { background: "{components.button.colors.error.text.focus.background}", foreground: "{components.button.colors.error.text.focus.foreground}" },
      press: { background: "{components.button.colors.error.text.press.background}", foreground: "{components.button.colors.error.text.press.foreground}" },
      disable: { foreground: "{components.button.colors.error.text.disable.foreground}" },
    },
  },
};

/** `structure.variantStrokes`. Le `ring` est extérieur, la `border` intérieure. */
const STROKES: ByVariant<ButtonStrokes> = {
  secondary: {
    contained: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.secondary.contained.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.secondary.contained.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
    outlined: {
      default: { border: { color: "{components.button.colors.secondary.outlined.default.border}", width: "{layouts.stroke.outline}" } },
      hover: { border: { color: "{components.button.colors.secondary.outlined.hover.border}", width: "{layouts.stroke.outline}" } },
      focus: { ring: { color: "{components.button.colors.secondary.outlined.focus.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.secondary.outlined.focus.border}", width: "{layouts.stroke.outline}" } },
      press: { ring: { color: "{components.button.colors.secondary.outlined.press.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.secondary.outlined.press.border}", width: "{layouts.stroke.outline}" } },
      disable: { border: { color: "{components.button.colors.secondary.outlined.disable.border}", width: "{layouts.stroke.outline}" } },
    },
    text: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.secondary.text.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.secondary.text.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
  },
  primary: {
    contained: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.primary.contained.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.primary.contained.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
    outlined: {
      default: { border: { color: "{components.button.colors.primary.outlined.default.border}", width: "{layouts.stroke.outline}" } },
      hover: { border: { color: "{components.button.colors.primary.outlined.hover.border}", width: "{layouts.stroke.outline}" } },
      focus: { ring: { color: "{components.button.colors.primary.outlined.focus.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.primary.outlined.focus.border}", width: "{layouts.stroke.outline}" } },
      press: { ring: { color: "{components.button.colors.primary.outlined.press.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.primary.outlined.press.border}", width: "{layouts.stroke.outline}" } },
      disable: { border: { color: "{components.button.colors.primary.outlined.disable.border}", width: "{layouts.stroke.outline}" } },
    },
    text: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.primary.text.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.primary.text.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
  },
  info: {
    contained: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.info.contained.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.info.contained.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
    outlined: {
      default: { border: { color: "{components.button.colors.info.outlined.default.border}", width: "{layouts.stroke.outline}" } },
      hover: { border: { color: "{components.button.colors.info.outlined.hover.border}", width: "{layouts.stroke.outline}" } },
      focus: { ring: { color: "{components.button.colors.info.outlined.focus.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.info.outlined.focus.border}", width: "{layouts.stroke.outline}" } },
      press: { ring: { color: "{components.button.colors.info.outlined.press.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.info.outlined.press.border}", width: "{layouts.stroke.outline}" } },
      disable: { border: { color: "{components.button.colors.info.outlined.disable.border}", width: "{layouts.stroke.outline}" } },
    },
    text: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.info.text.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.info.text.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
  },
  success: {
    contained: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.success.contained.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.success.contained.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
    outlined: {
      default: { border: { color: "{components.button.colors.success.outlined.default.border}", width: "{layouts.stroke.outline}" } },
      hover: { border: { color: "{components.button.colors.success.outlined.hover.border}", width: "{layouts.stroke.outline}" } },
      focus: { ring: { color: "{components.button.colors.success.outlined.focus.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.success.outlined.focus.border}", width: "{layouts.stroke.outline}" } },
      press: { ring: { color: "{components.button.colors.success.outlined.press.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.success.outlined.press.border}", width: "{layouts.stroke.outline}" } },
      disable: { border: { color: "{components.button.colors.success.outlined.disable.border}", width: "{layouts.stroke.outline}" } },
    },
    text: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.success.text.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.success.text.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
  },
  warning: {
    contained: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.warning.contained.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.warning.contained.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
    outlined: {
      default: { border: { color: "{components.button.colors.warning.outlined.default.border}", width: "{layouts.stroke.outline}" } },
      hover: { border: { color: "{components.button.colors.warning.outlined.hover.border}", width: "{layouts.stroke.outline}" } },
      focus: { ring: { color: "{components.button.colors.warning.outlined.focus.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.warning.outlined.focus.border}", width: "{layouts.stroke.outline}" } },
      press: { ring: { color: "{components.button.colors.warning.outlined.press.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.warning.outlined.press.border}", width: "{layouts.stroke.outline}" } },
      disable: { border: { color: "{components.button.colors.warning.outlined.disable.border}", width: "{layouts.stroke.outline}" } },
    },
    text: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.warning.text.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.warning.text.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
  },
  error: {
    contained: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.error.contained.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.error.contained.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
    outlined: {
      default: { border: { color: "{components.button.colors.error.outlined.default.border}", width: "{layouts.stroke.outline}" } },
      hover: { border: { color: "{components.button.colors.error.outlined.hover.border}", width: "{layouts.stroke.outline}" } },
      focus: { ring: { color: "{components.button.colors.error.outlined.focus.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.error.outlined.focus.border}", width: "{layouts.stroke.outline}" } },
      press: { ring: { color: "{components.button.colors.error.outlined.press.ring}", width: "{layouts.stroke.ring}" }, border: { color: "{components.button.colors.error.outlined.press.border}", width: "{layouts.stroke.outline}" } },
      disable: { border: { color: "{components.button.colors.error.outlined.disable.border}", width: "{layouts.stroke.outline}" } },
    },
    text: {
      default: {},
      hover: {},
      focus: { ring: { color: "{components.button.colors.error.text.focus.ring}", width: "{layouts.stroke.ring}" } },
      press: { ring: { color: "{components.button.colors.error.text.press.ring}", width: "{layouts.stroke.ring}" } },
      disable: {},
    },
  },
};

/** `structure.variantTypography` : quel style s'applique à quel chemin de slots. */
const TYPOGRAPHY: ByVariant<readonly TypographyUsage[]> = {
  secondary: {
    contained: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    outlined: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    text: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
  },
  primary: {
    contained: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    outlined: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    text: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
  },
  info: {
    contained: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    outlined: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    text: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
  },
  success: {
    contained: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    outlined: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    text: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
  },
  warning: {
    contained: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    outlined: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    text: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
  },
  error: {
    contained: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    outlined: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
    text: {
      default: [{ slotPath: ["label"], style: "label.large" }],
      hover: [{ slotPath: ["label"], style: "label.large" }],
      focus: [{ slotPath: ["label"], style: "label.large" }],
      press: [{ slotPath: ["label"], style: "label.large" }],
      disable: [{ slotPath: ["label"], style: "label.large" }],
    },
  },
};

/** `structure.sizes` : les dimensions vivent ici, le contrat publie un axe de tailles. */
const SIZES: Record<ButtonSize, {
  readonly gap: string;
  readonly paddingX: string;
  readonly paddingY: string;
  readonly radius: string;
}> = {
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

/** `textStyles` : la typographie vient du text style, jamais du slot. */
const TEXT_STYLES: Record<ButtonTextStyle, {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly fontWeight: string;
  readonly lineHeight: string;
  readonly letterSpacing: string;
}> = {
  "label.large": {
    fontFamily: "{primitives.fontfamily.base}",
    fontSize: "{typography.label.large.fontsize}",
    fontWeight: "{typography.label.large.fontweight}",
    lineHeight: "{typography.label.large.lineheight}",
    letterSpacing: "{typography.label.large.letterspacing}",
  },
};

/** `stateModel.precedence`, du plus fort au plus faible. */
const STATE_PRECEDENCE: readonly ButtonState[] = ["disable", "press", "focus", "hover", "default"];

/** `icons.arrowLeftLong` — politique `modifiable`, repli sur le nom Figma. */
const ICON_LEFT = {
  figmaName: "arrow-left-long",
  size: "{components.icons.sizes.sm}",
} as const;

/** `icons.arrowRightLong` — politique `modifiable`, repli sur le nom Figma. */
const ICON_RIGHT = {
  figmaName: "arrow-right-long",
  size: "{components.icons.sizes.sm}",
} as const;

/** Chemins de slots des parties textuelles, tels que `variantTypography` les nomme. */
const SLOT_PATH_LABEL = ["label"] as const;

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

/** Un stroke sans épaisseur ne se rend pas : le navigateur n'en invente aucune. */
function hasWidth(stroke: ButtonStroke | undefined): stroke is ButtonStroke & { width: string } {
  return stroke !== undefined && stroke.width !== null;
}

/** Surface publique issue du contrat ; elle l'emporte sur l'attribut natif homonyme. */
interface ButtonContractProps {
  /** `props.disabled` */
  disabled?: boolean;
  /** `props.color` */
  color?: ButtonColor;
  /** `props.variant` */
  variant?: ButtonVariant;
  /** `props.label` — affiche ou masque le label. */
  label?: boolean;
  /** `props.iconRight` — affiche ou masque l'icône de droite. */
  iconRight?: boolean;
  /** `props.iconLeft` — affiche ou masque l'icône de gauche. */
  iconLeft?: boolean;
  /** `props.size` */
  size?: ButtonSize;
  /** `props.iconLeftName` — icône modifiable, `null` par défaut au contrat. */
  iconLeftName?: ButtonIconName | null;
  /** `props.iconRightName` — icône modifiable, `null` par défaut au contrat. */
  iconRightName?: ButtonIconName | null;
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {}

/**
 * Button — contrat 4.8, `Button.contract.json`.
 *
 * Les états sont rendus en styles inline pour ce composant de validation : ils
 * suivent `stateModel` (`:hover`, `:focus-visible`, `:active`, `[disabled]`)
 * avec les événements Pointer et clavier, et sa précédence.
 */
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
  children,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  style,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const active: Record<ButtonState, boolean> = {
    default: true,
    hover: hovered,
    focus: focusVisible,
    press: pressed,
    disable: disabled,
  };
  const state = STATE_PRECEDENCE.find((candidate) => active[candidate]) ?? "default";

  const paint = PAINTS[color][variant][state];
  const stroke = STROKES[color][variant][state];
  const usages = TYPOGRAPHY[color][variant][state];
  const dimensions = SIZES[size];

  const border = hasWidth(stroke.border)
    ? {
        borderColor: tokenVar(stroke.border.color),
        borderStyle: "solid" as const,
        borderWidth: tokenVar(stroke.border.width),
      }
    // Aucune bordure au contrat : on retire celle du navigateur plutôt que d'en
    // inventer une couleur.
    : { borderStyle: "none" as const };

  const ring = hasWidth(stroke.ring)
    // `rendering.roles.ring` : tracé à l'extérieur, repli `box-shadow`.
    ? `0 0 0 ${tokenVar(stroke.ring.width)} ${tokenVar(stroke.ring.color)}`
    : undefined;

  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        alignItems: "center",
        backgroundColor: paint.background ? tokenVar(paint.background) : "transparent",
        boxShadow: ring,
        boxSizing: "border-box",
        color: paint.foreground ? tokenVar(paint.foreground) : undefined,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        flexDirection: "row",
        gap: tokenVar(dimensions.gap),
        height: "fit-content",
        justifyContent: "center",
        // Le ring du contrat remplace le contour natif du focus.
        outline: "none",
        paddingBlock: tokenVar(dimensions.paddingY),
        paddingInline: tokenVar(dimensions.paddingX),
        // `structure.sizing`, en vocabulaire CSS : comment le composant occupe
        // la place qu'on lui donne, sur chaque axe.
        width: "fit-content",
        ...border,
        borderRadius: tokenVar(dimensions.radius),
        ...style,
      }}
      onPointerEnter={(event) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        setPressed(false);
        onPointerLeave?.(event);
      }}
      onPointerDown={(event) => {
        setPressed(true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        setPressed(false);
        onPointerUp?.(event);
      }}
      onPointerCancel={(event) => {
        setPressed(false);
        onPointerCancel?.(event);
      }}
      onFocus={(event) => {
        setFocusVisible(event.currentTarget.matches(":focus-visible"));
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocusVisible(false);
        setPressed(false);
        onBlur?.(event);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          setPressed(true);
        }
        onKeyDown?.(event);
      }}
      onKeyUp={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          setPressed(false);
        }
        onKeyUp?.(event);
      }}
    >
      {iconLeft ? (
        <ContractIcon
          name={iconLeftName ?? ICON_LEFT.figmaName}
          sizeToken={ICON_LEFT.size}
        />
      ) : null}
      {label ? <span style={textStyleOf(usages, SLOT_PATH_LABEL)}>{children}</span> : null}
      {iconRight ? (
        <ContractIcon
          name={iconRightName ?? ICON_RIGHT.figmaName}
          sizeToken={ICON_RIGHT.size}
        />
      ) : null}
    </button>
  );
}

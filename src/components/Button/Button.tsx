/**
 * Reconstruit à froid depuis Button.contract.json (contractVersion 11.0),
 * sans lecture de l'implémentation précédente. Transcription statique : ce
 * fichier n'importe ni n'interprète le JSON du contrat au runtime.
 */
import type { ButtonHTMLAttributes, FocusEvent, ReactNode } from "react";
import { useState } from "react";

import type { ButtonColor, ButtonSize, ButtonVariant } from "../../generated/contracts/Button.ts";
import { tokenVar } from "../../tokens.ts";
import { ContractIcon } from "../ContractIcon.tsx";

export type { ButtonColor, ButtonSize, ButtonVariant } from "../../generated/contracts/Button.ts";

/**
 * props.iconLeftName/iconRightName — type "icon", policy "modifiable" : le
 * contrat ne restreint pas à une énumération, la valeur runtime est un nom
 * d'icône libre (repli sur icons.*.figmaName quand absente).
 */
export type ButtonIconName = string;

/** stateModel.axis — non exposé comme prop (absent de `props`). */
type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

interface StrokeSpec {
  color: string;
  width: string;
}

interface ButtonVariantStyle {
  background?: string;
  foreground: string;
  border?: StrokeSpec;
  ring?: StrokeSpec;
  /** structure.view = "st2" plutôt que "st1" : ajoute layouts.radius.md à la racine. */
  outerRadius: boolean;
}

/**
 * Matrice littérale variants[] → { tokens, strokes, view } : une entrée par
 * combinaison values.{color,variant,state} réellement présente dans le
 * contrat (90 entrées, structure.variantAxes = [color, variant, state]).
 * `outerRadius` code la structure de vue exacte (st1 sans rayon de racine,
 * st2 avec `{layouts.radius.md}` sur la racine — utilisée par les variants
 * dont `view` vaut v4/v5/v6/v7).
 */
const BUTTON_STYLES: Record<ButtonColor, Record<ButtonVariant, Record<ButtonState, ButtonVariantStyle>>> = {
  primary: {
    contained: {
      default: {
        background: tokenVar("{components.button.colors.primary.contained.default.background}"),
        foreground: tokenVar("{components.button.colors.primary.contained.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.primary.contained.hover.background}"),
        foreground: tokenVar("{components.button.colors.primary.contained.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.primary.contained.focus.background}"),
        foreground: tokenVar("{components.button.colors.primary.contained.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.primary.contained.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.primary.contained.press.background}"),
        foreground: tokenVar("{components.button.colors.primary.contained.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.primary.contained.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.primary.contained.disable.background}"),
        foreground: tokenVar("{components.button.colors.primary.contained.disable.foreground}"),
        outerRadius: false,
      },
    },
    outlined: {
      default: {
        background: tokenVar("{components.button.colors.primary.outlined.default.background}"),
        foreground: tokenVar("{components.button.colors.primary.outlined.default.foreground}"),
        border: { color: tokenVar("{components.button.colors.primary.outlined.default.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.primary.outlined.hover.background}"),
        foreground: tokenVar("{components.button.colors.primary.outlined.hover.foreground}"),
        border: { color: tokenVar("{components.button.colors.primary.outlined.hover.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.primary.outlined.focus.background}"),
        foreground: tokenVar("{components.button.colors.primary.outlined.focus.foreground}"),
        border: { color: tokenVar("{components.button.colors.primary.outlined.focus.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.primary.outlined.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.primary.outlined.press.background}"),
        foreground: tokenVar("{components.button.colors.primary.outlined.press.foreground}"),
        border: { color: tokenVar("{components.button.colors.primary.outlined.press.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.primary.outlined.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.primary.outlined.disable.background}"),
        foreground: tokenVar("{components.button.colors.primary.outlined.disable.foreground}"),
        border: { color: tokenVar("{components.button.colors.primary.outlined.disable.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: true,
      },
    },
    text: {
      default: {
        foreground: tokenVar("{components.button.colors.primary.text.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.primary.text.hover.background}"),
        foreground: tokenVar("{components.button.colors.primary.text.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.primary.text.focus.background}"),
        foreground: tokenVar("{components.button.colors.primary.text.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.primary.text.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.primary.text.press.background}"),
        foreground: tokenVar("{components.button.colors.primary.text.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.primary.text.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        foreground: tokenVar("{components.button.colors.primary.text.disable.foreground}"),
        outerRadius: true,
      },
    },
  },
  secondary: {
    contained: {
      default: {
        background: tokenVar("{components.button.colors.secondary.contained.default.background}"),
        foreground: tokenVar("{components.button.colors.secondary.contained.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.secondary.contained.hover.background}"),
        foreground: tokenVar("{components.button.colors.secondary.contained.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.secondary.contained.focus.background}"),
        foreground: tokenVar("{components.button.colors.secondary.contained.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.secondary.contained.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.secondary.contained.press.background}"),
        foreground: tokenVar("{components.button.colors.secondary.contained.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.secondary.contained.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.secondary.contained.disable.background}"),
        foreground: tokenVar("{components.button.colors.secondary.contained.disable.foreground}"),
        outerRadius: false,
      },
    },
    outlined: {
      default: {
        background: tokenVar("{components.button.colors.secondary.outlined.default.background}"),
        foreground: tokenVar("{components.button.colors.secondary.outlined.default.foreground}"),
        border: { color: tokenVar("{components.button.colors.secondary.outlined.default.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.secondary.outlined.hover.background}"),
        foreground: tokenVar("{components.button.colors.secondary.outlined.hover.foreground}"),
        border: { color: tokenVar("{components.button.colors.secondary.outlined.hover.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.secondary.outlined.focus.background}"),
        foreground: tokenVar("{components.button.colors.secondary.outlined.focus.foreground}"),
        border: { color: tokenVar("{components.button.colors.secondary.outlined.focus.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.secondary.outlined.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.secondary.outlined.press.background}"),
        foreground: tokenVar("{components.button.colors.secondary.outlined.press.foreground}"),
        border: { color: tokenVar("{components.button.colors.secondary.outlined.press.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.secondary.outlined.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.secondary.outlined.disable.background}"),
        foreground: tokenVar("{components.button.colors.secondary.outlined.disable.foreground}"),
        border: { color: tokenVar("{components.button.colors.secondary.outlined.disable.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: true,
      },
    },
    text: {
      default: {
        foreground: tokenVar("{components.button.colors.secondary.text.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.secondary.text.hover.background}"),
        foreground: tokenVar("{components.button.colors.secondary.text.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.secondary.text.focus.background}"),
        foreground: tokenVar("{components.button.colors.secondary.text.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.secondary.text.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.secondary.text.press.background}"),
        foreground: tokenVar("{components.button.colors.secondary.text.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.secondary.text.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        foreground: tokenVar("{components.button.colors.secondary.text.disable.foreground}"),
        outerRadius: true,
      },
    },
  },
  info: {
    contained: {
      default: {
        background: tokenVar("{components.button.colors.info.contained.default.background}"),
        foreground: tokenVar("{components.button.colors.info.contained.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.info.contained.hover.background}"),
        foreground: tokenVar("{components.button.colors.info.contained.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.info.contained.focus.background}"),
        foreground: tokenVar("{components.button.colors.info.contained.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.info.contained.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.info.contained.press.background}"),
        foreground: tokenVar("{components.button.colors.info.contained.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.info.contained.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.info.contained.disable.background}"),
        foreground: tokenVar("{components.button.colors.info.contained.disable.foreground}"),
        outerRadius: false,
      },
    },
    outlined: {
      default: {
        background: tokenVar("{components.button.colors.info.outlined.default.background}"),
        foreground: tokenVar("{components.button.colors.info.outlined.default.foreground}"),
        border: { color: tokenVar("{components.button.colors.info.outlined.default.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.info.outlined.hover.background}"),
        foreground: tokenVar("{components.button.colors.info.outlined.hover.foreground}"),
        border: { color: tokenVar("{components.button.colors.info.outlined.hover.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.info.outlined.focus.background}"),
        foreground: tokenVar("{components.button.colors.info.outlined.focus.foreground}"),
        border: { color: tokenVar("{components.button.colors.info.outlined.focus.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.info.outlined.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.info.outlined.press.background}"),
        foreground: tokenVar("{components.button.colors.info.outlined.press.foreground}"),
        border: { color: tokenVar("{components.button.colors.info.outlined.press.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.info.outlined.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.info.outlined.disable.background}"),
        foreground: tokenVar("{components.button.colors.info.outlined.disable.foreground}"),
        border: { color: tokenVar("{components.button.colors.info.outlined.disable.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: true,
      },
    },
    text: {
      default: {
        foreground: tokenVar("{components.button.colors.info.text.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.info.text.hover.background}"),
        foreground: tokenVar("{components.button.colors.info.text.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.info.text.focus.background}"),
        foreground: tokenVar("{components.button.colors.info.text.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.info.text.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.info.text.press.background}"),
        foreground: tokenVar("{components.button.colors.info.text.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.info.text.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        foreground: tokenVar("{components.button.colors.info.text.disable.foreground}"),
        outerRadius: true,
      },
    },
  },
  success: {
    contained: {
      default: {
        background: tokenVar("{components.button.colors.success.contained.default.background}"),
        foreground: tokenVar("{components.button.colors.success.contained.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.success.contained.hover.background}"),
        foreground: tokenVar("{components.button.colors.success.contained.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.success.contained.focus.background}"),
        foreground: tokenVar("{components.button.colors.success.contained.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.success.contained.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.success.contained.press.background}"),
        foreground: tokenVar("{components.button.colors.success.contained.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.success.contained.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.success.contained.disable.background}"),
        foreground: tokenVar("{components.button.colors.success.contained.disable.foreground}"),
        outerRadius: false,
      },
    },
    outlined: {
      default: {
        background: tokenVar("{components.button.colors.success.outlined.default.background}"),
        foreground: tokenVar("{components.button.colors.success.outlined.default.foreground}"),
        border: { color: tokenVar("{components.button.colors.success.outlined.default.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.success.outlined.hover.background}"),
        foreground: tokenVar("{components.button.colors.success.outlined.hover.foreground}"),
        border: { color: tokenVar("{components.button.colors.success.outlined.hover.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.success.outlined.focus.background}"),
        foreground: tokenVar("{components.button.colors.success.outlined.focus.foreground}"),
        border: { color: tokenVar("{components.button.colors.success.outlined.focus.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.success.outlined.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.success.outlined.press.background}"),
        foreground: tokenVar("{components.button.colors.success.outlined.press.foreground}"),
        border: { color: tokenVar("{components.button.colors.success.outlined.press.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.success.outlined.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.success.outlined.disable.background}"),
        foreground: tokenVar("{components.button.colors.success.outlined.disable.foreground}"),
        border: { color: tokenVar("{components.button.colors.success.outlined.disable.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: true,
      },
    },
    text: {
      default: {
        foreground: tokenVar("{components.button.colors.success.text.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.success.text.hover.background}"),
        foreground: tokenVar("{components.button.colors.success.text.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.success.text.focus.background}"),
        foreground: tokenVar("{components.button.colors.success.text.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.success.text.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.success.text.press.background}"),
        foreground: tokenVar("{components.button.colors.success.text.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.success.text.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        foreground: tokenVar("{components.button.colors.success.text.disable.foreground}"),
        outerRadius: true,
      },
    },
  },
  warning: {
    contained: {
      default: {
        background: tokenVar("{components.button.colors.warning.contained.default.background}"),
        foreground: tokenVar("{components.button.colors.warning.contained.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.warning.contained.hover.background}"),
        foreground: tokenVar("{components.button.colors.warning.contained.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.warning.contained.focus.background}"),
        foreground: tokenVar("{components.button.colors.warning.contained.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.warning.contained.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.warning.contained.press.background}"),
        foreground: tokenVar("{components.button.colors.warning.contained.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.warning.contained.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.warning.contained.disable.background}"),
        foreground: tokenVar("{components.button.colors.warning.contained.disable.foreground}"),
        outerRadius: false,
      },
    },
    outlined: {
      default: {
        background: tokenVar("{components.button.colors.warning.outlined.default.background}"),
        foreground: tokenVar("{components.button.colors.warning.outlined.default.foreground}"),
        border: { color: tokenVar("{components.button.colors.warning.outlined.default.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.warning.outlined.hover.background}"),
        foreground: tokenVar("{components.button.colors.warning.outlined.hover.foreground}"),
        border: { color: tokenVar("{components.button.colors.warning.outlined.hover.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.warning.outlined.focus.background}"),
        foreground: tokenVar("{components.button.colors.warning.outlined.focus.foreground}"),
        border: { color: tokenVar("{components.button.colors.warning.outlined.focus.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.warning.outlined.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.warning.outlined.press.background}"),
        foreground: tokenVar("{components.button.colors.warning.outlined.press.foreground}"),
        border: { color: tokenVar("{components.button.colors.warning.outlined.press.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.warning.outlined.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.warning.outlined.disable.background}"),
        foreground: tokenVar("{components.button.colors.warning.outlined.disable.foreground}"),
        border: { color: tokenVar("{components.button.colors.warning.outlined.disable.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: true,
      },
    },
    text: {
      default: {
        foreground: tokenVar("{components.button.colors.warning.text.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.warning.text.hover.background}"),
        foreground: tokenVar("{components.button.colors.warning.text.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.warning.text.focus.background}"),
        foreground: tokenVar("{components.button.colors.warning.text.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.warning.text.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.warning.text.press.background}"),
        foreground: tokenVar("{components.button.colors.warning.text.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.warning.text.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        foreground: tokenVar("{components.button.colors.warning.text.disable.foreground}"),
        outerRadius: true,
      },
    },
  },
  error: {
    contained: {
      default: {
        background: tokenVar("{components.button.colors.error.contained.default.background}"),
        foreground: tokenVar("{components.button.colors.error.contained.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.error.contained.hover.background}"),
        foreground: tokenVar("{components.button.colors.error.contained.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.error.contained.focus.background}"),
        foreground: tokenVar("{components.button.colors.error.contained.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.error.contained.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.error.contained.press.background}"),
        foreground: tokenVar("{components.button.colors.error.contained.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.error.contained.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.error.contained.disable.background}"),
        foreground: tokenVar("{components.button.colors.error.contained.disable.foreground}"),
        outerRadius: false,
      },
    },
    outlined: {
      default: {
        background: tokenVar("{components.button.colors.error.outlined.default.background}"),
        foreground: tokenVar("{components.button.colors.error.outlined.default.foreground}"),
        border: { color: tokenVar("{components.button.colors.error.outlined.default.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.error.outlined.hover.background}"),
        foreground: tokenVar("{components.button.colors.error.outlined.hover.foreground}"),
        border: { color: tokenVar("{components.button.colors.error.outlined.hover.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.error.outlined.focus.background}"),
        foreground: tokenVar("{components.button.colors.error.outlined.focus.foreground}"),
        border: { color: tokenVar("{components.button.colors.error.outlined.focus.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.error.outlined.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.error.outlined.press.background}"),
        foreground: tokenVar("{components.button.colors.error.outlined.press.foreground}"),
        border: { color: tokenVar("{components.button.colors.error.outlined.press.border}"), width: tokenVar("{layouts.stroke.outline}") },
        ring: { color: tokenVar("{components.button.colors.error.outlined.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        background: tokenVar("{components.button.colors.error.outlined.disable.background}"),
        foreground: tokenVar("{components.button.colors.error.outlined.disable.foreground}"),
        border: { color: tokenVar("{components.button.colors.error.outlined.disable.border}"), width: tokenVar("{layouts.stroke.outline}") },
        outerRadius: true,
      },
    },
    text: {
      default: {
        foreground: tokenVar("{components.button.colors.error.text.default.foreground}"),
        outerRadius: false,
      },
      hover: {
        background: tokenVar("{components.button.colors.error.text.hover.background}"),
        foreground: tokenVar("{components.button.colors.error.text.hover.foreground}"),
        outerRadius: false,
      },
      focus: {
        background: tokenVar("{components.button.colors.error.text.focus.background}"),
        foreground: tokenVar("{components.button.colors.error.text.focus.foreground}"),
        ring: { color: tokenVar("{components.button.colors.error.text.focus.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      press: {
        background: tokenVar("{components.button.colors.error.text.press.background}"),
        foreground: tokenVar("{components.button.colors.error.text.press.foreground}"),
        ring: { color: tokenVar("{components.button.colors.error.text.press.ring}"), width: tokenVar("{layouts.stroke.ring}") },
        outerRadius: true,
      },
      disable: {
        foreground: tokenVar("{components.button.colors.error.text.disable.foreground}"),
        outerRadius: true,
      },
    },
  },
};

/** structure.sizes — gap, padding et radius du wrapper (".sizeWrapperButton") par size. */
const BUTTON_SIZES: Record<ButtonSize, { gap: string; paddingX: string; paddingY: string; radius: string }> = {
  medium: {
    gap: tokenVar("{components.button.sizes.medium.gap}"),
    paddingX: tokenVar("{components.button.sizes.medium.padding-x}"),
    paddingY: tokenVar("{components.button.sizes.medium.padding-y}"),
    radius: tokenVar("{components.button.sizes.medium.border-radius}"),
  },
  big: {
    gap: tokenVar("{components.button.sizes.big.gap}"),
    paddingX: tokenVar("{components.button.sizes.big.padding-x}"),
    paddingY: tokenVar("{components.button.sizes.big.padding-y}"),
    radius: tokenVar("{components.button.sizes.big.border-radius}"),
  },
  small: {
    gap: tokenVar("{components.button.sizes.small.gap}"),
    paddingX: tokenVar("{components.button.sizes.small.padding-x}"),
    paddingY: tokenVar("{components.button.sizes.small.padding-y}"),
    radius: tokenVar("{components.button.sizes.small.border-radius}"),
  },
};

/** structure.view = "st2" ajoute ce rayon fixe à la racine (indépendant de size). */
const OUTER_RADIUS = tokenVar("{layouts.radius.md}");

/** icons.sm — commun aux deux icônes du contrat (view.icons → icons). */
const ICON_SIZE = "{components.icons.sizes.sm}";

/** textStyles["label.large"] — seul style référencé par viewTypographies.ty1. */
const LABEL_TYPOGRAPHY = {
  fontFamily: tokenVar("{primitives.fontfamily.base}"),
  fontSize: tokenVar("{typography.label.large.fontsize}"),
  fontWeight: tokenVar("{typography.label.large.fontweight}"),
  lineHeight: tokenVar("{typography.label.large.lineheight}"),
  letterSpacing: tokenVar("{typography.label.large.letterspacing}"),
};

/** stateModel.precedence, du plus fort au plus faible. */
const STATE_PRECEDENCE: ButtonState[] = ["disable", "press", "focus", "hover", "default"];

/** props du contrat, exposées avec leurs defaults. */
interface ButtonContractProps {
  disabled?: boolean;
  color?: ButtonColor;
  variant?: ButtonVariant;
  label?: boolean;
  iconRight?: boolean;
  iconLeft?: boolean;
  size?: ButtonSize;
  /** props.iconLeftName — policy "modifiable" : nom d'icône runtime, repli arrow-left-long. */
  iconLeftName?: ButtonIconName | null;
  /** props.iconRightName — policy "modifiable" : nom d'icône runtime, repli arrow-right-long. */
  iconRightName?: ButtonIconName | null;
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {
  /** Contenu du slot label (samples.s1.text[0].value = "Label" par défaut, non normatif). */
  children?: ReactNode;
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
  type = "button",
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  ...rest
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  // stateModel.states + precedence : résolution de l'état effectif.
  const activeStates: Partial<Record<ButtonState, boolean>> = {
    disable: disabled,
    press: isPressed,
    focus: isFocusVisible,
    hover: isHovered,
    default: true,
  };
  const state = STATE_PRECEDENCE.find((candidate) => activeStates[candidate]) ?? "default";

  const variantStyle = BUTTON_STYLES[color][variant][state];
  const sizeTokens = BUTTON_SIZES[size];

  const resolvedIconLeftName = iconLeftName ?? "arrow-left-long";
  const resolvedIconRightName = iconRightName ?? "arrow-right-long";

  const wrapperBoxShadow = variantStyle.border
    ? `inset 0 0 0 ${variantStyle.border.width} ${variantStyle.border.color}`
    : undefined;

  return (
    // structure.view (st1/st2) : racine flex-row, fit-content, justify/align flex-start.
    <button
      type={type}
      disabled={disabled}
      className={className}
      onMouseEnter={(event) => {
        setIsHovered(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setIsHovered(false);
        setIsPressed(false);
        onMouseLeave?.(event);
      }}
      onPointerDown={(event) => {
        setIsPressed(true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        setIsPressed(false);
        onPointerUp?.(event);
      }}
      onPointerCancel={(event) => {
        setIsPressed(false);
        onPointerCancel?.(event);
      }}
      onFocus={(event: FocusEvent<HTMLButtonElement>) => {
        setIsFocusVisible(event.currentTarget.matches(":focus-visible"));
        onFocus?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLButtonElement>) => {
        setIsFocusVisible(false);
        onBlur?.(event);
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        width: "fit-content",
        height: "fit-content",
        border: "none",
        margin: 0,
        padding: 0,
        background: "transparent",
        font: "inherit",
        cursor: disabled ? "default" : "pointer",
        // structure.view "st2" (v4/v5/v6/v7) : rayon supplémentaire sur la racine.
        borderRadius: variantStyle.outerRadius ? OUTER_RADIUS : undefined,
        // strokes.ring, align "outside" → outline (fallback box-shadow non nécessaire ici).
        outlineStyle: variantStyle.ring ? "solid" : undefined,
        outlineColor: variantStyle.ring?.color,
        outlineWidth: variantStyle.ring?.width,
        ...style,
      }}
      {...rest}
    >
      {/* slot "label" (.sizeWrapperButton) : conteneur peint, gap/padding/radius par size. */}
      <span
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: sizeTokens.gap,
          padding: `${sizeTokens.paddingY} ${sizeTokens.paddingX}`,
          borderRadius: sizeTokens.radius,
          backgroundColor: variantStyle.background,
          boxShadow: wrapperBoxShadow,
        }}
      >
        {/* slot "icon" — visibilityProp iconLeft, icons.arrowLeftLong (modifiable). */}
        {iconLeft ? (
          <ContractIcon name={resolvedIconLeftName} sizeToken={ICON_SIZE} color={variantStyle.foreground} />
        ) : null}
        {/* slot "label" (texte) — visibilityProp label, textStyles["label.large"]. */}
        {label ? (
          <span
            style={{
              color: variantStyle.foreground,
              fontFamily: LABEL_TYPOGRAPHY.fontFamily,
              fontSize: LABEL_TYPOGRAPHY.fontSize,
              fontWeight: LABEL_TYPOGRAPHY.fontWeight,
              lineHeight: LABEL_TYPOGRAPHY.lineHeight,
              letterSpacing: LABEL_TYPOGRAPHY.letterSpacing,
            }}
          >
            {children}
          </span>
        ) : null}
        {/* slot "icon-2" — visibilityProp iconRight, icons.arrowRightLong (modifiable). */}
        {iconRight ? (
          <ContractIcon name={resolvedIconRightName} sizeToken={ICON_SIZE} color={variantStyle.foreground} />
        ) : null}
      </span>
    </button>
  );
}

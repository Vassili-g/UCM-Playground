import {
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from "../../generated/contracts/Button.ts";

export type { ButtonColor, ButtonSize, ButtonVariant };

/**
 * Nom d'icône du kit de l'application. Les deux icônes du contrat sont
 * `modifiable` : `iconLeftName` et `iconRightName` choisissent le glyphe, et le
 * `figmaName` sert de repli.
 */
export type ButtonIconName = string;

/** Axe d'états du contrat (`stateModel.axis`), dans son ordre de déclaration. */
type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

/**
 * Ordre de priorité des états (`stateModel.precedence`) : le premier état actif
 * l'emporte.
 */
const PRECEDENCE: readonly ButtonState[] = ["disable", "press", "focus", "hover", "default"];

/** Vues exactes de `variantViews`. */
type ButtonView = "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7";

/** Chemin de slot d'une peinture : les segments joints, `""` pour la racine. */
type SlotPath = string;

interface Stroke {
  color: string;
  width: string | null;
}

interface ButtonSkin {
  view: ButtonView;
  background?: string;
  foreground?: string;
  border?: Stroke;
  ring?: Stroke;
}

/**
 * Feuilles de couleurs des 90 combinaisons réellement présentes dans Figma
 * (`variants[].tokens` et `variants[].strokes`), avec la vue exacte de chacune.
 *
 * Les références sont écrites en toutes lettres : un chemin assemblé à
 * l'exécution figerait la convention de nommage du design system dans une
 * fonction et ne serait plus comparable au contrat.
 */
const SKINS: Record<ButtonColor, Record<ButtonVariant, Record<ButtonState, ButtonSkin>>> = {
  secondary: {
    contained: {
      default: {
        view: "v1",
        background: "{components.button.colors.secondary.contained.default.background}",
        foreground: "{components.button.colors.secondary.contained.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.secondary.contained.hover.background}",
        foreground: "{components.button.colors.secondary.contained.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.secondary.contained.focus.background}",
        foreground: "{components.button.colors.secondary.contained.focus.foreground}",
        ring: {
          color: "{components.button.colors.secondary.contained.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.secondary.contained.press.background}",
        foreground: "{components.button.colors.secondary.contained.press.foreground}",
        ring: {
          color: "{components.button.colors.secondary.contained.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v1",
        background: "{components.button.colors.secondary.contained.disable.background}",
        foreground: "{components.button.colors.secondary.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        view: "v2",
        background: "{components.button.colors.secondary.outlined.default.background}",
        foreground: "{components.button.colors.secondary.outlined.default.foreground}",
        border: {
          color: "{components.button.colors.secondary.outlined.default.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.secondary.outlined.hover.background}",
        foreground: "{components.button.colors.secondary.outlined.hover.foreground}",
        border: {
          color: "{components.button.colors.secondary.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.secondary.outlined.focus.background}",
        foreground: "{components.button.colors.secondary.outlined.focus.foreground}",
        border: {
          color: "{components.button.colors.secondary.outlined.focus.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.secondary.outlined.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.secondary.outlined.press.background}",
        foreground: "{components.button.colors.secondary.outlined.press.foreground}",
        border: {
          color: "{components.button.colors.secondary.outlined.press.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.secondary.outlined.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.secondary.outlined.disable.background}",
        foreground: "{components.button.colors.secondary.outlined.disable.foreground}",
        border: {
          color: "{components.button.colors.secondary.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
        },
      },
    },
    text: {
      default: {
        view: "v3",
        foreground: "{components.button.colors.secondary.text.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.secondary.text.hover.background}",
        foreground: "{components.button.colors.secondary.text.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.secondary.text.focus.background}",
        foreground: "{components.button.colors.secondary.text.focus.foreground}",
        ring: {
          color: "{components.button.colors.secondary.text.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.secondary.text.press.background}",
        foreground: "{components.button.colors.secondary.text.press.foreground}",
        ring: {
          color: "{components.button.colors.secondary.text.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v7",
        foreground: "{components.button.colors.secondary.text.disable.foreground}",
      },
    },
  },
  primary: {
    contained: {
      default: {
        view: "v1",
        background: "{components.button.colors.primary.contained.default.background}",
        foreground: "{components.button.colors.primary.contained.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.primary.contained.hover.background}",
        foreground: "{components.button.colors.primary.contained.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.primary.contained.focus.background}",
        foreground: "{components.button.colors.primary.contained.focus.foreground}",
        ring: {
          color: "{components.button.colors.primary.contained.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.primary.contained.press.background}",
        foreground: "{components.button.colors.primary.contained.press.foreground}",
        ring: {
          color: "{components.button.colors.primary.contained.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v1",
        background: "{components.button.colors.primary.contained.disable.background}",
        foreground: "{components.button.colors.primary.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        view: "v2",
        background: "{components.button.colors.primary.outlined.default.background}",
        foreground: "{components.button.colors.primary.outlined.default.foreground}",
        border: {
          color: "{components.button.colors.primary.outlined.default.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.primary.outlined.hover.background}",
        foreground: "{components.button.colors.primary.outlined.hover.foreground}",
        border: {
          color: "{components.button.colors.primary.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.primary.outlined.focus.background}",
        foreground: "{components.button.colors.primary.outlined.focus.foreground}",
        border: {
          color: "{components.button.colors.primary.outlined.focus.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.primary.outlined.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.primary.outlined.press.background}",
        foreground: "{components.button.colors.primary.outlined.press.foreground}",
        border: {
          color: "{components.button.colors.primary.outlined.press.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.primary.outlined.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.primary.outlined.disable.background}",
        foreground: "{components.button.colors.primary.outlined.disable.foreground}",
        border: {
          color: "{components.button.colors.primary.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
        },
      },
    },
    text: {
      default: {
        view: "v3",
        foreground: "{components.button.colors.primary.text.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.primary.text.hover.background}",
        foreground: "{components.button.colors.primary.text.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.primary.text.focus.background}",
        foreground: "{components.button.colors.primary.text.focus.foreground}",
        ring: {
          color: "{components.button.colors.primary.text.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.primary.text.press.background}",
        foreground: "{components.button.colors.primary.text.press.foreground}",
        ring: {
          color: "{components.button.colors.primary.text.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v7",
        foreground: "{components.button.colors.primary.text.disable.foreground}",
      },
    },
  },
  info: {
    contained: {
      default: {
        view: "v1",
        background: "{components.button.colors.info.contained.default.background}",
        foreground: "{components.button.colors.info.contained.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.info.contained.hover.background}",
        foreground: "{components.button.colors.info.contained.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.info.contained.focus.background}",
        foreground: "{components.button.colors.info.contained.focus.foreground}",
        ring: {
          color: "{components.button.colors.info.contained.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.info.contained.press.background}",
        foreground: "{components.button.colors.info.contained.press.foreground}",
        ring: {
          color: "{components.button.colors.info.contained.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v1",
        background: "{components.button.colors.info.contained.disable.background}",
        foreground: "{components.button.colors.info.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        view: "v2",
        background: "{components.button.colors.info.outlined.default.background}",
        foreground: "{components.button.colors.info.outlined.default.foreground}",
        border: {
          color: "{components.button.colors.info.outlined.default.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.info.outlined.hover.background}",
        foreground: "{components.button.colors.info.outlined.hover.foreground}",
        border: {
          color: "{components.button.colors.info.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.info.outlined.focus.background}",
        foreground: "{components.button.colors.info.outlined.focus.foreground}",
        border: {
          color: "{components.button.colors.info.outlined.focus.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.info.outlined.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.info.outlined.press.background}",
        foreground: "{components.button.colors.info.outlined.press.foreground}",
        border: {
          color: "{components.button.colors.info.outlined.press.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.info.outlined.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.info.outlined.disable.background}",
        foreground: "{components.button.colors.info.outlined.disable.foreground}",
        border: {
          color: "{components.button.colors.info.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
        },
      },
    },
    text: {
      default: {
        view: "v3",
        foreground: "{components.button.colors.info.text.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.info.text.hover.background}",
        foreground: "{components.button.colors.info.text.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.info.text.focus.background}",
        foreground: "{components.button.colors.info.text.focus.foreground}",
        ring: {
          color: "{components.button.colors.info.text.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.info.text.press.background}",
        foreground: "{components.button.colors.info.text.press.foreground}",
        ring: {
          color: "{components.button.colors.info.text.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v7",
        foreground: "{components.button.colors.info.text.disable.foreground}",
      },
    },
  },
  success: {
    contained: {
      default: {
        view: "v1",
        background: "{components.button.colors.success.contained.default.background}",
        foreground: "{components.button.colors.success.contained.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.success.contained.hover.background}",
        foreground: "{components.button.colors.success.contained.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.success.contained.focus.background}",
        foreground: "{components.button.colors.success.contained.focus.foreground}",
        ring: {
          color: "{components.button.colors.success.contained.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.success.contained.press.background}",
        foreground: "{components.button.colors.success.contained.press.foreground}",
        ring: {
          color: "{components.button.colors.success.contained.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v1",
        background: "{components.button.colors.success.contained.disable.background}",
        foreground: "{components.button.colors.success.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        view: "v2",
        background: "{components.button.colors.success.outlined.default.background}",
        foreground: "{components.button.colors.success.outlined.default.foreground}",
        border: {
          color: "{components.button.colors.success.outlined.default.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.success.outlined.hover.background}",
        foreground: "{components.button.colors.success.outlined.hover.foreground}",
        border: {
          color: "{components.button.colors.success.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.success.outlined.focus.background}",
        foreground: "{components.button.colors.success.outlined.focus.foreground}",
        border: {
          color: "{components.button.colors.success.outlined.focus.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.success.outlined.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.success.outlined.press.background}",
        foreground: "{components.button.colors.success.outlined.press.foreground}",
        border: {
          color: "{components.button.colors.success.outlined.press.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.success.outlined.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.success.outlined.disable.background}",
        foreground: "{components.button.colors.success.outlined.disable.foreground}",
        border: {
          color: "{components.button.colors.success.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
        },
      },
    },
    text: {
      default: {
        view: "v3",
        foreground: "{components.button.colors.success.text.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.success.text.hover.background}",
        foreground: "{components.button.colors.success.text.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.success.text.focus.background}",
        foreground: "{components.button.colors.success.text.focus.foreground}",
        ring: {
          color: "{components.button.colors.success.text.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.success.text.press.background}",
        foreground: "{components.button.colors.success.text.press.foreground}",
        ring: {
          color: "{components.button.colors.success.text.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v7",
        foreground: "{components.button.colors.success.text.disable.foreground}",
      },
    },
  },
  warning: {
    contained: {
      default: {
        view: "v1",
        background: "{components.button.colors.warning.contained.default.background}",
        foreground: "{components.button.colors.warning.contained.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.warning.contained.hover.background}",
        foreground: "{components.button.colors.warning.contained.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.warning.contained.focus.background}",
        foreground: "{components.button.colors.warning.contained.focus.foreground}",
        ring: {
          color: "{components.button.colors.warning.contained.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.warning.contained.press.background}",
        foreground: "{components.button.colors.warning.contained.press.foreground}",
        ring: {
          color: "{components.button.colors.warning.contained.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v1",
        background: "{components.button.colors.warning.contained.disable.background}",
        foreground: "{components.button.colors.warning.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        view: "v2",
        background: "{components.button.colors.warning.outlined.default.background}",
        foreground: "{components.button.colors.warning.outlined.default.foreground}",
        border: {
          color: "{components.button.colors.warning.outlined.default.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.warning.outlined.hover.background}",
        foreground: "{components.button.colors.warning.outlined.hover.foreground}",
        border: {
          color: "{components.button.colors.warning.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.warning.outlined.focus.background}",
        foreground: "{components.button.colors.warning.outlined.focus.foreground}",
        border: {
          color: "{components.button.colors.warning.outlined.focus.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.warning.outlined.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.warning.outlined.press.background}",
        foreground: "{components.button.colors.warning.outlined.press.foreground}",
        border: {
          color: "{components.button.colors.warning.outlined.press.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.warning.outlined.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.warning.outlined.disable.background}",
        foreground: "{components.button.colors.warning.outlined.disable.foreground}",
        border: {
          color: "{components.button.colors.warning.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
        },
      },
    },
    text: {
      default: {
        view: "v3",
        foreground: "{components.button.colors.warning.text.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.warning.text.hover.background}",
        foreground: "{components.button.colors.warning.text.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.warning.text.focus.background}",
        foreground: "{components.button.colors.warning.text.focus.foreground}",
        ring: {
          color: "{components.button.colors.warning.text.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.warning.text.press.background}",
        foreground: "{components.button.colors.warning.text.press.foreground}",
        ring: {
          color: "{components.button.colors.warning.text.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v7",
        foreground: "{components.button.colors.warning.text.disable.foreground}",
      },
    },
  },
  error: {
    contained: {
      default: {
        view: "v1",
        background: "{components.button.colors.error.contained.default.background}",
        foreground: "{components.button.colors.error.contained.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.error.contained.hover.background}",
        foreground: "{components.button.colors.error.contained.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.error.contained.focus.background}",
        foreground: "{components.button.colors.error.contained.focus.foreground}",
        ring: {
          color: "{components.button.colors.error.contained.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.error.contained.press.background}",
        foreground: "{components.button.colors.error.contained.press.foreground}",
        ring: {
          color: "{components.button.colors.error.contained.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v1",
        background: "{components.button.colors.error.contained.disable.background}",
        foreground: "{components.button.colors.error.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        view: "v2",
        background: "{components.button.colors.error.outlined.default.background}",
        foreground: "{components.button.colors.error.outlined.default.foreground}",
        border: {
          color: "{components.button.colors.error.outlined.default.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.error.outlined.hover.background}",
        foreground: "{components.button.colors.error.outlined.hover.foreground}",
        border: {
          color: "{components.button.colors.error.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
        },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.error.outlined.focus.background}",
        foreground: "{components.button.colors.error.outlined.focus.foreground}",
        border: {
          color: "{components.button.colors.error.outlined.focus.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.error.outlined.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.error.outlined.press.background}",
        foreground: "{components.button.colors.error.outlined.press.foreground}",
        border: {
          color: "{components.button.colors.error.outlined.press.border}",
          width: "{layouts.stroke.outline}",
        },
        ring: {
          color: "{components.button.colors.error.outlined.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.error.outlined.disable.background}",
        foreground: "{components.button.colors.error.outlined.disable.foreground}",
        border: {
          color: "{components.button.colors.error.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
        },
      },
    },
    text: {
      default: {
        view: "v3",
        foreground: "{components.button.colors.error.text.default.foreground}",
      },
      hover: {
        view: "v1",
        background: "{components.button.colors.error.text.hover.background}",
        foreground: "{components.button.colors.error.text.hover.foreground}",
      },
      focus: {
        view: "v4",
        background: "{components.button.colors.error.text.focus.background}",
        foreground: "{components.button.colors.error.text.focus.foreground}",
        ring: {
          color: "{components.button.colors.error.text.focus.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.error.text.press.background}",
        foreground: "{components.button.colors.error.text.press.foreground}",
        ring: {
          color: "{components.button.colors.error.text.press.ring}",
          width: "{layouts.stroke.ring}",
        },
      },
      disable: {
        view: "v7",
        foreground: "{components.button.colors.error.text.disable.foreground}",
      },
    },
  },
};

/**
 * `variantViews[*].paintPlacements` : où appliquer chaque clé de couleur, par
 * chemin exact de l'arbre publié. La cible ne se déduit jamais du nom de la
 * clé.
 */
const VIEWS: Record<
  ButtonView,
  {
    rootRadius: string | null;
    fills: Record<string, readonly SlotPath[] | undefined>;
    strokes: Record<string, readonly SlotPath[] | undefined>;
  }
> = {
  v1: {
    rootRadius: null,
    fills: {
      "background": ["label"],
      "foreground": ["label/icon", "label/label", "label/icon-2"],
    },
    strokes: {},
  },
  v2: {
    rootRadius: null,
    fills: {
      "background": ["label"],
      "foreground": ["label/icon", "label/label", "label/icon-2"],
    },
    strokes: {
      "border": ["label"],
    },
  },
  v3: {
    rootRadius: null,
    fills: {
      "foreground": ["label/icon", "label/label", "label/icon-2"],
    },
    strokes: {},
  },
  v4: {
    rootRadius: "{layouts.radius.md}",
    fills: {
      "background": ["label"],
      "foreground": ["label/icon", "label/label", "label/icon-2"],
    },
    strokes: {
      "ring": [""],
    },
  },
  v5: {
    rootRadius: "{layouts.radius.md}",
    fills: {
      "background": ["label"],
      "foreground": ["label/icon", "label/label", "label/icon-2"],
    },
    strokes: {
      "ring": [""],
      "border": ["label"],
    },
  },
  v6: {
    rootRadius: "{layouts.radius.md}",
    fills: {
      "background": ["label"],
      "foreground": ["label/icon", "label/label", "label/icon-2"],
    },
    strokes: {
      "border": ["label"],
    },
  },
  v7: {
    rootRadius: "{layouts.radius.md}",
    fills: {
      "foreground": ["label/icon", "label/label", "label/icon-2"],
    },
    strokes: {},
  },
};

/** `structure.sizes` : les dimensions vivent sous l'axe de tailles. */
const SIZES: Record<ButtonSize, { gap: string; paddingX: string; paddingY: string; radius: string }> = {
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

/** `textStyles["label.large"]`, le style du seul slot de texte. */
const LABEL_LARGE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.label.large.fontsize}",
  fontWeight: "{typography.label.large.fontweight}",
  lineHeight: "{typography.label.large.lineheight}",
  letterSpacing: "{typography.label.large.letterspacing}",
};

/** `icons[*].figmaName`, repli de chaque icône modifiable. */
const ARROWLEFTLONG_FIGMA_NAME = "arrow-left-long";
const ARROWRIGHTLONG_FIGMA_NAME = "arrow-right-long";

/** `icons[*].size` : le carré occupé par l'icône. */
const ICON_SIZE = "{components.icons.sizes.sm}";

/** Une clé de couleur peint-elle ce chemin dans cette vue ? */
function peint(cibles: readonly SlotPath[] | undefined, chemin: SlotPath): boolean {
  return cibles !== undefined && cibles.includes(chemin);
}

/** Props visuelles déclarées par le contrat. */
interface ButtonContractProps {
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  label?: boolean;
  iconLeft?: boolean;
  iconRight?: boolean;
  /** `props.iconLeftName.default` vaut `null` : le repli est `figmaName`. */
  iconLeftName?: ButtonIconName | null;
  /** `props.iconRightName.default` vaut `null` : le repli est `figmaName`. */
  iconRightName?: ButtonIconName | null;
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {}

/**
 * Action déclenchant une opération ; le choix des variantes dépend de
 * l'importance et du contexte (`intent.usage`).
 *
 * Reconstruction en contexte froid : écrite depuis le seul
 * `Button.contract.json` (10.1) et le skill `consommer-contrat`.
 *
 * Les styles étant inline, les états du contrat sont suivis par les événements
 * Pointer et clavier au lieu de leurs pseudo-classes : `focus` reste le focus
 * clavier, interrogé par `:focus-visible`.
 */
export function Button({
  color = "primary",
  variant = "contained",
  size = "medium",
  disabled = false,
  label = true,
  iconLeft = true,
  iconRight = true,
  iconLeftName,
  iconRightName,
  children,
  style,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  ...rest
}: ButtonProps) {
  const [actifs, setActifs] = useState<Partial<Record<ButtonState, boolean>>>({});

  const etats: Partial<Record<ButtonState, boolean>> = { ...actifs, disable: disabled };
  const etat = PRECEDENCE.find((candidat) => etats[candidat] === true) ?? "default";

  const skin = SKINS[color][variant][etat];
  const vue = VIEWS[skin.view];
  const dimensions = SIZES[size];

  function marquer(nom: ButtonState, valeur: boolean) {
    setActifs((precedents) => ({ ...precedents, [nom]: valeur }));
  }

  /** Racine : le flux du composant, sa taille, son rayon et son ring. */
  const rootStyle: CSSProperties = {
    alignItems: "flex-start",
    background: "none",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    flexDirection: "row",
    font: "inherit",
    height: "fit-content",
    justifyContent: "flex-start",
    margin: 0,
    padding: 0,
    width: "fit-content",
    ...(vue.rootRadius === null ? {} : { borderRadius: tokenVar(vue.rootRadius) }),
    ...(skin.ring !== undefined && skin.ring.width !== null && peint(vue.strokes.ring, "")
      ? {
          outlineColor: tokenVar(skin.ring.color),
          outlineOffset: 0,
          outlineStyle: "solid",
          outlineWidth: tokenVar(skin.ring.width),
        }
      : { outline: "none" }),
    ...style,
  };

  /**
   * Slot `label` : le cadre qui porte les dimensions de la taille, le fond et
   * la bordure. Le contrat les situe sur lui, jamais sur la racine.
   */
  const cadreStyle: CSSProperties = {
    alignItems: "center",
    borderRadius: tokenVar(dimensions.radius),
    boxSizing: "border-box",
    display: "inline-flex",
    flexDirection: "row",
    gap: tokenVar(dimensions.gap),
    justifyContent: "center",
    padding: `${tokenVar(dimensions.paddingY)} ${tokenVar(dimensions.paddingX)}`,
    ...(skin.background !== undefined && peint(vue.fills.background, "label")
      ? { backgroundColor: tokenVar(skin.background) }
      : {}),
    ...(skin.border !== undefined && skin.border.width !== null && peint(vue.strokes.border, "label")
      ? {
          borderColor: tokenVar(skin.border.color),
          borderStyle: "solid",
          borderWidth: tokenVar(skin.border.width),
        }
      : {}),
  };

  const encre =
    skin.foreground === undefined ? undefined : tokenVar(skin.foreground);

  return (
    <button
      {...rest}
      disabled={disabled}
      style={rootStyle}
      onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
        marquer("hover", true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event: PointerEvent<HTMLButtonElement>) => {
        marquer("hover", false);
        marquer("press", false);
        onPointerLeave?.(event);
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        marquer("press", true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event: PointerEvent<HTMLButtonElement>) => {
        marquer("press", false);
        onPointerUp?.(event);
      }}
      onPointerCancel={(event: PointerEvent<HTMLButtonElement>) => {
        marquer("press", false);
        onPointerCancel?.(event);
      }}
      onFocus={(event: FocusEvent<HTMLButtonElement>) => {
        marquer("focus", event.currentTarget.matches(":focus-visible"));
        onFocus?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLButtonElement>) => {
        marquer("focus", false);
        marquer("press", false);
        onBlur?.(event);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === " " || event.key === "Enter") {
          marquer("press", true);
        }
        onKeyDown?.(event);
      }}
      onKeyUp={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === " " || event.key === "Enter") {
          marquer("press", false);
        }
        onKeyUp?.(event);
      }}
    >
      <span style={cadreStyle}>
        {iconLeft ? (
          <ContractIcon
            name={iconLeftName ?? ARROWLEFTLONG_FIGMA_NAME}
            sizeToken={ICON_SIZE}
            color={peint(vue.fills.foreground, "label/icon") ? encre : undefined}
          />
        ) : null}
        {label ? (
          <span
            style={{
              fontFamily: tokenVar(LABEL_LARGE.fontFamily),
              fontSize: tokenVar(LABEL_LARGE.fontSize),
              fontWeight: tokenVar(LABEL_LARGE.fontWeight),
              letterSpacing: tokenVar(LABEL_LARGE.letterSpacing),
              lineHeight: tokenVar(LABEL_LARGE.lineHeight),
              ...(peint(vue.fills.foreground, "label/label") ? { color: encre } : {}),
            }}
          >
            {children}
          </span>
        ) : null}
        {iconRight ? (
          <ContractIcon
            name={iconRightName ?? ARROWRIGHTLONG_FIGMA_NAME}
            sizeToken={ICON_SIZE}
            color={peint(vue.fills.foreground, "label/icon-2") ? encre : undefined}
          />
        ) : null}
      </span>
    </button>
  );
}

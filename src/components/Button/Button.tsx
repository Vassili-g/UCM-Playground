import type {
  ButtonHTMLAttributes,
  CSSProperties,
  FocusEvent,
  PointerEvent,
} from "react";
import { useState } from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from "../../generated/contracts/Button.ts";

export type { ButtonColor, ButtonSize, ButtonVariant } from "../../generated/contracts/Button.ts";

/**
 * Le contrat déclare `iconLeftName`/`iconRightName` en `type: "icon"` avec
 * `policy: "modifiable"`, sans `values` énumérant de catalogue fermé : le nom
 * d'icône reste une chaîne opaque, résolue par `ContractIcon`.
 */
export type ButtonIconName = string;

/** États runtime de `stateModel.states` — jamais une prop. */
type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

/** Identifiants des `variantViews` — v1..v7, chacune une structure figée. */
type ButtonView = "v1" | "v2" | "v3" | "v4" | "v5" | "v6" | "v7";

interface StrokeRef {
  color: string;
  width: string;
}

/** Feuille `{tokens, strokes, view}` d'une entrée de `variants`. */
interface VariantEntry {
  view: ButtonView;
  background?: string;
  foreground: string;
  border?: StrokeRef;
  ring?: StrokeRef;
}

/**
 * Lookup color × variant × state → {tokens, strokes, view}, copié
 * littéralement depuis `variants` (contrat 10.3). Ne PAS reconstruire ces
 * chemins par gabarit : `variants` est la seule source pour savoir quelle
 * combinaison existe et quelle vue elle utilise.
 */
const VARIANTS: Record<ButtonColor, Record<ButtonVariant, Record<ButtonState, VariantEntry>>> = {
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
        ring: { color: "{components.button.colors.secondary.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.secondary.contained.press.background}",
        foreground: "{components.button.colors.secondary.contained.press.foreground}",
        ring: { color: "{components.button.colors.secondary.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.secondary.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.secondary.outlined.hover.background}",
        foreground: "{components.button.colors.secondary.outlined.hover.foreground}",
        border: { color: "{components.button.colors.secondary.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.secondary.outlined.focus.background}",
        foreground: "{components.button.colors.secondary.outlined.focus.foreground}",
        border: { color: "{components.button.colors.secondary.outlined.focus.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.secondary.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.secondary.outlined.press.background}",
        foreground: "{components.button.colors.secondary.outlined.press.foreground}",
        border: { color: "{components.button.colors.secondary.outlined.press.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.secondary.outlined.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.secondary.outlined.disable.background}",
        foreground: "{components.button.colors.secondary.outlined.disable.foreground}",
        border: { color: "{components.button.colors.secondary.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.secondary.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.secondary.text.press.background}",
        foreground: "{components.button.colors.secondary.text.press.foreground}",
        ring: { color: "{components.button.colors.secondary.text.press.ring}", width: "{layouts.stroke.ring}" },
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
        ring: { color: "{components.button.colors.primary.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.primary.contained.press.background}",
        foreground: "{components.button.colors.primary.contained.press.foreground}",
        ring: { color: "{components.button.colors.primary.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.primary.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.primary.outlined.hover.background}",
        foreground: "{components.button.colors.primary.outlined.hover.foreground}",
        border: { color: "{components.button.colors.primary.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.primary.outlined.focus.background}",
        foreground: "{components.button.colors.primary.outlined.focus.foreground}",
        border: { color: "{components.button.colors.primary.outlined.focus.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.primary.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.primary.outlined.press.background}",
        foreground: "{components.button.colors.primary.outlined.press.foreground}",
        border: { color: "{components.button.colors.primary.outlined.press.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.primary.outlined.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.primary.outlined.disable.background}",
        foreground: "{components.button.colors.primary.outlined.disable.foreground}",
        border: { color: "{components.button.colors.primary.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.primary.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.primary.text.press.background}",
        foreground: "{components.button.colors.primary.text.press.foreground}",
        ring: { color: "{components.button.colors.primary.text.press.ring}", width: "{layouts.stroke.ring}" },
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
        ring: { color: "{components.button.colors.info.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.info.contained.press.background}",
        foreground: "{components.button.colors.info.contained.press.foreground}",
        ring: { color: "{components.button.colors.info.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.info.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.info.outlined.hover.background}",
        foreground: "{components.button.colors.info.outlined.hover.foreground}",
        border: { color: "{components.button.colors.info.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.info.outlined.focus.background}",
        foreground: "{components.button.colors.info.outlined.focus.foreground}",
        border: { color: "{components.button.colors.info.outlined.focus.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.info.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.info.outlined.press.background}",
        foreground: "{components.button.colors.info.outlined.press.foreground}",
        border: { color: "{components.button.colors.info.outlined.press.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.info.outlined.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.info.outlined.disable.background}",
        foreground: "{components.button.colors.info.outlined.disable.foreground}",
        border: { color: "{components.button.colors.info.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.info.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.info.text.press.background}",
        foreground: "{components.button.colors.info.text.press.foreground}",
        ring: { color: "{components.button.colors.info.text.press.ring}", width: "{layouts.stroke.ring}" },
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
        ring: { color: "{components.button.colors.success.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.success.contained.press.background}",
        foreground: "{components.button.colors.success.contained.press.foreground}",
        ring: { color: "{components.button.colors.success.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.success.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.success.outlined.hover.background}",
        foreground: "{components.button.colors.success.outlined.hover.foreground}",
        border: { color: "{components.button.colors.success.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.success.outlined.focus.background}",
        foreground: "{components.button.colors.success.outlined.focus.foreground}",
        border: { color: "{components.button.colors.success.outlined.focus.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.success.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.success.outlined.press.background}",
        foreground: "{components.button.colors.success.outlined.press.foreground}",
        border: { color: "{components.button.colors.success.outlined.press.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.success.outlined.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.success.outlined.disable.background}",
        foreground: "{components.button.colors.success.outlined.disable.foreground}",
        border: { color: "{components.button.colors.success.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.success.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.success.text.press.background}",
        foreground: "{components.button.colors.success.text.press.foreground}",
        ring: { color: "{components.button.colors.success.text.press.ring}", width: "{layouts.stroke.ring}" },
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
        ring: { color: "{components.button.colors.warning.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.warning.contained.press.background}",
        foreground: "{components.button.colors.warning.contained.press.foreground}",
        ring: { color: "{components.button.colors.warning.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.warning.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.warning.outlined.hover.background}",
        foreground: "{components.button.colors.warning.outlined.hover.foreground}",
        border: { color: "{components.button.colors.warning.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.warning.outlined.focus.background}",
        foreground: "{components.button.colors.warning.outlined.focus.foreground}",
        border: { color: "{components.button.colors.warning.outlined.focus.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.warning.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.warning.outlined.press.background}",
        foreground: "{components.button.colors.warning.outlined.press.foreground}",
        border: { color: "{components.button.colors.warning.outlined.press.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.warning.outlined.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.warning.outlined.disable.background}",
        foreground: "{components.button.colors.warning.outlined.disable.foreground}",
        border: { color: "{components.button.colors.warning.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.warning.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.warning.text.press.background}",
        foreground: "{components.button.colors.warning.text.press.foreground}",
        ring: { color: "{components.button.colors.warning.text.press.ring}", width: "{layouts.stroke.ring}" },
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
        ring: { color: "{components.button.colors.error.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.error.contained.press.background}",
        foreground: "{components.button.colors.error.contained.press.foreground}",
        ring: { color: "{components.button.colors.error.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.error.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        view: "v2",
        background: "{components.button.colors.error.outlined.hover.background}",
        foreground: "{components.button.colors.error.outlined.hover.foreground}",
        border: { color: "{components.button.colors.error.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        view: "v5",
        background: "{components.button.colors.error.outlined.focus.background}",
        foreground: "{components.button.colors.error.outlined.focus.foreground}",
        border: { color: "{components.button.colors.error.outlined.focus.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.error.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v5",
        background: "{components.button.colors.error.outlined.press.background}",
        foreground: "{components.button.colors.error.outlined.press.foreground}",
        border: { color: "{components.button.colors.error.outlined.press.border}", width: "{layouts.stroke.outline}" },
        ring: { color: "{components.button.colors.error.outlined.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        view: "v6",
        background: "{components.button.colors.error.outlined.disable.background}",
        foreground: "{components.button.colors.error.outlined.disable.foreground}",
        border: { color: "{components.button.colors.error.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.error.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        view: "v4",
        background: "{components.button.colors.error.text.press.background}",
        foreground: "{components.button.colors.error.text.press.foreground}",
        ring: { color: "{components.button.colors.error.text.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        view: "v7",
        foreground: "{components.button.colors.error.text.disable.foreground}",
      },
    },
  },
};

/**
 * `paintPlacements` + `structure.radius` de chaque `variantViews[vX]`, copiés
 * littéralement. Les sept vues partagent le même arbre (racine → `.label`
 * (wrapper de taille) → `icon` / `label` / `icon-2`) ; elles ne diffèrent que
 * par où `strokes.border` / `strokes.ring` sont peints et par le radius de la
 * racine — jamais fusionnées entre elles.
 */
interface ViewConfig {
  rootRadius: string | null;
  wrapperPaintsBackground: boolean;
  wrapperPaintsBorder: boolean;
  rootPaintsRing: boolean;
}

const VIEWS: Record<ButtonView, ViewConfig> = {
  v1: { rootRadius: null, wrapperPaintsBackground: true, wrapperPaintsBorder: false, rootPaintsRing: false },
  v2: { rootRadius: null, wrapperPaintsBackground: true, wrapperPaintsBorder: true, rootPaintsRing: false },
  v3: { rootRadius: null, wrapperPaintsBackground: false, wrapperPaintsBorder: false, rootPaintsRing: false },
  v4: { rootRadius: "{layouts.radius.md}", wrapperPaintsBackground: true, wrapperPaintsBorder: false, rootPaintsRing: true },
  v5: { rootRadius: "{layouts.radius.md}", wrapperPaintsBackground: true, wrapperPaintsBorder: true, rootPaintsRing: true },
  v6: { rootRadius: "{layouts.radius.md}", wrapperPaintsBackground: true, wrapperPaintsBorder: true, rootPaintsRing: false },
  v7: { rootRadius: "{layouts.radius.md}", wrapperPaintsBackground: false, wrapperPaintsBorder: false, rootPaintsRing: false },
};

/**
 * `structure.sizes[<taille>]` du contrat : gap/padding/radius du wrapper
 * `.sizeWrapperButton` par valeur de la prop `size`. Chaque `variantViews[vX]`
 * ne cite que la taille "medium" en dur ; cette table couvre les trois
 * tailles publiées à la racine de `structure`, comme demandé pour un axe de
 * tailles présent ailleurs dans le contrat.
 */
interface SizeTokens {
  gap: string;
  paddingX: string;
  paddingY: string;
  radius: string;
}

const SIZES: Record<ButtonSize, SizeTokens> = {
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

/** `structure.children[].size` — identique pour `icon` et `icon-2`. */
const ICON_SIZE_TOKEN = "{components.icons.sizes.sm}";

/** `icons.<clé>.figmaName` — repli de `iconLeftName`/`iconRightName`. */
const DEFAULT_ICON_LEFT_NAME = "arrow-left-long";
const DEFAULT_ICON_RIGHT_NAME = "arrow-right-long";

/** `samples.s1.text[0].value` — contenu par défaut du slot `label`. */
const DEFAULT_LABEL_TEXT = "Label";

/** `textStyles["label.large"].tokens` — identique sur les 7 vues. */
const LABEL_TYPOGRAPHY = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.label.large.fontsize}",
  fontWeight: "{typography.label.large.fontweight}",
  lineHeight: "{typography.label.large.lineheight}",
  letterSpacing: "{typography.label.large.letterspacing}",
};

/** Props visuelles du contrat — voir `props` de `Button.contract.json`. */
export interface ButtonContractProps {
  disabled?: boolean;
  color?: ButtonColor;
  variant?: ButtonVariant;
  label?: boolean;
  iconRight?: boolean;
  iconLeft?: boolean;
  size?: ButtonSize;
  iconLeftName?: ButtonIconName;
  iconRightName?: ButtonIconName;
}

/**
 * Le contrat possède l'espace de noms de ses props : en cas de collision
 * avec un attribut HTML natif (`disabled`, `color`), la prop du contrat
 * l'emporte — soustraction mécanique via `Omit<..., keyof ButtonContractProps>`.
 */
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {}

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
  children = DEFAULT_LABEL_TEXT,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onFocus,
  onBlur,
  style,
  type = "button",
  ...rest
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  // stateModel.precedence : disable > press > focus > hover > default.
  const state: ButtonState = disabled
    ? "disable"
    : isPressed
      ? "press"
      : isFocusVisible
        ? "focus"
        : isHovered
          ? "hover"
          : "default";

  const entry = VARIANTS[color][variant][state];
  const view = VIEWS[entry.view];
  const sizeTokens = SIZES[size];

  const handlePointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    onPointerEnter?.(event);
  };
  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    setIsPressed(false);
    onPointerLeave?.(event);
  };
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    onPointerDown?.(event);
  };
  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onPointerUp?.(event);
  };
  // stateModel.states.focus.selector === ":focus-visible" : le ring ne
  // paraît qu'au focus clavier, jamais au clic pointeur.
  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(":focus-visible")) {
      setIsFocusVisible(true);
    }
    onFocus?.(event);
  };
  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    setIsFocusVisible(false);
    onBlur?.(event);
  };

  // `border` se rend en box-shadow (jamais `border` CSS), `align: "inside"`
  // → `inset 0 0 0 <width> <color>`. Peint sur le wrapper (.label), jamais
  // sur la racine : border et ring visent des calques différents ici, donc
  // ne se composent pas dans la même déclaration.
  const wrapperBoxShadow =
    view.wrapperPaintsBorder && entry.border
      ? `inset 0 0 0 ${tokenVar(entry.border.width)} ${tokenVar(entry.border.color)}`
      : undefined;

  const rootStyle: CSSProperties = {
    display: "inline-flex",
    flexDirection: "row",
    width: "fit-content",
    height: "fit-content",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    border: "none",
    background: "none",
    padding: 0,
    font: "inherit",
    cursor: disabled ? "default" : "pointer",
    borderRadius: view.rootRadius ? tokenVar(view.rootRadius) : undefined,
    // `ring` extérieur, `align: "outside"` → outline (rendering.roles.ring).
    outlineStyle: view.rootPaintsRing && entry.ring ? "solid" : "none",
    outlineWidth: view.rootPaintsRing && entry.ring ? tokenVar(entry.ring.width) : undefined,
    outlineColor: view.rootPaintsRing && entry.ring ? tokenVar(entry.ring.color) : undefined,
    outlineOffset: view.rootPaintsRing && entry.ring ? 0 : undefined,
    ...style,
  };

  const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: tokenVar(sizeTokens.gap),
    paddingLeft: tokenVar(sizeTokens.paddingX),
    paddingRight: tokenVar(sizeTokens.paddingX),
    paddingTop: tokenVar(sizeTokens.paddingY),
    paddingBottom: tokenVar(sizeTokens.paddingY),
    borderRadius: tokenVar(sizeTokens.radius),
    backgroundColor: view.wrapperPaintsBackground && entry.background ? tokenVar(entry.background) : undefined,
    boxShadow: wrapperBoxShadow,
  };

  const foregroundColor = tokenVar(entry.foreground);

  return (
    <button
      type={type}
      disabled={disabled}
      style={rootStyle}
      // `disabled` retire les handlers d'interaction : pas de hover/focus visuel.
      onPointerEnter={disabled ? undefined : handlePointerEnter}
      onPointerLeave={disabled ? undefined : handlePointerLeave}
      onPointerDown={disabled ? undefined : handlePointerDown}
      onPointerUp={disabled ? undefined : handlePointerUp}
      onFocus={disabled ? undefined : handleFocus}
      onBlur={disabled ? undefined : handleBlur}
      {...rest}
    >
      <span style={wrapperStyle}>
        {iconLeft && (
          <ContractIcon
            name={iconLeftName ?? DEFAULT_ICON_LEFT_NAME}
            sizeToken={ICON_SIZE_TOKEN}
            color={foregroundColor}
          />
        )}
        {label && (
          <span
            style={{
              color: foregroundColor,
              fontFamily: tokenVar(LABEL_TYPOGRAPHY.fontFamily),
              fontSize: tokenVar(LABEL_TYPOGRAPHY.fontSize),
              fontWeight: tokenVar(LABEL_TYPOGRAPHY.fontWeight),
              lineHeight: tokenVar(LABEL_TYPOGRAPHY.lineHeight),
              letterSpacing: tokenVar(LABEL_TYPOGRAPHY.letterSpacing),
            }}
          >
            {children}
          </span>
        )}
        {iconRight && (
          <ContractIcon
            name={iconRightName ?? DEFAULT_ICON_RIGHT_NAME}
            sizeToken={ICON_SIZE_TOKEN}
            color={foregroundColor}
          />
        )}
      </span>
    </button>
  );
}

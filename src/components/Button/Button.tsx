import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { useState } from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type { ButtonColor, ButtonSize, ButtonVariant } from "../../generated/contracts/Button.ts";

export type { ButtonColor, ButtonSize, ButtonVariant };

/** Nom d'icône opaque, résolu par ContractIcon via le kit d'icônes de l'application. */
export type ButtonIconName = string;

/** `stateModel.states` — les cinq états publiés par le contrat. */
type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

interface ButtonStrokeLeaf {
  color: string;
  width: string;
  align: "inside" | "outside" | "center";
}

interface ButtonVariantLeaf {
  tokens: {
    background?: string;
    foreground: string;
  };
  strokes: {
    border?: ButtonStrokeLeaf;
    ring?: ButtonStrokeLeaf;
  };
}

/**
 * Feuilles de `variants[].tokens` et `variants[].strokes`, recopiées en
 * toutes lettres — voir Button.contract.json. Chaque combinaison
 * color/variant/state a la sienne ; aucune ne se déduit d'un chemin assemblé
 * à l'exécution (cf. skill « consommer-contrat », §0).
 */
const BUTTON_VARIANTS: Record<ButtonColor, Record<ButtonVariant, Record<ButtonState, ButtonVariantLeaf>>> = {
  primary: {
    contained: {
      default: {
        tokens: {
          background: "{components.button.colors.primary.contained.default.background}",
          foreground: "{components.button.colors.primary.contained.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.primary.contained.hover.background}",
          foreground: "{components.button.colors.primary.contained.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.primary.contained.focus.background}",
          foreground: "{components.button.colors.primary.contained.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.primary.contained.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.primary.contained.press.background}",
          foreground: "{components.button.colors.primary.contained.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.primary.contained.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.primary.contained.disable.background}",
          foreground: "{components.button.colors.primary.contained.disable.foreground}",
        },
        strokes: {},
      },
    },
    outlined: {
      default: {
        tokens: {
          background: "{components.button.colors.primary.outlined.default.background}",
          foreground: "{components.button.colors.primary.outlined.default.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.primary.outlined.default.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      hover: {
        tokens: {
          background: "{components.button.colors.primary.outlined.hover.background}",
          foreground: "{components.button.colors.primary.outlined.hover.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.primary.outlined.hover.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      focus: {
        tokens: {
          background: "{components.button.colors.primary.outlined.focus.background}",
          foreground: "{components.button.colors.primary.outlined.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.primary.outlined.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.primary.outlined.focus.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.primary.outlined.press.background}",
          foreground: "{components.button.colors.primary.outlined.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.primary.outlined.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.primary.outlined.press.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.primary.outlined.disable.background}",
          foreground: "{components.button.colors.primary.outlined.disable.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.primary.outlined.disable.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
    },
    text: {
      default: {
        tokens: {
          foreground: "{components.button.colors.primary.text.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.primary.text.hover.background}",
          foreground: "{components.button.colors.primary.text.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.primary.text.focus.background}",
          foreground: "{components.button.colors.primary.text.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.primary.text.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.primary.text.press.background}",
          foreground: "{components.button.colors.primary.text.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.primary.text.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          foreground: "{components.button.colors.primary.text.disable.foreground}",
        },
        strokes: {},
      },
    },
  },
  secondary: {
    contained: {
      default: {
        tokens: {
          background: "{components.button.colors.secondary.contained.default.background}",
          foreground: "{components.button.colors.secondary.contained.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.secondary.contained.hover.background}",
          foreground: "{components.button.colors.secondary.contained.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.secondary.contained.focus.background}",
          foreground: "{components.button.colors.secondary.contained.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.secondary.contained.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.secondary.contained.press.background}",
          foreground: "{components.button.colors.secondary.contained.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.secondary.contained.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.secondary.contained.disable.background}",
          foreground: "{components.button.colors.secondary.contained.disable.foreground}",
        },
        strokes: {},
      },
    },
    outlined: {
      default: {
        tokens: {
          background: "{components.button.colors.secondary.outlined.default.background}",
          foreground: "{components.button.colors.secondary.outlined.default.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.secondary.outlined.default.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      hover: {
        tokens: {
          background: "{components.button.colors.secondary.outlined.hover.background}",
          foreground: "{components.button.colors.secondary.outlined.hover.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.secondary.outlined.hover.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      focus: {
        tokens: {
          background: "{components.button.colors.secondary.outlined.focus.background}",
          foreground: "{components.button.colors.secondary.outlined.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.secondary.outlined.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.secondary.outlined.focus.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.secondary.outlined.press.background}",
          foreground: "{components.button.colors.secondary.outlined.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.secondary.outlined.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.secondary.outlined.press.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.secondary.outlined.disable.background}",
          foreground: "{components.button.colors.secondary.outlined.disable.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.secondary.outlined.disable.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
    },
    text: {
      default: {
        tokens: {
          foreground: "{components.button.colors.secondary.text.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.secondary.text.hover.background}",
          foreground: "{components.button.colors.secondary.text.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.secondary.text.focus.background}",
          foreground: "{components.button.colors.secondary.text.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.secondary.text.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.secondary.text.press.background}",
          foreground: "{components.button.colors.secondary.text.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.secondary.text.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          foreground: "{components.button.colors.secondary.text.disable.foreground}",
        },
        strokes: {},
      },
    },
  },
  info: {
    contained: {
      default: {
        tokens: {
          background: "{components.button.colors.info.contained.default.background}",
          foreground: "{components.button.colors.info.contained.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.info.contained.hover.background}",
          foreground: "{components.button.colors.info.contained.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.info.contained.focus.background}",
          foreground: "{components.button.colors.info.contained.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.info.contained.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.info.contained.press.background}",
          foreground: "{components.button.colors.info.contained.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.info.contained.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.info.contained.disable.background}",
          foreground: "{components.button.colors.info.contained.disable.foreground}",
        },
        strokes: {},
      },
    },
    outlined: {
      default: {
        tokens: {
          background: "{components.button.colors.info.outlined.default.background}",
          foreground: "{components.button.colors.info.outlined.default.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.info.outlined.default.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      hover: {
        tokens: {
          background: "{components.button.colors.info.outlined.hover.background}",
          foreground: "{components.button.colors.info.outlined.hover.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.info.outlined.hover.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      focus: {
        tokens: {
          background: "{components.button.colors.info.outlined.focus.background}",
          foreground: "{components.button.colors.info.outlined.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.info.outlined.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.info.outlined.focus.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.info.outlined.press.background}",
          foreground: "{components.button.colors.info.outlined.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.info.outlined.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.info.outlined.press.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.info.outlined.disable.background}",
          foreground: "{components.button.colors.info.outlined.disable.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.info.outlined.disable.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
    },
    text: {
      default: {
        tokens: {
          foreground: "{components.button.colors.info.text.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.info.text.hover.background}",
          foreground: "{components.button.colors.info.text.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.info.text.focus.background}",
          foreground: "{components.button.colors.info.text.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.info.text.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.info.text.press.background}",
          foreground: "{components.button.colors.info.text.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.info.text.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          foreground: "{components.button.colors.info.text.disable.foreground}",
        },
        strokes: {},
      },
    },
  },
  success: {
    contained: {
      default: {
        tokens: {
          background: "{components.button.colors.success.contained.default.background}",
          foreground: "{components.button.colors.success.contained.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.success.contained.hover.background}",
          foreground: "{components.button.colors.success.contained.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.success.contained.focus.background}",
          foreground: "{components.button.colors.success.contained.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.success.contained.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.success.contained.press.background}",
          foreground: "{components.button.colors.success.contained.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.success.contained.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.success.contained.disable.background}",
          foreground: "{components.button.colors.success.contained.disable.foreground}",
        },
        strokes: {},
      },
    },
    outlined: {
      default: {
        tokens: {
          background: "{components.button.colors.success.outlined.default.background}",
          foreground: "{components.button.colors.success.outlined.default.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.success.outlined.default.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      hover: {
        tokens: {
          background: "{components.button.colors.success.outlined.hover.background}",
          foreground: "{components.button.colors.success.outlined.hover.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.success.outlined.hover.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      focus: {
        tokens: {
          background: "{components.button.colors.success.outlined.focus.background}",
          foreground: "{components.button.colors.success.outlined.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.success.outlined.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.success.outlined.focus.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.success.outlined.press.background}",
          foreground: "{components.button.colors.success.outlined.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.success.outlined.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.success.outlined.press.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.success.outlined.disable.background}",
          foreground: "{components.button.colors.success.outlined.disable.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.success.outlined.disable.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
    },
    text: {
      default: {
        tokens: {
          foreground: "{components.button.colors.success.text.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.success.text.hover.background}",
          foreground: "{components.button.colors.success.text.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.success.text.focus.background}",
          foreground: "{components.button.colors.success.text.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.success.text.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.success.text.press.background}",
          foreground: "{components.button.colors.success.text.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.success.text.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          foreground: "{components.button.colors.success.text.disable.foreground}",
        },
        strokes: {},
      },
    },
  },
  warning: {
    contained: {
      default: {
        tokens: {
          background: "{components.button.colors.warning.contained.default.background}",
          foreground: "{components.button.colors.warning.contained.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.warning.contained.hover.background}",
          foreground: "{components.button.colors.warning.contained.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.warning.contained.focus.background}",
          foreground: "{components.button.colors.warning.contained.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.warning.contained.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.warning.contained.press.background}",
          foreground: "{components.button.colors.warning.contained.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.warning.contained.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.warning.contained.disable.background}",
          foreground: "{components.button.colors.warning.contained.disable.foreground}",
        },
        strokes: {},
      },
    },
    outlined: {
      default: {
        tokens: {
          background: "{components.button.colors.warning.outlined.default.background}",
          foreground: "{components.button.colors.warning.outlined.default.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.warning.outlined.default.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      hover: {
        tokens: {
          background: "{components.button.colors.warning.outlined.hover.background}",
          foreground: "{components.button.colors.warning.outlined.hover.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.warning.outlined.hover.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      focus: {
        tokens: {
          background: "{components.button.colors.warning.outlined.focus.background}",
          foreground: "{components.button.colors.warning.outlined.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.warning.outlined.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.warning.outlined.focus.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.warning.outlined.press.background}",
          foreground: "{components.button.colors.warning.outlined.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.warning.outlined.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.warning.outlined.press.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.warning.outlined.disable.background}",
          foreground: "{components.button.colors.warning.outlined.disable.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.warning.outlined.disable.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
    },
    text: {
      default: {
        tokens: {
          foreground: "{components.button.colors.warning.text.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.warning.text.hover.background}",
          foreground: "{components.button.colors.warning.text.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.warning.text.focus.background}",
          foreground: "{components.button.colors.warning.text.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.warning.text.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.warning.text.press.background}",
          foreground: "{components.button.colors.warning.text.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.warning.text.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          foreground: "{components.button.colors.warning.text.disable.foreground}",
        },
        strokes: {},
      },
    },
  },
  error: {
    contained: {
      default: {
        tokens: {
          background: "{components.button.colors.error.contained.default.background}",
          foreground: "{components.button.colors.error.contained.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.error.contained.hover.background}",
          foreground: "{components.button.colors.error.contained.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.error.contained.focus.background}",
          foreground: "{components.button.colors.error.contained.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.error.contained.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.error.contained.press.background}",
          foreground: "{components.button.colors.error.contained.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.error.contained.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.error.contained.disable.background}",
          foreground: "{components.button.colors.error.contained.disable.foreground}",
        },
        strokes: {},
      },
    },
    outlined: {
      default: {
        tokens: {
          background: "{components.button.colors.error.outlined.default.background}",
          foreground: "{components.button.colors.error.outlined.default.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.error.outlined.default.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      hover: {
        tokens: {
          background: "{components.button.colors.error.outlined.hover.background}",
          foreground: "{components.button.colors.error.outlined.hover.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.error.outlined.hover.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      focus: {
        tokens: {
          background: "{components.button.colors.error.outlined.focus.background}",
          foreground: "{components.button.colors.error.outlined.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.error.outlined.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.error.outlined.focus.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.error.outlined.press.background}",
          foreground: "{components.button.colors.error.outlined.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.error.outlined.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
          border: {
            color: "{components.button.colors.error.outlined.press.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
      disable: {
        tokens: {
          background: "{components.button.colors.error.outlined.disable.background}",
          foreground: "{components.button.colors.error.outlined.disable.foreground}",
        },
        strokes: {
          border: {
            color: "{components.button.colors.error.outlined.disable.border}",
            width: "{layouts.stroke.outline}",
            align: "inside",
          },
        },
      },
    },
    text: {
      default: {
        tokens: {
          foreground: "{components.button.colors.error.text.default.foreground}",
        },
        strokes: {},
      },
      hover: {
        tokens: {
          background: "{components.button.colors.error.text.hover.background}",
          foreground: "{components.button.colors.error.text.hover.foreground}",
        },
        strokes: {},
      },
      focus: {
        tokens: {
          background: "{components.button.colors.error.text.focus.background}",
          foreground: "{components.button.colors.error.text.focus.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.error.text.focus.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      press: {
        tokens: {
          background: "{components.button.colors.error.text.press.background}",
          foreground: "{components.button.colors.error.text.press.foreground}",
        },
        strokes: {
          ring: {
            color: "{components.button.colors.error.text.press.ring}",
            width: "{layouts.stroke.ring}",
            align: "outside",
          },
        },
      },
      disable: {
        tokens: {
          foreground: "{components.button.colors.error.text.disable.foreground}",
        },
        strokes: {},
      },
    },
  },
};

/**
 * `variants[].view`, indexé par variant/état : chaque combinaison désigne la
 * vue exacte de `variantViews` à employer pour la structure et les cibles de
 * peinture. Un contrat 10.2 n'énumère pas ces vues par couleur — la couleur ne
 * change que les tokens peints, jamais la vue.
 */
const BUTTON_VIEW_BY_VARIANT_STATE: Record<ButtonVariant, Record<ButtonState, string>> = {
  contained: { default: "v1", hover: "v1", focus: "v4", press: "v4", disable: "v1" },
  outlined: { default: "v2", hover: "v2", focus: "v5", press: "v5", disable: "v6" },
  text: { default: "v3", hover: "v1", focus: "v4", press: "v4", disable: "v7" },
};

/**
 * `variantViews[view].structure.radius` — seul champ qui distingue les sept
 * vues du contrat au niveau de la racine ; leurs `justifyContent`/
 * `alignItems` de racine (`flex-start`/`flex-start`) et de cadre
 * (`center`/`center`) sont, eux, identiques dans les sept.
 */
const BUTTON_VIEW_ROOT_RADIUS: Record<string, string | null> = {
  v1: null,
  v2: null,
  v3: null,
  v4: "{layouts.radius.md}",
  v5: "{layouts.radius.md}",
  v6: "{layouts.radius.md}",
  v7: "{layouts.radius.md}",
};

const VIEW_ROOT_JUSTIFY_CONTENT = "flex-start";
const VIEW_ROOT_ALIGN_ITEMS = "flex-start";
const VIEW_FRAME_JUSTIFY_CONTENT = "center";
const VIEW_FRAME_ALIGN_ITEMS = "center";

interface ButtonSizeLeaf {
  gap: string;
  paddingX: string;
  paddingY: string;
  radius: string;
}

/** `structure.sizes`, recopié en toutes lettres. */
const BUTTON_SIZES: Record<ButtonSize, ButtonSizeLeaf> = {
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

/** `icons.arrowLeftLong` / `icons.arrowRightLong`. */
const ICON_LEFT_SIZE = "{components.icons.sizes.sm}";
const ICON_LEFT_FIGMA_NAME = "arrow-left-long";
const ICON_RIGHT_SIZE = "{components.icons.sizes.sm}";
const ICON_RIGHT_FIGMA_NAME = "arrow-right-long";

/** `textStyles["label.large"].tokens`. */
const LABEL_TEXT_STYLE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.label.large.fontsize}",
  fontWeight: "{typography.label.large.fontweight}",
  lineHeight: "{typography.label.large.lineheight}",
  letterSpacing: "{typography.label.large.letterspacing}",
};

/** `samples.s1.text[0].value` — défaut du contenu du slot `label`. */
const DEFAULT_LABEL_TEXT = "Label";

/**
 * `rendering.roles.border` / `.ring` : un stroke se rend en `box-shadow`,
 * jamais en bordure CSS, pour ne pas pousser la mise en page (skill
 * « consommer-contrat », §3). `align` en donne la forme.
 */
function strokeBoxShadow(stroke: ButtonStrokeLeaf | undefined): string | undefined {
  if (!stroke) return undefined;
  const width = tokenVar(stroke.width);
  const color = tokenVar(stroke.color);
  if (stroke.align === "inside") return `inset 0 0 0 ${width} ${color}`;
  if (stroke.align === "outside") return `0 0 0 ${width} ${color}`;
  return `0 0 0 calc(${width} / 2) ${color}`;
}

interface ButtonContractProps {
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  label?: boolean;
  iconLeft?: boolean;
  iconRight?: boolean;
  iconLeftName?: ButtonIconName | null;
  iconRightName?: ButtonIconName | null;
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {
  /** Contenu du slot `label` — hors surface du contrat, qui n'en publie que la visibilité. */
  children?: ReactNode;
}

/**
 * Action déclenchant une opération (`intent.usage`) ; `color` et `variant`
 * choisissent l'importance visuelle, `size` la densité. `stateModel` suit
 * cinq états — `default`, `hover`, `focus`, `press`, `disable` — avec
 * `disable` prioritaire sur tous les autres (`stateModel.precedence`).
 *
 * Un test froid en styles inline suit `:hover`/`:active` avec les événements
 * Pointer, et `:focus-visible` avec `event.currentTarget.matches(":focus-visible")`
 * pour ne montrer l'anneau qu'au clavier.
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
  children = DEFAULT_LABEL_TEXT,
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
  type = "button",
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const state: ButtonState = disabled
    ? "disable"
    : pressed
      ? "press"
      : focusVisible
        ? "focus"
        : hovered
          ? "hover"
          : "default";

  const leaf = BUTTON_VARIANTS[color][variant][state];
  const view = BUTTON_VIEW_BY_VARIANT_STATE[variant][state];
  const rootRadius = BUTTON_VIEW_ROOT_RADIUS[view];
  const sizeLeaf = BUTTON_SIZES[size];

  const foreground = tokenVar(leaf.tokens.foreground);
  const ringShadow = strokeBoxShadow(leaf.strokes.ring);
  const borderShadow = strokeBoxShadow(leaf.strokes.border);

  const resolvedIconLeftName = iconLeftName ?? ICON_LEFT_FIGMA_NAME;
  const resolvedIconRightName = iconRightName ?? ICON_RIGHT_FIGMA_NAME;

  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
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
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") setPressed(true);
        onKeyDown?.(event);
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") setPressed(false);
        onKeyUp?.(event);
      }}
      style={{
        alignItems: VIEW_ROOT_ALIGN_ITEMS,
        background: "none",
        border: "none",
        borderRadius: rootRadius ? tokenVar(rootRadius) : undefined,
        boxShadow: ringShadow,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-flex",
        flexDirection: "row",
        font: "inherit",
        height: "fit-content",
        justifyContent: VIEW_ROOT_JUSTIFY_CONTENT,
        padding: 0,
        width: "fit-content",
        ...style,
      } as CSSProperties}
    >
      <span
        style={{
          alignItems: VIEW_FRAME_ALIGN_ITEMS,
          backgroundColor: leaf.tokens.background ? tokenVar(leaf.tokens.background) : undefined,
          borderRadius: tokenVar(sizeLeaf.radius),
          boxShadow: borderShadow,
          display: "flex",
          flexDirection: "row",
          gap: tokenVar(sizeLeaf.gap),
          justifyContent: VIEW_FRAME_JUSTIFY_CONTENT,
          padding: `${tokenVar(sizeLeaf.paddingY)} ${tokenVar(sizeLeaf.paddingX)}`,
        }}
      >
        {iconLeft && (
          <ContractIcon name={resolvedIconLeftName} sizeToken={ICON_LEFT_SIZE} color={foreground} />
        )}
        {label && (
          <span
            style={{
              color: foreground,
              fontFamily: tokenVar(LABEL_TEXT_STYLE.fontFamily),
              fontSize: tokenVar(LABEL_TEXT_STYLE.fontSize),
              fontWeight: tokenVar(LABEL_TEXT_STYLE.fontWeight),
              letterSpacing: tokenVar(LABEL_TEXT_STYLE.letterSpacing),
              lineHeight: tokenVar(LABEL_TEXT_STYLE.lineHeight),
            }}
          >
            {children}
          </span>
        )}
        {iconRight && (
          <ContractIcon name={resolvedIconRightName} sizeToken={ICON_RIGHT_SIZE} color={foreground} />
        )}
      </span>
    </button>
  );
}

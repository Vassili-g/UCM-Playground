/**
 * Button — reconstruit à froid depuis `Button.contract.json` (contrat 4.3).
 *
 * Le composant n'importe pas son contrat : il ÉCRIT les références de tokens
 * que celui-ci déclare, et le contrat sert ensuite à vérifier que ce sont les
 * bonnes. Les tables ci-dessous sont donc des transcriptions littérales, jamais
 * des chemins assemblés à l'exécution.
 */
import { useState } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from "../../generated/contracts/Button.ts";

export type { ButtonColor, ButtonSize, ButtonVariant };

/** `props.iconLeftName` / `props.iconRightName` : nom d'icône opaque, résolu par l'application. */
export type ButtonIconName = string;

/** `stateModel.states` — les cinq états déclarés par le contrat. */
type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

/**
 * `stateModel.precedence` — l'ordre exact du contrat. Le premier état actif
 * gagne ; écrire cette liste plutôt qu'une cascade de ternaires garde la
 * donnée comparable au contrat.
 */
const PRECEDENCE: ButtonState[] = [
  "disable",
  "press",
  "focus",
  "hover",
  "default",
];

/** Rôles `background` et `foreground` de `variantTokens[color][variant][state]`. */
interface Paint {
  background?: string;
  foreground: string;
}

/** Rôles `border` et `ring` de `variantStrokes[color][variant][state]`. */
interface Stroke {
  color: string;
  width: string | null;
}

interface Strokes {
  border?: Stroke;
  ring?: Stroke;
}

/** `structure.sizes[size]` — les dimensions vivent ici, et nulle part ailleurs. */
interface SizeTokens {
  gap: string;
  paddingX: string;
  paddingY: string;
  radius: string;
  fontSize: string;
}

const SIZES: Record<ButtonSize, SizeTokens> = {
  medium: {
    gap: "{components.button.sizes.medium.gap}",
    paddingX: "{components.button.sizes.medium.padding-x}",
    paddingY: "{components.button.sizes.medium.padding-y}",
    radius: "{components.button.sizes.medium.border-radius}",
    fontSize: "{components.button.sizes.medium.label-size}",
  },
  big: {
    gap: "{components.button.sizes.big.gap}",
    paddingX: "{components.button.sizes.big.padding-x}",
    paddingY: "{components.button.sizes.big.padding-y}",
    radius: "{components.button.sizes.big.border-radius}",
    fontSize: "{components.button.sizes.big.label-size}",
  },
  small: {
    gap: "{components.button.sizes.small.gap}",
    paddingX: "{components.button.sizes.small.padding-x}",
    paddingY: "{components.button.sizes.small.padding-y}",
    radius: "{components.button.sizes.small.border-radius}",
    fontSize: "{components.button.sizes.small.label-size}",
  },
};

/** Typographie du slot `label` ; sa taille vient de `structure.sizes` (ci-dessus). */
const LABEL_TYPOGRAPHY = {
  fontWeight: "{layouts.fontweight.600}",
  lineHeight: "{layouts.lineheight.base}",
  fontFamily: "{layouts.fontfamily.base}",
};

/** `structure.children[].size` des deux slots d'icône. */
const ICON_SIZE = "{components.icons.sizes.base}";

const RING_WIDTH = "{layouts.stroke.ring}";
const OUTLINE_WIDTH = "{layouts.stroke.outline}";

const PAINTS: Record<
  ButtonColor,
  Record<ButtonVariant, Record<ButtonState, Paint>>
> = {
  primary: {
    contained: {
      default: {
        background: "{components.button.colors.primary.contained.default.background}",
        foreground: "{components.button.colors.primary.contained.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.primary.contained.hover.background}",
        foreground: "{components.button.colors.primary.contained.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.primary.contained.focus.background}",
        foreground: "{components.button.colors.primary.contained.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.primary.contained.press.background}",
        foreground: "{components.button.colors.primary.contained.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.primary.contained.disable.background}",
        foreground: "{components.button.colors.primary.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        background: "{components.button.colors.primary.outlined.default.background}",
        foreground: "{components.button.colors.primary.outlined.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.primary.outlined.hover.background}",
        foreground: "{components.button.colors.primary.outlined.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.primary.outlined.focus.background}",
        foreground: "{components.button.colors.primary.outlined.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.primary.outlined.press.background}",
        foreground: "{components.button.colors.primary.outlined.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.primary.outlined.disable.background}",
        foreground: "{components.button.colors.primary.outlined.disable.foreground}",
      },
    },
    text: {
      default: {
        foreground: "{components.button.colors.primary.text.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.primary.text.hover.background}",
        foreground: "{components.button.colors.primary.text.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.primary.text.focus.background}",
        foreground: "{components.button.colors.primary.text.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.primary.text.press.background}",
        foreground: "{components.button.colors.primary.text.press.foreground}",
      },
      disable: {
        foreground: "{components.button.colors.primary.text.disable.foreground}",
      },
    },
  },
  secondary: {
    contained: {
      default: {
        background: "{components.button.colors.secondary.contained.default.background}",
        foreground: "{components.button.colors.secondary.contained.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.secondary.contained.hover.background}",
        foreground: "{components.button.colors.secondary.contained.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.secondary.contained.focus.background}",
        foreground: "{components.button.colors.secondary.contained.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.secondary.contained.press.background}",
        foreground: "{components.button.colors.secondary.contained.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.secondary.contained.disable.background}",
        foreground: "{components.button.colors.secondary.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        background: "{components.button.colors.secondary.outlined.default.background}",
        foreground: "{components.button.colors.secondary.outlined.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.secondary.outlined.hover.background}",
        foreground: "{components.button.colors.secondary.outlined.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.secondary.outlined.focus.background}",
        foreground: "{components.button.colors.secondary.outlined.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.secondary.outlined.press.background}",
        foreground: "{components.button.colors.secondary.outlined.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.secondary.outlined.disable.background}",
        foreground: "{components.button.colors.secondary.outlined.disable.foreground}",
      },
    },
    text: {
      default: {
        foreground: "{components.button.colors.secondary.text.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.secondary.text.hover.background}",
        foreground: "{components.button.colors.secondary.text.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.secondary.text.focus.background}",
        foreground: "{components.button.colors.secondary.text.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.secondary.text.press.background}",
        foreground: "{components.button.colors.secondary.text.press.foreground}",
      },
      disable: {
        foreground: "{components.button.colors.secondary.text.disable.foreground}",
      },
    },
  },
  info: {
    contained: {
      default: {
        background: "{components.button.colors.info.contained.default.background}",
        foreground: "{components.button.colors.info.contained.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.info.contained.hover.background}",
        foreground: "{components.button.colors.info.contained.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.info.contained.focus.background}",
        foreground: "{components.button.colors.info.contained.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.info.contained.press.background}",
        foreground: "{components.button.colors.info.contained.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.info.contained.disable.background}",
        foreground: "{components.button.colors.info.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        background: "{components.button.colors.info.outlined.default.background}",
        foreground: "{components.button.colors.info.outlined.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.info.outlined.hover.background}",
        foreground: "{components.button.colors.info.outlined.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.info.outlined.focus.background}",
        foreground: "{components.button.colors.info.outlined.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.info.outlined.press.background}",
        foreground: "{components.button.colors.info.outlined.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.info.outlined.disable.background}",
        foreground: "{components.button.colors.info.outlined.disable.foreground}",
      },
    },
    text: {
      default: {
        foreground: "{components.button.colors.info.text.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.info.text.hover.background}",
        foreground: "{components.button.colors.info.text.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.info.text.focus.background}",
        foreground: "{components.button.colors.info.text.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.info.text.press.background}",
        foreground: "{components.button.colors.info.text.press.foreground}",
      },
      disable: {
        foreground: "{components.button.colors.info.text.disable.foreground}",
      },
    },
  },
  success: {
    contained: {
      default: {
        background: "{components.button.colors.success.contained.default.background}",
        foreground: "{components.button.colors.success.contained.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.success.contained.hover.background}",
        foreground: "{components.button.colors.success.contained.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.success.contained.focus.background}",
        foreground: "{components.button.colors.success.contained.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.success.contained.press.background}",
        foreground: "{components.button.colors.success.contained.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.success.contained.disable.background}",
        foreground: "{components.button.colors.success.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        background: "{components.button.colors.success.outlined.default.background}",
        foreground: "{components.button.colors.success.outlined.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.success.outlined.hover.background}",
        foreground: "{components.button.colors.success.outlined.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.success.outlined.focus.background}",
        foreground: "{components.button.colors.success.outlined.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.success.outlined.press.background}",
        foreground: "{components.button.colors.success.outlined.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.success.outlined.disable.background}",
        foreground: "{components.button.colors.success.outlined.disable.foreground}",
      },
    },
    text: {
      default: {
        foreground: "{components.button.colors.success.text.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.success.text.hover.background}",
        foreground: "{components.button.colors.success.text.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.success.text.focus.background}",
        foreground: "{components.button.colors.success.text.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.success.text.press.background}",
        foreground: "{components.button.colors.success.text.press.foreground}",
      },
      disable: {
        foreground: "{components.button.colors.success.text.disable.foreground}",
      },
    },
  },
  warning: {
    contained: {
      default: {
        background: "{components.button.colors.warning.contained.default.background}",
        foreground: "{components.button.colors.warning.contained.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.warning.contained.hover.background}",
        foreground: "{components.button.colors.warning.contained.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.warning.contained.focus.background}",
        foreground: "{components.button.colors.warning.contained.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.warning.contained.press.background}",
        foreground: "{components.button.colors.warning.contained.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.warning.contained.disable.background}",
        foreground: "{components.button.colors.warning.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        background: "{components.button.colors.warning.outlined.default.background}",
        foreground: "{components.button.colors.warning.outlined.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.warning.outlined.hover.background}",
        foreground: "{components.button.colors.warning.outlined.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.warning.outlined.focus.background}",
        foreground: "{components.button.colors.warning.outlined.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.warning.outlined.press.background}",
        foreground: "{components.button.colors.warning.outlined.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.warning.outlined.disable.background}",
        foreground: "{components.button.colors.warning.outlined.disable.foreground}",
      },
    },
    text: {
      default: {
        foreground: "{components.button.colors.warning.text.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.warning.text.hover.background}",
        foreground: "{components.button.colors.warning.text.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.warning.text.focus.background}",
        foreground: "{components.button.colors.warning.text.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.warning.text.press.background}",
        foreground: "{components.button.colors.warning.text.press.foreground}",
      },
      disable: {
        foreground: "{components.button.colors.warning.text.disable.foreground}",
      },
    },
  },
  error: {
    contained: {
      default: {
        background: "{components.button.colors.error.contained.default.background}",
        foreground: "{components.button.colors.error.contained.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.error.contained.hover.background}",
        foreground: "{components.button.colors.error.contained.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.error.contained.focus.background}",
        foreground: "{components.button.colors.error.contained.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.error.contained.press.background}",
        foreground: "{components.button.colors.error.contained.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.error.contained.disable.background}",
        foreground: "{components.button.colors.error.contained.disable.foreground}",
      },
    },
    outlined: {
      default: {
        background: "{components.button.colors.error.outlined.default.background}",
        foreground: "{components.button.colors.error.outlined.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.error.outlined.hover.background}",
        foreground: "{components.button.colors.error.outlined.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.error.outlined.focus.background}",
        foreground: "{components.button.colors.error.outlined.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.error.outlined.press.background}",
        foreground: "{components.button.colors.error.outlined.press.foreground}",
      },
      disable: {
        background: "{components.button.colors.error.outlined.disable.background}",
        foreground: "{components.button.colors.error.outlined.disable.foreground}",
      },
    },
    text: {
      default: {
        foreground: "{components.button.colors.error.text.default.foreground}",
      },
      hover: {
        background: "{components.button.colors.error.text.hover.background}",
        foreground: "{components.button.colors.error.text.hover.foreground}",
      },
      focus: {
        background: "{components.button.colors.error.text.focus.background}",
        foreground: "{components.button.colors.error.text.focus.foreground}",
      },
      press: {
        background: "{components.button.colors.error.text.press.background}",
        foreground: "{components.button.colors.error.text.press.foreground}",
      },
      disable: {
        foreground: "{components.button.colors.error.text.disable.foreground}",
      },
    },
  },
};

const STROKES: Record<
  ButtonColor,
  Record<ButtonVariant, Record<ButtonState, Strokes>>
> = {
  primary: {
    contained: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.primary.contained.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.primary.contained.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.primary.outlined.default.border}",
          width: OUTLINE_WIDTH,
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.primary.outlined.hover.border}",
          width: OUTLINE_WIDTH,
        },
      },
      focus: {
        ring: {
          color: "{components.button.colors.primary.outlined.focus.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.primary.outlined.focus.border}",
          width: OUTLINE_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.primary.outlined.press.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.primary.outlined.press.border}",
          width: OUTLINE_WIDTH,
        },
      },
      disable: {
        border: {
          color: "{components.button.colors.primary.outlined.disable.border}",
          width: OUTLINE_WIDTH,
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.primary.text.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.primary.text.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
  },
  secondary: {
    contained: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.secondary.contained.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.secondary.contained.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.secondary.outlined.default.border}",
          width: OUTLINE_WIDTH,
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.secondary.outlined.hover.border}",
          width: OUTLINE_WIDTH,
        },
      },
      focus: {
        ring: {
          color: "{components.button.colors.secondary.outlined.focus.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.secondary.outlined.focus.border}",
          width: OUTLINE_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.secondary.outlined.press.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.secondary.outlined.press.border}",
          width: OUTLINE_WIDTH,
        },
      },
      disable: {
        border: {
          color: "{components.button.colors.secondary.outlined.disable.border}",
          width: OUTLINE_WIDTH,
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.secondary.text.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.secondary.text.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
  },
  info: {
    contained: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.info.contained.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.info.contained.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.info.outlined.default.border}",
          width: OUTLINE_WIDTH,
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.info.outlined.hover.border}",
          width: OUTLINE_WIDTH,
        },
      },
      focus: {
        ring: {
          color: "{components.button.colors.info.outlined.focus.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.info.outlined.focus.border}",
          width: OUTLINE_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.info.outlined.press.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.info.outlined.press.border}",
          width: OUTLINE_WIDTH,
        },
      },
      disable: {
        border: {
          color: "{components.button.colors.info.outlined.disable.border}",
          width: OUTLINE_WIDTH,
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.info.text.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.info.text.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
  },
  success: {
    contained: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.success.contained.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.success.contained.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.success.outlined.default.border}",
          width: OUTLINE_WIDTH,
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.success.outlined.hover.border}",
          width: OUTLINE_WIDTH,
        },
      },
      focus: {
        ring: {
          color: "{components.button.colors.success.outlined.focus.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.success.outlined.focus.border}",
          width: OUTLINE_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.success.outlined.press.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.success.outlined.press.border}",
          width: OUTLINE_WIDTH,
        },
      },
      disable: {
        border: {
          color: "{components.button.colors.success.outlined.disable.border}",
          width: OUTLINE_WIDTH,
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.success.text.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.success.text.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
  },
  warning: {
    contained: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.warning.contained.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.warning.contained.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.warning.outlined.default.border}",
          width: OUTLINE_WIDTH,
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.warning.outlined.hover.border}",
          width: OUTLINE_WIDTH,
        },
      },
      focus: {
        ring: {
          color: "{components.button.colors.warning.outlined.focus.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.warning.outlined.focus.border}",
          width: OUTLINE_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.warning.outlined.press.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.warning.outlined.press.border}",
          width: OUTLINE_WIDTH,
        },
      },
      disable: {
        border: {
          color: "{components.button.colors.warning.outlined.disable.border}",
          width: OUTLINE_WIDTH,
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.warning.text.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.warning.text.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
  },
  error: {
    contained: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.error.contained.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.error.contained.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.error.outlined.default.border}",
          width: OUTLINE_WIDTH,
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.error.outlined.hover.border}",
          width: OUTLINE_WIDTH,
        },
      },
      focus: {
        ring: {
          color: "{components.button.colors.error.outlined.focus.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.error.outlined.focus.border}",
          width: OUTLINE_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.error.outlined.press.ring}",
          width: RING_WIDTH,
        },
        border: {
          color: "{components.button.colors.error.outlined.press.border}",
          width: OUTLINE_WIDTH,
        },
      },
      disable: {
        border: {
          color: "{components.button.colors.error.outlined.disable.border}",
          width: OUTLINE_WIDTH,
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.error.text.focus.ring}",
          width: RING_WIDTH,
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.error.text.press.ring}",
          width: RING_WIDTH,
        },
      },
      disable: {},
    },
  },
};

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** `props.color` — défaut du contrat : `primary`. */
  color?: ButtonColor;
  /** `props.variant` — défaut du contrat : `contained`. */
  variant?: ButtonVariant;
  /** `props.size` — défaut du contrat : `medium`. */
  size?: ButtonSize;
  /** `props.disabled` — défaut du contrat : `false`. */
  disabled?: boolean;
  /** `props.label` — affiche ou masque le slot `label`. */
  label?: boolean;
  /** `props.iconLeft` — affiche ou masque le slot `icon`. */
  iconLeft?: boolean;
  /** `props.iconRight` — affiche ou masque le slot `icon-2`. */
  iconRight?: boolean;
  /** `props.iconLeftName` — icône modifiable ; `null` retombe sur le nom Figma. */
  iconLeftName?: ButtonIconName | null;
  /** `props.iconRightName` — icône modifiable ; `null` retombe sur le nom Figma. */
  iconRightName?: ButtonIconName | null;
  /** Contenu du slot `label`. */
  children?: ReactNode;
}

/**
 * Le ring du contrat remplace le contour natif : il n'apparaît qu'au focus
 * clavier, ce que `:focus-visible` détermine et qu'un style inline doit
 * demander explicitement à l'élément.
 */
function isFocusVisible(element: HTMLElement): boolean {
  return element.matches(":focus-visible");
}

export function Button({
  children,
  color = "primary",
  disabled = false,
  iconLeft = true,
  iconLeftName = null,
  iconRight = true,
  iconRightName = null,
  label = true,
  size = "medium",
  style,
  variant = "contained",
  onBlur,
  onFocus,
  onPointerCancel,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  const active: Record<ButtonState, boolean> = {
    disable: disabled,
    press: pressed,
    focus: focused,
    hover: hovered,
    default: true,
  };
  const state = PRECEDENCE.find((candidate) => active[candidate]) as ButtonState;

  const paint = PAINTS[color][variant][state];
  const strokes = STROKES[color][variant][state];
  const sizeTokens = SIZES[size];

  const border =
    strokes.border && strokes.border.width !== null
      ? `${tokenVar(strokes.border.width)} solid ${tokenVar(strokes.border.color)}`
      : "none";
  const ring =
    strokes.ring && strokes.ring.width !== null
      ? `${tokenVar(strokes.ring.width)} solid ${tokenVar(strokes.ring.color)}`
      : "none";

  const rootStyle: CSSProperties = {
    alignItems: "center",
    backgroundColor: paint.background
      ? tokenVar(paint.background)
      : "transparent",
    border,
    borderRadius: tokenVar(sizeTokens.radius),
    boxSizing: "border-box",
    color: tokenVar(paint.foreground),
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    fontFamily: tokenVar(LABEL_TYPOGRAPHY.fontFamily),
    fontSize: tokenVar(sizeTokens.fontSize),
    fontWeight: tokenVar(LABEL_TYPOGRAPHY.fontWeight),
    gap: tokenVar(sizeTokens.gap),
    justifyContent: "center",
    lineHeight: tokenVar(LABEL_TYPOGRAPHY.lineHeight),
    outline: ring,
    outlineOffset: 0,
    padding: `${tokenVar(sizeTokens.paddingY)} ${tokenVar(sizeTokens.paddingX)}`,
    ...style,
  };

  return (
    <button
      disabled={disabled}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(isFocusVisible(event.currentTarget));
        onFocus?.(event);
      }}
      onPointerCancel={(event) => {
        setPressed(false);
        onPointerCancel?.(event);
      }}
      onPointerDown={(event) => {
        setPressed(true);
        onPointerDown?.(event);
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
      onPointerUp={(event) => {
        setPressed(false);
        onPointerUp?.(event);
      }}
      style={rootStyle}
      type="button"
      {...rest}
    >
      {iconLeft ? (
        <ContractIcon
          name={iconLeftName ?? "arrow-left-long"}
          sizeToken={ICON_SIZE}
        />
      ) : null}
      {label ? <span>{children}</span> : null}
      {iconRight ? (
        <ContractIcon
          name={iconRightName ?? "arrow-right-long"}
          sizeToken={ICON_SIZE}
        />
      ) : null}
    </button>
  );
}

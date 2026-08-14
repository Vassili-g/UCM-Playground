/**
 * Button — reconstruction à froid depuis `Button.contract.json` (5.0).
 *
 * `intent.usage` : « Action déclenchant une opération ; le choix des variantes
 * dépend de l'importance et du contexte. » L'élément rendu est donc un
 * `<button>` ; le comportement applicatif reste au code.
 *
 * `intent.dont` du contrat, à respecter côté appelant :
 * - ne pas utiliser `size.big` dans des écrans génériques ;
 * - ne pas juxtaposer plusieurs boutons `color.primary` sur une même vue.
 *
 * Les styles sont inline et les états suivis par événements : `stateModel`
 * donne les pseudo-classes de production, qu'un style inline ne sait pas
 * exprimer. Les tables ci-dessous transcrivent les données du contrat en
 * toutes lettres — jamais un chemin assemblé à l'exécution, sans quoi aucun
 * garde-fou ne pourrait comparer ce que le code peint à ce que Figma décrit.
 */
import { useState } from "react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  FocusEvent,
  PointerEvent,
  ReactNode,
} from "react";

import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from "../../generated/contracts/Button.ts";

export type { ButtonColor, ButtonSize, ButtonVariant };

/** Nom d'icône opaque : le contrat ne restreint pas les valeurs runtime. */
export type ButtonIconName = string;

/** Les états de `stateModel.states`, nommés comme le contrat les nomme. */
type ButtonEtat = "disable" | "press" | "focus" | "hover" | "default";

/**
 * `structure.variantTokens`, transcrit tel quel.
 *
 * Axes `["color", "variant", "state"]`, donc trois niveaux. Chaque feuille
 * décrit un état visuel COMPLET : une feuille sans `background` ne se peint
 * pas de fond, et il ne faut jamais aller le chercher dans « default ».
 */
const TOKENS_DE_VARIANTE = {
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
} as const;

/**
 * `structure.variantStrokes`, transcrit tel quel.
 *
 * Rangé à part des peintures par le contrat. `border` est aligné « inside »,
 * `ring` « outside » : ce dernier se rend en `box-shadow`, le repli que
 * `rendering.roles.ring` recommande — il épouse le rayon et ne déplace aucun
 * voisin.
 */
const STROKES_DE_VARIANTE = {
  primary: {
    contained: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.primary.contained.focus.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.primary.contained.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.primary.outlined.default.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.primary.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      focus: {
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
      press: {
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
      disable: {
        border: {
          color: "{components.button.colors.primary.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.primary.text.focus.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.primary.text.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
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
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.secondary.contained.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.secondary.outlined.default.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.secondary.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      focus: {
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
      press: {
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
      disable: {
        border: {
          color: "{components.button.colors.secondary.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.secondary.text.focus.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.secondary.text.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
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
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.info.contained.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.info.outlined.default.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.info.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      focus: {
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
      press: {
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
      disable: {
        border: {
          color: "{components.button.colors.info.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.info.text.focus.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.info.text.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
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
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.success.contained.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.success.outlined.default.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.success.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      focus: {
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
      press: {
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
      disable: {
        border: {
          color: "{components.button.colors.success.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.success.text.focus.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.success.text.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
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
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.warning.contained.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.warning.outlined.default.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.warning.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      focus: {
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
      press: {
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
      disable: {
        border: {
          color: "{components.button.colors.warning.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.warning.text.focus.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.warning.text.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
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
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.error.contained.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      disable: {},
    },
    outlined: {
      default: {
        border: {
          color: "{components.button.colors.error.outlined.default.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      hover: {
        border: {
          color: "{components.button.colors.error.outlined.hover.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
      focus: {
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
      press: {
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
      disable: {
        border: {
          color: "{components.button.colors.error.outlined.disable.border}",
          width: "{layouts.stroke.outline}",
          align: "inside",
        },
      },
    },
    text: {
      default: {},
      hover: {},
      focus: {
        ring: {
          color: "{components.button.colors.error.text.focus.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      press: {
        ring: {
          color: "{components.button.colors.error.text.press.ring}",
          width: "{layouts.stroke.ring}",
          align: "outside",
        },
      },
      disable: {},
    },
  },
} as const;

/** `structure.sizes` — les dimensions vivent ici, jamais au niveau haut. */
const TAILLES = {
  medium: {
    gap: "{components.button.sizes.medium.gap}",
    padding: { x: "{components.button.sizes.medium.padding-x}", y: "{components.button.sizes.medium.padding-y}" },
    radius: "{components.button.sizes.medium.border-radius}",
  },
  big: {
    gap: "{components.button.sizes.big.gap}",
    padding: { x: "{components.button.sizes.big.padding-x}", y: "{components.button.sizes.big.padding-y}" },
    radius: "{components.button.sizes.big.border-radius}",
  },
  small: {
    gap: "{components.button.sizes.small.gap}",
    padding: { x: "{components.button.sizes.small.padding-x}", y: "{components.button.sizes.small.padding-y}" },
    radius: "{components.button.sizes.small.border-radius}",
  },
} as const;

/**
 * `textStyles["label.large"]`, appliqué au slot « label » par
 * `structure.variantTypography` pour TOUTES les combinaisons d'axes.
 */
const STYLE_DU_LABEL = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.label.large.fontsize}",
  fontWeight: "{typography.label.large.fontweight}",
  lineHeight: "{typography.label.large.lineheight}",
  letterSpacing: "{typography.label.large.letterspacing}",
} as const;

/** `icons.arrowLeftLong` et `icons.arrowRightLong` — politique `modifiable`. */
const ICONE_GAUCHE = {
  figmaName: "arrow-left-long",
  size: "{components.icons.sizes.sm}",
} as const;
const ICONE_DROITE = {
  figmaName: "arrow-right-long",
  size: "{components.icons.sizes.sm}",
} as const;

/** Forme d'une feuille de peinture : un rôle absent ne se peint pas. */
type PeinturesDuVariant = { background?: string; foreground?: string };

/** Forme d'une feuille de strokes : couleur, largeur tokenisée, alignement. */
type StrokeDuVariant = { color: string; width: string | null; align: string };
type StrokesDuVariant = { border?: StrokeDuVariant; ring?: StrokeDuVariant };

/** Les props que le contrat déclare, et elles seules. */
interface ButtonContractProps {
  /** `props.disabled` — dérivée du variant « Disable » de l'axe d'états. */
  disabled?: boolean;
  /** `props.color` */
  color?: ButtonColor;
  /** `props.variant` */
  variant?: ButtonVariant;
  /** `props.size` */
  size?: ButtonSize;
  /** `props.label` — affiche ou masque le label. */
  label?: boolean;
  /** `props.iconLeft` — affiche ou masque l'icône de gauche. */
  iconLeft?: boolean;
  /** `props.iconRight` — affiche ou masque l'icône de droite. */
  iconRight?: boolean;
  /** `props.iconLeftName` — icône modifiable, `null` par défaut au contrat. */
  iconLeftName?: ButtonIconName | null;
  /** `props.iconRightName` — icône modifiable, `null` par défaut au contrat. */
  iconRightName?: ButtonIconName | null;
}

/**
 * L'espace de noms des props appartient au contrat : les attributs natifs
 * homonymes sont retirés mécaniquement, jamais par une liste tenue à la main.
 * `children` porte le contenu du label — le contrat décrit sa visibilité et sa
 * typographie, jamais son texte.
 */
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {
  children?: ReactNode;
}

export function Button({
  disabled = false,
  color = "primary",
  variant = "contained",
  size = "medium",
  label = true,
  iconLeft = true,
  iconRight = true,
  iconLeftName = null,
  iconRightName = null,
  children,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onFocus,
  onBlur,
  style,
  ...attributsNatifs
}: ButtonProps) {
  const [survole, setSurvole] = useState(false);
  const [enfonce, setEnfonce] = useState(false);
  const [focusClavier, setFocusClavier] = useState(false);

  // `stateModel.precedence` : disable > press > focus > hover > default. Le
  // premier état vrai gagne, et l'ordre est celui du contrat, pas une
  // préférence de rendu.
  let etat: ButtonEtat = "default";
  if (disabled) etat = "disable";
  else if (enfonce) etat = "press";
  else if (focusClavier) etat = "focus";
  else if (survole) etat = "hover";

  const tokens: PeinturesDuVariant = TOKENS_DE_VARIANTE[color][variant][etat];
  const strokes: StrokesDuVariant = STROKES_DE_VARIANTE[color][variant][etat];
  const dimensions = TAILLES[size];

  const suivreSurvol = (actif: boolean) => (evenement: PointerEvent<HTMLButtonElement>) => {
    setSurvole(actif);
    // Quitter le bouton relâche aussi l'enfoncement : sans cela, l'état
    // « press » survivrait au pointeur parti ailleurs.
    if (!actif) setEnfonce(false);
    (actif ? onPointerEnter : onPointerLeave)?.(evenement);
  };
  const suivreEnfoncement = (actif: boolean) => (evenement: PointerEvent<HTMLButtonElement>) => {
    setEnfonce(actif);
    (actif ? onPointerDown : onPointerUp)?.(evenement);
  };
  const prendreLeFocus = (evenement: FocusEvent<HTMLButtonElement>) => {
    // `stateModel.states.focus` vise `:focus-visible` : le ring du contrat
    // n'apparaît qu'au focus clavier, jamais après un clic.
    setFocusClavier(evenement.currentTarget.matches(":focus-visible"));
    onFocus?.(evenement);
  };
  const rendreLeFocus = (evenement: FocusEvent<HTMLButtonElement>) => {
    setFocusClavier(false);
    onBlur?.(evenement);
  };

  const styleBouton: CSSProperties = {
    // `structure.alignItems` et `structure.justifyContent`.
    alignItems: "center",
    justifyContent: "center",
    display: "inline-flex",
    // `structure.layout` vaut « flex-row ».
    flexDirection: "row",
    // `structure.sizing` vaut `fit-content` sur les deux axes : le bouton se
    // dimensionne sur son contenu.
    width: "fit-content",
    height: "fit-content",
    // `structure.sizes[size]` — l'unique autorité sur les dimensions.
    gap: tokenVar(dimensions.gap),
    padding: `${tokenVar(dimensions.padding.y)} ${tokenVar(dimensions.padding.x)}`,
    borderRadius: tokenVar(dimensions.radius),
    // Rôles de la feuille courante, peints selon `rendering.roles`. Un rôle
    // absent de la feuille ne se peint pas.
    ...(tokens.background ? { backgroundColor: tokenVar(tokens.background) } : {}),
    ...(tokens.foreground ? { color: tokenVar(tokens.foreground) } : {}),
    // `border` est aligné « inside » : la bordure se dessine dans la boîte.
    // Un stroke sans largeur ne se rend pas — le navigateur n'invente pas une
    // épaisseur.
    border: strokes.border?.width
      ? `${tokenVar(strokes.border.width)} solid ${tokenVar(strokes.border.color)}`
      : "none",
    boxSizing: "border-box",
    // `ring` est aligné « outside » : `box-shadow` est le rendu recommandé,
    // il épouse le `border-radius` et ne déplace pas les voisins.
    ...(strokes.ring?.width
      ? {
          boxShadow: `0 0 0 ${tokenVar(strokes.ring.width)} ${tokenVar(strokes.ring.color)}`,
          // Le ring du contrat REMPLACE le contour natif du focus.
          outline: "none",
        }
      : {}),
    ...style,
  };

  // `structure.variantTypography` situe le style par un CHEMIN DE SLOTS :
  // `slotPath: ["label"]` désigne le slot lui-même, pas le conteneur. Le poser
  // sur le bouton le ferait seulement hériter — les autres slots l'hériteraient
  // aussi, et le contrat ne dit pas cela. Aucune propriété n'est déduite du nom
  // du style : toutes viennent de ses tokens.
  const styleDuLabel: CSSProperties = {
    fontFamily: tokenVar(STYLE_DU_LABEL.fontFamily),
    fontSize: tokenVar(STYLE_DU_LABEL.fontSize),
    fontWeight: tokenVar(STYLE_DU_LABEL.fontWeight),
    letterSpacing: tokenVar(STYLE_DU_LABEL.letterSpacing),
    lineHeight: tokenVar(STYLE_DU_LABEL.lineHeight),
  };

  return (
    <button
      {...attributsNatifs}
      disabled={disabled}
      onBlur={rendreLeFocus}
      onFocus={prendreLeFocus}
      onPointerDown={suivreEnfoncement(true)}
      onPointerEnter={suivreSurvol(true)}
      onPointerLeave={suivreSurvol(false)}
      onPointerUp={suivreEnfoncement(false)}
      style={styleBouton}
    >
      {/* `structure.children` dans l'ordre : icon, label, icon-2. Chaque slot
          est masqué par la `visibilityProp` que le contrat lui attribue. */}
      {iconLeft ? (
        <ContractIcon
          name={iconLeftName ?? ICONE_GAUCHE.figmaName}
          sizeToken={ICONE_GAUCHE.size}
        />
      ) : null}
      {label ? <span style={styleDuLabel}>{children}</span> : null}
      {iconRight ? (
        <ContractIcon
          name={iconRightName ?? ICONE_DROITE.figmaName}
          sizeToken={ICONE_DROITE.size}
        />
      ) : null}
    </button>
  );
}

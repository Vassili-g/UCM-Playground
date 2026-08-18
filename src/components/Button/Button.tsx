/**
 * Button — reconstruction à froid depuis `Button.contract.json` (9.0).
 *
 * `intent.usage` : « Action déclenchant une opération ; le choix des variantes
 * dépend de l'importance et du contexte. » C'est ce qui fait de l'élément rendu
 * un `<button>` ; le contrat décrit sa peinture, l'activation appartient au
 * code.
 *
 * Le composant n'importe pas son contrat et ne l'interprète pas au runtime : il
 * ÉCRIT ses références de tokens, ses défauts et ses noms d'icônes, et le
 * contrat co-localisé sert à vérifier que ce sont les bons.
 *
 * `stateModel` donne les pseudo-classes de production (`:hover`,
 * `:focus-visible`, `:active`, `[disabled]`). Des styles inline ne savent pas
 * les exprimer : ce composant de validation suit donc les mêmes états par
 * événements Pointer et clavier, dans l'ordre de `stateModel.precedence`.
 */
import { useState } from "react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  FocusEvent,
  PointerEvent,
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

/**
 * `stateModel.axis` vaut « state », et ses valeurs sont les clés de
 * `stateModel.states`. Cet axe n'est pas une prop : il n'a donc pas d'union
 * générée, et se transcrit ici.
 */
type EtatDuBouton = "default" | "hover" | "focus" | "press" | "disable";

/** Un trait de `variants[].strokes` : sa couleur et son épaisseur, tokenisées. */
type TraitTokenise = {
  color: string;
  width: string;
};

/**
 * Une feuille de la matrice : l'état visuel COMPLET d'une combinaison.
 *
 * Les clés facultatives le sont dans le contrat lui-même — la variante « text »
 * ne publie aucun `background` au repos, et seuls `focus` et `press` publient
 * un `ring`. Une clé absente ne se reprend jamais depuis `default` : elle
 * signifie que rien n'est peint.
 */
type FeuilleDeVariante = {
  background?: string;
  foreground: string;
  border?: TraitTokenise;
  ring?: TraitTokenise;
};

/**
 * `variants[]`, rangé par ses `structure.variantAxes` — `color`, `variant`,
 * `state`, dans cet ordre. Trois niveaux, donc, puisque `stateModel` existe.
 *
 * Chaque référence est écrite en toutes lettres. Un chemin assemblé à
 * l'exécution rendrait la table impossible à comparer au contrat, et figerait
 * la convention de nommage du design system dans une fonction.
 */
const TOKENS_DE_VARIANTE: Record<
  ButtonColor,
  Record<ButtonVariant, Record<EtatDuBouton, FeuilleDeVariante>>
> = {
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
        ring: { color: "{components.button.colors.secondary.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.secondary.contained.press.background}",
        foreground: "{components.button.colors.secondary.contained.press.foreground}",
        ring: { color: "{components.button.colors.secondary.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.secondary.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        background: "{components.button.colors.secondary.outlined.hover.background}",
        foreground: "{components.button.colors.secondary.outlined.hover.foreground}",
        border: { color: "{components.button.colors.secondary.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        background: "{components.button.colors.secondary.outlined.focus.background}",
        foreground: "{components.button.colors.secondary.outlined.focus.foreground}",
        ring: { color: "{components.button.colors.secondary.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.secondary.outlined.focus.border}", width: "{layouts.stroke.outline}" },
      },
      press: {
        background: "{components.button.colors.secondary.outlined.press.background}",
        foreground: "{components.button.colors.secondary.outlined.press.foreground}",
        ring: { color: "{components.button.colors.secondary.outlined.press.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.secondary.outlined.press.border}", width: "{layouts.stroke.outline}" },
      },
      disable: {
        background: "{components.button.colors.secondary.outlined.disable.background}",
        foreground: "{components.button.colors.secondary.outlined.disable.foreground}",
        border: { color: "{components.button.colors.secondary.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.secondary.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.secondary.text.press.background}",
        foreground: "{components.button.colors.secondary.text.press.foreground}",
        ring: { color: "{components.button.colors.secondary.text.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        foreground: "{components.button.colors.secondary.text.disable.foreground}",
      },
    },
  },
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
        ring: { color: "{components.button.colors.primary.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.primary.contained.press.background}",
        foreground: "{components.button.colors.primary.contained.press.foreground}",
        ring: { color: "{components.button.colors.primary.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.primary.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        background: "{components.button.colors.primary.outlined.hover.background}",
        foreground: "{components.button.colors.primary.outlined.hover.foreground}",
        border: { color: "{components.button.colors.primary.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        background: "{components.button.colors.primary.outlined.focus.background}",
        foreground: "{components.button.colors.primary.outlined.focus.foreground}",
        ring: { color: "{components.button.colors.primary.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.primary.outlined.focus.border}", width: "{layouts.stroke.outline}" },
      },
      press: {
        background: "{components.button.colors.primary.outlined.press.background}",
        foreground: "{components.button.colors.primary.outlined.press.foreground}",
        ring: { color: "{components.button.colors.primary.outlined.press.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.primary.outlined.press.border}", width: "{layouts.stroke.outline}" },
      },
      disable: {
        background: "{components.button.colors.primary.outlined.disable.background}",
        foreground: "{components.button.colors.primary.outlined.disable.foreground}",
        border: { color: "{components.button.colors.primary.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.primary.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.primary.text.press.background}",
        foreground: "{components.button.colors.primary.text.press.foreground}",
        ring: { color: "{components.button.colors.primary.text.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        foreground: "{components.button.colors.primary.text.disable.foreground}",
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
        ring: { color: "{components.button.colors.info.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.info.contained.press.background}",
        foreground: "{components.button.colors.info.contained.press.foreground}",
        ring: { color: "{components.button.colors.info.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.info.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        background: "{components.button.colors.info.outlined.hover.background}",
        foreground: "{components.button.colors.info.outlined.hover.foreground}",
        border: { color: "{components.button.colors.info.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        background: "{components.button.colors.info.outlined.focus.background}",
        foreground: "{components.button.colors.info.outlined.focus.foreground}",
        ring: { color: "{components.button.colors.info.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.info.outlined.focus.border}", width: "{layouts.stroke.outline}" },
      },
      press: {
        background: "{components.button.colors.info.outlined.press.background}",
        foreground: "{components.button.colors.info.outlined.press.foreground}",
        ring: { color: "{components.button.colors.info.outlined.press.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.info.outlined.press.border}", width: "{layouts.stroke.outline}" },
      },
      disable: {
        background: "{components.button.colors.info.outlined.disable.background}",
        foreground: "{components.button.colors.info.outlined.disable.foreground}",
        border: { color: "{components.button.colors.info.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.info.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.info.text.press.background}",
        foreground: "{components.button.colors.info.text.press.foreground}",
        ring: { color: "{components.button.colors.info.text.press.ring}", width: "{layouts.stroke.ring}" },
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
        ring: { color: "{components.button.colors.success.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.success.contained.press.background}",
        foreground: "{components.button.colors.success.contained.press.foreground}",
        ring: { color: "{components.button.colors.success.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.success.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        background: "{components.button.colors.success.outlined.hover.background}",
        foreground: "{components.button.colors.success.outlined.hover.foreground}",
        border: { color: "{components.button.colors.success.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        background: "{components.button.colors.success.outlined.focus.background}",
        foreground: "{components.button.colors.success.outlined.focus.foreground}",
        ring: { color: "{components.button.colors.success.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.success.outlined.focus.border}", width: "{layouts.stroke.outline}" },
      },
      press: {
        background: "{components.button.colors.success.outlined.press.background}",
        foreground: "{components.button.colors.success.outlined.press.foreground}",
        ring: { color: "{components.button.colors.success.outlined.press.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.success.outlined.press.border}", width: "{layouts.stroke.outline}" },
      },
      disable: {
        background: "{components.button.colors.success.outlined.disable.background}",
        foreground: "{components.button.colors.success.outlined.disable.foreground}",
        border: { color: "{components.button.colors.success.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.success.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.success.text.press.background}",
        foreground: "{components.button.colors.success.text.press.foreground}",
        ring: { color: "{components.button.colors.success.text.press.ring}", width: "{layouts.stroke.ring}" },
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
        ring: { color: "{components.button.colors.warning.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.warning.contained.press.background}",
        foreground: "{components.button.colors.warning.contained.press.foreground}",
        ring: { color: "{components.button.colors.warning.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.warning.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        background: "{components.button.colors.warning.outlined.hover.background}",
        foreground: "{components.button.colors.warning.outlined.hover.foreground}",
        border: { color: "{components.button.colors.warning.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        background: "{components.button.colors.warning.outlined.focus.background}",
        foreground: "{components.button.colors.warning.outlined.focus.foreground}",
        ring: { color: "{components.button.colors.warning.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.warning.outlined.focus.border}", width: "{layouts.stroke.outline}" },
      },
      press: {
        background: "{components.button.colors.warning.outlined.press.background}",
        foreground: "{components.button.colors.warning.outlined.press.foreground}",
        ring: { color: "{components.button.colors.warning.outlined.press.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.warning.outlined.press.border}", width: "{layouts.stroke.outline}" },
      },
      disable: {
        background: "{components.button.colors.warning.outlined.disable.background}",
        foreground: "{components.button.colors.warning.outlined.disable.foreground}",
        border: { color: "{components.button.colors.warning.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.warning.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.warning.text.press.background}",
        foreground: "{components.button.colors.warning.text.press.foreground}",
        ring: { color: "{components.button.colors.warning.text.press.ring}", width: "{layouts.stroke.ring}" },
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
        ring: { color: "{components.button.colors.error.contained.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.error.contained.press.background}",
        foreground: "{components.button.colors.error.contained.press.foreground}",
        ring: { color: "{components.button.colors.error.contained.press.ring}", width: "{layouts.stroke.ring}" },
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
        border: { color: "{components.button.colors.error.outlined.default.border}", width: "{layouts.stroke.outline}" },
      },
      hover: {
        background: "{components.button.colors.error.outlined.hover.background}",
        foreground: "{components.button.colors.error.outlined.hover.foreground}",
        border: { color: "{components.button.colors.error.outlined.hover.border}", width: "{layouts.stroke.outline}" },
      },
      focus: {
        background: "{components.button.colors.error.outlined.focus.background}",
        foreground: "{components.button.colors.error.outlined.focus.foreground}",
        ring: { color: "{components.button.colors.error.outlined.focus.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.error.outlined.focus.border}", width: "{layouts.stroke.outline}" },
      },
      press: {
        background: "{components.button.colors.error.outlined.press.background}",
        foreground: "{components.button.colors.error.outlined.press.foreground}",
        ring: { color: "{components.button.colors.error.outlined.press.ring}", width: "{layouts.stroke.ring}" },
        border: { color: "{components.button.colors.error.outlined.press.border}", width: "{layouts.stroke.outline}" },
      },
      disable: {
        background: "{components.button.colors.error.outlined.disable.background}",
        foreground: "{components.button.colors.error.outlined.disable.foreground}",
        border: { color: "{components.button.colors.error.outlined.disable.border}", width: "{layouts.stroke.outline}" },
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
        ring: { color: "{components.button.colors.error.text.focus.ring}", width: "{layouts.stroke.ring}" },
      },
      press: {
        background: "{components.button.colors.error.text.press.background}",
        foreground: "{components.button.colors.error.text.press.foreground}",
        ring: { color: "{components.button.colors.error.text.press.ring}", width: "{layouts.stroke.ring}" },
      },
      disable: {
        foreground: "{components.button.colors.error.text.disable.foreground}",
      },
    },
  },
};

/**
 * `structure.sizes`, transcrit tel quel.
 *
 * Le contrat désigne UN endroit où vivent les dimensions : il publie un axe de
 * tailles, donc `gap`, `padding` et `radius` vivent ici et nulle part ailleurs.
 */
const TAILLES: Record<
  ButtonSize,
  { gap: string; paddingX: string; paddingY: string; radius: string }
> = {
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

/**
 * `textStyles["label.large"]` — le seul style de la vue, appliqué au slot
 * `label` par la typographie de chaque variante. Toutes les propriétés
 * typographiques viennent du text style : ni le slot ni `sizes` ne les
 * recopient.
 */
const STYLE_DU_LABEL = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.label.large.fontsize}",
  fontWeight: "{typography.label.large.fontweight}",
  lineHeight: "{typography.label.large.lineheight}",
  letterSpacing: "{typography.label.large.letterspacing}",
} as const;

/**
 * `icons` — deux icônes de politique `modifiable`.
 *
 * Masquer et remplacer sont deux libertés distinctes : `visibilityProp` dit SI
 * l'icône s'affiche, `runtimeProp` dit LAQUELLE rendre, et `figmaName` sert de
 * repli quand le consommateur n'en choisit aucune.
 */
const ICONE_GAUCHE = {
  figmaName: "arrow-left-long",
  size: "{components.icons.sizes.sm}",
} as const;
const ICONE_DROITE = {
  figmaName: "arrow-right-long",
  size: "{components.icons.sizes.sm}",
} as const;

/** Les props que le contrat déclare, et elles seules. */
interface ButtonContractProps {
  /** `props.color` — six couleurs sémantiques, « primary » par défaut. */
  color?: ButtonColor;
  /** `props.variant` — « contained », « outlined » ou « text ». */
  variant?: ButtonVariant;
  /** `props.size` — « medium », « big » ou « small ». */
  size?: ButtonSize;
  /** `props.disabled` — booléen d'état, `false` par défaut. */
  disabled?: boolean;
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
 * L'espace de noms des props appartient au contrat : `color`, `size` et
 * `label` existent aussi côté HTML avec un autre type. Les homonymes natifs
 * sont retirés MÉCANIQUEMENT, jamais par une liste tenue à la main — sinon
 * elle serait fausse au prochain contrat.
 */
export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonContractProps>,
    ButtonContractProps {}

export function Button({
  color = "primary",
  variant = "contained",
  size = "medium",
  disabled = false,
  label = true,
  iconLeft = true,
  iconRight = true,
  iconLeftName = null,
  iconRightName = null,
  children,
  onBlur,
  onFocus,
  onPointerCancel,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  style,
  type = "button",
  ...attributsNatifs
}: ButtonProps) {
  const [survole, setSurvole] = useState(false);
  const [presse, setPresse] = useState(false);
  const [focalise, setFocalise] = useState(false);

  // `stateModel.precedence` : ["disable", "press", "focus", "hover", "default"].
  const etat: EtatDuBouton = disabled
    ? "disable"
    : presse
      ? "press"
      : focalise
        ? "focus"
        : survole
          ? "hover"
          : "default";

  const feuille = TOKENS_DE_VARIANTE[color][variant][etat];
  const taille = TAILLES[size];

  const entrerEnSurvol = (evenement: PointerEvent<HTMLButtonElement>) => {
    setSurvole(true);
    onPointerEnter?.(evenement);
  };
  const quitterLeSurvol = (evenement: PointerEvent<HTMLButtonElement>) => {
    setSurvole(false);
    setPresse(false);
    onPointerLeave?.(evenement);
  };
  const commencerLAppui = (evenement: PointerEvent<HTMLButtonElement>) => {
    setPresse(true);
    onPointerDown?.(evenement);
  };
  const relacherLAppui = (evenement: PointerEvent<HTMLButtonElement>) => {
    setPresse(false);
    onPointerUp?.(evenement);
  };
  const annulerLAppui = (evenement: PointerEvent<HTMLButtonElement>) => {
    setPresse(false);
    onPointerCancel?.(evenement);
  };
  // `stateModel.states.focus.selector` vaut « :focus-visible » : le ring du
  // contrat remplace le contour natif et n'apparaît qu'au focus clavier.
  const prendreLeFocus = (evenement: FocusEvent<HTMLButtonElement>) => {
    setFocalise(evenement.currentTarget.matches(":focus-visible"));
    onFocus?.(evenement);
  };
  const perdreLeFocus = (evenement: FocusEvent<HTMLButtonElement>) => {
    setFocalise(false);
    onBlur?.(evenement);
  };

  const styleBouton: CSSProperties = {
    // Le navigateur peint un bouton par défaut. On le neutralise pour que SEUL
    // le contrat peigne : sans cela, la variante « text » — qui ne publie
    // aucun `background` au repos — hériterait du gris natif.
    appearance: "none",
    background: "none",
    border: "none",
    outline: "none",

    // `structure.layout`, `justifyContent` et `alignItems`, recopiés.
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    // `structure.sizing` : « fit-content » sur les deux axes. Le bouton se
    // limite à son contenu ; sa taille n'est pas une propriété de flux.
    width: "fit-content",
    height: "fit-content",

    // `structure.sizes[size]`.
    gap: tokenVar(taille.gap),
    paddingLeft: tokenVar(taille.paddingX),
    paddingRight: tokenVar(taille.paddingX),
    paddingTop: tokenVar(taille.paddingY),
    paddingBottom: tokenVar(taille.paddingY),
    borderRadius: tokenVar(taille.radius),

    // Rôle `foreground` : `rendering.roles` le peint en `color` / `fill`. Il
    // porte donc aussi la couleur des deux glyphes, qui en héritent.
    color: tokenVar(feuille.foreground),

    // Rôle `background`. Absent au repos de la variante « text » : rien n'est
    // alors peint, et la clé ne se reprend pas depuis un autre état.
    ...(feuille.background ? { backgroundColor: tokenVar(feuille.background) } : {}),

    // Rôle `border`, tracé « inside » : la bordure entre dans la boîte.
    ...(feuille.border
      ? {
          borderColor: tokenVar(feuille.border.color),
          borderStyle: "solid",
          borderWidth: tokenVar(feuille.border.width),
          boxSizing: "border-box" as const,
        }
      : {}),

    // Rôle `ring`, tracé « outside » : `rendering.roles.ring` nomme
    // `outline-color` / `outline-width`, qui ne déplacent rien autour.
    ...(feuille.ring
      ? {
          outlineColor: tokenVar(feuille.ring.color),
          outlineStyle: "solid",
          outlineWidth: tokenVar(feuille.ring.width),
        }
      : {}),

    ...style,
  };

  return (
    <button
      {...attributsNatifs}
      disabled={disabled}
      onBlur={perdreLeFocus}
      onFocus={prendreLeFocus}
      onPointerCancel={annulerLAppui}
      onPointerDown={commencerLAppui}
      onPointerEnter={entrerEnSurvol}
      onPointerLeave={quitterLeSurvol}
      onPointerUp={relacherLAppui}
      style={styleBouton}
      type={type}
    >
      {/* Slot « icon » de `structure.children`. */}
      {iconLeft ? (
        <ContractIcon
          name={iconLeftName ?? ICONE_GAUCHE.figmaName}
          sizeToken={ICONE_GAUCHE.size}
        />
      ) : null}

      {/* Slot « label », porteur du style `label.large`. */}
      {label ? (
        <span
          style={{
            fontFamily: tokenVar(STYLE_DU_LABEL.fontFamily),
            fontSize: tokenVar(STYLE_DU_LABEL.fontSize),
            fontWeight: tokenVar(STYLE_DU_LABEL.fontWeight),
            letterSpacing: tokenVar(STYLE_DU_LABEL.letterSpacing),
            lineHeight: tokenVar(STYLE_DU_LABEL.lineHeight),
          }}
        >
          {children}
        </span>
      ) : null}

      {/* Slot « icon-2 ». */}
      {iconRight ? (
        <ContractIcon
          name={iconRightName ?? ICONE_DROITE.figmaName}
          sizeToken={ICONE_DROITE.size}
        />
      ) : null}
    </button>
  );
}

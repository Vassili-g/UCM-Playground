/**
 * Alert — reconstruction à froid depuis `Alert.contract.json` (5.0).
 *
 * `intent.usage` : « Message a but informatif affiché de façon brève ou inclue
 * dans le contenu de la page en fonction du contexte. » D'où le `role="alert"` :
 * le contrat décrit le visuel, l'accessibilité appartient au code.
 *
 * `stateModel` vaut `null` : ce composant n'a pas d'axe d'états, donc aucun
 * survol ni focus à suivre, et `variantTokens` n'a que deux niveaux.
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Button } from "../Button/index.ts";
import type { ButtonProps } from "../Button/index.ts";
import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  AlertSeverity,
  AlertVariant,
} from "../../generated/contracts/Alert.ts";

export type { AlertSeverity, AlertVariant };

/**
 * `structure.variantTokens`, transcrit tel quel.
 *
 * Axes `["severity", "variant"]`. Chaque feuille décrit un état visuel
 * COMPLET : « outlined » n'a pas de `background`, et il ne faut surtout pas
 * aller le chercher dans « standard » pour compléter.
 */
const TOKENS_DE_VARIANTE = {
  info: {
    standard: {
      background: "{components.alert.colors.info.standard.background}",
      icon: "{components.alert.colors.info.standard.icon}",
      foreground: "{components.alert.colors.info.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.info.outlined.icon}",
      foreground: "{components.alert.colors.info.outlined.foreground}",
    },
  },
  success: {
    standard: {
      background: "{components.alert.colors.success.standard.background}",
      icon: "{components.alert.colors.success.standard.icon}",
      foreground: "{components.alert.colors.success.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.success.outlined.icon}",
      foreground: "{components.alert.colors.success.outlined.foreground}",
    },
  },
  warning: {
    standard: {
      background: "{components.alert.colors.warning.standard.background}",
      icon: "{components.alert.colors.warning.standard.icon}",
      foreground: "{components.alert.colors.warning.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.warning.outlined.icon}",
      foreground: "{components.alert.colors.warning.outlined.foreground}",
    },
  },
  error: {
    standard: {
      background: "{components.alert.colors.error.standard.background}",
      icon: "{components.alert.colors.error.standard.icon}",
      foreground: "{components.alert.colors.error.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.error.outlined.icon}",
      foreground: "{components.alert.colors.error.outlined.foreground}",
    },
  },
} as const;

/**
 * `structure.variantStrokes`, transcrit tel quel. Seul « outlined » porte une
 * bordure, alignée « inside » ; « standard » n'en a aucune.
 */
const STROKES_DE_VARIANTE = {
  info: {
    standard: {},
    outlined: {
      border: {
        color: "{components.alert.colors.info.outlined.border}",
        width: "{layouts.stroke.outline}",
        align: "inside",
      },
    },
  },
  success: {
    standard: {},
    outlined: {
      border: {
        color: "{components.alert.colors.success.outlined.border}",
        width: "{layouts.stroke.outline}",
        align: "inside",
      },
    },
  },
  warning: {
    standard: {},
    outlined: {
      border: {
        color: "{components.alert.colors.warning.outlined.border}",
        width: "{layouts.stroke.outline}",
        align: "inside",
      },
    },
  },
  error: {
    standard: {},
    outlined: {
      border: {
        color: "{components.alert.colors.error.outlined.border}",
        width: "{layouts.stroke.outline}",
        align: "inside",
      },
    },
  },
} as const;

/**
 * Dimensions du composant. Il n'a PAS d'axe de tailles : `structure.sizes` est
 * absent et les dimensions vivent au niveau haut de `structure`.
 */
const DIMENSIONS = {
  gap: "{components.alert.sizes.gap}",
  padding: {
    x: "{components.alert.sizes.padding-x}",
    y: "{components.alert.sizes.padding-y}",
  },
  radius: "{components.alert.sizes.border-radius}",
} as const;

/**
 * `textStyles`, reliés aux slots par `structure.variantTypography` : le titre
 * (`["label", "label"]`) porte « body.large », la description
 * (`["label", "label-2"]`) porte « body.small », dans toutes les combinaisons.
 */
const STYLE_DU_TITRE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.large.fontsize}",
  fontWeight: "{typography.body.large.fontweight}",
  lineHeight: "{typography.body.large.lineheight}",
  letterSpacing: "{typography.body.large.letterspacing}",
} as const;
const STYLE_DE_LA_DESCRIPTION = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.small.fontsize}",
  fontWeight: "{typography.body.small.fontweight}",
  lineHeight: "{typography.body.small.lineheight}",
  letterSpacing: "{typography.body.small.letterspacing}",
} as const;

/**
 * Les trois icônes `strict` du contrat, avec les combinaisons d'axes où
 * `icons.<clé>.variants` déclare chacune présente.
 *
 * Ces listes sont la décision du designer, transcrite telle quelle. Qu'un même
 * glyphe serve deux sévérités n'autorise aucune règle à la place : c'est une
 * donnée du contrat, et la déduire la rendrait invérifiable.
 */
const ICONES = [
  {
    figmaName: "circle-info",
    size: "{components.icons.sizes.base}",
    variants: [
      { severity: "info", variant: "standard" },
      { severity: "info", variant: "outlined" },
    ],
  },
  {
    figmaName: "circle-check",
    size: "{components.icons.sizes.base}",
    variants: [
      { severity: "success", variant: "standard" },
      { severity: "success", variant: "outlined" },
    ],
  },
  {
    figmaName: "triangle-exclamation",
    size: "{components.icons.sizes.base}",
    variants: [
      { severity: "warning", variant: "standard" },
      { severity: "warning", variant: "outlined" },
      { severity: "error", variant: "standard" },
      { severity: "error", variant: "outlined" },
    ],
  },
] as const;

/** Icône déclarée présente sur une combinaison d'axes, ou `undefined`. */
function iconeDuVariant(severity: AlertSeverity, variant: AlertVariant) {
  return ICONES.find((icone) =>
    icone.variants.some(
      (combinaison) =>
        combinaison.severity === severity && combinaison.variant === variant,
    ),
  );
}

/** Les props que le contrat déclare, et elles seules. */
interface AlertContractProps {
  /** `props.severity` */
  severity?: AlertSeverity;
  /** `props.variant` */
  variant?: AlertVariant;
  /** `props.icon` — affiche ou masque l'icône. */
  icon?: boolean;
  /** `props.title` — affiche ou masque le TITRE. C'est un booléen de
   * visibilité, pas l'infobulle HTML homonyme : le contrat possède ce nom. */
  title?: boolean;
  /** `props.action` — affiche ou masque le bouton d'action. */
  action?: boolean;
}

/**
 * L'espace de noms des props appartient au contrat : `title` reste le booléen
 * du contrat et l'attribut natif homonyme quitte la surface publique, retiré
 * mécaniquement. Le texte des slots est une donnée applicative, que le contrat
 * ne décrit pas — il n'en décrit que la visibilité et la typographie.
 */
export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof AlertContractProps>,
    AlertContractProps {
  /**
   * Contenu du slot « label » : le titre.
   *
   * Ce nom, comme `actionProps`, ne vient PAS du contrat — celui-ci ne décrit
   * du texte que la visibilité et la typographie. Il vient des appelants déjà
   * en place dans ce repo : la surface applicative appartient au développeur,
   * et la faire varier d'une reconstruction à l'autre casserait ses appels
   * sans rien apprendre sur le contrat.
   */
  titleContent?: ReactNode;
  /** Contenu du slot « label-2 » : la description. */
  children?: ReactNode;
  /** Props transmises au Button que `composes` déclare, dans le slot « action ». */
  actionProps?: ButtonProps;
}

export function Alert({
  severity = "info",
  variant = "standard",
  icon = true,
  title = true,
  action = true,
  titleContent,
  children,
  actionProps,
  style,
  ...attributsNatifs
}: AlertProps) {
  const tokens: { background?: string; icon: string; foreground: string } =
    TOKENS_DE_VARIANTE[severity][variant];
  const strokes: {
    border?: { color: string; width: string | null; align: string };
  } = STROKES_DE_VARIANTE[severity][variant];
  const icone = iconeDuVariant(severity, variant);

  const styleAlerte: CSSProperties = {
    // `structure.alignItems` et `structure.justifyContent`.
    alignItems: "center",
    justifyContent: "flex-start",
    display: "flex",
    // `structure.layout` vaut « flex-row ».
    flexDirection: "row",
    // `structure.sizing` : la largeur occupe la place donnée, la hauteur suit
    // le contenu.
    width: "100%",
    height: "fit-content",
    boxSizing: "border-box",
    gap: tokenVar(DIMENSIONS.gap),
    padding: `${tokenVar(DIMENSIONS.padding.y)} ${tokenVar(DIMENSIONS.padding.x)}`,
    borderRadius: tokenVar(DIMENSIONS.radius),
    // Un rôle absent de la feuille ne se peint pas : « outlined » n'a pas de
    // fond, et rien ne vient le lui prêter.
    ...(tokens.background ? { backgroundColor: tokenVar(tokens.background) } : {}),
    color: tokenVar(tokens.foreground),
    // `border` aligné « inside » ; un stroke sans largeur ne se rendrait pas.
    border: strokes.border?.width
      ? `${tokenVar(strokes.border.width)} solid ${tokenVar(strokes.border.color)}`
      : "none",
    ...style,
  };

  return (
    <div {...attributsNatifs} role="alert" style={styleAlerte}>
      {/* Slot « icon » — masqué par `props.icon`. L'icône est `strict` : le
          contrat nomme la seule valide pour cette combinaison d'axes, et
          aucune prop runtime ne l'expose. */}
      {icon && icone ? (
        <ContractIcon
          name={icone.figmaName}
          sizeToken={icone.size}
          color={tokenVar(tokens.icon)}
        />
      ) : null}

      {/* Slot « label » : un conteneur du contrat, avec son propre flux et ses
          deux parts textuelles. `flexGrow: 1` est publié sur ce slot. */}
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        {title ? (
          <span
            style={{
              fontFamily: tokenVar(STYLE_DU_TITRE.fontFamily),
              fontSize: tokenVar(STYLE_DU_TITRE.fontSize),
              fontWeight: tokenVar(STYLE_DU_TITRE.fontWeight),
              letterSpacing: tokenVar(STYLE_DU_TITRE.letterSpacing),
              lineHeight: tokenVar(STYLE_DU_TITRE.lineHeight),
            }}
          >
            {titleContent}
          </span>
        ) : null}
        <span
          style={{
            fontFamily: tokenVar(STYLE_DE_LA_DESCRIPTION.fontFamily),
            fontSize: tokenVar(STYLE_DE_LA_DESCRIPTION.fontSize),
            fontWeight: tokenVar(STYLE_DE_LA_DESCRIPTION.fontWeight),
            letterSpacing: tokenVar(STYLE_DE_LA_DESCRIPTION.letterSpacing),
            lineHeight: tokenVar(STYLE_DE_LA_DESCRIPTION.lineHeight),
          }}
        >
          {children}
        </span>
      </div>

      {/* Slot « action » : un CONTENEUR de ce contrat-ci, pas la dépendance.
          Il publie son propre flux et son `alignSelf: stretch` ; le Button que
          `composes` désigne se rend DEDANS. Les fusionner poserait
          l'alignement du cadre sur le Button, dont le `structure.sizing` le
          neutraliserait — et le cadre disparaîtrait sans un mot. */}
      {action ? (
        <div
          style={{
            alignItems: "center",
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Button
            {...actionProps}
            style={{ alignSelf: "stretch", ...actionProps?.style }}
          />
        </div>
      ) : null}
    </div>
  );
}

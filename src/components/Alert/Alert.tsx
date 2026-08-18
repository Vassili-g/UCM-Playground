/**
 * Alert — reconstruction à froid depuis `Alert.contract.json` (9.0).
 *
 * `intent.usage` : « Message a but informatif affiché de façon brève ou inclue
 * dans le contenu de la page en fonction du contexte ». Le contrat décrit la
 * peinture et la structure ; le rôle ARIA et le contenu appartiennent au code.
 *
 * Le composant n'importe pas son contrat et ne l'interprète pas au runtime : il
 * ÉCRIT ses références de tokens, ses défauts et ses noms d'icônes, et le
 * contrat co-localisé sert à vérifier que ce sont les bons.
 *
 * `stateModel` vaut `null` : il n'y a pas d'axe d'états, donc aucune
 * pseudo-classe à suivre. `variantAxes` en compte deux — `severity` puis
 * `variant` — et la matrice a exactement deux niveaux.
 */
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Button } from "../Button/Button.tsx";
import type { ButtonProps } from "../Button/Button.tsx";
import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type {
  AlertSeverity,
  AlertVariant,
} from "../../generated/contracts/Alert.ts";

export type { AlertSeverity, AlertVariant };

/** Un trait de `variants[].strokes` : sa couleur et son épaisseur, tokenisées. */
type TraitTokenise = {
  color: string;
  width: string;
};

/**
 * Une feuille de la matrice : l'état visuel COMPLET d'une combinaison.
 *
 * `background` n'existe que sur « standard », `border` que sur « outlined ».
 * Une clé absente ne se reprend jamais depuis une autre feuille : elle
 * signifie que rien n'est peint.
 */
type FeuilleDeVariante = {
  background?: string;
  foreground: string;
  icon: string;
  border?: TraitTokenise;
};

/**
 * `variants[]`, rangé par ses `structure.variantAxes` — `severity` puis
 * `variant`. Deux niveaux, puisque `stateModel` vaut `null`.
 *
 * Chaque référence est écrite en toutes lettres : un chemin assemblé à
 * l'exécution ne se comparerait à rien.
 */
const TOKENS_DE_VARIANTE: Record<
  AlertSeverity,
  Record<AlertVariant, FeuilleDeVariante>
> = {
  info: {
    standard: {
      background: "{components.alert.colors.info.standard.background}",
      icon: "{components.alert.colors.info.standard.icon}",
      foreground: "{components.alert.colors.info.standard.foreground}",
    },
    outlined: {
      icon: "{components.alert.colors.info.outlined.icon}",
      foreground: "{components.alert.colors.info.outlined.foreground}",
      border: {
        color: "{components.alert.colors.info.outlined.border}",
        width: "{layouts.stroke.outline}",
      },
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
      border: {
        color: "{components.alert.colors.success.outlined.border}",
        width: "{layouts.stroke.outline}",
      },
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
      border: {
        color: "{components.alert.colors.warning.outlined.border}",
        width: "{layouts.stroke.outline}",
      },
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
      border: {
        color: "{components.alert.colors.error.outlined.border}",
        width: "{layouts.stroke.outline}",
      },
    },
  },
};

/**
 * `icons` — trois icônes de politique `strict` qui se relaient sur le même
 * slot. Aucune prop runtime ne les expose : le contrat nomme la seule icône
 * valide par combinaison.
 *
 * La table ci-dessous TRANSCRIT les listes `icons.*.variants`, elle n'en déduit
 * aucune règle. Que « warning » et « error » partagent le même glyphe est une
 * décision du designer, pas une anomalie à recouper.
 */
const ICONE_DE_VARIANTE: Record<AlertSeverity, Record<AlertVariant, string>> = {
  info: { standard: "circle-info", outlined: "circle-info" },
  success: { standard: "circle-check", outlined: "circle-check" },
  warning: { standard: "triangle-exclamation", outlined: "triangle-exclamation" },
  error: { standard: "triangle-exclamation", outlined: "triangle-exclamation" },
};

/** `icons.*.size` — le carré occupé par l'icône, identique pour les trois. */
const TAILLE_DE_L_ICONE = "{components.icons.sizes.base}";

/**
 * `structure` — pas d'axe de tailles, donc les dimensions vivent au niveau
 * haut. Les y chercher dans un `sizes` inexistant rendrait une alerte sans
 * espacement ni rayon.
 */
const DIMENSIONS = {
  gap: "{components.alert.sizes.gap}",
  paddingX: "{components.alert.sizes.padding-x}",
  paddingY: "{components.alert.sizes.padding-y}",
  radius: "{components.alert.sizes.border-radius}",
} as const;

/** `textStyles["body.large"]` — style du slot `label` / `label` (le titre). */
const STYLE_DU_TITRE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.large.fontsize}",
  fontWeight: "{typography.body.large.fontweight}",
  lineHeight: "{typography.body.large.lineheight}",
  letterSpacing: "{typography.body.large.letterspacing}",
} as const;

/** `textStyles["body.small"]` — style du slot `label` / `label-2`. */
const STYLE_DE_LA_DESCRIPTION = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.small.fontsize}",
  fontWeight: "{typography.body.small.fontweight}",
  lineHeight: "{typography.body.small.lineheight}",
  letterSpacing: "{typography.body.small.letterspacing}",
} as const;

/** Les props que le contrat déclare, et elles seules. */
interface AlertContractProps {
  /** `props.severity` — « info », « success », « warning » ou « error ». */
  severity?: AlertSeverity;
  /** `props.variant` — « standard » ou « outlined ». */
  variant?: AlertVariant;
  /** `props.icon` — affiche ou masque l'icône de sévérité. */
  icon?: boolean;
  /** `props.title` — affiche ou masque le titre. BOOLÉEN, pas une infobulle. */
  title?: boolean;
  /** `props.action` — affiche ou masque le bouton d'action. */
  action?: boolean;
}

/**
 * L'espace de noms des props appartient au contrat. `title` en est le cas
 * d'école : l'attribut HTML homonyme est une infobulle, donc une chaîne, alors
 * que le contrat en fait un booléen de visibilité. La prop du contrat l'emporte
 * et l'attribut natif quitte la surface publique — mécaniquement, jamais par
 * une liste tenue à la main.
 */
export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof AlertContractProps>,
    AlertContractProps {
  /** Contenu applicatif du slot `label` / `label` (calque Figma « Titre »). */
  titleContent?: ReactNode;
  /** Contenu applicatif du slot `label` / `label-2` (calque « Description »). */
  children?: ReactNode;
  /** Props du `Button` composé, que le contrat ne décrit pas. */
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
  role = "alert",
  style,
  ...attributsNatifs
}: AlertProps) {
  const feuille = TOKENS_DE_VARIANTE[severity][variant];

  const styleAlerte: CSSProperties = {
    // `structure.layout`, `justifyContent` et `alignItems`, recopiés.
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",

    // `structure.sizing` : « stretch » en largeur, « fit-content » en hauteur.
    // L'intention appartient au contrat, la technique au code.
    width: "100%",
    height: "fit-content",

    // Dimensions du niveau haut.
    gap: tokenVar(DIMENSIONS.gap),
    paddingLeft: tokenVar(DIMENSIONS.paddingX),
    paddingRight: tokenVar(DIMENSIONS.paddingX),
    paddingTop: tokenVar(DIMENSIONS.paddingY),
    paddingBottom: tokenVar(DIMENSIONS.paddingY),
    borderRadius: tokenVar(DIMENSIONS.radius),

    // Rôle `foreground` : `rendering.roles` le peint en `color` / `fill`. Les
    // deux textes en héritent.
    color: tokenVar(feuille.foreground),

    // Rôle `background`, absent de la variante « outlined ».
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

    ...style,
  };

  return (
    <div {...attributsNatifs} role={role} style={styleAlerte}>
      {/* Slot « icon ». Le rôle `icon` a sa propre couleur, distincte de
          `foreground` : il ne suffit pas de laisser le glyphe hériter. */}
      {icon ? (
        <ContractIcon
          color={tokenVar(feuille.icon)}
          name={ICONE_DE_VARIANTE[severity][variant]}
          sizeToken={TAILLE_DE_L_ICONE}
        />
      ) : null}

      {/* Slot « label » : un conteneur de CE contrat, décrit par ses parts. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          flexGrow: 1,
          // Le contrat ne publie ni `gap` ni `padding` sur ce slot.
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

      {/* Slot « action » : le CADRE qui range la dépendance, pas la dépendance
          elle-même. Il publie son flux et son `alignSelf: stretch` ; c'est son
          enfant « button » qui EST le Button. Les fusionner poserait
          l'alignement du cadre sur le composant, dont le `structure.sizing`
          l'annulerait sans que rien ne le signale. */}
      {action ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "stretch",
          }}
        >
          <Button {...actionProps} style={{ alignSelf: "stretch", ...actionProps?.style }} />
        </div>
      ) : null}
    </div>
  );
}

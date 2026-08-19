import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { Button, type ButtonProps } from "../Button/index.ts";
import { ContractIcon } from "../ContractIcon.tsx";
import { tokenVar } from "../../tokens.ts";
import type { AlertSeverity, AlertVariant } from "../../generated/contracts/Alert.ts";

export type { AlertSeverity, AlertVariant };

/** Vues exactes de `variantViews`. */
type AlertView = "v1" | "v2" | "v3" | "v4" | "v5" | "v6";

/** Chemin de slot d'une peinture : les segments joints, `""` pour la racine. */
type SlotPath = string;

interface Stroke {
  color: string;
  width: string | null;
}

interface AlertSkin {
  view: AlertView;
  background?: string;
  icon: string;
  foreground: string;
  border?: Stroke;
}

/**
 * Feuilles de couleurs des huit combinaisons réellement présentes dans Figma
 * (`variants[].tokens` et `variants[].strokes`), avec la vue exacte de chacune.
 *
 * Les références sont écrites en toutes lettres : un chemin assemblé à
 * l'exécution ne serait plus comparable au contrat.
 */
const SKINS: Record<AlertSeverity, Record<AlertVariant, AlertSkin>> = {
  info: {
    standard: {
      view: "v1",
      background: "{components.alert.colors.info.standard.background}",
      icon: "{components.alert.colors.info.standard.icon}",
      foreground: "{components.alert.colors.info.standard.foreground}",
    },
    outlined: {
      view: "v2",
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
      view: "v3",
      background: "{components.alert.colors.success.standard.background}",
      icon: "{components.alert.colors.success.standard.icon}",
      foreground: "{components.alert.colors.success.standard.foreground}",
    },
    outlined: {
      view: "v4",
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
      view: "v5",
      background: "{components.alert.colors.warning.standard.background}",
      icon: "{components.alert.colors.warning.standard.icon}",
      foreground: "{components.alert.colors.warning.standard.foreground}",
    },
    outlined: {
      view: "v6",
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
      view: "v5",
      background: "{components.alert.colors.error.standard.background}",
      icon: "{components.alert.colors.error.standard.icon}",
      foreground: "{components.alert.colors.error.standard.foreground}",
    },
    outlined: {
      view: "v6",
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
 * `variantViews[*].paintPlacements` : où appliquer chaque clé de couleur, par
 * chemin exact de l'arbre publié. La cible ne se déduit jamais du nom de la
 * clé — `background` peint la racine, `icon` le slot d'icône, `foreground` les
 * deux textes.
 */
const VIEWS: Record<
  AlertView,
  {
    fills: Record<string, readonly SlotPath[] | undefined>;
    strokes: Record<string, readonly SlotPath[] | undefined>;
  }
> = {
  v1: {
    fills: {
      background: [""],
      icon: ["icon"],
      foreground: ["label/label", "label/label-2"],
    },
    strokes: {},
  },
  v2: {
    fills: {
      icon: ["icon"],
      foreground: ["label/label", "label/label-2"],
    },
    strokes: { border: [""] },
  },
  v3: {
    fills: {
      background: [""],
      icon: ["icon"],
      foreground: ["label/label", "label/label-2"],
    },
    strokes: {},
  },
  v4: {
    fills: {
      icon: ["icon"],
      foreground: ["label/label", "label/label-2"],
    },
    strokes: { border: [""] },
  },
  v5: {
    fills: {
      background: [""],
      icon: ["icon"],
      foreground: ["label/label", "label/label-2"],
    },
    strokes: {},
  },
  v6: {
    fills: {
      icon: ["icon"],
      foreground: ["label/label", "label/label-2"],
    },
    strokes: { border: [""] },
  },
};

/**
 * `icons[*].variants` : la combinaison qui impose chaque glyphe. Les trois
 * icônes sont `strict`, donc aucune prop runtime ne les remplace. Que `warning`
 * et `error` partagent le même glyphe est une décision de design, pas une
 * anomalie à recouper.
 */
const ICONS: Record<AlertSeverity, Record<AlertVariant, string>> = {
  info: { standard: "circle-info", outlined: "circle-info" },
  success: { standard: "circle-check", outlined: "circle-check" },
  warning: { standard: "triangle-exclamation", outlined: "triangle-exclamation" },
  error: { standard: "triangle-exclamation", outlined: "triangle-exclamation" },
};

/** `icons[*].size` : le carré occupé par l'icône. */
const ICON_SIZE = "{components.icons.sizes.base}";

/** `structure` : les dimensions du composant, hors axe de tailles. */
const GAP = "{components.alert.sizes.gap}";
const PADDING_X = "{components.alert.sizes.padding-x}";
const PADDING_Y = "{components.alert.sizes.padding-y}";
const RADIUS = "{components.alert.sizes.border-radius}";

/** `textStyles` : le style de chacun des deux slots de texte. */
const BODY_LARGE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.large.fontsize}",
  fontWeight: "{typography.body.large.fontweight}",
  lineHeight: "{typography.body.large.lineheight}",
  letterSpacing: "{typography.body.large.letterspacing}",
};

const BODY_SMALL = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.small.fontsize}",
  fontWeight: "{typography.body.small.fontweight}",
  lineHeight: "{typography.body.small.lineheight}",
  letterSpacing: "{typography.body.small.letterspacing}",
};

/** Une clé de couleur peint-elle ce chemin dans cette vue ? */
function peint(cibles: readonly SlotPath[] | undefined, chemin: SlotPath): boolean {
  return cibles !== undefined && cibles.includes(chemin);
}

/** Traduit un style de texte du contrat en propriétés CSS. */
function typographie(style: typeof BODY_LARGE): CSSProperties {
  return {
    fontFamily: tokenVar(style.fontFamily),
    fontSize: tokenVar(style.fontSize),
    fontWeight: tokenVar(style.fontWeight),
    letterSpacing: tokenVar(style.letterSpacing),
    lineHeight: tokenVar(style.lineHeight),
  };
}

/** Props visuelles déclarées par le contrat. */
interface AlertContractProps {
  severity?: AlertSeverity;
  variant?: AlertVariant;
  /** Booléen de visibilité de l'icône — pas l'attribut HTML homonyme. */
  icon?: boolean;
  /** Booléen de visibilité du titre — pas l'infobulle HTML homonyme. */
  title?: boolean;
  /** Booléen de visibilité du bouton d'action. */
  action?: boolean;
}

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof AlertContractProps>,
    AlertContractProps {
  /** Contenu du slot de titre, dont `title` commande la visibilité. */
  titleContent?: ReactNode;
  /** Props du `Button` composé, dont `action` commande la visibilité. */
  actionProps?: ButtonProps;
}

/**
 * Message à but informatif affiché de façon brève ou inclus dans le contenu de
 * la page en fonction du contexte (`intent.usage`).
 *
 * Reconstruction en contexte froid : écrite depuis le seul
 * `Alert.contract.json` (10.0) et le skill `consommer-contrat`.
 *
 * `children` porte la description, le seul texte que le contrat ne rend pas
 * masquable. Les props `icon`, `title` et `action` sont les booléens de
 * visibilité du contrat : ils l'emportent sur les attributs HTML homonymes.
 */
export function Alert({
  severity = "info",
  variant = "standard",
  icon = true,
  title = true,
  action = true,
  titleContent,
  actionProps,
  children,
  style,
  ...rest
}: AlertProps) {
  const skin = SKINS[severity][variant];
  const vue = VIEWS[skin.view];

  /** Racine : flex-row étirée en largeur, ajustée en hauteur. */
  const rootStyle: CSSProperties = {
    alignItems: "center",
    borderRadius: tokenVar(RADIUS),
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "row",
    gap: tokenVar(GAP),
    height: "fit-content",
    justifyContent: "flex-start",
    padding: `${tokenVar(PADDING_Y)} ${tokenVar(PADDING_X)}`,
    width: "100%",
    ...(skin.background !== undefined && peint(vue.fills.background, "")
      ? { backgroundColor: tokenVar(skin.background) }
      : {}),
    ...(skin.border !== undefined && skin.border.width !== null && peint(vue.strokes.border, "")
      ? {
          borderColor: tokenVar(skin.border.color),
          borderStyle: "solid",
          borderWidth: tokenVar(skin.border.width),
        }
      : {}),
    ...style,
  };

  const encre = tokenVar(skin.foreground);

  return (
    <div role="alert" {...rest} style={rootStyle}>
      {icon ? (
        <ContractIcon
          name={ICONS[severity][variant]}
          sizeToken={ICON_SIZE}
          color={peint(vue.fills.icon, "icon") ? tokenVar(skin.icon) : undefined}
        />
      ) : null}
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
              ...typographie(BODY_LARGE),
              ...(peint(vue.fills.foreground, "label/label") ? { color: encre } : {}),
            }}
          >
            {titleContent}
          </span>
        ) : null}
        <span
          style={{
            ...typographie(BODY_SMALL),
            ...(peint(vue.fills.foreground, "label/label-2") ? { color: encre } : {}),
          }}
        >
          {children}
        </span>
      </div>
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
          <Button {...actionProps} style={{ alignSelf: "stretch", ...actionProps?.style }} />
        </div>
      ) : null}
    </div>
  );
}

import type { CSSProperties, HTMLAttributes } from "react";

import type { ButtonColor } from "../Button/index.ts";
import { Button } from "../Button/index.ts";
import { ContractIcon } from "../ContractIcon.tsx";
import type {
  AlertSeverity,
  AlertVariant,
} from "../../generated/contracts/Alert.ts";
import { tokenVar } from "../../tokens.ts";

export type { AlertSeverity, AlertVariant };

/**
 * Une entrée par combinaison `severity` × `variant` réellement présente dans
 * le contrat (`variants[]`). Pas de produit cartésien reconstruit : les huit
 * clés ci-dessous sont la copie littérale des huit entrées du contrat.
 */
interface AlertVariantEntry {
  /** Feuille `tokens.background`, absente pour les variantes "outlined". */
  background?: string;
  /** Feuille `tokens.icon`. */
  icon: string;
  /** Feuille `tokens.foreground`. */
  foreground: string;
  /** Feuille `strokes.border`, seulement pour les variantes "outlined". */
  border?: {
    color: string;
    width: string;
    align: "inside" | "outside" | "center";
  };
  /** Nom d'icône opaque de `variantViews[view].icons`, `policy: "strict"`. */
  iconName: string;
  /** `composes[].args.color` du `sample` de cette combinaison. */
  buttonColor: ButtonColor;
}

const VARIANTS: Record<`${AlertSeverity}-${AlertVariant}`, AlertVariantEntry> = {
  "info-standard": {
    background: "{components.alert.colors.info.standard.background}",
    icon: "{components.alert.colors.info.standard.icon}",
    foreground: "{components.alert.colors.info.standard.foreground}",
    iconName: "circle-info",
    buttonColor: "info",
  },
  "info-outlined": {
    icon: "{components.alert.colors.info.outlined.icon}",
    foreground: "{components.alert.colors.info.outlined.foreground}",
    border: {
      color: "{components.alert.colors.info.outlined.border}",
      width: "{layouts.stroke.outline}",
      align: "inside",
    },
    iconName: "circle-info",
    buttonColor: "info",
  },
  "success-standard": {
    background: "{components.alert.colors.success.standard.background}",
    icon: "{components.alert.colors.success.standard.icon}",
    foreground: "{components.alert.colors.success.standard.foreground}",
    iconName: "circle-check",
    buttonColor: "success",
  },
  "success-outlined": {
    icon: "{components.alert.colors.success.outlined.icon}",
    foreground: "{components.alert.colors.success.outlined.foreground}",
    border: {
      color: "{components.alert.colors.success.outlined.border}",
      width: "{layouts.stroke.outline}",
      align: "inside",
    },
    iconName: "circle-check",
    buttonColor: "success",
  },
  "warning-standard": {
    background: "{components.alert.colors.warning.standard.background}",
    icon: "{components.alert.colors.warning.standard.icon}",
    foreground: "{components.alert.colors.warning.standard.foreground}",
    iconName: "triangle-exclamation",
    buttonColor: "warning",
  },
  "warning-outlined": {
    icon: "{components.alert.colors.warning.outlined.icon}",
    foreground: "{components.alert.colors.warning.outlined.foreground}",
    border: {
      color: "{components.alert.colors.warning.outlined.border}",
      width: "{layouts.stroke.outline}",
      align: "inside",
    },
    iconName: "triangle-exclamation",
    buttonColor: "warning",
  },
  "error-standard": {
    background: "{components.alert.colors.error.standard.background}",
    icon: "{components.alert.colors.error.standard.icon}",
    foreground: "{components.alert.colors.error.standard.foreground}",
    iconName: "triangle-exclamation",
    buttonColor: "error",
  },
  "error-outlined": {
    icon: "{components.alert.colors.error.outlined.icon}",
    foreground: "{components.alert.colors.error.outlined.foreground}",
    border: {
      color: "{components.alert.colors.error.outlined.border}",
      width: "{layouts.stroke.outline}",
      align: "inside",
    },
    iconName: "triangle-exclamation",
    buttonColor: "error",
  },
};

/** `structure.children[icon].size`, identique dans les six vues. */
const ICON_SIZE_TOKEN = "{components.icons.sizes.base}";

/** `variantViews[*].typography`, identique dans les six vues. */
const TITLE_TEXT_STYLE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.large.fontsize}",
  fontWeight: "{typography.body.large.fontweight}",
  lineHeight: "{typography.body.large.lineheight}",
  letterSpacing: "{typography.body.large.letterspacing}",
};

const DESCRIPTION_TEXT_STYLE = {
  fontFamily: "{primitives.fontfamily.base}",
  fontSize: "{typography.body.small.fontsize}",
  fontWeight: "{typography.body.small.fontweight}",
  lineHeight: "{typography.body.small.lineheight}",
  letterSpacing: "{typography.body.small.letterspacing}",
};

/** Props issues de `Alert.contract.json#/props`. */
export interface AlertContractProps {
  icon?: boolean;
  title?: boolean;
  action?: boolean;
  severity?: AlertSeverity;
  variant?: AlertVariant;
}

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, keyof AlertContractProps>,
    AlertContractProps {
  /**
   * Texte du slot `label` (titre). Le contrat n'expose pas le contenu comme
   * une prop — seule sa visibilité l'est (`title`) — donc ce texte est une
   * prop applicative dont le défaut vient de `samples.s1..s4.text`, identique
   * pour les quatre échantillons.
   */
  titleText?: string;
  /** Texte du slot `label-2` (description), même origine que `titleText`. */
  descriptionText?: string;
  /**
   * Texte du bouton composé dans le slot `action`. Défaut tiré de
   * `samples.*.composes[0].overrides[0].text` ("Action"), identique pour les
   * quatre échantillons.
   */
  actionLabel?: string;
}

/**
 * Alerte dérivée de `Alert.contract.json` (10.3). `stateModel` du contrat est
 * `null` : Alert elle-même n'a pas d'état interactif, seul le `Button`
 * composé dans le slot `action` en a.
 */
export function Alert({
  icon = true,
  title = true,
  action = true,
  severity = "info",
  variant = "standard",
  titleText = "Titre",
  descriptionText = "Description",
  actionLabel = "Action",
  style,
  ...rest
}: AlertProps) {
  const entry = VARIANTS[`${severity}-${variant}`];

  // `border` → box-shadow, jamais une bordure CSS (elle ne pousse rien dans
  // Figma). `align: "inside"` sur toutes les entrées "outlined" du contrat.
  const borderShadow = entry.border
    ? `inset 0 0 0 ${tokenVar(entry.border.width)} ${tokenVar(entry.border.color)}`
    : undefined;

  const rootStyle: CSSProperties = {
    alignItems: "center",
    backgroundColor: entry.background ? tokenVar(entry.background) : undefined,
    boxShadow: borderShadow,
    borderRadius: tokenVar("{components.alert.sizes.border-radius}"),
    display: "flex",
    flexDirection: "row",
    gap: tokenVar("{components.alert.sizes.gap}"),
    justifyContent: "flex-start",
    paddingBlock: tokenVar("{components.alert.sizes.padding-y}"),
    paddingInline: tokenVar("{components.alert.sizes.padding-x}"),
    width: "100%",
    ...style,
  };

  const foregroundColor = tokenVar(entry.foreground);

  return (
    <div {...rest} style={rootStyle}>
      {icon && (
        <ContractIcon
          name={entry.iconName}
          sizeToken={ICON_SIZE_TOKEN}
          color={tokenVar(entry.icon)}
        />
      )}
      <div
        style={{
          alignItems: "flex-start",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "center",
        }}
      >
        {title && (
          <span
            style={{
              color: foregroundColor,
              fontFamily: tokenVar(TITLE_TEXT_STYLE.fontFamily),
              fontSize: tokenVar(TITLE_TEXT_STYLE.fontSize),
              fontWeight: tokenVar(TITLE_TEXT_STYLE.fontWeight),
              letterSpacing: tokenVar(TITLE_TEXT_STYLE.letterSpacing),
              lineHeight: tokenVar(TITLE_TEXT_STYLE.lineHeight),
            }}
          >
            {titleText}
          </span>
        )}
        <span
          style={{
            color: foregroundColor,
            fontFamily: tokenVar(DESCRIPTION_TEXT_STYLE.fontFamily),
            fontSize: tokenVar(DESCRIPTION_TEXT_STYLE.fontSize),
            fontWeight: tokenVar(DESCRIPTION_TEXT_STYLE.fontWeight),
            letterSpacing: tokenVar(DESCRIPTION_TEXT_STYLE.letterSpacing),
            lineHeight: tokenVar(DESCRIPTION_TEXT_STYLE.lineHeight),
          }}
        >
          {descriptionText}
        </span>
      </div>
      {action && (
        // Le slot "action" publie son propre `layout`/`children` : c'est un
        // cadre de CE contrat-ci (alignSelf: stretch, flex-column, centré),
        // pas le Button lui-même. Le fusionner avec Button neutraliserait cet
        // étirement via le `sizing` propre de Button.
        <div
          style={{
            alignItems: "center",
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Button color={entry.buttonColor} variant="text" size="small">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

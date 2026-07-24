import { useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import contractJson from "./Button.contract.json";
import { tokenVar } from "../../tokens.ts";
import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from "../../generated/contracts/Button.ts";

/**
 * Unions publiques dérivées du contrat, générées par « npm run types »
 * (src/generated/contracts) — jamais recopiées à la main. Ré-exportées pour
 * que le playground type ses listes sans dupliquer l'API du composant.
 */
export type { ButtonColor, ButtonSize, ButtonVariant };

/** Les noms d'icônes restent opaques : le kit chargé par l'application les résout. */
export type ButtonIconName = string;

/**
 * API publique issue des props du contrat, complétée uniquement par le slot
 * React qui alimente l'enfant structurel `label`.
 */
export interface ButtonProps {
  color?: ButtonColor;
  variant?: ButtonVariant;
  disabled?: boolean;
  iconRight?: boolean;
  iconLeft?: boolean;
  size?: ButtonSize;
  iconLeftName?: ButtonIconName | null;
  iconRightName?: ButtonIconName | null;
  children: ReactNode;
}

/** États interactifs exportés par `stateModel`. */
type ButtonState = "default" | "hover" | "focus" | "press" | "disable";

/** Une feuille de peintures associe un rôle visuel à une référence de token. */
type PaintTokens = Partial<Record<string, string>>;

/** Un contour conserve ses tokens et son alignement structurel Figma. */
interface StrokeToken {
  color: string;
  /** Null quand la largeur n'est pas tokenisée côté Figma : le rôle ne se rend pas. */
  width: string | null;
  align: "inside" | "center" | "outside" | null;
}

/** Une feuille de contours peut contenir, par exemple, `border` ou `ring`. */
type StrokeTokens = Partial<Record<string, StrokeToken>>;

/** Dimensions réellement variables selon la prop `size`. */
interface SizeTokens {
  gap: string;
  padding: {
    x: string;
    y: string;
  };
  radius: string;
  fontSize: string;
}

/** Typographie portée par l'enfant `label` du contrat. */
interface TypographyTokens {
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  fontFamily?: string;
}

/** Enfant de structure : label ou calque graphique optionnel. */
interface ContractChild {
  slot: string;
  figmaLayer?: string;
  optional?: boolean;
  visibilityProp?: string;
  size?: string;
  typography?: TypographyTokens;
}

/** Politique de résolution d'une icône exportée depuis les règles Figma. */
interface ContractIcon {
  policy: "modifiable" | "strict";
  figmaName: string;
  visibilityProp?: string;
  runtimeProp?: string;
}

/** Mapping générique d'un rôle visuel du contrat vers des propriétés CSS. */
interface RenderingRole {
  kind: "paint" | "stroke";
  cssProperties: string[];
  fallback?: "box-shadow";
}

/**
 * Portion du schéma du contrat consommée par le composant.
 *
 * Le cast ne transforme aucune donnée : il donne seulement à TypeScript la
 * forme générique des arbres dynamiques importés depuis le JSON.
 */
interface ButtonContract {
  props: {
    color: { default: ButtonColor };
    variant: { default: ButtonVariant };
    disabled: { default: boolean };
    iconRight: { default: boolean };
    iconLeft: { default: boolean };
    size: { default: ButtonSize };
    iconLeftName: { default: null };
    iconRightName: { default: null };
  };
  structure: {
    layout: string;
    children: ContractChild[];
    sizes: Record<ButtonSize, SizeTokens>;
    variantTokens: Record<
      ButtonColor,
      Record<ButtonVariant, Record<ButtonState, PaintTokens>>
    >;
    variantStrokes: Record<
      ButtonColor,
      Record<ButtonVariant, Record<ButtonState, StrokeTokens>>
    >;
  };
  stateModel: {
    precedence: ButtonState[];
  };
  rendering: {
    roles: Record<string, RenderingRole>;
  };
  icons: Record<string, ContractIcon>;
}

const contract = contractJson as ButtonContract;

/**
 * Dette de convention documentée par le skill de consommation.
 * Ces deux valeurs devront devenir des tokens lorsqu'elles existeront côté DS.
 */
const ICON_GLYPH_RATIO = 0.8;
const ICON_STYLE = "fa-regular";

/** Retire le préfixe éventuellement fourni avant de reconstruire une classe FA valide. */
function fontAwesomeClass(iconName: string): string {
  return `${ICON_STYLE} fa-${iconName.replace(/^fa-/, "")}`;
}

/** Convertit mécaniquement `background-color` en `backgroundColor` pour React. */
function reactStyleName(cssProperty: string): string {
  return cssProperty.replace(/-([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

/**
 * Traduit les rôles de rendu du contrat en styles React.
 *
 * Les peintures appliquent leur unique token à chaque propriété déclarée. Les
 * contours choisissent leur token de couleur ou de largeur. Un ring extérieur
 * suit le repli `box-shadow` imposé par le contrat, sans déplacer le contenu.
 */
function renderingStyles(
  paints: PaintTokens,
  strokes: StrokeTokens,
): CSSProperties {
  const styles: Record<string, string> = {};

  for (const [roleName, tokenName] of Object.entries(paints)) {
    const role = contract.rendering.roles[roleName];
    if (!tokenName || role?.kind !== "paint") continue;

    for (const cssProperty of role.cssProperties) {
      styles[reactStyleName(cssProperty)] = tokenVar(tokenName);
    }
  }

  for (const [roleName, stroke] of Object.entries(strokes)) {
    const role = contract.rendering.roles[roleName];
    if (!stroke || role?.kind !== "stroke") continue;

    // Une largeur non tokenisée (null) ne se rend pas : poser la couleur seule
    // laisserait le navigateur appliquer sa largeur par défaut (« medium »),
    // une valeur brute de fait. Pas de token, pas de rendu.
    if (!stroke.width) continue;

    if (role.fallback === "box-shadow" && stroke.align === "outside") {
      styles.boxShadow = `0 0 0 ${tokenVar(stroke.width)} ${tokenVar(stroke.color)}`;
      continue;
    }

    for (const cssProperty of role.cssProperties) {
      const tokenName = cssProperty.endsWith("width")
        ? stroke.width
        : stroke.color;
      styles[reactStyleName(cssProperty)] = tokenVar(tokenName);
    }

    // Une largeur de bordure CSS n'est visible qu'avec un style de trait.
    if (role.cssProperties.some((property) => property.startsWith("border-"))) {
      styles.borderStyle = "solid";
    }
  }

  return styles as CSSProperties;
}

/**
 * Button est une projection du contrat : les défauts, dimensions, peintures,
 * contours, états et enfants sont tous lus depuis `Button.contract.json`.
 */
export function Button({
  color = contract.props.color.default,
  variant = contract.props.variant.default,
  disabled = contract.props.disabled.default,
  iconRight = contract.props.iconRight.default,
  iconLeft = contract.props.iconLeft.default,
  size = contract.props.size.default,
  iconLeftName = contract.props.iconLeftName.default,
  iconRightName = contract.props.iconRightName.default,
  children,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);

  /**
   * L'état actif suit exactement l'ordre de priorité du contrat. Le focus ne
   * devient vrai que si le navigateur confirme `:focus-visible`, donc jamais
   * pour le simple focus souris consécutif à un clic.
   */
  const activeStates: Record<ButtonState, boolean> = {
    disable: disabled,
    press: pressed,
    focus: focused,
    hover: hovered,
    default: true,
  };
  const visualState =
    contract.stateModel.precedence.find((state) => activeStates[state]) ??
    "default";

  const paintsByState = contract.structure.variantTokens[color][variant];
  const strokesByState = contract.structure.variantStrokes[color][variant];

  // Chaque variante Figma décrit son état visuel complet. Un rôle absent de
  // l'état courant signifie donc « ne pas rendre ce rôle » : aucun héritage
  // implicite depuis `default`.
  const paints = paintsByState[visualState];
  const strokes = strokesByState[visualState];

  const sizeTokens = contract.structure.sizes[size];
  const label = contract.structure.children.find(
    (child) => child.slot === "label",
  );
  const typography = label?.typography;

  /**
   * `all: unset` neutralise les peintures et bordures natives du navigateur :
   * une absence de rôle dans le contrat reste ainsi réellement une absence,
   * sans introduire une couleur brute de remplacement.
   */
  const style: CSSProperties = {
    all: "unset",
    boxSizing: "border-box",
    display: contract.structure.layout === "flex-row" ? "inline-flex" : "flex",
    flexDirection: contract.structure.layout === "flex-row" ? "row" : "column",
    alignItems: "center",
    justifyContent: "center",
    gap: tokenVar(sizeTokens.gap),
    padding: `${tokenVar(sizeTokens.padding.y)} ${tokenVar(sizeTokens.padding.x)}`,
    borderRadius: tokenVar(sizeTokens.radius),
    fontSize: tokenVar(sizeTokens.fontSize),
    fontWeight: typography?.fontWeight
      ? tokenVar(typography.fontWeight)
      : undefined,
    lineHeight: typography?.lineHeight
      ? tokenVar(typography.lineHeight)
      : undefined,
    fontFamily: typography?.fontFamily
      ? tokenVar(typography.fontFamily)
      : undefined,
    outline: "none",
    ...renderingStyles(paints, strokes),
  };

  /** Les touches d'activation natives reproduisent aussi l'état `:active`. */
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") setPressed(true);
  }

  function handleKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") setPressed(false);
  }

  /** Valeurs publiques utilisées pour résoudre génériquement les règles d'icône. */
  const runtimeProps: Record<string, unknown> = {
    iconLeft,
    iconRight,
    iconLeftName,
    iconRightName,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={style}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onFocus={(event) =>
        setFocused(event.currentTarget.matches(":focus-visible"))
      }
      onBlur={() => {
        setFocused(false);
        setPressed(false);
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {contract.structure.children.map((child) => {
        if (child.slot === "label") {
          return <span key={child.slot}>{children}</span>;
        }

        const icon = Object.values(contract.icons).find(
          (candidate) =>
            candidate.figmaName === child.figmaLayer &&
            candidate.visibilityProp === child.visibilityProp,
        );
        if (!icon || !icon.visibilityProp || !child.size) return null;
        if (!runtimeProps[icon.visibilityProp]) return null;

        const runtimeName = icon.runtimeProp
          ? runtimeProps[icon.runtimeProp]
          : null;
        const iconName =
          icon.policy === "modifiable" &&
          typeof runtimeName === "string" &&
          runtimeName.length > 0
            ? runtimeName
            : icon.figmaName;

        return (
          <span
            key={child.slot}
            aria-hidden="true"
            style={{
              width: tokenVar(child.size),
              height: tokenVar(child.size),
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: `calc(${tokenVar(child.size)} * ${ICON_GLYPH_RATIO})`,
            }}
          >
            <i className={fontAwesomeClass(iconName)} />
          </span>
        );
      })}
    </button>
  );
}

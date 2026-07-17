/**
 * Button — composant réel du design system, entièrement piloté par son
 * contrat UCS (`Button.contract.json`, co-localisé dans ce dossier).
 *
 * Règle absolue (cf. AGENTS.md) : AUCUNE valeur brute (#hex, px, poids…). Toute
 * couleur et toute dimension proviennent des NOMS de tokens du contrat,
 * traduits en variables CSS par `tokenVar`. Le bouton ne peut donc pas diverger
 * du design system : si un token change dans Figma, le rendu change avec lui.
 *
 * Icônes : le contrat ne stocke qu'un NOM opaque (ex. « arrow-left-long »).
 * Le glyphe réel est résolu par le kit FontAwesome inclus dans `index.html`
 * (intégration côté application). Une icône `modifiable` expose une prop
 * runtime (`iconLeftName`/`iconRightName`) : l'agent peut y passer n'importe
 * quel nom du kit ; sans valeur, on retombe sur le nom Figma d'origine.
 */
import { useState, type CSSProperties, type ReactNode } from "react";
import { tokenVar } from "../../tokens.ts";
import { buttonContract } from "./contract.ts";
import type { RoleTokens, StrokeTokens } from "./contract.ts";

// Les valeurs autorisées viennent du contrat : on les fige en types pour que
// l'agent (et le compilateur) ne puissent proposer que des props valides.
export type ButtonColor = "primary" | "secondary";
export type ButtonVariant = "contained" | "outlined" | "text";
export type ButtonSize = "big" | "medium" | "small";

export interface ButtonProps {
  /** Enfant textuel = le slot `label` du contrat. */
  children: ReactNode;
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** Visibilité de l'icône avant le label (slot `arrow-left-long`). */
  iconLeft?: boolean;
  /** Visibilité de l'icône après le label (slot `arrow-right-long`). */
  iconRight?: boolean;
  /** Nom d'icône (kit FA) pour le slot gauche ; défaut = icône Figma. */
  iconLeftName?: string;
  /** Nom d'icône (kit FA) pour le slot droit ; défaut = icône Figma. */
  iconRightName?: string;
  onClick?: () => void;
}

const { props: contractProps, structure, stateModel, icons } = buttonContract;

// Le slot `label` porte la typographie (en tokens) ; les autres slots sont les
// icônes. On repère le label et la taille d'icône une fois, depuis le contrat.
const labelChild = structure.children.find((child) => child.slot === "label");
const iconSize = structure.children.find((child) => child.optional)?.size;

/** Nom d'icône Figma par défaut associé à un booléen de visibilité donné. */
function defaultIconName(visibilityProp: string): string | undefined {
  return Object.values(icons).find((icon) => icon.visibilityProp === visibilityProp)?.figmaName;
}

/**
 * Construit la classe FontAwesome à partir d'un nom d'icône du contrat.
 * Règle unique et tolérante : `fa-solid fa-{nom}`, en retirant un préfixe
 * `fa-` déjà présent (les noms Figma ne sont pas homogènes : « arrow-left-long »
 * vs « fa-warning »).
 */
function faClass(name: string): string {
  const id = name.replace(/^fa-/, "");
  return `fa-solid fa-${id}`;
}

/**
 * Traduit un jeu de rôles « peinture » (fond, premier plan) en style CSS.
 * Suit `rendering.roles` du contrat : `background` → background-color,
 * `foreground` → color (dont héritent aussi les icônes FA).
 */
function paintStyle(roles: RoleTokens): CSSProperties {
  const style: CSSProperties = {};
  if (roles.background) style.backgroundColor = tokenVar(roles.background);
  if (roles.foreground) style.color = tokenVar(roles.foreground);
  return style;
}

/**
 * Traduit les contours d'un état en style CSS, épaisseur comprise (en tokens).
 * - `border` (align `inside`) → bordure classique ;
 * - `ring` (align `outside`) → halo de focus. Le contrat déclare un repli
 *   `box-shadow` pour ce rôle : on l'utilise car il se dessine à l'extérieur
 *   sans pousser la mise en page.
 */
function strokeStyle(strokes: StrokeTokens): CSSProperties {
  const style: CSSProperties = {};
  if (strokes.border) {
    style.border = `${tokenVar(strokes.border.width)} solid ${tokenVar(strokes.border.color)}`;
  }
  if (strokes.ring) {
    style.boxShadow = `0 0 0 ${tokenVar(strokes.ring.width)} ${tokenVar(strokes.ring.color)}`;
  }
  return style;
}

/**
 * Choisit l'état courant en respectant la priorité du contrat
 * (`stateModel.precedence`, ex. disable > press > focus > hover > default).
 * On ne retient que le premier état actif ET réellement présent pour cette
 * combinaison couleur/variante ; sinon on retombe sur `default`.
 */
function resolveState(
  active: Record<string, boolean>,
  availableStates: string[],
): string {
  for (const state of stateModel.precedence) {
    if (active[state] && availableStates.includes(state)) return state;
  }
  return "default";
}

export function Button({
  children,
  color = contractProps.color.default as ButtonColor,
  variant = contractProps.variant.default as ButtonVariant,
  size = contractProps.size.default as ButtonSize,
  disabled = false,
  iconLeft = contractProps.iconLeft.default,
  iconRight = contractProps.iconRight.default,
  iconLeftName,
  iconRightName,
  onClick,
}: ButtonProps) {
  // Les pseudo-classes CSS (:hover, :focus-visible, :active) ne s'expriment pas
  // en style inline ; on suit donc les mêmes états via des événements React.
  // Les noms correspondent 1:1 aux états du contrat (`stateModel.states`).
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [press, setPress] = useState(false);

  const paints = structure.variantTokens[color]?.[variant] ?? {};
  const strokes = structure.variantStrokes[color]?.[variant] ?? {};
  const available = Object.keys(paints);

  const stateName = resolveState(
    { disable: disabled, press, focus, hover },
    available,
  );

  // Peintures et contours de l'état retenu, avec repli sur `default` si un
  // rôle n'existe pas pour cet état précis (robustesse : jamais de trou).
  const rolePaint = paints[stateName] ?? paints.default ?? {};
  const roleStroke = strokes[stateName] ?? strokes.default ?? {};

  const dims = structure.sizes[size];

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: tokenVar(dims.gap),
    padding: `${tokenVar(dims.padding.y)} ${tokenVar(dims.padding.x)}`,
    borderRadius: tokenVar(dims.radius),
    // Typographie du label, entièrement en tokens (cf. contrat, slot `label`).
    fontSize: tokenVar(dims.fontSize),
    fontFamily: labelChild ? tokenVar(labelChild.typography!.fontFamily) : undefined,
    fontWeight: labelChild ? tokenVar(labelChild.typography!.fontWeight) : undefined,
    lineHeight: labelChild ? tokenVar(labelChild.typography!.lineHeight) : undefined,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 120ms, color 120ms, box-shadow 120ms",
    ...paintStyle(rolePaint),
    ...strokeStyle(roleStroke),
  };

  // Taille d'icône = token `size` du slot ; la couleur est héritée du bouton.
  const iconStyle: CSSProperties | undefined = iconSize
    ? { fontSize: tokenVar(iconSize) }
    : undefined;

  // Nom d'icône effectif par slot : prop runtime si fournie, sinon nom Figma.
  const leftIcon = iconLeftName ?? defaultIconName("iconLeft");
  const rightIcon = iconRightName ?? defaultIconName("iconRight");

  return (
    <button
      type="button"
      style={style}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPress(false);
      }}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
    >
      {iconLeft && leftIcon && (
        <i className={faClass(leftIcon)} aria-hidden style={iconStyle} />
      )}
      <span>{children}</span>
      {iconRight && rightIcon && (
        <i className={faClass(rightIcon)} aria-hidden style={iconStyle} />
      )}
    </button>
  );
}

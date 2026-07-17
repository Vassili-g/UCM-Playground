/**
 * Button — composant réel du design system, piloté par son contrat UCS.
 *
 * Toute la couleur et la dimension proviennent des NOMS de tokens listés dans
 * `Button.contract.json` (co-localisé dans ce dossier), traduits en variables
 * CSS par `tokenVar`. Aucune valeur brute (#hex, px) n'apparaît ici : le
 * bouton ne peut donc pas diverger du design system.
 *
 * États : on gère `default`, `hover` (survol souris) et `disable`. `focus` et
 * `press` existent dans le contrat et pourront être branchés plus tard ; leur
 * absence n'invente rien, elle retombe sur `default`.
 */
import { useState, type CSSProperties, type ReactNode } from "react";
import { tokenVar } from "../../tokens.ts";
import { buttonContract, type RoleTokens } from "./contract.ts";

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
  /** Icône décorative avant le label (slot `arrow-left-long`, optionnel). */
  iconLeft?: boolean;
  /** Icône décorative après le label (slot `arrow-right-long`, optionnel). */
  iconRight?: boolean;
  onClick?: () => void;
}

const { props: contractProps, structure } = buttonContract;

/** Applique les rôles de couleur d'un état (chaque rôle = un nom de token). */
function styleFromRoles(roles: RoleTokens): CSSProperties {
  const style: CSSProperties = {};
  if (roles.background) style.backgroundColor = tokenVar(roles.background);
  if (roles.foreground) style.color = tokenVar(roles.foreground);
  if (roles.border) {
    // Le contrat ne fournit pas d'épaisseur de contour dédiée : 1px est la
    // convention du design system pour les variantes `outlined`.
    style.border = `1px solid ${tokenVar(roles.border)}`;
  }
  // `ring` = halo de focus, rendu en box-shadow (0 0 0 3px) sans pousser la mise en page.
  if (roles.ring) style.boxShadow = `0 0 0 3px ${tokenVar(roles.ring)}`;
  return style;
}

export function Button({
  children,
  color = contractProps.color.default as ButtonColor,
  variant = contractProps.variant.default as ButtonVariant,
  size = contractProps.size.default as ButtonSize,
  disabled = false,
  iconLeft = contractProps.iconLeft.default,
  iconRight = contractProps.iconRight.default,
  onClick,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  // État courant → jeu de tokens. On retombe sur `default` si l'état n'existe
  // pas pour cette combinaison (robustesse : jamais de crash sur un trou).
  const stateName = disabled ? "disable" : hovered ? "hover" : "default";
  const states = structure.variantTokens[color]?.[variant] ?? {};
  const roles = states[stateName] ?? states.default ?? {};

  const dims = structure.sizes[size];

  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: tokenVar(dims.gap),
    padding: `${tokenVar(dims.padding.y)} ${tokenVar(dims.padding.x)}`,
    borderRadius: tokenVar(dims.radius),
    fontSize: tokenVar(dims.fontSize),
    fontWeight: 600,
    border: "1px solid transparent", // remplacé par styleFromRoles pour `outlined`
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background-color 120ms, color 120ms, box-shadow 120ms",
    ...styleFromRoles(roles),
  };

  return (
    <button
      type="button"
      style={style}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {iconLeft && <span aria-hidden>←</span>}
      <span>{children}</span>
      {iconRight && <span aria-hidden>→</span>}
    </button>
  );
}

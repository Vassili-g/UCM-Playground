/**
 * Typage du sous-ensemble du contrat UCS que `Button.tsx` consomme.
 *
 * On importe le vrai `Button.contract.json` (exporté de Figma par TokenLintel)
 * et on le caste vers ce type : le composant se pilote donc sur la source de
 * vérité design, pas sur des valeurs recopiées à la main. Si le contrat change
 * (nouvelle variante, nouveau token), le rendu change avec lui.
 */
import contractJson from "./Button.contract.json";

/** Rôles de couleur possibles pour un état donné (tous optionnels : un état
 *  ne porte que les rôles réellement liés dans Figma — `text` n'a souvent
 *  qu'un `foreground`). Chaque valeur est un NOM de token. */
export interface RoleTokens {
  background?: string;
  foreground?: string;
  border?: string;
  ring?: string;
}

/** Dimensions d'une taille (big/medium/small). Valeurs = noms de tokens. */
export interface SizeTokens {
  gap: string;
  padding: { x: string; y: string };
  radius: string;
  fontSize: string;
}

/** Un état de variante : `default`, `hover`, `focus`, `press`, `disable`. */
export type StateTokens = Record<string, RoleTokens>;

export interface ButtonContract {
  name: string;
  props: {
    color: { values: string[]; default: string };
    variant: { values: string[]; default: string };
    size: { values: string[]; default: string };
    iconLeft: { default: boolean };
    iconRight: { default: boolean };
  };
  structure: {
    // variantTokens[color][variant][state][role] = nom de token
    variantTokens: Record<string, Record<string, StateTokens>>;
    sizes: Record<string, SizeTokens>;
    children: Array<{ slot: string; optional?: boolean }>;
  };
}

export const buttonContract = contractJson as unknown as ButtonContract;

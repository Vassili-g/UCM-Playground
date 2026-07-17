/**
 * Typage du contrat UCS que `Button.tsx` consomme.
 *
 * On importe le vrai `Button.contract.json` (exporté de Figma par TokenLintel)
 * et on le caste vers ce type : le composant se pilote donc sur la source de
 * vérité design, pas sur des valeurs recopiées à la main. Si le contrat change
 * (nouvelle variante, nouveau token), le rendu change avec lui.
 *
 * On ne type ici QUE les champs réellement lus par le composant. Chaque valeur
 * de type `string` est un NOM de token (jamais une valeur brute) : c'est
 * `tokenVar()` qui le traduit en variable CSS au moment du rendu.
 */
import contractJson from "./Button.contract.json";

/** Rôles « peinture » d'un état : couleur de fond et couleur de premier plan.
 *  Tous optionnels — un état ne porte que les rôles réellement liés dans Figma
 *  (la variante `text` n'a souvent qu'un `foreground`). */
export interface RoleTokens {
  background?: string;
  foreground?: string;
}

/** Un contour tokenisé : couleur + épaisseur (noms de tokens) + alignement
 *  structurel venu de Figma (`inside` = bordure, `outside` = halo). */
export interface StrokeToken {
  color: string;
  width: string;
  align: "inside" | "center" | "outside";
}

/** Rôles « contour » d'un état : bordure (variante `outlined`) et/ou halo de
 *  focus (`ring`). Rangés à part des peintures dans le contrat. */
export interface StrokeTokens {
  border?: StrokeToken;
  ring?: StrokeToken;
}

/** Typographie du label, entièrement en noms de tokens. */
export interface Typography {
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  fontFamily: string;
}

/** Dimensions d'une taille (big/medium/small). Valeurs = noms de tokens. */
export interface SizeTokens {
  gap: string;
  padding: { x: string; y: string };
  radius: string;
  fontSize: string;
}

/** Un enfant réel du composant : le label textuel ou un slot d'icône. */
export interface Child {
  slot: string;
  figmaLayer?: string;
  optional?: boolean;
  size?: string;
  typography?: Typography;
  color?: string;
}

/** Modèle d'interaction : chaque état connu → son déclencheur web, plus une
 *  priorité déterministe quand plusieurs états sont simultanés. */
export interface StateModel {
  axis: string;
  states: Record<string, { selector: string | null }>;
  precedence: string[];
}

/** Un état de variante côté peinture : `default`, `hover`, `focus`, `press`,
 *  `disable`… (les clés dépendent des états présents dans Figma). */
export type PaintStates = Record<string, RoleTokens>;
/** Idem côté contours. */
export type StrokeStates = Record<string, StrokeTokens>;

export interface ButtonContract {
  name: string;
  props: {
    color: { values: string[]; default: string };
    variant: { values: string[]; default: string };
    size: { values: string[]; default: string };
    // Booléens de visibilité d'icône (le nom vient de Figma).
    iconLeft: { default: boolean };
    iconRight: { default: boolean };
    // Prop runtime « quelle icône » pour une icône `modifiable` : l'agent y
    // passe un nom du kit ; `default: null` = on retombe sur le nom Figma.
    iconLeftName: { type: "icon"; default: string | null };
    iconRightName: { type: "icon"; default: string | null };
  };
  structure: {
    children: Child[];
    // variantTokens[color][variant][state][role] = nom de token
    variantTokens: Record<string, Record<string, PaintStates>>;
    // variantStrokes[color][variant][state] = { border?, ring? }
    variantStrokes: Record<string, Record<string, StrokeStates>>;
    sizes: Record<string, SizeTokens>;
  };
  stateModel: StateModel;
  // Chaque icône : sa politique, son nom Figma (= défaut opaque), et — pour une
  // icône `modifiable` liée à un booléen Figma — les props associées.
  icons: Record<
    string,
    {
      policy: "modifiable" | "strict";
      figmaName: string;
      visibilityProp?: string;
      runtimeProp?: string;
    }
  >;
}

export const buttonContract = contractJson as unknown as ButtonContract;

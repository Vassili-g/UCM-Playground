import type { CSSProperties } from "react";

/**
 * Le point d'intégration d'icône de cette application : il reçoit un nom et une
 * taille, et rend le glyphe.
 *
 * **Le jeu d'icônes et le ratio du glyphe sont des décisions de CE dépôt, pas
 * du contrat.** Un contrat garantit quand une icône est rendue, où, si elle est
 * remplaçable et par quoi, et quel CARRÉ elle occupe ; il ne nomme aucun jeu
 * d'icônes et ne dit rien de la taille du glyphe dans ce carré. Les deux
 * constantes ci-dessous sont donc légitimes ici, et n'ont pas à remonter.
 *
 * Ce fichier ne lit aucun contrat : un composant lui passe le nom qu'il a
 * transcrit, et la taille sous la forme qu'il écrit lui-même, le plus souvent
 * `var(--components-icons-sizes-sm)`.
 */

/** Part du carré que le glyphe occupe. Décision de rendu de ce dépôt. */
const RATIO_DU_GLYPHE = 0.8;

/** Style Font Awesome des icônes du catalogue standard. */
const STYLE_STANDARD = "fa-regular";

/** Préfixe des icônes déposées dans le kit, qui n'ont aucun autre style. */
const STYLE_DU_KIT = "fa-kit";

interface ConfigurationDuKit {
  iconUploads?: Record<string, unknown>;
}

/**
 * Une icône déposée dans le kit ne se rend qu'avec `fa-kit` ; une icône du
 * catalogue standard ne se rend qu'avec son style. Le kit publie la liste de
 * ses dépôts au chargement, ce qui évite d'entretenir la même liste à la main
 * — elle divergerait du kit sans que rien ne le signale.
 *
 * Sans kit chargé (variable d'environnement absente), on retombe sur le style
 * standard : aucun glyphe ne se peindra de toute façon.
 */
function styleDuNom(nom: string): string {
  const configuration = (
    globalThis as { FontAwesomeKitConfig?: ConfigurationDuKit }
  ).FontAwesomeKitConfig;

  return configuration?.iconUploads && nom in configuration.iconUploads
    ? STYLE_DU_KIT
    : STYLE_STANDARD;
}

export interface IconeProps {
  /** Le nom porté par le contrat, transcrit tel quel. */
  nom: string;
  /** Le côté du carré, en longueur CSS — typiquement `var(--…)`. */
  taille: string;
  /** Par défaut, l'icône prend la couleur de son contexte. */
  couleur?: CSSProperties["color"];
}

export function Icone({ nom, taille, couleur }: IconeProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        alignItems: "center",
        color: couleur,
        display: "inline-flex",
        flex: "0 0 auto",
        height: taille,
        justifyContent: "center",
        width: taille,
      }}
    >
      <i
        className={`${styleDuNom(nom)} fa-${nom}`}
        style={{ fontSize: `calc(${taille} * ${RATIO_DU_GLYPHE})` }}
      />
    </span>
  );
}

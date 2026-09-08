import type { ReactNode } from "react";

/**
 * Les pièces du décor de la galerie, et rien d'autre.
 *
 * Elles ne connaissent aucun composant, aucun contrat et aucun token : elles
 * posent la grille, les étiquettes et les bascules dont `src/index.css` porte
 * l'habillage, pour qu'ajouter une sonde à `App.tsx` se limite à écrire une
 * `<Section>` et ses `<Case>`. Une sonde ne se peint qu'avec les tokens
 * qu'elle cite ; rien ici ne la touche.
 *
 * Tant qu'aucune sonde n'existe, `App.tsx` n'importe rien d'ici — c'est
 * l'attente, pas un oubli.
 */

/** Une case de la grille : son étiquette, puis ce qu'elle montre. */
export function Case({
  titre,
  children,
}: {
  titre: string;
  children: ReactNode;
}) {
  return (
    <figure className="case">
      <figcaption>{titre}</figcaption>
      <div className="scene">{children}</div>
    </figure>
  );
}

/** Une sonde et ses combinaisons : un titre, une aide, ses bascules, sa grille. */
export function Section({
  titre,
  aide,
  controles,
  children,
}: {
  titre: string;
  aide: string;
  controles?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <h2>{titre}</h2>
      <p className="aide">{aide}</p>
      {controles ? <div className="controles">{controles}</div> : null}
      <div className="grille">{children}</div>
    </section>
  );
}

/** De quoi piloter à l'écran une prop booléenne d'une sonde. */
export function Bascule({
  actif,
  libelle,
  onChange,
}: {
  actif: boolean;
  libelle: string;
  onChange: (actif: boolean) => void;
}) {
  return (
    <label>
      <input
        checked={actif}
        onChange={(evenement) => onChange(evenement.currentTarget.checked)}
        type="checkbox"
      />
      {libelle}
    </label>
  );
}

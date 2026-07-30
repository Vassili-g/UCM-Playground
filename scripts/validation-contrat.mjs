/**
 * Validation minimale de la forme d'un contrat UCM.
 *
 * Ce module reste pur : il ne lit aucun fichier et ne connaît aucun autre
 * contrat. Il vérifie uniquement les champs dont un consommateur a besoin
 * pour interpréter sans ambiguïté la version déclarée.
 */

/** Vrai pour un objet JSON, mais pas pour un tableau ni `null`. */
function estObjet(valeur) {
  return Boolean(valeur) && typeof valeur === "object" && !Array.isArray(valeur);
}

/** Lit un chemin pointé sans lever sur un maillon absent. */
function lire(objet, chemin) {
  return chemin
    .split(".")
    .reduce((valeur, cle) => (valeur == null ? undefined : valeur[cle]), objet);
}

const CHAMPS_COMMUNS = [
  ["name", (valeur) => typeof valeur === "string" && valeur.trim() !== ""],
  ["meta.contractVersion", (valeur) => typeof valeur === "string" && valeur !== ""],
  ["props", estObjet],
  ["structure", estObjet],
  ["structure.children", Array.isArray],
  ["tokensUsed", Array.isArray],
];

const CHAMPS_VERSION_4 = [
  ["meta.exportedAt", (valeur) => typeof valeur === "string" && valeur !== ""],
  ["meta.figma", estObjet],
  ["meta.warnings", Array.isArray],
  ["stateModel", (valeur) => valeur === null || estObjet(valeur)],
  ["rendering.roles", estObjet],
  ["icons", estObjet],
  ["composes", Array.isArray],
  ["structure.variantAxes", Array.isArray],
  ["structure.variantTokens", estObjet],
  ["structure.variantStrokes", estObjet],
  ["intent", (valeur) => valeur === null || estObjet(valeur)],
];

/** Majeure numérique d'une version, ou null si elle est illisible. */
function versionMajeure(contrat) {
  const majeure = Number.parseInt(String(contrat?.meta?.contractVersion).split(".")[0], 10);
  return Number.isInteger(majeure) ? majeure : null;
}

/** Valide les cibles de visibilité imbriquées d'un arbre de slots. */
function validerVisibilites(children, prefixe, invalides) {
  for (const [index, child] of (Array.isArray(children) ? children : []).entries()) {
    if (!estObjet(child)) continue;
    const chemin = `${prefixe}[${index}]`;
    if (
      child.visibilityTargets !== undefined
      && (
        !Array.isArray(child.visibilityTargets)
        || child.visibilityTargets.some((target) => (
          !estObjet(target)
          || typeof target.visibilityProp !== "string"
          || target.visibilityProp.trim() === ""
          || !Array.isArray(target.figmaPath)
          || target.figmaPath.length === 0
          || target.figmaPath.some(
            (segment) => typeof segment !== "string" || segment.trim() === "",
          )
        ))
      )
    ) {
      invalides.push(`${chemin}.visibilityTargets`);
    }
    validerVisibilites(child.children, `${chemin}.children`, invalides);
  }
}

/** Vrai pour une chaîne renseignée. */
function estTexte(valeur) {
  return typeof valeur === "string" && valeur.trim() !== "";
}

/**
 * Valide les champs optionnels des icônes.
 *
 * `slot` est vérifié CONTRE les slots réels : c'est lui qui situe une icône que
 * le variant de référence ne contient pas, donc absente de `children`. Un slot
 * qui n'existe nulle part la rendrait impossible à placer — exactement le
 * silence que ce champ existe pour supprimer.
 */
function validerIcones(icons, children, invalides) {
  const slots = new Set(
    (Array.isArray(children) ? children : [])
      .filter((child) => estObjet(child) && estTexte(child.slot))
      .map((child) => child.slot),
  );

  for (const [cle, icon] of Object.entries(estObjet(icons) ? icons : {})) {
    if (
      icon?.variants !== undefined
      && (
        !Array.isArray(icon.variants)
        || icon.variants.length === 0
        || icon.variants.some((variant) => (
          !estObjet(variant)
          || Object.keys(variant).length === 0
          || Object.values(variant).some(
            (valeur) => typeof valeur !== "string" || valeur.trim() === "",
          )
        ))
      )
    ) {
      invalides.push(`icons.${cle}.variants`);
    }
    if (icon?.slot !== undefined && (!estTexte(icon.slot) || !slots.has(icon.slot))) {
      invalides.push(`icons.${cle}.slot`);
    }
    if (icon?.size !== undefined && !estTexte(icon.size)) {
      invalides.push(`icons.${cle}.size`);
    }
  }
}

/**
 * Valide la forme de chaque prop, et pas seulement celle du bloc `props`.
 *
 * Sans ce contrôle, une prop `enum` sans `values` traversait le garde-fou au
 * vert, puis faisait lever une `TypeError` au générateur de types — un plantage
 * de script au lieu d'un diagnostic, alors que l'ordre voulu est justement
 * « diagnostiquer avant de produire ». Le défaut appartient à l'export : c'est
 * ici qu'il doit être nommé.
 *
 * On vérifie aussi que le défaut d'un enum fait partie de ses valeurs : un
 * défaut hors liste rend le composant impossible à typer sans le trahir.
 */
function validerProps(props, invalides) {
  for (const [nom, prop] of Object.entries(estObjet(props) ? props : {})) {
    if (!estObjet(prop) || typeof prop.type !== "string" || prop.type === "") {
      invalides.push(`props.${nom}.type`);
      continue;
    }
    if (prop.type !== "enum") continue;
    if (
      !Array.isArray(prop.values)
      || prop.values.length === 0
      || prop.values.some((valeur) => typeof valeur !== "string" || valeur.trim() === "")
    ) {
      invalides.push(`props.${nom}.values`);
      continue;
    }
    if (prop.default !== undefined && !prop.values.includes(prop.default)) {
      invalides.push(`props.${nom}.default`);
    }
  }
}

/**
 * Retourne les champs absents ou mal formés pour la version déclarée.
 *
 * La 4.0 a ajouté des blocs que le code consomme directement. Les accepter
 * implicitement comme `{}` ou `[]` transformerait un export tronqué en faux
 * contrat simple.
 */
export function champsInvalidesDuContrat(contrat) {
  const champs = [
    ...CHAMPS_COMMUNS,
    ...(versionMajeure(contrat) >= 4 ? CHAMPS_VERSION_4 : []),
  ];
  const invalides = champs
    .filter(([chemin, valide]) => !valide(lire(contrat, chemin)))
    .map(([chemin]) => chemin);

  validerProps(contrat?.props, invalides);
  validerVisibilites(contrat?.structure?.children, "structure.children", invalides);
  validerIcones(contrat?.icons, contrat?.structure?.children, invalides);
  return invalides;
}

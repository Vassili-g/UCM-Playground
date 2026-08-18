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
  ["intent", (valeur) => valeur === null || estObjet(valeur)],
];

const CHAMPS_INDEX_HISTORIQUES = [
  ["structure.variantTokens", estObjet],
  ["structure.variantStrokes", estObjet],
];

const CHAMPS_VERSION_8 = [
  ["meta.diagnostics", Array.isArray],
  ["meta.coverage", estObjet],
  ["variants", Array.isArray],
];

const CHAMPS_VERSION_8_SEULE = [
  ["propertyBindings", Array.isArray],
];

const CHAMPS_VERSION_9 = [
  ["variantViews", estObjet],
  ["propertyBindingDefinitions", estObjet],
];

/** Majeure numérique d'une version, ou null si elle est illisible. */
function versionMajeure(contrat) {
  const majeure = Number.parseInt(String(contrat?.meta?.contractVersion).split(".")[0], 10);
  return Number.isInteger(majeure) ? majeure : null;
}

/** Vrai si le schéma déclaré atteint une version majeure/mineure donnée. */
function versionAuMoins(contrat, majeureAttendue, mineureAttendue) {
  const resultat = /^(\d+)\.(\d+)$/.exec(String(contrat?.meta?.contractVersion));
  if (!resultat) return false;
  const majeure = Number(resultat[1]);
  const mineure = Number(resultat[2]);
  return majeure > majeureAttendue
    || (majeure === majeureAttendue && mineure >= mineureAttendue);
}

/**
 * Ce que la version déclarée autorise, relevé une seule fois.
 *
 * Chaque champ répond à « cette version publie-t-elle ce champ ». Les passer un
 * par un finissait par faire six paramètres positionnels à chaque validateur,
 * et un appel dans le mauvais ordre y serait passé inaperçu.
 */
function capacitesDuContrat(contrat) {
  return {
    recursion43: versionAuMoins(contrat, 4, 3),
    flex44: versionAuMoins(contrat, 4, 4),
    // La 4.7 introduit `sizing` et `size` ; seule la forme du dimensionnement
    // change en 4.8, les côtés nommés d'un `size` restant identiques. La 5.2
    // n'en change pas les clés non plus, seulement les valeurs qu'un axe accepte.
    dimensionnement: versionAuMoins(contrat, 4, 7),
    // La 5.3 ajoute `bounds` au composant et à chaque slot. Facultatif là où
    // `sizing` est requis : une absence de borne est une information complète,
    // alors qu'un comportement absent resterait à deviner.
    bornes53: versionAuMoins(contrat, 5, 3),
    // La 5.4 publie le passage à la ligne, sur le composant comme sur ses slots
    // conteneurs. Additif : un composant qui ne déborde pas produit le même JSON.
    wrap54: versionAuMoins(contrat, 5, 4),
    // La 6.0 décrit deux dispositions que le contrat se contentait d'avertir.
    grille60: versionAuMoins(contrat, 6, 0),
    absolu60: versionAuMoins(contrat, 6, 0),
    // La 7.0 donne à la grille ce qui décide vraiment de la boîte d'un enfant :
    // la taille de ses pistes, et la cellule où chacun s'ancre.
    pistes70: versionAuMoins(contrat, 7, 0),
    // La 10.0 conserve les pistes FIXED en pixels, autorise les groupes par
    // côté clairsemés et situe chaque peinture dans la vue exacte.
    pistesFixes10: versionAuMoins(contrat, 10, 0),
    cotesPartiels10: versionAuMoins(contrat, 10, 0),
    peinturesSituees10: versionAuMoins(contrat, 10, 0),
  };
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

/** Même enveloppe stricte que les références produites par l'Exporter. */
function estReferenceToken(valeur) {
  return typeof valeur === "string" && /^\{[^{}\s]+\.[^{}\s]+\}$/.test(valeur);
}

/** Une typographie est un text style nommé ou un groupe non vide de références. */
function typographieValide(typography) {
  return estTexte(typography)
    || (
      estObjet(typography)
      && Object.keys(typography).length > 0
      && Object.values(typography).every(estTexte)
    );
}

const JUSTIFY_CONTENT = new Set([
  "flex-start",
  "center",
  "flex-end",
  "space-between",
]);
const ALIGN_ITEMS = new Set(["flex-start", "center", "flex-end", "baseline"]);
const ALIGN_SELF = new Set(["flex-start", "center", "flex-end", "stretch"]);

/**
 * La 4.4 ajoute les deux axes d'un auto-layout, qui forment une paire Figma.
 * Leur absence commune reste valide : un node sans auto-layout linéaire ne les
 * possède pas. En revanche, un seul axe rend le placement des enfants ambigu.
 */
function validerConteneurFlex(container, prefixe, invalides, flex44) {
  const hasJustify = container?.justifyContent !== undefined;
  const hasAlign = container?.alignItems !== undefined;
  if (!flex44) {
    if (hasJustify) invalides.push(`${prefixe}.justifyContent`);
    if (hasAlign) invalides.push(`${prefixe}.alignItems`);
    return;
  }
  if (hasJustify && !JUSTIFY_CONTENT.has(container.justifyContent)) {
    invalides.push(`${prefixe}.justifyContent`);
  }
  if (hasAlign && !ALIGN_ITEMS.has(container.alignItems)) {
    invalides.push(`${prefixe}.alignItems`);
  }
  if (hasJustify && !hasAlign) invalides.push(`${prefixe}.alignItems`);
  if (hasAlign && !hasJustify) invalides.push(`${prefixe}.justifyContent`);
}

/**
 * Le passage à la ligne et l'espace entre les lignes, introduits par la 5.4.
 *
 * `wrap` ne vaut que `true` : le contrat ne publie que les exceptions, et une
 * absence dit déjà « une seule ligne ». `rowGap` n'a de sens que sous `wrap`, et
 * son absence y vaut le `gap` — comme dans Figma, comme en CSS.
 */
function validerWrap(container, prefixe, invalides, capacites) {
  const aWrap = container?.wrap !== undefined;
  const aRowGap = container?.rowGap !== undefined && container.rowGap !== null;
  if (!capacites.wrap54) {
    if (aWrap) invalides.push(`${prefixe}.wrap`);
    if (aRowGap) invalides.push(`${prefixe}.rowGap`);
    return;
  }
  if (aWrap && container.wrap !== true) invalides.push(`${prefixe}.wrap`);
  if (aRowGap && !estTexte(container.rowGap)) invalides.push(`${prefixe}.rowGap`);
  // Une grille a des LIGNES sans passer à la ligne : son `rowGap` les espace, et
  // exiger `wrap` à côté refuserait toute grille correctement tokenisée.
  if (aRowGap && !aWrap && !estGrille(container, capacites)) {
    invalides.push(`${prefixe}.rowGap`);
  }
}

/** Vrai pour un conteneur que le contrat décrit comme une grille (6.0). */
function estGrille(container, capacites) {
  return Boolean(capacites.grille60) && container?.layout === "grid";
}

/** Vrai pour un entier positif : un nombre de pistes, une place dans la grille. */
function estEntierPositif(valeur) {
  return Number.isInteger(valeur) && valeur >= 1;
}

/**
 * Une piste de grille : comportement CSS en 7.0, puis valeur structurelle FIXED
 * en pixels en 10.0. `auto` reste le repli explicite d'une piste API illisible.
 */
function pisteValide(piste, pistesFixes10) {
  if (!pistesFixes10) return piste === null || estTexte(piste);
  return typeof piste === "string" && (
    /^\d+(?:\.\d+)?fr$/.test(piste)
    || piste === "fit-content(100%)"
    || /^\d+(?:\.\d+)?px$/.test(piste)
    || piste === "auto"
  );
}

/**
 * La grille de la 6.0, complétée par ses pistes en 7.0.
 *
 * Les champs de grille sont refusés hors d'une grille : ils y décriraient une
 * disposition que `layout` contredit. `columns` et `rows` restent facultatifs —
 * Figma ne les expose pas toujours — mais un tableau de pistes qui ne compte pas
 * autant d'entrées que de pistes annoncées décrirait une autre grille.
 */
function validerGrille(container, prefixe, invalides, capacites) {
  const CHAMPS = ["columns", "rows", "columnGap", "columnSizes", "rowSizes"];
  if (!estGrille(container, capacites)) {
    // `null` n'affirme rien — c'est la convention du contrat partout ailleurs,
    // et `rowGap` est déjà lu ainsi. Seule une VALEUR décrirait ici une grille
    // que `layout` contredit.
    for (const champ of CHAMPS) {
      const valeur = container?.[champ];
      if (valeur !== undefined && valeur !== null) invalides.push(`${prefixe}.${champ}`);
    }
    return;
  }
  for (const champ of ["columns", "rows"]) {
    if (container[champ] !== undefined && !estEntierPositif(container[champ])) {
      invalides.push(`${prefixe}.${champ}`);
    }
  }
  if (
    container.columnGap !== undefined
    && container.columnGap !== null
    && !estTexte(container.columnGap)
  ) {
    invalides.push(`${prefixe}.columnGap`);
  }
  for (const [champ, compte] of [["columnSizes", "columns"], ["rowSizes", "rows"]]) {
    const pistes = container[champ];
    if (pistes === undefined) continue;
    if (
      !capacites.pistes70
      || !Array.isArray(pistes)
      || pistes.length === 0
      || !pistes.every((piste) => pisteValide(piste, capacites.pistesFixes10))
      || (estEntierPositif(container[compte]) && pistes.length !== container[compte])
    ) {
      invalides.push(`${prefixe}.${champ}`);
    }
  }
}

const CONTRAINTES_HORIZONTALES = new Set(["left", "center", "right", "stretch", "scale"]);
const CONTRAINTES_VERTICALES = new Set(["top", "center", "bottom", "stretch", "scale"]);

/**
 * Place d'un slot que le flux Flex ne décrit pas : sa cellule de grille (6.0,
 * complétée par les ancres en 7.0) ou ses bords d'accroche hors flux (6.0).
 *
 * Les ancres sont comptées à partir de 1, comme `grid-column-start` : c'est ce
 * qui permet de les poser telles quelles, sans retraduire l'indexation de Figma.
 */
function validerPlacement(child, chemin, invalides, capacites) {
  for (const champ of ["columnSpan", "rowSpan"]) {
    if (child[champ] !== undefined && (!capacites.grille60 || !estEntierPositif(child[champ]))) {
      invalides.push(`${chemin}.${champ}`);
    }
  }
  for (const champ of ["columnStart", "rowStart"]) {
    if (child[champ] !== undefined && (!capacites.pistes70 || !estEntierPositif(child[champ]))) {
      invalides.push(`${chemin}.${champ}`);
    }
  }
  if (child.justifySelf !== undefined && (!capacites.grille60 || !ALIGN_SELF.has(child.justifySelf))) {
    invalides.push(`${chemin}.justifySelf`);
  }
  if (child.position !== undefined && (!capacites.absolu60 || child.position !== "absolute")) {
    invalides.push(`${chemin}.position`);
  }
  if (child.constraints !== undefined) {
    const contraintes = child.constraints;
    if (
      !capacites.absolu60
      || !estObjet(contraintes)
      || !CONTRAINTES_HORIZONTALES.has(contraintes.horizontal)
      || !CONTRAINTES_VERTICALES.has(contraintes.vertical)
    ) {
      invalides.push(`${chemin}.constraints`);
    }
  }
}

/** Les exceptions de flux d'un slot direct sont introduites par la 4.4. */
function validerItemFlex(child, prefixe, invalides, flex44) {
  if (child.alignSelf !== undefined && (!flex44 || !ALIGN_SELF.has(child.alignSelf))) {
    invalides.push(`${prefixe}.alignSelf`);
  }
  if (child.flexGrow !== undefined && (!flex44 || child.flexGrow !== 1)) {
    invalides.push(`${prefixe}.flexGrow`);
  }
}

/**
 * Le dimensionnement du composant, dans les trois formes que ce repo accepte.
 *
 * La 4.8 emploie le vocabulaire CSS et les propriétés concernées ; la 4.7
 * portait les axes Figma. La 5.2 ouvre chaque axe à une référence de token,
 * pour la dimension figée qu'une variable nomme : elle décrit le composant au
 * lieu de présenter le component set. Un contrat déjà fusionné reste valide
 * dans sa version, comme la 4.2 le reste face à la récursion de la 4.3 : il
 * gagnera la forme courante à son prochain réexport.
 */
const SIZING_PAR_VERSION = {
  47: { cles: ["horizontal", "vertical"], valeurs: new Set(["fill", "hug"]), tokens: false },
  48: { cles: ["width", "height"], valeurs: new Set(["stretch", "fit-content"]), tokens: false },
  52: { cles: ["width", "height"], valeurs: new Set(["stretch", "fit-content"]), tokens: true },
};

/**
 * Le composant porte seul son dimensionnement, et le porte toujours.
 *
 * Ce champ est ce qui rend une absence lisible ailleurs : sans lui, un slot
 * sans `flexGrow` couvre aussi bien un contenu qui se suffit qu'une largeur
 * imposée. Les deux propriétés sont donc requises ensemble — une seule
 * laisserait l'autre à deviner.
 */
function validerSizingDuComposant(
  structure,
  invalides,
  formeAttendue,
  prefixe = "structure",
) {
  const sizing = structure?.sizing;
  if (!formeAttendue) {
    if (sizing !== undefined) invalides.push(`${prefixe}.sizing`);
    return;
  }
  const { cles, valeurs, tokens } = formeAttendue;
  const axeValide = (axe) => valeurs.has(axe) || (tokens && estReferenceToken(axe));
  if (!estObjet(sizing) || !cles.every((cle) => axeValide(sizing[cle]))) {
    invalides.push(`${prefixe}.sizing`);
  }
}

/**
 * Taille figée d'un slot : un carré garde la référence seule, sinon chaque
 * côté figé est nommé.
 *
 * Un objet vide décrirait un slot qui prétend porter une dimension sans en
 * donner aucune — l'ambiguïté même que ce champ sert à lever.
 */
function tailleValide(size, cotesNommes) {
  if (estReferenceToken(size)) return true;
  if (!cotesNommes || !estObjet(size)) return false;
  const cotes = Object.entries(size);
  return cotes.length > 0
    && cotes.every(([cote, valeur]) =>
      (cote === "width" || cote === "height") && estReferenceToken(valeur));
}

const CLES_DE_BORNES = new Set(["minWidth", "maxWidth", "minHeight", "maxHeight"]);

/**
 * Bornes de taille de la 5.3, sur le composant comme sur un slot.
 *
 * Elles ne se confondent pas avec `size` : une borne s'applique quel que soit le
 * menu de dimensionnement, et le cas courant est un layer qui remplit son axe
 * sans dépasser une largeur. Chaque côté est nommé et tokenisé — un objet vide
 * annoncerait des bornes sans en donner aucune, alors que le contrat omet
 * simplement le champ quand il n'en publie pas.
 */
function bornesValides(bounds) {
  if (!estObjet(bounds)) return false;
  const entrees = Object.entries(bounds);
  return entrees.length > 0
    && entrees.every(([cle, valeur]) => CLES_DE_BORNES.has(cle) && estReferenceToken(valeur));
}

/** Avant la 5.3, `bounds` n'existe pas : sa présence est une forme inconnue. */
function validerBornes(porteur, chemin, invalides, bornes53) {
  if (porteur?.bounds === undefined) return;
  if (!bornes53 || !bornesValides(porteur.bounds)) invalides.push(`${chemin}.bounds`);
}

/**
 * Valide l'arbre textuel introduit en 4.3.
 *
 * Chaque enfant récursif reste un vrai slot traçable. Un conteneur peut omettre
 * son layout lorsque Figma n'expose pas d'auto-layout applicable, mais il ne
 * peut pas porter en même temps une typographie qui n'appartiendrait qu'à une
 * de ses feuilles.
 */
function validerStructure(children, prefixe, invalides, capacites) {
  for (const [index, child] of (Array.isArray(children) ? children : []).entries()) {
    const chemin = `${prefixe}[${index}]`;
    if (!estObjet(child)) {
      invalides.push(chemin);
      continue;
    }
    if (!estTexte(child.slot)) invalides.push(`${chemin}.slot`);
    validerItemFlex(child, chemin, invalides, capacites.flex44);
    validerPlacement(child, chemin, invalides, capacites);
    if (child.size !== undefined && !tailleValide(child.size, capacites.dimensionnement)) {
      invalides.push(`${chemin}.size`);
    }
    validerDimensionsLaterales(child, chemin, invalides, capacites.cotesPartiels10);
    validerBornes(child, chemin, invalides, capacites.bornes53);
    validerWrap(child, chemin, invalides, capacites);
    validerGrille(child, chemin, invalides, capacites);
    if (child.typography !== undefined && !typographieValide(child.typography)) {
      invalides.push(`${chemin}.typography`);
    }

    if (child.children === undefined) {
      if (child.layout !== undefined) invalides.push(`${chemin}.layout`);
      if (child.gap !== undefined) invalides.push(`${chemin}.gap`);
      if (child.wrap !== undefined) invalides.push(`${chemin}.wrap`);
      if (child.justifyContent !== undefined) invalides.push(`${chemin}.justifyContent`);
      if (child.alignItems !== undefined) invalides.push(`${chemin}.alignItems`);
      continue;
    }
    validerConteneurFlex(child, chemin, invalides, capacites.flex44);
    if (!capacites.recursion43 || !Array.isArray(child.children) || child.children.length === 0) {
      invalides.push(`${chemin}.children`);
      continue;
    }
    if (child.typography !== undefined) invalides.push(`${chemin}.typography`);
    if (child.layout !== undefined && !layoutsAcceptes(capacites).has(child.layout)) {
      invalides.push(`${chemin}.layout`);
    }
    if (child.gap !== undefined && child.gap !== null && !estTexte(child.gap)) {
      invalides.push(`${chemin}.gap`);
    }
    validerStructure(child.children, `${chemin}.children`, invalides, capacites);
  }
}

/** Les dispositions qu'un conteneur peut annoncer ; la grille arrive en 6.0. */
function layoutsAcceptes(capacites) {
  return capacites.grille60 ? LAYOUTS_AVEC_GRILLE : LAYOUTS_FLEX;
}

const LAYOUTS_FLEX = new Set(["flex-row", "flex-column"]);
const LAYOUTS_AVEC_GRILLE = new Set(["flex-row", "flex-column", "grid"]);

const CHAMPS_TYPOGRAPHIQUES = new Set([
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
]);

/** Tous les chemins de slots réellement publiés par `structure.children`. */
function cheminsDeSlots(children, prefixe = [], resultat = new Set()) {
  for (const child of Array.isArray(children) ? children : []) {
    if (!estObjet(child) || !estTexte(child.slot)) continue;
    const chemin = [...prefixe, child.slot];
    resultat.add(JSON.stringify(chemin));
    cheminsDeSlots(child.children, chemin, resultat);
  }
  return resultat;
}

const COTES_RADIUS = new Set(["topLeft", "topRight", "bottomRight", "bottomLeft"]);
const COTES_PADDING_X = new Set(["left", "right"]);
const COTES_PADDING_Y = new Set(["top", "bottom"]);

function refsLateralesValides(valeur, cotes, partiels) {
  if (estReferenceToken(valeur)) return true;
  if (!estObjet(valeur)) return false;
  const entrees = Object.entries(valeur);
  return entrees.length > 0
    && (partiels || entrees.length === cotes.size)
    && entrees.every(([cote, ref]) => cotes.has(cote) && estReferenceToken(ref));
}

/** Valide radius et padding à toute profondeur, y compris leurs formes partielles v10. */
function validerDimensionsLaterales(porteur, prefixe, invalides, partiels) {
  if (
    porteur?.radius !== undefined
    && porteur.radius !== null
    && !refsLateralesValides(porteur.radius, COTES_RADIUS, partiels)
  ) invalides.push(`${prefixe}.radius`);

  if (porteur?.padding === undefined) return;
  const padding = porteur.padding;
  if (
    !estObjet(padding)
    || !Object.hasOwn(padding, "x")
    || !Object.hasOwn(padding, "y")
    || (padding.x !== null && !refsLateralesValides(padding.x, COTES_PADDING_X, partiels))
    || (padding.y !== null && !refsLateralesValides(padding.y, COTES_PADDING_Y, partiels))
  ) invalides.push(`${prefixe}.padding`);
}

/** La 4.6 retire toute ancienne description typographique portée par un slot. */
function refuserTypographiesDeSlots(children, prefixe, invalides) {
  for (const [index, child] of (Array.isArray(children) ? children : []).entries()) {
    if (!estObjet(child)) continue;
    const chemin = `${prefixe}[${index}]`;
    if (child.typography !== undefined) invalides.push(`${chemin}.typography`);
    refuserTypographiesDeSlots(child.children, `${chemin}.children`, invalides);
  }
}

/** Valide le catalogue de styles et renvoie ses clés exploitables. */
function validerTextStyles(textStyles, invalides) {
  const cles = new Set();
  for (const [cle, definition] of Object.entries(estObjet(textStyles) ? textStyles : {})) {
    const prefixe = `textStyles.${cle}`;
    if (!estTexte(cle) || !estObjet(definition)) {
      invalides.push(prefixe);
      continue;
    }
    cles.add(cle);
    if (!estTexte(definition.figmaName)) invalides.push(`${prefixe}.figmaName`);
    if (
      !estObjet(definition.tokens)
      || Object.keys(definition.tokens).length === 0
      || Object.entries(definition.tokens).some(
        ([champ, valeur]) => !CHAMPS_TYPOGRAPHIQUES.has(champ) || !estReferenceToken(valeur),
      )
    ) {
      invalides.push(`${prefixe}.tokens`);
    }
  }
  return cles;
}

/**
 * Valide l'arbre parallèle aux axes et les liens feuille → slot → style.
 * Comme les autres arbres de variantes, un set sans axe garde un niveau de
 * repli `variant` afin de ne perdre aucun variant.
 */
function validerVariantTypography(
  node,
  profondeur,
  profondeurAttendue,
  prefixe,
  slots,
  styles,
  stylesUtilises,
  invalides,
) {
  if (profondeur === profondeurAttendue) {
    if (!Array.isArray(node)) {
      invalides.push(prefixe);
      return;
    }
    const cheminsVus = new Set();
    for (const [index, usage] of node.entries()) {
      const chemin = `${prefixe}[${index}]`;
      if (
        !estObjet(usage)
        || !Array.isArray(usage.slotPath)
        || usage.slotPath.length === 0
        || usage.slotPath.some((segment) => !estTexte(segment))
      ) {
        invalides.push(`${chemin}.slotPath`);
        continue;
      }
      const cleChemin = JSON.stringify(usage.slotPath);
      if (!slots.has(cleChemin) || cheminsVus.has(cleChemin)) {
        invalides.push(`${chemin}.slotPath`);
      }
      cheminsVus.add(cleChemin);
      if (!estTexte(usage.style) || !styles.has(usage.style)) {
        invalides.push(`${chemin}.style`);
      } else {
        stylesUtilises.add(usage.style);
      }
    }
    return;
  }

  if (!estObjet(node) || Object.keys(node).length === 0) {
    invalides.push(prefixe);
    return;
  }
  for (const [cle, enfant] of Object.entries(node)) {
    if (!estTexte(cle)) invalides.push(`${prefixe}.${cle}`);
    validerVariantTypography(
      enfant,
      profondeur + 1,
      profondeurAttendue,
      `${prefixe}.${cle}`,
      slots,
      styles,
      stylesUtilises,
      invalides,
    );
  }
}

/**
 * La 4.5 place la font size de chaque taille dans `structure.sizes`.
 * Une font size sur un slot resterait celle du seul variant de référence et
 * contredirait la carte complète dès que les tailles divergent.
 */
function validerFontSizesParTaille(children, prefixe, invalides) {
  for (const [index, child] of (Array.isArray(children) ? children : []).entries()) {
    if (!estObjet(child)) continue;
    const chemin = `${prefixe}[${index}]`;
    if (estObjet(child.typography) && child.typography.fontSize !== undefined) {
      invalides.push(`${chemin}.typography.fontSize`);
    }
    validerFontSizesParTaille(child.children, `${chemin}.children`, invalides);
  }
}

/**
 * Valide les champs optionnels des icônes.
 *
 * `slot` est vérifié CONTRE les slots réels : c'est lui qui situe une icône que
 * le variant de référence ne contient pas, donc absente de `children`. Un slot
 * qui n'existe nulle part la rendrait impossible à placer — exactement le
 * silence que ce champ existe pour supprimer.
 */
function validerIcones(icons, children, props, invalides) {
  const slots = new Set(
    (Array.isArray(children) ? children : [])
      .filter((child) => estObjet(child) && estTexte(child.slot))
      .map((child) => child.slot),
  );

  for (const [cle, icon] of Object.entries(estObjet(icons) ? icons : {})) {
    if (icon?.policy === "modifiable") {
      const runtimeProp = icon.runtimeProp;
      const prop = estTexte(runtimeProp) && estObjet(props) ? props[runtimeProp] : null;
      if (!estTexte(runtimeProp) || !estObjet(prop) || !["icon", "instance-swap"].includes(prop.type)) {
        invalides.push(`icons.${cle}.runtimeProp`);
      }
    }
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

function validerTokensExacts(tokens, prefixe, invalides) {
  if (!estObjet(tokens)) return;
  for (const [cle, valeur] of Object.entries(tokens)) {
    if (!estTexte(cle) || !estReferenceToken(valeur)) invalides.push(`${prefixe}.${cle}`);
  }
}

function largeurDeStrokeValide(width, partiels = false) {
  if (width === null || estReferenceToken(width)) return true;
  if (!estObjet(width)) return false;
  const cotes = new Set(["top", "right", "bottom", "left"]);
  const entrees = Object.entries(width);
  return entrees.length > 0
    && (partiels || entrees.length === cotes.size)
    && entrees.every(([cote, valeur]) => cotes.has(cote) && estReferenceToken(valeur));
}

function validerStrokesExacts(strokes, prefixe, invalides, partiels = false) {
  if (!estObjet(strokes)) return;
  for (const [cle, stroke] of Object.entries(strokes)) {
    if (
      !estObjet(stroke)
      || !estReferenceToken(stroke.color)
      || !largeurDeStrokeValide(stroke.width, partiels)
      || ![null, "inside", "center", "outside"].includes(stroke.align)
    ) invalides.push(`${prefixe}.${cle}`);
  }
}

const TYPES_DE_PROPS_V8 = new Set([
  "enum", "boolean", "string", "icon", "instance-swap", "slot",
]);
const TYPES_DE_COMPOSANTS_FIGMA = new Set(["COMPONENT", "COMPONENT_SET"]);

function valeursPrefereesValides(valeurs) {
  return Array.isArray(valeurs) && valeurs.every((valeur) => (
    estObjet(valeur)
    && TYPES_DE_COMPOSANTS_FIGMA.has(valeur.type)
    && estTexte(valeur.key)
  ));
}

/** La v8 porte enfin les deux types de component properties jusque-là perdus. */
function validerPropsV8(props, invalides) {
  for (const [nom, prop] of Object.entries(estObjet(props) ? props : {})) {
    const prefixe = `props.${nom}`;
    if (!estObjet(prop) || !TYPES_DE_PROPS_V8.has(prop.type)) {
      invalides.push(`${prefixe}.type`);
      continue;
    }
    if (prop.type === "instance-swap") {
      if (prop.default !== null && !estTexte(prop.default)) invalides.push(`${prefixe}.default`);
      if (!valeursPrefereesValides(prop.preferredValues)) {
        invalides.push(`${prefixe}.preferredValues`);
      }
    }
    if (prop.type === "slot") {
      if (!["string", "boolean"].includes(typeof prop.default) && prop.default !== null) {
        invalides.push(`${prefixe}.default`);
      }
      if (!valeursPrefereesValides(prop.preferredValues)) {
        invalides.push(`${prefixe}.preferredValues`);
      }
      if (prop.settings !== undefined && !estObjet(prop.settings)) {
        invalides.push(`${prefixe}.settings`);
      }
    }
  }
}

function signatureDeValeurs(valeurs) {
  return JSON.stringify(
    Object.entries(estObjet(valeurs) ? valeurs : {}).sort(([gauche], [droite]) =>
      gauche.localeCompare(droite)),
  );
}

/** Valide un arbre racine portable sans les anciens arbres parallèles. */
function validerStructureDeVariant(structure, prefixe, invalides, capacites, formeDuSizing) {
  if (!estObjet(structure)) return;
  if (!layoutsAcceptes(capacites).has(structure.layout)) invalides.push(`${prefixe}.layout`);
  validerConteneurFlex(structure, prefixe, invalides, capacites.flex44);
  validerWrap(structure, prefixe, invalides, capacites);
  validerGrille(structure, prefixe, invalides, capacites);
  validerSizingDuComposant(structure, invalides, formeDuSizing, prefixe);
  validerDimensionsLaterales(structure, prefixe, invalides, capacites.cotesPartiels10);
  validerBornes(structure, prefixe, invalides, capacites.bornes53);
  if (!Array.isArray(structure.children)) invalides.push(`${prefixe}.children`);
  else validerStructure(structure.children, `${prefixe}.children`, invalides, capacites);
}

function validerPlacementsDePeinture(vue, prefixe, invalides, slots, requis) {
  if (!requis) return;
  const placements = vue?.paintPlacements;
  if (!estObjet(placements)) {
    invalides.push(`${prefixe}.paintPlacements`);
    return;
  }
  for (const champ of ["fills", "strokes"]) {
    const groupe = placements[champ];
    if (!estObjet(groupe)) {
      invalides.push(`${prefixe}.paintPlacements.${champ}`);
      continue;
    }
    for (const [cle, chemins] of Object.entries(groupe)) {
      const vus = new Set();
      if (
        !estTexte(cle)
        || !Array.isArray(chemins)
        || chemins.some((chemin) => {
          const signature = JSON.stringify(chemin);
          const valide = Array.isArray(chemin)
            && chemin.every(estTexte)
            && (chemin.length === 0 || slots.has(signature))
            && !vus.has(signature);
          vus.add(signature);
          return !valide;
        })
      ) invalides.push(`${prefixe}.paintPlacements.${champ}.${cle}`);
    }
  }
}

/** Valide une vue exacte, inline en v8 ou cataloguée en v9. */
function validerVueExacte(contrat, vue, prefixe, invalides, capacites, formeDuSizing) {
  if (!estObjet(vue)) {
    invalides.push(prefixe);
    return;
  }
  if (!estObjet(vue.structure)) invalides.push(`${prefixe}.structure`);
  else validerStructureDeVariant(
    vue.structure, `${prefixe}.structure`, invalides, capacites, formeDuSizing,
  );
  const slots = cheminsDeSlots(vue?.structure?.children);
  validerPlacementsDePeinture(
    vue,
    prefixe,
    invalides,
    slots,
    capacites.peinturesSituees10,
  );
  if (!Array.isArray(vue.typography)) invalides.push(`${prefixe}.typography`);
  else {
    for (const [usageIndex, usage] of vue.typography.entries()) {
      if (
        !estObjet(usage)
        || !Array.isArray(usage.slotPath)
        || !slots.has(JSON.stringify(usage.slotPath))
        || !estTexte(usage.style)
        || !Object.hasOwn(contrat.textStyles ?? {}, usage.style)
      ) invalides.push(`${prefixe}.typography[${usageIndex}]`);
    }
  }
  if (!Array.isArray(vue.composes)) invalides.push(`${prefixe}.composes`);
  else {
    for (const [composeIndex, compose] of vue.composes.entries()) {
      if (
        !estObjet(compose)
        || !estTexte(compose.component)
        || !estTexte(compose.figmaLayer)
        || (compose.visibilityProp !== undefined && !estTexte(compose.visibilityProp))
      ) invalides.push(`${prefixe}.composes[${composeIndex}]`);
    }
  }
  if (!estObjet(vue.icons)) invalides.push(`${prefixe}.icons`);
  else {
    for (const [iconKey, placement] of Object.entries(vue.icons)) {
      if (
        !Object.hasOwn(contrat.icons ?? {}, iconKey)
        || !estObjet(placement)
        || !estTexte(placement.figmaName)
        || !Array.isArray(placement.slotPath)
        || !slots.has(JSON.stringify(placement.slotPath))
      ) invalides.push(`${prefixe}.icons.${iconKey}`);
    }
  }
}

/** Cohérence de la projection portable exacte introduite en 8.0 et normalisée en 9.0. */
function validerVersion8(contrat, invalides, capacites, formeDuSizing) {
  validerPropsV8(contrat?.props, invalides);
  const version9 = versionMajeure(contrat) >= 9;
  const axes = Array.isArray(contrat?.structure?.variantAxes)
    ? contrat.structure.variantAxes
    : [];
  const variants = Array.isArray(contrat?.variants) ? contrat.variants : [];
  if (variants.length === 0) invalides.push("variants");
  const signatures = new Set();
  const vuesUtilisees = new Set();

  if (version9 && estObjet(contrat?.variantViews)) {
    for (const [viewId, vue] of Object.entries(contrat.variantViews)) {
      validerVueExacte(
        contrat,
        vue,
        `variantViews.${viewId}`,
        invalides,
        capacites,
        formeDuSizing,
      );
    }
  }

  for (const [index, variant] of variants.entries()) {
    const prefixe = `variants[${index}]`;
    if (!estObjet(variant)) {
      invalides.push(prefixe);
      continue;
    }
    if (!estTexte(variant.nodeId)) invalides.push(`${prefixe}.nodeId`);
    if (!estTexte(variant.figmaName)) invalides.push(`${prefixe}.figmaName`);
    if (
      !estObjet(variant.values)
      || Object.values(variant.values).some((valeur) => !estTexte(valeur))
      || new Set(Object.keys(variant.values)).size !== axes.length
      || axes.some((axe) => !Object.hasOwn(variant.values, axe))
    ) invalides.push(`${prefixe}.values`);
    // Deux nodes peuvent porter accidentellement les mêmes coordonnées Figma.
    // La v8 les conserve tous les deux dans l'ordre et le diagnostic de
    // l'Exporter nomme l'ambiguïté.
    signatures.add(signatureDeValeurs(variant.values));
    if (version9) {
      if (!estTexte(variant.view) || !Object.hasOwn(contrat.variantViews ?? {}, variant.view)) {
        invalides.push(`${prefixe}.view`);
      } else {
        vuesUtilisees.add(variant.view);
      }
      for (const legacyField of [
        "structure", "typography", "composes", "icons", "paintPlacements",
      ]) {
        if (variant[legacyField] !== undefined) invalides.push(`${prefixe}.${legacyField}`);
      }
    } else {
      validerVueExacte(contrat, variant, prefixe, invalides, capacites, formeDuSizing);
    }
    if (!estObjet(variant.tokens)) invalides.push(`${prefixe}.tokens`);
    else validerTokensExacts(variant.tokens, `${prefixe}.tokens`, invalides);
    if (!estObjet(variant.strokes)) invalides.push(`${prefixe}.strokes`);
    else validerStrokesExacts(
      variant.strokes,
      `${prefixe}.strokes`,
      invalides,
      capacites.cotesPartiels10,
    );
    if (capacites.peinturesSituees10 && version9) {
      const vue = contrat?.variantViews?.[variant.view];
      for (const [champ, feuilles] of [["fills", variant.tokens], ["strokes", variant.strokes]]) {
        const clesPlacees = Object.keys(vue?.paintPlacements?.[champ] ?? {}).sort();
        const clesFeuille = Object.keys(estObjet(feuilles) ? feuilles : {}).sort();
        if (JSON.stringify(clesPlacees) !== JSON.stringify(clesFeuille)) {
          invalides.push(`variantViews.${variant.view}.paintPlacements.${champ}`);
        }
      }
    }
  }

  if (version9 && estObjet(contrat?.variantViews)) {
    for (const viewId of Object.keys(contrat.variantViews)) {
      if (!vuesUtilisees.has(viewId)) invalides.push(`variantViews.${viewId}`);
    }
  }

  const enumProps = Object.entries(estObjet(contrat?.props) ? contrat.props : {})
    .filter(([name, prop]) => axes.includes(name) && estObjet(prop) && prop.type === "enum");
  for (const [index, variant] of variants.entries()) {
    for (const [name, prop] of enumProps) {
      const value = variant?.values?.[name];
      if (!estTexte(value) || !Array.isArray(prop.values) || !prop.values.includes(value)) {
        invalides.push(`variants[${index}].values.${name}`);
      }
    }
  }
  if (enumProps.length > 0) {
    const defaults = Object.fromEntries(enumProps.map(([name, prop]) => [name, prop.default]));
    const hasDefaultCombination = variants.some((variant) =>
      Object.entries(defaults).every(([name, value]) => variant?.values?.[name] === value));
    if (!hasDefaultCombination) invalides.push("variants.defaults");
  }

  if (version9) {
    const definitions = estObjet(contrat?.propertyBindingDefinitions)
      ? contrat.propertyBindingDefinitions
      : {};
    const definitionsUtilisees = new Set();
    for (const [definitionId, definition] of Object.entries(definitions)) {
      if (
        !estObjet(definition)
        || !estTexte(definition.prop)
        || !Object.hasOwn(contrat.props ?? {}, definition.prop)
        || !estTexte(definition.figmaPropName)
        || !new Set(["visible", "characters", "mainComponent"]).has(definition.target)
        || !Array.isArray(definition.figmaPath)
        || definition.figmaPath.some((segment) => !estTexte(segment))
      ) invalides.push(`propertyBindingDefinitions.${definitionId}`);
    }
    for (const [variantIndex, variant] of variants.entries()) {
      if (variant?.bindings === undefined) continue;
      if (!Array.isArray(variant.bindings)) {
        invalides.push(`variants[${variantIndex}].bindings`);
        continue;
      }
      for (const [bindingIndex, binding] of variant.bindings.entries()) {
        const prefixe = `variants[${variantIndex}].bindings[${bindingIndex}]`;
        if (
          !estObjet(binding)
          || !estTexte(binding.definition)
          || !Object.hasOwn(definitions, binding.definition)
          || !estTexte(binding.nodeId)
        ) invalides.push(prefixe);
        else definitionsUtilisees.add(binding.definition);
      }
    }
    for (const definitionId of Object.keys(definitions)) {
      if (!definitionsUtilisees.has(definitionId)) {
        invalides.push(`propertyBindingDefinitions.${definitionId}`);
      }
    }
  } else {
    const bindings = Array.isArray(contrat?.propertyBindings) ? contrat.propertyBindings : [];
    for (const [index, binding] of bindings.entries()) {
      const prefixe = `propertyBindings[${index}]`;
      if (
        !estObjet(binding)
        || !estTexte(binding.prop)
        || !Object.hasOwn(contrat.props ?? {}, binding.prop)
        || !estTexte(binding.figmaPropName)
        || !new Set(["visible", "characters", "mainComponent"]).has(binding.target)
        || !estTexte(binding.nodeId)
        || !Array.isArray(binding.figmaPath)
        || binding.figmaPath.some((segment) => !estTexte(segment))
        || !estObjet(binding.variant)
        || !signatures.has(signatureDeValeurs(binding.variant))
      ) invalides.push(prefixe);
    }
  }

  const diagnostics = Array.isArray(contrat?.meta?.diagnostics)
    ? contrat.meta.diagnostics
    : [];
  if (diagnostics.some((diagnostic) => (
    !estObjet(diagnostic)
    || !estTexte(diagnostic.code)
    || !new Set(["info", "warning", "error"]).has(diagnostic.severity)
    || !estTexte(diagnostic.message)
  ))) invalides.push("meta.diagnostics");
  if (
    !new Set(["complete", "partial"]).has(contrat?.meta?.coverage?.portable)
  ) invalides.push("meta.coverage");
}

/**
 * Retourne les champs absents ou mal formés pour la version déclarée.
 *
 * La 4.0 a ajouté des blocs que le code consomme directement. Les accepter
 * implicitement comme `{}` ou `[]` transformerait un export tronqué en faux
 * contrat simple.
 */
export function champsInvalidesDuContrat(contrat) {
  const major = versionMajeure(contrat);
  const champs = [
    ...CHAMPS_COMMUNS,
    ...(major >= 4 ? CHAMPS_VERSION_4 : []),
    ...(major >= 4 && major < 9 ? CHAMPS_INDEX_HISTORIQUES : []),
    ...(major >= 8 ? CHAMPS_VERSION_8 : []),
    ...(major === 8 ? CHAMPS_VERSION_8_SEULE : []),
    ...(major >= 9 ? CHAMPS_VERSION_9 : []),
  ];
  const invalides = champs
    .filter(([chemin, valide]) => !valide(lire(contrat, chemin)))
    .map(([chemin]) => chemin);

  if (major >= 9) {
    for (const legacyPath of [
      "propertyBindings",
      "structure.variantTokens",
      "structure.variantStrokes",
      "structure.variantTypography",
    ]) {
      if (lire(contrat, legacyPath) !== undefined) invalides.push(legacyPath);
    }
  }

  validerProps(contrat?.props, invalides);
  const capacites = capacitesDuContrat(contrat);
  const formeDuSizing = () => {
    if (versionAuMoins(contrat, 5, 2)) return SIZING_PAR_VERSION[52];
    return SIZING_PAR_VERSION[versionAuMoins(contrat, 4, 8) ? 48 : 47];
  };
  if (versionAuMoins(contrat, 8, 0)) {
    validerVersion8(contrat, invalides, capacites, formeDuSizing());
  }
  validerConteneurFlex(contrat?.structure, "structure", invalides, capacites.flex44);
  validerWrap(contrat?.structure, "structure", invalides, capacites);
  validerGrille(contrat?.structure, "structure", invalides, capacites);
  validerSizingDuComposant(
    contrat?.structure,
    invalides,
    capacites.dimensionnement ? formeDuSizing() : null,
  );
  validerDimensionsLaterales(
    contrat?.structure,
    "structure",
    invalides,
    capacites.cotesPartiels10,
  );
  validerBornes(contrat?.structure, "structure", invalides, capacites.bornes53);
  validerStructure(contrat?.structure?.children, "structure.children", invalides, capacites);
  if (
    versionAuMoins(contrat, 4, 5)
    && !versionAuMoins(contrat, 4, 6)
    && estObjet(contrat?.structure?.sizes)
  ) {
    validerFontSizesParTaille(contrat.structure.children, "structure.children", invalides);
  }
  if (versionAuMoins(contrat, 4, 6)) {
    if (!estObjet(contrat?.textStyles)) invalides.push("textStyles");
    if (major < 9 && !estObjet(contrat?.structure?.variantTypography)) {
      invalides.push("structure.variantTypography");
    }
    refuserTypographiesDeSlots(
      contrat?.structure?.children,
      "structure.children",
      invalides,
    );
    for (const [taille, dimensions] of Object.entries(
      estObjet(contrat?.structure?.sizes) ? contrat.structure.sizes : {},
    )) {
      validerDimensionsLaterales(
        dimensions,
        `structure.sizes.${taille}`,
        invalides,
        capacites.cotesPartiels10,
      );
      if (estObjet(dimensions) && dimensions.fontSize !== undefined) {
        invalides.push(`structure.sizes.${taille}.fontSize`);
      }
    }

    if (major >= 9 && estObjet(contrat?.textStyles) && estObjet(contrat?.variantViews)) {
      const styles = validerTextStyles(contrat.textStyles, invalides);
      const stylesUtilises = new Set();
      for (const vue of Object.values(contrat.variantViews)) {
        for (const usage of Array.isArray(vue?.typography) ? vue.typography : []) {
          if (estTexte(usage?.style)) stylesUtilises.add(usage.style);
        }
      }
      for (const style of styles) {
        if (!stylesUtilises.has(style)) invalides.push(`textStyles.${style}`);
      }
    } else if (estObjet(contrat?.textStyles) && estObjet(contrat?.structure?.variantTypography)) {
      const styles = validerTextStyles(contrat.textStyles, invalides);
      const stylesUtilises = new Set();
      validerVariantTypography(
        contrat.structure.variantTypography,
        0,
        Math.max(Array.isArray(contrat.structure.variantAxes)
          ? contrat.structure.variantAxes.length
          : 0, 1),
        "structure.variantTypography",
        cheminsDeSlots(contrat.structure.children),
        styles,
        stylesUtilises,
        invalides,
      );
      for (const style of styles) {
        if (!stylesUtilises.has(style)) invalides.push(`textStyles.${style}`);
      }
    }
  }
  validerVisibilites(contrat?.structure?.children, "structure.children", invalides);
  validerIcones(contrat?.icons, contrat?.structure?.children, contrat?.props, invalides);
  return invalides;
}

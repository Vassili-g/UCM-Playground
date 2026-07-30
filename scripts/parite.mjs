/**
 * Parité contrat ↔ code (cf. UCM-Exporter/ROADMAP.md, phase C2).
 *
 * Deux règles découlent de l'arbitrage des sources (UCM-Exporter/CONCEPT.md
 * §3) : **si le composant est implémenté**, toute prop déclarée par le contrat
 * existe dans son API publique et toute prop contractuelle BOOLEAN reste un
 * `boolean` effectivement lu par le composant. Figma fait foi sur ce qui est
 * rendu, le code s'aligne.
 *
 * Un nouveau contrat peut précéder son `.tsx` : cette absence est un état
 * d'avancement informatif, jamais un écart bloquant. Dès que le fichier
 * apparaît, la parité s'active automatiquement sans configuration.
 *
 * L'inverse n'est PAS un écart : un composant complète librement son API avec
 * des attributs natifs, des événements et des props d'accessibilité, qui ne
 * relèvent pas du contrat. Contrôler ce sens-là produirait des faux positifs
 * sur du code parfaitement conforme.
 *
 * L'API publique est lue par le **vérificateur de types** TypeScript, pas par
 * un parcours d'AST : lui seul résout les membres hérités, si bien qu'un
 * `interface ButtonProps extends ButtonHTMLAttributes<…>` ne fait apparaître
 * aucun écart imaginaire.
 *
 * Deux conventions du repo suffisent à relier un contrat à son code, sans
 * configuration : la co-localisation (`Button.contract.json` et `Button.tsx`
 * dans le même dossier) et le nom de l'interface (`<Nom>Props`).
 */
import ts from "typescript";
import { basename, dirname, join } from "node:path";
import { existsSync } from "node:fs";

/** Chemin du composant censé implémenter un contrat, par co-localisation. */
export function cheminDuComposant(cheminContrat) {
  const composant = basename(cheminContrat, ".contract.json");
  return join(dirname(cheminContrat), `${composant}.tsx`);
}

/** Nom de l'interface qui porte l'API publique — une seule règle, un seul endroit. */
export function nomInterfaceAttendue(fichierComposant) {
  return `${basename(fichierComposant, ".tsx")}Props`;
}

/** Nom textuel d'une clé de binding, quand elle est statiquement connaissable. */
function nomDeBinding(noeud) {
  return ts.isIdentifier(noeud) || ts.isStringLiteral(noeud) || ts.isNumericLiteral(noeud)
    ? noeud.text
    : null;
}

/** Recherche la fonction `<Nom>` qui implémente le composant co-localisé. */
function trouverFonctionComposant(source, nomComposant) {
  let fonction = null;
  ts.forEachChild(source, (noeud) => {
    if (ts.isFunctionDeclaration(noeud) && noeud.name?.text === nomComposant) {
      fonction = noeud;
      return;
    }
    if (!ts.isVariableStatement(noeud)) return;
    for (const declaration of noeud.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name)
        && declaration.name.text === nomComposant
        && declaration.initializer
        && (ts.isArrowFunction(declaration.initializer)
          || ts.isFunctionExpression(declaration.initializer))
      ) {
        fonction = declaration.initializer;
      }
    }
  });
  return fonction;
}

/** Vrai si un symbole local est réellement lu dans le corps du composant. */
function symboleLuDans(noeud, symbole, verificateur) {
  let lu = false;
  const visiter = (enfant) => {
    if (lu) return;
    if (ts.isIdentifier(enfant)) {
      // Dans `{ label }`, le symbole porté par l'identifiant est celui de la
      // propriété raccourcie ; TypeScript expose séparément le symbole de la
      // valeur locale réellement lue.
      const symboleValeur = ts.isShorthandPropertyAssignment(enfant.parent)
        ? verificateur.getShorthandAssignmentValueSymbol(enfant.parent)
        : verificateur.getSymbolAtLocation(enfant);
      if (symboleValeur === symbole) {
        lu = true;
        return;
      }
    }
    ts.forEachChild(enfant, visiter);
  };
  visiter(noeud);
  return lu;
}

/**
 * Relève les props effectivement consommées par la fonction du composant.
 * Le cas idiomatique `function Button({ disabled }: ButtonProps)` est résolu
 * par symbole ; `props.disabled`, `props["disabled"]` et `{...props}` sont
 * aussi acceptés pour ne pas imposer une seule écriture React.
 */
function propsConsommees(fonction, nomsProps, verificateur) {
  const consommees = new Set();
  const parametre = fonction?.parameters[0];
  if (!parametre || !fonction.body) return consommees;

  if (ts.isObjectBindingPattern(parametre.name)) {
    for (const element of parametre.name.elements) {
      if (element.dotDotDotToken || !ts.isIdentifier(element.name)) continue;
      const nom = nomDeBinding(element.propertyName ?? element.name);
      const symbole = verificateur.getSymbolAtLocation(element.name);
      if (nom && symbole && symboleLuDans(fonction.body, symbole, verificateur)) {
        consommees.add(nom);
      }
    }
    return consommees;
  }

  if (!ts.isIdentifier(parametre.name)) return consommees;
  const symboleParametre = verificateur.getSymbolAtLocation(parametre.name);
  if (!symboleParametre) return consommees;

  const estLeParametre = (expression) => (
    ts.isIdentifier(expression)
    && verificateur.getSymbolAtLocation(expression) === symboleParametre
  );
  const visiter = (noeud) => {
    if (ts.isPropertyAccessExpression(noeud) && estLeParametre(noeud.expression)) {
      consommees.add(noeud.name.text);
    } else if (
      ts.isElementAccessExpression(noeud)
      && estLeParametre(noeud.expression)
      && noeud.argumentExpression
      && ts.isStringLiteral(noeud.argumentExpression)
    ) {
      consommees.add(noeud.argumentExpression.text);
    } else if (
      (ts.isJsxSpreadAttribute(noeud) || ts.isSpreadAssignment(noeud))
      && estLeParametre(noeud.expression)
    ) {
      for (const nom of nomsProps) consommees.add(nom);
    }
    ts.forEachChild(noeud, visiter);
  };
  visiter(fonction.body);
  return consommees;
}

/**
 * Lit l'API publique de chaque composant en UN seul programme TypeScript :
 * son initialisation domine le coût, la répéter par composant multiplierait
 * la durée de la CI.
 *
 * Renvoie, pour chaque fichier, les noms et types de ses props publiques — ou `null`
 * quand l'interface attendue est introuvable, ce qui est un diagnostic et non
 * une absence de résultat.
 */
export function lireApiPublique(fichiers, racine) {
  const api = new Map();
  const existants = fichiers.filter((fichier) => existsSync(fichier));
  if (existants.length === 0) return api;

  const config = ts.readConfigFile(join(racine, "tsconfig.json"), ts.sys.readFile);
  const options = ts.parseJsonConfigFileContent(config.config, ts.sys, racine).options;
  const programme = ts.createProgram(existants, options);
  const verificateur = programme.getTypeChecker();

  for (const fichier of existants) {
    const source = programme.getSourceFile(fichier);
    const attendue = nomInterfaceAttendue(fichier);
    const nomComposant = basename(fichier, ".tsx");
    const fonction = trouverFonctionComposant(source, nomComposant);
    let props = null;

    ts.forEachChild(source, (noeud) => {
      if (!ts.isInterfaceDeclaration(noeud) || noeud.name.text !== attendue) return;
      const type = verificateur.getTypeAtLocation(noeud.name);
      const membres = verificateur.getPropertiesOfType(type);
      const consommees = propsConsommees(
        fonction,
        membres.map((membre) => membre.getName()),
        verificateur,
      );
      props = Object.fromEntries(
        membres.map((membre) => {
          const typeMembre = verificateur.getTypeOfSymbolAtLocation(
            membre,
            membre.valueDeclaration ?? noeud,
          );
          const typesSignificatifs = (typeMembre.isUnion() ? typeMembre.types : [typeMembre])
            // `undefined` vient naturellement du `?` d'une prop React. `null`,
            // lui, élargit réellement l'API et n'est donc pas un BOOLEAN pur.
            .filter((item) => !(item.flags & ts.TypeFlags.Undefined));
          const estBoolean = typesSignificatifs.length > 0 && typesSignificatifs.every(
            (item) => Boolean(item.flags & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)),
          );
          return [
            membre.getName(),
            {
              type: estBoolean ? "boolean" : "autre",
              typescript: verificateur.typeToString(typeMembre),
              utilisee: consommees.has(membre.getName()),
            },
          ];
        }),
      );
    });

    api.set(fichier, props);
  }

  return api;
}

/**
 * Compare un contrat à l'API relevée. `props` valant `undefined` signifie que
 * le fichier n'existe pas, `null` que l'interface y est absente : deux causes
 * distinctes, deux gestes correctifs distincts, donc deux verdicts.
 */
export function ecartsDeParite(contrat, props, nomInterface) {
  const vide = {
    implementationAbsente: false,
    interfaceAbsente: null,
    manquantes: [],
    typesIncorrects: [],
    booleensNonUtilises: [],
  };
  if (props === undefined) return { ...vide, implementationAbsente: true };
  if (props === null) return { ...vide, interfaceAbsente: nomInterface };

  const declarees = Object.entries(contrat?.props ?? {});
  const manquantes = declarees
    .map(([nom]) => nom)
    .filter((nom) => !(nom in props))
    .sort();
  const typesIncorrects = declarees
    .filter(([nom, prop]) => (
      nom in props
      && prop?.type === "boolean"
      && props[nom].type !== "boolean"
    ))
    .map(([nom]) => ({
      prop: nom,
      attendu: "boolean",
      recu: props[nom].typescript,
    }))
    .sort((a, b) => a.prop.localeCompare(b.prop));
  const booleensNonUtilises = declarees
    .filter(([nom, prop]) => (
      nom in props
      && prop?.type === "boolean"
      && props[nom].type === "boolean"
      && props[nom].utilisee !== true
    ))
    .map(([nom]) => nom)
    .sort();

  return { ...vide, manquantes, typesIncorrects, booleensNonUtilises };
}

/**
 * Seuls les écarts d'une implémentation existante bloquent la CI.
 * `implementationAbsente` reste dans le bilan pour informer la PR, mais un
 * contrat peut être versionné avant le début du développement React.
 */
export function pariteBloquante(ecarts) {
  return Boolean(ecarts.interfaceAbsente)
    || ecarts.manquantes.length > 0
    || ecarts.typesIncorrects.length > 0
    || ecarts.booleensNonUtilises.length > 0;
}

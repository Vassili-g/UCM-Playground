/**
 * Parité contrat ↔ code (cf. UCM-Exporter/ROADMAP.md).
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
 *
 * La parité est **récursive et exacte** pour un composé : déclarer une
 * dépendance dans `composes` ne suffit pas, le composant doit réellement la
 * rendre exactement autant de fois. Sans ce contrôle, une Alert pourrait
 * annoncer qu'elle embarque un Button, le redessiner à la main ou le rendre en
 * double — la composition ne serait plus qu'un commentaire.
 */
import ts from "typescript";
import { basename, dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { codeIdentifier } from "@ucm-kit/core/format";

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

/**
 * Fonction portée par une expression, à travers les emballages React usuels.
 *
 * `forwardRef(...)`, `memo(...)` et leurs combinaisons enveloppent la fonction
 * du composant dans un appel. On descend dans le premier argument qui EST une
 * fonction, sans connaître le nom de l'emballeur : une liste de noms connus
 * serait une liste à tenir à jour, et le jour où elle manque un cas, la parité
 * ne voit plus aucune prop ni aucune composition.
 */
function fonctionEmballee(noeud) {
  if (!noeud) return null;
  if (ts.isArrowFunction(noeud) || ts.isFunctionExpression(noeud)) return noeud;
  if (!ts.isCallExpression(noeud)) return null;
  for (const argument of noeud.arguments) {
    const fonction = fonctionEmballee(argument);
    if (fonction) return fonction;
  }
  return null;
}

/**
 * Recherche la fonction `<Nom>` qui implémente le composant co-localisé.
 *
 * La déclaration nommée l'emporte sur l'export par défaut : c'est elle que la
 * convention du repository rapproche du nom du fichier, l'export anonyme n'en
 * étant qu'une écriture possible.
 */
function trouverFonctionComposant(source, nomComposant) {
  let nommee = null;
  let parDefaut = null;

  ts.forEachChild(source, (noeud) => {
    if (ts.isFunctionDeclaration(noeud) && noeud.name?.text === nomComposant) {
      nommee = noeud;
      return;
    }
    if (ts.isExportAssignment(noeud) && !noeud.isExportEquals) {
      parDefaut = fonctionEmballee(noeud.expression);
      return;
    }
    if (!ts.isVariableStatement(noeud)) return;
    for (const declaration of noeud.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === nomComposant) {
        nommee = fonctionEmballee(declaration.initializer) ?? nommee;
      }
    }
  });

  return nommee ?? parDefaut;
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
 * Relève les composants rendus en JSX par la fonction du composant.
 *
 * Le contrat nomme le composant exporté. Le vérificateur TypeScript résout donc
 * un éventuel alias d'import ; pour un export `default`, la convention du
 * repository fait du nom local celui du composant et de son fichier.
 */
function composantsRendus(fonction, verificateur) {
  const rendus = new Map();
  const ajouter = (nom) => rendus.set(nom, (rendus.get(nom) ?? 0) + 1);
  const visiter = (noeud) => {
    if (ts.isJsxOpeningElement(noeud) || ts.isJsxSelfClosingElement(noeud)) {
      const balise = noeud.tagName;
      // Une balise minuscule est un élément HTML, jamais un composant.
      if (ts.isIdentifier(balise) && /^[A-Z]/.test(balise.text)) {
        let nom = balise.text;
        // Un import nommé renommé (`Button as Bouton`) doit compter pour le
        // composant exporté, jamais pour l'alias local : sinon importer un
        // autre composant sous le nom `Button` tromperait la parité.
        // Un export `default` n'a pas de nom canonique exploitable ; sa
        // convention est donc le nom local, identique à celui du fichier.
        const symbole = verificateur.getSymbolAtLocation(balise);
        if (symbole && symbole.flags & ts.SymbolFlags.Alias) {
          const nomOriginal = verificateur.getAliasedSymbol(symbole).getName();
          if (nomOriginal !== "default") nom = nomOriginal;
        }
        ajouter(nom);
      }
    }
    ts.forEachChild(noeud, visiter);
  };
  if (fonction?.body) visiter(fonction.body);
  return rendus;
}

/**
 * Lit l'API publique de chaque composant en UN seul programme TypeScript :
 * son initialisation domine le coût, la répéter par composant multiplierait
 * la durée de la CI.
 *
 * Renvoie, pour chaque fichier, ses props publiques et les composants qu'il
 * rend. `props` vaut `null` quand l'interface attendue est introuvable : c'est
 * un diagnostic, pas une absence de résultat.
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

    api.set(fichier, {
      props,
      // Sans fonction, il n'y a ni prop lue ni JSX à relever. Le dire est un
      // diagnostic ; le taire ferait passer un composant illisible pour un
      // composant qui n'utilise rien de son contrat.
      fonctionTrouvee: Boolean(fonction),
      composants: composantsRendus(fonction, verificateur),
    });
  }

  return api;
}

/**
 * Compare un contrat au relevé du code. Un relevé `undefined` signifie que le
 * fichier n'existe pas, un `props` à `null` que l'interface y est absente :
 * deux causes distinctes, deux gestes correctifs, donc deux verdicts.
 */
export function ecartsDeParite(contrat, releve, nomInterface) {
  const vide = {
    implementationAbsente: false,
    interfaceAbsente: null,
    fonctionAbsente: null,
    manquantes: [],
    typesIncorrects: [],
    booleensNonUtilises: [],
    compositionsIncorrectes: [],
  };
  // Absence de relevé = absence de fichier. On l'accepte sous toutes ses
  // formes : un garde-fou ne doit pas lever là où il doit diagnostiquer.
  if (!releve) return { ...vide, implementationAbsente: true };

  const { props, composants = new Map(), fonctionTrouvee = true } = releve;
  if (props === null) return { ...vide, interfaceAbsente: nomInterface };
  // Tout ce qui suit se lit DANS la fonction du composant. Sans elle, chaque
  // prop paraîtrait non lue et chaque dépendance non rendue : un seul
  // diagnostic exact vaut mieux qu'une liste d'accusations fausses.
  if (!fonctionTrouvee) {
    return { ...vide, fonctionAbsente: contrat?.name ?? nomInterface };
  }

  // Parité récursive : chaque OCCURRENCE déclarée doit être réellement rendue.
  // Un Set laisserait un seul `<Button />` satisfaire deux slots distincts.
  const attendues = new Map();
  for (const dependance of contrat?.composes ?? []) {
    const component = dependance?.component;
    if (typeof component === "string") {
      attendues.set(component, (attendues.get(component) ?? 0) + 1);
    }
  }
  const compositionsIncorrectes = Array.from(attendues, ([component, attendu]) => ({
    component,
    attendu,
    // `component` conserve le nom Figma lisible ; le JSX emploie
    // l'identifiant de code canonique correspondant.
    rendu: composants.get(codeIdentifier(component)) ?? 0,
  }))
    .filter(({ attendu, rendu }) => rendu !== attendu)
    .sort((left, right) => left.component.localeCompare(right.component));

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

  return {
    ...vide,
    manquantes,
    typesIncorrects,
    booleensNonUtilises,
    compositionsIncorrectes,
  };
}

/**
 * Un écart de parité existe dès qu'une implémentation présente s'écarte de son
 * contrat. Il ne BLOQUE rien : le geste correctif appartient à un développeur,
 * jamais à l'export ni au designer qui l'a produit, et refuser sa pull request
 * arrêterait la seule personne incapable de la débloquer. L'écart se publie
 * donc comme un avertissement (cf. `check-contract.mjs`).
 *
 * `implementationAbsente` n'est même pas un écart : un contrat peut être
 * versionné avant le début du développement React.
 */
export function pariteEnEcart(ecarts) {
  return Boolean(ecarts.interfaceAbsente)
    || Boolean(ecarts.fonctionAbsente)
    || ecarts.manquantes.length > 0
    || ecarts.typesIncorrects.length > 0
    || ecarts.booleensNonUtilises.length > 0
    || ecarts.compositionsIncorrectes.length > 0;
}

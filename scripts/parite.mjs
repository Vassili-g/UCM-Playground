/**
 * Parité contrat ↔ code (cf. UCM-Exporter/ROADMAP.md, phase C2).
 *
 * Une seule règle, celle que l'arbitrage des sources rend non négociable
 * (UCM-Exporter/CONCEPT.md §3) : **si le composant est implémenté**, toute prop
 * déclarée par le contrat existe dans son API publique. Figma fait foi sur ce
 * qui est rendu, le code s'aligne.
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

/**
 * Lit l'API publique de chaque composant en UN seul programme TypeScript :
 * son initialisation domine le coût, la répéter par composant multiplierait
 * la durée de la CI.
 *
 * Renvoie, pour chaque fichier, la liste de ses props publiques — ou `null`
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
    let props = null;

    ts.forEachChild(source, (noeud) => {
      if (!ts.isInterfaceDeclaration(noeud) || noeud.name.text !== attendue) return;
      const type = verificateur.getTypeAtLocation(noeud.name);
      props = verificateur.getPropertiesOfType(type).map((membre) => membre.getName());
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
  const vide = { implementationAbsente: false, interfaceAbsente: null, manquantes: [] };
  if (props === undefined) return { ...vide, implementationAbsente: true };
  if (props === null) return { ...vide, interfaceAbsente: nomInterface };

  const declarees = Object.keys(contrat?.props ?? {});
  return { ...vide, manquantes: declarees.filter((prop) => !props.includes(prop)).sort() };
}

/**
 * Seuls les écarts d'une implémentation existante bloquent la CI.
 * `implementationAbsente` reste dans le bilan pour informer la PR, mais un
 * contrat peut être versionné avant le début du développement React.
 */
export function pariteBloquante(ecarts) {
  return Boolean(ecarts.interfaceAbsente) || ecarts.manquantes.length > 0;
}

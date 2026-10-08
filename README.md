# UCM Playground

Application React de recette pour [UCM Toolkit](https://github.com/Vassili-g/UCM-Toolkit).
Elle affiche des composants reconstruits à froid depuis leurs contrats Figma.
La comparaison avec la maquette sert à repérer les informations manquantes
ou ambiguës dans ces contrats.

Les composants sont jetables. Les règles de reconstruction et de correction
sont dans [AGENTS.md](./AGENTS.md).

## Démarrer

Avec Node 22, comme la CI :

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Renseignez `VITE_FA_KIT_ID` dans `.env.local` avant la comparaison visuelle.
Sans ce kit Font Awesome, les icônes restent vides. Si le kit n'est pas
disponible, notez que les icônes n'ont pas été jugées.

| Commande | Résultat |
|---|---|
| `npm run dev` | Génère le CSS des tokens et ouvre le serveur Vite |
| `npm run build` | Génère le CSS, vérifie les types et construit l'application |
| `npm run preview` | Sert le bundle déjà construit |
| `npx --no-install ucm check --report ci-report.md` | Contrôle les exports avec le CLI installé |

## Corpus présent

| Composant | Cas de recette |
|---|---|
| `Button` | Variantes et états d'un bouton |
| `TileLink` | Tuile de navigation |
| `Alert` | Composition de `Button` dans l'action |
| `StressTest` | Structures variables, imbrication, grilles et placement absolu |

Les quatre contrats sont en **13.0**. Le fichier de tokens est au format **2**.
Le CLI est épinglé en **0.1.50** dans [package.json](./package.json) et dans le
[workflow](./.github/workflows/ucm.yml). Ces versions décrivent le corpus de
recette ; elles peuvent différer du build de Toolkit.

```text
src/components/<Nom>/   contrat Figma et implémentation jetable
src/tokens/tokens.json   tokens exportés depuis Figma
src/generated/          CSS généré à chaque dev et build
src/App.tsx             variantes présentées dans la galerie
ucm.config.json         chemins des exports et configuration des modes
.ucm/conventions.md     stack et points d'intégration
```

La galerie propose les marques `intencial` et `marque-2` par `data-brand`
sur `<html>`. La configuration associe cet attribut à l'axe
`color-brand-tokens`. Elle ne déclare pas d'axe de thème clair/sombre.

## Reconstruire un composant à froid, puis le regarder

1. Sur une branche de recette, supprimez l'implémentation du composant choisi.
   Gardez son contrat et ses dépendances. Le protocole s'arrête si le fichier
   à reconstruire existe encore.
2. Lancez le relais `ucm-implementer`. Il appelle `ucm guide` sur le contrat
   et lit [.ucm/conventions.md](./.ucm/conventions.md). L'agent n'ouvre ni
   l'ancienne implémentation, ni l'historique, ni la maquette.
3. Présentez le résultat dans `src/App.tsx`, avec les variantes du contrat.
   Lancez `npm run build`.
4. Lancez `npm run dev`, puis comparez chaque variante à Figma. Notez chaque
   écart avec la variante, la propriété et l'information disponible dans le contrat.

Le code produit est statique : il ne charge pas le contrat à l'exécution.
Les règles d'[AGENTS.md](./AGENTS.md#les-quatre-règles) interdisent de retoucher
les exports à la main ou de corriger un composant pour rendre la recette verte.
Un défaut se traite dans le produit, puis la reconstruction se rejoue depuis
un nouvel export.

## Ce que l'application fournit

| Élément | Emplacement et rôle |
|---|---|
| Police | `src/main.tsx` charge Open Sans en 400, 600 et 700 |
| Icônes | `src/Icone.tsx` reçoit le nom et la taille ; `index.html` charge le kit Font Awesome |
| Présentation | `src/galerie.tsx` fournit les sections et les commandes ; `src/index.css` habille la galerie |
| Tokens | `ucm tokens css` écrit la feuille ; les composants citent leurs variables CSS littéralement |

Aucun outillage de lecture ou de génération UCM ne s'écrit dans ce dépôt.
Il vient du CLI publié. Les conventions d'implémentation propres à cette
application restent dans [.ucm/conventions.md](./.ucm/conventions.md).

## Contrôles et limites

La CI lance le CLI à la version épinglée, écrit le rapport et le publie sur la
pull request. Mettez à jour ensemble le pin du workflow et celui de
`package.json` lors d'une évolution des dépendances.

Le [rapport UCM](https://github.com/Vassili-g/UCM-Toolkit/blob/main/packages/cli/README.md#what-the-report-says)
distingue les erreurs bloquantes des avertissements. Aucun adaptateur de stack
n'est installé ici : le contrôle ne compare donc pas l'API TypeScript au contrat.
Le build vérifie les types de l'application, sans prouver la fidélité visuelle.

Le réglage [.vscode/settings.json](./.vscode/settings.json) associe les contrats
au schéma du kit installé avec le CLI.

## Rejouer la recette depuis un dépôt vide

Suivez la [recette externe de Toolkit](https://github.com/Vassili-g/UCM-Toolkit/blob/main/docs/guides/RECETTE.md)
pour repartir de l'installation d'UCM et d'un export Figma.

Sans `tokens.json`, la génération CSS écrit une feuille vide tant qu'aucun
contrat ne cite de token. Elle refuse la construction dès qu'un contrat en cite un.

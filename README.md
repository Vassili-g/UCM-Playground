# UCM Playground

Une application React qui affiche des composants de design system reconstruits
depuis leurs contrats, et les tokens dont ils tirent leurs valeurs. Les contrats
sont exportés depuis Figma par
[UCM Contract Exporter](https://github.com/Vassili-g/UCM-Exporter).

Ce dépôt sert à répondre à une question : **un contrat est-il une modélisation
correcte du composant Figma dont il vient ?** La réponse s'obtient en faisant
reconstruire le composant à froid par un agent qui n'a que ce contrat sous les
yeux, puis en comparant le rendu obtenu à la maquette. La galerie existe pour
rendre cette comparaison possible.

Ce dépôt est aussi le consommateur de recette du projet UCM. Aucun outillage UCM
ne s'y écrit : rien ici ne valide, ne génère ni n'interprète un contrat. Le
contrôle revient à la CI, qui installe le paquet publié le temps de son
exécution. Cette absence d'outillage local est ce qui rend la recette probante.

## Démarrer

```sh
npm install
cp .env.example .env.local   # puis y mettre son identifiant de kit Font Awesome
npm run dev
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Génère les variables CSS depuis `tokens.json`, puis sert la galerie |
| `npm run build` | Les mêmes variables, le contrôle de types, puis le bundle |
| `npm run preview` | Sert le bundle construit |

Sans `.env.local`, aucun glyphe ne se peint et les carrés d'icône restent vides.
À l'œil, le résultat ressemble à un contrat qui aurait oublié ses icônes. Poser
la variable avant toute comparaison, ou écrire dans le compte rendu que les
icônes n'ont pas été jugées.

## Ce que contient le dépôt

```text
src/components/Button/
  Button.contract.json   exporté depuis Figma, jamais écrit à la main
  Button.tsx             le composant, reconstruit depuis ce seul contrat
src/tokens/tokens.json   les variables du design system, au format DTCG
ucm.config.json          où sont les contrats, les tokens, les implémentations
```

Quatre composants sont en place : `Button`, `TileLink`, `Alert` et
`StressTest`. `Alert` compose `Button` dans son emplacement d'action, ce qui
soumet le corpus au contrôle de composition. `StressTest` porte une structure
différente par variante, avec imbrication, grilles, retour à la ligne et
position absolue. `src/App.tsx` les assemble en une galerie où chaque variante
se pilote à l'écran.

Un contrat décrit la partie visuelle d'un composant telle qu'elle existe dans
Figma : ses variantes, sa structure, ses tokens, ses icônes, ses règles d'usage.
Il ne contient ni valeur de couleur ni dimension en dur, seulement des
références vers `tokens.json`. Sa forme complète est décrite par
[docs/FORMAT.md](https://github.com/Vassili-g/UCM-Exporter/blob/main/docs/FORMAT.md).

`ucm.config.json` déclare ces emplacements pour le plugin et pour la CI.
`style-dictionary.config.mjs` lit les tokens au même endroit sans consulter ce
fichier. Déplacer les tokens demande donc de corriger la source de Style
Dictionary dans le même geste ; sans cette correction, la construction ne
produit aucune variable et n'en dit pas la raison.

## Reconstruire un composant à froid, puis le regarder

C'est l'usage principal de ce dépôt. La boucle tient en quatre gestes.

### 1. Supprimer l'implémentation

```sh
rm src/components/Button/Button.tsx
```

Le protocole de reconstruction attend ce chemin absent, et il s'arrête en le
signalant s'il l'y trouve encore. Ouvrir une implémentation antérieure ruine la
mesure : le composant obtenu montrerait alors ce que son auteur précédent
savait, et non ce que le contrat publie.

### 2. Lancer la reconstruction

Le protocole est porté par la skill `consommer-contrat` d'`UCM-Exporter`, et il
n'a pas de copie ici. L'agent travaille depuis quatre sources : le contrat du
composant, les contrats des composants qu'il compose, les points d'intégration
décrits plus bas, et le code partagé qu'il faut pour les employer. Il n'ouvre ni
maquette, ni capture d'écran, ni historique Git.

Il produit une transcription statique du contrat. Le fichier écrit ne charge pas
le contrat et ne l'interprète pas à l'exécution.

### 3. Poser le composant dans la galerie

Dans `src/App.tsx`, une `<Section>`, ses `<Case>`, et les menus ou bascules qui
pilotent ses props. Le contrat énumère ses variantes une à une, donc les
combinaisons à offrir se lisent dans son champ `variants` plutôt que de se
deviner.

### 4. Comparer à la maquette, variante par variante

```sh
npm run dev
```

Ouvrir le composant dans Figma à côté de la galerie, puis parcourir les
combinaisons avec les menus. Chaque écart se note avec la variante et la
propriété concernées.

**Un écart accuse le contrat, l'export ou le moteur, jamais le composant.** Il
dit qu'une information nécessaire au rendu n'a pas été publiée, ou l'a été de
travers. Le geste correctif appartient au dépôt producteur, et la reconstruction
se rejoue à froid après le réexport. La même règle vaut pour une donnée que
l'agent n'a pas trouvée : une absence est un résultat de la reconstruction, à
rapporter avec le champ concerné.

## Ce que l'application fournit à un composant

Trois éléments viennent de l'application, et aucun contrat ne les porte. Ce sont
les points d'intégration que l'agent trouve sous la main.

**La police.** Les tokens nomment Open Sans. `src/main.tsx` la charge en local,
dans les trois graisses que le corpus emploie. Sans elle, les graisses et les
hauteurs de ligne ne se comparent pas à la maquette.

**Le kit Font Awesome.** Un contrat porte un nom d'icône opaque, et le kit le
résout en glyphe. `index.html` le charge depuis `VITE_FA_KIT_ID`.
`src/Icone.tsx` reçoit ce nom et une taille, puis lit la configuration publiée
par le kit pour savoir si l'icône vient du catalogue standard ou des dépôts du
kit. Cette liste ne s'entretient donc pas à la main.

**Le décor de la galerie.** `src/galerie.tsx` porte la grille, les étiquettes et
les bascules, et `src/index.css` leur habillage. Rien de ce décor n'habille un
composant, qui ne se peint qu'avec les tokens qu'il cite.

Le nom d'une variable CSS est le chemin de son token, en minuscules, tout le
reste devenant un tiret. `style-dictionary.config.mjs` porte cette règle et son
pourquoi ; un composant qui cite une référence l'applique en toutes lettres,
sans passer par un helper partagé. C'est cette écriture littérale qui rend la
comparaison avec le contrat possible.

## Les composants sont jetables

Chaque `.tsx` de `src/components/` est la sortie d'une reconstruction à froid,
donc la trace de ce que son contrat a suffi à produire. Ces fichiers ne forment
ni une bibliothèque ni du code de production : ils se jettent et se refont.

**On ne corrige jamais un composant pour obtenir du vert.** Si un contrôle
échoue ou si le rendu s'écarte de la maquette, la réponse est de corriger le
contrat, l'export ou le produit. Un composant retouché efface la preuve du
défaut, cesse de mesurer quoi que ce soit, et rend invisible ce qu'il signalait.

Les contrats et `tokens.json` ne se retouchent jamais à la main non plus. Un
fichier corrigé ici décrirait un composant que Figma ne contient pas.

[AGENTS.md](./AGENTS.md) donne les quatre règles du dépôt et ce que ce projet
laisse au choix d'un composant.

## Ce que la CI contrôle

`.github/workflows/ucm.yml` est écrit par `ucm init` et n'est jamais réécrit
par-dessus. À chaque pull request, il installe le CLI publié le temps de son
exécution, lui fait contrôler les contrats, puis publie son rapport en
commentaire de la pull request. Ce rapport est écrit pour le designer qui valide
l'export, et il n'y a jamais besoin d'ouvrir les journaux de la CI.

Six contrôles portent sur chaque contrat. Leur liste, leur verdict et le partage
entre ce qui bloque et ce qui avertit sont décrits par
[packages/cli/README.md](https://github.com/Vassili-g/UCM-Exporter/blob/main/packages/cli/README.md#what-the-report-says).

Aucun de ces contrôles ne compare un rendu à une maquette, et c'est ce que la
reconstruction à froid ajoute. Un seul d'entre eux dépend de ce dépôt : comparer
un contrat au code demande un adaptateur propre à la stack, installé par le
repository lui-même. `package.json` n'en déclare aucun, donc le rapport dit que
l'implémentation n'a pas été lue, et jamais qu'elle est conforme. Installer
[`@ucm-kit/adapter-typescript`](https://www.npmjs.com/package/@ucm-kit/adapter-typescript)
donnerait cette lecture, au prix d'une dépendance `@ucm-kit` que ce dépôt garde
volontairement absente.

## Valider un contrat dans l'éditeur

`.vscode/settings.json`, écrit par `ucm init`, associe `*.contract.json` au JSON
Schema du paquet installé. Le réglage reste inerte tant que le paquet n'est pas
présent dans `node_modules` :

```sh
npm install --no-save @ucm-kit/core
```

La CI n'en a pas besoin, puisqu'elle passe par `npx`.

## Rejouer la recette depuis un dépôt vide

La boucle complète, du plugin Figma jusqu'au rapport publié sur une pull
request, se rejoue en retirant le corpus et les cinq fichiers qu'`ucm init`
écrit. La marche à suivre est décrite par
[docs/RECETTE.md](https://github.com/Vassili-g/UCM-Exporter/blob/main/docs/RECETTE.md).

Tant que `tokens.json` est absent, Style Dictionary ne produit aucune variable
et la première ligne de `src/index.css` doit rester commentée. La décommenter
dès qu'un export a reposé le fichier.

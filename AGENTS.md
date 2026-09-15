# UCM Playground — guide agent

Ce dépôt est le consommateur de recette du projet
[UCM](https://github.com/Vassili-g/UCM-Exporter). Il sert à vérifier qu'un
repository sans aucune connaissance du produit peut consommer ses artefacts.

Lire d'abord [README.md](./README.md) pour ce que contient le dépôt.

## Les quatre règles

**1. Aucun outillage UCM ne s'écrit ici.** Rien dans ce dépôt ne valide, ne
génère ni n'interprète un contrat. Un contrôle qui manque se referme dans
`UCM-Exporter`, dans les paquets publiés, jamais par un script local. Une
seconde implémentation divergerait de la première. La copie non jetable
deviendrait alors la vérité.

**2. Les composants sont jetables, et on ne les corrige pas pour obtenir du
vert.** Chaque `.tsx` de `src/components/` est reconstruit à froid depuis son
seul contrat. Si un contrôle échoue, corriger le contrat, l'export ou le
produit. Un composant ajusté jusqu'à faire disparaître le rouge cesse de mesurer
quoi que ce soit.

**3. Les contrats et les tokens ne se retouchent jamais à la main.**
`*.contract.json` et `tokens.json` sont produits par un export depuis Figma. Un
fichier corrigé ici décrirait un composant que Figma ne contient pas.

**4. L'empreinte du produit se limite à ce qu'`ucm init` écrit et imprime.**
Les fichiers qu'il écrit : `ucm.config.json`, `.gitattributes`,
`.vscode/settings.json`, `.gitignore`, `.github/workflows/ucm.yml`, les deux
relais `ucm-implementer` et `.ucm/conventions.md`. Les lignes qu'il imprime :
`@ucm-kit/cli` en `devDependencies` et `ucm tokens css` en tête de `dev` et
`build`. La feuille `src/generated/tokens.css` en sort à chaque construction.
Cette empreinte bornée rend la recette probante : un autre repository part du
même état.

## Reconstruire un composant depuis son contrat

Le relais `.claude/skills/ucm-implementer/SKILL.md`, écrit par `ucm init`, lance
`ucm guide` sur le contrat. Le guide imprime la procédure, l'extraction du
contrat, les aides qu'il emploie et les conventions de ce dépôt. Les quatre
gestes de la boucle, de la suppression de l'implémentation à la comparaison avec
la maquette, sont décrits par
[README.md](./README.md#reconstruire-un-composant-à-froid-puis-le-regarder).

Deux d'entre eux tombent souvent. Supprimer le `.tsx` avant de commencer, sans
quoi le protocole s'arrête. Poser ensuite le composant dans `src/App.tsx` : une
reconstruction qui n'est pas regardée n'a mesuré que le contrôle de types.

Ce que le guide laisse au projet se décide dans `.ucm/conventions.md` : la stack,
les points d'intégration et la façon d'écrire une référence de token.

**Les icônes ont une précondition que rien n'annonce à l'écran.** Elles ne se
peignent qu'avec le kit Font Awesome que `index.html` charge depuis
`VITE_FA_KIT_ID`, une variable posée dans un `.env.local` non versionné (voir
`.env.example`). Sur un poste neuf elle est absente : les carrés d'icône restent
vides, et comparer une variante à la maquette conclurait à une icône manquante
alors que le contrat la décrit correctement. Poser la variable **avant** la
comparaison, ou écrire dans le compte rendu que les icônes n'ont pas été jugées.

## Vérification

```sh
npm run build
```

Il écrit la feuille des tokens avec `ucm tokens css`, contrôle les types, puis
construit le bundle. Les contrats, eux, sont contrôlés par la CI, qui installe
le CLI publié le temps de son exécution.

Après un vidage du dépôt pour rejouer la recette, `tokens.json` est absent :
`ucm tokens css` écrit alors une feuille vide tant qu'aucun contrat ne cite de
token, et refuse la construction dès qu'un contrat en cite un.

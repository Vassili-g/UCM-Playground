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

**4. L'empreinte du produit se limite aux cinq fichiers qu'`ucm init` écrit.**
`ucm.config.json`, `.gitattributes`, `.vscode/settings.json`, `.gitignore` et
`.github/workflows/ucm.yml`. Cette absence d'outillage local rend la recette
probante : un autre repository part du même état.

## Reconstruire un composant depuis son contrat

Le protocole est porté par `UCM-Exporter`, dans la skill `consommer-contrat`. Il
n'a pas de copie ici : ce dépôt ne doit rien apprendre du produit. Les quatre
gestes de la boucle, de la suppression de l'implémentation à la comparaison avec
la maquette, sont décrits par
[README.md](./README.md#reconstruire-un-composant-à-froid-puis-le-regarder).

Deux d'entre eux tombent souvent. Supprimer le `.tsx` avant de commencer, sans
quoi le protocole s'arrête. Poser ensuite le composant dans `src/App.tsx` : une
reconstruction qui n'est pas regardée n'a mesuré que le contrôle de types.

Ce que la skill laisse au projet, en revanche, se décide ici seulement. Un
composant trouve donc sous la main :

| Ce qu'il faut | Où | Forme |
|---|---|---|
| Rendre une icône | `src/Icone.tsx` | reçoit un nom et une taille ; le kit fournit seul le préfixe |
| Poser un composant dans la page | `src/galerie.tsx` | une `<Section>`, ses `<Case>`, ses `<Bascule>` |
| Traduire `{chemin.du.token}` | à écrire dans le composant | le chemin en minuscules, tout le reste en tirets, comme `style-dictionary.config.mjs` |

Il n'existe volontairement aucun helper partagé de résolution de token : chaque
composant écrit ses références en toutes lettres. Cette écriture littérale rend
la comparaison avec le contrat possible.

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

Il génère les variables CSS depuis `tokens.json`, contrôle les types, puis
construit le bundle. Les contrats, eux, sont contrôlés par la CI, qui installe
le CLI publié le temps de son exécution.

Après un vidage du dépôt pour rejouer la recette, `tokens.json` est absent,
Style Dictionary ne produit aucune variable, et la première ligne de
`src/index.css` doit rester commentée jusqu'à ce qu'un export repose le fichier.

# UCM Playground — guide agent

Ce dépôt est le consommateur de recette du projet
[UCM](https://github.com/Vassili-g/UCM-Exporter). Il sert à vérifier qu'un
repository qui ne sait rien du produit peut consommer ses artefacts.

Lire d'abord [README.md](./README.md) pour ce que contient le dépôt.

## Les quatre règles

**1. Aucun outillage UCM ne s'écrit ici.** Rien dans ce dépôt ne valide, ne
génère ni n'interprète un contrat. Un contrôle qui manque se referme dans
`UCM-Exporter`, dans les paquets publiés, jamais par un script local. Une
seconde implémentation divergerait de la première, et c'est celle qui n'est pas
jetable qui deviendrait la vérité.

**2. Les composants sont des sondes jetables, et on ne les corrige pas pour
obtenir du vert.** Chaque `.tsx` de `components/` est reconstruit à froid
depuis son seul contrat. Si un contrôle échoue, corriger le contrat, l'export
ou le produit. Ajuster la sonde jusqu'à faire disparaître le rouge la fait
cesser de mesurer quoi que ce soit.

**3. Les contrats et les tokens ne se retouchent jamais à la main.**
`*.contract.json` et `tokens.json` sont produits par un export depuis Figma. Un
fichier corrigé ici décrirait un composant que Figma ne contient pas.

**4. L'empreinte du produit se limite aux cinq fichiers qu'`ucm init` écrit.**
`ucm.config.json`, `.gitattributes`, `.vscode/settings.json`, `.gitignore` et
`.github/workflows/ucm.yml`. C'est cette absence d'outillage local qui rend la
recette probante : ce qui fonctionne ici fonctionne chez n'importe qui.

## Reconstruire un composant depuis son contrat

Le protocole vit dans `UCM-Exporter`, dans la skill `consommer-contrat`. Il n'a
pas de copie ici : ce dépôt ne doit rien apprendre du produit.

Ce que la skill laisse au projet, en revanche, se décide ici, et nulle part
ailleurs. Une sonde trouve donc sous la main :

| Ce qu'il faut | Où | Forme |
|---|---|---|
| Rendre une icône | `src/Icone.tsx` | reçoit un nom et une taille ; le kit décide seul du préfixe |
| Poser une sonde dans la page | `src/galerie.tsx` | une `<Section>`, ses `<Case>`, ses `<Bascule>` |
| Traduire `{chemin.du.token}` | à écrire dans la sonde | le chemin en minuscules, tout le reste en tirets, comme `style-dictionary.config.mjs` |

Il n'existe volontairement aucun helper partagé de résolution de token : chaque
sonde écrit ses références en toutes lettres, et c'est ce qui rend la
comparaison avec le contrat possible.

**Les icônes ont une précondition que rien n'annonce à l'écran.** Elles ne se
peignent qu'avec le kit Font Awesome que `index.html` charge depuis
`VITE_FA_KIT_ID`, une variable qui vit dans un `.env.local` non versionné (voir
`.env.example`). Sur un poste neuf elle est absente : les carrés d'icône restent
vides, et comparer une variante à la maquette conclurait à une icône manquante
alors que le contrat la décrit correctement. Poser la variable AVANT la
comparaison, ou écrire dans le compte rendu que les icônes n'ont pas été jugées.

## Vérification

```sh
npm run build
```

Il génère les variables CSS depuis `tokens.json`, contrôle les types, puis
construit le bundle. Tant qu'aucun export n'a posé `tokens.json`, aucune
variable n'est produite et `src/index.css` garde commentée la ligne qui les
importe. Les contrats, eux, sont contrôlés par la CI, qui installe
le CLI publié le temps de son exécution.

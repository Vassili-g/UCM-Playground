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
obtenir du vert.** Les `.tsx` de `components/` ont été reconstruits à froid
depuis leur seul contrat. Si un contrôle échoue, corriger le contrat, l'export
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

## Vérification

```sh
npm run build
```

Il génère les variables CSS depuis `tokens.json`, contrôle les types, puis
construit le bundle. Les contrats, eux, sont contrôlés par la CI, qui installe
le CLI publié le temps de son exécution.

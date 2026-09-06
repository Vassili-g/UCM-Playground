# UCM Playground

Une petite application React qui affiche quatre composants, et le corpus dont
ils viennent : les contrats de `components/` et les tokens de `tokens.json`,
exportés depuis Figma par
[Unified Component Exporter](https://github.com/Vassili-g/UCM-Exporter).

Les composants sont des **sondes jetables** reconstruites depuis ces contrats.
Elles servent à comparer un export à la maquette ; elles ne sont pas une
bibliothèque, et rien ici ne valide, ne génère ni n'interprète un contrat — la
vérification est faite en intégration continue par le paquet publié, que le
workflow installe le temps de son exécution.

```sh
npm install
npm run dev
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Génère les variables CSS depuis `tokens.json`, puis sert la galerie |
| `npm run build` | Les mêmes variables, le contrôle de types, puis le bundle |
| `npm run preview` | Sert le bundle construit |

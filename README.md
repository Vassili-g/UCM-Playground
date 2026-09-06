# UCM Playground

Une petite application React qui affiche quatre composants, et le corpus dont
ils viennent : des contrats exportés depuis Figma par
[Unified Component Exporter](https://github.com/Vassili-g/UCM-Exporter), et les
tokens du design system.

Ce dépôt est le **consommateur de recette** du projet UCM. Il sert à vérifier
qu'un repository qui ne sait rien du produit peut consommer ses artefacts. Il ne
contient donc aucun outillage UCM : rien ici ne valide, ne génère ni
n'interprète un contrat. La vérification est faite en intégration continue par
le paquet publié, que le workflow installe le temps de son exécution.

```sh
npm install
npm run dev
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Génère les variables CSS depuis `tokens.json`, puis sert la galerie |
| `npm run build` | Les mêmes variables, le contrôle de types, puis le bundle |
| `npm run preview` | Sert le bundle construit |

## Ce que contient le dépôt

```text
components/Button/
  Button.contract.json   exporté depuis Figma, jamais écrit à la main
  Button.tsx             la sonde, reconstruite depuis ce seul contrat
  index.ts
tokens.json              les variables du design system, au format DTCG
ucm.config.json          où sont les contrats, les tokens, les implémentations
```

Un **contrat** décrit la partie visuelle d'un composant telle qu'elle existe
dans Figma : ses variantes, sa structure, ses tokens, ses icônes, ses règles
d'usage. Il ne contient ni valeur de couleur ni dimension en dur, seulement des
références vers `tokens.json`. Sa forme complète est décrite par
[docs/FORMAT.md](https://github.com/Vassili-g/UCM-Exporter/blob/main/docs/FORMAT.md).

## Les composants sont des sondes jetables

Les quatre `.tsx` ont été reconstruits à froid depuis leur seul contrat, sans
consulter d'implémentation antérieure. Ils servent à mesurer si un contrat
suffit à produire le composant, et à comparer le rendu obtenu à la maquette.

Ce ne sont ni une bibliothèque, ni du code de production. Ils se jettent et se
refont.

**On ne corrige jamais une sonde pour obtenir du vert.** Si un contrôle échoue,
la réponse est de corriger le contrat, l'export ou le produit, jamais d'ajuster
le composant jusqu'à ce que le rouge disparaisse. Une sonde ajustée cesse de
mesurer quoi que ce soit, et le défaut qu'elle signalait devient invisible.

## Ce que la CI contrôle

`.github/workflows/ucm.yml` a été écrit par `ucm init` et n'est jamais réécrit
par-dessus. À chaque pull request, il installe le CLI publié le temps de son
exécution et lance :

```sh
npx --yes @ucm-kit/cli@0.1.7 check --report ci-report.md
```

Six contrôles portent sur chaque contrat. Quatre bloquent la fusion, deux se
contentent d'avertir, et le partage suit une règle : un contrôle bloque
seulement si un réexport depuis Figma peut le corriger.

| Contrôle | Verdict |
|---|---|
| Le contrat est lisible et complet | Bloque |
| Ce repository sait lire cette version de contrat | Bloque |
| Composition : contrats co-localisés, listes concordantes, aucun cycle | Bloque |
| Les tokens typographiques ont le type attendu | Bloque |
| Les tokens cités existent dans `tokens.json` | Avertit |
| Le code expose les props du contrat | Avertit |

Le rapport est écrit pour le designer qui valide l'export, et publié en
commentaire de la pull request. Il n'y a jamais besoin d'ouvrir les journaux de
la CI. `ci-report.md` est régénéré à chaque exécution et n'est pas versionné.

Le sixième contrôle lit du code, ce qui demande un adaptateur propre à la
stack. Sans
[`@ucm-kit/adapter-typescript`](https://www.npmjs.com/package/@ucm-kit/adapter-typescript)
installé, le rapport dit que l'implémentation n'a pas été lue, et jamais qu'elle
est conforme.

## Valider un contrat dans l'éditeur

`.vscode/settings.json` associe `*.contract.json` au JSON Schema du paquet
installé. Ce dépôt ne déclarant aucune dépendance `@ucm-kit`, le réglage reste
inerte tant que le paquet n'est pas installé localement :

```sh
npm install --no-save @ucm-kit/core
```

La CI, elle, n'en a pas besoin : elle passe par `npx`.

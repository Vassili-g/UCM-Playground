<!-- ucm : marche à suivre, retirée à la lecture.

Le texte avant la première section décrit la stack, l'architecture et le
gabarit ou le composant de référence du repository.

Une section « ## <aide> » remplace l'écriture par défaut de cette aide, ou
répond à un ancrage. `ucm aides` liste les aides ; `ucm aides <aide>
--personnaliser` ajoute la section, à éditer.

Une ligne « Contrôle : `commande` » ajoute la commande à la preuve de l'aide.

« ecritures-par-defaut: non » en première ligne retire les écritures par
défaut, pour un repository qui n'écrit pas de CSS.
-->

Stack : React 18, TypeScript, Vite. Un composant par dossier sous
`src/components/<Nom>/`, à côté de son contrat. Les composants sont jetables :
aucun test par composant.

| Ce qu'il faut | Où | Forme |
|---|---|---|
| Rendre une icône | `src/Icone.tsx` | reçoit un nom et une taille ; le kit Font Awesome fournit seul le préfixe |
| Poser un composant dans la page | `src/galerie.tsx` et `src/App.tsx` | une `<Section>`, ses `<Case>`, ses `<Bascule>` |
| Traduire `{chemin.du.token}` | à écrire dans le composant | `var(--chemin-du-token)` : le chemin en minuscules, tout le reste en tirets |

Il n'existe volontairement aucun helper partagé de résolution de token : chaque
composant écrit ses références en toutes lettres. La feuille des tokens vient de
`ucm tokens css` ; un composant ne déclare aucune variable de token.

Contrôle : `npx tsc --noEmit`

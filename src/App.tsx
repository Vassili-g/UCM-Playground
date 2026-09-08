/**
 * La galerie des sondes, vide.
 *
 * Ce dépôt attend un export : aucun contrat sous `components/`, aucun
 * `tokens.json` à la racine. Chaque sonde reconstruite depuis un contrat
 * s'ajoute ici à la main, avec ses combinaisons, pour être comparée à l'écran
 * avec la maquette. Rien ne lit un contrat au moment du rendu.
 *
 * Ce que la page a déjà sous la main : `galerie.tsx` pour la grille et les
 * bascules, `Icone.tsx` pour rendre une icône du kit.
 */
export function App() {
  return (
    <main>
      <header>
        <h1>Galerie des sondes</h1>
        <p>
          Ce dépôt est vide. Il reçoit ses contrats sous <code>components/</code>{" "}
          et ses tokens dans <code>tokens.json</code> par un export depuis Figma.
        </p>
        <p>
          Une fois les tokens arrivés, remettre dans <code>src/index.css</code>{" "}
          la ligne <code>@import "./generated/tokens.css";</code>, puis
          reconstruire une sonde par contrat et l&apos;ajouter à cette page avec
          une <code>&lt;Section&gt;</code> de <code>src/galerie.tsx</code>.
        </p>
        <p>
          Les icônes ne se peignent qu&apos;avec un kit Font Awesome. Copier{" "}
          <code>.env.example</code> en <code>.env.local</code> et y mettre son
          identifiant de kit avant de comparer une variante à la maquette : sans
          lui, les carrés d&apos;icône restent vides et la comparaison conclurait
          à tort à une icône manquante.
        </p>
      </header>
    </main>
  );
}

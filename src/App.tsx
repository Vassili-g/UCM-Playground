/**
 * La galerie des sondes, vide.
 *
 * Ce dépôt attend un export : aucun contrat sous `components/`, aucun
 * `tokens.json` à la racine. Chaque sonde reconstruite depuis un contrat
 * s'ajoute ici à la main, avec ses combinaisons, pour être comparée à l'écran
 * avec la maquette. Rien ne lit un contrat au moment du rendu.
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
          reconstruire une sonde par contrat et l&apos;ajouter à cette page.
        </p>
      </header>
    </main>
  );
}

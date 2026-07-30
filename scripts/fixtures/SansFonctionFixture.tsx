/**
 * Fixture négative : l'interface existe, mais aucune fonction ne porte le nom
 * du fichier et rien n'est exporté par défaut. La parité doit le dire une
 * fois, au lieu d'accuser chaque prop d'être ignorée.
 */
export interface SansFonctionFixtureProps {
  action?: boolean;
}

export const AutreNom = ({ action }: SansFonctionFixtureProps) => (
  <div data-action={action} />
);

/**
 * Fixture de la parité récursive : un composé qui rend sa dépendance sous un
 * nom d'import renommé — le cas qui bloquerait à tort si l'on se fiait à la
 * seule balise écrite dans le JSX.
 */
import { ParityFixture as Renomme } from "./ParityFixture.tsx";

export interface ComposedFixtureProps {
  action?: boolean;
}

export function ComposedFixture({ action }: ComposedFixtureProps) {
  return <div>{action ? <Renomme enabled /> : null}</div>;
}

/**
 * Fixture négative : un JSX de documentation ne doit jamais satisfaire la
 * composition du composant exporté par ce fichier.
 */
import { ParityFixture } from "./ParityFixture.tsx";

export const preview = <ParityFixture enabled />;

export interface CompositionHorsComposantFixtureProps {
  action?: boolean;
}

export function CompositionHorsComposantFixture({
  action,
}: CompositionHorsComposantFixtureProps) {
  return <div data-action={action} />;
}

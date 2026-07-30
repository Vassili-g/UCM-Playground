/**
 * Fixture d'un composant emballé : `memo(forwardRef(…))` est une écriture
 * React courante, et la parité doit y lire les props comme la composition.
 */
import { forwardRef, memo } from "react";
import { ParityFixture } from "./ParityFixture.tsx";

export interface EmballeFixtureProps {
  action?: boolean;
}

export const EmballeFixture = memo(
  forwardRef<HTMLDivElement, EmballeFixtureProps>(
    function EmballeFixture({ action }, ref) {
      return <div ref={ref}>{action ? <ParityFixture enabled /> : null}</div>;
    },
  ),
);

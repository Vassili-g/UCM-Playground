/**
 * App — le « playground ».
 *
 * C'est la surface de démonstration du MVP (cf. CONCEPT.md §5) : l'espace où
 * l'on demande à un agent de composer des interfaces avec les composants du
 * design system, et où l'on vérifie de ses yeux que le rendu respecte Figma.
 *
 * Le contenu ci-dessous n'est qu'un échafaudage de départ (une galerie du
 * Button) : il a vocation à être remplacé/complété au fil des prompts.
 */
import { Button } from "./components/Button/index.ts";
import type {
  ButtonColor,
  ButtonVariant,
  ButtonSize,
} from "./components/Button/index.ts";

const colors: ButtonColor[] = ["primary", "secondary"];
const variants: ButtonVariant[] = ["contained", "outlined", "text"];
const sizes: ButtonSize[] = ["big", "medium", "small"];

export function App() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-2xl font-bold">Components Playground</h1>
      <p className="mb-8 text-sm text-gray-500">
        Galerie de départ du Button, stylé uniquement par les tokens du contrat.
      </p>

      {colors.map((color) => (
        <section key={color} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold capitalize">{color}</h2>
          <div className="flex flex-col gap-4">
            {variants.map((variant) => (
              <div key={variant} className="flex flex-wrap items-center gap-4">
                {sizes.map((size) => (
                  <Button
                    key={size}
                    color={color}
                    variant={variant}
                    size={size}
                  >
                    {variant} {size}
                  </Button>
                ))}
                <Button color={color} variant={variant} disabled>
                  disabled
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

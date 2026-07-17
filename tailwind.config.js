/**
 * Configuration Tailwind.
 *
 * Le design system vit dans les variables CSS générées par Style Dictionary
 * (`src/generated/tokens.css`) : on ne recopie donc PAS les couleurs/tailles
 * ici (ce serait une seconde source de vérité, donc une divergence possible).
 * Tailwind sert uniquement à la mise en page du playground (flex, gap, grid) ;
 * les composants du design system stylent via `var(--token…)`.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

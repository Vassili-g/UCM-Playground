import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuration Vite minimale : React + JSX. Le playground est une simple SPA.
export default defineConfig({
  plugins: [react()],
});

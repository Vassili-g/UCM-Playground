import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
// Police du design system, installée EN LOCAL au repo (principe « repository
// only » : pas de dépendance runtime à Google Fonts). On importe uniquement les
// graisses réellement utilisées par les tokens (layouts.fontweight.400/600/700).
// Le token `layouts.fontfamily.base` résout vers « "Open Sans", sans-serif ».
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import "./index.css";

// Point d'entrée : monte le playground dans le DOM.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

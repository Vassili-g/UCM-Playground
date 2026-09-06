import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
// La police que les tokens nomment, installée en local : sans elle, les
// graisses et les hauteurs de ligne du corpus ne se comparent pas à la maquette.
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import "./index.css";

// Point d'entrée : monte la galerie dans le DOM.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { scan } from "react-scan";
import "./index.css";
import App from "./App";
import { runMigrations } from "./store/migrations";

await runMigrations();

scan({ enabled: import.meta.env.DEV });

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

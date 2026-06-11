import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { scan } from "react-scan";
import "./index.css";
import App from "./App";
import { migrateLegacyStorage } from "./store/migrate-legacy";

async function bootstrap() {
  await migrateLegacyStorage();

  scan({ enabled: import.meta.env.DEV });

  // biome-ignore lint/style/noNonNullAssertion: root element always exists
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();

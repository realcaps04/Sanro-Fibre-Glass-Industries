import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider } from "convex/react";
import App from "./App.tsx";
import "./index.css";
import { convex } from "@/lib/convex";
import { preparePwa } from "./pwa.ts";

preparePwa();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
);

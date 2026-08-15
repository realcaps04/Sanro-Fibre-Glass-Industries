import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

function gitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

function versionPlugin(): Plugin {
  return {
    name: "app-version-file",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({
          sha: gitSha(),
          builtAt: new Date().toISOString(),
        }),
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    versionPlugin(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: [
        "logo.png",
        "favicon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
      ],
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
    },
  },
});

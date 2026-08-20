import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  css: {
    transformer: "lightningcss",
  },
  server: {
    host: "::",
    port: 8080,
    // Temporary: allow the cloudflared quick-tunnel domain through Vite's dev-server
    // Host-header check so the app is reachable via the public trycloudflare.com URL.
    allowedHosts: [".trycloudflare.com"],
    watch: {
      // Debounces HMR so a multi-file save doesn't trigger a reload mid-write.
      awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 },
    },
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    // Build-only: Nitro is the SSR/deployment adapter. Targets Vercel.
    ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
    viteReact(),
  ],
}));

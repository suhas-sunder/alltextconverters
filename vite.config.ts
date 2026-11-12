import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  resolve: {
    // Use Mammoth's browser-mapped source so the lockfile controls its parser
    // versions. Its standalone browser bundle embeds its own dependencies.
    alias: { "mammoth/mammoth.browser": "mammoth" },
  },
  plugins: [reactRouter(), tsconfigPaths(), tailwindcss()],
});

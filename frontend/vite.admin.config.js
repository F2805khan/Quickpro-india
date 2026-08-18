import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, "../backend/admin");
const require = createRequire(import.meta.url);
const packageRoot = (name) => path.dirname(require.resolve(`${name}/package.json`));

export default defineConfig({
  root: adminRoot,
  envDir: __dirname,
  plugins: [react()],
  publicDir: path.resolve(__dirname, "public"),
  resolve: {
    alias: [
      { find: "react/jsx-runtime", replacement: require.resolve("react/jsx-runtime") },
      { find: "react-dom/client", replacement: require.resolve("react-dom/client") },
      { find: "react-dom", replacement: packageRoot("react-dom") },
      { find: "react", replacement: packageRoot("react") },
      { find: "lucide-react", replacement: require.resolve("lucide-react") }
    ]
  },
  build: {
    outDir: path.resolve(adminRoot, "dist"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5174,
    fs: {
      allow: [adminRoot, __dirname]
    },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true
      }
    }
  }
});

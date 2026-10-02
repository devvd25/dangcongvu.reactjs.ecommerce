import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const buildVersion = Date.now().toString();

function autoVersionPlugin() {
  return {
    name: "auto-version-plugin",
    buildStart() {
      const publicDir = path.resolve(__dirname, "public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(publicDir, "version.json"),
        JSON.stringify({ version: buildVersion, buildTime: new Date().toISOString() }, null, 2)
      );
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ version: buildVersion, buildTime: new Date().toISOString() }, null, 2),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load environment variables from .env file
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      __APP_BUILD_VERSION__: JSON.stringify(buildVersion),
    },
    plugins: [react(), autoVersionPlugin()],
    server: {
      port: Number(env.PORT) || 3000, // Default to 3000 if PORT is not set
    },
  };
});


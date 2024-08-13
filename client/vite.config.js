import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Proxy configuration to forward requests to the server running on port 3001.
    proxy: {
      "/graphql": {
        target: "http://localhost:3001",
        secure: false,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist", // Ensure the build output goes to the correct directory
  },
  test: {
    globals: true,
    environment: "happy-dom",
  },
});

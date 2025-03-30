import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as dotenv from "dotenv"

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/queens/",
  build: {
    outDir: "dist"
  },
  server: {
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: process.env.API_TARGET, // Backend base URL
        changeOrigin: true, // Adjusts the `Host` header to match the target
        rewrite: (path) => path.replace(/^\/api/, ''), // Optional: Remove '/api' prefix
      },
    },
  },
});

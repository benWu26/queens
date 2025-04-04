import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    base: "/queens/",
    build: {
        outDir: "dist",
    },
    server: {
        proxy: {
            // Proxy API requests to the backend
            "/api": {
                target: "http://localhost:3000", // Backend base URL
                changeOrigin: true, // Adjusts the `Host` header to match the target
                rewrite: path => path.replace(/^\/api/, ""), // Optional: Remove '/api' prefix
            },
        },
    },
});

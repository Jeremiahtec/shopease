import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// In dev, /api calls are proxied to the Spring Boot backend, so there are no CORS headaches.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: process.env.VITE_PROXY_TARGET || 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: { sourcemap: false },
  test: { environment: 'jsdom', include: ['src/**/*.test.{js,jsx}'] },
});

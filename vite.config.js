import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Netlify environment variables are prefixed with `VITE_`
const NETLIFY_ENV = process.env.NETLIFY ? process.env : {};

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Netlify-specific optimizations
  define: {
    // Prevents env var leakage (security)
    'process.env': {},
    // Explicitly pass Netlify env vars to the client
    __NETLIFY_ENV__: JSON.stringify({
      VITE_FIREBASE_API_KEY: NETLIFY_ENV.VITE_FIREBASE_API_KEY,
      // Add other Netlify env vars here
    }),
  },

  build: {
    // Reduce chunk size warnings (or optimize below)
    chunkSizeWarningLimit: 1000,

    // Advanced chunk splitting for Netlify's CDN
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
          ],
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['lodash', 'date-fns'], // Other heavy deps
        },
      },
    },
  },

  // Netlify supports clean URLs (no '.html' needed)
  base: '/', // Default (Netlify handles routing)
});
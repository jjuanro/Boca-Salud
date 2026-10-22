import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleAuraAnalysisRequest } from './server/auraApi.ts';
import { handleGitHubAuthUrl, handleGitHubCallback, handleGitHubPublicUserFetch } from './server/githubAuth.ts';
import { handleNutritionLookupRequest } from './server/nutritionApi.ts';

function auraApiPlugin(): Plugin {
  return {
    name: 'aura-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        const pathname = rawUrl.split('?')[0];

        if (pathname === '/api/aura-analysis') {
          handleAuraAnalysisRequest(req, res);
        } else if (pathname === '/api/nutrition-lookup') {
          handleNutritionLookupRequest(req, res);
        } else if (pathname === '/api/auth/github/url') {
          handleGitHubAuthUrl(req, res);
        } else if (pathname === '/api/auth/github/lookup') {
          handleGitHubPublicUserFetch(req, res);
        } else if (pathname === '/auth/callback' || pathname === '/auth/callback/') {
          handleGitHubCallback(req, res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), auraApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


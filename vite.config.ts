/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
// @ts-expect-error -- plain ESM helper shared with the Node scripts
import { resolveSiteOrigin } from './scripts/site-origin.mjs';

export default defineConfig(({ mode }) => {
  // .env files plus the hosting platform's own variables (Vercel, Netlify, Cloudflare, Render, Railway).
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const origin = resolveSiteOrigin(env) as string | null;

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Empty string = unknown at build time → dynamic origin mode.
      'import.meta.env.VITE_SITE_URL': JSON.stringify(origin ?? ''),
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      css: false,
    },
  };
});

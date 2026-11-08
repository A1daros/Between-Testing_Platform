import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const PRELOAD_FONTS = [
  /montserrat-latin-wght-normal-.+\.woff2$/,
  /montserrat-cyrillic-wght-normal-.+\.woff2$/,
];

const preloadFonts = (): Plugin => ({
  name: 'preload-fonts',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(_html, context) {
      const files = Object.keys(context.bundle ?? {}).filter((file) =>
        PRELOAD_FONTS.some((pattern) => pattern.test(file)),
      );

      return files.map((file) => ({
        tag: 'link',
        attrs: {
          rel: 'preload',
          href: `/${file}`,
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
        injectTo: 'head',
      }));
    },
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadFonts()],
  base: '/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[/\\](react|react-dom|react-router|react-router-dom|scheduler|cookie|set-cookie-parser)[/\\]/,
              priority: 20,
            },
            {
              name: 'supabase',
              test: /node_modules[/\\]@supabase[/\\]/,
              priority: 10,
            },
            {
              name: 'sentry',
              test: /node_modules[/\\]@sentry[/\\]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const stub = (name: string) =>
  fileURLToPath(
    new URL(`./supabase/functions/_tests/stubs/${name}.ts`, import.meta.url),
  );

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'npm:@supabase/supabase-js@2': stub('supabaseJs'),
      'npm:@upstash/ratelimit': stub('ratelimit'),
      'npm:@upstash/redis': stub('redis'),
      '@supabase/functions-js/edge-runtime.d.ts': stub('empty'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      'supabase/functions/_tests/**/*.test.ts',
    ],
    mockReset: true,
    unstubGlobals: true,
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
});

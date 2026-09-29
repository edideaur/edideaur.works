import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';
import Sonda from 'sonda/astro';
import umami from '@yeskunall/astro-umami';
import purgecss from 'astro-purgecss';
import minify from 'astro-minify-html-swc';

export default defineConfig({
  site: 'https://edideaur.works',
  vite: {
    build: {
      sourcemap: true,
    },
  },
  integrations: [
    sitemap(),
    sentry({
      dsn: 'https://5bc7a747166247ed91d54635ccff184b@rustrak-api.edideaur.works/42',
      telemetry: false,
      sourcemaps: {
        disable: true,
      },
      enabled: {
        client: true,
        server: false,
      },
    }),
    Sonda(),
    umami({
      id: '01a0d879-59ab-753f-a19c-074e1cf7ea43',
      endpointUrl: 'https://k.edideaur.works',
      hostUrl: 'https://k.edideaur.works',
    }),
    purgecss({
      keyframes: false,
      fontFace: false,
      safelist: {
        standard: [
          /^player-/,
          /^tilt-/,
          /^mb-/,
          /^chat-/,
          /^fade-/,
          /^theme-/,
          /^astro-/,
          /^morph-/,
          /^bg-/,
          /^text-/,
          /^from-/,
          /^to-/,
          /^tracking-/,
          /^flex-/,
          /^sm:/,
          'copied',
          'copying',
          'crypto-copy-icon',
          'crypto-qr-copy-btn',
          'active',
          'open',
          'font-funnel',
          'gradient',
          'font-bold',
          'hidden',
        ],
        deep: [
          /^player-/,
          /^tilt-/,
          /^mb-/,
          /^chat-/,
          /^fade-/,
          /^theme-/,
          /^astro-/,
          /^morph-/,
          /^bg-/,
          /^text-/,
          /^from-/,
          /^to-/,
          /^tracking-/,
          /^flex-/,
          /^sm:/,
        ],
        greedy: [
          /^player-/,
          /^tilt-/,
          /^mb-/,
          /^chat-/,
          /^fade-/,
          /^theme-/,
          /^astro-/,
          /^morph-/,
          /^bg-/,
          /^text-/,
          /^from-/,
          /^to-/,
          /^tracking-/,
          /^flex-/,
          /^sm:/,
        ],
      },
      content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
      ],
    }),
    minify(),
  ],
  markdown: { smartypants: false },
  server: { port: 3000, host: true, allowedHosts: true },
});

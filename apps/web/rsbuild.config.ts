import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';

export default defineConfig({
  source: {
    entry: {
      index: './src/main.tsx',
    },
    define: {
      API_URL: JSON.stringify(process.env.API_URL || 'http://localhost:3000/api'),
      BASE_URL: JSON.stringify(process.env.BASE_URL || 'http://localhost:3000'),
    },
  },
  plugins: [pluginReact()],
  server: {
    port: 4200,
  },
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({
          target: 'react',
          autoCodeSplitting: true,
        }),
      ],
    },
  },
  html: {
    template: './public/index.html',
  },
});

import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack'

export default defineConfig({
  source: {
    entry: {
      index: './src/main.tsx',
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
})

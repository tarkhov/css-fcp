import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import pkg from './package.json'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    ssr: true, // To bundle Node.js scripts with Vite, you must configure it for a Node.js SSR or library target rather than the default browser environment.
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      formats: ['es', 'cjs'], // Output as ES modules (standard for modern Node.js)
      fileName: 'css-fcp'
    },
    target: 'node24',
    rollupOptions: {
      external: [/^node:/]
    },
  },
  plugins: [
    banner(
      `\n * CSS FCP v${pkg.version}` +
      `\n * Homepage (${pkg.homepage})` +
      `\n * Copyright 2026 ${pkg.author}` +
      `\n * License: ${pkg.license}\n`
    )
  ]
})
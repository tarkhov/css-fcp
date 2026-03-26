import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import pkg from './package.json'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.js'),
      name: 'CssFcp',
      fileName: 'css-fcp'
    }
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
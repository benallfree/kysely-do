import { copyFileSync } from 'fs'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  onSuccess: async () => {
    console.log('Build complete')
    copyFileSync(`./README.md`, `../../README.md`)
  },
  external: ['kysely'],
})

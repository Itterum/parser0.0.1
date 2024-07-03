import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/extractors/*.ts'],
    outDir: 'dist/extractors',
    minify: true,
    target: 'es6',
    format: ['cjs'],
})

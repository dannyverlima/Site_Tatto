/// <reference types="node" />
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  root: path.resolve(__dirname, './'),
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
    // Prevent duplicate Three.js instances (required for @react-three/fiber)
    dedupe: ['three'],
  },

  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5175',
      '/admin-media': 'http://localhost:5175',
      '/uploads': 'http://localhost:5175',
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        curso: path.resolve(__dirname, 'curso.html'),
        joias: path.resolve(__dirname, 'joias.html'),
        joalheria: path.resolve(__dirname, 'joalheria.html'),
      },
    },
  },
})

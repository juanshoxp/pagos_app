import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  server: { watch: { usePolling: true } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,woff2}'],
      },
      manifest: {
        name: 'Pagos · Juan Reyes',
        short_name: 'Pagos',
        description: 'Registro de pagos de aplicaciones, funciona sin internet',
        lang: 'es',
        display: 'standalone',
        background_color: '#0C0F14',
        theme_color: '#0C0F14',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
})

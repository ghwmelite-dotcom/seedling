import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],

      // Use injectManifest for custom service worker with push notifications
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',

      manifest: {
        name: 'Seedling - Generational Wealth Time Machine',
        short_name: 'Seedling',
        description: 'Visualize how small financial habits today create generational wealth tomorrow. See your family tree grow across generations.',
        theme_color: '#10b981',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['finance', 'productivity', 'utilities'],
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        screenshots: [
          {
            src: '/screenshots/desktop.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Seedling Desktop - Wealth Simulator'
          },
          {
            src: '/screenshots/desktop-wide.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Seedling Full Desktop Experience'
          },
          {
            src: '/screenshots/mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Seedling Mobile - On the Go'
          },
          {
            src: '/screenshots/tablet.png',
            sizes: '768x1024',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Seedling Tablet View'
          }
        ],
        shortcuts: [
          {
            name: 'Run Simulation',
            short_name: 'Simulate',
            description: 'Start a new wealth simulation',
            url: '/?panel=simulator',
            icons: [{ src: '/icons/shortcut-simulate.png', sizes: '96x96' }]
          },
          {
            name: 'View Analytics',
            short_name: 'Analytics',
            description: 'View your wealth analytics',
            url: '/?panel=analytics',
            icons: [{ src: '/icons/shortcut-analytics.png', sizes: '96x96' }]
          }
        ],
        related_applications: [],
        prefer_related_applications: false
      },

      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}', 'icons/*.png', 'apple-touch-icon.png', 'favicon-*.png'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },

      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

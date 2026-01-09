import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
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
      workbox: {
        // Precache all static assets (excluding large screenshots)
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}', 'icons/*.png', 'apple-touch-icon.png', 'favicon-*.png'],

        // Increase max file size for precaching (5MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // Runtime caching strategies
        runtimeCaching: [
          {
            // Cache API responses with network-first strategy
            urlPattern: /^https:\/\/seedling-api\..*\.workers\.dev\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache exchange rate API with stale-while-revalidate
            urlPattern: /^https:\/\/api\.frankfurter\.app\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'exchange-rates-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache IP geolocation API
            urlPattern: /^https:\/\/ipapi\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'geolocation-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache font files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache images with cache-first
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ],

        // Clean up old caches
        cleanupOutdatedCaches: true,

        // Skip waiting for new service worker
        skipWaiting: true,

        // Claim clients immediately
        clientsClaim: true
      },

      // Dev options for testing
      devOptions: {
        enabled: false, // Enable in dev if needed for testing
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

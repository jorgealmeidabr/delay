import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'DelayAPI',
        short_name: 'DelayAPI',
        description: 'Encontre o delay da sua transmissão ao vivo',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        runtimeCaching: [{
          urlPattern: /\.js$/,
          handler: 'NetworkFirst',
        }],
      },
      devOptions: {
        enabled: true,
      },
    })
  ],
  server: {
    port: 5173,
    open: true,
  },
});

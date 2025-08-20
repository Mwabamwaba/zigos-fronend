import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'lucide-react',
      '@fullcalendar/core',
      '@fullcalendar/daygrid',
      '@fullcalendar/timegrid',
      '@fullcalendar/interaction',
      '@fullcalendar/react'
    ],
  },
  server: {
    port: 3000,
    strictPort: true, // Fail if port 3000 is not available
    // Proxy disabled - using backend API instead for reliability
    // proxy: {
    //   '^/api/fireflies/.*': {
    //     target: 'https://api.fireflies.ai/v1',
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api\/fireflies/, ''),
    //     secure: true,
    //   },
    // },
  },
  preview: {
    host: '0.0.0.0',
    port: 10000,
    strictPort: false,
  },
});

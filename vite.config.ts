import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Disable Supabase for EDF branch by default
    'import.meta.env.VITE_DISABLE_SUPABASE': JSON.stringify(process.env.VITE_DISABLE_SUPABASE || 'true'),
  },
});

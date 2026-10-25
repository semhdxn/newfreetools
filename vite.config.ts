import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Static, front-end only build served from the site root. Absolute asset URLs (base '/')
// are required now that tools live at real paths like /sensory/ rather than behind a hash.
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5180 },
});

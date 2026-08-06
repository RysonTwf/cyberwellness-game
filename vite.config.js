import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so a built copy works from a subpath (GitHub Pages) or file://
  base: './',
});

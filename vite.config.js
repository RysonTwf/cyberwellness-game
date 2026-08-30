import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import copyEditor from './vite-plugin-copy-editor';

export default defineConfig({
  plugins: [react(), copyEditor()],
  // Relative base so a built copy works from a subpath (GitHub Pages) or file://
  base: './',
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' makes asset paths relative so the build works on GitHub Pages
// (served from /<repo-name>/) as well as locally.
export default defineConfig({
  plugins: [react()],
  base: './',
})

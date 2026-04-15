import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: set base to '/<REPO_NAME>/' if deploying to https://<user>.github.io/<repo>/
// For custom domain or root deploy, use '/'
export default defineConfig({
  plugins: [react()],
  base: './',
})

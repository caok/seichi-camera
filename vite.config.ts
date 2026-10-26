import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works from any sub-path (e.g. pages.feedmob.com/p/{owner}/{slug}/)
  base: './',
  // Two pages: the app (index.html) and the promo landing page (about.html)
  build: { rollupOptions: { input: { main: 'index.html', about: 'about.html' } } },
  // Expose on the LAN and allow tunnel hosts (cloudflared/ngrok) for testing on a phone
  server: { host: true, allowedHosts: true },
})

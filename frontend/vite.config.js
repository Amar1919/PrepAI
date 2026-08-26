import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on your PC's LAN IP too, not just localhost - required for
    // testing from a phone on the same WiFi network.
    host: true,
  },
})
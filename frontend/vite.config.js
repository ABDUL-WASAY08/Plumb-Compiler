import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wgslVitePlugin from '@vgpu/wgsl/loader-vite'

// https://vitejs.dev/config/
export default defineConfig({
  // wgslVitePlugin turns .wgsl imports into prepared vgpu shader artifacts.
  plugins: [react(), wgslVitePlugin({ minify: true })],
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    hmr: {
      host: '127.0.0.1',
    },
  },
  preview: {
    port: 4174,
  },
})

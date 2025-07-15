//import path from "path";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src', // Adjust the path as necessary
      // Uncomment and adjust the following line if you need to resolve paths differently
      // 'lib': path.resolve(__dirname, 'src/lib'),
    },
  },
})

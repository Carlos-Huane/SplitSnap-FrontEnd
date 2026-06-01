import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// `base` se ajusta segun el destino del deploy:
//  - Vercel / Netlify / dev local  -> "/"                  (sitio en la raiz)
//  - GitHub Pages                  -> "/SplitSnap-FrontEnd/" (sitio bajo ese path)
//
// Para forzar un base distinto en build, setea VITE_BASE_PATH antes de `npm run build`.
// Ejemplo GitHub Pages: VITE_BASE_PATH=/SplitSnap-FrontEnd/ npm run build
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || '/',
  }
})

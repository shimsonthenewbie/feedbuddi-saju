import { defineConfig } from 'vite'
// BASE: GitHub Pages 같은 하위 주소에 올릴 때 지정한다(기본은 루트).
const base = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.BASE ?? '/'
export default defineConfig({ base, build: { target: 'es2022' } })

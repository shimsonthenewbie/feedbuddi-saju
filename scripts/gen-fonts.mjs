// 글꼴을 구글 서버가 아니라 우리 사이트에서 직접 제공한다(방문자 IP가 구글로 가지 않게).
// @fontsource 패키지의 woff2 파일과 CSS를 public/fonts 로 모은다. 실행: node scripts/gen-fonts.mjs
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync, existsSync } from 'node:fs'

const SETS = [
  ['jua', ['400']],
  ['gowun-dodum', ['400']],
  ['noto-serif-kr', ['600', '700']],
]
const OUT = 'public/fonts'
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
let css = '/* 자동 생성: scripts/gen-fonts.mjs (SIL Open Font License 글꼴) */\n'
let files = 0
for (const [pkg, weights] of SETS) {
  for (const w of weights) {
    const src = `node_modules/@fontsource/${pkg}/${w}.css`
    if (!existsSync(src)) throw new Error(`없음: ${src}`)
    const blocks = readFileSync(src, 'utf8').split('/*').slice(1).map((b) => '/*' + b)
    for (const b of blocks) {
      const m = b.match(/url\(\.\/files\/([^)]+?\.woff2)\)/)
      if (!m) continue
      copyFileSync(`node_modules/@fontsource/${pkg}/files/${m[1]}`, `${OUT}/${m[1]}`)
      files++
      css += b.replace(/src:[^;]+;/, `src: url(./${m[1]}) format('woff2');`).replace(/^\/\*.*\*\/\n/, '')
    }
  }
}
writeFileSync(`${OUT}/fonts.css`, css)
console.log('fonts:', files, 'files')

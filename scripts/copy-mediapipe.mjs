// 얼굴 인식 파일(Apache-2.0)을 사이트에 같이 싣는다. 사진은 서버로 보내지 않고 브라우저 안에서만 분석한다.
import { cpSync, mkdirSync, existsSync } from 'node:fs'
const src = 'node_modules/@mediapipe/face_mesh', dst = 'public/mediapipe/face_mesh'
if (!existsSync(src)) { console.warn('face_mesh 패키지가 없어 건너뜀'); process.exit(0) }
mkdirSync(dst, { recursive: true })
for (const f of ['face_mesh.js', 'face_mesh.binarypb', 'face_mesh_solution_packed_assets.data', 'face_mesh_solution_packed_assets_loader.js', 'face_mesh_solution_simd_wasm_bin.js', 'face_mesh_solution_simd_wasm_bin.wasm', 'face_mesh_solution_wasm_bin.js', 'face_mesh_solution_wasm_bin.wasm'])
  cpSync(`${src}/${f}`, `${dst}/${f}`)

// 얼굴 인식 파일(Apache-2.0)을 사이트에 같이 싣는다. 사진은 서버로 보내지 않고 브라우저 안에서만 분석한다.
import { cpSync, mkdirSync, existsSync } from 'node:fs'
const src = 'node_modules/@mediapipe/face_mesh', dst = 'public/mediapipe/face_mesh'
if (!existsSync(src)) { console.warn('face_mesh 패키지가 없어 건너뜀'); process.exit(0) }
mkdirSync(dst, { recursive: true })
for (const f of ['face_mesh.js', 'face_mesh.binarypb', 'face_mesh_solution_packed_assets.data', 'face_mesh_solution_packed_assets_loader.js', 'face_mesh_solution_simd_wasm_bin.js', 'face_mesh_solution_simd_wasm_bin.wasm', 'face_mesh_solution_wasm_bin.js', 'face_mesh_solution_wasm_bin.wasm'])
  cpSync(`${src}/${f}`, `${dst}/${f}`)

// 손 인식(Apache-2.0) — 손 모양 관상용. 마찬가지로 기기 안에서만 쓴다.
{
  const hs = 'node_modules/@mediapipe/hands', hd = 'public/mediapipe/hands'
  if (existsSync(hs)) {
    mkdirSync(hd, { recursive: true })
    for (const f of ['hands.js', 'hands.binarypb', 'hand_landmark_full.tflite', 'hands_solution_packed_assets.data', 'hands_solution_packed_assets_loader.js', 'hands_solution_simd_wasm_bin.js', 'hands_solution_simd_wasm_bin.wasm', 'hands_solution_wasm_bin.js', 'hands_solution_wasm_bin.wasm'])
      if (existsSync(`${hs}/${f}`)) cpSync(`${hs}/${f}`, `${hd}/${f}`)
  }
}

// 신형 얼굴 인식(Tasks Vision, Apache-2.0): 실행 파일(wasm)을 사이트에 같이 싣는다. 모델은 public/models/face_landmarker.task.
{
  const ts = 'node_modules/@mediapipe/tasks-vision/wasm', td = 'public/mediapipe/tasks'
  if (existsSync(ts)) {
    mkdirSync(td, { recursive: true })
    for (const f of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm'])
      cpSync(`${ts}/${f}`, `${td}/${f}`)
  }
}

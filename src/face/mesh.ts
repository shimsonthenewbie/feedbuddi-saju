/** 얼굴 특징점 찾기. 사진은 브라우저 안에서만 처리하고 어디로도 보내지 않는다. */
export type Pt = { x: number; y: number; z: number }
export type Found = { pts: Pt[]; w: number; h: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FM = any
let meshP: Promise<FM> | null = null
let pending: ((r: { multiFaceLandmarks?: Pt[][] }) => void) | null = null

const base = () => (globalThis as { __MP_BASE?: string }).__MP_BASE ?? `${import.meta.env.BASE_URL}mediapipe/face_mesh/`

function loadScript(src: string): Promise<void> {
  return new Promise((res, rej) => {
    const s = document.createElement('script')
    s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('load'))
    document.head.append(s)
  })
}

function getMesh(): Promise<FM> {
  if (meshP) return meshP
  meshP = (async () => {
    if (!(globalThis as { FaceMesh?: unknown }).FaceMesh) await loadScript(base() + 'face_mesh.js')
    const FaceMesh = (globalThis as unknown as { FaceMesh: new (o: unknown) => FM }).FaceMesh
    const m = new FaceMesh({ locateFile: (f: string) => base() + f + (/\.(binarypb|data)$/.test(f) ? ((globalThis as { __MP_SUFFIX?: string }).__MP_SUFFIX ?? '') : '') })
    m.setOptions({ maxNumFaces: 2, refineLandmarks: true, minDetectionConfidence: 0.3, minTrackingConfidence: 0.5 })
    m.onResults((r: { multiFaceLandmarks?: Pt[][] }) => { pending?.(r) })
    await m.initialize()
    return m
  })().catch((e) => { meshP = null; throw e })
  return meshP
}

async function detect(m: FM, src: HTMLCanvasElement): Promise<Pt[][]> {
  const r = await new Promise<{ multiFaceLandmarks?: Pt[][] }>((res, rej) => {
    pending = res
    m.send({ image: src }).catch(rej)
  })
  return r.multiFaceLandmarks ?? []
}
const faceSize = (f: Pt[]) => {
  let x0 = 1, x1 = 0, y0 = 1, y1 = 0
  for (const p of f) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y }
  return { w: x1 - x0, h: y1 - y0 }
}

/** 시도 하나: 사진의 일부(crop)를 잘라 θ도 돌려서 찾고, 찾은 점을 원래 사진 좌표로 되돌린다. */
async function attempt(m: FM, src: HTMLCanvasElement, crop: [number, number, number, number], deg: number): Promise<Pt[][]> {
  const W = src.width, H = src.height
  const [cx0, cy0, cw, ch] = [crop[0] * W, crop[1] * H, crop[2] * W, crop[3] * H]
  const th = (deg * Math.PI) / 180
  const sc = Math.min(2.5, Math.max(1, 640 / Math.max(cw, ch)))
  const rw = cw * sc, rh = ch * sc
  const bw = Math.ceil(Math.abs(rw * Math.cos(th)) + Math.abs(rh * Math.sin(th)))
  const bh = Math.ceil(Math.abs(rw * Math.sin(th)) + Math.abs(rh * Math.cos(th)))
  const c = document.createElement('canvas'); c.width = bw; c.height = bh
  const g = c.getContext('2d')!
  g.fillStyle = '#808080'; g.fillRect(0, 0, bw, bh)
  g.translate(bw / 2, bh / 2); g.rotate(th); g.scale(sc, sc)
  g.drawImage(src, cx0, cy0, cw, ch, -cw / 2, -ch / 2, cw, ch)
  const faces = await detect(m, c)
  const cos = Math.cos(-th), sin = Math.sin(-th)
  return faces.map((f) => f.map((p) => {
    const dx = p.x * bw - bw / 2, dy = p.y * bh - bh / 2
    const ux = (dx * cos - dy * sin) / sc + cw / 2, uy = (dx * sin + dy * cos) / sc + ch / 2
    return { x: (cx0 + ux) / W, y: (cy0 + uy) / H, z: p.z }
  }))
}

/** 찾은 점들이 사람 얼굴 모양인지 확인한다(일부 폰 GPU는 엉뚱한 점을 돌려준다). */
function sane(f: Pt[]): boolean {
  if (f.length < 455) return false
  const a = f[33], b = f[263], nose = f[1], chin = f[152], top = f[10]
  const ok = (p: Pt) => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x > -0.3 && p.x < 1.3 && p.y > -0.3 && p.y < 1.3
  if (![a, b, nose, chin, top].every(ok)) return false
  const eye = Math.hypot(b.x - a.x, b.y - a.y), face = Math.hypot(chin.x - top.x, chin.y - top.y)
  if (eye < 1e-4 || face < 1e-4) return false
  const rollEye = Math.abs((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI)
  const rollFace = Math.abs((Math.atan2(chin.y - top.y, chin.x - top.x) * 180) / Math.PI - 90)
  if (rollEye > 55 && rollEye < 125) return false
  if (rollFace > 60) return false
  const r = eye / face
  if (r < 0.25 || r > 0.9) return false
  // 눈 → 코 → 턱 순서로 얼굴 축 위에 있어야 한다
  const ux = (chin.x - top.x) / face, uy = (chin.y - top.y) / face
  const proj = (p: Pt) => (p.x - top.x) * ux + (p.y - top.y) * uy
  const ey = (proj(a) + proj(b)) / 2
  return ey < proj(nose) && proj(nose) < proj(chin)
}

async function findFaceOnce(m: FM, src: HTMLCanvasElement): Promise<Found | 'none' | 'many'> {
  const full: [number, number, number, number] = [0, 0, 1, 1]
  const tries: Array<[[number, number, number, number], number]> = [
    [full, 0], [full, -20], [full, 20], [full, -40], [full, 40],
    [[0.15, 0, 0.7, 0.7], 0], [[0.2, 0.05, 0.6, 0.6], 0], [[0, 0, 0.65, 0.65], 0], [[0.35, 0, 0.65, 0.65], 0],
    [[0, 0.3, 0.65, 0.65], 0], [[0.35, 0.3, 0.65, 0.65], 0], [[0.25, 0.25, 0.5, 0.5], 0],
  ]
  for (const [crop, deg] of tries) {
    const raw = await (crop === full && deg === 0 ? detect(m, src) : attempt(m, src, crop, deg))
    const faces = raw.filter(sane)
    if (!faces.length) continue
    const sorted = faces.map((f) => ({ f, a: faceSize(f).w * faceSize(f).h })).sort((p, q) => q.a - p.a)
    if (sorted.length > 1 && sorted[1].a > sorted[0].a * 0.5) return 'many'
    return { pts: sorted[0].f, w: src.width, h: src.height }
  }
  return 'none'
}

function shrink(src: HTMLCanvasElement, max: number): HTMLCanvasElement {
  const k = Math.min(1, max / Math.max(src.width, src.height))
  if (k >= 1) return src
  const c = document.createElement('canvas')
  c.width = Math.round(src.width * k); c.height = Math.round(src.height * k)
  c.getContext('2d')!.drawImage(src, 0, 0, c.width, c.height)
  return c
}

/** 사진 한 장에서 얼굴을 찾는다. 못 찾거나 점이 이상하면 설정·크기를 바꿔 가며 다시 찾는다. 얼굴이 없으면 'none', 비슷한 크기로 둘 이상이면 'many'. */
export async function findFace(src: HTMLCanvasElement): Promise<Found | 'none' | 'many'> {
  const variants: Array<[boolean, number]> = [[true, 960], [false, 960], [false, 512], [true, 512], [false, 320]]
  let many = false
  for (const [refine, size] of variants) {
    try {
      const m = await getMesh()
      m.setOptions({ refineLandmarks: refine })
      const c = shrink(src, size)
      const r = await findFaceOnce(m, c)
      if (r === 'many') { many = true; continue }
      if (r !== 'none') return { pts: r.pts, w: src.width, h: src.height }
    } catch {
      meshP = null // 폰에서 가끔 처음 한 번 실패한다 → 모델을 새로 불러온다
    }
  }
  return many ? 'many' : 'none'
}

/** 사진 파일을 줄여서 캔버스에 그린다(사진 방향 자동 보정, 긴 변 최대 960px). */
export async function fileToCanvas(file: File, max = 960): Promise<HTMLCanvasElement> {
  let bmp: ImageBitmap | HTMLImageElement
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }) } catch {
    // 일부 폰 브라우저는 옵션을 못 읽는다 → 이미지 태그로 읽는다(방향은 브라우저가 보정)
    const url = URL.createObjectURL(file)
    try {
      bmp = await new Promise<HTMLImageElement>((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('img')); im.src = url })
    } finally { setTimeout(() => URL.revokeObjectURL(url), 5000) }
  }
  const bw = 'naturalWidth' in bmp ? bmp.naturalWidth : bmp.width, bh = 'naturalHeight' in bmp ? bmp.naturalHeight : bmp.height
  const s = Math.min(1, max / Math.max(bw, bh))
  const c = document.createElement('canvas')
  c.width = Math.round(bw * s); c.height = Math.round(bh * s)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  if ('close' in bmp) bmp.close()
  return c
}

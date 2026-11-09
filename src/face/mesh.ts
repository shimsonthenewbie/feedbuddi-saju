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
    m.setOptions({ maxNumFaces: 2, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
    m.onResults((r: { multiFaceLandmarks?: Pt[][] }) => { pending?.(r) })
    await m.initialize()
    return m
  })().catch((e) => { meshP = null; throw e })
  return meshP
}

/** 사진 한 장에서 얼굴을 찾는다. 얼굴이 없으면 'none', 둘 이상이면 'many'. */
export async function findFace(src: HTMLCanvasElement): Promise<Found | 'none' | 'many'> {
  const m = await getMesh()
  const r = await new Promise<{ multiFaceLandmarks?: Pt[][] }>((res, rej) => {
    pending = res
    m.send({ image: src }).catch(rej)
  })
  const faces = r.multiFaceLandmarks ?? []
  if (!faces.length) return 'none'
  if (faces.length > 1) return 'many'
  return { pts: faces[0], w: src.width, h: src.height }
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

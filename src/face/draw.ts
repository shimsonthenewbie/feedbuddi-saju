/** 사진 위 겹침 그림(점 찍기·구획선). 사진은 건드리지 않고 위에 얹은 캔버스에만 그린다. */
import type { Found } from './mesh'

const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const px = (f: Found, i: number, W: number, H: number) => ({ x: f.pts[i].x * W, y: f.pts[i].y * H })

export function makeOverlay(cv: HTMLCanvasElement): HTMLCanvasElement {
  const o = document.createElement('canvas')
  o.width = cv.width; o.height = cv.height; o.className = 'fover'
  return o
}

/** 특징점을 하나씩 찍어 나간다 */
export async function drawDots(o: HTMLCanvasElement, f: Found, ms = 1100) {
  const g = o.getContext('2d')!
  const n = f.pts.length, r = Math.max(1.6, o.width / 300)
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => f.pts[a].y - f.pts[b].y)
  const t0 = performance.now(); let k = 0
  await new Promise<void>((done) => {
    const step = () => {
      const upto = Math.min(n, Math.ceil(((performance.now() - t0) / ms) * n))
      g.fillStyle = 'rgba(214,190,60,.9)'
      for (; k < upto; k++) { const p = px(f, order[k], o.width, o.height); g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.fill() }
      if (k < n) requestAnimationFrame(step); else done()
    }
    step()
  })
}

/** 위·가운데·아래 세 칸 점선과 다섯 곳 표시 */
export async function drawGuide(o: HTMLCanvasElement, f: Found, labels: string[], ms = 900) {
  const g = o.getContext('2d')!, W = o.width, H = o.height
  const ys = [10, 9, 2, 152].map((i) => px(f, i, W, H).y)
  const circles = [10, 234, 454, 2, 152].map((i) => px(f, i, W, H))
  const lw = Math.max(2, W / 260), R = Math.max(10, W / 28)
  g.font = `${Math.max(12, W / 26)}px sans-serif`
  const paint = (prog: number) => {
    g.clearRect(0, 0, W, H)
    g.strokeStyle = 'rgba(214,190,60,.9)'; g.lineWidth = lw; g.setLineDash([lw * 4, lw * 3]); g.beginPath()
    ys.forEach((y, i) => { if (prog > i / 5) { g.moveTo(0, y); g.lineTo(W * Math.min(1, (prog - i / 5) * 5), y) } }); g.stroke(); g.setLineDash([])
    // 얼굴 윤곽
    g.strokeStyle = 'rgba(214,190,60,.85)'; g.beginPath()
    OVAL.forEach((i, k) => { const p = px(f, i, W, H); k ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y) }); g.closePath(); g.stroke()
    if (prog > 0.6) {
      g.strokeStyle = 'rgba(160,40,36,.95)'; g.lineWidth = lw * 1.4
      circles.forEach((c) => { g.beginPath(); g.arc(c.x, c.y, R, 0, 7); g.stroke() })
      g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 4; g.lineWidth = lw
      labels.forEach((t, i) => g.fillText(t, 10, ys[i] - 8)); g.shadowBlur = 0
    }
  }
  const t0 = performance.now()
  await new Promise<void>((done) => {
    const step = () => { const p = Math.min(1, (performance.now() - t0) / ms); paint(p); if (p < 1) requestAnimationFrame(step); else done() }
    step()
  })
  await sleep(150)
}

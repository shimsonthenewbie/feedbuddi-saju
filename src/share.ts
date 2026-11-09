/** 친구에게 궁합 보내기: 링크 조각(#inv=…)에 보내는 사람의 생년월일을 담는다. # 뒤는 서버로 전송되지 않는다. */
import { art } from './art'

export interface Invite { n: string; y: number; m: number; d: number; hh: number; mm: number; u: boolean; g: 'M' | 'F'; la: number; lo: number; tz: string }
type Input = { year: number; month: number; day: number; hour: number; minute: number; gender: 'M' | 'F'; latitude?: number; longitude?: number; timezone?: string; unknownTime?: boolean }

const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))

export function makeInviteUrl(i: Input, name: string): string {
  const v: Invite = { n: name.slice(0, 12), y: i.year, m: i.month, d: i.day, hh: i.hour, mm: i.minute, u: !!i.unknownTime, g: i.gender, la: i.latitude ?? 37.5665, lo: i.longitude ?? 126.978, tz: i.timezone ?? 'Asia/Seoul' }
  return `${location.origin}${location.pathname}#inv=${b64(JSON.stringify(v))}`
}

export function readInvite(hash: string): Invite | null {
  const m = /^#inv=([A-Za-z0-9_-]{10,600})$/.exec(hash)
  if (!m) return null
  try {
    const v = JSON.parse(unb64(m[1]))
    const n = (x: unknown, lo: number, hi: number) => typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi
    if (typeof v.n !== 'string' || v.n.length > 12 || !n(v.y, 1900, 2100) || !n(v.m, 1, 12) || !n(v.d, 1, 31) || !n(v.hh, 0, 23) || !n(v.mm, 0, 59) || !n(v.la, -90, 90) || !n(v.lo, -180, 180)) return null
    if (v.g !== 'M' && v.g !== 'F') return null
    if (typeof v.tz !== 'string' || v.tz.length > 40 || !/^[A-Za-z_\/+-]+$/.test(v.tz)) return null
    try { new Intl.DateTimeFormat('en', { timeZone: v.tz }) } catch { return null }
    return { n: v.n.replace(/[<>&"]/g, ''), y: v.y, m: v.m, d: v.d, hh: v.hh, mm: v.mm, u: !!v.u, g: v.g, la: v.la, lo: v.lo, tz: v.tz }
  } catch { return null }
}

export interface CardData { score: number; headline: string; axes: { label: string; value: number }[]; brand: string; foot: string }
const loadImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src })

/** 결과 카드 이미지(1080×1350) */
export async function makeCard(c: CardData): Promise<Blob> {
  const W = 1080, H = 1350
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const g = cv.getContext('2d')!
  const serif = '"Jua","Noto Serif KR",serif', sans = '"Gowun Dodum","Noto Sans KR",sans-serif'
  try { await document.fonts.ready } catch { /* 글꼴이 없으면 기본 글꼴 */ }
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#f6efdc'); bg.addColorStop(1, '#e8dcc0')
  g.fillStyle = bg; g.fillRect(0, 0, W, H)
  g.strokeStyle = '#6a2623'; g.lineWidth = 6; g.strokeRect(36, 36, W - 72, H - 72)
  g.fillStyle = '#6a2623'; g.textAlign = 'center'
  g.font = `64px ${serif}`; g.fillText(c.brand, W / 2, 140)
  try { const im = await loadImg(art('match-sprite')); const s = 420 / im.height; g.drawImage(im, W / 2 - (im.width * s) / 2, 190, im.width * s, 420) } catch { /* 이미지 실패해도 카드는 만든다 */ }
  g.font = `220px ${serif}`; g.fillText(String(c.score), W / 2, 850)
  g.fillStyle = '#5f5a4d'; g.font = `44px ${sans}`; g.fillText('/ 100', W / 2 + 230, 850)
  g.fillStyle = '#1b1a17'; g.font = `56px ${serif}`; g.fillText(c.headline, W / 2, 940)
  c.axes.slice(1).forEach((a, i) => {
    const y = 1020 + i * 62, x0 = 150, bw = 560
    g.textAlign = 'left'; g.fillStyle = '#1b1a17'; g.font = `32px ${sans}`; g.fillText(a.label, x0, y)
    g.fillStyle = '#e7dcc1'; g.fillRect(x0 + 370, y - 26, bw - 140, 22)
    g.fillStyle = '#6a2623'; g.fillRect(x0 + 370, y - 26, ((bw - 140) * a.value) / 100, 22)
    g.fillStyle = '#5f5a4d'; g.fillText(String(a.value), x0 + 370 + bw - 120, y - 4)
  })
  g.textAlign = 'center'; g.fillStyle = '#5f5a4d'; g.font = `30px ${sans}`; g.fillText(c.foot, W / 2, H - 70)
  return await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/png'))
}

export interface FaceCardData { emoji: string; animal: string; title: string; tags: string[]; axes: { label: string; value: number }[]; brand: string; foot: string; mate: string }
/** 관상 결과 카드(사진은 넣지 않는다 — 얼굴 사진이 공유 이미지에 남지 않게) */
export async function makeFaceCard(c: FaceCardData): Promise<Blob> {
  const W = 1080, H = 1350
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H
  const g = cv.getContext('2d')!
  const serif = '"Jua","Noto Serif KR",serif', sans = '"Gowun Dodum","Noto Sans KR",sans-serif'
  try { await document.fonts.ready } catch { /* 기본 글꼴 */ }
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#f6efdc'); bg.addColorStop(1, '#e8dcc0')
  g.fillStyle = bg; g.fillRect(0, 0, W, H)
  g.strokeStyle = '#6a2623'; g.lineWidth = 6; g.strokeRect(36, 36, W - 72, H - 72)
  g.textAlign = 'center'; g.fillStyle = '#6a2623'; g.font = `60px ${serif}`; g.fillText(c.brand, W / 2, 130)
  g.font = '300px "Apple Color Emoji","Noto Color Emoji","Segoe UI Emoji",sans-serif'; g.fillStyle = '#1b1a17'; g.fillText(c.emoji, W / 2, 460)
  g.fillStyle = '#6a2623'; g.font = `130px ${serif}`; g.fillText(c.animal, W / 2, 620)
  g.fillStyle = '#1b1a17'; g.font = `54px ${serif}`
  const words = c.title.split(' '); let line = '', y = 710
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > W - 200 && line) { g.fillText(line, W / 2, y); line = w; y += 70 } else line = t }
  g.fillText(line, W / 2, y)
  g.font = `38px ${sans}`; g.fillStyle = '#5f5a4d'; g.fillText(c.tags.map((t) => '#' + t).join('  '), W / 2, y + 80)
  c.axes.forEach((a, i) => {
    const yy = 960 + i * 62, x0 = 170, bw = 420
    g.textAlign = 'left'; g.fillStyle = '#1b1a17'; g.font = `32px ${sans}`; g.fillText(a.label, x0, yy)
    g.fillStyle = '#e7dcc1'; g.fillRect(x0 + 200, yy - 26, bw, 22)
    g.fillStyle = '#6a2623'; g.fillRect(x0 + 200, yy - 26, (bw * a.value) / 100, 22)
    g.fillStyle = '#5f5a4d'; g.fillText(String(a.value), x0 + 200 + bw + 20, yy - 4)
  })
  g.textAlign = 'center'; g.fillStyle = '#1b1a17'; g.font = `34px ${sans}`; g.fillText(c.mate, W / 2, 1240)
  g.fillStyle = '#5f5a4d'; g.font = `30px ${sans}`; g.fillText(c.foot, W / 2, H - 70)
  return await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/png'))
}

/** 손 모양 관상(재미용). 손 특징점은 브라우저 안에서만 찾고, 사진은 어디로도 보내지 않는다. */
import type { Pt } from '../face/mesh'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HS = any
let hp: Promise<HS> | null = null
let pending: ((r: { multiHandLandmarks?: Pt[][] }) => void) | null = null
const base = () => (globalThis as { __MP_HBASE?: string }).__MP_HBASE ?? `${import.meta.env.BASE_URL}mediapipe/hands/`
const load = (src: string) => new Promise<void>((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('load')); document.head.append(s) })

function getHands(): Promise<HS> {
  if (hp) return hp
  hp = (async () => {
    if (!(globalThis as { Hands?: unknown }).Hands) await load(base() + 'hands.js')
    const Hands = (globalThis as unknown as { Hands: new (o: unknown) => HS }).Hands
    const h = new Hands({ locateFile: (f: string) => base() + f })
    h.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
    h.onResults((r: { multiHandLandmarks?: Pt[][] }) => { pending?.(r) })
    await h.initialize()
    return h
  })().catch((e) => { hp = null; throw e })
  return hp
}

export type HandFound = { pts: Pt[]; w: number; h: number }
export async function findHand(src: HTMLCanvasElement): Promise<HandFound | 'none' | 'many'> {
  const h = await getHands()
  const r = await new Promise<{ multiHandLandmarks?: Pt[][] }>((res, rej) => { pending = res; h.send({ image: src }).catch(rej) })
  const hs = r.multiHandLandmarks ?? []
  if (!hs.length) return 'none'
  if (hs.length > 1) return 'many'
  return { pts: hs[0], w: src.width, h: src.height }
}

export interface HandM { mid: number; aspect: number; idxRing: number; thumb: number; pinky: number; slender: number }
export function measureHand(f: HandFound): HandM {
  const P = f.pts.map((p) => ({ x: p.x * f.w, y: p.y * f.h }))
  const d = (i: number, j: number) => Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y)
  const palmL = d(0, 9), palmW = d(5, 17)
  return { mid: d(9, 12) / palmL, aspect: palmW / palmL, idxRing: d(5, 8) / d(13, 16), thumb: d(2, 4) / palmL, pinky: d(17, 20) / d(13, 16), slender: d(9, 12) / palmW }
}

/** [평균, 표준편차] — 어림잡은 초안 값. 실제 손으로 맞춰 가야 한다. */
const NORM: Record<keyof HandM, [number, number]> = { mid: [0.88, 0.08], aspect: [0.82, 0.07], idxRing: [0.95, 0.05], thumb: [0.62, 0.07], pinky: [0.78, 0.06], slender: [1.08, 0.12] }
const z = (m: HandM, k: keyof HandM) => (m[k] - NORM[k][0]) / NORM[k][1]
const lv = (v: number): 0 | 1 | 2 => (v < -0.5 ? 0 : v > 0.5 ? 2 : 1)

type Lang = 'ko' | 'en'
export type HandEl = 'tree' | 'fire' | 'earth' | 'metal' | 'water'
export interface HandOut { el: HandEl; elName: string; head: string; body: string; mix: { name: string; pct: number }[]; cards: { title: string; body: string }[]; chips: string[] }

const EL: Record<Lang, Record<HandEl, [string, string, string]>> = {
  ko: {
    tree: ['목형 손', '길고 가는 손가락의 손', '손가락이 길고 가늘어요. 섬세하고 감각이 좋아서 손으로 하는 일, 아이디어를 다듬는 일에 힘이 나는 타입이에요.'],
    fire: ['화형 손', '끝이 또렷하고 활동적인 손', '손끝이 또렷하고 손가락이 길어서 표현력과 추진력이 눈에 띄어요. 하고 싶은 일은 일단 움직이고 보는 편이에요.'],
    earth: ['토형 손', '두툼하고 안정감 있는 손', '손바닥이 넓고 든든해요. 믿음직하고 꾸준하게 쌓아 가는 힘이 있는 손이에요.'],
    metal: ['금형 손', '단단하고 반듯한 손', '손바닥이 넓고 손가락이 짧고 반듯해요. 원칙이 분명하고 결정이 빠른 실속형이에요.'],
    water: ['수형 손', '부드럽고 갸름한 손', '손바닥이 갸름하고 부드러워요. 눈치가 빠르고 상황에 유연하게 맞추는 데 능한 손이에요.'],
  },
  en: {
    tree: ['Wood hand', 'Long, slender fingers', 'Long slim fingers: fine-tuned and good with detail work and refining ideas.'],
    fire: ['Fire hand', 'Defined, active hand', 'Defined fingertips and length: expressive and driven. You move first and refine later.'],
    earth: ['Earth hand', 'Broad, steady hand', 'A broad, solid palm: dependable, building things steadily.'],
    metal: ['Metal hand', 'Firm, squared hand', 'Wide palm, short neat fingers: principled, quick to decide, practical.'],
    water: ['Water hand', 'Soft, narrow hand', 'A narrower, softer palm: perceptive and flexible with people and situations.'],
  },
}
const TXT: Record<Lang, { mid: string[]; ir: string[]; pa: string[]; th: string[]; tm: string; ti: string; tp: string; tt: string; note: string; mixT: string }> = {
  ko: {
    mid: ['손가락이 짧은 편이라 직관적이고 결정이 빨라요. 복잡한 것보다 핵심을 짚는 쪽이에요.', '손가락 길이가 고르게 보통이에요. 섬세함과 실행력의 균형이 잡혀 있어요.', '손가락이 긴 편이라 섬세하고 생각이 깊어요. 한 가지를 오래 다듬는 데 강해요.'],
    ir: ['검지가 약지보다 짧은 편이에요. 도전과 승부를 즐기는 쪽에 가까워요.', '검지와 약지 길이가 비슷해요. 신중함과 도전 사이를 상황에 따라 오가요.', '검지가 긴 편이에요. 계획과 책임감을 중시하고 이끄는 걸 잘해요.'],
    pa: ['손바닥이 갸름해요. 유연하고 감각적으로 움직여요.', '손바닥 비율이 보통이에요. 두루 맞춰 가는 안정적인 타입이에요.', '손바닥이 넓어요. 한번 마음먹으면 꾸준히 밀고 가는 힘이 있어요.'],
    th: ['엄지가 짧은 편이에요. 말보다 마음을 아끼는 신중한 타입이에요.', '엄지 길이가 보통이에요. 의지와 융통성이 균형을 이뤄요.', '엄지가 긴 편이에요. 의지가 강하고 하고 싶은 건 해내는 힘이 있어요.'],
    tm: '손가락', ti: '검지와 약지', tp: '손바닥', tt: '엄지', note: '손 모양으로 보는 관상은 재미로 보는 경향 풀이예요. 손금(선)은 읽지 않아요. 사진은 저장되지 않아요.', mixT: '손의 다섯 기운 비율',
  },
  en: {
    mid: ['Shorter fingers: intuitive, decisive, goes for the core.', 'Balanced finger length: detail and action in proportion.', 'Longer fingers: refined and thoughtful; good at polishing one thing.'],
    ir: ['Index shorter than ring: leans toward challenge and competition.', 'Index and ring similar: switches between caution and daring.', 'Longer index: values planning and responsibility; leads well.'],
    pa: ['Narrower palm: flexible and sensory.', 'Average palm: steady, adapts widely.', 'Wide palm: steady drive once decided.'],
    th: ['Shorter thumb: reserved and careful.', 'Average thumb: will balanced with flexibility.', 'Longer thumb: strong will, gets things done.'],
    tm: 'Fingers', ti: 'Index vs ring', tp: 'Palm', tt: 'Thumb', note: 'Hand-shape reading is for fun. Palm lines are not read. Photos are not saved.', mixT: 'Five-element mix of your hand',
  },
}

export function readHand(m: HandM, lang: Lang): HandOut {
  const raw: Record<HandEl, number> = {
    tree: 0.9 * z(m, 'slender') - 0.5 * z(m, 'aspect'),
    fire: 0.6 * z(m, 'mid') + 0.5 * (-z(m, 'idxRing')) + 0.3 * z(m, 'pinky'),
    earth: 0.8 * z(m, 'aspect') - 0.4 * z(m, 'mid') + 0.2 * z(m, 'thumb'),
    metal: 0.6 * z(m, 'aspect') - 0.7 * z(m, 'slender') + 0.2 * z(m, 'idxRing'),
    water: -0.8 * z(m, 'aspect') - 0.2 * z(m, 'thumb') + 0.2 * z(m, 'slender'),
  }
  const els = Object.keys(raw) as HandEl[]
  const ex = els.map((e) => Math.exp(raw[e] * 0.9)), sum = ex.reduce((a, b) => a + b, 0)
  const pcts = ex.map((v) => Math.round((v / sum) * 100))
  const order = els.map((el, i) => ({ el, pct: pcts[i] })).sort((a, b) => b.pct - a.pct)
  const el = order[0].el, T = TXT[lang], E = EL[lang]
  const cards = [{ title: T.tm, body: T.mid[lv(z(m, 'mid'))] }, { title: T.ti, body: T.ir[lv(z(m, 'idxRing'))] }, { title: T.tp, body: T.pa[lv(z(m, 'aspect'))] }, { title: T.tt, body: T.th[lv(z(m, 'thumb'))] }]
  return { el, elName: E[el][0], head: E[el][1], body: E[el][2], mix: order.map((o) => ({ name: E[o.el][0], pct: o.pct })), cards, chips: [E[el][0]] }
}
export const handNote = (lang: Lang) => TXT[lang].note
export const handMixTitle = (lang: Lang) => TXT[lang].mixT

/** 측정값 → 우리 문장. 비율을 '보통 얼굴'과 견줘 낮음/보통/높음으로 나눈다. 기준값(NORM)은 초안이며 테스트하며 다듬는다. */
import type { Metrics } from './measure'

export type Lang = 'ko' | 'en'
type Lv = 0 | 1 | 2 // 낮음·보통·높음

/** [평균, 표준편차]. 실제 얼굴로 테스트하며 조정할 값 */
export const NORM: Record<keyof Omit<Metrics, 'yaw' | 'roll'>, [number, number]> = {
  ratio: [1.15, 0.07], jaw: [0.77, 0.03], upper: [0.24, 0.02], mid: [0.47, 0.025], lower: [0.29, 0.025],
  eyeW: [0.215, 0.012], eyeOpen: [0.26, 0.07], eyeTilt: [6, 3], eyeGap: [1.25, 0.12],
  browLen: [1.45, 0.1], browGap: [0.75, 0.15], browArch: [0.12, 0.03],
  noseW: [1.12, 0.08], noseLen: [0.47, 0.03], mouthW: [0.38, 0.035], lip: [0.32, 0.06],
}
const z = (m: Metrics, k: keyof typeof NORM) => (m[k] - NORM[k][0]) / NORM[k][1]
const lv = (v: number, cut = 0.6): Lv => (v < -cut ? 0 : v > cut ? 2 : 1)

export type Shape = 'round' | 'oval' | 'long' | 'square'
export function shapeOf(m: Metrics): Shape {
  const zr = z(m, 'ratio'), zj = z(m, 'jaw')
  if (zj > 0.8 && zr < 0.8) return 'square'
  if (zr > 0.8) return 'long'
  if (zr < -0.8) return 'round'
  return 'oval'
}

const T = {
  ko: {
    shape: {
      round: ['둥글둥글, 곁에 있으면 편한 인상', '얼굴선이 부드럽고 둥글어요. 옛 관상에서는 사람을 편하게 하고 복을 부르는 선이라고 봐요. 처음 만난 사람에게도 경계심을 잘 풀어 주는 편이에요.'],
      oval: ['균형이 잘 잡힌 인상', '얼굴 길이와 너비가 고르게 어우러져 있어요. 어느 한쪽으로 치우치지 않고, 상황에 맞춰 모습을 바꾸는 유연함이 보여요.'],
      long: ['차분하고 깊이 있는 인상', '얼굴이 길쭉하고 갸름해요. 말수가 적어도 속이 깊고, 한번 마음먹으면 오래 생각하고 움직이는 신중한 타입이라고 봐요.'],
      square: ['단단하고 믿음직한 인상', '턱선이 또렷해서 의지가 강해 보여요. 맡은 일은 끝까지 해내고, 한번 약속하면 지키려는 책임감이 얼굴에 드러나요.'],
    },
    three: {
      title: '이마·코·턱, 세 구간의 균형',
      intro: '옛 관상에서는 얼굴을 위·가운데·아래 세 칸으로 나눠 초년·중년·말년의 기운을 봐요.',
      upper: '위쪽(이마 구간)이 도드라져요. 생각이 앞서고 계획을 세우는 걸 좋아하는 경향이에요. 배움과 윗사람의 도움이 일찍 닿는 모습이라고 봐요.',
      mid: '가운데(눈썹~코 구간)가 도드라져요. 자기 힘으로 일을 밀고 가는 추진력이 보여요. 한창 일할 때 기운이 가장 강하게 오는 모습이에요.',
      lower: '아래쪽(코 아래~턱 구간)이 도드라져요. 사람 곁에서 정을 나누고 오래 쌓는 힘이 보여요. 나이 들수록 안정감이 커지는 모습이라고 봐요.',
      even: '세 구간이 고르게 균형을 이루고 있어요. 한 시기에 몰리지 않고 살면서 기운이 고르게 이어지는 모습이라고 봐요.',
    },
    eye: {
      title: '눈 — 마음이 드러나는 창',
      size: ['눈이 작고 단정해요. 속을 쉽게 드러내지 않고 필요한 것에 집중하는 편이에요.', '눈 크기가 고르고 안정적이에요. 보고 듣는 것을 침착하게 받아들이는 편이에요.', '눈이 시원하게 커요. 감정이 풍부하고 표현이 솔직해서 사람을 끌어당겨요.'],
      tilt: ['눈꼬리가 살짝 내려가 순해 보여요. 상대를 먼저 헤아리는 다정한 기운이에요.', '눈꼬리가 평평해 균형이 좋아요.', '눈꼬리가 위로 올라가 또렷해요. 목표가 분명하면 곧장 나아가는 기운이에요.'],
      gap: ['두 눈이 가까워요. 집중력이 높고 한 가지에 깊이 파고드는 경향이에요.', '두 눈 사이가 적당해요.', '두 눈 사이가 넓어요. 마음이 넓고 느긋하며 큰 그림을 보는 경향이에요.'],
    },
    brow: {
      title: '눈썹 — 사람 사이의 인연',
      len: ['눈썹이 짧고 간결해요. 혼자 해결하는 걸 좋아하고 깔끔한 관계를 선호해요.', '눈썹 길이가 적당해요.', '눈썹이 길게 뻗어 있어요. 의리가 있고 주변 사람을 오래 챙기는 경향이에요.'],
      arch: ['눈썹이 곧고 평평해요. 곧은 성격으로 원칙을 중요하게 여겨요.', '눈썹 곡선이 자연스러워요.', '눈썹이 둥글게 굽어 있어요. 감수성이 섬세하고 분위기를 잘 읽어요.'],
      gap: ['눈썹과 눈이 가까워요. 결단이 빠르고 행동이 야무져요.', '눈썹과 눈 사이가 적당해요.', '눈썹과 눈 사이가 넉넉해요. 느긋하고 여유가 있어서 사람들이 편하게 다가와요.'],
    },
    nose: {
      title: '코 — 자기 힘과 재물을 보는 자리',
      w: ['콧방울이 단정해요. 돈과 일을 꼼꼼히 따지고 아껴 쓰는 경향이에요.', '코 폭이 균형 있어요. 벌고 쓰는 균형이 좋은 모습이에요.', '콧방울이 풍성해요. 옛 관상에서 재물을 담는 모양이라 보고, 베푸는 만큼 들어오는 경향이에요.'],
      len: ['코 구간이 짧아요. 일 처리가 빠르고 결단이 이른 편이에요.', '코 구간 길이가 적당해요.', '코 구간이 길어요. 자존심이 있고 끝까지 책임지려는 경향이에요.'],
    },
    mouth: {
      title: '입 — 말과 복이 드나드는 문',
      w: ['입이 작고 야무져요. 말을 아끼고 신뢰를 쌓는 편이에요.', '입 크기가 균형 있어요.', '입이 시원하게 커요. 표현력이 좋고 사람들과 어울릴 때 빛나요.'],
      lip: ['입술이 얇아요. 말이 정확하고 일을 분명히 하는 편이에요.', '입술 두께가 알맞아요.', '입술이 도톰해요. 정이 많고 베푸는 걸 좋아하는 경향이에요.'],
    },
    jaw: {
      title: '턱선 — 의지와 말년의 힘',
      v: ['턱선이 갸름해요. 감각이 섬세하고 변화를 빨리 알아채요.', '턱선이 알맞게 받쳐 줘요. 부드러움과 단단함이 균형을 이뤄요.', '턱이 넓고 단단해요. 버티는 힘이 있고 꾸준히 쌓아 가는 경향이에요.'],
    },
    axes: ['추진력', '섬세함', '친화력', '신중함'],
    sum: { title: '정리해서 보면', body: (k: string[]) => `${k.join(', ')} — 이런 점이 두드러져요.` },
    note: '관상은 얼굴의 생김새로 성향을 풀어 보는 전통 풍습이에요. 재미와 참고로만 봐 주세요. 사진 속 표정·각도·조명에 따라 결과가 달라질 수 있어요.',
  },
  en: {
    shape: {
      round: ['A round, easygoing presence', 'Soft, rounded lines. Traditional face reading sees this as a warm shape that puts people at ease and softens first meetings.'],
      oval: ['A well-balanced presence', 'Length and width sit evenly together. Nothing leans too far — a flexible nature that adapts to the moment.'],
      long: ['A calm, thoughtful presence', 'A long, slender face. Often read as quiet but deep — someone who thinks things through before moving.'],
      square: ['A solid, dependable presence', 'A defined jawline suggests strong will. Read as someone who follows through and keeps their word.'],
    },
    three: {
      title: 'Forehead, nose, chin — three zones',
      intro: 'Traditional face reading splits the face into upper, middle and lower thirds, linked to early, middle and later life.',
      upper: 'The upper zone stands out: a planner who thinks ahead. Learning and help from elders tend to come early.',
      mid: 'The middle zone stands out: drive and self-reliance. Energy peaks in your working prime.',
      lower: 'The lower zone stands out: warmth and staying power. Stability tends to grow with age.',
      even: 'All three zones are even. Energy tends to stay steady through life rather than peak in one season.',
    },
    eye: {
      title: 'Eyes — the window to your mood',
      size: ['Small, neat eyes: you keep things inside and focus on what matters.', 'Even, steady eyes: you take things in calmly.', 'Big, open eyes: expressive and honest, easy to warm to.'],
      tilt: ['Slightly downturned corners: a gentle, considerate air.', 'Level corners: well balanced.', 'Upturned corners: sharp and goal-driven once you decide.'],
      gap: ['Eyes set close: strong focus, deep dives.', 'Eyes evenly spaced.', 'Eyes set wide: easygoing, sees the big picture.'],
    },
    brow: {
      title: 'Brows — your people ties',
      len: ['Short, clean brows: you like to solve things alone and keep ties tidy.', 'Brows of balanced length.', 'Long brows: loyal, looks after people for a long time.'],
      arch: ['Straight brows: principled and direct.', 'A natural brow curve.', 'Rounded brows: sensitive, reads the room well.'],
      gap: ['Brows close to the eyes: quick to decide, sharp in action.', 'A balanced brow-to-eye gap.', 'A roomy brow-to-eye gap: relaxed and approachable.'],
    },
    nose: {
      title: 'Nose — self-reliance and money',
      w: ['A neat nose tip: careful with money and work.', 'A balanced nose width: earn and spend in balance.', 'A fuller nose tip: traditionally the shape that holds wealth — what you give comes back.'],
      len: ['A short nose zone: quick work, early decisions.', 'A balanced nose length.', 'A long nose zone: proud, sees things through.'],
    },
    mouth: {
      title: 'Mouth — where words and luck pass',
      w: ['A small, tidy mouth: sparing with words, builds trust.', 'A balanced mouth.', 'A wide mouth: expressive, shines in company.'],
      lip: ['Thin lips: precise and clear.', 'Balanced lips.', 'Full lips: warm and generous.'],
    },
    jaw: {
      title: 'Jawline — willpower and later life',
      v: ['A slender jaw: fine sense, notices change quickly.', 'A jaw that supports the face evenly.', 'A broad, firm jaw: staying power, steady build-up.'],
    },
    axes: ['Drive', 'Sensitivity', 'Sociability', 'Caution'],
    sum: { title: 'In short', body: (k: string[]) => `${k.join(', ')} — these stand out.` },
    note: 'Face reading is a traditional way of reading character from features. Take it for fun. Expression, angle and lighting in your photo can change the result.',
  },
} as const

const CHIP = {
  ko: { eyeW: ['작고 단정한 눈', '', '시원하게 큰 눈'], eyeTilt: ['순한 눈꼬리', '', '올라간 눈꼬리'], browLen: ['짧은 눈썹', '', '긴 눈썹'], noseW: ['단정한 코', '', '풍성한 코'], mouthW: ['작고 야무진 입', '', '시원한 입'], jaw: ['갸름한 턱선', '', '단단한 턱'] },
  en: { eyeW: ['Small neat eyes', '', 'Big open eyes'], eyeTilt: ['Gentle eye corners', '', 'Upturned eyes'], browLen: ['Short brows', '', 'Long brows'], noseW: ['Neat nose', '', 'Full nose'], mouthW: ['Small tidy mouth', '', 'Wide mouth'], jaw: ['Slender jaw', '', 'Firm jaw'] },
} as const

export interface FaceCard { title: string; paras: string[] }
export interface FaceOut {
  headline: string
  cards: FaceCard[]
  axes: { label: string; value: number }[]
  chips: string[]
  note: string
  debug: { k: string; v: string; z: string }[]
}

const clamp = (n: number) => Math.max(30, Math.min(95, Math.round(n)))

export function readFace(m: Metrics, lang: Lang): FaceOut {
  const L = T[lang]
  const sh = shapeOf(m)
  const Z = (k: keyof typeof NORM) => z(m, k)
  const lvl = (k: keyof typeof NORM) => lv(Z(k))

  const zs = { upper: Z('upper'), mid: Z('mid'), lower: Z('lower') }
  const top = (Object.keys(zs) as (keyof typeof zs)[]).sort((a, b) => zs[b] - zs[a])[0]
  const three = zs[top] > 0.7 ? L.three[top] : L.three.even

  const eyeP = [L.eye.size[lvl('eyeW')], L.eye.tilt[lvl('eyeTilt')], L.eye.gap[lvl('eyeGap')]]
  const browP = [L.brow.len[lvl('browLen')], L.brow.arch[lvl('browArch')], L.brow.gap[lvl('browGap')]]
  const noseP = [L.nose.w[lvl('noseW')], L.nose.len[lv(Z('mid'))]]
  const mouthP = [L.mouth.w[lvl('mouthW')], L.mouth.lip[lvl('lip')]]

  const sum = (...a: [number, number][]) => a.reduce((s, [w, v]) => s + w * v, 0)
  const ax = [
    sum([1, Z('eyeTilt')], [1, Z('jaw')], [1, Z('browLen')]),
    sum([1, Z('browArch')], [-1, Z('noseW')], [-1, Z('jaw')]),
    sum([1, Z('mouthW')], [1, Z('lip')], [-1, Z('ratio')], [1, Z('eyeOpen')]),
    sum([1, Z('ratio')], [1, Z('upper')], [-1, Z('mouthW')], [-1, Z('eyeOpen')]),
  ].map((v) => clamp(60 + 9 * v))

  // 눈에 띄는 특징 3가지(기준에서 가장 멀리 있는 것)
  const cks = ['eyeW', 'eyeTilt', 'browLen', 'noseW', 'mouthW', 'jaw'] as const
  const chips = cks.filter((k) => Math.abs(Z(k)) > 0.6).sort((a, b) => Math.abs(Z(b)) - Math.abs(Z(a))).slice(0, 3).map((k) => CHIP[lang][k][lvl(k)])

  const keys = Object.keys(NORM) as (keyof typeof NORM)[]
  return {
    headline: L.shape[sh][0],
    cards: [
      { title: L.shape[sh][0], paras: [L.shape[sh][1]] },
      { title: L.three.title, paras: [L.three.intro, three] },
      { title: L.eye.title, paras: eyeP },
      { title: L.brow.title, paras: browP },
      { title: L.nose.title, paras: noseP },
      { title: L.mouth.title, paras: mouthP },
      { title: L.jaw.title, paras: [L.jaw.v[lvl('jaw')]] },
    ],
    axes: L.axes.map((label, i) => ({ label, value: ax[i] })),
    chips,
    note: L.note,
    debug: keys.map((k) => ({ k, v: m[k].toFixed(3), z: Z(k).toFixed(2) })),
  }
}

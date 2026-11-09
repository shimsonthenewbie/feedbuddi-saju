/**
 * 동물상 + "~할 상" 이름표 (재미용). 얼굴 측정 비율의 z값과 동물별 '닮음 방향'을 견줘 가장 가까운 동물을 고른다.
 * 기준값은 face/read.ts 의 NORM 과 같이 초안이며, 사진을 늘려 가며 다듬는다.
 */
import type { Metrics } from './measure'
import { NORM } from './read'

type K = keyof typeof NORM
export type AnimalKey = 'dog' | 'cat' | 'fox' | 'rabbit' | 'bear' | 'deer' | 'tiger' | 'badger' | 'otter'
const z = (m: Metrics, k: K) => (m[k] - NORM[k][0]) / NORM[k][1]

const PROTO: Record<AnimalKey, Partial<Record<K, number>>> = {
  dog: { eyeW: 1, eyeTilt: -1.2, eyeOpen: 0.5, lip: 0.5, ratio: -0.3, browGap: 0.3 },
  cat: { eyeTilt: 1.2, eyeGap: -0.6, ratio: 0.3, mouthW: -0.5, jaw: -0.5, noseW: -0.3 },
  fox: { eyeTilt: 1, ratio: 0.7, jaw: -1, mouthW: -0.6, eyeGap: -0.3 },
  rabbit: { eyeW: 0.8, ratio: -0.4, mouthW: -0.8, jaw: -0.5, lip: 0.2, eyeOpen: 0.6 },
  bear: { ratio: -0.8, jaw: 0.5, eyeW: -0.8, noseW: 0.6, lip: 0.3, eyeTilt: -0.4 },
  deer: { eyeW: 1, ratio: 0.8, eyeTilt: -0.5, jaw: -0.7, browArch: 0.4 },
  tiger: { jaw: 1, eyeTilt: 0.8, browArch: -0.6, mouthW: 0.6, noseW: 0.4 },
  badger: { eyeW: -1, noseLen: 0.6, ratio: 0.3, eyeOpen: -0.6, browLen: 0.3 },
  otter: { ratio: -0.5, eyeW: 0.3, eyeGap: 0.6, mouthW: 0.5, lip: 0.5, noseW: 0.3 },
}
/** 동물마다 '이 특징은 꼭 있어야' 하는 조건. 하나라도 안 맞으면 후보에서 뺀다(기준값이 조금 어긋나도 한 동물로 쏠리지 않게). */
type Gate = [K, '>=' | '<=', number]
const GATE: Record<AnimalKey, Gate[]> = {
  dog: [['eyeTilt', '<=', 0.3], ['eyeW', '>=', -0.2]],
  cat: [['eyeTilt', '>=', 0.5]],
  fox: [['eyeTilt', '>=', 0.6], ['mouthW', '<=', 0.3]],
  rabbit: [['eyeW', '>=', 0.2], ['mouthW', '<=', 0.2]],
  bear: [['ratio', '<=', 0.2], ['jaw', '>=', -0.3]],
  deer: [['ratio', '>=', 0.2], ['eyeW', '>=', 0.2]],
  tiger: [['jaw', '>=', 0.4], ['eyeTilt', '>=', 0.2]],
  badger: [['eyeW', '<=', -0.5], ['noseLen', '>=', 0]],
  otter: [['ratio', '<=', 0.3], ['mouthW', '>=', -0.2]],
}
/** 근거 문장: [키, 방향] → 문장 */
const EVI = {
  ko: {
    'eyeTilt+': '눈꼬리가 위로 올라가 있어요', 'eyeTilt-': '눈꼬리가 살짝 내려가 순해 보여요', 'ratio+': '얼굴이 갸름하고 길어요', 'ratio-': '얼굴이 둥글고 짧은 편이에요',
    'jaw+': '턱선이 단단하고 또렷해요', 'jaw-': '턱선이 갸름해요', 'eyeW+': '눈이 시원하게 커요', 'eyeW-': '눈이 작고 단정해요', 'mouthW+': '입이 시원하게 커요',
    'mouthW-': '입이 작고 단정해요', 'lip+': '입술이 도톰해요', 'lip-': '입술이 얇아요', 'noseW+': '코가 풍성해요', 'noseW-': '코가 단정해요', 'noseLen+': '코 구간이 길어요',
    'eyeGap-': '두 눈이 가까워요', 'eyeGap+': '두 눈 사이가 넓어요', 'browArch-': '눈썹이 곧고 평평해요', 'browArch+': '눈썹이 둥글게 굽어 있어요', 'eyeOpen+': '눈이 동그랗게 열려 있어요',
    'eyeOpen-': '눈매가 길고 가늘어요', 'browLen+': '눈썹이 길게 뻗어 있어요', 'browGap+': '눈썹과 눈 사이가 넉넉해요',
  } as Record<string, string>,
  en: {
    'eyeTilt+': 'Upturned eye corners', 'eyeTilt-': 'Slightly downturned, gentle eyes', 'ratio+': 'A slim, long face', 'ratio-': 'A round, short face',
    'jaw+': 'A firm, defined jaw', 'jaw-': 'A slender jaw', 'eyeW+': 'Big open eyes', 'eyeW-': 'Small, neat eyes', 'mouthW+': 'A wide mouth',
    'mouthW-': 'A small, tidy mouth', 'lip+': 'Full lips', 'lip-': 'Thin lips', 'noseW+': 'A fuller nose', 'noseW-': 'A neat nose', 'noseLen+': 'A long nose zone',
    'eyeGap-': 'Eyes set close', 'eyeGap+': 'Eyes set wide', 'browArch-': 'Straight, flat brows', 'browArch+': 'Rounded brows', 'eyeOpen+': 'Round, open eyes',
    'eyeOpen-': 'Long, narrow eyes', 'browLen+': 'Long brows', 'browGap+': 'A roomy brow-to-eye gap',
  } as Record<string, string>,
}
const EMOJI: Record<AnimalKey, string> = { dog: '🐶', cat: '🐱', fox: '🦊', rabbit: '🐰', bear: '🐻', deer: '🦌', tiger: '🐯', badger: '🦡', otter: '🦦' }
/** 서로 잘 어울리는 짝(재미) */
const MATE: Record<AnimalKey, AnimalKey> = { dog: 'cat', cat: 'dog', fox: 'bear', bear: 'fox', rabbit: 'tiger', tiger: 'rabbit', deer: 'otter', otter: 'deer', badger: 'badger' }

const T = {
  ko: {
    name: { dog: '강아지', cat: '고양이', fox: '여우', rabbit: '토끼', bear: '곰', deer: '사슴', tiger: '호랑이', badger: '오소리', otter: '수달' },
    tags: {
      dog: ['다정함', '충직함', '인복'], cat: ['도도함', '눈치', '독립적'], fox: ['재치', '매력', '센스'], rabbit: ['순수', '친화력', '귀염성'],
      bear: ['듬직함', '푸근함', '뚝심'], deer: ['섬세함', '품위', '감성'], tiger: ['카리스마', '결단력', '승부욕'], badger: ['끈기', '꼼꼼함', '실속'], otter: ['장난기', '활력', '사교성'],
    },
    body: {
      dog: '눈매가 순하고 눈이 맑아서 처음 보는 사람도 마음을 놓게 돼요. 한 번 곁에 두면 끝까지 챙기는 의리가 얼굴에 보여요.',
      cat: '눈꼬리가 올라가고 선이 또렷해요. 가까워지기까지 시간은 걸리지만, 마음을 열면 깊고 오래가는 타입이에요.',
      fox: '갸름한 선과 올라간 눈매에서 센스와 재치가 보여요. 분위기를 읽고 사람을 끄는 힘이 있는 얼굴이에요.',
      rabbit: '맑은 눈과 작고 단정한 입이 순한 인상을 줘요. 주변 사람들의 보호 본능을 자연스럽게 깨우는 얼굴이에요.',
      bear: '둥글고 단단한 윤곽이 푸근해요. 말수는 적어도 한번 맡은 일은 뚝심 있게 끝까지 가져가요.',
      deer: '길고 부드러운 선에 맑은 눈이 어우러져요. 감수성이 섬세하고 품위 있는 분위기를 지녀요.',
      tiger: '또렷한 턱선과 올라간 눈매에서 결단력이 보여요. 한번 마음먹으면 밀고 가는 힘이 있는 얼굴이에요.',
      badger: '작고 깊은 눈에 곧은 코 선이 집중력을 말해줘요. 겉으로 드러내지 않고도 꾸준히 실속을 챙기는 타입이에요.',
      otter: '넉넉한 눈 간격과 시원한 입매가 밝고 장난기 있는 인상을 줘요. 어디서든 분위기를 살리는 힘이 있어요.',
    },
    look: {
      dog: '둥글고 부드러운 윤곽에 눈이 맑고 눈꼬리가 순해요. 처음 보는 사람도 편하게 느끼는 인상이에요.',
      cat: '눈꼬리가 올라가고 얼굴선이 또렷해요. 눈매에서 도도하고 영리한 느낌이 나요.',
      fox: '갸름한 얼굴선에 눈꼬리가 올라가고 입이 작아요. 날렵하고 영리해 보이는 인상이에요.',
      rabbit: '눈이 크고 맑으며 입이 작고 단정해요. 순하고 귀여운 인상이에요.',
      bear: '얼굴이 둥글고 단단해요. 눈이 작고 코가 풍성해서 푸근하고 듬직한 인상이에요.',
      deer: '얼굴이 길고 선이 부드러우며 눈이 커요. 맑고 단아한 인상이에요.',
      tiger: '턱선이 단단하고 눈꼬리가 올라가 있어요. 또렷하고 힘 있는 인상이에요.',
      badger: '눈이 작고 깊으며 코 선이 곧아요. 차분하고 집중력 있어 보이는 인상이에요.',
      otter: '얼굴이 둥글고 입이 시원하게 커요. 밝고 장난기 있는 인상이에요.',
    },
    similar: '이런 점이 닮았어요', mixed: (a: string) => `${a}의 느낌도 조금 섞여 있어요.`,
    fortune: { lead: '왕이 될 상', care: '대기만성 상', friend: '사랑받는 상', art: '감성 부자 상', wealth: '재물이 모이는 상', noble: '귀인을 부르는 상' },
    fortuneBody: {
      lead: '추진력이 두드러져서 사람들 앞에 서면 빛나는 리더 기질이 보여요.',
      care: '신중함이 두드러져요. 서두르지 않는 만큼 시간이 갈수록 빛나는 타입이에요.',
      friend: '친화력이 두드러져서 어디서든 사람이 모이고 도움이 따르는 경향이에요.',
      art: '섬세함이 두드러져요. 감각과 감성으로 먼저 알아채는 힘이 있어요.',
      wealth: '풍성한 코 선이 돈과 기회를 모으는 자리라고 옛 관상은 봐요.',
      noble: '길게 뻗은 눈썹은 사람 인연, 특히 도와주는 어른과의 인연을 뜻한다고 봐요.',
    },
    mate: '잘 어울리는 짝',
    title: (y: number, f: string) => `${y}년의 나는 ${f}`,
    share: (a: string, f: string) => `나는 ${a}상, ${f}! 너는 무슨 관상이야?`,
  },
  en: {
    name: { dog: 'Puppy', cat: 'Cat', fox: 'Fox', rabbit: 'Rabbit', bear: 'Bear', deer: 'Deer', tiger: 'Tiger', badger: 'Badger', otter: 'Otter' },
    tags: {
      dog: ['Warm', 'Loyal', 'Well-liked'], cat: ['Cool', 'Perceptive', 'Independent'], fox: ['Witty', 'Charming', 'Sharp'], rabbit: ['Pure', 'Friendly', 'Cute'],
      bear: ['Steady', 'Cozy', 'Gritty'], deer: ['Delicate', 'Graceful', 'Soulful'], tiger: ['Charismatic', 'Decisive', 'Competitive'], badger: ['Tenacious', 'Meticulous', 'Practical'], otter: ['Playful', 'Lively', 'Social'],
    },
    body: {
      dog: 'Gentle, clear eyes put new people at ease. Once someone is in your corner, you stay loyal to the end.',
      cat: 'Upturned eyes and crisp lines. It takes time to get close, but when you open up it runs deep and lasts.',
      fox: 'Slim lines and upturned eyes read as wit and flair. You read the room and draw people in.',
      rabbit: 'Bright eyes and a small, neat mouth give a gentle look that naturally makes people want to look out for you.',
      bear: 'A round, solid outline feels warm. You say little, but what you take on you carry through.',
      deer: 'Long, soft lines with clear eyes. Delicate sensibility and a graceful air.',
      tiger: 'A defined jaw and upturned eyes show decisiveness. Once you decide, you push it through.',
      badger: 'Small, deep-set eyes and a straight nose line speak of focus. You build quiet, practical results without fanfare.',
      otter: 'Wide-set eyes and an open mouth give a bright, playful look. You lift the mood wherever you go.',
    },
    look: {
      dog: 'Soft round outline, clear eyes and gentle corners. An impression that puts new people at ease.',
      cat: 'Upturned eyes and crisp face lines. Cool and clever around the eyes.',
      fox: 'A slim face with upturned eyes and a small mouth. Sleek and clever-looking.',
      rabbit: 'Big clear eyes and a small tidy mouth. Gentle and cute.',
      bear: 'A round, solid face with small eyes and a fuller nose. Warm and dependable.',
      deer: 'A long face with soft lines and big eyes. Clear and graceful.',
      tiger: 'A firm jaw and upturned eyes. Sharp and strong.',
      badger: 'Small, deep eyes and a straight nose line. Calm and focused.',
      otter: 'A round face and a wide mouth. Bright and playful.',
    },
    similar: 'What matches', mixed: (a: string) => `A touch of ${a} is mixed in.`,
    fortune: { lead: 'Born to lead', care: 'A late bloomer', friend: 'Loved by many', art: 'Rich in feeling', wealth: 'A wealth-gathering face', noble: 'A magnet for mentors' },
    fortuneBody: {
      lead: 'Drive stands out, and you shine when people look to you.',
      care: 'Caution stands out. You do not rush, and you grow brighter with time.',
      friend: 'Sociability stands out. People gather and help follows you.',
      art: 'Sensitivity stands out. You notice through feel before logic.',
      wealth: 'A fuller nose is, in traditional reading, a place where money and chances gather.',
      noble: 'Long brows are read as ties to people, especially helpful elders.',
    },
    mate: 'Best match',
    title: (y: number, f: string) => `${y}: ${f}`,
    share: (a: string, f: string) => `I got the ${a} face — ${f}! What is yours?`,
  },
} as const

export interface AnimalOut {
  key: AnimalKey; emoji: string; name: string; tags: string[]; body: string; look: string; similarT: string; evidence: string[]; mixed: string | null
  fortune: string; fortuneBody: string; title: string; mate: { emoji: string; name: string; label: string }; shareText: string
}

export function animalOf(m: Metrics, axes: { value: number }[], lang: 'ko' | 'en', year = new Date().getFullYear()): AnimalOut {
  const L = T[lang]
  const keys = Object.keys(PROTO) as AnimalKey[]
  const score = (k: AnimalKey) => {
    const w = PROTO[k], ks = Object.keys(w) as K[]
    const norm = Math.sqrt(ks.reduce((q, c) => q + (w[c] as number) ** 2, 0))
    return ks.reduce((q, c) => q + (w[c] as number) * z(m, c), 0) / norm
  }
  const passes = (k: AnimalKey) => GATE[k].every(([c, op, v]) => (op === '>=' ? z(m, c) >= v : z(m, c) <= v))
  const ranked = keys.map((k) => ({ k, s: score(k), ok: passes(k) })).sort((p, q) => q.s - p.s)
  const okList = ranked.filter((r) => r.ok)
  const pool = okList.length ? okList : ranked
  const best = pool[0].k
  const second = pool[1] && pool[1].s >= pool[0].s * 0.75 ? pool[1].k : null
  // 근거: 이 동물의 특징 중 이 얼굴에서 실제로 두드러진 것
  const ev = (Object.keys(PROTO[best]) as K[])
    .map((c) => ({ c, v: (PROTO[best][c] as number) * z(m, c), dir: (PROTO[best][c] as number) > 0 ? '+' : '-' }))
    .filter((e) => e.v >= 0.4 && (L === T.ko ? EVI.ko : EVI.en)[`${e.c}${e.dir}`])
    .sort((p, q) => q.v - p.v).slice(0, 3)
    .map((e) => (L === T.ko ? EVI.ko : EVI.en)[`${e.c}${e.dir}`])
  // 이름표: 재물(코) > 귀인(긴 눈썹) > 가장 높은 축
  const [drive, sense, social, care] = axes.map((a) => a.value)
  let f: keyof typeof L.fortune
  if (z(m, 'noseW') > 1) f = 'wealth'
  else if (z(m, 'browLen') > 1) f = 'noble'
  else {
    const top = Math.max(drive, sense, social, care)
    f = top === drive ? 'lead' : top === social ? 'friend' : top === sense ? 'art' : 'care'
  }
  const mk = MATE[best]
  return {
    key: best, emoji: EMOJI[best], name: L.name[best], tags: [...L.tags[best]], body: L.body[best], look: L.look[best], similarT: L.similar, evidence: ev, mixed: second ? L.mixed(L.name[second]) : null,
    fortune: L.fortune[f], fortuneBody: L.fortuneBody[f], title: L.title(year, L.fortune[f]),
    mate: { emoji: EMOJI[mk], name: L.name[mk], label: L.mate }, shareText: L.share(L.name[best], L.fortune[f]),
  }
}

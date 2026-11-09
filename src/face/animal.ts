/**
 * 동물상 + "~할 상" 이름표 (재미용). 얼굴 측정 비율의 z값과 동물별 '닮음 방향'을 견줘 가장 가까운 동물을 고른다.
 * 기준값은 face/read.ts 의 NORM 과 같이 초안이며, 사진을 늘려 가며 다듬는다.
 * 귀·앞니·볼살·목선처럼 지금 측정하지 못하는 특징은 쓰지 않는다.
 */
import type { Metrics } from './measure'
import { NORM } from './read'

type K = keyof typeof NORM
export type AnimalKey = 'dog' | 'cat' | 'dino' | 'snake' | 'fox' | 'rabbit' | 'turtle' | 'deer' | 'bear' | 'tiger' | 'frog' | 'hamster' | 'horse' | 'mouse' | 'fish'
const z = (m: Metrics, k: K) => (m[k] - NORM[k][0]) / NORM[k][1]

const PROTO: Record<AnimalKey, Partial<Record<K, number>>> = {
  dog: { eyeW: 1, eyeTilt: -1.2, eyeOpen: 0.6, lip: 0.4, ratio: -0.3 },
  cat: { eyeTilt: 1.2, eyeGap: -0.5, ratio: 0.3, mouthW: -0.4, jaw: -0.3, noseW: -0.3 },
  dino: { jaw: 1, mouthW: 0.9, mid: 0.6, browArch: -0.5, noseLen: 0.5, noseW: 0.4 },
  snake: { eyeOpen: -1.1, eyeTilt: 0.7, ratio: 0.6, jaw: -0.6, lip: -0.6 },
  fox: { eyeTilt: 1, ratio: 0.6, jaw: -0.9, mouthW: -0.5, noseLen: 0.3, lower: 0.5, eyeW: -0.3 },
  rabbit: { eyeW: 0.8, eyeOpen: 0.6, ratio: -0.4, mouthW: -0.8, jaw: -0.4 },
  turtle: { eyeOpen: 1, mouthW: 1, eyeW: 0.4, lip: 0.3, ratio: -0.3 },
  deer: { eyeW: 1, ratio: 0.8, eyeTilt: -0.4, jaw: -0.7, browArch: 0.4 },
  bear: { ratio: -0.8, jaw: 0.5, eyeW: -0.7, noseW: 0.6, lip: 0.3, eyeTilt: -0.4 },
  tiger: { jaw: 1, eyeTilt: 0.7, browArch: -0.6, mouthW: 0.6, noseW: 0.4 },
  frog: { eyeW: 1, eyeOpen: 0.8, eyeGap: 0.8, mouthW: 0.7 },
  hamster: { ratio: -1, mouthW: -0.6, eyeW: 0.5, eyeOpen: 0.5, jaw: 0.3 },
  horse: { ratio: 1, mid: 0.8, noseLen: 0.7, jaw: 0.4 },
  mouse: { eyeW: -0.45, mouthW: -0.8, noseW: -0.6, eyeGap: -0.6, ratio: 0.2 },
  fish: { eyeOpen: 0.9, eyeGap: 0.8, eyeW: 0.4, mouthW: -0.2, lip: 0.5, ratio: -0.3 },
}
/** 동물마다 '이 특징은 꼭 있어야' 하는 조건. 하나라도 안 맞으면 후보에서 뺀다(기준값이 조금 어긋나도 한 동물로 쏠리지 않게). */
type Gate = [K, '>=' | '<=', number]
const GATE: Record<AnimalKey, Gate[]> = {
  dog: [['eyeTilt', '<=', 0.3], ['eyeW', '>=', -0.2]],
  cat: [['eyeTilt', '>=', 0.5]],
  dino: [['jaw', '>=', 0.4], ['mouthW', '>=', 0.2], ['eyeTilt', '<=', 0.5]],
  snake: [['eyeOpen', '<=', -0.3], ['ratio', '>=', 0]],
  fox: [['eyeTilt', '>=', 0.6], ['mouthW', '<=', 0.3], ['jaw', '<=', 0.2]],
  rabbit: [['eyeW', '>=', 0.2], ['mouthW', '<=', 0.2]],
  turtle: [['eyeOpen', '>=', 0.3], ['mouthW', '>=', 0.3]],
  deer: [['ratio', '>=', 0.2], ['eyeW', '>=', 0.2]],
  bear: [['ratio', '<=', 0.2], ['jaw', '>=', -0.3]],
  tiger: [['jaw', '>=', 0.4], ['eyeTilt', '>=', 0.2]],
  frog: [['eyeW', '>=', 0.3], ['eyeGap', '>=', 0.2]],
  hamster: [['ratio', '<=', -0.3], ['mouthW', '<=', 0.2]],
  horse: [['ratio', '>=', 0.5], ['noseLen', '>=', 0.2]],
  mouse: [['mouthW', '<=', -0.3], ['eyeW', '<=', 0]],
  fish: [['eyeOpen', '>=', 0.3], ['eyeGap', '>=', 0.3]],
}
const EVI = {
  ko: {
    'eyeTilt+': '눈꼬리가 위로 올라가 있어요', 'eyeTilt-': '눈꼬리가 살짝 내려가 순해 보여요', 'ratio+': '얼굴이 갸름하고 길어요', 'ratio-': '얼굴이 둥글고 짧은 편이에요',
    'jaw+': '턱선이 단단하고 또렷해요', 'jaw-': '턱선이 갸름해요', 'eyeW+': '눈이 시원하게 커요', 'eyeW-': '눈이 작고 단정해요', 'mouthW+': '입이 시원하게 커요',
    'mouthW-': '입이 작고 단정해요', 'lip+': '입술이 도톰해요', 'lip-': '입술이 얇아요', 'noseW+': '코가 풍성해요', 'noseW-': '코가 단정해요', 'noseLen+': '코 구간이 길어요',
    'eyeGap-': '두 눈이 가까워요', 'eyeGap+': '두 눈 사이가 넓어요', 'browArch-': '눈썹이 곧고 평평해요', 'browArch+': '눈썹이 둥글게 굽어 있어요', 'eyeOpen+': '눈이 동그랗게 열려 있어요',
    'eyeOpen-': '눈매가 길고 가늘어요', 'browLen+': '눈썹이 길게 뻗어 있어요', 'browGap+': '눈썹과 눈 사이가 넉넉해요', 'mid+': '얼굴 가운데(눈썹~코) 구간이 길어요',
  } as Record<string, string>,
  en: {
    'eyeTilt+': 'Upturned eye corners', 'eyeTilt-': 'Slightly downturned, gentle eyes', 'ratio+': 'A slim, long face', 'ratio-': 'A round, short face',
    'jaw+': 'A firm, defined jaw', 'jaw-': 'A slender jaw', 'eyeW+': 'Big open eyes', 'eyeW-': 'Small, neat eyes', 'mouthW+': 'A wide mouth',
    'mouthW-': 'A small, tidy mouth', 'lip+': 'Full lips', 'lip-': 'Thin lips', 'noseW+': 'A fuller nose', 'noseW-': 'A neat nose', 'noseLen+': 'A long nose zone',
    'eyeGap-': 'Eyes set close', 'eyeGap+': 'Eyes set wide', 'browArch-': 'Straight, flat brows', 'browArch+': 'Rounded brows', 'eyeOpen+': 'Round, open eyes',
    'eyeOpen-': 'Long, narrow eyes', 'browLen+': 'Long brows', 'browGap+': 'A roomy brow-to-eye gap', 'mid+': 'A long middle zone (brows to nose)',
  } as Record<string, string>,
}
const EMOJI: Record<AnimalKey, string> = { dog: '🐶', cat: '🐱', dino: '🦖', snake: '🐍', fox: '🦊', rabbit: '🐰', turtle: '🐢', deer: '🦌', bear: '🐻', tiger: '🐯', frog: '🐸', hamster: '🐹', horse: '🐴', mouse: '🐭', fish: '🐟' }
/** 서로 잘 어울리는 짝(재미) */
export const MATE: Record<AnimalKey, AnimalKey> = { dog: 'cat', cat: 'dog', fox: 'bear', bear: 'fox', rabbit: 'tiger', tiger: 'rabbit', deer: 'horse', horse: 'deer', snake: 'turtle', turtle: 'snake', dino: 'hamster', hamster: 'dino', frog: 'fish', fish: 'frog', mouse: 'dog' }

const NAME_KO: Record<AnimalKey, string> = { dog: '강아지', cat: '고양이', dino: '공룡', snake: '뱀', fox: '여우', rabbit: '토끼', turtle: '거북이', deer: '사슴', bear: '곰', tiger: '호랑이', frog: '개구리', hamster: '햄스터', horse: '말', mouse: '생쥐', fish: '물고기' }
const NAME_EN: Record<AnimalKey, string> = { dog: 'Puppy', cat: 'Cat', dino: 'Dinosaur', snake: 'Snake', fox: 'Fox', rabbit: 'Rabbit', turtle: 'Turtle', deer: 'Deer', bear: 'Bear', tiger: 'Tiger', frog: 'Frog', hamster: 'Hamster', horse: 'Horse', mouse: 'Mouse', fish: 'Fish' }
const TAGS_KO: Record<AnimalKey, string[]> = {
  dog: ['다정함', '충직함', '인복'], cat: ['도도함', '눈치', '독립적'], dino: ['카리스마', '개성', '입체적'], snake: ['신비로움', '냉정미', '몽환적'], fox: ['재치', '매력', '센스'],
  rabbit: ['순수', '친화력', '귀염성'], turtle: ['밝음', '상큼함', '긍정'], deer: ['섬세함', '품위', '감성'], bear: ['듬직함', '푸근함', '뚝심'], tiger: ['카리스마', '결단력', '승부욕'],
  frog: ['위트', '표현력', '유쾌함'], hamster: ['귀염성', '보호본능', '발랄함'], horse: ['시원시원', '활동적', '자유로움'], mouse: ['기민함', '꼼꼼함', '재치'], fish: ['개성', '도회적', '독특함'],
}
const TAGS_EN: Record<AnimalKey, string[]> = {
  dog: ['Warm', 'Loyal', 'Well-liked'], cat: ['Cool', 'Perceptive', 'Independent'], dino: ['Charismatic', 'Distinct', 'Striking'], snake: ['Mysterious', 'Cool-toned', 'Dreamy'], fox: ['Witty', 'Charming', 'Sharp'],
  rabbit: ['Pure', 'Friendly', 'Cute'], turtle: ['Bright', 'Fresh', 'Positive'], deer: ['Delicate', 'Graceful', 'Soulful'], bear: ['Steady', 'Cozy', 'Gritty'], tiger: ['Charismatic', 'Decisive', 'Competitive'],
  frog: ['Witty', 'Expressive', 'Fun'], hamster: ['Cute', 'Protective-worthy', 'Lively'], horse: ['Open', 'Active', 'Free'], mouse: ['Quick', 'Meticulous', 'Clever'], fish: ['Individual', 'Urban', 'Unique'],
}
const BODY_KO: Record<AnimalKey, string> = {
  dog: '눈매가 순하고 눈이 맑아서 처음 보는 사람도 마음을 놓게 돼요. 한 번 곁에 두면 끝까지 챙기는 의리가 얼굴에 보여요.',
  cat: '눈꼬리가 올라가고 선이 또렷해요. 가까워지기까지 시간은 걸리지만, 마음을 열면 깊고 오래가는 타입이에요.',
  dino: '골격이 뚜렷하고 입매가 시원해서 한 번 보면 잊기 어려운 인상이에요. 개성이 강하고 존재감이 큰 타입이에요.',
  snake: '길고 서늘한 눈매에 선이 매끄러워요. 속을 쉽게 드러내지 않아 신비롭고, 알아갈수록 깊이가 느껴지는 타입이에요.',
  fox: '갸름한 선과 올라간 눈매에서 센스와 재치가 보여요. 분위기를 읽고 사람을 끄는 힘이 있는 얼굴이에요.',
  rabbit: '맑은 눈과 작고 단정한 입이 순한 인상을 줘요. 주변 사람들의 보호 본능을 자연스럽게 깨우는 얼굴이에요.',
  turtle: '동그란 눈과 시원한 입매가 환한 에너지를 줘요. 곁에 있으면 기분이 좋아지는 밝은 분위기의 타입이에요.',
  deer: '길고 부드러운 선에 맑은 눈이 어우러져요. 감수성이 섬세하고 품위 있는 분위기를 지녀요.',
  bear: '둥글고 단단한 윤곽이 푸근해요. 말수는 적어도 한번 맡은 일은 뚝심 있게 끝까지 가져가요.',
  tiger: '또렷한 턱선과 올라간 눈매에서 결단력이 보여요. 한번 마음먹으면 밀고 가는 힘이 있는 얼굴이에요.',
  frog: '큰 눈과 넓은 눈 사이, 시원한 입매에서 위트가 보여요. 표현이 풍부하고 분위기를 유쾌하게 만드는 타입이에요.',
  hamster: '둥글고 아담한 얼굴에 눈이 맑아 귀여운 인상이에요. 발랄하고 주변의 보호 본능을 자극하는 타입이에요.',
  horse: '얼굴과 코 선이 길고 시원시원해요. 활동적이고 막힘 없이 나아가는 자유로운 기질이에요.',
  mouse: '이목구비가 작고 조밀해서 기민한 인상이에요. 눈치가 빠르고 꼼꼼하게 챙기는 타입이에요.',
  fish: '동그란 눈과 넓은 눈 사이로 독특한 비율이 개성 있어요. 도회적이고 자기만의 분위기를 가진 타입이에요.',
}
const BODY_EN: Record<AnimalKey, string> = {
  dog: 'Gentle, clear eyes put new people at ease. Once someone is in your corner, you stay loyal to the end.',
  cat: 'Upturned eyes and crisp lines. It takes time to get close, but when you open up it runs deep and lasts.',
  dino: 'Defined bone structure and an open mouth line make a face that is hard to forget. Strong individuality and presence.',
  snake: 'Long, cool eyes and smooth lines. You keep yourself to yourself, which reads as mysterious; depth shows as people know you.',
  fox: 'Slim lines and upturned eyes read as wit and flair. You read the room and draw people in.',
  rabbit: 'Bright eyes and a small, neat mouth give a gentle look that naturally makes people want to look out for you.',
  turtle: 'Round eyes and an open mouth line carry bright energy. People feel better around you.',
  deer: 'Long, soft lines with clear eyes. Delicate sensibility and a graceful air.',
  bear: 'A round, solid outline feels warm. You say little, but what you take on you carry through.',
  tiger: 'A defined jaw and upturned eyes show decisiveness. Once you decide, you push it through.',
  frog: 'Big eyes set wide and an open mouth show wit. Expressive, and you make a room more fun.',
  hamster: 'A small round face with clear eyes reads as cute. Lively, and people want to look out for you.',
  horse: 'A long face and nose line, open and easy. Active and free-moving by nature.',
  mouse: 'Small, compact features read as quick. Perceptive and careful with details.',
  fish: 'Round eyes set wide give distinctive proportions. Urban, with a mood of your own.',
}
const LOOK_KO: Record<AnimalKey, string> = {
  dog: '둥글고 부드러운 윤곽에 눈이 맑고 눈꼬리가 순해요. 처음 보는 사람도 편하게 느끼는 인상이에요.',
  cat: '눈꼬리가 올라가고 얼굴선이 또렷해요. 눈매에서 도도하고 영리한 느낌이 나요.',
  dino: '턱과 광대의 골격이 뚜렷하고 얼굴 가운데 선이 길어요. 입매가 시원해서 이목구비가 크게 보이는 인상이에요.',
  snake: '눈매가 길고 가늘며 얼굴선이 매끄럽게 갸름해요. 서늘하고 신비로운 인상이에요.',
  fox: '갸름한 얼굴선에 눈꼬리가 올라가고 입이 작아요. 날렵하고 영리해 보이는 인상이에요.',
  rabbit: '눈이 크고 맑으며 입이 작고 단정해요. 순하고 귀여운 인상이에요.',
  turtle: '눈이 동그랗고 입이 가로로 시원해요. 환하게 웃는 모습이 먼저 떠오르는 인상이에요.',
  deer: '얼굴이 길고 선이 부드러우며 눈이 커요. 맑고 단아한 인상이에요.',
  bear: '얼굴이 둥글고 단단해요. 눈이 작고 코가 풍성해서 푸근하고 듬직한 인상이에요.',
  tiger: '턱선이 단단하고 눈꼬리가 올라가 있어요. 또렷하고 힘 있는 인상이에요.',
  frog: '눈이 크고 눈 사이가 넓으며 입이 시원해요. 표정이 풍부하고 위트 있어 보이는 인상이에요.',
  hamster: '얼굴이 둥글고 아담하며 입이 작아요. 눈이 맑아 귀엽고 발랄한 인상이에요.',
  horse: '얼굴이 길고 가운데와 코 선이 길어요. 시원시원하고 큼직한 이목구비의 인상이에요.',
  mouse: '이목구비가 작고 조밀하게 모여 있어요. 기민하고 단정한 동안형 인상이에요.',
  fish: '눈이 동그랗고 두 눈 사이가 넓어요. 비율이 독특해서 개성 있고 도회적인 인상이에요.',
}
const LOOK_EN: Record<AnimalKey, string> = {
  dog: 'Soft round outline, clear eyes and gentle corners. An impression that puts new people at ease.',
  cat: 'Upturned eyes and crisp face lines. Cool and clever around the eyes.',
  dino: 'Strong jaw and cheek structure with a long middle line. The open mouth makes the features read big.',
  snake: 'Long, narrow eyes and a smoothly slender face line. Cool and mysterious.',
  fox: 'A slim face with upturned eyes and a small mouth. Sleek and clever-looking.',
  rabbit: 'Big clear eyes and a small tidy mouth. Gentle and cute.',
  turtle: 'Round eyes and a wide mouth line. A look that brings a bright smile to mind.',
  deer: 'A long face with soft lines and big eyes. Clear and graceful.',
  bear: 'A round, solid face with small eyes and a fuller nose. Warm and dependable.',
  tiger: 'A firm jaw and upturned eyes. Sharp and strong.',
  frog: 'Big eyes set wide and an open mouth. Expressive and witty-looking.',
  hamster: 'A small round face and a small mouth. Clear eyes make it cute and lively.',
  horse: 'A long face with a long middle and nose line. Open, generous features.',
  mouse: 'Small features packed close together. Quick and neat with a youthful look.',
  fish: 'Round eyes set wide. Distinctive proportions that read individual and urban.',
}

const T = {
  ko: {
    name: NAME_KO, tags: TAGS_KO, body: BODY_KO, look: LOOK_KO,
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
    name: NAME_EN, tags: TAGS_EN, body: BODY_EN, look: LOOK_EN,
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
  mix: { emoji: string; name: string; pct: number }[]
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
  // 닮은 정도: 상위 셋을 점수 차이에 따라 100%로 나눈다
  const top3 = pool.slice(0, 3), ex = top3.map((r) => Math.exp((r.s - top3[0].s) / 0.6)), sum = ex.reduce((a, b) => a + b, 0)
  let pcts = ex.map((e) => Math.round((e / sum) * 100)); pcts[0] += 100 - pcts.reduce((a, b) => a + b, 0)
  const mix = top3.map((r, i) => ({ emoji: EMOJI[r.k], name: L.name[r.k], pct: pcts[i] }))
  const mk = MATE[best]
  return {
    key: best, emoji: EMOJI[best], name: L.name[best], tags: [...L.tags[best]], body: L.body[best], look: L.look[best], similarT: L.similar, evidence: ev, mix, mixed: second ? L.mixed(L.name[second]) : null,
    fortune: L.fortune[f], fortuneBody: L.fortuneBody[f], title: L.title(year, L.fortune[f]),
    mate: { emoji: EMOJI[mk], name: L.name[mk], label: L.mate }, shareText: L.share(L.name[best], L.fortune[f]),
  }
}

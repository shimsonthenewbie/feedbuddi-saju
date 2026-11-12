/**
 * 외국인용 "내 한국 이름 만들기". 이름 철자로 소리가 닮은 첫 글자를 고르고, 뜻이 좋은 글자를 이어 붙이는 재미용 기능이다.
 * 같은 이름은 늘 같은 결과(다시 만들기 누르면 다른 조합). 글자 뜻은 흔히 쓰는 한자 하나를 기준으로 한 예시다.
 */
type Wx = '木' | '火' | '土' | '金' | '水'
interface Syl { h: string; r: string; en: string; ko: string; wx: Wx; g: 'F' | 'M' | 'N'; l: string }
// l: 소리가 닮은 영문 첫 글자들
const FIRST: Syl[] = [
  { h: '서', r: 'Seo', en: 'auspicious', ko: '상서로운', wx: '金', g: 'N', l: 'SZX' },
  { h: '수', r: 'Su', en: 'excellent', ko: '빼어난', wx: '金', g: 'N', l: 'SZ' },
  { h: '선', r: 'Seon', en: 'goodness', ko: '선한', wx: '金', g: 'F', l: 'SC' },
  { h: '지', r: 'Ji', en: 'wise', ko: '지혜로운', wx: '金', g: 'N', l: 'JGZ' },
  { h: '주', r: 'Ju', en: 'jewel', ko: '구슬', wx: '金', g: 'N', l: 'J' },
  { h: '재', r: 'Jae', en: 'talented', ko: '재주 있는', wx: '金', g: 'N', l: 'JG' },
  { h: '준', r: 'Jun', en: 'handsome and gifted', ko: '준수한', wx: '金', g: 'M', l: 'JZ' },
  { h: '진', r: 'Jin', en: 'truthful', ko: '참된', wx: '金', g: 'N', l: 'JGZ' },
  { h: '민', r: 'Min', en: 'quick-witted', ko: '총명한', wx: '水', g: 'N', l: 'MN' },
  { h: '미', r: 'Mi', en: 'beautiful', ko: '아름다운', wx: '水', g: 'F', l: 'M' },
  { h: '도', r: 'Do', en: 'the right path', ko: '길', wx: '火', g: 'M', l: 'DT' },
  { h: '다', r: 'Da', en: 'abundant', ko: '넉넉한', wx: '火', g: 'F', l: 'DT' },
  { h: '하', r: 'Ha', en: 'great like summer', ko: '여름처럼 큰', wx: '土', g: 'N', l: 'HFV' },
  { h: '현', r: 'Hyeon', en: 'virtuous', ko: '어진', wx: '土', g: 'M', l: 'HF' },
  { h: '혜', r: 'Hye', en: 'grace', ko: '은혜로운', wx: '土', g: 'F', l: 'HF' },
  { h: '은', r: 'Eun', en: 'silver-bright', ko: '은빛', wx: '土', g: 'F', l: 'EI' },
  { h: '아', r: 'A', en: 'elegant', ko: '고운', wx: '土', g: 'F', l: 'AO' },
  { h: '예', r: 'Ye', en: 'artful', ko: '재능 있는', wx: '土', g: 'F', l: 'Y' },
  { h: '유', r: 'Yu', en: 'gentle and rich', ko: '넉넉한', wx: '土', g: 'N', l: 'YU' },
  { h: '윤', r: 'Yun', en: 'shining', ko: '빛나는', wx: '土', g: 'N', l: 'YU' },
  { h: '연', r: 'Yeon', en: 'graceful lotus', ko: '연꽃', wx: '土', g: 'F', l: 'YL' },
  { h: '나', r: 'Na', en: 'graceful', ko: '우아한', wx: '火', g: 'F', l: 'N' },
  { h: '라', r: 'Ra', en: 'silk-like', ko: '비단 같은', wx: '火', g: 'F', l: 'RL' },
  { h: '린', r: 'Rin', en: 'bright jade', ko: '옥처럼 맑은', wx: '火', g: 'F', l: 'RL' },
  { h: '로', r: 'Ro', en: 'dew', ko: '이슬', wx: '火', g: 'N', l: 'RL' },
  { h: '가', r: 'Ga', en: 'lovely', ko: '아름다운', wx: '木', g: 'F', l: 'G' },
  { h: '태', r: 'Tae', en: 'peaceful and grand', ko: '크고 평안한', wx: '火', g: 'M', l: 'T' },
  { h: '채', r: 'Chae', en: 'colorful', ko: '빛깔 고운', wx: '金', g: 'F', l: 'C' },
  { h: '세', r: 'Se', en: 'of the world', ko: '세상', wx: '金', g: 'N', l: 'S' },
  { h: '소', r: 'So', en: 'bright', ko: '밝은', wx: '金', g: 'F', l: 'S' },
  { h: '영', r: 'Young', en: 'flourishing', ko: '무성한', wx: '土', g: 'N', l: 'Y' },
  { h: '기', r: 'Gi', en: 'rising spirit', ko: '솟는 기운', wx: '木', g: 'M', l: 'KGQ' },
  { h: '경', r: 'Kyung', en: 'respectful jewel', ko: '공경하는 옥', wx: '木', g: 'N', l: 'KQ' },
  { h: '비', r: 'Bi', en: 'flying high', ko: '높이 나는', wx: '水', g: 'N', l: 'BV' },
  { h: '보', r: 'Bo', en: 'treasure', ko: '보배', wx: '水', g: 'N', l: 'BP' },
  { h: '우', r: 'Woo', en: 'friend of the universe', ko: '넓은 하늘의 벗', wx: '土', g: 'N', l: 'WUV' },
  { h: '원', r: 'Won', en: 'round and whole', ko: '둥글고 온전한', wx: '土', g: 'N', l: 'W' },
  { h: '이', r: 'I', en: 'beneficial', ko: '이로운', wx: '土', g: 'N', l: 'I' },
  { h: '파', r: 'Pa', en: 'wave', ko: '물결', wx: '水', g: 'N', l: 'P' },
  { h: '화', r: 'Hwa', en: 'harmony', ko: '화목한', wx: '土', g: 'F', l: 'FH' },
]
const SECOND: Syl[] = [
  { h: '연', r: 'yeon', en: 'graceful lotus', ko: '연꽃', wx: '土', g: 'F', l: '' },
  { h: '아', r: 'a', en: 'elegant', ko: '고운', wx: '土', g: 'F', l: '' },
  { h: '은', r: 'eun', en: 'kindness', ko: '은혜', wx: '土', g: 'F', l: '' },
  { h: '윤', r: 'yun', en: 'shining', ko: '빛나는', wx: '土', g: 'N', l: '' },
  { h: '희', r: 'hui', en: 'joy', ko: '기쁨', wx: '土', g: 'F', l: '' },
  { h: '린', r: 'rin', en: 'bright jade', ko: '맑은 옥', wx: '火', g: 'F', l: '' },
  { h: '서', r: 'seo', en: 'auspicious', ko: '상서로운', wx: '金', g: 'N', l: '' },
  { h: '하', r: 'ha', en: 'great', ko: '큰', wx: '土', g: 'N', l: '' },
  { h: '원', r: 'won', en: 'round and whole', ko: '온전한', wx: '土', g: 'N', l: '' },
  { h: '현', r: 'hyeon', en: 'wise', ko: '어진', wx: '土', g: 'N', l: '' },
  { h: '준', r: 'jun', en: 'gifted', ko: '준수한', wx: '金', g: 'M', l: '' },
  { h: '호', r: 'ho', en: 'brave and vast', ko: '넓고 호방한', wx: '土', g: 'M', l: '' },
  { h: '진', r: 'jin', en: 'truthful', ko: '참된', wx: '金', g: 'N', l: '' },
  { h: '우', r: 'woo', en: 'universe', ko: '넓은 하늘', wx: '土', g: 'M', l: '' },
  { h: '훈', r: 'hun', en: 'bright merit', ko: '빛나는 공', wx: '土', g: 'M', l: '' },
  { h: '민', r: 'min', en: 'quick-witted', ko: '총명한', wx: '水', g: 'N', l: '' },
  { h: '영', r: 'young', en: 'flourishing', ko: '무성한', wx: '土', g: 'N', l: '' },
  { h: '빈', r: 'bin', en: 'shining brightly', ko: '빛나는', wx: '水', g: 'N', l: '' },
  { h: '솔', r: 'sol', en: 'pine tree', ko: '소나무', wx: '金', g: 'N', l: '' },
  { h: '결', r: 'gyeol', en: 'flowing grain', ko: '고운 결', wx: '木', g: 'N', l: '' },
  { h: '별', r: 'byeol', en: 'star', ko: '별', wx: '水', g: 'F', l: '' },
  { h: '람', r: 'ram', en: 'worth and reward', ko: '보람', wx: '火', g: 'N', l: '' },
]
const SURNAMES: Array<[string, string, string, string]> = [
  ['김', 'Kim', 'gold', '금'], ['이', 'Lee', 'plum tree', '오얏나무'], ['박', 'Park', 'gourd, simple heart', '박(순박함)'], ['최', 'Choi', 'the highest peak', '높은 봉우리'],
  ['정', 'Jung', 'upright', '바름'], ['강', 'Kang', 'river', '강'], ['조', 'Cho', 'dawn', '아침'], ['윤', 'Yoon', 'permitted, trusted', '믿음'],
  ['장', 'Jang', 'long, growing', '길게 자라는'], ['임', 'Lim', 'forest', '숲'], ['한', 'Han', 'great and one', '크고 하나'], ['오', 'Oh', 'the self, the sun', '나'],
  ['서', 'Seo', 'west, auspicious', '서쪽·상서'], ['신', 'Shin', 'trust', '믿음'], ['권', 'Kwon', 'authority', '권위'], ['황', 'Hwang', 'yellow, radiant', '누런 빛'],
  ['안', 'Ahn', 'peaceful', '평안'], ['송', 'Song', 'pine tree', '소나무'], ['류', 'Ryu', 'flowing', '흐름'], ['홍', 'Hong', 'wide, red', '붉음'],
]
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }

export interface KoName { family: string; given: string; full: string; rom: string; parts: Array<{ h: string; r: string; en: string; ko: string }>; surnameGloss: [string, string]; story: [string, string]; wx: string }
export type Gender = 'F' | 'M' | 'N'
const koWx: Record<Wx, string> = { 木: '목', 火: '화', 土: '토', 金: '금', 水: '수' }

/** 영문 이름(+성별, +다시 만들기 번호)으로 한국 이름 하나를 만든다. missing: 사주에 부족한 오행(있으면 맞추려 함) */
export function makeKoName(latin: string, gender: Gender, variant = 0, missing: Wx[] = []): KoName | null {
  const clean = latin.replace(/[^A-Za-z]/g, '').toUpperCase()
  if (clean.length < 2) return null
  const seed = `${clean}|${variant}`
  const sur = SURNAMES[hash(seed + 's') % SURNAMES.length]
  const first = clean[0]
  const okG = (x: Syl) => gender === 'N' || x.g === 'N' || x.g === gender
  let pool1 = FIRST.filter((x) => x.l.includes(first) && okG(x))
  if (!pool1.length) pool1 = FIRST.filter(okG)
  if (missing.length) { const m = pool1.filter((x) => missing.includes(x.wx)); if (m.length) pool1 = m }
  const a = pool1[hash(seed + 'a') % pool1.length]
  let pool2 = SECOND.filter((x) => okG(x) && x.h !== a.h)
  const pref = pool2.filter((x) => missing.includes(x.wx))
  if (pref.length && hash(seed + 'm') % 3 !== 0) pool2 = pref
  const b = pool2[hash(seed + 'b') % pool2.length]
  const given = a.h + b.h
  const rom = `${sur[1]} ${a.r}-${b.r}`
  const story: [string, string] = [
    `${a.r} (${a.en}) + ${b.r} (${b.en})`,
    `"${a.en}" and "${b.en}" together: a name that wishes you a ${a.en}, ${b.en} life.`,
  ]
  return {
    family: sur[0], given, full: sur[0] + given, rom,
    parts: [{ h: a.h, r: a.r, en: a.en, ko: a.ko }, { h: b.h, r: b.r, en: b.en, ko: b.ko }],
    surnameGloss: [sur[2], sur[3]], story, wx: `${koWx[a.wx]}·${koWx[b.wx]}`,
  }
}

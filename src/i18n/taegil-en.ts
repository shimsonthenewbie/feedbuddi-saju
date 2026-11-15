/** 택일 영어 화면: 한국어로 만든 이유 문장을 영어로 바꾼다. */
import type { CatKey, DayPick } from '../myeongri/taegil'

export const CAT_EN: Record<CatKey, { name: string; short: string; hint: string }> = {
  move: { name: 'Moving house', short: 'moving', hint: 'the day you move into a new home' },
  wedding: { name: 'Wedding / meeting the family', short: 'a wedding', hint: 'wedding, engagement, first family meeting' },
  open: { name: 'Business opening', short: 'opening a business', hint: 'opening a shop or hanging the sign' },
  contract: { name: 'Contract / deal', short: 'contracts and deals', hint: 'contracts, property and big deals' },
  build: { name: 'Construction / renovation', short: 'construction', hint: 'breaking ground, repairs, interior work' },
  trip: { name: 'Trip / business travel', short: 'travel', hint: 'the day you set off on a long journey' },
  car: { name: 'Buying a car or big item', short: 'big purchases', hint: 'buying or receiving a car or large appliance' },
  medical: { name: 'Surgery / start of treatment', short: 'starting treatment', hint: 'starting major treatment or a procedure' },
  rite: { name: 'Ritual / prayer', short: 'rituals and prayer', hint: 'ancestral rites, blessings, prayer' },
  study: { name: 'Enrolling / learning something new', short: 'starting to study', hint: 'enrolling, starting a new subject or skill' },
  burial: { name: 'Funeral / reburial', short: 'funerals', hint: 'funerals, reburial and grave matters' },
}
export const ZODIAC_EN: Record<string, string> = { 子: 'Rat', 丑: 'Ox', 寅: 'Tiger', 卯: 'Rabbit', 辰: 'Dragon', 巳: 'Snake', 午: 'Horse', 未: 'Goat', 申: 'Monkey', 酉: 'Rooster', 戌: 'Dog', 亥: 'Pig' }
export const GRADE_EN: Record<DayPick['grade'], string> = { 대길: 'Excellent', 길: 'Good', 보통: 'Fair', 조심: 'Careful', 피하세요: 'Avoid' }
const OFFICER: Record<string, string> = { 건: 'Establish', 제: 'Remove', 만: 'Full', 평: 'Balance', 정: 'Settle', 집: 'Hold', 파: 'Destroy', 위: 'Danger', 성: 'Complete', 수: 'Receive', 개: 'Open', 폐: 'Close' }
const SS: Record<string, string> = {
  '나와 같은 힘의 날': 'a day of equal strength to yours', '내 몫을 나누게 되는 경쟁의 날': 'a competitive day when you may have to share what is yours',
  '여유롭게 표현하고 즐기는 날': 'a relaxed day for expression and enjoyment', '말이 앞서고 튀기 쉬운 날': 'a day when words run ahead and you stand out',
  '큰 돈과 기회가 움직이는 날': 'a day when big money and chances move', '안정적인 돈과 실속이 따르는 날': 'a day of steady money and real gains',
  '압박과 긴장이 오는 날': 'a day of pressure and tension', '신용과 질서가 서는 날': 'a day when trust and order hold',
  '생각이 많고 변덕이 생기는 날': 'a day of overthinking and changeable moods', '문서와 도움, 안정이 따르는 날': 'a day of paperwork, help and stability',
}
const DIR: Record<string, string> = { 동쪽: 'east', 남쪽: 'south', 서쪽: 'west', 북쪽: 'north' }

export function reasonEn(s: string, catShort: (ko: string) => string): string {
  let m: RegExpMatchArray | null
  if ((m = s.match(/^전통 책력에서 (.+?) 일에 맞다고 보는 날$/))) return `The traditional almanac marks it as suited to ${catShort(m[1])}`
  if ((m = s.match(/^전통 책력에서 (.+?) 일을 꺼리는 날$/))) return `The traditional almanac advises against ${catShort(m[1])}`
  if (s === '모든 일에 좋지 않다고 보는 날') return 'Considered unfavorable for everything'
  if (s.startsWith('황도일')) return 'An auspicious "yellow path" day (lucky spirits in attendance)'
  if (s.startsWith('흑도일')) return 'An inauspicious "black path" day'
  if ((m = s.match(/^건제 12신: (.)/))) return `Twelve Day Officers: ${OFFICER[m[1]] ?? m[1]}`
  if (s.startsWith('손 없는 날')) return 'A "no-evil-spirits" day (lunar 9th, 10th, 19th, 20th, 29th or 30th), traditionally best for moving'
  if ((m = s.match(/^(내 띠\(.+\)|내 일지)와 (충|원진|합)이 되는 날$/))) {
    const who = m[1] === '내 일지' ? 'your day branch' : 'your zodiac sign'
    return m[2] === '충' ? `Clashes with ${who}` : m[2] === '원진' ? `In tension with ${who} (won-jin)` : `Harmonizes with ${who}`
  }
  if ((m = s.match(/^내 일간 기준 (.+)$/))) return `For your day master: ${SS[m[1]] ?? m[1]}`
  return s
}
export function noteEn(s: string): string {
  const m = s.match(/^이날은 (.+?) 방향/)
  return m ? `Evil influence is said to sit in the ${DIR[m[1]] ?? m[1]} on this day, so avoid moving in that direction if you can.` : s
}
export function lunarEn(s: string): string {
  const m = s.match(/(\d+)월 (\d+)일/)
  return m ? `Lunar month ${m[1]}, day ${m[2]}` : s
}

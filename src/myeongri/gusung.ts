/**
 * 구성기학(九星氣學): 본명성과 해·달의 방위 길흉.
 * 계산 규칙(입춘 기준 연성, 낙서 비행 순서, 오황살·암검살·본명살·본명적살)은 전통 규칙이고
 * 풀이 글은 용용사주가 새로 쓴 것이다.
 */
import { Solar } from 'lunar-javascript'

export type El = '水' | '土' | '木' | '金' | '火'
interface Star { name: string; hanja: string; el: El; dir: string }
export const STARS: Record<number, Star> = {
  1: { name: '일백수성', hanja: '一白水星', el: '水', dir: '북' },
  2: { name: '이흑토성', hanja: '二黑土星', el: '土', dir: '남서' },
  3: { name: '삼벽목성', hanja: '三碧木星', el: '木', dir: '동' },
  4: { name: '사록목성', hanja: '四綠木星', el: '木', dir: '남동' },
  5: { name: '오황토성', hanja: '五黃土星', el: '土', dir: '중앙' },
  6: { name: '육백금성', hanja: '六白金星', el: '金', dir: '북서' },
  7: { name: '칠적금성', hanja: '七赤金星', el: '金', dir: '서' },
  8: { name: '팔백토성', hanja: '八白土星', el: '土', dir: '북동' },
  9: { name: '구자화성', hanja: '九紫火星', el: '火', dir: '남' },
}
const GEN: Record<El, El> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const CTRL: Record<El, El> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

/** 비행 순서(낙서): 중앙→북서→서→북동→남→북→남서→동→남동 */
export const DIRS = ['중앙', '북서', '서', '북동', '남', '북', '남서', '동', '남동'] as const
export type Dir = (typeof DIRS)[number]
const OPP: Record<string, string> = { 북: '남', 남: '북', 동: '서', 서: '동', 북동: '남서', 남서: '북동', 북서: '남동', 남동: '북서' }

const reduce = (n: number) => { while (n > 9) n = String(n).split('').reduce((a, c) => a + +c, 0); return n }
const wrap9 = (n: number) => ((n - 1) % 9 + 9) % 9 + 1

const GZ = '甲乙丙丁戊己庚辛壬癸'
const BR = '子丑寅卯辰巳午未申酉戌亥'
const ganjiYear = (y: number) => GZ[(((y - 4) % 10) + 10) % 10] + BR[(((y - 4) % 12) + 12) % 12]

/** 입춘 기준 연도(입춘 전이면 전년) */
export function ipchunYear(y: number, m: number, d: number): number {
  const l = Solar.fromYmd(y, m, d).getLunar()
  return l.getYearInGanZhiExact() === ganjiYear(y) ? y : y - 1
}
/** 그 해의 중궁성(연반) */
export const yearCenter = (ey: number) => wrap9(11 - reduce(ey))
/** 본명성 */
export function bonmyeong(ey: number, gender: 'M' | 'F'): number {
  const s = reduce(ey)
  return gender === 'M' ? wrap9(11 - s) : wrap9(s + 4)
}

/** 중궁성 c일 때 각 방위에 오는 별 */
export function layout(c: number): Record<Dir, number> {
  const out = {} as Record<Dir, number>
  DIRS.forEach((d, k) => { out[d] = wrap9(c + k) })
  return out
}

/** 월반 중궁성: 입절 월 기준(寅월=입춘~경칩) */
export function monthCenter(ey: number, monthBranch: string): number {
  const yb = BR[(((ey - 4) % 12) + 12) % 12]
  const base = '子午卯酉'.includes(yb) ? 8 : '辰戌丑未'.includes(yb) ? 5 : 2
  const order = '寅卯辰巳午未申酉戌亥子丑'
  return wrap9(base - order.indexOf(monthBranch))
}

export type Verdict = '대길' | '길' | '보통' | '조심' | '피하세요'
export interface DirRead { dir: Dir; star: number; verdict: Verdict; why: string }

/** 내 본명성 기준 방위 평가 */
export function readLayout(c: number, mine: number): DirRead[] {
  const lay = layout(c)
  const me = STARS[mine].el
  const five = DIRS.find((d) => lay[d] === 5)!
  const out: DirRead[] = []
  for (const d of DIRS) {
    if (d === '중앙') continue
    const s = lay[d]
    const el = STARS[s].el
    let verdict: Verdict, why: string
    if (s === 5) { verdict = '피하세요'; why = '오황살 방위예요. 가장 꺼리는 방향이에요.' }
    else if (OPP[five] === d) { verdict = '피하세요'; why = '암검살 방위예요. 오황살의 맞은편으로 역시 꺼려요.' }
    else if (s === mine) { verdict = '피하세요'; why = '내 본명성이 앉은 본명살 방위예요.' }
    else if (OPP[d] === Object.keys(lay).find((k) => lay[k as Dir] === mine)) { verdict = '피하세요'; why = '본명살의 맞은편인 본명적살 방위예요.' }
    else if (GEN[el] === me) { verdict = '대길'; why = '이 방위의 별이 내 기운을 키워 줘요.' }
    else if (el === me) { verdict = '길'; why = '이 방위의 별이 나와 같은 기운이라 편안해요.' }
    else if (CTRL[me] === el) { verdict = '보통'; why = '내가 다스리는 기운이에요. 노력하면 실속이 생겨요.' }
    else if (GEN[me] === el) { verdict = '보통'; why = '내 기운을 쓰게 되는 방위예요. 힘이 좀 들어요.' }
    else { verdict = '조심'; why = '이 방위의 별이 내 기운을 누르는 쪽이에요.' }
    out.push({ dir: d, star: s, verdict, why })
  }
  return out
}

export interface GusungResult {
  ey: number
  mine: number
  yearStar: number
  monthStar: number
  year: DirRead[]
  month: DirRead[]
  monthLabel: string
  yearLabel: number
}
export function gusungOf(y: number, m: number, d: number, gender: 'M' | 'F', now = new Date()): GusungResult {
  const ey = ipchunYear(y, m, d)
  const mine = bonmyeong(ey, gender)
  const ny = ipchunYear(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const yc = yearCenter(ny)
  const lu = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate()).getLunar()
  const mb: string = lu.getMonthZhiExact()
  const mc = monthCenter(ny, mb)
  return { ey, mine, yearStar: yc, monthStar: mc, year: readLayout(yc, mine), month: readLayout(mc, mine), monthLabel: `${mb}월(절기 기준)`, yearLabel: ny }
}

/** 본명성별 성격 글 */
export const STAR_TEXT: Record<number, [string, string]> = {
  1: ['물처럼 스며드는 사람', '유연하고 눈치가 빠르며 사람 사이를 잇는 힘이 있어요. 속마음을 잘 안 보여서 오해받기도 하니, 중요한 말은 입 밖으로 꺼내세요.'],
  2: ['땅처럼 받쳐 주는 사람', '성실하고 책임감이 강해요. 묵묵히 뒷받침하다 지치기 쉬우니, 힘들다는 말을 하는 연습을 하세요.'],
  3: ['싹처럼 뻗는 사람', '시작이 빠르고 활동적이에요. 말과 행동이 앞서다 마무리가 약해질 수 있어서, 끝맺음을 챙기면 크게 커요.'],
  4: ['바람처럼 어울리는 사람', '사교적이고 신용을 중시해요. 인연과 소식이 많은 만큼 결정이 늦어질 수 있으니 기준을 하나 세우세요.'],
  5: ['한가운데의 큰 사람', '존재감이 크고 추진력이 강해요. 주변에 영향을 많이 주니 독선만 조심하면 리더로 설 수 있어요.'],
  6: ['하늘처럼 이끄는 사람', '원칙과 품위를 중시하는 리더형이에요. 완벽주의로 자신을 몰아붙이지 않게 쉼을 챙기세요.'],
  7: ['기쁨을 나누는 사람', '말솜씨와 매력이 있고 즐길 줄 알아요. 재미를 좇다 돈이 새기 쉬우니 지출 기준을 정해 두세요.'],
  8: ['산처럼 쌓는 사람', '꾸준히 쌓고 바꿀 때 확실히 바꿔요. 고집이 세 보일 수 있으니 한 번 더 들어 주세요.'],
  9: ['불처럼 빛나는 사람', '감각과 열정이 뛰어나고 눈에 띄어요. 감정의 기복이 있으니 큰 결정은 가라앉은 뒤에 하세요.'],
}

import type { SajuResult } from '@orrery/core/types'
import type { Pick } from '../../myeongri/pick'
import { ganziKo } from '../consult'

const ANIMAL_KO = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지']
const ANIMAL_EN = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
const BR = '子丑寅卯辰巳午未申酉戌亥'
const EL_KO: Record<string, string> = { tree: '나무(목)', fire: '불(화)', earth: '흙(토)', metal: '쇠(금)', water: '물(수)' }
const EL_EN: Record<string, string> = { tree: 'wood', fire: 'fire', earth: 'earth', metal: 'metal', water: 'water' }

const T = {
  ko: {
    title: '나와 잘 맞는 사주',
    sum: (el: string) => `내 사주에는 ${el} 기운이 도움이 돼요. 태어난 해의 기운이 이걸 채워 주고, 띠가 서로 끌리는 사람이 편하게 맞는 경향이 있어요.`,
    you: '아래는 태어난 해만으로 본 가벼운 참고예요. 월·일·시가 빠져 있어 정확한 궁합은 아니에요.',
    bestT: '잘 맞는 경향이 있는 해', careT: '맞춰 가는 데 신경 쓸 해', none: '뚜렷하게 나뉘는 해가 없어요.',
    tag: { best: '잘 맞는 편', care: '맞춰 가기' },
    note: '태어난 해는 입춘(2월 4일쯤)을 기준으로 해요. 1월·2월 초에 태어난 사람은 전년도로 봐야 할 수 있어요. 전통 명리 이론에 따른 경향이지, 사람의 좋고 나쁨이 아니에요.',
    toMatch: '생년월일시로 정확한 궁합 보기',
    title1: (p: Pick) => `${p.year}년생 · ${ANIMAL_KO[BR.indexOf(p.branch)]}띠 (${ganziKo(p.ganzi)}년)`,
    why: {
      fill: (e?: string) => `내게 필요한 ${EL_KO[e ?? '']} 기운을 채워 줘요.`,
      dayHarm: '내 사주의 가까운 자리(일지)와 서로 끌려요.',
      dayClash: '내 사주의 가까운 자리(일지)와 정면으로 부딪혀 마찰이 생기기 쉬워요.',
      yearHarm: '띠가 서로 잘 맞물려요.',
      yearClash: '띠가 서로 부딪혀 의견이 갈리기 쉬워요.',
      strain: (e?: string) => `내가 부담스러워하는 ${EL_KO[e ?? '']} 기운이 강해요.`,
      stemCombine: '내 일간과 하늘 글자가 합을 이뤄 끌리는 힘이 있어요.',
    },
    plain: '특별히 크게 도움도 부딪힘도 없는 무난한 해예요.',
  },
  en: {
    title: 'Who suits me',
    sum: (el: string) => `Your chart is helped by ${el} energy. Birth years that supply it, and animal signs that pull toward yours, tend to fit comfortably.`,
    you: 'This is a light reference from the birth year alone. Month, day and hour are missing, so it is not a full compatibility reading.',
    bestT: 'Years that tend to suit you', careT: 'Years that need more adjusting', none: 'No years stand out clearly.',
    tag: { best: 'Tends to fit', care: 'Needs care' },
    note: 'The birth year turns at Lichun (around Feb 4). People born in January or early February may belong to the previous year. This is a tendency from traditional theory, not a judgment of a person.',
    toMatch: 'Full compatibility with exact birth data',
    title1: (p: Pick) => `Born ${p.year} · Year of the ${ANIMAL_EN[BR.indexOf(p.branch)]}`,
    why: {
      fill: (e?: string) => `Supplies the ${EL_EN[e ?? '']} energy you need.`,
      dayHarm: 'Pulls toward the close seat of your chart (day branch).',
      dayClash: 'Clashes with the close seat of your chart (day branch), so friction comes easily.',
      yearHarm: 'The animal signs interlock well.',
      yearClash: 'The animal signs clash, so opinions split easily.',
      strain: (e?: string) => `Strong in ${EL_EN[e ?? '']}, which weighs on you.`,
      stemCombine: 'Its heavenly stem combines with your day stem, creating attraction.',
    },
    plain: 'An even year with no strong help or friction.',
  },
}

export interface PickView {
  title: string; summary: string; you: string; bestT: string; careT: string; none: string; note: string; toMatch: string
  best: { title: string; tag: string; line: string; tier: string }[]
  care: { title: string; tag: string; line: string; tier: string }[]
}

export function composePick(c: { best: Pick[]; care: Pick[] }, r: SajuResult, lang: string): PickView {
  const t = lang === 'ko' ? T.ko : T.en
  const need = c.best[0]?.why.find((w) => w.key === 'fill')?.el
  const line = (p: Pick) => {
    const parts = p.why.map((w) => { const f = t.why[w.key] as string | ((e?: string) => string); return typeof f === 'function' ? f(w.el) : f })
    return parts.length ? parts.join(' ') : t.plain
  }
  const map = (p: Pick) => ({ title: t.title1(p), tag: t.tag[p.tier === 'care' ? 'care' : 'best'], line: line(p), tier: p.tier })
  const el = need ? (lang === 'ko' ? EL_KO[need] : EL_EN[need]) : lang === 'ko' ? '필요한' : 'the needed'
  void r
  return { title: t.title, summary: t.sum(el), you: t.you, bestT: t.bestT, careT: t.careT, none: t.none, note: t.note, toMatch: t.toMatch, best: c.best.map(map), care: c.care.map(map) }
}

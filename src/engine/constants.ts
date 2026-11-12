// 용용사주 자체 명리 엔진 — 기본 표 (고전 명리의 공통 규칙)
import type { Element } from './types'

export const SKY = '甲乙丙丁戊己庚辛壬癸'
export const EARTH = '子丑寅卯辰巳午未申酉戌亥'

const E: Element[] = ['tree', 'tree', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water']
export const STEM_INFO: Record<string, { name: string; yinyang: '+' | '-'; element: Element }> = {}
;[...SKY].forEach((s, i) => { STEM_INFO[s] = { name: s, yinyang: i % 2 === 0 ? '+' : '-', element: E[i] } })

export const BRANCH_ELEMENT: Record<string, Element> = {
  寅: 'tree', 卯: 'tree', 巳: 'fire', 午: 'fire', 辰: 'earth', 未: 'earth', 丑: 'earth', 戌: 'earth',
  申: 'metal', 酉: 'metal', 子: 'water', 亥: 'water',
}
export const ELEMENT_HANJA: Record<string, string> = { tree: '木', fire: '火', earth: '土', metal: '金', water: '水' }

/** 지장간(여기·중기·정기). 중기가 없는 子午卯酉는 가운데를 공백으로 둔다. */
export const JIJANGGAN: Record<string, string> = {
  子: '壬 癸', 丑: '癸辛己', 寅: '戊丙甲', 卯: '甲 乙', 辰: '乙癸戊', 巳: '戊庚丙',
  午: '丙己丁', 未: '丁乙己', 申: '戊壬庚', 酉: '庚 辛', 戌: '辛丁戊', 亥: '戊甲壬',
}

/** 십신 (일간 기준 상대 → [한자, 한글]) 순서: 비견 겁재 식신 상관 편재 정재 편관 정관 편인 정인 */
export const SIPSIN: Array<{ hanja: string; hangul: string }> = [
  { hanja: '比肩', hangul: '비견' }, { hanja: '劫財', hangul: '겁재' }, { hanja: '食神', hangul: '식신' },
  { hanja: '傷官', hangul: '상관' }, { hanja: '偏財', hangul: '편재' }, { hanja: '正財', hangul: '정재' },
  { hanja: '偏官', hangul: '편관' }, { hanja: '正官', hangul: '정관' }, { hanja: '偏印', hangul: '편인' },
  { hanja: '正印', hangul: '정인' },
]
export const UNSEONG = ['長生', '沐浴', '冠帶', '乾祿', '帝旺', '衰', '病', '死', '墓', '絶', '胎', '養']
export const SINSAL12 = ['劫殺', '災殺', '天殺', '地殺', '年殺', '月殺', '亡身', '將星', '攀鞍', '驛馬', '六害', '華蓋']

// 삼합·방합
export const TRIPLE_COMPOSES: [string, string, string][] = [['寅', '午', '戌'], ['巳', '酉', '丑'], ['申', '子', '辰'], ['亥', '卯', '未']]
export const TRIPLE_COMPOSE_ELEMENTS: Record<string, string> = { '寅,午,戌': 'fire', '巳,酉,丑': 'metal', '申,子,辰': 'water', '亥,卯,未': 'tree' }
export const DIRECTIONAL_COMPOSES: [string, string, string][] = [['寅', '卯', '辰'], ['巳', '午', '未'], ['申', '酉', '戌'], ['亥', '子', '丑']]
export const DIRECTIONAL_COMPOSE_ELEMENTS: Record<string, string> = { '寅,卯,辰': 'tree', '巳,午,未': 'fire', '申,酉,戌': 'metal', '亥,子,丑': 'water' }

// 용용사주 자체 명리 엔진 — 타입 정의
export type Element = 'tree' | 'fire' | 'earth' | 'metal' | 'water'
export type YinYang = '+' | '-'
export type Gender = 'M' | 'F'
export type JasiMethod = 'unified'

export interface BirthInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender
  unknownTime?: boolean
  jasiMethod?: JasiMethod
  latitude?: number
  longitude?: number
  /** IANA 시간대. 생략하면 'Asia/Seoul' */
  timezone?: string
}

export interface Pillar { ganzi: string; stem: string; branch: string }
export interface PillarDetail {
  pillar: Pillar
  stemSipsin: string
  branchSipsin: string
  unseong: string
  sinsal: string
  jigang: string
}
export interface DaewoonItem {
  index: number
  ganzi: string
  /** 대운이 시작하는 날(달력 필드는 UTC getter로 읽는다) */
  startDate: Date
  age: number
  stemSipsin: string
  branchSipsin: string
  unseong: string
  sinsal: string
  isGongmang: boolean
}
export interface RelationResult { type: string; detail: string | null }
export interface PairRelation { stem: RelationResult[]; branch: RelationResult[] }
export interface AllRelations {
  pairs: Map<string, PairRelation>
  triple: RelationResult[]
  directional: RelationResult[]
}
export interface SpecialSals {
  yangin: number[]
  baekho: boolean
  goegang: boolean
  dohwa: number[]
  cheonul: number[]
  cheonduk: number[]
  wolduk: number[]
  munchang: number[]
  hongyeom: boolean
  geumyeo: number[]
}
export interface Gongmang { branches: [string, string]; pillarIndices: number[] }
export interface SajuResult {
  input: BirthInput
  /** 시, 일, 월, 년 순서 */
  pillars: PillarDetail[]
  daewoon: DaewoonItem[]
  relations: AllRelations
  specialSals: SpecialSals
  gongmang: Gongmang
}

import type { CatKey, ThemeKey } from '../../myeongri/daily'

/** 문구 풀. 변형이 여러 개면 날짜 seed로 고른다. 모든 문장은 "경향" 어조로, 단정·공포 조장 금지. */
export interface DailyText {
  starLabel: string[] // 1~5점 한 줄 라벨
  cats: Record<CatKey, string>
  /** 주제(오늘 일진이 나에게 어떤 기운인지) */
  theme: Record<ThemeKey, { title: string; body: string[] }>
  event: Record<'clash_day' | 'harmony_day' | 'repeat' | 'clash_month' | 'compose', string[]>
  /** 분야별 한 줄: 좋음 / 보통 / 신중 */
  catLine: Record<CatKey, { hi: string[]; mid: string[]; lo: string[] }>
  tip: { hi: string[]; mid: string[]; lo: string[] }
  lucky: { title: string; color: string; number: string; direction: string; colors: Record<string, string>; dirs: Record<string, string> }
  disclaimer: string
}

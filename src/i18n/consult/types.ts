import type { AskCat } from '../../myeongri/consult'
export interface ConsultText {
  cats: Record<AskCat, string>
  sipsin: Record<string, string>
  /** 핵심 답 제목: {when} 자리에 "2027년 4월" 같은 시기 */
  headline: Record<AskCat, string[]>
  answerBody: { best: string[]; flat: string[] }
  why: { lead: string; stem: string; branch: string; same: string; clash: string; harmony: string; year: string }
  you: { strong: string; weak: string; mid: string; yongsin: string; el: Record<string, string> }
  timeline: { title: string; best: string; care: string; none: string; month: string }
  event: { title: string; best: string; mid: string; care: string }
  doIt: Record<AskCat, string[]>
  careIt: Record<AskCat, string[]>
  /** 지금 흐름 카드 */
  now: { title: string; state: { good: string[]; mid: string[]; weak: string[] }; trend: { up: string; down: string; flat: string }; tag: Record<'good' | 'mid' | 'weak', string>; nextTitle: string; moneyNow: Record<string, string>; clash: string; mind: string; catNow: Record<string, string> }
  closing: string[]
  tips: { title: string; items: string[] }
  ui: Record<string, string>
}

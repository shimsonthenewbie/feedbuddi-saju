/**
 * 프리미엄 종합 풀이 프롬프트 조립기.
 * 사용자가 검증한 12단계 프롬프트(report-steps.ts)에, 코드가 계산한 사주 데이터와
 * "지금 상황 진단" 단계(0단계)를 붙여서 AI가 구체적·시점 고정형 풀이를 쓰도록 한다.
 *
 * 긴 풀이는 한 번에 쓰면 뒤쪽이 짧아지므로 4개 파트로 나눠 호출한다.
 */
import { PERSONA, RULES, STEPS, STYLE } from './report-steps'
import { analyze } from './myeongri'
import { nowText } from './myeongri/now'
import { domainsText } from './myeongri/domains'
import { chartText, type Person } from './prompt'

export type Tone = 'pro' | 'warm'
export type Part = 1 | 2 | 3 | 4

interface PartDef {
  steps: number[]
  /** 파트가 사용할 분량 목표(공백 제외 글자 수 대략) */
  target: string
}
export const PARTS: Record<Part, PartDef> = {
  1: { steps: [0, 1, 2, 3], target: '약 6,000~8,000자' },
  2: { steps: [4, 5, 6, 7], target: '약 7,000~9,000자' },
  3: { steps: [8, 9, 10], target: '약 6,000~8,000자' },
  4: { steps: [11, 12], target: '약 4,000~6,000자' },
}
const TITLES: Record<number, string> = {
  0: '0. 지금 상황 진단',
  1: '1. 만세력 판독 요약', 2: '2. 원국 핵심 구조', 3: '3. 평생 총운', 4: '4. 금전운', 5: '5. 직업운',
  6: '6. 연애운', 7: '7. 결혼운', 8: '8. 건강운', 9: '9. 인간관계/가족운', 10: '10. 대운 상세 해석',
  11: '11. 세운 핵심 해석', 12: '12. 현실 조언 및 총평',
}

const WARM_NOTE =
  '말투 조정: 4번 원칙의 "냉정하고 단정한" 톤은 유지하되, 문장은 따뜻하고 존중하는 상담가의 어투(~예요/~입니다)로 쓴다. 위로를 위해 사실을 흐리지는 않는다. 구체성과 근거의 수준은 그대로 유지한다.'

/** 서버에 보낼 컨텍스트: 차트 + 분야별 근거 + 현재 시점 진단 */
export function reportData(p: Person, now = new Date()): string {
  const a = analyze(p.result)
  return [
    chartText(p),
    domainsText(p.result, a, ['love', 'wealth', 'career', 'health', 'relation'], now.getFullYear(), 8),
    nowText(p.result, a, now),
  ].join('\n\n')
}

export interface ReportRequest {
  system: string
  user: string
}

export function buildReportRequest(
  data: string,
  part: Part,
  opts: { tone?: Tone; previousSummary?: string } = {},
): ReportRequest {
  const def = PARTS[part]
  const rules = RULES.map((r) => r)
  const system = [
    PERSONA,
    '',
    '[중요 원칙]',
    ...rules,
    ...(opts.tone === 'warm' ? ['', WARM_NOTE] : []),
    '',
    '[출력 스타일]',
    ...STYLE,
  ].join('\n')

  const stepText = def.steps.map((n) => STEPS[n]).join('\n\n')
  const titles = def.steps.map((n) => TITLES[n]).join('\n')
  const user = [
    '[사주 계산 데이터]',
    data,
    '',
    ...(opts.previousSummary ? ['[앞 파트에서 이미 다룬 핵심 (반복 금지)]', opts.previousSummary, ''] : []),
    `[이번 요청: 전체 보고서 ${part}/4 파트]`,
    '아래 단계만 작성하라. 다른 단계는 쓰지 마라. 서론·인사말·맺음말 없이 바로 시작하라.',
    '',
    stepText,
    '',
    '[출력 형식]',
    '아래 번호와 제목을 그대로 사용해 순서대로 작성하라.',
    titles,
    '',
    `분량: ${def.target}. 각 항목은 최소 3~6문단 이상으로 쓰고, 근거(명리 구조) → 쉬운 말 해석 → 실제 삶에서의 발현 순서를 지켜라.`,
  ].join('\n')
  return { system, user }
}

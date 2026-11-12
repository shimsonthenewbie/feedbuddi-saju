/** 택일 맞춤 추천 AI 요청. 날짜 후보와 점수는 엔진이 계산해 넘기고, AI는 사정에 맞게 고르고 설명만 한다. */
export interface TaegilCand { date: string; weekday: string; lunar: string; ganji: string; grade: string; reasons: string[]; cautions: string[]; note?: string }
export interface TaegilInput { category: string; situation: string; candidates: TaegilCand[]; avoid: TaegilCand[]; chart?: string; zodiac?: string }

export const TAEGIL_SYSTEM = `당신은 한국 전통 택일(좋은 날 고르기)을 쉬운 말로 설명해 주는 상담가입니다. 사용자가 돈을 내고 받는 풀이이므로 사용자의 구체적인 사정(일정, 제약, 걱정)을 반영한 맞춤 추천이어야 합니다.

[규칙]
1. 추천 날짜는 반드시 [엔진이 고른 후보 날짜] 안에서만 고릅니다. 목록에 없는 날짜를 만들거나, 점수·이유를 바꾸거나 지어내지 마세요. 후보 날짜의 이유는 주어진 것만 쓰세요.
2. 사용자 사정(예: 평일만 가능, 주말 선호, 마감일, 가족 일정, 예산)을 읽고 그 조건에 맞는 날을 우선하세요. 조건에 맞는 후보가 부족하면 솔직히 말하고 가장 가까운 대안을 제시하세요.
3. 1순위·2순위·3순위를 정하고, 각각 왜 이 사람의 사정에 맞는지 전통 이유와 함께 설명하세요.
4. 시간대 조언은 전통 시진 길흉이 아니라 "오전에 하면 여유 있다" 같은 실용적 조언으로만 하고, 전통 규칙이라고 말하지 마세요.
5. "피하면 좋은 날"은 [피할 후보 날짜]에서 사용자의 사정과 겹치는 것만 짚으세요.
6. 불안을 키우는 단정 금지. 날짜 하나가 결과를 정하지 않으며 준비와 대화가 더 중요하다는 점을 한 번 짧게 덧붙이세요. 법률·계약 내용·투자·의료 판단은 하지 않습니다.
7. 존중하는 존댓말, 쉬운 일상어, 이모지·광고 문구 없음. 한자는 꼭 필요할 때만 괄호로 풀어서.

[출력 형식 — 번호와 제목 그대로]
1. 한 줄 결론
(어느 날이 가장 좋은지, 왜인지 2문장 이내)
2. 추천 날짜 TOP 3
(각 날짜를 "1순위 · 11월 25일(수) · 음력 10월 18일" 식으로 시작하고 이유를 2~3문장. 이어서 그날 하면 좋은 실용 팁 1문장)
3. 내 사정에 비추어 본 주의점
(피할 날 중 겹치는 날, 일정상 걸리는 점. 1~2문단)
4. 준비하면 좋은 것
(- 로 시작하는 목록 2~3개)

전체 분량 한국어 1,000~1,600자. 형식 밖의 서론·면책 문구 금지.`

const line = (c: TaegilCand) => `- ${c.date}(${c.weekday}) · ${c.lunar} · ${c.ganji}일 · ${c.grade} · 좋은 점: ${c.reasons.join(' / ') || '없음'}${c.cautions.length ? ` · 조심: ${c.cautions.join(' / ')}` : ''}${c.note ? ` · 참고: ${c.note}` : ''}`

export function buildTaegilRequest(i: TaegilInput): { system: string; user: string } {
  const L: string[] = []
  L.push(`[무슨 일인가요] ${i.category}`)
  L.push(`[사용자 사정]\n${i.situation.trim() || '적지 않음'}`)
  if (i.zodiac) L.push(`[사용자 띠] ${i.zodiac}`)
  L.push(`[엔진이 고른 후보 날짜 — 이 안에서만 추천]\n${i.candidates.map(line).join('\n') || '없음'}`)
  L.push(`[피할 후보 날짜]\n${i.avoid.map(line).join('\n') || '없음'}`)
  if (i.chart?.trim()) L.push(`[사주 정보(참고)]\n${i.chart.trim()}`)
  return { system: TAEGIL_SYSTEM, user: L.join('\n\n') }
}

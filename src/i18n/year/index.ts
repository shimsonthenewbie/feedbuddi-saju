/** 올해 달별 흐름: 엔진이 정한 성격(kind)과 영역(areas)을 우리 문장으로 풀어 준다. */
import type { Luck, LuckKind, AreaKey, YearLuck } from '../../myeongri/timing'
export type Lang = 'ko' | 'en'

const P = {
  ko: {
    kind: {
      event: ['변화가 터지기 쉬운 달', '내 생활 터전과 주변이 크게 흔들릴 수 있어요. 이사·이직·관계 정리 같은 큰 변화가 올 수 있는 시기예요.'],
      mind: ['마음이 예민해지는 달', '일이 터진다기보다 마음이 꼬이고 지치기 쉬워요. 오해와 불안을 조심해요.'],
      work: ['일·책임이 무거운 달', '해야 할 일과 압박이 늘어요. 새로 벌이기보다 마무리와 확인이 나아요.'],
      chance: ['움직이기 좋은 달', '기운이 받쳐 줘서 시작하거나 부탁하기에 좋은 시기예요.'],
      calm: ['차분하게 이어지는 달', '큰 부딪힘 없이 평탄해요. 밀린 정리와 쉬는 시간을 챙기기 좋아요.'],
    } as Record<LuckKind, [string, string]>,
    area: { love: '연애·가까운 관계', self: '마음·몸 상태', work: '일·직장', home: '환경·집안', plan: '계획·후배', big: '큰 흐름', money: '돈·지출', body: '몸 다침 주의', legal: '문서·송사 주의', study: '공부·문서', start: '새 시작' } as Record<AreaKey, string>,
    bad: { love: '큰 결정은 감정이 가라앉은 뒤에 해요. 말투를 한 번 고르면 오해가 줄어요.', self: '혼자 끌어안지 말고 가까운 사람에게 말해요.', work: '큰 이동보다 마무리와 확인에 힘을 써요.', home: '이사나 집안의 큰 결정은 서두르지 않아요.', plan: '새 계획은 작게 시험해 보고 넓혀요.', big: '한 번에 바꾸려 하지 말고 조금씩 바꿔요.', money: '큰 지출·투자·보증은 미뤄요. 충동구매는 하루 뒤에 결정해요.', body: '무리한 운동, 공구·칼·운전은 한 번 더 조심해요.', legal: '계약서와 문서는 두 번 확인하고, 감정적인 대응은 피해요.', study: '자격·문서 일은 서두르지 않고 확인해요.', start: '새로 벌이는 일은 작게 시작해요.' } as Record<AreaKey, string>,
    good: { start: '새로 시작하거나 제안할 일은 이 달에 해요.', work: '평가·면접·인정받을 일을 이 달에 놓아요.', money: '수입원과 거래를 점검하고 작게 시작해요.', study: '자격·공부·문서 일을 이 달에 몰아서 해요.', self: '나를 돌보는 일에 시간을 써요.', love: '마음을 표현하기 좋은 때예요.', home: '정리하고 바꾸기 좋은 때예요.', plan: '계획을 세우기 좋아요.', big: '흐름을 타고 움직여도 좋아요.', body: '몸을 챙기기 좋아요.', legal: '문서를 정리하기 좋아요.' } as Record<AreaKey, string>,
    calmTip: '정리할 일과 쉬는 시간을 먼저 챙겨요.',
    title: (y: number) => `${y}년 달별 흐름`,
    sum: (y: number, care: string[], good: string[]) => `${y}년은 조심할 달이 ${care.length}개, 움직이기 좋은 달이 ${good.length}개예요.${care.length ? ` 조심할 달: ${care.join(', ')}.` : ''}${good.length ? ` 움직이기 좋은 달: ${good.join(', ')}.` : ''}`,
    mon: (m: number) => `${m}월`,
    now: '지금',
    note: '달별 흐름은 사주 구조로 계산한 경향이에요. 실제 일은 사람과 상황에 따라 달라요. 재미와 참고로 봐 주세요.',
  },
  en: {
    kind: {
      event: ['A month for big change', 'Your base and surroundings can shake. Moves, job changes or relationship resets are more likely.'],
      mind: ['A sensitive month', 'Less about events, more about feelings tangling and fatigue. Watch for misunderstandings and worry.'],
      work: ['A heavy-duty month', 'Workload and pressure rise. Wrap up and double-check rather than start new things.'],
      chance: ['A good month to move', 'Energy supports you. A good time to start or ask for something.'],
      calm: ['A steady month', 'No sharp clashes. Good for tidying up and resting.'],
    } as Record<LuckKind, [string, string]>,
    area: { love: 'Love & close ties', self: 'Mind & body', work: 'Work', home: 'Home & surroundings', plan: 'Plans & juniors', big: 'Big picture', money: 'Money & spending', body: 'Mind your body', legal: 'Contracts & disputes', study: 'Study & papers', start: 'New starts' } as Record<AreaKey, string>,
    bad: { love: 'Decide big things after feelings settle. Softening your tone once prevents misunderstandings.', self: 'Do not carry it alone. Talk to someone close.', work: 'Focus on wrapping up and checking rather than big moves.', home: 'Do not rush a move or big family decision.', plan: 'Test new plans small, then widen.', big: 'Change things bit by bit rather than all at once.', money: 'Postpone big spending, investing or guarantees. Decide impulse buys a day later.', body: 'Take extra care with hard workouts, tools, knives and driving.', legal: 'Check contracts and papers twice, and avoid emotional replies.', study: 'Check certificates and papers carefully.', start: 'Start new things small.' } as Record<AreaKey, string>,
    good: { start: 'Put new starts and proposals in this month.', work: 'Place reviews, interviews and visibility here.', money: 'Review income and deals, and start small.', study: 'Batch your study and paperwork here.', self: 'Spend time looking after yourself.', love: 'A good time to say how you feel.', home: 'Good for tidying and changing things.', plan: 'Good for planning.', big: 'You can ride the flow.', body: 'Good for looking after your body.', legal: 'Good for sorting paperwork.' } as Record<AreaKey, string>,
    calmTip: 'Tidy up and make time to rest first.',
    title: (y: number) => `${y} month by month`,
    sum: (y: number, care: string[], good: string[]) => `${y} has ${care.length} careful month${care.length === 1 ? '' : 's'} and ${good.length} good month${good.length === 1 ? '' : 's'}.${care.length ? ` Careful: ${care.join(', ')}.` : ''}${good.length ? ` Good: ${good.join(', ')}.` : ''}`,
    mon: (m: number) => (['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as string[])[m],
    now: 'Now',
    note: 'Monthly flow is a tendency calculated from your chart structure. Real events vary by person and situation. Take it for fun and reference.',
  },
} as const

export interface MonthView { from: string; month: number; range: string; kind: LuckKind; label: string; head: string; areas: { key: AreaKey; label: string }[]; tip: string; isNow: boolean }
export interface YearView { title: string; summary: string; months: MonthView[]; note: string; nowLabel: string }

export function composeYear(yl: YearLuck, lang: Lang, now = new Date()): YearView {
  const T = P[lang]
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const starts = yl.months.map((m) => m.from!)
  const months: MonthView[] = yl.months.map((L: Luck, i) => {
    const from = L.from!
    const nextFrom = starts[i + 1]
    const isNow = from <= nowKey && (!nextFrom || nowKey < nextFrom)
    const mo = +from.slice(5, 7), da = +from.slice(8, 10)
    const [label, head] = T.kind[L.kind]
    const first = L.areas[0]
    const tip = L.kind === 'chance' ? (first ? T.good[first] : T.calmTip) : L.kind === 'calm' ? T.calmTip : first ? T.bad[first] : T.calmTip
    const extra = L.kind !== 'chance' && L.kind !== 'calm' && L.areas.includes('legal') ? ` ${T.bad.legal}` : L.kind !== 'chance' && L.kind !== 'calm' && L.areas.includes('body') ? ` ${T.bad.body}` : ''
    return { from, month: mo, range: `${mo}/${da}~`, kind: L.kind, label, head, areas: (L.kind === 'calm' ? [] : L.areas).map((key) => ({ key, label: T.area[key] })), tip: tip + (extra && !tip.includes(extra.trim()) ? extra : ''), isNow }
  })
  const care = months.filter((m, i) => m.kind === 'event' || yl.months[i].score <= -3).map((m) => T.mon(m.month))
  const good = months.filter((m) => m.kind === 'chance').map((m) => T.mon(m.month))
  return { title: T.title(yl.year), summary: T.sum(yl.year, care, good), months, note: T.note, nowLabel: T.now }
}

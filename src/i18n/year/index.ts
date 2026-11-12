/** 올해 달별 흐름: 엔진이 정한 성격(kind)과 영역(areas)을 우리 문장으로 풀어 준다. */
import { yearLuck, type Luck, type LuckKind, type AreaKey, type YearLuck } from '../../myeongri/timing'
import { natalSals, yearSals, type SalKey } from '../../myeongri/sal'
import type { SajuResult } from '../../engine/types'
import type { Analysis } from '../../myeongri'
export type Lang = 'ko' | 'en'

const P = {
  ko: {
    kind: {
      event: ['변화의 달', '내 생활 터전과 주변이 크게 흔들릴 수 있어요. 이사·이직·관계 정리 같은 큰 변화가 올 수 있는 시기예요.'],
      mind: ['마음 챙길 달', '일이 터진다기보다 마음이 꼬이고 지치기 쉬워요. 오해와 불안을 조심해요.'],
      work: ['일 많은 달', '해야 할 일과 책임이 늘어요. 새로 벌이기보다 마무리와 확인이 나아요.'],
      chance: ['기회의 달', '기운이 받쳐 줘서 시작하거나 부탁하기에 좋은 시기예요.'],
      calm: ['쉬어가는 달', '큰 부딪힘 없이 평탄해요. 밀린 정리와 쉬는 시간을 챙기기 좋아요.'],
    } as Record<LuckKind, [string, string]>,
    area: { love: '애정운', self: '마음·건강', work: '직장·일', home: '집안·환경', plan: '계획·미래', big: '큰 흐름', money: '재물운', body: '몸 다침 주의', legal: '문서·구설 주의', study: '학업·문서운', start: '새 출발' } as Record<AreaKey, string>,
    bad: { love: '큰 결정은 감정이 가라앉은 뒤에 해요. 말투를 한 번 고르면 오해가 줄어요.', self: '혼자 끌어안지 말고 가까운 사람에게 말해요.', work: '큰 이동보다 마무리와 확인에 힘을 써요.', home: '이사나 집안의 큰 결정은 서두르지 않아요.', plan: '새 계획은 작게 시험해 보고 넓혀요.', big: '한 번에 바꾸려 하지 말고 조금씩 바꿔요.', money: '큰 지출·투자·보증은 미뤄요. 충동구매는 하루 뒤에 결정해요.', body: '무리한 운동, 공구·칼·운전은 한 번 더 조심해요.', legal: '계약서와 문서는 두 번 확인하고, 감정적인 대응은 피해요.', study: '자격·문서 일은 서두르지 않고 확인해요.', start: '새로 벌이는 일은 작게 시작해요.' } as Record<AreaKey, string>,
    good: { start: '새로 시작하거나 제안할 일은 이 달에 해요.', work: '평가·면접·인정받을 일을 이 달에 놓아요.', money: '수입원과 거래를 점검하고 작게 시작해요.', study: '자격·공부·문서 일을 이 달에 몰아서 해요.', self: '나를 돌보는 일에 시간을 써요.', love: '마음을 표현하기 좋은 때예요.', home: '정리하고 바꾸기 좋은 때예요.', plan: '계획을 세우기 좋아요.', big: '흐름을 타고 움직여도 좋아요.', body: '몸을 챙기기 좋아요.', legal: '문서를 정리하기 좋아요.' } as Record<AreaKey, string>,
    calmTip: '정리할 일과 쉬는 시간을 먼저 챙겨요.',
    title: (y: number) => `${y}년 달별 흐름`,
    sum: (y: number, care: string[], good: string[]) => `${y}년은 조심할 달이 ${care.length}개, 기회의 달이 ${good.length}개예요.${care.length ? ` 조심할 달: ${care.join(', ')}.` : ''}${good.length ? ` 기회의 달: ${good.join(', ')}.` : ''}`,
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

/* ───────── 한 화면으로 묶기: 총운 → 조심할 것 → 지난 3개월·앞으로 3개월 → 달별 보기 ───────── */
const SAL = {
  ko: {
    dohwa: ['도화살', '桃花殺', 0, '사람을 끄는 매력과 연애 기운이 올라와요. 인연은 늘지만 이성 관계가 복잡해지기 쉬워요.'],
    yeokma: ['역마살', '驛馬殺', 0, '움직임과 이동이 많아져요. 이사·이직·출장·여행수가 있는 기운이에요.'],
    hwagae: ['화개살', '華蓋殺', 0, '혼자 몰두하고 공부·예술·마음 공부에 끌려요. 외로움을 느끼기도 해요.'],
    geopsal: ['겁살', '劫殺', 1, '뜻밖의 손해나 빼앗기는 일을 조심하는 기운이에요. 돈과 계약을 꼼꼼히 봐요.'],
    jaesal: ['재살', '災殺', 1, '구설·다툼·문서 문제가 생기기 쉬운 기운이에요. 말과 서류를 조심해요.'],
    mangsin: ['망신살', '亡身殺', 1, '체면이 깎이거나 실수가 드러나기 쉬워요. 말과 행동을 한 번 더 살펴요.'],
    jangseong: ['장성살', '將星殺', 0, '자리를 잡고 이끄는 힘이 올라와요. 책임 있는 자리에 서기 좋아요.'],
    banan: ['반안살', '攀鞍殺', 0, '인정받고 안정적으로 올라서는 기운이에요. 승진·자리 잡기에 좋아요.'],
    goegang: ['괴강살', '魁罡殺', 1, '의지와 승부욕이 아주 센 기질이에요. 추진력이 되지만 지나치면 고집으로 보여요.'],
    baekho: ['백호살', '白虎殺', 1, '큰 일을 겪거나 다치기 쉬운 강한 기운이에요. 안전에 신경 써요.'],
    yangin: ['양인살', '羊刃殺', 1, '칼날처럼 날카로운 에너지예요. 결단력은 좋지만 다툼과 다침을 조심해요.'],
    hakdang: ['학당귀인','學堂貴人',0,'배우고 익히는 데 복이 있는 기운이에요. 공부·자격·기술을 쌓기에 좋아요.'],
    amrok: ['암록','暗祿',0,'겉으로 안 드러나게 도움과 먹을 복이 따르는 기운이에요. 뜻밖의 도움이 와요.'],
    hyeonchim: ['현침살','懸針殺',1,'말과 눈빛이 날카로워지기 쉬운 기운이에요. 예리함은 장점이지만 말을 한 번 다듬어요.'],
    cheonra: ['천라지망','天羅地網',1,'일이 얽히거나 막힌 느낌을 받기 쉬운 기운이에요. 서두르지 말고 돌아가는 길을 찾아요.'],
    wonjin: ['원진살','怨嗔殺',1,'가까운 사이에서 괜히 서운하거나 밀고 당기기 쉬운 기운이에요. 마음을 말로 풀어요.'],
    gwimun: ['귀문관살','鬼門關殺',1,'생각이 깊고 예민해서 잠 못 드는 밤이 있을 수 있어요. 직관과 감수성이 큰 장점이기도 해요.'],
    hongyeom: ['홍염살', '紅艷殺', 0, '매력과 정이 많은 기운이에요. 끌리는 사람이 많아요.'],
    cheonul: ['천을귀인', '天乙貴人', 0, '어려울 때 도와주는 사람이 나타나는 가장 좋은 귀인 기운이에요.'],
    cheonduk: ['천덕귀인', '天德貴人', 0, '큰 위기를 피해 가게 돕는 보호 기운이에요.'],
    wolduk: ['월덕귀인', '月德貴人', 0, '힘든 일이 와도 풀리는 쪽으로 돕는 보호 기운이에요.'],
    munchang: ['문창귀인', '文昌貴人', 0, '글·공부·시험에 강한 기운이에요.'],
    geumyeo: ['금여록', '金輿祿', 0, '배우자 복과 안정된 생활을 돕는 기운이에요.'],
  },
  en: {
    dohwa: ['Peach Blossom (Dohwa)', '桃花殺', 0, 'Charm and romance rise. More connections, but love life can get complicated.'],
    yeokma: ['Traveling Horse (Yeokma)', '驛馬殺', 0, 'More movement: moves, job changes, trips.'],
    hwagae: ['Canopy (Hwagae)', '華蓋殺', 0, 'Pulled toward solitude, study and inner work. Loneliness can appear.'],
    geopsal: ['Robbery (Geopsal)', '劫殺', 1, 'Watch for sudden loss. Check money and contracts carefully.'],
    jaesal: ['Disaster (Jaesal)', '災殺', 1, 'Gossip, quarrels and paperwork trouble come easier. Mind words and documents.'],
    mangsin: ['Loss of Face (Mangsin)', '亡身殺', 1, 'Slips can show and pride can be dented. Check words and actions once more.'],
    jangseong: ['General Star (Jangseong)', '將星殺', 0, 'Leadership energy rises. Good for taking responsibility.'],
    banan: ['Saddle (Banan)', '攀鞍殺', 0, 'Recognition and steady rise. Good for promotion and settling in.'],
    goegang: ['Goegang', '魁罡殺', 1, 'Very strong will and competitiveness. Drives you, but can look stubborn.'],
    baekho: ['White Tiger (Baekho)', '白虎殺', 1, 'A strong energy tied to big events and injury. Mind safety.'],
    yangin: ['Blade (Yangin)', '羊刃殺', 1, 'Sharp energy. Decisive, but mind conflict and injury.'],
    hakdang: ['Scholar star (Hakdang)','學堂貴人',0,'Luck in learning. Good for study, certificates and skills.'],
    amrok: ['Hidden support (Amrok)','暗祿',0,'Quiet help and food luck arrive unseen.'],
    hyeonchim: ['Needle star (Hyeonchim)','懸針殺',1,'A sharp tongue and gaze. Sharpness is a strength; polish your words.'],
    cheonra: ['Net star (Cheonra-jimang)','天羅地網',1,'Things feel tangled or blocked. Do not rush; find a detour.'],
    wonjin: ['Grudge star (Wonjin)','怨嗔殺',1,'Push and pull with people close to you. Say feelings out loud.'],
    gwimun: ['Gate star (Gwimun)','鬼門關殺',1,'Deep, sensitive mind that may keep you up at night. Intuition is the upside.'],
    hongyeom: ['Red Allure (Hongyeom)', '紅艷殺', 0, 'Charm and warmth. People are drawn to you.'],
    cheonul: ['Heavenly Noble (Cheonul)', '天乙貴人', 0, 'Helpers appear when you need them — the best noble star.'],
    cheonduk: ['Heaven Virtue (Cheonduk)', '天德貴人', 0, 'A protective star that helps you avoid big trouble.'],
    wolduk: ['Moon Virtue (Wolduk)', '月德貴人', 0, 'A protective star that helps hard times resolve.'],
    munchang: ['Literary Star (Munchang)', '文昌貴人', 0, 'Strong at writing, study and exams.'],
    geumyeo: ['Golden Carriage (Geumyeo)', '金輿祿', 0, 'Supports a good partner and a stable life.'],
  },
} as const
const TONE = {
  ko: { '좋은 흐름': '올해는 흐름이 받쳐 주는 해예요. 기회의 달을 놓치지 말고 움직이세요.', '무난·약간 좋음': '큰 탈 없이 무난한 해예요. 준비한 만큼 결과가 따라와요.', '평탄·혼재': '좋은 달과 무거운 달이 섞인 해예요. 시기를 고르는 게 중요해요.', '다소 부담': '조금 무거운 해예요. 무리하지 말고 기회의 달에 힘을 모아요.', '부담 큼': '변화와 부딪힘이 큰 해예요. 큰 결정은 신중하게, 기회의 달에 움직여요.' },
  en: { '좋은 흐름': 'A supportive year. Move in the good months.', '무난·약간 좋음': 'A smooth year. Results follow your preparation.', '평탄·혼재': 'Good and heavy months are mixed. Timing matters.', '다소 부담': 'A slightly heavy year. Do not overreach; gather strength in good months.', '부담 큼': 'A year of big change and friction. Decide big things carefully and move in good months.' },
} as const
const REASON = {
  ko: { yearClash: '태어난 해의 기운과 올해가 부딪혀 주변 환경과 인간관계에 변화가 많아요.', workClash: '직장·사회생활 쪽이 흔들릴 수 있어요.', homeClash: '생활 터전과 가까운 관계가 흔들릴 수 있어요.', tangle: '마음이 꼬이거나 오해가 생기기 쉬워요.', join: '인연과 협력의 기회도 들어와요.' },
  en: { yearClash: 'This year clashes with your birth-year energy, so surroundings and relationships shift.', workClash: 'Work and social life can shake.', homeClash: 'Your base and close ties can shake.', tangle: 'Feelings can tangle and misunderstandings come easier.', join: 'Chances for connection and cooperation also come in.' },
} as const
const UI = {
  ko: { totalT: (y: number) => `${y}년 총운`, careT: '올해 조심할 것', careNone: '크게 부딪히는 곳이 보이지 않아요.', incoming: '올해 들어오는 살', natal: '타고난 살·귀인', pastT: '지난 3개월', pastIntro: '먼저 지나온 시기를 볼게요. 이런 흐름이었어요.', nowT: '이번 달', nextT: '앞으로 3개월', nextIntro: '앞으로는 이렇게 가는 게 좋아요.', allBtn: '달별로 보기', allHide: '접기',
    past: { event: '큰 변화나 정리가 있었을 수 있는 시기였어요.', mind: '마음이 예민하고 지치기 쉬운 시기였어요.', work: '일과 책임이 무겁게 느껴졌을 시기였어요.', chance: '시작하거나 부탁하기 좋은 시기였어요.', calm: '비교적 평탄하게 지나간 시기였어요.' } as Record<LuckKind, string>, pastNote: '지난 시기는 흐름만 짚은 거예요. 실제와 다를 수 있어요.', good: '좋은 기운', care: '조심할 기운' },
  en: { totalT: (y: number) => `${y} overview`, careT: 'What to watch this year', careNone: 'No sharp friction shows up.', incoming: 'Stars coming in this year', natal: 'Your natal stars', pastT: 'The past 3 months', pastIntro: "First, the stretch you've just been through. This was the flow.", nowT: 'This month', nextT: 'The next 3 months', nextIntro: 'Going forward, this is the way to go.', allBtn: 'See month by month', allHide: 'Collapse',
    past: { event: 'A stretch where big change or clearing out may have happened.', mind: 'A stretch where feelings ran sensitive and tiring.', work: 'A stretch where work and responsibility felt heavy.', chance: 'A good stretch to start or ask for something.', calm: 'A fairly even stretch.' } as Record<LuckKind, string>, pastNote: 'Past months only point to the flow. Real life may differ.', good: 'Helpful', care: 'Watch' },
} as const

export interface SalView { name: string; hanja: string; text: string; caution: boolean }
export interface StepView { monthLabel: string; range: string; kind: LuckKind; label: string; line: string; areas: string[]; isNow: boolean }
export interface PageView {
  total: { title: string; tone: string; reasons: string[]; summary: string; months: string }
  care: { title: string; none: string; incomingT: string; incoming: SalView[]; natalT: string; natal: SalView[] }
  past: { title: string; intro: string; items: StepView[]; note: string }
  now: { title: string; item: StepView | null }
  next: { title: string; intro: string; items: StepView[] }
  all: YearView
  btn: { show: string; hide: string }
  note: string
}

export function composePage(r: SajuResult, a: Analysis, year: number, lang: Lang, now = new Date(), headYear = now.getFullYear()): PageView {
  const U = UI[lang], T = P[lang], S = SAL[lang]
  const y0 = now.getFullYear()
  const ylThis = yearLuck(r, a, y0, true)
  const ylSel = year === y0 ? ylThis : yearLuck(r, a, year, true)
  const flat = [y0 - 1, y0, y0 + 1].flatMap((y) => (y === y0 ? ylThis : yearLuck(r, a, y, true)).months)
  const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  let ci = flat.findIndex((m, i) => m.from! <= nowKey && (i === flat.length - 1 || nowKey < flat[i + 1].from!))
  if (ci < 0) ci = 0
  const step = (L: Luck, isNow: boolean, mode: 'past' | 'next'): StepView => {
    const mo = +L.from!.slice(5, 7), da = +L.from!.slice(8, 10)
    const first = L.areas[0]
    const line = mode === 'past' ? U.past[L.kind] : L.kind === 'chance' ? (first ? T.good[first] : T.calmTip) : L.kind === 'calm' ? T.calmTip : first ? T.bad[first] : T.calmTip
    return { monthLabel: T.mon(mo), range: `${mo}/${da}~`, kind: L.kind, label: T.kind[L.kind][0], line, areas: (L.kind === 'calm' ? [] : L.areas).map((k) => T.area[k]), isNow }
  }
  const past = flat.slice(Math.max(0, ci - 3), ci).map((L) => step(L, false, 'past'))
  const next = flat.slice(ci + 1, ci + 4).map((L) => step(L, false, 'next'))
  const nowItem = flat[ci] ? step(flat[ci], true, 'next') : null

  const rs: string[] = []
  const R = REASON[lang]
  const ylHead = headYear === y0 ? ylThis : yearLuck(r, a, headYear, true)
  const hs = ylHead.hits
  if (hs.some((h) => h.kind.startsWith('충') && h.palace === '년주')) rs.push(R.yearClash)
  if (hs.some((h) => h.kind.startsWith('충') && h.palace === '월주')) rs.push(R.workClash)
  if (hs.some((h) => h.kind.startsWith('충') && h.palace === '일주')) rs.push(R.homeClash)
  if (hs.some((h) => (h.kind.startsWith('원진') || h.kind.startsWith('귀문')) && h.palace === '대운')) rs.push(R.tangle)
  if (hs.some((h) => h.kind.startsWith('합'))) rs.push(R.join)
  const reasons = rs.slice(0, 3)

  const toSal = (k: SalKey): SalView => { const [name, hanja, c, text] = S[k]; return { name, hanja, text, caution: !!c } }
  const incoming = yearSals(r, headYear).map(toSal)
  const natal = natalSals(r).map(toSal)
  const all = composeYear(ylSel, lang, now)
  const thisView = year === headYear ? all : composeYear(ylHead, lang, now)
  return {
    total: { title: U.totalT(headYear), tone: ylHead.tone, reasons, summary: TONE[lang][ylHead.tone], months: thisView.summary },
    care: { title: U.careT, none: U.careNone, incomingT: U.incoming, incoming, natalT: U.natal, natal },
    past: { title: U.pastT, intro: U.pastIntro, items: past, note: U.pastNote },
    now: { title: U.nowT, item: nowItem },
    next: { title: U.nextT, intro: U.nextIntro, items: next },
    all, btn: { show: U.allBtn, hide: U.allHide }, note: T.note,
  }
}

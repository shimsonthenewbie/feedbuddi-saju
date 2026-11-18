/** 오늘의 운세 2.0 한국어 문구. 모든 문장은 "경향" 어조, 단정·겁주기 금지. 변형은 날짜·사람 seed로 고른다. */
import type { AxisKey, SlotKey, TodayData } from '../../myeongri/today'
import type { Element } from '../../engine/types'
import { ko } from './ko'
import { SLOT2, MIDS, CHECK_T, CAUTION_T, EL_EXT, profileOf, reasonOf, slotTail } from './todayKo2'

type Tier = 'hi' | 'mid' | 'lo'
export const tierOf = (n: number): Tier => (n >= 68 ? 'hi' : n >= 46 ? 'mid' : 'lo')
// 자리(salt)마다 서로 독립적으로 고르도록 섞는다. 예전 식은 문장들이 늘 같은 조합으로 묶여 나왔다.
const pick = <T>(a: T[], seed: number, salt = 0): T => a[((): number => { let h = (seed ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0; h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0; h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0; return (h ^ (h >>> 16)) >>> 0 })() % a.length]
const hasBatchim = (w: string) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0 }
const eun = (w: string) => w + (hasBatchim(w) ? '은' : '는')

export const AXIS_NAME: Record<AxisKey, string> = { total: '총운', money: '재물', love: '연애', work: '일·사업', health: '건강', study: '학업' }
export const SLOT_NAME: Record<SlotKey, { name: string; sub: string }> = {
  morning: { name: '오전', sub: '9시 전후' }, afternoon: { name: '오후', sub: '3시 전후' }, night: { name: '밤', sub: '9시 전후' },
}

const HEAD: Record<string, [string, string, string]> = {
  bijeon: ['내 방식대로 밀고 나가면 힘이 붙는 하루예요', '내 페이스를 지키면 편안하게 흘러가는 하루예요', '남과 비교하면 지치는 날, 내 속도만 보세요'],
  geopjae: ['사람들과 함께할수록 힘이 커지는 하루예요', '협력과 경쟁이 반반 섞여 오는 하루예요', '나눠 쓸 일엔 욕심을 덜어야 편한 하루예요'],
  siksin: ['아이디어와 즐거움이 술술 나오는 하루예요', '여유를 즐기면 마음이 풀리는 하루예요', '먹고 쉬는 데 힘을 쓰면 좋은 하루예요'],
  sanggwan: ['말과 재능이 반짝이는 하루예요', '표현은 살아나지만 말끝은 다듬어야 하는 하루예요', '솔직함이 날이 되지 않게 말을 아끼는 하루예요'],
  pyeonjae: ['움직이는 만큼 기회가 따라오는 하루예요', '사람과 돈이 오가니 눈을 크게 뜨는 하루예요', '큰돈은 한 번 더 확인하고 움직이는 하루예요'],
  jeongjae: ['차곡차곡 쌓아 온 것이 빛나는 하루예요', '성실하게 챙기면 마음이 놓이는 하루예요', '작은 정산부터 하면 실수가 줄어드는 하루예요'],
  pyeongwan: ['압박을 이겨내고 성취를 얻는 하루예요', '책임이 따르지만 해낼 수 있는 하루예요', '서두르지 않으면 부담이 가벼워지는 하루예요'],
  jeonggwan: ['신뢰가 힘이 되어 일이 매끄럽게 풀리는 하루예요', '약속과 규칙을 지키면 순탄한 하루예요', '격식에 얽매여 답답할 수 있는 하루예요'],
  pyeonin: ['직감이 잘 맞아떨어지는 하루예요', '생각이 많아지니 한 가지씩 정리하는 하루예요', '생각이 꼬리를 무니 혼자 쉬는 게 약이에요'],
  jeongin: ['도움과 배움이 자연스럽게 들어오는 하루예요', '마음이 편안하게 채워지는 하루예요', '기대고 싶은 마음에 결정을 미루기 쉬운 하루예요'],
}

const TOTAL_ADVICE: Record<Tier, string[]> = {
  hi: ['미뤄 둔 중요한 일이 있다면 오늘 꺼내 보세요. 좋은 흐름은 쓸수록 커져요.', '망설였던 연락이나 제안은 오늘 먼저 건네 보세요. 반응이 생각보다 좋을 수 있어요.', '컨디션과 분위기가 함께 받쳐 주는 날이에요. 중요한 약속이나 발표는 오늘 잡아도 좋아요.', '오늘 시작한 일은 끝까지 가져가기 쉬워요. 작게라도 첫걸음을 떼 보세요.'],
  mid: ['큰 모험보다 해 오던 일을 차분히 이어 가면 무난하게 지나가요.', '할 일 중 세 가지만 골라 끝내 보세요. 작은 성취가 하루를 편하게 해 줘요.', '크게 좋지도 나쁘지도 않은 날이라 준비하는 시간으로 쓰기 좋아요. 정리와 점검에 어울려요.', '속도를 내기보다 평소 루틴을 지키는 쪽이 이득이에요.'],
  lo: ['중요한 결정이나 큰 결제는 내일로 미뤄도 괜찮아요. 오늘은 쉬어 가는 쪽이 이득이에요.', '일정을 빡빡하게 잡지 말고 여유 시간을 넉넉히 두세요. 서두르지 않으면 충분히 지나가요.', '말이 길어지면 오해가 생기기 쉬워요. 꼭 필요한 말만 짧게 전하세요.', '무리하게 밀어붙이기보다 점검과 휴식에 시간을 쓰면 오히려 좋은 결과로 이어져요.'],
}

type AX = { lead: string[]; act: string[] }
const AXT: Record<Exclude<AxisKey, 'total'>, Record<Tier, AX>> = {
  money: {
    hi: { lead: ['돈이 들어오고 도는 흐름이 부드러운 날이에요. 수입이나 거래, 제안에서 반가운 소식이 기대돼요.', '재물운이 힘을 받는 날이에요. 눈여겨본 것이 있다면 조건을 비교해 볼 만해요.', '쓸 곳에 쓴 돈은 만족도가 높고, 들어올 돈은 순조롭게 들어오는 날이에요.'], act: ['계약이나 견적은 오늘 꼼꼼히 확인하고 진행해 보세요.', '필요한 지출은 미루지 말되 영수증과 조건은 한 번씩 챙기세요.', '작은 수익 기회도 놓치지 말고 메모해 두세요.'] },
    mid: { lead: ['재물 흐름은 평소와 비슷하게 무난해요. 큰 변동 없이 흘러가요.', '벌고 쓰는 균형이 크게 흔들리지 않는 날이에요.', '눈에 띄는 수입도, 큰 손실도 없는 잔잔한 날이에요.'], act: ['가계부나 구독 목록을 정리하기 좋은 날이에요.', '사고 싶은 게 있다면 장바구니에 두고 하루 지켜보세요.', '고정 지출을 한 번 훑어보면 새는 돈이 보여요.'] },
    lo: { lead: ['충동적인 지출이 늘기 쉬운 날이에요. 기분 따라 결제하면 후회가 남을 수 있어요.', '돈이 새거나 예상 밖 지출이 생기기 쉬운 날이에요.', '재물은 한 발 물러서 지키는 게 이득인 날이에요.'], act: ['큰 결제와 중요한 금전 결정은 하루 미루고, 오늘은 지출 내역만 확인하세요.', '돈을 빌려주거나 보증을 서는 일은 오늘은 피하세요.', '꼭 필요한 것만 사고 나머지는 내일 다시 생각해 보세요.'] },
  },
  love: {
    hi: { lead: ['마음이 잘 통하는 날이에요. 표현이 부드러워져서 호감을 얻기 쉬워요.', '인연의 기운이 따뜻하게 움직여요. 새로운 만남이나 오랜 인연의 소식이 반가울 수 있어요.', '상대의 마음이 편하게 열리는 날이에요. 솔직하게 다가가면 좋은 반응이 와요.'], act: ['망설였던 안부 한마디를 먼저 건네 보세요.', '약속은 저녁 시간대로 잡으면 분위기가 더 좋아요.', '솔직한 칭찬 한마디가 오늘은 크게 전해져요.'] },
    mid: { lead: ['관계는 평소처럼 편안하게 이어지는 날이에요.', '설렘보다 안정감이 어울리는 날이에요.', '특별한 사건 없이 잔잔하게 흐르는 인연운이에요.'], act: ['작은 관심 표현이면 충분해요. 오늘 있었던 일을 물어봐 주세요.', '상대의 이야기를 끝까지 들어주는 것만으로 점수가 올라가요.', '혼자인 분이라면 취미 모임이나 지인 소개가 자연스러워요.'] },
    lo: { lead: ['감정이 예민해져 말 한마디가 크게 들리기 쉬운 날이에요.', '서운함이 쌓이거나 오해가 생기기 쉬운 날이에요.', '마음은 있는데 표현이 엇나가기 쉬운 날이에요.'], act: ['중요한 이야기는 내일로 미루고 오늘은 들어주는 쪽이 좋아요.', '답장이 늦어도 재촉하지 말고 하루 기다려 보세요.', '말하기 전에 한 번 숨을 고르면 오해를 막을 수 있어요.'] },
  },
  work: {
    hi: { lead: ['집중력이 좋고 성과가 눈에 보이는 날이에요. 평가나 협의에서 좋은 인상을 줄 수 있어요.', '일이 막힘없이 풀리고 주변의 신뢰도 따라오는 날이에요.', '판단이 빠르고 정확해서 미뤄 둔 일을 끝내기 좋아요.'], act: ['가장 중요한 일을 좋은 시간대에 배치해 보세요.', '제안서나 보고, 면접처럼 평가받는 일정이 있다면 자신 있게 임하세요.', '새 프로젝트의 첫 단추를 오늘 끼워 보세요.'] },
    mid: { lead: ['맡은 일을 차분히 해 나가기 좋은 날이에요.', '큰 변수 없이 계획대로 흘러가는 날이에요.', '속도는 보통이지만 꾸준함이 힘이 되는 날이에요.'], act: ['우선순위 세 가지를 정하고 하나씩 지워 보세요.', '동료의 도움 요청에는 가볍게 응하면 나중에 돌아와요.', '마감 전에 한 번 더 점검하면 실수가 줄어요.'] },
    lo: { lead: ['일정이 꼬이거나 확인할 게 갑자기 생기기 쉬운 날이에요.', '의욕은 있는데 속도가 안 붙는 날이에요.', '실수나 오해가 끼기 쉬워서 평소보다 신중해야 해요.'], act: ['중요한 결정과 서명은 미루고 정리와 점검 위주로 보내세요.', '보내기 전에 메일과 숫자를 한 번 더 확인하세요.', '혼자 끌어안지 말고 필요하면 일찍 도움을 구하세요.'] },
  },
  health: {
    hi: { lead: ['몸이 가볍고 의욕이 넘치는 날이에요.', '컨디션이 좋아 활동량을 늘려도 잘 받쳐 주는 날이에요.', '기운이 안정적이라 피로 회복도 빨라요.'], act: ['미뤄 둔 운동을 시작하기 좋아요. 가볍게 땀을 내 보세요.', '컨디션이 좋아도 무리가 붙지 않게 수분은 꼭 챙기세요.', '산책이나 스트레칭으로 기운을 더 끌어올려 보세요.'] },
    mid: { lead: ['컨디션은 평소 수준이에요.', '크게 아프지도, 펄펄 날지도 않는 보통 컨디션이에요.', '피로가 조금씩 쌓이는 중일 수 있어요.'], act: ['물을 자주 마시고 잠자는 시간을 지켜 보세요.', '식사를 거르지 말고 가볍게 걸어 보세요.', '화면을 오래 본다면 중간중간 눈과 목을 풀어 주세요.'] },
    lo: { lead: ['피로가 쌓이기 쉽고 몸이 무겁게 느껴질 수 있는 날이에요.', '작은 불편이 신경 쓰이기 쉬운 날이에요.', '긴장이 몸으로 나타나기 쉬운 날이에요.'], act: ['무리한 운동이나 늦은 밤 일정은 피하고 일찍 쉬세요.', '따뜻한 음료와 충분한 수면이 최고의 보약이에요.', '이동이 많다면 안전과 컨디션에 한 번 더 신경 쓰세요.'] },
  },
  study: {
    hi: { lead: ['머리가 맑고 이해가 빠른 날이에요. 새로운 것을 익히기에 잘 맞아요.', '집중이 깊어지고 암기와 정리가 잘되는 날이에요.', '배움과 시험, 자격 준비에서 좋은 흐름이 있어요.'], act: ['어려워서 미뤄 둔 과목이나 자료를 오늘 먼저 펴 보세요.', '공부 시간을 길게 잡고 짧은 휴식을 사이에 두세요.', '배운 것을 소리 내어 설명해 보면 오래 남아요.'] },
    mid: { lead: ['공부와 업무 지식이 차분히 쌓이는 날이에요.', '집중은 보통이지만 꾸준함으로 채울 수 있는 날이에요.', '새로운 걸 늘리기보다 아는 걸 다지기에 좋아요.'], act: ['복습과 오답 정리에 시간을 쓰면 효율이 좋아요.', '25분 집중, 5분 휴식으로 나눠서 해 보세요.', '책상 위를 정리하고 시작하면 집중이 쉬워요.'] },
    lo: { lead: ['생각이 산만해져 집중이 흩어지기 쉬운 날이에요.', '외워도 금방 날아가는 것 같아 답답할 수 있어요.', '공부보다 걱정이 앞서기 쉬운 날이에요.'], act: ['어려운 내용은 내일로 두고 쉬운 문제부터 풀며 감을 잡으세요.', '휴대폰은 멀리 두고 짧게라도 끝까지 해 보세요.', '충분히 자고 나면 내일 머리가 훨씬 맑아져요.'] },
  },
}

const SLOT_TXT: Record<SlotKey, Record<Tier, string[]>> = {
  morning: {
    hi: ['아침부터 기운이 좋아요. 중요한 일을 오전에 먼저 끝내면 하루가 가벼워요.', '오전은 판단이 맑은 시간이에요. 회의나 면담은 이때 잡아 보세요.'],
    mid: ['오전은 무난하게 시작해요. 천천히 속도를 올리면 돼요.', '오전엔 급한 일보다 정리부터 해 보세요.'],
    lo: ['오전엔 몸이 무겁고 일이 더딜 수 있어요. 중요한 일은 뒤로 미루세요.', '아침에 서두르면 실수가 나기 쉬워요. 여유 있게 출발하세요.'],
  },
  afternoon: {
    hi: ['오후에 흐름이 활발해져요. 사람을 만나거나 제안을 건네기에 좋아요.', '오후엔 일이 술술 풀려요. 미뤄 둔 연락을 이때 해 보세요.'],
    mid: ['오후는 평소 속도로 이어져요. 집중 시간을 길게 잡아 보세요.', '점심 이후 졸음만 조심하면 무난해요.'],
    lo: ['오후엔 의견 충돌이나 변수가 생기기 쉬워요. 말은 짧고 부드럽게 하세요.', '오후 일정은 느슨하게 두고 확인을 한 번 더 하세요.'],
  },
  night: {
    hi: ['저녁부터 마음이 편안해지고 좋은 이야기가 오가요. 약속이나 모임에 잘 맞아요.', '밤 시간에 아이디어가 잘 떠올라요. 메모해 두세요.'],
    mid: ['저녁은 차분하게 마무리돼요. 내일 준비를 해 두면 좋아요.', '밤에는 가벼운 취미로 긴장을 풀어 주세요.'],
    lo: ['밤엔 생각이 많아져 잠이 얕을 수 있어요. 일찍 쉬는 게 좋아요.', '늦은 시간의 큰 결정이나 연락은 아침으로 미루세요.'],
  },
}

const EL: Record<Element, { color: string; food: string[]; wear: string[]; num: [number, number] }> = {
  tree: { color: '초록', food: ['신선한 샐러드', '제철 나물', '녹차'], wear: ['초록 포인트 소품', '식물 무늬 스카프', '면 소재 편한 옷'], num: [3, 8] },
  fire: { color: '빨강', food: ['매콤한 음식', '붉은 과일', '따뜻한 국물'], wear: ['빨강 양말·포인트', '밝은 톤 상의', '따뜻한 색 머플러'], num: [2, 7] },
  earth: { color: '노랑·베이지', food: ['고구마·단호박', '잡곡밥', '꿀차'], wear: ['베이지·황토 톤 옷', '가죽 소품', '편안한 니트'], num: [5, 10] },
  metal: { color: '흰색·은색', food: ['배·무', '흰살생선', '두부 요리'], wear: ['흰 셔츠', '은색 액세서리', '단정한 깔끔한 룩'], num: [4, 9] },
  water: { color: '파랑·검정', food: ['미역국', '해산물', '물 충분히'], wear: ['네이비·블랙 톤', '유리·물방울 무늬 소품', '시원한 소재 옷'], num: [1, 6] },
}

export const LOADING_TIPS = [
  '일진은 그날의 하늘과 땅을 나타내는 두 글자예요. 내 사주와 얼마나 어울리는지가 점수의 바탕이에요.',
  '용신은 내 사주의 균형을 잡아 주는 기운이에요. 오늘 일진에 용신이 들어오면 점수가 올라가요.',
  '충은 부딪힘, 합은 어우러짐이에요. 오늘 일진이 내 일지와 만나는지도 함께 봐요.',
  '점수는 나의 앞뒤 한 달 흐름 안에서 오늘이 어디쯤인지 보여 줘요. 그래서 사람마다 달라요.',
  '오전·오후·밤은 그 시간의 간지를 내 사주와 따로 맞춰 본 값이에요.',
]

const scoreLabel = (s: number) => (s >= 84 ? '오늘은 최고의 날' : s >= 73 ? '아주 좋은 날' : s >= 62 ? '좋은 흐름' : s >= 52 ? '무난한 하루' : s >= 41 ? '차분하게 가는 날' : '쉬어 가는 날')
const md = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${m}/${d}` }
const mdKo = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${m}월 ${d}일` }
const DNAME = ['그제', '어제', '오늘', '내일', '모레']

export interface TodayViewKo {
  score: number; label: string; headline: string; delta: string
  axes: { key: AxisKey; name: string; score: number }[]
  total: string
  sections: { key: Exclude<AxisKey, 'total'>; name: string; score: number; text: string }[]
  slots: { key: SlotKey; name: string; sub: string; score: number; text: string }[]
  bestLine: string
  flow: { label: string; date: string; score: number; today: boolean }[]
  flowLine: string
  lucky: { label: string; value: string }[]
  avoid: string
  check: { title: string; text: string }
  caution: { title: string; text: string }
  week: { date: string; score: number; dow: string; best: boolean; low: boolean }[]
  profile: ReturnType<typeof profileOf>
  reason: ReturnType<typeof reasonOf>
  disclaimer: string
}

export function composeTodayKo(t: TodayData): TodayViewKo {
  const seed = t.base.seed
  const tt = tierOf(t.score)
  const ti = tt === 'hi' ? 0 : tt === 'mid' ? 1 : 2
  const headline = HEAD[t.base.theme][ti]
  const th = ko.theme[t.base.theme]
  const ev = t.base.event ? pick(ko.event[t.base.event], seed, 1) : ''
  const topN = AXIS_NAME[t.top]; const lowN = AXIS_NAME[t.low]
  const spread = t.axes[t.top] - t.axes[t.low]
  const axisLine = spread < 8 ? '영역별로 큰 차이 없이 고르게 흘러가는 날이에요.' : `오늘은 ${eun(topN)} 가장 힘이 실리고, ${eun(lowN)} 조금 조심해서 다루면 좋아요.`
  const total = [pick(th.body, seed, 0), ev, pick(TOTAL_ADVICE[tt], seed, 3), axisLine].filter(Boolean).join(' ')
  const sections = (['money', 'love', 'work', 'health', 'study'] as const).map((k, i) => {
    const s = t.axes[k]
    const a = AXT[k][tierOf(s)]
    return { key: k, name: AXIS_NAME[k], score: s, text: `${pick(a.lead, seed, 10 + i)} ${pick(MIDS[k][tierOf(s)], seed, 15 + i)} ${pick(a.act, seed, 20 + i)}` }
  })
  const slots = t.slots.map((s, i) => ({ key: s.key, ...SLOT_NAME[s.key], score: s.score, text: `${pick(SLOT2[s.key][tierOf(s.score)], seed, 30 + i)} ${slotTail(t.who.dayStem, s.ganzi[0], seed, 60 + i, tierOf(s.score) === 'lo')}` }))
  const mx = Math.max(...t.slots.map((s) => s.score)); const mn = Math.min(...t.slots.map((s) => s.score))
  const bestLine = mx - mn < 7 ? '하루 내내 큰 기복 없이 비슷하게 흘러가요.' : pick([`하루 중 ${SLOT_NAME[t.bestSlot].name}(${SLOT_NAME[t.bestSlot].sub})에 가장 힘이 실려요. 중요한 일은 이때 해 보세요.`, `오늘은 ${SLOT_NAME[t.bestSlot].name}(${SLOT_NAME[t.bestSlot].sub})이 가장 좋아요. 약속과 연락은 이 시간으로 잡아 보세요.`, `${SLOT_NAME[t.bestSlot].name}(${SLOT_NAME[t.bestSlot].sub})에 기운이 올라와요. 미뤄 둔 일은 이때 시작하면 수월해요.`, `힘을 쓸 때는 ${SLOT_NAME[t.bestSlot].name}(${SLOT_NAME[t.bestSlot].sub})이에요. 나머지 시간은 무리하지 말고 아껴 두세요.`], seed, 77)
  const flow = t.flow.map((f, i) => ({ label: DNAME[i], date: md(f.date), score: f.score, today: f.offset === 0 }))
  const today = t.flow[2].score; const tom = t.flow[3].score
  const peak = [...t.flow].sort((p, q) => q.score - p.score)[0]
  const trend = tom - today >= 8 ? '내일은 오늘보다 올라가는 흐름이에요. 오늘은 힘을 아끼고 내일을 준비해 보세요.' : today - tom >= 8 ? '내일은 오늘보다 내려가는 흐름이에요. 중요한 일은 오늘 마무리해 두세요.' : '내일도 오늘과 비슷한 흐름이에요.'
  const flowLine = `${trend} 그제부터 모레까지 중 가장 좋은 날은 ${mdKo(peak.date)}이에요.`
  const delta = t.deltaYesterday > 3 ? `어제보다 ${t.deltaYesterday}점 올랐어요` : t.deltaYesterday < -3 ? `어제보다 ${-t.deltaYesterday}점 내려갔어요` : '어제와 비슷해요'
  const e1 = t.base.lucky.element
  const E1 = EL[e1]; const X1 = EL_EXT[e1]
  const lucky = [
    { label: '행운의 색', value: E1.color },
    { label: '행운의 숫자', value: `${E1.num[0]}, ${E1.num[1]}` },
    { label: '좋은 방향', value: ko.lucky.dirs[t.base.lucky.direction] },
    { label: '행운의 음식', value: pick(X1.food, seed, 40) },
    { label: '행운의 소품', value: pick(X1.item, seed, 42) },
    { label: '좋은 장소', value: pick(X1.place, seed, 43) },
    { label: '행운의 코디', value: pick(X1.coordi, seed, 41) },
    { label: '힘이 실리는 시간', value: `${SLOT_NAME[t.bestSlot].name} ${SLOT_NAME[t.bestSlot].sub}` },
  ]
  const ck = t.top; const cn = t.low
  const AXA = (k: Exclude<AxisKey, 'total'>) => AXT[k][tierOf(t.axes[k])].act
  const check = { title: CHECK_T[ck], text: pick(AXA(ck), seed, 50) }
  const caution = { title: CAUTION_T[cn], text: pick(AXA(cn), seed, 51) }
  const DOW = ['일', '월', '화', '수', '목', '금', '토']
  const mxw = Math.max(...t.week.map((w) => w.score)); const mnw = Math.min(...t.week.map((w) => w.score))
  const week = t.week.map((w) => { const [y, m, d] = w.date.split('-').map(Number); return { date: `${m}/${d}`, score: w.score, dow: DOW[new Date(y, m - 1, d).getDay()], best: w.score === mxw, low: w.score === mnw } })
  return {
    score: t.score, label: scoreLabel(t.score), headline, delta,
    axes: (['total', 'money', 'love', 'work', 'health', 'study'] as AxisKey[]).map((k) => ({ key: k, name: AXIS_NAME[k], score: t.axes[k] })),
    total, sections, slots, bestLine, flow, flowLine, lucky, avoid: EL_EXT[t.who.avoidEl].avoid, check, caution, week, profile: profileOf(t.who), reason: reasonOf(t), disclaimer: ko.disclaimer,
  }
}

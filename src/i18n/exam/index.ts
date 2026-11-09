/** 시험 날 사주(수능·시험일). 시험 결과를 말하지 않고 그날의 컨디션·집중 흐름만 이야기한다. */
import type { DailyFortune, ThemeKey } from '../../myeongri/daily'
import { dailyPool } from '../daily'

type Lv = 'hi' | 'mid' | 'lo'
const tier = (n: number): Lv => (n >= 4 ? 'hi' : n <= 2 ? 'lo' : 'mid')

const ko = {
  title: '시험 날 사주', pickDate: '시험 날짜', dday: (d: number) => (d > 0 ? `D-${d}` : d === 0 ? 'D-DAY' : `D+${-d}`),
  examName: '2027학년도 수능', hero: { hi: '기운이 받쳐 주는 날', mid: '평소대로 가는 날', lo: '컨디션을 더 챙길 날' },
  theme: {
    bijeon: ['내 페이스로 밀고 가는 날', '남이 어떻게 푸는지 신경 쓰지 말고 내 속도를 지키면 실력이 그대로 나와요.'],
    geopjae: ['조급함을 다스릴 날', '경쟁 분위기에 마음이 급해지기 쉬워요. 아는 문제부터 풀고 시간 배분을 먼저 잡으세요.'],
    siksin: ['풀이가 술술 이어지는 날', '표현과 풀이가 자연스럽게 나오는 기운이에요. 서술형과 글 읽기에 힘이 붙고, 느긋한 마음이 도움이 돼요.'],
    sanggwan: ['머리는 빠르지만 실수를 살필 날', '생각이 빠르게 돌아가는 대신 한눈팔거나 지나치게 넘어가기 쉬워요. 답을 옮겨 적기 전에 한 번 더 확인하세요.'],
    pyeonjae: ['현실 감각이 살아나는 날', '계산과 판단이 빨라요. 쉬워 보이는 문제에서 방심하지 않도록 끝까지 읽으세요.'],
    jeongjae: ['차분히 꼼꼼하게 푸는 날', '성실하고 안정적인 기운이에요. 평소 준비한 만큼 차분히 꺼내 쓰기 좋아요.'],
    pyeongwan: ['긴장을 다룰 날', '압박감이 커지기 쉬운 기운이에요. 막히면 표시하고 넘어가고, 숨을 길게 내쉬며 마음을 가라앉히세요.'],
    jeonggwan: ['정석대로 가는 날', '규칙과 질서에 맞는 기운이라 기본기가 잘 드러나요. 잔꾀 없이 정석대로 푸세요.'],
    pyeonin: ['생각이 많아지는 날', '직관이 번뜩이지만 의심도 늘어요. 답을 바꿀 때는 분명한 근거가 있을 때만 바꾸세요.'],
    jeongin: ['공부 기운이 가장 잘 받는 날', '집중과 안정에 힘이 실리는, 시험에 잘 맞는 기운이에요. 평소 하던 대로 차분히 하면 돼요.'],
  } as Record<ThemeKey, [string, string]>,
  event: {
    clash_day: '이 날은 내 사주의 가까운 자리와 부딪혀 컨디션이나 마음이 흔들리기 쉬워요. 전날 일찍 자고 준비물을 미리 챙겨 두세요.',
    harmony_day: '내 사주와 서로 끌리는 날이라 마음이 안정되기 쉬워요.',
    repeat: '내 일주와 같은 기운의 날이에요. 평소 실력이 그대로 나오기 쉬워요.',
    compose: '기운이 한데 모이는 날이라 평소보다 몰입이 잘 될 수 있어요.',
    clash_month: '분위기가 평소와 조금 달라서 낯선 시험장 환경에 영향을 받기 쉬워요. 미리 마음의 준비를 해 두세요.',
  } as Record<string, string>,
  tier: { hi: '기운이 받쳐 주는 날이에요.', mid: '평소 컨디션대로 가는 날이에요.', lo: '기운이 약한 편이라 컨디션 관리를 더 챙기면 좋아요.' } as Record<Lv, string>,
  beforeT: '시험 전 3일 컨디션',
  before: { hi: '공부가 잘 붙는 날', mid: '정리하며 다지는 날', lo: '무리 말고 쉬는 날' } as Record<Lv, string>,
  luckyT: '시험 날 행운 포인트', luckyNote: '문구·옷의 색이나 좌석 번호에 가볍게 활용해 보세요.',
  checkT: '시험 날 체크', check: ['전날 밤 일찍 자기', '아침은 평소 먹던 대로 가볍게', '수험표·신분증·시계 전날 챙기기', '막히는 문제는 표시하고 넘어가기'],
  note: '이 풀이는 시험 결과가 아니라 그날의 기운 흐름을 이야기해요. 합격과 점수는 지금까지의 준비와 실력이 가장 크게 좌우해요. 재미와 응원으로 봐 주세요.',
  past: '이미 지난 날짜예요. 다른 날짜를 골라 보세요.',
}
const en: typeof ko = {
  title: 'Exam-day reading', pickDate: 'Exam date', dday: (d: number) => (d > 0 ? `D-${d}` : d === 0 ? 'D-DAY' : `D+${-d}`),
  examName: 'CSAT 2027 (Korea)', hero: { hi: 'A well-supported day', mid: 'An ordinary day', lo: 'A day to look after yourself' },
  theme: {
    bijeon: ['Hold your own pace', 'Ignore how others are doing. Keep your speed and your real ability shows.'],
    geopjae: ['Tame the rush', 'Competitive air makes you hurry. Do what you know first and set your time split early.'],
    siksin: ['Answers flow', 'Expression comes naturally. Written answers and reading get a lift; a relaxed mind helps.'],
    sanggwan: ['Quick head, check for slips', 'Thinking runs fast, but you may skim or skip. Re-check before you copy answers over.'],
    pyeonjae: ['Practical sense is sharp', 'Calculation and judgment are quick. Read to the end so easy-looking items do not catch you out.'],
    jeongjae: ['Calm and careful', 'Steady, diligent energy. Easy to bring out exactly what you prepared.'],
    pyeongwan: ['Handle the tension', 'Pressure builds easily. Mark what blocks you, move on, and breathe out slowly.'],
    jeonggwan: ['Go by the book', 'Orderly energy lets your basics show. Skip tricks and solve it the standard way.'],
    pyeonin: ['Many thoughts', 'Intuition flashes but doubt grows too. Change an answer only with a clear reason.'],
    jeongin: ['Best day for study energy', 'Focus and steadiness are supported — a good fit for exams. Just do what you have practiced.'],
  } as Record<ThemeKey, [string, string]>,
  event: {
    clash_day: 'This day clashes with a close seat in your chart, so mood and condition can wobble. Sleep early the night before and prepare items ahead.',
    harmony_day: 'A day that pulls toward your chart, so your mind settles more easily.',
    repeat: 'A day of the same energy as your day pillar. Your usual ability tends to show as it is.',
    compose: 'Energies gather, so you may get into deeper focus than usual.',
    clash_month: 'The mood differs from usual, so an unfamiliar exam room can affect you. Prepare your mind ahead.',
  } as Record<string, string>,
  tier: { hi: 'Your chart is well supported that day.', mid: 'A day at your usual condition.', lo: 'Energy runs lower, so look after your condition more.' } as Record<Lv, string>,
  beforeT: 'The 3 days before',
  before: { hi: 'Study sticks', mid: 'Review and consolidate', lo: 'Rest, do not push' } as Record<Lv, string>,
  luckyT: 'Exam-day lucky points', luckyNote: 'Use lightly: the colour of a pen or clothes, a seat number.',
  checkT: 'Exam-day checklist', check: ['Sleep early the night before', 'Eat your usual light breakfast', 'Pack ID, admission slip and watch the day before', 'Mark what blocks you and move on'],
  note: 'This reading speaks of the day\'s energy, not the result. Preparation and ability matter far more. Take it as fun and encouragement.',
  past: 'That date has passed. Pick another date.',
}
const L = (lang: string) => (lang === 'ko' ? ko : en)

export interface ExamView {
  title: string; pickDate: string; dday: string; examName: string
  stars: number; label: string; headline: string; body: string; event: string | null; tierLine: string
  beforeT: string; before: { date: string; stars: number; line: string }[]
  luckyT: string; luckyNote: string; lucky: { label: string; value: string }[]
  checkT: string; check: string[]; note: string
}
export const EXAM_DATE = '2026-11-12'
export const examText = (lang: string) => ({ title: L(lang).title, pickDate: L(lang).pickDate, past: L(lang).past })

export function composeExam(f: DailyFortune, before: DailyFortune[], dday: number, lang: string): ExamView {
  const t = L(lang), d = dailyPool(lang), lv = tier(f.stars)
  const th = t.theme[f.theme]
  return {
    title: t.title, pickDate: t.pickDate, dday: t.dday(dday), examName: t.examName,
    stars: f.stars, label: t.hero[lv], headline: th[0], body: th[1], event: f.event ? t.event[f.event] : null, tierLine: t.tier[lv],
    beforeT: t.beforeT, before: before.map((b) => ({ date: b.date, stars: b.stars, line: t.before[tier(b.stars)] })),
    luckyT: t.luckyT, luckyNote: t.luckyNote,
    lucky: [{ label: d.lucky.color, value: d.lucky.colors[f.lucky.color] }, { label: d.lucky.number, value: String(f.lucky.number) }, { label: d.lucky.direction, value: d.lucky.dirs[f.lucky.direction] }],
    checkT: t.checkT, check: t.check, note: t.note,
  }
}

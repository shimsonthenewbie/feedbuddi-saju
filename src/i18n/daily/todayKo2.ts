/** 오늘의 운세 2.0 보강 문구 (시간대 비유·영역 중간문장·행운 확장·근거·프로필·띠·별자리). "경향" 어조. */
import type { Element } from '../../engine/types'
import type { TodayData, SlotKey } from '../../myeongri/today'
import { soft } from '../../myeongri/today'
import { DM } from '../../myeongri/plain'

export type Tier = 'hi' | 'mid' | 'lo'
// 자리(salt)마다 서로 독립적으로 고르도록 섞는다. 예전 식은 문장들이 늘 같은 조합으로 묶여 나왔다.
export const pick = <T>(a: T[], seed: number, salt = 0): T => a[((): number => { let h = (seed ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0; h = Math.imul(h ^ (h >>> 15), 0x85ebca6b) >>> 0; h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0; return (h ^ (h >>> 16)) >>> 0 })() % a.length]

export const SLOT2: Record<SlotKey, Record<Tier, string[]>> = {
  morning: {
    hi: ['해가 막 떠오르는 길 위를 달리는 오전이에요. 머리가 맑고 손이 빨라서 중요한 일을 먼저 끝내 두면 하루가 가벼워져요.', '맑게 갠 아침 하늘처럼 시작이 산뜻한 오전이에요. 회의나 면담, 부탁할 일이 있다면 이 시간에 꺼내 보세요.', '첫 단추가 잘 끼워지는 오전이에요. 오늘 계획 중 가장 어려운 일을 맨 앞에 두면 나머지가 술술 풀려요.'],
    mid: ['안개가 서서히 걷히는 아침 같은 오전이에요. 처음엔 느리지만 시간이 갈수록 속도가 붙어요.', '잔잔한 호수 같은 오전이에요. 큰일을 벌이기보다 할 일을 정리하고 메일과 연락부터 훑어보세요.', '평소 리듬대로 흘러가는 오전이에요. 아침 루틴을 지키면 컨디션이 안정적으로 유지돼요.'],
    lo: ['짙은 안개 속을 천천히 걷는 듯한 오전이에요. 몸도 마음도 무거울 수 있으니 중요한 결정은 오후로 미루세요.', '출발선에서 발이 자꾸 걸리는 오전이에요. 서두르면 실수가 나기 쉬우니 한 번 더 확인하고 움직이세요.', '아침부터 변수가 끼어들기 쉬운 오전이에요. 일정을 느슨하게 잡고 급한 말은 줄여 보세요.'],
  },
  afternoon: {
    hi: ['한낮의 햇살처럼 기운이 가장 밝게 퍼지는 오후예요. 사람을 만나고 제안을 건네기에 가장 좋은 시간이에요.', '순풍을 만난 돛단배 같은 오후예요. 미뤄 둔 연락이나 협의를 이 시간에 해 보세요. 반응이 좋아요.', '일이 손에 착착 붙는 오후예요. 성과가 눈에 보이니 평가받는 일정은 이때 잡으면 좋아요.'],
    mid: ['잔잔한 강물처럼 이어지는 오후예요. 속도는 평범하지만 꾸준히 하면 해야 할 일이 차곡차곡 끝나요.', '점심 뒤 나른함만 넘기면 무난한 오후예요. 집중 시간을 길게 잡고 쉬는 시간은 짧게 가져가 보세요.', '큰 기복 없이 흘러가는 오후예요. 회의나 약속은 평소 방식대로 해도 충분해요.'],
    lo: ['구름이 해를 자꾸 가리는 오후예요. 의견이 엇갈리거나 변수가 생길 수 있으니 말은 짧고 부드럽게 하세요.', '역풍을 만난 배처럼 힘이 드는 오후예요. 욕심내서 밀어붙이기보다 정리와 점검에 시간을 쓰세요.', '작은 오해가 커지기 쉬운 오후예요. 메시지는 보내기 전에 한 번 더 읽어 보세요.'],
  },
  night: {
    hi: ['별이 켜지는 저녁처럼 마음이 편안하게 풀리는 밤이에요. 약속이나 모임, 좋은 사람과의 대화에 잘 맞아요.', '하루의 수고가 보상받는 밤이에요. 아이디어가 잘 떠오르니 메모장을 곁에 두세요.', '따뜻한 불빛 아래 앉은 듯한 밤이에요. 미뤄 둔 이야기를 꺼내기에 좋아요.'],
    mid: ['조용히 물결이 잦아드는 밤이에요. 내일 준비를 해 두고 일찍 마무리하면 좋아요.', '차분하게 하루를 정리하기 좋은 밤이에요. 가벼운 취미나 산책으로 긴장을 풀어 주세요.', '특별한 일 없이 평온한 밤이에요. 화면을 줄이고 잠자리를 일찍 준비해 보세요.'],
    lo: ['달이 구름에 가린 듯 생각이 많아지는 밤이에요. 잠이 얕아질 수 있으니 일찍 쉬는 게 좋아요.', '밤에 꺼낸 말은 아침에 후회하기 쉬워요. 큰 결정과 감정적인 연락은 내일 아침으로 미루세요.', '피로가 한꺼번에 몰려오는 밤이에요. 야식과 늦은 일정은 줄이고 따뜻하게 쉬어 주세요.'],
  },
}

type Ax = 'money' | 'love' | 'work' | 'health' | 'study'
export const MIDS: Record<Ax, Record<Tier, string[]>> = {
  money: {
    hi: ['특히 오늘은 쓰는 돈보다 들어오는 흐름이 앞서서 마음이 든든해요.', '평소 고민하던 거래라면 상대의 반응이 호의적일 가능성이 높아요.', '받을 돈이나 정산할 일이 있다면 오늘 챙겨 두면 순조로워요.'],
    mid: ['큰 이득을 노리기보다 지키면서 쌓는 쪽이 어울려요.', '예상한 만큼만 들어오고 예상한 만큼만 나가는 안정적인 날이에요.', '작은 지출이 모이기 쉬우니 카드 내역을 한번 훑어보면 좋아요.'],
    lo: ['기분이 좋아서, 혹은 기분이 안 좋아서 쓰는 돈이 늘 수 있어요.', '남의 말만 믿고 서둘러 결정하면 손해가 날 수 있어요.', '오늘 놓치는 돈은 생각보다 적으니 서두르지 않아도 괜찮아요.'],
  },
  love: {
    hi: ['말투와 표정이 부드러워서 처음 만나는 사람에게도 좋은 인상을 줘요.', '연인이 있다면 사소한 다정함이 오래 기억에 남는 날이에요.', '혼자인 분은 일상 속 우연한 대화에서 설렘이 시작될 수 있어요.'],
    mid: ['큰 이벤트보다 평소처럼 편안한 시간이 관계를 단단하게 해 줘요.', '상대가 바빠 보이거나 무심해 보여도 오늘은 깊이 생각하지 않아도 돼요.', '혼자 있는 시간도 마음을 채우는 데 도움이 되는 날이에요.'],
    lo: ['내 마음이 불안해서 상대의 말을 꼬아 듣기 쉬워요.', '작은 서운함이 쌓이면 괜히 날을 세우게 될 수 있어요.', '상대의 반응이 미지근해도 마음이 식은 게 아니라 오늘의 기운 때문일 수 있어요.'],
  },
  work: {
    hi: ['판단이 빠르고 정확해서 어려운 결정도 매끄럽게 풀려요.', '윗사람이나 거래처의 신뢰를 얻기 쉬운 흐름이에요.', '머뭇거린 일을 시작하면 생각보다 빨리 속도가 붙어요.'],
    mid: ['새로운 시도보다 하던 일의 완성도를 높이는 쪽이 좋아요.', '누가 알아주지 않아도 오늘 쌓은 성실함은 나중에 평가로 돌아와요.', '회의가 길어질 수 있으니 핵심만 정리해 가면 편해요.'],
    lo: ['서두르면 순서가 꼬이고 확인 안 한 부분에서 실수가 나기 쉬워요.', '의견이 부딪혀도 이기려 하기보다 한 걸음 물러서는 쪽이 이득이에요.', '중요한 일일수록 오늘은 초안만 잡아 두고 내일 마무리해 보세요.'],
  },
  health: {
    hi: ['잠을 잘 잔 듯 몸이 가볍고 소화와 컨디션도 안정적이에요.', '운동 효과가 잘 나는 날이라 평소보다 한 단계 강도를 올려도 괜찮아요.', '기분이 몸을 끌어올려 줘서 활동량이 많아도 덜 지쳐요.'],
    mid: ['특별한 문제는 없지만 오래 앉아 있으면 어깨와 목이 뻐근해질 수 있어요.', '카페인과 간식에 기대기 쉬우니 물과 식사 시간을 챙겨 주세요.', '저녁에 가볍게 걷기만 해도 컨디션이 확 달라져요.'],
    lo: ['몸이 보내는 작은 신호를 놓치기 쉬워요. 피곤하면 바로 쉬어 주세요.', '마음이 급할수록 위와 목, 어깨가 먼저 긴장해요.', '컨디션이 처질 때 억지로 버티면 내일까지 이어질 수 있어요.'],
  },
  study: {
    hi: ['이해가 한 번에 되는 느낌이 들고 암기한 내용이 오래 남아요.', '어려운 개념도 풀어서 보면 길이 보이는 날이에요.', '시험이나 자격 준비가 있다면 오늘의 집중력을 꼭 활용해 보세요.'],
    mid: ['속도보다 꾸준함이 이기는 날이에요.', '아는 것을 다시 정리하는 시간이 가장 큰 효과를 내요.', '오래 앉아 있기보다 짧은 시간을 여러 번 나눠서 하면 좋아요.'],
    lo: ['책을 펴도 다른 생각이 끼어들어 흐름이 자주 끊겨요.', '오늘 안 외워지는 건 능력 문제가 아니라 컨디션 때문이니 자책하지 마세요.', '새로운 내용을 넣기보다 이미 아는 내용을 훑는 편이 효율적이에요.'],
  },
}

export const CHECK_T: Record<Ax, string> = { money: '수입·거래 확인하기', love: '먼저 안부 건네기', work: '중요한 일 먼저 처리하기', health: '가볍게 몸 움직이기', study: '미뤄 둔 공부 펴기' }
export const CAUTION_T: Record<Ax, string> = { money: '충동 결제 줄이기', love: '말끝 다듬기', work: '서명·결정 미루기', health: '무리한 일정 피하기', study: '산만함 줄이기' }

export const EL_EXT: Record<Element, { color: string; avoid: string; food: string[]; item: string[]; coordi: string[]; place: string[] }> = {
  tree: { color: '초록', avoid: '초록색', food: ['신선한 샐러드', '제철 나물', '녹차'], item: ['작은 화분', '나무 소재 펜', '초록색 노트'], coordi: ['연한 초록 상의에 베이지 하의', '린넨 셔츠에 편한 면바지'], place: ['공원 산책로', '서점'] },
  fire: { color: '빨강', avoid: '빨간색', food: ['매콤한 음식', '붉은 과일', '따뜻한 국물'], item: ['붉은 계열 파우치', '따뜻한 텀블러', '향초'], coordi: ['붉은 포인트가 들어간 니트', '밝은 상의에 어두운 하의'], place: ['햇볕 드는 카페', '밝은 조명의 매장'] },
  earth: { color: '노랑·베이지', avoid: '노랑·베이지', food: ['고구마·단호박', '잡곡밥', '꿀차'], item: ['가죽 지갑', '도자기 컵', '베이지색 에코백'], coordi: ['베이지·카멜 톤 코트', '황토색 니트에 청바지'], place: ['집·정원', '단골 식당'] },
  metal: { color: '흰색·은색', avoid: '흰색·은색', food: ['배·무', '흰살생선', '두부 요리'], item: ['은색 시계', '금속 볼펜', '흰색 손수건'], coordi: ['흰 셔츠에 회색 재킷', '은색 액세서리를 더한 단정한 룩'], place: ['도서관', '정돈된 사무실'] },
  water: { color: '파랑·검정', avoid: '파랑·검정', food: ['미역국', '해산물', '물 넉넉히'], item: ['투명한 물병', '네이비 에코백', '유리 소품'], coordi: ['네이비 재킷에 검정 팬츠', '짙은 블루 계열의 차분한 룩'], place: ['강가·호수 근처', '조용한 서재'] },
}

const SK = '갑을병정무기경신임계', BK = '자축인묘진사오미신유술해'
const SH = '甲乙丙丁戊己庚辛壬癸', BH = '子丑寅卯辰巳午未申酉戌亥'
export const ganziKo = (g: string) => `${SK[SH.indexOf(g[0])]}${BK[BH.indexOf(g[1])]}(${g})`
const COLOR_OF = ['푸른', '푸른', '붉은', '붉은', '황금', '황금', '하얀', '하얀', '검은', '검은']
const ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지']
const EL_OF_STEM = ['나무', '나무', '불', '불', '흙', '흙', '쇠', '쇠', '물', '물']
export function profileOf(w: TodayData['who']) {
  const si = SH.indexOf(w.dayStem); const bi = BH.indexOf(w.dayBranch)
  return { el: EL_OF_STEM[si], animal: `${COLOR_OF[si]} ${ANIMAL[bi]}`, image: DM[w.dayStem], strength: w.strength, gyeok: w.gyeok }
}

const SIP: Record<string, string> = { 비견: '나와 닮은 기운', 겁재: '경쟁하며 나누는 기운', 식신: '즐겁게 표현하는 기운', 상관: '재능을 드러내는 기운', 편재: '움직이며 얻는 재물 기운', 정재: '차곡차곡 쌓는 재물 기운', 편관: '압박과 책임의 기운', 정관: '질서와 신뢰의 기운', 편인: '직감과 새 배움의 기운', 정인: '도움과 안정의 기운' }
const ROLE: Record<string, string> = { 용신: '내게 가장 필요한 기운이라 점수를 크게 올려요', 희신: '나를 도와주는 기운이라 점수를 올려요', 한신: '점수에는 큰 영향이 없어요', 구신: '조금 부담이 되는 기운이라 점수를 깎아요', 기신: '내게 가장 부담이 되는 기운이라 점수를 크게 깎아요' }
const TARGET: Record<string, string> = { 일지: '일지(나·배우자·건강 자리)', 월지: '월지(직장·사회 자리)', 년지: '년지(가정·배경 자리)', 시지: '시지(계획·말년 자리)', 일간: '일간(나 자신)', 월간: '월간', 년간: '년간', 시간: '시간', 세운지: '올해 운의 땅 기운(세운)', 세운간: '올해 운의 하늘 기운(세운)', 대운지: '10년 운의 땅 기운(대운)', 대운간: '10년 운의 하늘 기운(대운)' }
const KIND = (k: string) => (k.startsWith('충') ? '서로 부딪혀서 변동이 생기기 쉬워요' : k.startsWith('합') ? '서로 어우러져서 부드럽게 맞물려요' : k.startsWith('형') ? '서로 꼬이기 쉬워 신중해야 해요' : k.startsWith('복음') ? '같은 간지가 되풀이돼서 비슷한 일이 반복되기 쉬워요' : k.startsWith('천극') ? '하늘과 땅이 함께 부딪혀 변화 폭이 커요' : k.startsWith('삼합') || k.startsWith('방합') ? '같은 기운이 크게 모여요' : '살짝 어긋나는 느낌이 있어요')

export function reasonOf(t: TodayData): { rows: [string, string][]; note: string } {
  const L = t.luck
  const rows: [string, string][] = []
  rows.push(['오늘의 일진', `${ganziKo(L.ganzi)}일이에요. 하늘 기운은 ${SIP[L.stemSipsin]}(${L.stemSipsin}), 땅 기운은 ${SIP[L.branchSipsin]}(${L.branchSipsin})이에요.`])
  rows.push(['내 사주와의 궁합', `하늘 기운은 ${ROLE[L.stemRole]}. 땅 기운은 ${ROLE[L.branchRole]}.`])
  const hs = [...L.hits].filter((h) => Math.abs(h.effect) >= 0.3).sort((p, q) => Math.abs(q.effect) - Math.abs(p.effect)).slice(0, 2)
  rows.push(['부딪힘과 어우러짐', hs.length ? hs.map((h) => `오늘 일진과 내 ${TARGET[h.target] ?? h.target}가 ${KIND(h.kind)}.`).join(' ') : '오늘 일진은 내 사주와 크게 부딪히거나 합해지는 곳이 없어요.'])
  return { rows, note: `이 세 가지를 합쳐 오늘 총운 ${t.score}점이 나왔어요. 점수는 나의 앞뒤 한 달 흐름 안에서의 위치예요.` }
}

/* ───────── 띠별 운세 (오늘 일진의 땅 기운 vs 12띠) ───────── */
const HAP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]]
const WON = [[0, 7], [1, 6], [2, 9], [3, 8], [4, 11], [5, 10]]
type Rel = 'hap' | 'sam' | 'same' | 'chung' | 'won' | 'none'
export const REL_LABEL: Record<Rel, string> = { hap: '오늘 일진과 육합 · 서로 잘 맞아요', sam: '오늘 일진과 삼합 · 기운이 모여요', same: '같은 띠의 날 · 내 날이에요', chung: '오늘 일진과 충 · 변동에 주의', won: '오늘 일진과 원진 · 마음이 어긋나기 쉬워요', none: '오늘 일진과 무난한 사이' }
const REL_RAW: Record<Rel, number> = { hap: 2, sam: 1.5, same: 0.6, chung: -2, won: -1, none: 0 }
const REL_TXT: Record<Rel, string[]> = {
  hap: ['오늘은 주변과 손발이 척척 맞아요. 부탁하거나 협의할 일이 있다면 오늘이 적기예요.', '귀인의 기운이 가까이 있어요. 먼저 말을 걸면 뜻밖의 도움을 받을 수 있어요.', '인연이 부드럽게 이어지는 날이에요. 약속을 잡거나 연락을 다시 시작해 보세요.'],
  sam: ['같은 편이 모여드는 날이에요. 함께하는 일에서 힘이 커지니 팀 일정에 잘 맞아요.', '여럿이 모일수록 좋은 날이에요. 모임이나 협업에서 존재감이 살아나요.', '주변의 지지를 받기 쉬운 날이에요. 도움을 청하는 데 망설이지 마세요.'],
  same: ['내 페이스를 지키기 좋은 날이에요. 남의 속도에 흔들리지 말고 하던 일에 집중해 보세요.', '평소의 나다움이 드러나는 날이에요. 다만 같은 실수가 되풀이되기 쉬우니 확인은 한 번 더 하세요.', '자기 자신에게 집중하기 좋은 날이에요. 혼자 정리할 일을 오늘 처리해 보세요.'],
  chung: ['일정이나 이동에서 변동이 생기기 쉬운 날이에요. 시간을 넉넉히 잡고 서두르지 마세요.', '계획이 한 번 흔들릴 수 있어요. 유연하게 받아들이면 오히려 새 길이 열려요.', '말과 행동이 부딪히기 쉬운 날이에요. 중요한 결정은 한 템포 늦추는 게 좋아요.'],
  won: ['마음은 있는데 표현이 엇나가기 쉬운 날이에요. 말은 부드럽게, 오해는 바로 풀어 보세요.', '사소한 일에 서운함이 생기기 쉬워요. 상대의 말을 한 번 더 좋게 해석해 보세요.', '속마음을 숨기면 답답해지니 짧고 솔직하게 전해 보세요.'],
  none: ['큰 파도 없이 흘러가는 날이에요. 해야 할 일을 차분히 이어 가면 충분해요.', '평소 리듬이 유지되는 날이에요. 작은 루틴을 지키면 하루가 편안해요.', '무난하게 지나가는 날이에요. 미뤄 둔 정리나 점검을 하기 좋아요.'],
}
// 출생연도별 한 줄: 오늘 하늘 기운(일진 천간)의 오행 T 와 태어난 해 천간의 오행 Y 의 관계
type YRel = 'same' | 'help' | 'out' | 'press' | 'gain'
const YREL_TXT: Record<YRel, string[]> = {
  same: ['오늘 하늘의 {T} 기운이 태어난 해의 {Y} 기운과 같아요. 내 편이 늘어나는 날이니 또래·동료와 힘을 합쳐 보세요.', '같은 {Y} 기운이 겹치는 날이에요. 자신감이 붙지만 고집도 세지니 한 발 양보하면 일이 쉬워요.', '{Y} 기운이 한 번 더 들어와요. 하던 일을 밀고 나가기 좋고, 지출 경쟁만 조심하세요.'],
  help: ['오늘 하늘의 {T} 기운이 태어난 해의 {Y} 기운을 길러 줘요. 윗사람의 도움이나 반가운 소식이 닿기 쉬워요.', '{T} 기운이 {Y} 기운을 받쳐 주는 날이에요. 배우고 묻는 일에 운이 따르니 모르는 건 바로 물어보세요.', '{T}이(가) {Y}을(를) 살려 주는 날이에요. 문서·계약·공부처럼 차분한 일이 잘 풀려요.'],
  out: ['태어난 해의 {Y} 기운이 오늘 하늘의 {T} 기운을 낳아요. 내 힘이 밖으로 나가는 날이니 재능을 보여 주기 좋지만 체력은 아껴 쓰세요.', '{Y} 기운이 {T} 기운으로 흘러 나가요. 말과 표현에 힘이 실리니 발표·제안에 좋고, 한마디 더 하고 싶을 때 멈추면 딱 좋아요.', '내 {Y} 기운을 써서 {T} 기운을 키우는 날이에요. 베푼 만큼 돌아오니 먼저 챙겨 주세요.'],
  press: ['오늘 하늘의 {T} 기운이 태어난 해의 {Y} 기운을 눌러요. 책임질 일이 늘어나는 날이니 약속과 규칙을 먼저 챙기세요.', '{T} 기운이 {Y} 기운을 다듬는 날이에요. 조금 답답해도 맡은 일을 해내면 신뢰가 쌓여요.', '{T}이(가) {Y}을(를) 누르는 날이에요. 윗사람과 부딪히기 쉬우니 대답은 짧게, 일은 정확하게 하세요.'],
  gain: ['태어난 해의 {Y} 기운이 오늘 하늘의 {T} 기운을 다스려요. 내가 잡을 수 있는 기회가 보이는 날이니 돈·거래 이야기를 미루지 마세요.', '{Y} 기운이 {T} 기운을 쥐는 날이에요. 실속을 챙기기 좋지만 욕심을 한 뼘만 줄이면 탈이 없어요.', '내 {Y} 기운으로 {T} 기운을 움직이는 날이에요. 발로 뛰는 만큼 얻으니 직접 확인하고 직접 만나세요.'],
}
const EL_IDX = (stemIdx: number) => Math.floor(stemIdx / 2) // 0목 1화 2토 3금 4수
export interface YearLine { year: number; ganzi: string; text: string }
export function yearLines(dayStem: string, zodiac: number, seed: number): YearLine[] {
  const T = EL_IDX(SH.indexOf(dayStem))
  const out: YearLine[] = []
  for (let y = 1948 + zodiac - 12; y <= 2008; y++) {
    if (((y - 4) % 12 + 12) % 12 !== zodiac || y < 1942) continue
    const si = ((y - 4) % 10 + 10) % 10
    const Y = EL_IDX(si)
    const rel: YRel = T === Y ? 'same' : (T + 1) % 5 === Y ? 'help' : (Y + 1) % 5 === T ? 'out' : (T + 2) % 5 === Y ? 'press' : 'gain'
    const text = pick(YREL_TXT[rel], seed, y).replace(/\{T\}/g, EL_OF_STEM[T * 2]).replace(/\{Y\}/g, EL_OF_STEM[Y * 2]).replace(/(나무|불|흙|쇠|물)이\(가\)/g, (_, w) => w + (w === '나무' || w === '쇠' ? '가' : '이')).replace(/(나무|불|흙|쇠|물)을\(를\)/g, (_, w) => w + (w === '나무' || w === '쇠' ? '를' : '을'))
    out.push({ year: y, ganzi: SH[si] + BH[zodiac], text })
  }
  return out.slice(-6)
}
export interface ZodiacRow { key: number; name: string; years: string; rel: Rel; relLabel: string; score: number; text: string; mine: boolean; byYear: YearLine[] }
export function zodiacToday(dayBranch: string, myBranch: string, seed: number, dayStem = '甲'): ZodiacRow[] {
  const d = BH.indexOf(dayBranch)
  return ANIMAL.map((nm, i) => {
    const pair = (L: number[][]) => L.some(([x, y]) => (x === d && y === i) || (x === i && y === d))
    const rel: Rel = i === d ? 'same' : (i - d + 12) % 12 === 6 ? 'chung' : pair(HAP) ? 'hap' : (i % 4 === d % 4) ? 'sam' : pair(WON) ? 'won' : 'none'
    const jit = ((seed + i * 31) % 7) - 3
    const score = soft(Math.max(40, Math.min(94, Math.round(62 + REL_RAW[rel] * 11 + jit))))
    const years = [2020, 2008, 1996, 1984, 1972, 1960].map((y) => y - (((y - 4) % 12) - i + 12) % 12).filter((y) => y <= 2020).slice(0, 4).map((y) => String(y).slice(2)).join('·')
    return { key: i, name: nm + '띠', years: years, rel, relLabel: REL_LABEL[rel], score, text: pick(REL_TXT[rel], seed, i), mine: BH[i] === myBranch, byYear: yearLines(dayStem, i, seed) }
  })
}

/* ───────── 별자리 운세 (오늘의 달 별자리 vs 12별자리) ───────── */
export const SIGN_KO = ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '사수자리', '염소자리', '물병자리', '물고기자리']
export const SIGN_DATE = ['3.21~4.19', '4.20~5.20', '5.21~6.21', '6.22~7.22', '7.23~8.22', '8.23~9.23', '9.24~10.23', '10.24~11.22', '11.23~12.24', '12.25~1.19', '1.20~2.18', '2.19~3.20']
type SRel = 'same' | 'trine' | 'sextile' | 'square' | 'opp' | 'none'
const SREL_RAW: Record<SRel, number> = { same: 1.5, trine: 1.5, sextile: 1, square: -1, opp: -0.4, none: 0 }
export const SREL_LABEL: Record<SRel, string> = { same: '오늘의 달과 같은 자리 · 마음이 편해요', trine: '오늘의 달과 같은 원소 · 호흡이 잘 맞아요', sextile: '오늘의 달과 서로 돕는 사이', square: '오늘의 달과 각이 서는 사이 · 감정 조심', opp: '오늘의 달과 마주 보는 사이 · 균형이 필요해요', none: '오늘의 달과 무난한 사이' }
const SREL_TXT: Record<SRel, string[]> = {
  same: ['감정의 결이 나와 꼭 맞는 날이에요. 마음 가는 대로 해도 크게 어긋나지 않아요.', '내 본모습이 편안하게 드러나는 날이에요. 좋아하는 일에 시간을 써 보세요.'],
  trine: ['생각과 감정이 한 방향으로 흘러요. 계획한 일이 매끄럽게 이어지는 날이에요.', '사람들과 호흡이 잘 맞아요. 대화와 협업에서 좋은 반응을 얻기 쉬워요.'],
  sextile: ['작은 기회가 곁에 와 있어요. 먼저 손을 내밀면 도움을 받을 수 있어요.', '새로운 사람이나 정보가 도움이 되는 날이에요. 열린 마음으로 들어 보세요.'],
  square: ['감정이 엇갈리기 쉬운 날이에요. 중요한 이야기는 숨을 고르고 천천히 하세요.', '작은 일에 예민해질 수 있어요. 한 박자 쉬어 가면 금방 풀려요.'],
  opp: ['마음과 현실이 서로 다른 방향을 보는 날이에요. 중간 지점을 찾으면 편해져요.', '상대의 입장을 한 번 더 헤아려 보면 오해가 줄어요.'],
  none: ['큰 기복 없이 흘러가는 날이에요. 평소 하던 일에 집중해 보세요.', '무난한 하루예요. 작은 즐거움을 챙기면 기분이 좋아져요.'],
}
export interface StarRow { key: number; name: string; date: string; rel: SRel; relLabel: string; score: number; text: string; mine: boolean }
export function starToday(moonSign: number, mySign: number, seed: number): StarRow[] {
  return SIGN_KO.map((nm, i) => {
    const df = (i - moonSign + 12) % 12
    const rel: SRel = df === 0 ? 'same' : df === 4 || df === 8 ? 'trine' : df === 2 || df === 10 ? 'sextile' : df === 3 || df === 9 ? 'square' : df === 6 ? 'opp' : 'none'
    const jit = ((seed + i * 17) % 7) - 3
    return { key: i, name: nm, date: SIGN_DATE[i], rel, relLabel: SREL_LABEL[rel], score: soft(Math.max(40, Math.min(94, Math.round(62 + SREL_RAW[rel] * 10 + jit)))), text: pick(SREL_TXT[rel], seed, i), mine: i === mySign }
  })
}

/* ───────── 오늘 나에게 온 기운 이야기 (일간 × 오늘 일진, 자연 비유) ───────── */
import { STEM_INFO, BRANCH_ELEMENT } from '../../engine/constants'
const EN: Record<Element, string> = { tree: '나무', fire: '불', earth: '흙', metal: '쇠', water: '물' }
const SN: Record<string, string> = { 甲: '갑목', 乙: '을목', 丙: '병화', 丁: '정화', 戊: '무토', 己: '기토', 庚: '경금', 辛: '신금', 壬: '임수', 癸: '계수' }
export const STEM_KEY: Record<string, string> = { 甲: 'gap', 乙: 'eul', 丙: 'byeong', 丁: 'jeong', 戊: 'mu', 己: 'gi', 庚: 'gyeong', 辛: 'sin', 壬: 'im', 癸: 'gye' }
// 오늘(T) 기운이 내(M) 기운을 만났을 때. PAIR[T][M]
const PAIR: Record<Element, Record<Element, string>> = {
  tree: {
    tree: '나무 곁에 또 나무가 서요. 같은 편이 생기지만 햇빛과 자리를 두고 살짝 다투기도 해요.',
    fire: '나무가 불을 지펴 줘요. 도와주는 손길과 배움이 들어와 기운이 붙어요.',
    earth: '나무가 흙 속에 뿌리를 뻗어요. 산이 나무를 품어야 하니 책임과 할 일이 늘지만, 잘 품으면 숲이 돼요.',
    metal: '쇠가 나무를 다듬어요. 내 손으로 다루고 얻는 날이라 일과 돈 쪽으로 움직임이 생겨요.',
    water: '물이 나무를 키워요. 내가 쏟은 만큼 결과가 자라지만 기운이 많이 빠지는 날이에요.',
  },
  fire: {
    tree: '나무가 타올라 불이 돼요. 내 안의 재능이 밖으로 드러나지만 에너지도 빨리 닳아요.',
    fire: '불 옆에 또 불이 붙어요. 활기는 커지지만 열이 과해지지 않게 조절해야 해요.',
    earth: '불이 흙을 데워 줘요. 차가웠던 마음이 풀리고 도움과 배움이 따뜻하게 들어와요.',
    metal: '불이 쇠를 달궈요. 압박이 느껴지지만 잘 견디면 더 단단한 칼이 돼요.',
    water: '물이 불을 다스려요. 내가 주도권을 쥐고 움직일 수 있어 재물과 기회를 잡기 좋아요.',
  },
  earth: {
    tree: '나무가 흙에 뿌리를 내려요. 내가 가꾸고 얻는 일에 힘이 실리고 재물 기회가 보여요.',
    fire: '불이 타고 남은 재가 흙이 돼요. 내가 쏟은 열정이 결과로 남지만 힘이 빠지기 쉬워요.',
    earth: '산 옆에 또 산이 있어요. 든든한 동료가 생기지만 서로 양보 없이 버틸 수 있어요.',
    metal: '흙 속에서 쇠가 자라요. 든든한 뒷받침이 생겨 마음이 안정돼요.',
    water: '흙이 물길을 막아요. 규칙과 책임이 나를 죄는 느낌이 들지만, 둑을 쌓듯 질서를 잡으면 좋아요.',
  },
  metal: {
    tree: '쇠가 나무를 다듬어요. 따끔하지만 정돈되고 반듯해지는 날이에요.',
    fire: '불이 쇠를 녹여 모양을 만들어요. 내가 주도해서 결과를 만드는 날이에요.',
    earth: '흙에서 쇠가 나와요. 내가 가진 걸 꺼내 보여 주는 날이에요. 쓰고 나면 힘이 빠져요.',
    metal: '쇠 옆에 또 쇠가 있어요. 칼날이 부딪히듯 경쟁과 협력이 같이 와요.',
    water: '쇠에서 물이 맺혀요. 차분한 지혜와 도움이 들어와요.',
  },
  water: {
    tree: '물이 나무를 키워요. 배움과 도움이 들어와 쑥쑥 자라는 날이에요.',
    fire: '물이 불을 눌러요. 열정이 식을 수 있으니 휴식과 페이스 조절이 필요해요.',
    earth: '산이 물길을 다스려요. 내가 주도해서 흐름을 잡고 재물과 기회를 모으기 좋아요.',
    metal: '쇠가 물을 맺어요. 내 재능이 밖으로 흘러나오지만 에너지는 쓰이는 날이에요.',
    water: '물 옆에 또 물이 흘러요. 생각과 감정이 불어나니 한 가지에 집중해 보세요.',
  },
}
export interface Story { meKey: string; meName: string; meImage: string; skyKey: string; skyName: string; skyImage: string; earthName: string; sky: string; earth: string; extra: string | null }
export function storyOf(t: TodayData): Story {
  const me = t.who.dayStem; const sky = t.dayGanzi[0]; const br = t.dayGanzi[1]
  const M = STEM_INFO[me].element as Element; const Ts = STEM_INFO[sky].element as Element; const Tb = BRANCH_ELEMENT[br] as Element
  const lack = (e: Element) => t.who.missing.includes(e) ? '없던' : t.who.lack.includes(e) ? '모자랐던' : ''
  const key = (e: Element) => (e === t.who.yongEl ? '내게 꼭 필요한(용신)' : lack(e))
  let extra: string | null = null
  for (const e of [Ts, Tb]) {
    const k = key(e)
    if (k === '내게 꼭 필요한(용신)') { extra = `오늘은 ${k} ${EN[e]} 기운이 들어오는 날이에요. 이럴 때 점수가 크게 올라가요.`; break }
    if (k) { extra = `내 사주에 ${k} ${EN[e]} 기운이 들어오는 날이에요. 빈자리가 채워지는 느낌이 들 수 있어요.`; break }
  }
  return { meKey: STEM_KEY[me], meName: SN[me], meImage: DM[me], skyKey: STEM_KEY[sky], skyName: SN[sky], skyImage: DM[sky], earthName: `${BK[BH.indexOf(br)]}(${EN[Tb]})`, sky: PAIR[Ts][M], earth: PAIR[Tb][M], extra }
}

// ── 올해 운세·궁합용: 같은 자연 비유를 '해'와 '사이'로 바꿔 쓴다 ──
const reword = (s: string, unit: '해' | '사이') => s.replace(/날이라/g, unit === '해' ? '해라' : '사이라').replace(/날이에요/g, unit === '해' ? '해예요' : '사이예요')
export interface Side { key: string; name: string; image: string; hanja: string }
const sideOf = (stem: string): Side => ({ key: STEM_KEY[stem], name: SN[stem], image: DM[stem], hanja: stem })
export interface YearStory { me: Side; sky: Side; earthName: string; skyLine: string; earthLine: string; extra: string | null }
/** 올해 기운(세운 간지)이 내 일간을 만났을 때 */
export function yearStory(dayStem: string, yearGanzi: string, yongEl: Element, missing: Element[], lack: Element[]): YearStory {
  const M = STEM_INFO[dayStem].element as Element; const Ts = STEM_INFO[yearGanzi[0]].element as Element; const Tb = BRANCH_ELEMENT[yearGanzi[1]] as Element
  let extra: string | null = null
  for (const e of [Ts, Tb]) {
    if (e === yongEl) { extra = `올해는 내게 꼭 필요한(용신) ${EN[e]} 기운이 들어오는 해예요. 준비해 둔 일을 꺼내기 좋아요.`; break }
    if (missing.includes(e)) { extra = `내 사주에 없던 ${EN[e]} 기운이 들어오는 해예요. 낯설지만 빈자리가 채워지는 경험을 해요.`; break }
    if (lack.includes(e)) { extra = `내 사주에 모자랐던 ${EN[e]} 기운이 들어오는 해예요. 부족했던 부분이 조금 채워져요.`; break }
  }
  return { me: sideOf(dayStem), sky: sideOf(yearGanzi[0]), earthName: `${BK[BH.indexOf(yearGanzi[1])]}(${EN[Tb]})`, skyLine: reword(PAIR[Ts][M], '해'), earthLine: reword(PAIR[Tb][M], '해'), extra }
}
export interface PairStory { a: Side; b: Side; aGets: string; bGets: string }
/** 두 사람의 일간이 만났을 때: aGets = B의 기운이 A에게 주는 것 */
export function pairStory(stemA: string, stemB: string): PairStory {
  const A = STEM_INFO[stemA].element as Element; const B = STEM_INFO[stemB].element as Element
  return { a: sideOf(stemA), b: sideOf(stemB), aGets: reword(PAIR[B][A], '사이'), bGets: reword(PAIR[A][B], '사이') }
}
/** 올해 운세 달별 카드의 '왜' 한 줄: 그 달 하늘 기운이 내 일간을 만나면 */
export function monthWhy(dayStem: string, monthGanzi: string): string {
  const M = STEM_INFO[dayStem].element as Element; const s = monthGanzi[0]; const T = STEM_INFO[s].element as Element
  const line = PAIR[T][M].replace(/날이라/g, '달이라').replace(/날이에요/g, '달이에요')
  return `${ganziKo(monthGanzi)}월 · 하늘 기운 ${SN[s]}(${DM[s]}) — ${line}`
}
// 시간대 풀이 끝에 붙는 한 줄: 그 시간의 하늘 기운이 내 일간과 어떤 사이인지
const SLOT_TAIL: Record<YRel, string[]> = {
  same: ['나와 같은 기운이 드는 시간이라 마음 맞는 사람과 함께하면 힘이 나요.', '내 기운이 한 겹 더해지는 시간이에요. 자신 있게 밀고 가되 고집은 조금만 내려놓으세요.'],
  help: ['나를 길러 주는 기운이 드는 시간이라 배우고 묻고 쉬기에 좋아요.', '도움이 들어오는 시간이에요. 혼자 끙끙대던 일은 이때 물어보세요.'],
  out: ['내 기운이 밖으로 나가는 시간이라 말하고 보여 주는 일에 좋아요. 대신 체력은 아껴 쓰세요.', '표현이 잘 되는 시간이에요. 하고 싶던 말이나 제안을 이때 꺼내 보세요.'],
  press: ['나를 다듬는 기운이 드는 시간이라 약속과 규칙을 먼저 챙기면 탈이 없어요.', '책임질 일이 몰리기 쉬운 시간이에요. 급한 것 하나만 골라 먼저 끝내세요.'],
  gain: ['내가 쥘 수 있는 기운이 드는 시간이라 돈·거래·정리 같은 실속 있는 일에 좋아요.', '손에 잡히는 결과를 내기 좋은 시간이에요. 미뤄 둔 계산이나 정산을 해 보세요.'],
}
// 점수가 낮은 시간대에는 같은 기운을 조심하는 쪽으로 읽는다(본문과 말이 어긋나지 않게)
const SLOT_TAIL_LO: Record<YRel, string> = {
  same: '나와 같은 기운이 드는 시간이라 고집이 세지기 쉬워요. 한 발 물러서면 편해요.',
  help: '나를 길러 주는 기운이 드는 시간이니 무리하지 말고 쉬면서 채우세요.',
  out: '내 기운이 밖으로 빠지는 시간이라 금방 지쳐요. 말수와 일정을 줄이세요.',
  press: '나를 누르는 기운이 드는 시간이라 부담이 커져요. 꼭 해야 할 것만 하세요.',
  gain: '욕심이 나기 쉬운 시간이에요. 큰 결정과 지출은 미루세요.',
}
export function slotTail(dayStem: string, hourStem: string, seed: number, salt: number, low = false): string {
  const M = EL_IDX(SH.indexOf(dayStem)), T = EL_IDX(SH.indexOf(hourStem))
  const rel: YRel = T === M ? 'same' : (T + 1) % 5 === M ? 'help' : (M + 1) % 5 === T ? 'out' : (T + 2) % 5 === M ? 'press' : 'gain'
  return `이 시간의 하늘 기운은 ${SN[hourStem]}${'甲乙庚辛'.includes(hourStem) ? '이에요' : '예요'}. ${low ? SLOT_TAIL_LO[rel] : pick(SLOT_TAIL[rel], seed, salt)}`
}

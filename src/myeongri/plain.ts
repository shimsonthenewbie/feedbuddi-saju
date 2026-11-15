// 내 사주 쉬운 풀이: 어려운 말 없이, 근거(왜 그렇게 봤는지)와 함께.
import type { SajuResult } from '../engine/types'
import { analyze, type Analysis } from './index'
import { yearLuck } from './timing'

type El = 'tree' | 'fire' | 'earth' | 'metal' | 'water'
const EL: Record<string, string> = { tree: '나무(목)', fire: '불(화)', earth: '흙(토)', metal: '쇠(금)', water: '물(수)' }
const ELS: Record<string, string> = { tree: '나무', fire: '불', earth: '흙', metal: '쇠', water: '물' }
const DM: Record<string, string> = {
  甲: '곧게 뻗는 큰 나무', 乙: '유연하게 휘며 자라는 풀과 덩굴', 丙: '모두를 비추는 태양', 丁: '어둠을 밝히는 촛불',
  戊: '든든한 큰 산', 己: '곡식을 길러 내는 논밭', 庚: '단단한 바위와 쇠', 辛: '잘 다듬어진 보석',
  壬: '크게 흐르는 바다와 강', 癸: '조용히 스며드는 비와 이슬',
}
const HELP: Record<string, string> = {
  tree: '새로 시작하고 키우는 일, 배우는 일', fire: '사람 앞에 나서고 알리는 일', earth: '꾸준히 쌓고 안정시키는 일',
  metal: '결정하고 정리하고, 가진 것을 결과물로 꺼내 놓는 일', water: '생각하고 모으고, 사람과 정보 사이를 오가는 일',
}
const STR: Record<string, string> = {
  극신강: '내 기운이 아주 세요. 자기 고집과 추진력이 강한 대신, 힘이 안에 가득 차서 밖으로 풀어 줘야 하는 사주예요.',
  신강: '내 기운이 센 편이에요. 주관이 뚜렷하고 버티는 힘이 좋아요. 쓸 곳을 잘 찾아 주면 크게 쓰여요.',
  중화: '내 기운이 한쪽으로 치우치지 않고 고른 편이에요. 상황에 따라 유연하게 움직일 수 있어요.',
  신약: '내 기운이 조금 여린 편이에요. 혼자 밀어붙이기보다 도움을 받고 힘을 모을 때 잘 풀려요.',
  극신약: '내 기운이 아주 여린 편이에요. 든든한 사람, 환경, 배움이 곁에 있을 때 힘이 나요.',
}
const GK: Record<string, string> = {
  비견격: '나와 같은 힘이 중심이라, 스스로 판을 짜야 직성이 풀리는 독립적인 타입이에요.',
  건록격: '내 힘이 단단히 서 있는 타입이라, 자기 길을 스스로 열어 가는 힘이 있어요.',
  월겁격: '경쟁심과 승부욕이 강하고 사람과 어울려 힘을 키우는 타입이에요.',
  양인격: '기세가 강하고 결단이 빠른 타입이에요. 힘을 쓸 곳이 분명할 때 빛나요.',
  식신격: '여유롭게 만들어 내고 표현하는 타입이에요. 재주와 먹고사는 감각이 좋아요.',
  상관격: '말과 재능이 날카롭고 틀을 깨는 타입이에요. 표현할 무대가 있을 때 빛나요.',
  편재격: '돈과 사람의 흐름을 읽는 타입이에요. 활동 범위가 넓고 사업 감각이 있어요.',
  정재격: '성실하게 모으고 지키는 타입이에요. 안정적으로 쌓아 가는 힘이 있어요.',
  편관격: '압박 속에서 일을 해내는 타입이에요. 책임이 클수록 강해져요.',
  정관격: '규칙과 신뢰를 중요하게 여기는 타입이에요. 조직 안에서 인정받기 좋아요.',
  편인격: '독특한 생각과 공부로 길을 찾는 타입이에요. 남과 다른 눈이 강점이에요.',
  정인격: '배우고 보살핌을 받으며 자라는 타입이에요. 공부와 자격에 인연이 있어요.',
}
const gk = (n: string) => GK[n] ?? GK[n.replace(/\(.*\)/, '')] ?? ''

export interface PlainCard { title: string; rows: [string, string][]; note: string }

export function plainRead(r: SajuResult, a: Analysis = analyze(r)): PlainCard {
  const dm = a.dayStem
  const y = a.yongsin
  const rows: [string, string][] = []
  rows.push(['나는 어떤 사람', `나를 뜻하는 글자는 ${dm}이고, ${DM[dm] ?? ''} 같은 기운이에요.`])
  const st = a.strength
  const why = [st.deukryeong && '태어난 달', st.deukji && '앉은 자리', st.deukse && '주변 기운'].filter(Boolean).join('·') + (st.deukryeong || st.deukji || st.deukse ? '이 모두 나를 받쳐 줘요' : '의 도움이 적어요')
  rows.push(['내 기운의 세기', `${a.strength.label}. ${STR[a.strength.label] ?? ''} (근거: ${why})`])
  const g = gk(a.gyeokguk.name)
  if (g) rows.push(['타고난 틀', `${a.gyeokguk.name} — ${g}`])
  rows.push(['내게 필요한 기운', `${EL[y.primary]}이에요. ${HELP[y.primary] ?? ''}에서 힘이 풀려요. 보조로는 ${EL[y.heesin]}이 도와줘요.`])
  rows.push(['조심할 기운', `${EL[y.gisin]} 기운이 너무 많아지면 답답해지기 쉬워요.`])
  const now = r.daewoon.filter((d) => new Date(d.startDate).getTime() <= Date.now()).pop()
  if (now) {
    const E: Record<string, string> = { 甲: 'tree', 乙: 'tree', 丙: 'fire', 丁: 'fire', 戊: 'earth', 己: 'earth', 庚: 'metal', 辛: 'metal', 壬: 'water', 癸: 'water', 子: 'water', 亥: 'water', 寅: 'tree', 卯: 'tree', 巳: 'fire', 午: 'fire', 辰: 'earth', 戌: 'earth', 丑: 'earth', 未: 'earth', 申: 'metal', 酉: 'metal' }
    const has = E[now.ganzi[0]] === y.primary || E[now.ganzi[1]] === y.primary
    rows.push(['지금 10년 흐름', `${now.age}세부터 ${now.ganzi} 흐름이에요. ${has ? `필요한 ${ELS[y.primary]} 기운이 들어 있어서, 가진 것을 밖으로 꺼내 쓰기 좋은 때예요.` : `필요한 ${ELS[y.primary]} 기운은 이 흐름에 직접 들어 있지 않아요. 해마다·달마다 들어오는 때를 노려 보세요.`}`])
  }
  void yearLuck
  return { title: '내 사주 쉬운 풀이', rows, note: '사주는 참고용이에요. 고전(자평진전·적천수·궁통보감)의 기준으로 계산했어요.' }
}
export { ELS }

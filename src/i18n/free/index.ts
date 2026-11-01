import type { Analysis } from '../../myeongri'
import { consultPool } from '../consult'

type L = 'ko' | 'en'
interface FreeText {
  stem: Record<string, [string, string]> // 일간 → [이름, 기질]
  excess: string; missing: string; even: string
  el: Record<string, string>
  group: Record<string, string>
  rel: Record<string, string>
  year: Record<string, string>
  t: Record<string, string>
}
const ko: FreeText = {
  stem: {
    甲: ['큰 나무(갑목)', '곧게 뻗는 큰 나무 같은 사람이에요. 시작하는 힘과 자존심이 좋고, 한 번 정하면 밀고 나가요.'],
    乙: ['풀과 덩굴(을목)', '유연한 풀과 덩굴 같은 사람이에요. 적응력과 섬세함이 좋고, 부드럽게 길을 찾아가요.'],
    丙: ['태양(병화)', '태양처럼 밝고 열정적인 사람이에요. 사람을 끌어당기는 힘이 있고 시원하게 표현해요.'],
    丁: ['촛불(정화)', '촛불처럼 따뜻하고 섬세한 사람이에요. 한 가지에 깊이 집중하고 마음 씀씀이가 좋아요.'],
    戊: ['큰 산(무토)', '큰 산처럼 믿음직하고 묵직한 사람이에요. 쉽게 흔들리지 않고 주변을 품어 줘요.'],
    己: ['논밭의 흙(기토)', '논밭의 흙처럼 포용력 있고 실속 있는 사람이에요. 뒤에서 차분히 키우고 가꾸는 힘이 있어요.'],
    庚: ['바위와 쇠(경금)', '바위와 쇠처럼 결단력 있고 의리 있는 사람이에요. 맺고 끊음이 분명해요.'],
    辛: ['보석(신금)', '보석처럼 예리하고 깔끔한 사람이에요. 감각이 섬세하고 완성도를 중요하게 생각해요.'],
    壬: ['큰 강과 바다(임수)', '큰 강처럼 자유롭고 지혜로운 사람이에요. 스케일이 크고 흐름을 읽는 눈이 있어요.'],
    癸: ['비와 이슬(계수)', '비와 이슬처럼 감수성이 풍부하고 직감이 좋은 사람이에요. 조용히 스며들어 마음을 움직여요.'],
  },
  excess: '{el} 기운이 많아요. 그 힘이 강점이지만 한쪽으로 쏠리지 않게 조절하면 좋아요.',
  missing: '{el} 기운이 사주에 없어요. 부족하다기보다 그 영역을 의식적으로 채우면 균형이 좋아져요.',
  even: '오행이 비교적 고르게 있어요. 상황에 맞게 여러 면을 쓸 수 있는 구성이에요.',
  el: { tree: '목(木)', fire: '화(火)', earth: '토(土)', metal: '금(金)', water: '수(水)' },
  group: {
    비겁: '주관이 뚜렷하고 독립적이에요. 내 방식으로 해낼 때 힘이 나요.',
    식상: '표현력과 재능이 좋아요. 말, 글, 만들기처럼 꺼내 놓을 때 빛나요.',
    재성: '현실감과 실행력이 좋아요. 돈과 결과에 민감하고 챙기는 힘이 있어요.',
    관성: '책임감과 규칙에 대한 감각이 좋아요. 조직 안에서 역할을 맡을 때 안정돼요.',
    인성: '배움과 생각의 힘이 좋아요. 보호받고 이해받을 때 가장 크게 힘을 내요.',
  },
  rel: {
    비겁: '가까운 사이에서도 대등한 파트너를 좋아해요. 서로의 영역을 존중할 때 편안해요.',
    식상: '대화와 즐거움이 통하는 관계를 좋아해요. 표현이 잘 오갈 때 마음이 열려요.',
    재성: '현실적이고 적극적으로 관계를 이끄는 편이에요. 챙겨 주는 만큼 확실히 표현해요.',
    관성: '안정과 책임이 있는 관계를 중요하게 여겨요. 믿을 수 있는 사람에게 마음을 줘요.',
    인성: '정서적 안정과 돌봄이 있는 관계를 원해요. 이해받는다고 느낄 때 깊어져요.',
  },
  year: {
    '좋은 흐름': '올해는 이 사주 기준으로 흐름이 좋은 편이에요. 미뤄 둔 일을 움직여 보세요.',
    '무난·약간 좋음': '올해는 무난하고 약간 좋은 흐름이에요. 꾸준히 쌓으면 결과가 보여요.',
    '평탄·혼재': '올해는 평탄하지만 좋고 부담스러운 달이 섞여 있어요. 시기를 가려 움직이면 유리해요.',
    '다소 부담': '올해는 다소 부담이 있는 해라 무리하지 않는 게 좋아요. 달마다 좋은 때를 찾아 쓰면 돼요.',
    '부담 큼': '올해는 변동이 큰 해예요. 큰 결정은 신중히, 좋은 달에 맞춰 움직이세요.',
  },
  t: { stem: '나의 일주', el: '오행 균형', power: '힘의 균형', group: '타고난 강점', rel: '가까운 관계에서의 나', year: '올해 한 줄', next: '더 알아보기', askCta: '고민 상담하기', todayCta: '오늘의 운세 보기', free: '무료 맛보기예요. 자세한 풀이는 상담과 리포트에서 볼 수 있어요.' },
}
const en: FreeText = {
  stem: {
    甲: ['Big tree (Jia Wood)', 'You are like a tall, straight tree. You start things with strength and pride, and push on once decided.'],
    乙: ['Grass and vines (Yi Wood)', 'You are like flexible grass and vines. You adapt well, are delicate, and find your way gently.'],
    丙: ['The sun (Bing Fire)', 'You are bright and passionate like the sun. You draw people in and express yourself openly.'],
    丁: ['Candlelight (Ding Fire)', 'You are warm and delicate like candlelight. You focus deeply and care for others.'],
    戊: ['Great mountain (Wu Earth)', 'You are dependable and steady like a mountain. You are not easily shaken and you shelter others.'],
    己: ['Farmland (Ji Earth)', 'You are accepting and practical like farmland. You grow and tend things quietly behind the scenes.'],
    庚: ['Rock and iron (Geng Metal)', 'You are decisive and loyal like rock and iron. You are clear about what to keep and cut.'],
    辛: ['Jewel (Xin Metal)', 'You are sharp and neat like a jewel. You have fine senses and care about finish.'],
    壬: ['Great river (Ren Water)', 'You are free and wise like a great river. You think big and read the flow of things.'],
    癸: ['Rain and dew (Gui Water)', 'You are sensitive and intuitive like rain and dew. You move people quietly.'],
  },
  excess: 'You have a lot of {el}. That strength is an asset; just keep it from tipping to one side.',
  missing: 'Your chart has no {el}. It is not a flaw; consciously filling that area improves your balance.',
  even: 'Your elements are fairly even, so you can draw on different sides as the situation needs.',
  el: { tree: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
  group: {
    비겁: 'You are independent and clear-minded. You gain strength doing things your way.',
    식상: 'You have talent and expression. You shine when you speak, write or make things.',
    재성: 'You are practical and action-oriented. You are alert to money and results.',
    관성: 'You have a sense of duty and rules. You feel steady when holding a role in a group.',
    인성: 'You are strong at learning and thinking. You give most when you feel protected and understood.',
  },
  rel: {
    비겁: 'You like an equal partner, even when close. You are at ease when each side has its own space.',
    식상: 'You like talk and fun in a relationship. Your heart opens when expression flows both ways.',
    재성: 'You are practical and take the lead in relationships. You express as much as you care.',
    관성: 'You value stability and responsibility. You give your heart to someone dependable.',
    인성: 'You want emotional safety and care. A relationship deepens when you feel understood.',
  },
  year: {
    '좋은 흐름': 'This year the flow is good for your chart. Get that postponed thing moving.',
    '무난·약간 좋음': 'This year is steady and slightly good. Building steadily shows results.',
    '평탄·혼재': 'This year is even, with good and heavy months mixed. Choosing your timing pays off.',
    '다소 부담': 'This year carries some weight, so avoid overreaching. Find the good months and use them.',
    '부담 큼': 'This year brings big changes. Decide big things carefully and move in good months.',
  },
  t: { stem: 'Your day pillar', el: 'Element balance', power: 'Balance of strength', group: 'Natural strengths', rel: 'You in close relationships', year: 'This year in a line', next: 'Go further', askCta: 'Ask about a worry', todayCta: "See today's fortune", free: 'This is a free taste. Fuller readings are in Ask and the reports.' },
}
const P: Record<L, FreeText> = { ko, en }
export const freePool = (lang: string) => P[(lang === 'ko' ? 'ko' : 'en') as L]

export interface FreeCard { title: string; head?: string; body: string[] }
export function freeCards(a: Analysis, lang: string, dayBranchGroup: string, yearTone: string): FreeCard[] {
  const t = freePool(lang)
  const c = consultPool(lang)
  const [name, trait] = t.stem[a.dayStem]
  const els = Object.entries(a.elements) as [string, number][]
  const elBody: string[] = []
  const ex = a.elementStatus.excess
  const ms = a.elementStatus.missing
  if (ex.length) elBody.push(t.excess.replace('{el}', ex.map((e) => t.el[e]).join('·')))
  if (ms.length) elBody.push(t.missing.replace('{el}', ms.map((e) => t.el[e]).join('·')))
  if (!ex.length && !ms.length) elBody.push(t.even)
  void els
  const st = a.strength.label
  const power = st === '신강' || st === '극신강' ? c.you.strong : st === '신약' || st === '극신약' ? c.you.weak : c.you.mid
  const topGroup = (Object.entries(a.groups) as [string, number][]).sort((p, q) => q[1] - p[1])[0][0]
  return [
    { title: t.t.stem, head: name, body: [trait] },
    { title: t.t.el, body: elBody },
    { title: t.t.power, body: [power, c.you.yongsin.replace(/\{el\}/g, c.you.el[a.yongsin.primary])] },
    { title: t.t.group, body: [t.group[topGroup]] },
    { title: t.t.rel, body: [t.rel[dayBranchGroup] ?? t.rel['비겁']] },
    { title: t.t.year, body: [t.year[yearTone] ?? t.year['평탄·혼재']] },
  ]
}

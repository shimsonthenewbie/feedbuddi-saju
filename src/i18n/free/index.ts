import type { Analysis } from '../../myeongri'
import type { SajuResult } from '@orrery/core/types'
import { getBranchRelation, getStemRelation } from '@orrery/core/pillars'
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
  stages: Record<string, [string, string]>
  palace: Record<string, string>
  flowIntro: string
  pairIntro: string
  pairNone: string
  rel2: Record<string, string>
  starName: Record<string, [string, string]>
  starNone: string
  starNote: string
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
  el: { tree: '나무(목)', fire: '불(화)', earth: '흙(토)', metal: '쇠(금)', water: '물(수)' },
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
  t: { stem: '타고난 성격 (일주)', el: '다섯 기운의 균형 (오행)', power: '내 기운의 세기', group: '타고난 강점', rel: '가까운 사람 앞에서의 나', year: '올해 한 줄', flow: '인생 에너지 흐름 (12운성)', pair: '내 사주 속 끌림과 부딪힘 (합·충)', stars: '나를 돕거나 특별하게 만드는 별 (신살)', next: '더 알아보기', askCta: '고민 상담하기', todayCta: '오늘의 운세 보기', free: '무료 맛보기예요. 자세한 풀이는 상담과 리포트에서 볼 수 있어요.' },
  stages: {
    長生: ['장생', '새로 자라나는 기운이에요. 시작과 성장의 힘이 있어요.'], 沐浴: ['목욕', '감수성이 풍부하고 변화가 많은 기운이에요.'], 冠帶: ['관대', '자신감이 붙고 세상에 나설 준비가 된 기운이에요.'],
    建祿: ['건록', '스스로 일어서는 실력과 자립의 기운이에요.'], 帝旺: ['제왕', '에너지가 가장 강한 정점의 기운이에요.'], 衰: ['쇠', '힘을 빼고 차분히 다지는 기운이에요.'],
    病: ['병', '섬세하고 예민해서 마음 씀씀이가 깊은 기운이에요.'], 死: ['사', '겉으로 드러내기보다 안으로 집중하는 기운이에요.'], 墓: ['묘', '속에 간직하고 모아 두는 저장의 기운이에요.'],
    絶: ['절', '끊고 새로 시작하는 전환의 기운이에요.'], 胎: ['태', '아직 싹트기 전, 가능성이 큰 기운이에요.'], 養: ['양', '보호받으며 천천히 자라나는 기운이에요.'],
  },
  palace: { 3: '어린 시절·집안 환경', 2: '일·사회생활', 1: '나·가까운 사람', 0: '미래 계획·말년' },
  flowIntro: '삶의 시기마다 내 기운이 어떤 상태인지 보여 줘요.',
  pairIntro: '사주 안의 글자끼리 서로 끌리면 \'합\', 부딪히면 \'충\'이라고 해요.',
  pairNone: '사주 안에 눈에 띄는 부딪힘이 없어요. 차분하게 이어지는 구성이에요.',
  rel2: {
    합: '서로 끌려서 잘 맞물려요(합). 한쪽이 다른 쪽을 도와주는 기운이에요.',
    충: '서로 부딪혀요(충). 변화와 긴장이 생기기 쉽지만, 움직이게 만드는 힘이기도 해요.',
    형: '서로 마찰이 있어요(형). 마음이 불편해지기 쉬워서 말과 태도를 다듬으면 좋아요.',
    해: '서로 엇갈려요(해). 사소한 서운함이 쌓이지 않게 풀어 주세요.',
    파: '살짝 어긋나요(파). 계획이 조금 틀어질 수 있어 한 번 더 확인하면 좋아요.',
  },
  starName: {
    cheonul: ['도와주는 사람이 따르는 별 (천을귀인)', '어려울 때 도와주는 사람이 나타나기 쉬운 별이에요.'],
    cheonduk: ['보호해 주는 별 (천덕귀인)', '어려운 일도 누그러뜨려 주는 보호의 별이에요.'],
    wolduk: ['보호해 주는 별 (월덕귀인)', '어려운 일도 누그러뜨려 주는 보호의 별이에요.'],
    munchang: ['글과 공부의 별 (문창귀인)', '공부, 글, 표현에 재능이 있는 별이에요.'],
    geumyeo: ['품위의 별 (금여록)', '품위 있고 안정된 인연을 부르는 별이에요.'],
    dohwa: ['매력의 별 (도화살)', '사람을 끄는 매력과 인기의 별이에요.'],
    hongyeom: ['끌림의 별 (홍염살)', '이성에게 끌리는 분위기를 주는 별이에요.'],
    yangin: ['승부욕의 별 (양인살)', '추진력과 승부욕이 강한 별이에요. 날카로워지지 않게 조절하면 큰 힘이 돼요.'],
    baekho: ['결단의 별 (백호살)', '결단력과 강한 에너지의 별이에요. 급한 마음만 다스리면 좋아요.'],
    goegang: ['카리스마의 별 (괴강살)', '카리스마와 고집이 강한 별이에요. 자기 기준이 분명해요.'],
  },
  starNone: '눈에 띄는 별은 없어요. 별보다 사주의 바탕이 더 중요하니 걱정하지 않으셔도 돼요.',
  starNote: '별(신살)은 보조로만 참고하세요. 하나만으로 판단하지 않아요.',
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
  t: { stem: 'Your core nature (day pillar)', el: 'Balance of the five energies', power: 'How strong your energy is', group: 'Natural strengths', rel: 'You with someone close', year: 'This year in a line', flow: 'Life energy flow (12 stages)', pair: 'Pull and friction inside your chart', stars: 'Stars that help or mark you (Sinsal)', next: 'Go further', askCta: 'Ask about a worry', todayCta: "See today's fortune", free: 'This is a free taste. Fuller readings are in Ask and the reports.' },
  stages: {
    長生: ['Birth', 'Energy that is just growing. It has the power of beginnings.'], 沐浴: ['Bathing', 'Sensitive, changeable energy.'], 冠帶: ['Coming of age', 'Confidence is rising and you are ready to step out.'],
    建祿: ['Standing tall', 'The energy of self-reliance and real ability.'], 帝旺: ['Peak', 'Energy at its strongest.'], 衰: ['Easing', 'Energy that relaxes and consolidates calmly.'],
    病: ['Delicate', 'Fine and sensitive, with deep care for others.'], 死: ['Stillness', 'Energy that focuses inward instead of showing outward.'], 墓: ['Storing', 'Energy that keeps and gathers inside.'],
    絶: ['Reset', 'Energy of cutting off and starting anew.'], 胎: ['Seed', 'Full of potential before sprouting.'], 養: ['Nurturing', 'Energy that grows slowly under protection.'],
  },
  palace: { 3: 'Childhood & home', 2: 'Work & social life', 1: 'You & people close to you', 0: 'Future plans & later life' },
  flowIntro: 'This shows what state your energy is in at each stage of life.',
  pairIntro: 'When characters in your chart attract each other it is called a combination, and when they collide, a clash.',
  pairNone: 'No notable friction inside your chart. It is a calm, continuous structure.',
  rel2: {
    합: 'They pull together and fit well (combination). One side supports the other.',
    충: 'They collide (clash). Change and tension come easily, but it is also a force that moves you.',
    형: 'There is friction (punishment). Polishing your words and attitude helps.',
    해: 'They cross each other (harm). Clear small hurts before they pile up.',
    파: 'A slight mismatch (break). Plans may bend a little, so double-check.',
  },
  starName: {
    cheonul: ['Helper star (Tian Yi)', 'People who help you tend to appear when things get hard.'],
    cheonduk: ['Protection star (Heavenly Virtue)', 'A protective star that softens difficulties.'],
    wolduk: ['Protection star (Monthly Virtue)', 'A protective star that softens difficulties.'],
    munchang: ['Study and writing star', 'A star of talent for study, writing and expression.'],
    geumyeo: ['Grace star', 'Brings graceful, stable relationships.'],
    dohwa: ['Charm star (Peach Blossom)', 'A star of charm and popularity.'],
    hongyeom: ['Attraction star', 'Gives an air that attracts others.'],
    yangin: ['Drive star (Goat Blade)', 'Strong drive and competitiveness. Tempered, it becomes real power.'],
    baekho: ['Decision star (White Tiger)', 'Decisiveness and strong energy. Just calm the rush.'],
    goegang: ['Charisma star (Kuigang)', 'Strong charisma and stubbornness. You have clear standards.'],
  },
  starNone: 'No notable stars here. The base of your chart matters more, so do not worry.',
  starNote: 'Treat stars only as a side reference. They are never judged alone.',
}
const P: Record<L, FreeText> = { ko, en }
export const freePool = (lang: string) => P[(lang === 'ko' ? 'ko' : 'en') as L]

export interface FreeCard { title: string; head?: string; body: string[] }
const MAIN_KINDS = ['沖', '合', '刑', '害', '破'] as const
const KIND_KEY: Record<string, string> = { 沖: '충', 合: '합', 刑: '형', 害: '해', 破: '파' }
function uniq(a: { type: string }[], b: { type: string }[]) { return Array.from(new Set([...a, ...b].map((x) => x.type))) }
export function natalPairs(r: SajuResult): { a: number; b: number; kind: string }[] {
  const out: { a: number; b: number; kind: string }[] = []
  const idx = [3, 2, 1, 0].filter((i) => !(r.input.unknownTime && i === 0))
  for (let x = 0; x < idx.length; x++) for (let y = x + 1; y < idx.length; y++) {
    const A = r.pillars[idx[x]].pillar, B = r.pillars[idx[y]].pillar
    const kinds = new Set<string>()
    for (const t of uniq(getBranchRelation(A.branch, B.branch), getBranchRelation(B.branch, A.branch))) if ((MAIN_KINDS as readonly string[]).includes(t)) kinds.add(t)
    for (const t of uniq(getStemRelation(A.stem, B.stem), getStemRelation(B.stem, A.stem))) if (t === '合' || t === '沖') kinds.add(t)
    // 충이 있으면 해·파는 생략(같은 부딪힘 중복 방지)
    if (kinds.has('沖')) { kinds.delete('害'); kinds.delete('破') }
    for (const k of kinds) out.push({ a: idx[x], b: idx[y], kind: KIND_KEY[k] })
  }
  const order: Record<string, number> = { 충: 0, 합: 1, 형: 2, 해: 3, 파: 4 }
  return out.sort((p, q) => order[p.kind] - order[q.kind]).slice(0, 5)
}
export function freeCards(r: SajuResult, a: Analysis, lang: string, dayBranchGroup: string, yearTone: string): FreeCard[] {
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
  const pairs = natalPairs(r)
  const ss = r.specialSals
  const keys: [string, boolean][] = [
    ['cheonul', ss.cheonul.length > 0], ['cheonduk', ss.cheonduk.length > 0], ['wolduk', ss.wolduk.length > 0], ['munchang', ss.munchang.length > 0], ['geumyeo', ss.geumyeo.length > 0],
    ['dohwa', ss.dohwa.length > 0], ['hongyeom', ss.hongyeom], ['yangin', ss.yangin.length > 0], ['baekho', ss.baekho], ['goegang', ss.goegang],
  ]
  const starLines = keys.filter(([, on]) => on).map(([k]) => `${t.starName[k][0]} — ${t.starName[k][1]}`)
  const topGroup = (Object.entries(a.groups) as [string, number][]).sort((p, q) => q[1] - p[1])[0][0]
  return [
    { title: t.t.stem, head: name, body: [trait] },
    { title: t.t.el, body: elBody },
    { title: t.t.power, body: [power, c.you.yongsin.replace(/\{el\}/g, c.you.el[a.yongsin.primary])] },
    { title: t.t.group, body: [t.group[topGroup]] },
    { title: t.t.rel, body: [t.rel[dayBranchGroup] ?? t.rel['비겁']] },
    { title: t.t.flow, body: [t.flowIntro, ...[3, 2, 1, 0].filter((i) => !(r.input.unknownTime && i === 0)).map((i) => {
      const st = t.stages[r.pillars[i].unseong] ?? t.stages[Object.keys(t.stages).find((k) => t.stages[k][0] === r.pillars[i].unseong) ?? '']
      return st ? `${t.palace[i]} — ${st[0]}: ${st[1]}` : ''
    }).filter(Boolean)] },
    { title: t.t.pair, body: [t.pairIntro, ...(pairs.length ? pairs.map((p) => `${t.palace[p.a]} · ${t.palace[p.b]} — ${t.rel2[p.kind]}`) : [t.pairNone])] },
    { title: t.t.stars, body: [...(starLines.length ? starLines : [t.starNone]), t.starNote] },
    { title: t.t.year, body: [t.year[yearTone] ?? t.year['평탄·혼재']] },
  ]
}

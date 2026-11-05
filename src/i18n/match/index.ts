import type { Analysis } from '../../myeongri'
import { matchCalc, type MatchCalc, type RelKind } from '../../myeongri/match'
import type { SajuResult } from '@orrery/core/types'

export interface MatchCard { kind: string; title: string; paras: string[]; list?: string[] }
type L = 'ko' | 'en'
type El = 'tree' | 'fire' | 'earth' | 'metal' | 'water'
interface T {
  ui: { title: string; score: string; ofHundred: string; note: string; charts: string }
  tier: Record<string, [string, string]>
  stem: Record<string, string>
  heart: Record<string, string>
  monthGood: string; monthHard: string; yearGood: string; yearHard: string
  see: (viewer: 'a' | 'b') => string
  seeMap: Record<string, string>
  fillRich: (who: 'a' | 'b', el: string, meaning: string) => string
  fillSome: (who: 'a' | 'b', el: string, meaning: string) => string
  fillNone: string
  strain: (who: 'a' | 'b', el: string) => string
  el: Record<El, [string, string]>
  talk: Record<El, string>
  talkMix: { same: string; diff: string }
  tips: { argue: string; speak: string; thanks: string; comfy: string; give: string; keep: string; rest: string }
  t: Record<string, string>
  sub: Record<string, string>
  axes: { overall: string; flow: string; express: string; conflict: string; together: string }
  chip: { stem: string; heart: string; month: string; year: string; v: Record<string, string> }
  selfTalk: Record<El, string>
  selfStem: { giveA: string; getB: string; ctrl: string; ctrled: string; space: string }
}

const ko: T = {
  ui: { title: '궁합 풀이', score: '어울림', ofHundred: '/ 100', note: '두 사람의 사주를 견줘 본 "경향"이에요. 점수가 낮아도 노력하면 좋은 사이가 될 수 있고, 높아도 방심하면 멀어질 수 있어요.', charts: '두 사람의 사주 표 보기' },
  tier: {
    top: ['서로가 편하게 끌리는 사이예요', '타고난 기운이 서로를 잘 받쳐 주는 편이에요. 같이 있으면 자연스럽고 오래 가기 쉬운 조합이에요.'],
    good: ['잘 맞는 편이에요', '서로 도움이 되는 부분이 많은 사이예요. 작은 어긋남만 조심하면 편안하게 이어 갈 수 있어요.'],
    work: ['맞춰 가면 좋아지는 사이예요', '잘 맞는 점과 다른 점이 함께 있어요. 서로를 알아 갈수록 더 편해지는 쪽이에요.'],
    diff: ['다른 점이 많아 배우는 사이예요', '결이 많이 달라서 처음엔 낯설 수 있어요. 대화를 자주 하면 서로에게 없던 점을 배우는 관계가 돼요.'],
    hard: ['부딪힘이 잦을 수 있는 사이예요', '기운이 자주 엇갈리는 편이에요. 그만큼 서로를 이해하려는 노력과 거리 두기가 도움이 돼요.'],
  },
  stem: {
    combine: '두 분의 중심 기운이 짝처럼 끌려 합쳐지는 관계예요. 처음부터 묘하게 편하고, 서로에게 끌리는 경향이 있어요.',
    same: '비슷한 결을 가진 사이예요. 말이 잘 통하고 이해가 빠르지만, 비슷해서 약점도 똑같이 나올 수 있어요.',
    feedA: '나의 기운이 상대를 북돋아 주는 관계예요. 나는 주는 쪽, 상대는 힘을 얻는 쪽이라 한쪽만 계속 주지 않게 균형을 챙기면 좋아요.',
    feedB: '상대의 기운이 나를 북돋아 주는 관계예요. 곁에 있으면 힘이 나는 사이이니 고마움을 자주 말로 전하면 좋아요.',
    controlA: '나의 기운이 상대를 누르는 쪽이에요. 내가 이끌다가 상대가 눌릴 수 있어서, 말투와 결정 방식을 조금 부드럽게 하면 좋아요.',
    controlB: '상대의 기운이 나를 누르는 쪽이에요. 내가 맞추기만 하게 되지 않도록 하고 싶은 말은 분명히 하는 게 좋아요.',
    clash: '중심 기운이 정면으로 부딪히는 관계예요. 의견이 갈리면 크게 번질 수 있지만, 서로 자극이 되어 성장하는 사이가 될 수도 있어요.',
    plain: '서로 크게 끌리거나 부딪히는 신호는 없는 평범한 관계예요. 함께 보내는 시간으로 가까워지는 쪽이에요.',
  },
  heart: {
    harmony: '가장 가까운 마음의 자리가 서로 맞물려요. 같이 있으면 마음이 놓이고, 오래 가기 쉬운 신호예요.',
    half: '마음의 자리가 반쯤 맞물려요. 무언가를 함께 할 때 힘이 잘 모여요.',
    clash: '가까운 마음의 자리가 부딪혀요. 가까워질수록 사소한 일에 예민해질 수 있어서, 각자 혼자 쉬는 시간이 필요해요.',
    punish: '마음의 자리가 서로 가시처럼 걸려요. 말이 곱게 안 나가는 날이 있을 수 있으니 한 템포 쉬고 말해 보세요.',
    harm: '마음의 자리가 은근히 엇나가요. 큰 싸움보다 서운함이 쌓이기 쉬우니 그때그때 말로 풀어 주세요.',
    break: '작은 어긋남이 있어요. 약속이나 시간 같은 사소한 부분을 서로 챙기면 좋아요.',
    none: '',
  },
  monthGood: '생활 리듬과 일하는 방식이 닮은 편이에요.',
  monthHard: '생활 리듬이나 일하는 방식이 달라서 맞춰 가는 노력이 조금 필요해요.',
  yearGood: '띠의 흐름도 서로 잘 어울려요. 주변 사람이나 집안 분위기에서도 편안함을 느끼기 쉬워요.',
  yearHard: '띠가 서로 엇갈려서 처음엔 낯설 수 있어요. 가족이나 친구 이야기를 나누면 거리가 줄어요.',
  see: (v) => (v === 'a' ? '나에게 상대는' : '상대에게 나는'),
  seeMap: {
    비견: '친구처럼 편한 사람이에요.', 겁재: '라이벌처럼 자극을 주는 사람이에요.', 식신: '함께 있으면 마음이 풀리고 즐거워지는 사람이에요.',
    상관: '솔직하게 말하게 하고 틀을 깨 주는 사람이에요. 가끔 말이 날카롭게 오갈 수 있어요.', 편재: '활동적이고 새로운 일로 이끄는 사람이에요.',
    정재: '차분하고 믿음직하게 곁을 지켜 주는 사람이에요.', 편관: '긴장감을 주고 나를 단단하게 만드는 사람이에요.',
    정관: '예의 바르고 나를 바르게 이끄는 사람이에요.', 편인: '독특한 관점으로 영감을 주는 사람이에요.', 정인: '나를 돌봐 주고 기댈 수 있게 해 주는 사람이에요.',
  },
  fillRich: (w, e, m) => `${w === 'a' ? '나에게' : '상대에게'} 필요한 ${e} 기운(${m})을 ${w === 'a' ? '상대가' : '내가'} 넉넉히 갖고 있어요. 곁에 있으면 힘이 채워지는 느낌이 들 수 있어요.`,
  fillSome: (w, e, m) => `${w === 'a' ? '나에게' : '상대에게'} 필요한 ${e} 기운(${m})을 ${w === 'a' ? '상대가' : '내가'} 조금 갖고 있어요.`,
  fillNone: '서로 채워 주는 기운이 크게 보이지는 않아요. 대신 각자 자기 균형을 스스로 챙겨 보세요.',
  strain: (w, e) => `${w === 'a' ? '나에게' : '상대에게'} 부담이 되는 ${e} 기운이 ${w === 'a' ? '상대' : '나'}에게 아주 강해서, 가끔 지칠 수 있어요.`,
  el: { tree: ['나무', '성장과 시작의 힘'], fire: ['불', '열정과 표현의 힘'], earth: ['흙', '안정과 중심의 힘'], metal: ['쇠', '결단과 정리의 힘'], water: ['물', '지혜와 쉼의 힘'] },
  talk: {
    tree: '솔직하고 곧게 말해요. 돌려 말하기보다 바로 말하고 싶어 해요.',
    fire: '감정이 빠르고 표현이 커요. 기쁨도 화도 바로 드러나서, 먼저 "공감해 주길" 바라는 편이에요.',
    earth: '느긋하고 현실적이에요. 감정보다 "그래서 어떻게 할까"를 먼저 말하는 편이에요.',
    metal: '객관적이고 원칙을 따져요. 감정보다 옳고 그름을 먼저 보는 편이에요.',
    water: '생각이 깊고 말을 아껴요. 마음을 천천히 정리한 뒤에 꺼내는 편이에요.',
  },
  talkMix: {
    same: '말하는 방식이 비슷해서 서로 이해가 빨라요.',
    diff: '말하는 방식이 달라서 어긋나기 쉬워요. 한쪽은 공감을, 다른 쪽은 해결을 말하다 서로 서운해질 수 있어요. 대화를 시작할 때 "지금은 들어줘" 또는 "지금은 방법이 필요해"라고 먼저 말해 보세요.',
  },
  tips: {
    argue: '의견이 갈릴 땐 바로 결론 내지 말고, 하루 두었다가 이야기해 보세요.',
    speak: '서운한 건 쌓아 두지 말고 그날 짧게 말해 주세요.',
    thanks: '받는 쪽은 고마움을, 주는 쪽은 바라는 점을 가끔 말로 꺼내 보세요.',
    comfy: '편하다고 말을 줄이지 말고, 고마운 건 소리 내어 말해 주세요.',
    give: '한쪽이 계속 맞추지 않도록, 결정은 번갈아 가며 해 보세요.',
    keep: '같은 취미나 정해진 만남처럼 함께하는 시간을 만들면 더 가까워져요.',
    rest: '가까워도 각자 혼자 쉬는 시간은 꼭 지켜 주세요.',
  },
  t: { each: '서로에게 해 주면 좋은 것', talk: '대화 방식', score: '어울림 점수', stem: '첫인상과 끌림', heart: '가까워졌을 때', life: '생활과 주변', see: '서로에게 어떤 사람일까', fill: '서로 채워 주는 것', care: '조심하면 좋은 점', tips: '잘 지내는 방법' },
  sub: {},
  axes: { overall: '전체 어울림', flow: '관계가 굴러가는 방식', express: '마음을 표현하는 조화', conflict: '갈등을 푸는 힘', together: '함께 맞춰 갈 힘' },
  chip: { stem: '중심 기운', heart: '가까운 마음', month: '생활 리듬', year: '띠',
    v: { combine: '서로 끌려 합쳐짐', same: '비슷한 결', feedA: '내가 상대를 북돋음', feedB: '상대가 나를 북돋음', controlA: '내가 상대를 누름', controlB: '상대가 나를 누름', clash: '정면으로 부딪힘', plain: '특별한 신호 없음',
      harmony: '맞물림', half: '반쯤 맞물림', punish: '가시처럼 걸림', harm: '은근히 엇나감', break: '작은 어긋남', none: '특별한 신호 없음', cl: '부딪힘' } },
  selfTalk: {
    tree: '곧은 말투를 한 템포만 부드럽게 해 보세요.',
    fire: '감정이 올라오면 바로 말하기 전에 숨을 한 번 고르세요.',
    earth: '해결책부터 말하기 전에 "그랬구나" 한마디를 먼저 해 주세요.',
    metal: '옳고 그름을 따지기 전에 마음부터 먼저 알아 주세요.',
    water: '혼자 삭이지 말고 짧게라도 마음을 말로 꺼내 주세요.',
  },
  selfStem: { giveA: '내가 주는 쪽이니, 지칠 땐 쉬고 싶다고 말하세요.', getB: '받는 만큼 고마움과 마음을 자주 표현해 주세요.', ctrl: '결정을 혼자 하지 말고 의견을 먼저 물어보세요.', ctrled: '맞추기만 하지 말고 하고 싶은 말을 분명히 하세요.', space: '부담될 땐 잠깐 거리를 두고 싶다고 솔직하게 말하세요.' },
}

const en: T = {
  ui: { title: 'Match reading', score: 'Harmony', ofHundred: '/ 100', note: 'This is a "tendency" from comparing two charts. A lower score can still grow into a good bond with effort, and a high one needs care too.', charts: 'See both charts' },
  tier: {
    top: ['You feel naturally drawn to each other', 'Your basic energies support each other well. Being together tends to feel easy and lasting.'],
    good: ['A good match', 'You help each other in many ways. Watch the small mismatches and it can stay comfortable.'],
    work: ['Gets better as you adjust', 'There are good fits and differences. The more you know each other, the easier it gets.'],
    diff: ['Very different — a bond of learning', 'Your styles differ a lot, so it may feel unfamiliar at first. Talking often turns it into learning from each other.'],
    hard: ['Can bump into each other often', 'Your energies cross often. Understanding and a little space help a lot.'],
  },
  stem: {
    combine: 'Your core energies pair up like a match. It tends to feel oddly comfortable from the start.',
    same: 'You share a similar nature. You understand each other fast, but you may share the same weak spots too.',
    feedA: 'Your energy nourishes them. You give, they gain — keep it balanced so only one side is not always giving.',
    feedB: 'Their energy nourishes you. Being near them tends to give you strength, so say thank you often.',
    controlA: 'Your energy presses on theirs. You may lead until they feel pushed — soften your tone and how you decide.',
    controlB: 'Their energy presses on yours. Do not just adapt; say what you want clearly.',
    clash: 'Your core energies meet head-on. Disagreements can grow, but you can also spark growth in each other.',
    plain: 'No strong pull or clash. Closeness grows with time spent together.',
  },
  heart: {
    harmony: 'Your "closest-heart" places interlock. Being together feels safe and tends to last.',
    half: 'Your closest places half-interlock. Your strength gathers when you do things together.',
    clash: 'Your closest places collide. The closer you get, the more small things may sting, so keep some alone time.',
    punish: 'Your closest places snag on each other. Words may come out sharp some days — pause before speaking.',
    harm: 'Your closest places drift apart quietly. Hurt feelings may build up more than big fights, so talk it out.',
    break: 'There is a small mismatch. Look after small things like promises and timing.',
    none: '',
  },
  monthGood: 'Your daily rhythm and way of working are similar.',
  monthHard: 'Your daily rhythm or way of working differs, so a little adjusting helps.',
  yearGood: 'Your birth-year animals also fit. Family and friends around you tend to feel comfortable.',
  yearHard: 'Your birth-year animals cross, so it may feel unfamiliar at first. Talking about family and friends closes the gap.',
  see: (v) => (v === 'a' ? 'To you, they are' : 'To them, you are'),
  seeMap: {
    비견: 'a comfortable friend.', 겁재: 'a rival who spurs you on.', 식신: 'someone who makes you relax and enjoy.',
    상관: 'someone who makes you speak frankly and break the mold — words can get sharp sometimes.', 편재: 'an active person who pulls you into new things.',
    정재: 'a calm, reliable presence.', 편관: 'someone who adds tension and makes you stronger.',
    정관: 'a courteous person who guides you well.', 편인: 'someone with an unusual view who inspires you.', 정인: 'someone who cares for you and lets you lean on them.',
  },
  fillRich: (w, e, m) => `The ${e} energy (${m}) ${w === 'a' ? 'you need is plentiful in them' : 'they need is plentiful in you'}. Being near ${w === 'a' ? 'them' : 'you'} can refill you.`,
  fillSome: (w, e, m) => `${w === 'a' ? 'They' : 'You'} carry a little of the ${e} energy (${m}) ${w === 'a' ? 'you' : 'they'} need.`,
  fillNone: 'No big mutual refilling shows up. Look after your own balance.',
  strain: (w, e) => `${w === 'a' ? 'They are' : 'You are'} very strong in ${e} energy, which ${w === 'a' ? 'you' : 'they'} find draining at times.`,
  el: { tree: ['wood', 'growth and beginnings'], fire: ['fire', 'passion and expression'], earth: ['earth', 'stability'], metal: ['metal', 'decisiveness'], water: ['water', 'wisdom and rest'] },
  talk: {
    tree: 'Speaks straight and frankly; prefers saying it directly.',
    fire: 'Feels fast and expresses big. Joy and anger show right away, and often wants empathy first.',
    earth: 'Easygoing and practical. Tends to ask "so what do we do?" before feelings.',
    metal: 'Objective and principled. Tends to weigh right and wrong before feelings.',
    water: 'Deep thinker who says little. Sorts feelings slowly before sharing.',
  },
  talkMix: {
    same: 'You talk in a similar way, so you understand each other quickly.',
    diff: 'Your talking styles differ, so it is easy to miss each other. One wants empathy, the other offers solutions, and both can feel unheard. Start by saying "just listen now" or "I need a solution now".',
  },
  tips: {
    argue: 'When you disagree, sleep on it before deciding.',
    speak: 'Do not store up hurt — say it briefly the same day.',
    thanks: 'The receiver can say thanks; the giver can voice what they hope for.',
    comfy: 'Comfort is no reason to talk less — say the thank-yous out loud.',
    give: 'Take turns making decisions so one side does not always adapt.',
    keep: 'A shared hobby or fixed meetup brings you closer.',
    rest: 'Even when close, protect each person’s alone time.',
  },
  t: { each: 'What to do for each other', talk: 'How you talk', score: 'Harmony score', stem: 'First pull', heart: 'When you get close', life: 'Life and surroundings', see: 'What you are to each other', fill: 'What you give each other', care: 'Watch out for', tips: 'How to get along' },
  sub: {},
  axes: { overall: 'Overall harmony', flow: 'How the bond runs', express: 'Harmony in expressing feelings', conflict: 'Power to resolve conflict', together: 'Power to grow together' },
  chip: { stem: 'Core energy', heart: 'Closest heart', month: 'Daily rhythm', year: 'Birth-year animal',
    v: { combine: 'pull together', same: 'similar nature', feedA: 'you nourish them', feedB: 'they nourish you', controlA: 'you press them', controlB: 'they press you', clash: 'head-on', plain: 'no special sign',
      harmony: 'interlock', half: 'half-interlock', punish: 'snag', harm: 'drift', break: 'small mismatch', none: 'no special sign', cl: 'collide' } },
  selfTalk: {
    tree: 'Soften your straight talk by one beat.',
    fire: 'When emotions rise, take one breath before speaking.',
    earth: 'Before offering solutions, say "I hear you" first.',
    metal: 'Before judging right and wrong, acknowledge the feeling first.',
    water: 'Do not keep it inside — say your feeling briefly out loud.',
  },
  selfStem: { giveA: 'You are the giving side — say so when you are tired.', getB: 'Voice thanks and feelings often for what you receive.', ctrl: 'Ask their view before deciding alone.', ctrled: 'Do not only adapt — say clearly what you want.', space: 'When it feels heavy, honestly ask for a little space.' },
}
const POOL: Record<string, T> = { ko, en }
export const matchPool = (lang: string) => POOL[lang] ?? POOL.en

const rank: Record<RelKind, number> = { harmony: 2, half: 1, none: 0, break: -1, harm: -1, punish: -2, clash: -3 }
export interface MatchOut { score: number; tier: string; headline: string; cards: MatchCard[]; axes: { label: string; value: number }[]; chips: { k: string; v: string }[] }
export function composeMatch(c: MatchCalc, lang: string): MatchOut {
  const t = matchPool(lang)
  const cards: MatchCard[] = []
  const [headline, summary] = t.tier[c.tier]
  cards.push({ kind: 'score', title: headline, paras: [summary] })

  const stemKey = c.stemRel === 'feed' ? (c.direction === 'a' ? 'feedA' : 'feedB') : c.stemRel === 'control' ? (c.direction === 'a' ? 'controlA' : 'controlB') : c.stemRel
  cards.push({ kind: 'stem', title: t.t.stem, paras: [t.stem[stemKey]] })

  const heart = [t.heart[c.dayBranch]].filter(Boolean)
  cards.push({ kind: 'heart', title: t.t.heart, paras: heart.length ? heart : [lang === 'ko' ? '가까운 마음의 자리에서 특별히 맞물리거나 부딪히는 신호는 없어요. 함께 쌓는 시간이 더 중요해요.' : 'No special lock or clash in the closest place. Time spent together matters more.'] })

  const life: string[] = []
  if (rank[c.monthBranch] >= 1) life.push(t.monthGood); else if (rank[c.monthBranch] <= -1) life.push(t.monthHard)
  if (rank[c.yearBranch] >= 1) life.push(t.yearGood); else if (rank[c.yearBranch] <= -1) life.push(t.yearHard)
  if (life.length) cards.push({ kind: 'life', title: t.t.life, paras: life })

  cards.push({ kind: 'see', title: t.t.see, paras: [`${t.see('a')} ${t.seeMap[c.aSeesB]}`, `${t.see('b')} ${t.seeMap[c.bSeesA]}`] })

  const ta = c.strongA as El, tb = c.strongB as El
  cards.push({ kind: 'talk', title: t.t.talk, paras: [`${lang === 'ko' ? '나: ' : 'You: '}${t.talk[ta]}`, `${lang === 'ko' ? '상대: ' : 'Them: '}${t.talk[tb]}`, ta === tb ? t.talkMix.same : t.talkMix.diff] })

  const fillLines = c.fills.map((f) => (f.level === 'rich' ? t.fillRich : t.fillSome)(f.who, t.el[f.el][0], t.el[f.el][1]))
  const strainLines = c.strains.map((s) => t.strain(s.who, t.el[s.el][0]))
  cards.push({ kind: 'fill', title: t.t.fill, paras: fillLines.length ? [...fillLines, ...strainLines] : [t.fillNone, ...strainLines] })

  // 사람별 조언
  const me: string[] = [], you: string[] = []
  if (ta !== tb) { me.push(t.selfTalk[ta]); you.push(t.selfTalk[tb]) }
  if (c.stemRel === 'feed') { (c.direction === 'a' ? me : you).push(t.selfStem.giveA); (c.direction === 'a' ? you : me).push(t.selfStem.getB) }
  if (c.stemRel === 'control') { (c.direction === 'a' ? me : you).push(t.selfStem.ctrl); (c.direction === 'a' ? you : me).push(t.selfStem.ctrled) }
  for (const st of c.strains) (st.who === 'a' ? me : you).push(t.selfStem.space)
  const uq = (a: string[]) => Array.from(new Set(a)).slice(0, 3)
  if (me.length || you.length) cards.push({ kind: 'each', title: t.t.each, paras: [], list: [...uq(me).map((x) => `${lang === 'ko' ? '나' : 'You'}: ${x}`), ...uq(you).map((x) => `${lang === 'ko' ? '상대' : 'Them'}: ${x}`)] })

  // 조심할 점·방법
  const tips: string[] = []
  const hard = c.stemRel === 'clash' || c.stemRel === 'control' || rank[c.dayBranch] <= -1
  if (hard) { tips.push(t.tips.argue, t.tips.speak) }
  if (c.stemRel === 'feed') tips.push(t.tips.thanks)
  if (c.stemRel === 'control') tips.push(t.tips.give)
  if (c.stemRel === 'combine' || rank[c.dayBranch] >= 1) tips.push(t.tips.comfy)
  if (rank[c.dayBranch] <= -2) tips.push(t.tips.rest)
  tips.push(t.tips.keep)
  const uniqTips = Array.from(new Set(tips)).slice(0, 4)
  cards.push({ kind: 'care', title: t.t.tips, paras: [], list: uniqTips })
  const A = t.axes
  const stemChip = t.chip.v[stemKey]
  const chips = [
    { k: t.chip.stem, v: stemChip },
    { k: t.chip.heart, v: t.chip.v[c.dayBranch] },
    { k: t.chip.month, v: t.chip.v[c.monthBranch] },
    { k: t.chip.year, v: t.chip.v[c.yearBranch] },
  ]
  const axes = [
    { label: A.overall, value: c.score }, { label: A.flow, value: c.axes.flow }, { label: A.express, value: c.axes.express },
    { label: A.conflict, value: c.axes.conflict }, { label: A.together, value: c.axes.together },
  ]
  return { score: c.score, tier: c.tier, headline, cards, axes, chips }
}
export function matchReading(rA: SajuResult, aA: Analysis, rB: SajuResult, aB: Analysis, lang: string) {
  return composeMatch(matchCalc(rA, aA, rB, aB), lang)
}

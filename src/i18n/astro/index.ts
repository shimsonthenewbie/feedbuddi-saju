import { SIGN_ELEMENT, aspect, elementRel, type AstroChart, type AspectKind, type ElRel } from '../../astro'

export interface AstroCard { kind: string; title: string; paras: string[] }
interface P {
  names: string[]
  sun: string[]; moon: string[]; rise: string[]
  t: { free: string; sun: string; moon: string; rise: string; sunNote: string; moonNote: string; riseNote: string; noTime: string; moonMaybe: string; foot: string; match: string; mSun: string; mMoon: string; mCross: string; mLove: string }
  rel: Record<ElRel, { sun: string; moon: string }>
  asp: Record<'good' | 'tense' | 'none', { cross: string; love: string }>
  line: (label: string, sign: string, text: string) => string
  you: string; them: string
}

const ko: P = {
  names: ['양자리', '황소자리', '쌍둥이자리', '게자리', '사자자리', '처녀자리', '천칭자리', '전갈자리', '사수자리', '염소자리', '물병자리', '물고기자리'],
  sun: [
    '먼저 움직이는 사람이에요. 망설이기보다 부딪쳐 보며 배우고, 승부와 도전에서 힘이 나요.',
    '차분하고 꾸준해요. 한번 마음먹으면 천천히 끝까지 가고, 편안함과 믿을 수 있는 것을 중요하게 여겨요.',
    '호기심이 많고 말이 빨라요. 새로운 정보와 사람이 에너지가 되고, 한 가지에 오래 묶이는 건 답답해해요.',
    '정이 깊고 사람을 챙겨요. 가까운 사람을 지키려는 마음이 크고, 안전하다고 느껴야 마음을 열어요.',
    '당당하고 존재감이 있어요. 인정받을 때 빛나고, 마음을 크게 쓰는 편이에요. 자존심이 상하면 크게 상처받아요.',
    '꼼꼼하고 분석적이에요. 작은 어긋남도 눈에 띄어서 잘 고치고, 도움이 되는 사람이 되고 싶어 해요.',
    '균형과 조화를 중시해요. 사람 사이를 부드럽게 이어 주지만, 결정 앞에서는 오래 저울질하기도 해요.',
    '깊고 집중력이 강해요. 마음을 쉽게 보이지 않지만 한번 빠지면 끝까지 파고들고, 속마음이 진해요.',
    '자유롭고 낙천적이에요. 더 넓은 세상과 배움을 좋아하고, 솔직하게 말하다가 가끔 직설적이라는 말을 들어요.',
    '책임감이 강하고 현실적이에요. 목표를 세우고 차근차근 올라가는 힘이 있고, 감정은 안으로 삼키는 편이에요.',
    '독립적이고 생각이 독특해요. 틀에 얽매이기 싫어하고, 친구처럼 거리를 두고 지내는 관계를 편하게 느껴요.',
    '감수성이 풍부하고 상상력이 커요. 다른 사람의 마음을 잘 느끼고, 현실이 버거우면 마음속 세계로 피하기도 해요.',
  ],
  moon: [
    '감정이 빠르게 올라왔다 빠르게 풀려요. 마음이 급해질 땐 몸을 움직이면 풀려요.',
    '안정되어야 마음이 놓여요. 맛있는 것, 익숙한 공간, 믿을 수 있는 사람 곁에서 편안해요.',
    '생각하고 말하면서 마음을 정리해요. 대화가 끊기면 답답하고, 기분이 자주 바뀌는 편이에요.',
    '마음이 깊고 예민해요. 돌봐 주고 돌봄받는 관계에서 편안하고, 기분이 파도처럼 오르내릴 수 있어요.',
    '사랑받고 인정받길 바라요. 마음을 표현하는 게 크고 따뜻하지만, 무시당하면 크게 서운해요.',
    '마음이 불안할 때 정리하고 점검하며 풀어요. 걱정이 많고, 말보다 행동으로 챙겨 주는 편이에요.',
    '갈등이 없는 편안한 분위기에서 마음이 놓여요. 싸움을 피하려다 속마음을 미룰 때가 있어요.',
    '감정이 깊고 진해요. 쉽게 믿지 않지만 믿으면 끝까지 가고, 서운함도 오래 가는 편이에요.',
    '자유로울 때 마음이 편해요. 답답하면 훌쩍 떠나고 싶고, 감정도 솔직하고 가볍게 털어놓아요.',
    '감정을 드러내기보다 참고 견뎌요. 겉으로는 단단해 보여도 속으로 혼자 감당하는 일이 많아요.',
    '감정과 거리를 두고 보는 편이에요. 혼자만의 시간이 필요하고, 마음을 말로 풀어내기엔 시간이 걸려요.',
    '남의 감정까지 잘 느껴서 쉽게 지쳐요. 혼자 쉬는 시간과 조용한 공간이 마음을 채워 줘요.',
  ],
  rise: [
    '첫인상이 시원하고 직진하는 느낌이에요. 처음 보는 자리에서도 먼저 말을 거는 편이에요.',
    '차분하고 믿음직한 인상이에요. 말투와 움직임이 느긋해서 편안하게 느껴져요.',
    '밝고 말이 많은 인상이에요. 재치 있고 가벼워 보여서 누구와도 금방 이야기를 시작해요.',
    '부드럽고 조심스러운 인상이에요. 처음엔 낯을 가리다가 친해지면 따뜻하게 변해요.',
    '눈에 띄고 당당한 인상이에요. 자신감 있어 보여서 어디서든 존재감이 느껴져요.',
    '단정하고 똑똑한 인상이에요. 말이 많지 않고 정돈된 느낌이라 믿고 맡기고 싶어 보여요.',
    '세련되고 부드러운 인상이에요. 예의 바르고 호감이 가서 사람들이 편하게 다가와요.',
    '조용한데 눈빛이 강한 인상이에요. 신비롭고 속을 알 수 없다는 말을 들을 수 있어요.',
    '밝고 개방적인 인상이에요. 활기차고 솔직해 보여서 함께 있으면 분위기가 가벼워져요.',
    '진중하고 어른스러운 인상이에요. 나이보다 차분해 보이고 책임감 있어 보여요.',
    '독특하고 개성 있는 인상이에요. 친근하면서도 어딘가 거리가 느껴지는 매력이 있어요.',
    '몽환적이고 부드러운 인상이에요. 눈빛이 순하고 감성적이라 사람을 편하게 해 줘요.',
  ],
  t: {
    free: '별자리로 보면', sun: '태양(겉으로 드러나는 나)', moon: '달(속마음)', rise: '상승(첫인상)',
    sunNote: '', moonNote: '', riseNote: '',
    noTime: '태어난 시간을 알면 첫인상(상승 별자리)까지 볼 수 있어요.',
    moonMaybe: '시간을 모르면 달 별자리는 하루 안에 바뀌었을 수 있어서, 이 결과는 참고로만 봐 주세요.',
    foot: '서양 점성술은 태어난 날의 하늘 위치를 바탕으로 한 전통 해석이에요. 경향으로 가볍게 봐 주세요.',
    match: '별자리로 보면', mSun: '겉으로 드러나는 모습(태양)', mMoon: '속마음의 리듬(달)', mCross: '서로의 마음을 알아주는 정도', mLove: '설렘과 끌림',
  },
  rel: {
    same: { sun: '비슷한 성향이라 말이 잘 통하지만, 같은 약점이 같이 나올 수 있어요.', moon: '속마음의 결이 같아서 말하지 않아도 이해되는 순간이 많아요.' },
    support: { sun: '서로 북돋아 주는 조합이에요. 한쪽의 에너지가 다른 쪽을 살려 줘요.', moon: '마음의 리듬이 잘 맞아서 함께 있으면 편안하게 풀려요.' },
    friction: { sun: '결이 달라 처음엔 자극이 되지만, 방식 차이로 부딪히기 쉬워요.', moon: '감정을 푸는 방식이 달라서 서운함이 엇갈릴 수 있어요. 마음을 말로 먼저 확인해 주세요.' },
    neutral: { sun: '크게 맞거나 부딪히지 않는 평범한 조합이에요. 서로 알아가며 맞춰 가요.', moon: '마음의 리듬이 크게 겹치지도 어긋나지도 않아요. 표현을 자주 해 주면 가까워져요.' },
  },
  asp: {
    good: { cross: '한쪽의 마음을 다른 쪽이 자연스럽게 알아주는 신호가 있어요. 편안하게 기댈 수 있는 사이예요.', love: '서로에게 설레는 신호가 있어요. 처음 끌림이 강한 편이에요.' },
    tense: { cross: '서로의 마음을 잘못 읽기 쉬운 신호가 있어요. 말하지 않은 건 모르니 마음을 직접 말해 주세요.', love: '끌리지만 자극과 긴장도 함께 있어요. 속도를 맞추면 오히려 오래가요.' },
    none: { cross: '마음을 알아주는 데 특별한 신호는 없어요. 대화로 쌓아 가는 사이예요.', love: '설렘에 큰 신호는 없어요. 함께한 시간으로 정이 쌓이는 쪽이에요.' },
  },
  line: (label, sign, text) => `${label} · ${sign} — ${text}`,
  you: '나', them: '상대',
}

const en: P = {
  names: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  sun: [
    'You move first. You learn by diving in and get energy from challenge and competition.',
    'Calm and steady. Once decided, you go slowly to the end and value comfort and reliability.',
    'Curious and quick-talking. New people and info energize you; being tied to one thing feels stuffy.',
    'Deeply caring. You protect those close to you and open up only when you feel safe.',
    'Confident with presence. You shine when appreciated, and a bruised pride hurts a lot.',
    'Detail-minded and analytical. You spot small flaws, fix them, and want to be useful.',
    'You value balance and harmony. You smooth things between people but can weigh a decision for long.',
    'Deep and intensely focused. You hide your heart, but once hooked you dig all the way in.',
    'Free and optimistic. You love wider worlds and learning, and your honesty can sound blunt.',
    'Responsible and realistic. You climb steadily toward goals and tend to swallow feelings.',
    'Independent with unusual ideas. You dislike boxes and feel easy in friend-like, spacious bonds.',
    'Sensitive and imaginative. You feel others deeply and may retreat into your inner world when reality weighs.',
  ],
  moon: [
    'Feelings rise fast and pass fast. When rushed, moving your body helps.',
    'You need stability to feel safe: good food, familiar places, trusted people.',
    'You sort feelings by thinking and talking. Silence feels stuffy and moods shift often.',
    'Deep and sensitive. Caring and being cared for soothes you; moods can rise and fall like waves.',
    'You want to be loved and recognized. Your affection is warm and big, but being ignored hurts.',
    'When anxious you tidy, check and fix. You worry a lot and show care through action.',
    'You feel safe in a conflict-free atmosphere and may delay your true feelings to avoid fights.',
    'Feelings run deep and strong. Slow to trust, loyal once you do, and hurt lingers.',
    'You feel at ease when free. When stifled you want to leave; feelings come out honest and light.',
    'You endure rather than show feelings. Looking tough, you often carry things alone.',
    'You watch feelings from a distance. You need alone time and take a while to put feelings into words.',
    'You absorb others’ feelings and tire easily. Quiet alone time refills you.',
  ],
  rise: [
    'A fresh, straight-ahead first impression. You often speak first at a new gathering.',
    'Calm and dependable. Your slow, steady manner feels comfortable.',
    'Bright and chatty. Witty and light, you start talking to anyone quickly.',
    'Soft and careful. Shy at first, warm once close.',
    'Eye-catching and confident. You have presence anywhere.',
    'Neat and smart. Reserved and orderly, people trust you with things.',
    'Polished and gentle. Polite and likable, people approach you easily.',
    'Quiet with strong eyes. People may call you mysterious.',
    'Bright and open. Lively and frank, you lighten the mood.',
    'Serious and mature. You look calmer and more responsible than your age.',
    'Unique and individual. Friendly yet with a touch of distance.',
    'Dreamy and soft. Gentle eyes and sensitivity put people at ease.',
  ],
  t: {
    free: 'By your star signs', sun: 'Sun (how you show up)', moon: 'Moon (inner heart)', rise: 'Rising (first impression)',
    sunNote: '', moonNote: '', riseNote: '',
    noTime: 'If you know your birth time, we can show your rising sign (first impression) too.',
    moonMaybe: 'Without a birth time the Moon sign may have changed during the day, so take it as a rough guide.',
    foot: 'Western astrology is a traditional interpretation based on the sky on your birth date. Read it as tendencies.',
    match: 'By star signs', mSun: 'How you show up (Sun)', mMoon: 'Inner rhythm (Moon)', mCross: 'How well you read each other’s hearts', mLove: 'Spark and attraction',
  },
  rel: {
    same: { sun: 'Similar natures — you talk easily, but share the same weak spots.', moon: 'Your inner rhythms match; often you understand without words.' },
    support: { sun: 'A supportive pairing — one’s energy lifts the other.', moon: 'Your emotional rhythms fit, so being together feels easy.' },
    friction: { sun: 'Different grain: stimulating at first, but styles can clash.', moon: 'You settle feelings differently, so hurt can cross. Check feelings in words first.' },
    neutral: { sun: 'A plain pairing, neither strongly fitting nor clashing. You adjust as you learn each other.', moon: 'Your rhythms neither overlap nor clash much. Frequent expression brings you closer.' },
  },
  asp: {
    good: { cross: 'One naturally understands the other’s heart. You can lean on each other comfortably.', love: 'There is a spark. The first pull tends to be strong.' },
    tense: { cross: 'Easy to misread each other. Unspoken feelings are unknown — say them.', love: 'Attracted, yet with friction and tension. Matching pace helps it last.' },
    none: { cross: 'No special sign for reading hearts. You build it through talking.', love: 'No big spark sign. Affection grows with time together.' },
  },
  line: (label, sign, text) => `${label} · ${sign} — ${text}`,
  you: 'You', them: 'Them',
}
const POOL: Record<string, P> = { ko, en }
export const astroPool = (l: string) => POOL[l] ?? POOL.en

export function astroFreeCard(c: AstroChart, lang: string): AstroCard {
  const p = astroPool(lang)
  const paras = [p.line(p.t.sun, p.names[c.planets.Sun.sign], p.sun[c.planets.Sun.sign]), p.line(p.t.moon, p.names[c.planets.Moon.sign], p.moon[c.planets.Moon.sign])]
  if (c.asc) paras.push(p.line(p.t.rise, p.names[c.asc.sign], p.rise[c.asc.sign]))
  else paras.push(p.t.noTime)
  if (c.moonUncertain) paras.push(p.t.moonMaybe)
  paras.push(p.t.foot)
  return { kind: 'astro', title: p.t.free, paras }
}

const goodA = (k: AspectKind) => k === 'conj' || k === 'trine' || k === 'sextile'
const tenseA = (k: AspectKind) => k === 'square' || k === 'opp'
function grade(a: AspectKind, b: AspectKind): 'good' | 'tense' | 'none' {
  const g = +goodA(a) + +goodA(b), t = +tenseA(a) + +tenseA(b)
  return g > t ? 'good' : t > g ? 'tense' : g > 0 ? 'good' : 'none'
}
export function astroMatchCard(a: AstroChart, b: AstroChart, lang: string): AstroCard {
  const p = astroPool(lang)
  const sunRel = elementRel(SIGN_ELEMENT[a.planets.Sun.sign], SIGN_ELEMENT[b.planets.Sun.sign])
  const moonRel = elementRel(SIGN_ELEMENT[a.planets.Moon.sign], SIGN_ELEMENT[b.planets.Moon.sign])
  const s = (c: AstroChart, k: 'Sun' | 'Moon') => p.names[c.planets[k].sign]
  const cross = grade(aspect(a.planets.Sun.lon, b.planets.Moon.lon), aspect(b.planets.Sun.lon, a.planets.Moon.lon))
  const love = grade(aspect(a.planets.Venus.lon, b.planets.Mars.lon), aspect(b.planets.Venus.lon, a.planets.Mars.lon))
  const paras = [
    `${p.t.mSun}: ${p.you} ${s(a, 'Sun')} · ${p.them} ${s(b, 'Sun')} — ${p.rel[sunRel].sun}`,
    `${p.t.mMoon}: ${p.you} ${s(a, 'Moon')} · ${p.them} ${s(b, 'Moon')} — ${p.rel[moonRel].moon}`,
    `${p.t.mCross}: ${p.asp[cross].cross}`,
    `${p.t.mLove}: ${p.asp[love].love}`,
  ]
  if (a.moonUncertain || b.moonUncertain || !a.timeKnown || !b.timeKnown) paras.push(p.t.moonMaybe)
  return { kind: 'astro', title: p.t.match, paras }
}

/** "이런 순간의 나" — 얼굴 특징과 네 가지 축 값으로 생활 장면을 한 줄씩. 경향 말투. */
import type { Metrics } from './measure'
import { NORM } from './read'
import { EL5, type El5 } from './wuxing'
type K = keyof typeof NORM
const z = (m: Metrics, k: K) => (m[k] - NORM[k][0]) / NORM[k][1]
const pick3 = (v: number, a = 0.5): 0 | 1 | 2 => (v < -a ? 0 : v > a ? 2 : 1)

const KO = {
  title: '이런 순간의 나', intro: '관상 풀이를 생활 장면으로 옮겨 봤어요.',
  rows: ['술자리에선', '화나면', '돈 쓸 땐', '연애할 땐', '십 년 뒤'],
  drink: ['조용히 잔을 비우며 남의 이야기를 들어 주는 편이에요', '적당히 어울리다 분위기를 보고 일어나는 편이에요', '분위기를 띄우다 제일 늦게까지 남는 편이에요'],
  anger: ['겉으론 잠잠해도 속에 오래 담아 두는 편이에요', '참을 만큼 참다가 필요한 순간에 말하는 편이에요', '그 자리에서 바로 표정과 말로 드러나는 편이에요'],
  money: ['쓸 때도 한 번 더 따져 보고 아껴 쓰는 편이에요', '쓸 땐 쓰고 남길 건 남기는 균형형이에요', '마음이 가면 시원하게 쓰고, 돌아올 거라 믿는 편이에요'],
  love: ['천천히 마음을 열지만 한 번 열면 오래 가는 편이에요', '상대의 속도에 맞춰 차분히 다가가는 편이에요', '마음이 가면 표현이 먼저 나가는 솔직한 편이에요'],
  later: { upper: '일찍부터 배움과 도움이 닿아 빨리 자리 잡는 편이에요', mid: '한창 일할 때 기운이 가장 크게 오는 편이에요', lower: '나이 들수록 안정감이 커져 뒤로 갈수록 풀리는 편이에요', even: '한 시기에 몰리지 않고 고르게 이어지는 편이에요' },
}
const EN = {
  title: 'Me in these moments', intro: 'The reading, translated into everyday scenes.',
  rows: ['At a drinking table', 'When angry', 'Spending money', 'In love', 'Ten years on'],
  drink: ['You quietly listen and let others talk', 'You mingle, read the room and leave on time', 'You lift the mood and stay the longest'],
  anger: ['You look calm but keep it inside for long', 'You hold on, then speak when it matters', 'It shows on your face and in your words right away'],
  money: ['You weigh it twice and spend carefully', 'You spend when you should and keep what you should', 'You spend freely when it feels right and trust it returns'],
  love: ['You open slowly, but once open it lasts', 'You approach calmly at the other person\'s pace', 'Once drawn, you express first and honestly'],
  later: { upper: 'Learning and help reach you early, so you settle early', mid: 'Your energy peaks in your working prime', lower: 'Stability grows with age, so later years loosen up', even: 'Energy stays even through life instead of peaking once' },
}
export const EL_NAME = {
  ko: { tree: ['목형', '길고 곧은 얼굴'], fire: ['화형', '선이 뾰족하고 또렷한 얼굴'], earth: ['토형', '두툼하고 후덕한 얼굴'], metal: ['금형', '각지고 단단한 얼굴'], water: ['수형', '둥글고 부드러운 얼굴'] },
  en: { tree: ['Wood', 'Long, straight face'], fire: ['Fire', 'Sharp, defined face'], earth: ['Earth', 'Full, generous face'], metal: ['Metal', 'Angular, firm face'], water: ['Water', 'Round, soft face'] },
} as Record<string, Record<El5, [string, string]>>
export const EL_BODY = {
  ko: { tree: '쭉 뻗는 나무의 기운이에요. 목표가 생기면 곧게 올라가는 성장형이고, 말보다 꾸준함으로 보여 줘요.', fire: '밝고 뜨거운 불의 기운이에요. 표현이 빠르고 열정이 있어서 분위기를 환하게 만들어요.', earth: '만물을 받치는 땅의 기운이에요. 믿음직하고 푸근해서 사람이 모이고, 한번 맺은 인연이 오래 가요.', metal: '단단하고 맺고 끊음이 분명한 쇠의 기운이에요. 원칙이 있고 책임감이 강해요.', water: '유연하게 흐르는 물의 기운이에요. 눈치가 빠르고 적응력이 좋아 어디서든 자리를 찾아요.' },
  en: { tree: 'The energy of a growing tree: goal-minded and upright, showing through steadiness rather than words.', fire: 'The energy of fire: quick to express and passionate, you brighten a room.', earth: 'The energy of earth that holds everything: dependable and warm, people gather and ties last.', metal: 'The energy of metal: firm, clear in cutting and keeping. Principled and responsible.', water: 'The energy of flowing water: perceptive and adaptable, you find your place anywhere.' },
} as Record<string, Record<El5, string>>

export function momentsOf(m: Metrics, axes: { value: number }[], lang: string): { title: string; intro: string; rows: [string, string][] } {
  const T = lang === 'ko' ? KO : EN
  const [drive, sense, social, care] = axes.map((a) => (a.value - 60) / 9)
  const lvl = (v: number) => pick3(v)
  const zs = { upper: z(m, 'upper'), mid: z(m, 'mid'), lower: z(m, 'lower') }
  const top = (Object.keys(zs) as (keyof typeof zs)[]).sort((a, b) => zs[b] - zs[a])[0]
  const later = zs[top] > 0.7 ? T.later[top] : T.later.even
  return {
    title: T.title, intro: T.intro,
    rows: [
      [T.rows[0], T.drink[lvl(social)]],
      [T.rows[1], T.anger[care > 0.5 ? 0 : drive > 0.5 || z(m, 'eyeTilt') > 0.8 ? 2 : 1]],
      [T.rows[2], T.money[pick3(z(m, 'noseW'))]],
      [T.rows[3], T.love[sense > 0.5 && social < 0 ? 0 : social > 0.5 ? 2 : 1]],
      [T.rows[4], later],
    ],
  }
}
void EL5

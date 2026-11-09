/** 두 사람의 관상 궁합(재미용): 동물 짝 + 얼굴 오행의 상생·상극 */
import type { AnimalKey } from './animal'
import { MATE } from './animal'
import { GEN, CTRL } from '../myeongri'
import type { El5 } from './wuxing'

type Lang = 'ko' | 'en'
export interface Side { key: AnimalKey; emoji: string; name: string; tags: string[]; el: El5; elName: string }
export interface Pair { score: number; head: string; lines: string[]; shareText: string }

export function pairOf(a: Side, b: Side, l: Lang): Pair {
  const ko = l === 'ko'
  let s = 58, rel: string
  if (MATE[a.key] === b.key || MATE[b.key] === a.key) { s += 22; rel = ko ? `${a.name}·${b.name} 조합은 서로의 빈 곳을 채워 주는 짝이에요.` : `${a.name} and ${b.name} fill each other's gaps.` }
  else if (a.key === b.key) { s += 8; rel = ko ? `같은 ${a.name}상이라 말이 잘 통하지만, 닮은 만큼 고집도 닮았어요.` : `Same ${a.name} type: easy to talk, equally stubborn.` }
  else { rel = ko ? `${a.name}·${b.name} 조합은 서로 다른 매력이 있어서 배우는 점이 많은 사이예요.` : `${a.name} and ${b.name} differ, so you learn from each other.` }
  let el: string
  if (a.el === b.el) { s += 6; el = ko ? `둘 다 ${a.elName} 쪽이라 편안하고 비슷한 속도로 움직여요.` : `Both ${a.elName}: comfortable, same pace.` }
  else if (GEN[a.el] === b.el || GEN[b.el] === a.el) { s += 14; el = ko ? `${a.elName}·${b.elName} 조합은 서로 북돋는 흐름(상생)이라 함께 있으면 힘이 나요.` : `${a.elName} and ${b.elName} nourish each other.` }
  else if (CTRL[a.el] === b.el || CTRL[b.el] === a.el) { s -= 4; el = ko ? `${a.elName}·${b.elName} 조합은 부딪히는 흐름(상극)이라 대화 방식을 맞춰 보면 좋아요.` : `${a.elName} and ${b.elName} can clash; sync your communication.` }
  else el = ko ? `기운 사이에 크게 걸리는 건 없어서 무난하게 어울려요.` : 'No big friction between your energies.'
  const score = Math.max(40, Math.min(98, s + ((a.tags[0].length + b.tags[0].length) % 5)))
  const head = ko ? (score >= 85 ? '천생연분 느낌이에요' : score >= 70 ? '잘 어울리는 사이예요' : score >= 55 ? '맞춰 갈수록 좋아지는 사이예요' : '서로 달라서 더 재밌는 사이예요') : (score >= 85 ? 'A near-perfect match' : score >= 70 ? 'Good together' : score >= 55 ? 'Gets better as you adapt' : 'Different, and fun for it')
  const tip = ko ? `${a.name}상은 ${a.tags[0]}, ${b.name}상은 ${b.tags[0]}이 강점이라 서로 그 부분을 인정해 주면 좋아요.` : `${a.name} brings ${a.tags[0]}, ${b.name} brings ${b.tags[0]}; credit each other for it.`
  return { score, head, lines: [rel, el, tip], shareText: ko ? `관상 궁합 ${a.emoji}${a.name}상 × ${b.emoji}${b.name}상 ${score}점 — ${head}` : `Face match ${a.emoji}${a.name} × ${b.emoji}${b.name}: ${score} — ${head}` }
}

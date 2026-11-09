/** 관상(얼굴의 오행 기운)과 사주(일간·용신)를 나란히 놓고 읽는 재미용 해석 */
import type { Analysis } from '../myeongri'
import { GEN, CTRL, KO } from '../myeongri'
import type { El5 } from './wuxing'

type Lang = 'ko' | 'en'
const COLOR: Record<Lang, Record<El5, string>> = {
  ko: { tree: '초록·청록', fire: '붉은·자주', earth: '노랑·베이지', metal: '흰색·은색', water: '검정·남색' },
  en: { tree: 'green', fire: 'red', earth: 'yellow/beige', metal: 'white/silver', water: 'black/navy' },
}
const EN: Record<El5, string> = { tree: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' }
const nm = (e: El5, l: Lang) => (l === 'ko' ? KO[e] : EN[e])

export interface Combo { title: string; rows: [string, string][]; note: string }

export function comboOf(face: El5, a: Analysis, l: Lang): Combo {
  const D = a.dayElement as El5, Y = a.yongsin.primary as El5, H = a.yongsin.heesin as El5, G = a.yongsin.gisin as El5
  const ko = l === 'ko'
  let inner: string
  if (face === D) inner = ko ? '겉으로 보이는 기운과 속 기운이 같은 결이에요. 보이는 대로의 사람이라는 말을 자주 들을 수 있어요.' : 'Your outer look and inner nature share the same tone. People often find you "as you appear".'
  else if (GEN[face] === D) inner = ko ? '얼굴에 비치는 기운이 속 기운을 북돋아요. 첫인상이 본모습을 든든하게 받쳐 주는 타입이에요.' : 'Your outer energy feeds your inner one. First impressions back you up.'
  else if (GEN[D] === face) inner = ko ? '속 기운이 얼굴로 풀려 나오는 모습이에요. 마음이 표정에 잘 드러나는 편일 수 있어요.' : 'Your inner energy flows out onto your face. Feelings tend to show.'
  else if (CTRL[face] === D) inner = ko ? '겉으로 풍기는 기운이 속 기운을 누르는 모양이에요. 본모습보다 인상이 더 세거나 다르게 보일 수 있어요.' : 'Your outer energy presses on your inner one. You may look stronger or different than you feel.'
  else inner = ko ? '속 기운이 겉 기운을 다스리는 모양이에요. 차분하게 다듬어진 인상을 주는 편이에요.' : 'Your inner energy steers your outer one. You come across composed.'
  let need: string
  if (face === Y || face === H) need = ko ? `얼굴의 ${nm(face, l)} 기운이 사주에서 필요한 기운과 맞아요. 이 기운을 살리면 흐름에 도움이 되는 쪽이에요.` : `Your face's ${nm(face, l)} matches what your chart needs. Lean into it.`
  else if (face === G) need = ko ? `얼굴의 ${nm(face, l)} 기운이 사주에서는 넘치기 쉬운 쪽이에요. 부족한 ${nm(Y, l)} 기운을 일부러 챙기면 균형이 잡혀요.` : `Your face's ${nm(face, l)} tends to run high in your chart. Add some ${nm(Y, l)} for balance.`
  else need = ko ? `얼굴 기운(${nm(face, l)})은 사주의 필요한 기운과 크게 부딪히진 않아요. 필요한 ${nm(Y, l)}만 따로 챙기면 돼요.` : `Your face (${nm(face, l)}) doesn't clash with your chart. Just add the ${nm(Y, l)} it needs.`
  const tip = ko ? `사주에 필요한 ${nm(Y, l)} 기운은 ${COLOR.ko[Y]} 계열로 입거나 꾸미면 재미로 가볍게 보태 볼 수 있어요.` : `For fun, you can add your chart's ${nm(Y, l)} through ${COLOR.en[Y]} tones.`
  return {
    title: ko ? '관상 + 사주 같이 보기' : 'Face + chart together',
    rows: [[ko ? '겉과 속' : 'Outer vs inner', inner], [ko ? '필요한 기운' : 'What you need', need], [ko ? '가볍게 쓰는 팁' : 'Light tip', tip]],
    note: ko ? '얼굴의 기운은 재미로 보는 어림이고, 사주 쪽은 자평명리 기준으로 계산했어요.' : 'The face part is a for-fun estimate; the chart part follows Ziping myeongri.',
  }
}

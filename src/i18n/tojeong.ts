/**
 * 토정비결 풀이 글. 괘(상·중·하) 숫자 구조에 맞춰 용용사주가 직접 새로 쓴 문장이다.
 * (원전의 시구를 옮긴 것이 아님 — 원전 방식의 "괘 계산"만 따르고, 풀이는 오늘 말로 풀어 쓴다.)
 * 같은 괘면 언제나 같은 글이 나온다.
 */
import type { TojeongResult } from '../myeongri/tojeong'
import { CELL, LOWX } from './tojeong-cells'
import { CELL_EN, LABEL_EN, LOWX_EN, LOW_EN, MID_EN, MONTH_LINES_EN, SEASON_EN, UP_EN } from './tojeong-en'

const UP: Array<[string, string]> = [
  ['씨앗을 심는 해', '새로 시작하기 좋은 흐름이에요. 이것저것 벌이기보다 한 가지를 정해 꾸준히 가면 연말에 눈에 띄는 열매가 달려요.'],
  ['사람이 길이 되는 해', '혼자 애쓰기보다 주변의 도움이 길을 열어 주는 해예요. 먼저 안부를 묻고 손을 내밀수록 좋은 소식이 빨리 와요.'],
  ['움직일수록 열리는 해', '가만히 있으면 답답하고, 나서면 풀리는 흐름이에요. 이동·만남·도전에 몸을 쓸수록 기회가 따라와요.'],
  ['다듬는 해', '새것보다 가진 것을 정리하고 실력을 다지는 해예요. 거친 부분을 손보면 하반기에 평가가 달라져요.'],
  ['중심을 잡는 해', '맡는 일과 책임이 커지면서 한가운데에 서는 해예요. 무겁게 느껴져도 지금 맡은 역할이 다음 자리를 만들어 줘요.'],
  ['기회가 넓어지는 해', '선택지가 많아지는 해예요. 좋은 제안이 여러 개 오니, 다 잡으려 하지 말고 기준 하나를 정해 고르세요.'],
  ['속도를 늦추는 해', '앞만 보고 달리면 탈이 나기 쉬워요. 몸과 마음을 점검하고 무리한 약속을 줄이면 오히려 오래 가요.'],
  ['거두는 해', '그동안 해 온 일의 결과가 보이는 해예요. 쌓아 둔 것이 있다면 인정받고, 부족했던 부분도 분명히 드러나요.'],
]
const MID: Array<[string, string]> = [
  ['앞이 힘이 센 흐름', '초반에 기운이 가장 좋고 뒤로 갈수록 차분해져요. 중요한 일은 상반기에 먼저 해 두세요.'],
  ['뒤늦게 올라가는 흐름', '초반은 조심스럽게 가다가 하반기에 풀리는 흐름이에요. 급할수록 천천히 가세요.'],
  ['여름·가을이 중심인 흐름', '한 해의 한가운데에서 가장 크게 움직여요. 봄에 준비하고 여름 이후에 밀어붙이면 좋아요.'],
  ['물결치는 흐름', '좋은 달과 조심할 달이 번갈아 와요. 기분이 오르내려도 큰 결정은 가라앉은 때 하세요.'],
  ['꾸준히 오르는 흐름', '큰 굴곡 없이 완만하게 좋아지는 흐름이에요. 눈에 띄지 않아도 쌓이는 것이 분명히 있어요.'],
  ['늦게 피는 흐름', '결과가 늦게 와서 중간에 불안할 수 있어요. 지금 보이는 것만으로 판단하지 마세요.'],
]
const LOW: Array<[string, string]> = [
  ['말과 약속을 아끼세요', '올해는 말 한마디, 약속 하나가 크게 돌아와요. 할 수 있는 것만 말하고, 한 번 한 약속은 지키세요.'],
  ['몸과 쉼을 먼저 챙기세요', '무엇을 하든 체력이 바탕이에요. 잠과 식사를 일정하게 하고, 쉬는 날을 일정에 미리 넣으세요.'],
  ['돈과 계약은 두 번 확인하세요', '서명하기 전, 송금하기 전에 한 번 더 보세요. 반대로 새로 배우는 일에 쓰는 돈은 아깝지 않아요.'],
]
const SEASON = ['', '새해 첫 달,', '입춘 무렵,', '봄이 오는 달,', '꽃 피는 달,', '초여름,', '한여름 문턱,', '무더운 달,', '더위가 꺾이는 달,', '가을 문턱,', '단풍 드는 달,', '찬 바람 부는 달,', '한 해 끝자락,']
const MONTH_LINES: Record<'good' | 'mid' | 'care', Array<[string, string]>> = {
  good: [
    ['반가운 소식이 들어와요.', '미뤄 둔 연락이나 제안을 이 달에 꺼내 보세요.'],
    ['하던 일이 술술 풀려요.', '속도를 내도 좋은 달이에요. 중요한 일을 이 달에 두세요.'],
    ['사람 복이 있는 달이에요.', '모임·소개에 나가 보세요. 인연이 일로 이어져요.'],
    ['노력한 만큼 인정받아요.', '결과물을 눈에 보이게 정리해 내보이세요.'],
    ['마음이 가벼워지는 달이에요.', '새로운 것을 시작하기에 부담이 적어요.'],
  ],
  mid: [
    ['큰 변화는 없고 평온해요.', '일상 리듬을 지키는 것이 가장 좋은 선택이에요.'],
    ['해야 할 일을 차근차근 하는 달이에요.', '미뤄 둔 정리와 점검을 하기에 좋아요.'],
    ['기복 없이 지나가요.', '다음 달을 위한 준비에 힘을 쓰세요.'],
    ['작은 일들이 쌓여요.', '사소한 약속부터 성실히 지키세요.'],
    ['조용하지만 속은 단단해져요.', '공부나 기술 같은 눈에 안 띄는 투자에 어울려요.'],
  ],
  care: [
    ['말이 엇갈리기 쉬워요.', '중요한 이야기는 글로 남기고, 감정이 올라올 때는 하루 뒤에 답하세요.'],
    ['몸이 먼저 지쳐요.', '일정을 줄이고 잠을 우선하세요. 큰 결정은 다음 달로 미루세요.'],
    ['돈이 새기 쉬운 달이에요.', '충동구매와 보증·빌려주기는 피하세요.'],
    ['뜻대로 안 돼도 조급해하지 마세요.', '막힌 일은 잠시 두고 다른 길을 찾으세요.'],
    ['사람 사이에서 오해가 생길 수 있어요.', '확인되지 않은 말은 믿지도 옮기지도 마세요.'],
  ],
}

export interface TojeongMonth { n: number; tone: 'good' | 'mid' | 'care'; label: string; line: string; tip: string }
export interface TojeongView {
  title: string
  code: string
  summary: string
  flow: [string, string]
  advice: [string, string]
  months: TojeongMonth[]
  facts: string[]
  note: string
}

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
/** 달(1~12)마다 그 해 흐름에서 얼마나 힘이 센가(0~1) */
const GOOD_AT: Array<(n: number) => number> = [
  (n) => 1 - (n - 1) / 11, // 앞이 힘이 센 흐름
  (n) => (n - 1) / 11, // 뒤늦게 올라가는 흐름
  (n) => Math.max(0, 1 - Math.abs(n - 7.5) / 5), // 여름·가을 중심
  (n) => (n % 2 === 0 ? 0.8 : 0.2), // 물결
  (n) => 0.3 + (n - 1) / 22, // 꾸준히 오르는 흐름
  (n) => (n >= 9 ? 0.95 : n >= 6 ? 0.4 : 0.15), // 늦게 피는 흐름
]
const LABEL = { good: '좋은 달', mid: '무난한 달', care: '조심할 달' }

export function composeTojeong(r: TojeongResult, lang: 'ko' | 'en' = 'ko'): TojeongView {
  const en = lang === 'en'
  const u = (en ? UP_EN : UP)[r.up - 1]
  const cell = (en ? CELL_EN : CELL)[r.up - 1][r.mid - 1]
  const m = (en ? MID_EN : MID)[r.mid - 1]
  const l = (en ? LOW_EN : LOW)[r.low - 1]
  const months: TojeongMonth[] = []
  const used: Record<string, number> = { good: 0, mid: 0, care: 0 }
  for (let n = 1; n <= 12; n++) {
    const h = hash(`${r.code}-${n}`)
    const p = h % 100
    // 중괘의 흐름(앞이 센가, 뒤가 센가…)에 따라 좋은 달이 몰리는 위치를 달리한다
    const g = GOOD_AT[r.mid - 1](n)
    const goodCut = Math.round(10 + g * 34)
    const careCut = goodCut + Math.round(44 - g * 24)
    const tone: TojeongMonth['tone'] = p < goodCut ? 'good' : p < careCut ? 'mid' : 'care'
    const [line, tip] = (en ? MONTH_LINES_EN : MONTH_LINES)[tone][((h >>> 8) + used[tone]++) % 5] // 같은 종류 달이 연달아 같은 문장이 되지 않게 돌려 씀
    months.push({ n, tone, label: (en ? LABEL_EN : LABEL)[tone], line: `${(en ? SEASON_EN : SEASON)[n]} ${line}`, tip })
  }
  if (en) {
    return {
      title: `Tojeong Bigyeol ${r.year} (${r.yearGanji} year)`,
      code: r.code,
      summary: `${cell[0]} — ${cell[1]}`,
      flow: m,
      advice: [l[0], `${l[1]} ${LOWX_EN[r.low - 1][r.up - 1]}`],
      months,
      facts: [
        `Theme of the year: ${u[0]} — ${u[1]}`,
        `Lunar birthday: ${r.lunarBirth.y}-${r.lunarBirth.leap ? 'leap ' : ''}${r.lunarBirth.m}-${r.lunarBirth.d} (Korean age ${r.age})`,
        `Hexagram code ${r.code} (upper ${r.up} · middle ${r.mid} · lower ${r.low}) — one of 144`,
        ...(r.lunarBirth.leap ? ['Leap-month births are calculated as a regular month.'] : []),
        ...(r.dayClamped ? ['That lunar month has only 29 days this year, so your birthday was treated as the 29th.'] : []),
      ],
      note: 'The three-part code follows the classic Tojeong Bigyeol method; the wording is newly written by Yongyong Saju and does not reproduce the classic’s verses. For fun and reference only.',
    }
  }
  return {
    title: `${r.year}년 ${r.yearGanji}년 토정비결`,
    code: r.code,
    summary: `${cell[0]} — ${cell[1]}`,
    flow: m,
    advice: [l[0], `${l[1]} ${(en ? LOWX_EN : LOWX)[r.low - 1][r.up - 1]}`],
    months,
    facts: [
      `한 해의 큰 주제: ${u[0]} — ${u[1]}`,
      `음력 생일: ${r.lunarBirth.y}년 ${r.lunarBirth.leap ? '윤' : ''}${r.lunarBirth.m}월 ${r.lunarBirth.d}일 (한국 나이 ${r.age}세)`,
      `괘 번호 ${r.code} (상괘 ${r.up} · 중괘 ${r.mid} · 하괘 ${r.low}) — 144가지 중 하나`,
      ...(r.lunarBirth.leap ? ['윤달생은 평달로 보고 계산했어요.'] : []),
      ...(r.dayClamped ? ['그 해 해당 달이 29일까지라 생일을 29일로 보고 계산했어요.'] : []),
    ],
    note: '토정비결 원전의 괘 만드는 방식(상·중·하괘)을 따라 계산했고, 풀이 글은 용용사주가 오늘 말로 새로 쓴 거예요. 원전의 시구를 그대로 옮긴 것이 아니며, 재미와 참고용이에요. 시각(태어난 시간)은 계산에 쓰지 않아요.',
  }
}

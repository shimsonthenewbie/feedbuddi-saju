import type { DailyFortune } from '../../myeongri/daily'
import { CATS, type CatKey } from '../../myeongri/daily'
import type { DailyText } from './types'
import { ko } from './ko'
import { en } from './en'

/** 아직 번역이 없는 언어는 영어로 대체한다. 언어를 추가하려면 같은 모양의 파일을 만들어 여기에 등록한다. */
const POOLS: Record<string, DailyText> = { ko, en }
export const dailyPool = (lang: string): DailyText => POOLS[lang] ?? en

const pick = <T>(arr: T[], seed: number, salt = 0): T => arr[(seed + salt * 7919) % arr.length]
const tier = (n: number): 'hi' | 'mid' | 'lo' => (n >= 4 ? 'hi' : n <= 2 ? 'lo' : 'mid')

export interface DailyView {
  date: string
  stars: number
  starLabel: string
  title: string
  body: string
  event: string | null
  cats: { key: CatKey; name: string; stars: number; line: string }[]
  tip: string
  lucky: { title: string; items: { label: string; value: string }[] }
  disclaimer: string
}

export function composeDaily(f: DailyFortune, lang: string): DailyView {
  const t = dailyPool(lang)
  const th = t.theme[f.theme]
  const ev = f.event ? pick(t.event[f.event], f.seed, 1) : null
  const cats = CATS.map((k) => ({
    key: k,
    name: t.cats[k],
    stars: f.cats[k],
    line: pick(t.catLine[k][tier(f.cats[k])], f.seed, 2 + CATS.indexOf(k)),
  }))
  return {
    date: f.date,
    stars: f.stars,
    starLabel: t.starLabel[f.stars - 1],
    title: th.title,
    body: pick(th.body, f.seed, 0),
    event: ev,
    cats,
    tip: pick(t.tip[tier(f.stars)], f.seed, 9),
    lucky: {
      title: t.lucky.title,
      items: [
        { label: t.lucky.color, value: t.lucky.colors[f.lucky.color] },
        { label: t.lucky.number, value: String(f.lucky.number) },
        { label: t.lucky.direction, value: t.lucky.dirs[f.lucky.direction] },
      ],
    },
    disclaimer: t.disclaimer,
  }
}

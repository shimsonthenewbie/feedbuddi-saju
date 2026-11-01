import type { Analysis } from '../../myeongri'
import type { ConsultCalc, Win } from '../../myeongri/consult'
import type { ConsultText } from './types'
import { ko } from './ko'
import { en } from './en'

const POOLS: Record<string, ConsultText> = { ko, en }
export const consultPool = (lang: string): ConsultText => POOLS[lang] ?? en

const STEM_KO = '갑을병정무기경신임계'
const BRANCH_KO = '자축인묘진사오미신유술해'
const STEMS = '甲乙丙丁戊己庚辛壬癸'
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'
export const ganziKo = (g: string) => STEM_KO[STEMS.indexOf(g[0])] + BRANCH_KO[BRANCHES.indexOf(g[1])]

const pick = <T>(a: T[], seed: number) => a[seed % a.length]
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''))

export interface Card { kind: 'answer' | 'why' | 'you' | 'timeline' | 'event' | 'do' | 'care' | 'close'; title: string; paras: string[]; list?: string[] }

function whenOf(w: Win, lang: string): string {
  if (lang === 'ko') return `${w.year}년 ${w.month}월`
  return new Date(w.year, w.month - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

export function composeConsult(c: ConsultCalc, a: Analysis, lang: string, seed: number): Card[] {
  const t = consultPool(lang)
  const cards: Card[] = []
  const main = c.best[0] ?? null
  const kindLabel = (k: string) => (lang === 'ko' ? k : k.startsWith('충') ? 'clash' : k.startsWith('합') ? 'harmony' : 'friction')

  if (main) {
    cards.push({ kind: 'answer', title: fill(pick(t.headline[c.cat], seed), { when: whenOf(main, lang) }), paras: [pick(t.answerBody.best, seed)] })
    const g = main.ganzi
    const clashes = main.hitKinds.filter((k) => /^(충|형|해|파)/.test(k))
    const harm = main.hitKinds.some((k) => k.startsWith('합'))
    const name = lang === 'ko' ? ganziKo(g) : g
    let p = fill(t.why.lead, { ganziKo: name, ganzi: g }) + ' ' + fill(t.why.stem, { stem: lang === 'ko' ? `${STEM_KO[STEMS.indexOf(g[0])]}(${g[0]})` : g[0], stemSip: main.stemSip }) + ' ' + fill(t.why.branch, { branch: lang === 'ko' ? `${BRANCH_KO[BRANCHES.indexOf(g[1])]}(${g[1]})` : g[1], branchSip: main.branchSip })
    if (clashes.length) p += fill(t.why.clash, { kinds: Array.from(new Set(clashes.map(kindLabel))).join('·') })
    else if (harm) p += t.why.harmony
    const y = main.year
    const yg = c.yearGanzi[y]
    const paras = [p]
    if (yg) paras.push(fill(t.why.year, { year: y, yg: lang === 'ko' ? `${ganziKo(yg)}(${yg})` : yg }))
    cards.push({ kind: 'why', title: t.ui.whyTitle, paras })
  } else {
    cards.push({ kind: 'answer', title: t.ui.answerTitle, paras: [pick(t.answerBody.flat, seed)] })
  }

  const st = a.strength.label
  const strong = st === '신강' || st === '극신강'
  const weak = st === '신약' || st === '극신약'
  cards.push({ kind: 'you', title: t.ui.youTitle, paras: [strong ? t.you.strong : weak ? t.you.weak : t.you.mid, fill(t.you.yongsin, { el: t.you.el[a.yongsin.primary] })] })

  const line = (w: Win) => fill(t.timeline.month, { year: w.year, month: w.month, ganziKo: ganziKo(w.ganzi), ganzi: w.ganzi }) + ' · ' + w.stemSip + '/' + w.branchSip
  cards.push({
    kind: 'timeline', title: t.timeline.title, paras: [],
    list: [
      ...(c.best.length ? [`#${t.timeline.best}`, ...c.best.map(line)] : [t.timeline.none]),
      ...(c.care.length ? [`#${t.timeline.care}`, ...c.care.map(line)] : []),
    ],
  })
  if (c.event) {
    const w = whenOf(c.event, lang)
    cards.push({ kind: 'event', title: t.event.title, paras: [fill(c.event.tier === 'best' ? t.event.best : c.event.tier === 'care' ? t.event.care : t.event.mid, { when: w })] })
  }
  cards.push({ kind: 'do', title: t.ui.doTitle, paras: [pick(t.doIt[c.cat], seed)] })
  cards.push({ kind: 'care', title: t.ui.careTitle, paras: [pick(t.careIt[c.cat], seed + 1)] })
  cards.push({ kind: 'close', title: t.ui.closeTitle, paras: [pick(t.closing, seed)] })
  return cards
}

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

export interface Card { kind: 'now' | 'answer' | 'why' | 'you' | 'timeline' | 'event' | 'do' | 'care' | 'close'; title: string; paras: string[]; list?: string[] }

function whenOf(w: Win, lang: string): string {
  if (lang === 'ko') return `${w.year}년 ${w.month}월`
  return new Date(w.year, w.month - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

export function composeConsult(c: ConsultCalc, a: Analysis, lang: string, seed: number): Card[] {
  const t = consultPool(lang)
  const cards: Card[] = []
  const main = c.best[0] ?? null
  const KO_KIND: Record<string, string> = { 충: '정면으로 부딪히는', 형: '마찰이 생기는', 해: '엇갈리는', 파: '살짝 어긋나는' }
  const kindLabel = (k: string) => (lang === 'ko' ? KO_KIND[k.slice(0, 1)] ?? k : k.startsWith('충') ? 'a clash' : k.startsWith('형') ? 'friction' : 'a mismatch')

  if (c.now) {
    const n = c.now
    const lv = (w: Win): 'good' | 'mid' | 'weak' => (w.tier === 'best' || w.score >= 1.5 ? 'good' : w.tier === 'care' || w.score <= -1.5 ? 'weak' : 'mid')
    const L = lv(n)
    const paras = [pick(t.now.state[L], seed)]
    const grp = n.groups.find((g) => t.now.moneyNow[g])
    if (c.cat === 'money' && grp) paras.push(t.now.moneyNow[grp])
    else if (c.cat !== 'money') paras.push(t.now.catNow[c.cat])
    if (n.hitKinds.some((k) => /^(충|형)/.test(k))) paras.push(t.now.clash)
    else if (n.hitKinds.some((k) => /^(원진|귀문)/.test(k))) paras.push(t.now.mind)
    if (c.next.length) {
      const avg = c.next.reduce((s, w) => s + w.score, 0) / c.next.length
      paras.push(avg - n.score > 0.8 ? t.now.trend.up : avg - n.score < -0.8 ? t.now.trend.down : t.now.trend.flat)
    }
    cards.push({
      kind: 'now', title: t.now.title, paras,
      list: c.next.map((w) => `${fill(t.timeline.month, { year: w.year, month: w.month })} · ${t.now.tag[lv(w)]}`),
    })
  }
  if (main) {
    cards.push({ kind: 'answer', title: fill(pick(t.headline[c.cat], seed), { when: whenOf(main, lang) }), paras: [pick(t.answerBody.best, seed)] })
    const g = main.ganzi
    const clashes = main.hitKinds.filter((k) => /^(충|형|해|파)/.test(k))
    const harm = main.hitKinds.some((k) => k.startsWith('합'))
    const name = lang === 'ko' ? ganziKo(g) : g
    let p = fill(t.why.lead, { ganziKo: name, ganzi: g }) + ' ' + (main.stemSip === main.branchSip
      ? fill(t.why.same, { stemMean: t.sipsin[main.stemSip], stemSip: main.stemSip })
      : fill(t.why.stem, { stemMean: t.sipsin[main.stemSip], stemSip: main.stemSip }) + ' ' + fill(t.why.branch, { branchMean: t.sipsin[main.branchSip], branchSip: main.branchSip }))
    if (clashes.length) p += fill(t.why.clash, { kinds: kindLabel(['충', '형', '해', '파'].find((k) => clashes.some((c) => c.startsWith(k))) ?? clashes[0]) })
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

  const line = (w: Win) => fill(t.timeline.month, { year: w.year, month: w.month }) + ' · ' + Array.from(new Set([t.sipsin[w.stemSip], t.sipsin[w.branchSip]])).join(' · ')
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

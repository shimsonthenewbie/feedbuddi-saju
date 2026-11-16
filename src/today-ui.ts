/** 오늘의 운세 2.0 화면 조각 (한국어). 계산은 myeongri/today.ts, 문구는 i18n/daily/todayKo.ts */
import type { SajuResult } from './engine/types'
import type { Analysis } from './myeongri'
import { todayData, type AxisKey } from './myeongri/today'
import { composeTodayKo, LOADING_TIPS, type TodayViewKo } from './i18n/daily/todayKo'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const band = (s: number) => (s >= 75 ? 'hi' : s >= 55 ? 'mid' : 'lo')

function ring(score: number): string {
  const C = 2 * Math.PI * 52
  return `<svg class="t2ring" viewBox="0 0 128 128" role="img" aria-label="오늘의 점수 ${score}점">
    <circle cx="64" cy="64" r="52" fill="none" stroke="var(--line)" stroke-width="10"/>
    <circle cx="64" cy="64" r="52" fill="none" stroke="var(--seal)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - score / 100)).toFixed(1)}" transform="rotate(-90 64 64)"/>
    <text x="64" y="70" text-anchor="middle" class="t2num">${score}</text><text x="64" y="90" text-anchor="middle" class="t2unit">점</text></svg>`
}

function radar(axes: TodayViewKo['axes']): string {
  const cx = 150, cy = 128, R = 84
  const pt = (i: number, f: number) => { const a = (-90 + 60 * i) * Math.PI / 180; return [cx + R * f * Math.cos(a), cy + R * f * Math.sin(a)] as const }
  const poly = (f: number) => axes.map((_, i) => pt(i, f).map((n) => n.toFixed(1)).join(',')).join(' ')
  const val = axes.map((a, i) => pt(i, Math.max(0.25, a.score / 100)).map((n) => n.toFixed(1)).join(',')).join(' ')
  const grid = [0.25, 0.5, 0.75, 1].map((f) => `<polygon points="${poly(f)}" fill="none" stroke="var(--line)" stroke-width="1"/>`).join('')
  const spokes = axes.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)"/>` }).join('')
  const labs = axes.map((a, i) => {
    const [x, y] = pt(i, 1.2)
    const anchor = i === 0 || i === 3 ? 'middle' : i < 3 ? 'start' : 'end'
    const dy = i === 0 ? -6 : i === 3 ? 16 : 4
    return `<text x="${x.toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}" class="t2rl">${esc(a.name)} <tspan class="t2rs">${a.score}</tspan></text>`
  }).join('')
  const dots = axes.map((a, i) => { const [x, y] = pt(i, Math.max(0.25, a.score / 100)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="var(--seal)"/>` }).join('')
  return `<svg class="t2radar" viewBox="0 0 300 262" role="img" aria-label="6가지 영역별 점수">${grid}${spokes}<polygon points="${val}" fill="var(--seal)" fill-opacity=".22" stroke="var(--seal)" stroke-width="2" stroke-linejoin="round"/>${dots}${labs}</svg>`
}

function flowChart(flow: TodayViewKo['flow']): string {
  const X = [34, 92, 150, 208, 266]
  const y = (s: number) => 112 - ((Math.min(100, Math.max(30, s)) - 30) / 70) * 82
  const pts = flow.map((f, i) => `${X[i]},${y(f.score).toFixed(1)}`)
  const area = `M${X[0]},124 L${pts.join(' L')} L${X[4]},124 Z`
  const dots = flow.map((f, i) => `<circle cx="${X[i]}" cy="${y(f.score).toFixed(1)}" r="${f.today ? 6 : 4}" fill="${f.today ? 'var(--seal)' : 'var(--card)'}" stroke="var(--seal)" stroke-width="2"/><text x="${X[i]}" y="${(y(f.score) - 11).toFixed(1)}" text-anchor="middle" class="${f.today ? 't2fs on' : 't2fs'}">${f.score}</text><text x="${X[i]}" y="142" text-anchor="middle" class="${f.today ? 't2fd on' : 't2fd'}">${esc(f.label)}</text><text x="${X[i]}" y="156" text-anchor="middle" class="t2fd2">${esc(f.date)}</text>`).join('')
  return `<svg class="t2flow" viewBox="0 0 300 164" role="img" aria-label="그제부터 모레까지 5일 흐름"><path d="${area}" fill="var(--seal)" fill-opacity=".08"/><polyline points="${pts.join(' ')}" fill="none" stroke="var(--seal)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>${dots}</svg>`
}

export function todayHtml(r: SajuResult, a: Analysis, date: Date, dayLabel: string, dateStr: string): string {
  const t = todayData(r, a, date)
  const v = composeTodayKo(t)
  const tabs = [{ id: 'all', name: '총운', score: v.score }, ...v.slots.map((s) => ({ id: s.key, name: s.name, score: s.score }))]
  const slotPanel = v.slots.map((s) => `<div class="t2panel" data-p="${s.key}" hidden><p class="t2ps"><b>${esc(s.name)}</b> <span>${esc(s.sub)} 기준</span></p><div class="t2bar ${band(s.score)}"><i style="width:${s.score}%"></i><em>${s.score}점</em></div><p class="dbody">${esc(s.text)}</p></div>`).join('')
  return `
  <article class="card daily t2">
    <div class="dnav">
      <button type="button" id="prev" aria-label="어제">‹</button>
      <div class="dtitle"><b>${esc(dateStr)}</b>${dayLabel ? `<span>${esc(dayLabel)} · ${esc(t.dayGanzi)}일</span>` : `<span>${esc(t.dayGanzi)}일</span>`}</div>
      <button type="button" id="next" aria-label="내일">›</button>
    </div>
    <div class="t2hero ${band(v.score)}">
      ${ring(v.score)}
      <div class="t2hl"><span class="t2lab">${esc(v.label)}</span><h2>${esc(v.headline)}</h2><span class="t2dl">${esc(v.delta)}</span></div>
    </div>
    <div class="t2tabs" role="tablist">${tabs.map((x, i) => `<button type="button" role="tab" data-t="${x.id}" aria-selected="${i === 0}" class="${i === 0 ? 'on' : ''}"><b>${esc(x.name)}</b><span>${x.score}</span></button>`).join('')}</div>
    <div class="t2panel" data-p="all"><p class="dbody">${esc(v.total)}</p></div>
    ${slotPanel}
    <p class="t2best">⏰ ${esc(v.bestLine)}</p>
    <h3 class="t2h">영역별 운세 한눈에</h3>
    ${radar(v.axes)}
    <div class="t2secs">${v.sections.map((s) => `<section class="t2sec"><div class="t2sh"><b>${esc(s.name)}</b><div class="t2bar ${band(s.score)}"><i style="width:${s.score}%"></i><em>${s.score}</em></div></div><p>${esc(s.text)}</p></section>`).join('')}</div>
    <h3 class="t2h">5일 흐름</h3>
    ${flowChart(v.flow)}
    <p class="dbody">${esc(v.flowLine)}</p>
    <h3 class="t2h">오늘의 행운</h3>
    <div class="t2lucky">${v.lucky.map((i) => `<div><span>${esc(i.label)}</span><b>${esc(i.value)}</b></div>`).join('')}</div>
    <p class="note">${esc(v.disclaimer)}</p>
  </article>`
}

export function bindToday(root: HTMLElement) {
  const tabs = root.querySelectorAll<HTMLButtonElement>('.t2tabs button')
  tabs.forEach((b) => (b.onclick = () => {
    tabs.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)) })
    root.querySelectorAll<HTMLElement>('.t2panel').forEach((p) => { p.hidden = p.dataset.p !== b.dataset.t })
  }))
}

let seen = ''
/** 계산은 바로 끝나지만, 점신처럼 "분석 중"을 잠깐 보여 준다(하루 한 번, 사람이 같을 때는 건너뜀) */
export function loadingHtml(): string {
  const tip = LOADING_TIPS[new Date().getSeconds() % LOADING_TIPS.length]
  return `<article class="card t2load"><p class="t2lt">내 사주와 오늘의 기운을 맞춰 보는 중이에요</p><div class="t2prog"><i></i></div><p class="t2tip">💡 ${esc(tip)}</p></article>`
}
export const shouldLoad = (key: string) => { if (seen === key) return false; seen = key; return true }
export type { AxisKey }

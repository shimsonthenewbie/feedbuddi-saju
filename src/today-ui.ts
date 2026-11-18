/** 오늘의 운세 2.0 화면 조각 (한국어). 계산은 myeongri/today.ts, 문구는 i18n/daily/todayKo.ts */
import type { SajuResult } from './engine/types'
import type { Analysis } from './myeongri'
import { todayData, type AxisKey } from './myeongri/today'
import { sameDayPillar, bornOn } from './myeongri/celebs'
import { yearStory as _ys, pairStory as _ps, type YearStory, type PairStory } from './i18n/daily/todayKo2'
export const yearStory = _ys, pairStory = _ps
import { mindCards } from './i18n/daily/mindKo'
import { zodiacToday, starToday, ganziKo, storyOf } from './i18n/daily/todayKo2'
import { art } from './art'
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

const BHX = '子丑寅卯辰巳午未申酉戌亥'
const ZE = ['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷']
const ZK = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'sheep', 'monkey', 'rooster', 'dog', 'pig']
const SE = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
const SKEY = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
/** 그림 파일이 있으면 그림, 없으면 이모지·기호로 대신 보여 준다 */
// 그림만 넣는 자리: 파일이 없으면 아무것도 보이지 않는다
const pic = (file: string, cls = '') => `<img class="t2pic ${cls}" src="${art(file)}" alt="" loading="lazy" onerror="this.remove()">`
const LUCKY_ART = ['ico-color', 'ico-number', 'ico-direction', 'ico-food', 'ico-item', 'ico-place', 'ico-outfit', 'ico-time']
const ico = (file: string, fb: string, cls = '') => `<span class="t2ico ${cls}"><em>${fb}</em><img src="${art(file)}" alt="" loading="lazy" onload="this.previousElementSibling.remove()" onerror="this.remove()"></span>`
const RANGE: Record<string, string> = { morning: '07–12시', afternoon: '12–18시', night: '18–24시' }
function mini(score: number): string {
  const C = 2 * Math.PI * 16
  return `<svg viewBox="0 0 44 44" class="t2mini" aria-hidden="true"><circle cx="22" cy="22" r="16" fill="none" stroke="var(--line)" stroke-width="4"/><circle cx="22" cy="22" r="16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - score / 100)).toFixed(1)}" transform="rotate(-90 22 22)"/><text x="22" y="26.5" text-anchor="middle">${score}</text></svg>`
}
const bar = (n: number) => `<div class="t2bar ${band(n)}"><i style="width:${n}%"></i><em>${n}</em></div>`

export interface TodayOpts { moon: number; sun: number }

export function todayHtml(r: SajuResult, a: Analysis, date: Date, dayLabel: string, dateStr: string, o: TodayOpts): string {
  const t = todayData(r, a, date)
  const v = composeTodayKo(t)
  const seed = t.base.seed
  const zs = zodiacToday(t.dayGanzi[1], t.who.yearBranch, seed, t.dayGanzi[0])
  const ss = starToday(o.moon, o.sun, seed)
  const tabs = [{ id: 'all', name: '총운', range: '하루 전체', score: v.score }, ...v.slots.map((s) => ({ id: s.key, name: s.name, range: RANGE[s.key], score: s.score }))]
  const slotPanel = v.slots.map((s) => `<div class="t2panel" data-p="${s.key}" hidden>${pic('time-' + s.key, 'ban')}<p class="t2ps"><b>${esc(s.name)}</b> <span>${esc(RANGE[s.key])}</span></p>${bar(s.score)}<p class="dbody">${esc(s.text)}</p></div>`).join('')
  const P = v.profile
  const zRow = (z: (typeof zs)[number]) => `<section class="t2sec${z.mine ? ' t2mine' : ''}"><div class="t2sh">${ico('zodiac-' + ZK[z.key], ZE[z.key], 'big')}<b>${esc(z.name)}${z.mine ? ' <em class="t2me">내 띠</em>' : ''}</b>${bar(z.score)}</div><p class="t2sub">${esc(z.years)}년생 · ${esc(z.relLabel)}</p><p>${esc(z.text)}</p><details class="t2yrs"${z.mine ? ' open' : ''}><summary>태어난 해별로 보기</summary>${z.byYear.map((y) => `<div${z.mine && String(y.year) === String(r.input.year - (r.pillars[3].pillar.branch === BHX[(r.input.year - 4) % 12] ? 0 : 1)) ? ' class="me"' : ''}><b>${String(y.year).slice(2)}년생 <i>${esc(ganziKo(y.ganzi))}</i></b><p>${esc(y.text)}</p></div>`).join('')}</details></section>`
  const sRow = (z: (typeof ss)[number]) => `<section class="t2sec${z.mine ? ' t2mine' : ''}"><div class="t2sh">${ico('sign-' + SKEY[z.key], SE[z.key], 'big')}<b>${esc(z.name)}${z.mine ? ' <em class="t2me">내 별자리</em>' : ''}</b>${bar(z.score)}</div><p class="t2sub">${esc(z.date)} · ${esc(z.relLabel)}</p><p>${esc(z.text)}</p></section>`
  const top3 = [...zs].sort((p, q) => q.score - p.score).slice(0, 3).map((z) => z.name).join(', ')
  return `
  <article class="card daily t2">
    <div class="dnav">
      <button type="button" id="prev" aria-label="어제">‹</button>
      <div class="dtitle"><b>${esc(dateStr)}</b>${dayLabel ? `<span>${esc(dayLabel)} · ${esc(t.dayGanzi)}일</span>` : `<span>${esc(t.dayGanzi)}일</span>`}</div>
      <button type="button" id="next" aria-label="내일">›</button>
    </div>
    <div class="t2pick"><label>다른 날짜 보기 <input type="date" id="t2date" value="${t.date}"></label></div>
    <div class="t2views" role="tablist"><button type="button" class="on" data-v="me">내 운세</button><button type="button" data-v="zodiac">띠 운세</button><button type="button" data-v="star">별자리 운세</button></div>

    <div class="t2view" data-view="me">
    <div class="t2prof"><div><span>내 기운</span><b>${esc(P.el)}</b></div><div><span>일주 동물</span><b>${esc(P.animal)}</b></div><div><span>나를 닮은 것</span><b>${esc(P.image)}</b></div></div>
    <div class="t2hero ${band(v.score)}">
      ${ring(v.score)}
      <div class="t2hl"><span class="t2lab">${esc(v.label)}</span><h2>${esc(v.headline)}</h2><span class="t2dl">${esc(v.delta)}</span></div>
    </div>
    <p class="t2basis">내 사주의 앞뒤 한 달 흐름 안에서 오늘이 어느 정도인지 나타낸 점수예요. 다른 앱과는 점수 기준이 달라서 숫자보다 좋은 영역과 시간대를 봐 주세요.</p>
    ${(() => { const S = storyOf(t); return `<div class="t2story"><h3 class="t2h0">오늘 나에게 온 기운</h3><div class="t2vs"><div>${ico('stem-' + S.meKey, t.who.dayStem, 'stem')}<span>나</span><b>${esc(S.meName)}</b><small>${esc(S.meImage)}</small></div><i>×</i><div>${ico('stem-' + S.skyKey, t.dayGanzi[0], 'stem')}<span>오늘 하늘 기운</span><b>${esc(S.skyName)}</b><small>${esc(S.skyImage)}</small></div></div>${S.sky === S.earth ? `<p><b>하늘·땅</b> ${esc(S.sky)} 하늘과 땅이 같은 기운이라 오늘은 이 흐름이 더 뚜렷해요.</p>` : `<p><b>하늘</b> ${esc(S.sky)}</p><p><b>땅(${esc(S.earthName)})</b> ${esc(S.earth)}</p>`}${S.extra ? `<p class="t2ex">${esc(S.extra)}</p>` : ''}</div>` })()}
    <div class="t2acts"><div class="t2act ok"><span>체크</span><b>${esc(v.check.title)}</b><p>${esc(v.check.text)}</p></div><div class="t2act warn"><span>주의</span><b>${esc(v.caution.title)}</b><p>${esc(v.caution.text)}</p></div></div>
    <div class="t2tabs" role="tablist">${tabs.map((x, i) => `<button type="button" role="tab" data-t="${x.id}" aria-selected="${i === 0}" class="${i === 0 ? 'on' : ''} ${band(x.score)}">${mini(x.score)}<b>${esc(x.name)}</b><span>${esc(x.range)}</span></button>`).join('')}</div>
    <div class="t2panel" data-p="all"><p class="dbody">${esc(v.total)}</p></div>
    ${slotPanel}
    <p class="t2best">⏰ ${esc(v.bestLine)}</p>
    <h3 class="t2h">영역별 운세 한눈에</h3>
    ${radar(v.axes)}
    <div class="t2secs">${v.sections.map((s) => `<section class="t2sec"><div class="t2sh">${pic('ico-' + s.key, 'sm')}<b>${esc(s.name)}</b>${bar(s.score)}</div><p>${esc(s.text)}</p></section>`).join('')}</div>
    <h3 class="t2h">왜 이 점수일까요?</h3>
    <div class="t2why">${v.reason.rows.map(([k, x]) => `<div><b>${esc(k)}</b><p>${esc(x)}</p></div>`).join('')}<p class="t2whyn">${esc(v.reason.note)}</p></div>
    <h3 class="t2h">5일 흐름</h3>
    ${flowChart(v.flow)}
    <p class="dbody">${esc(v.flowLine)}</p>
    <h3 class="t2h">앞으로 7일 한눈에</h3>
    <div class="t2week">${v.week.map((w) => `<div class="${band(w.score)}${w.best ? ' best' : ''}${w.low ? ' low' : ''}"><span>${esc(w.dow)}</span><b>${w.score}</b><i>${w.best ? '최고' : w.low ? '조심' : esc(w.date)}</i></div>`).join('')}</div>
    <h3 class="t2h">오늘의 행운</h3>
    <div class="t2lucky">${v.lucky.map((i, n) => `<div>${pic(LUCKY_ART[n] ?? '', 'lk')}<span>${esc(i.label)}</span><b>${esc(i.value)}</b></div>`).join('')}</div>
    <p class="t2avoid">오늘은 <b>${esc(v.avoid)}</b> 계열을 줄이면 더 편해요.</p>
    ${(() => { const cl = (c: { name: string; tag: string; year: number }) => `<span><b>${esc(c.name)}</b>${c.tag ? `<i>${esc(c.tag)}</i>` : ''}<em>${c.year}</em></span>`; const same = sameDayPillar(t.who.dayStem + t.who.dayBranch).slice(0, 6); const [, mm, dd] = t.date.split('-').map(Number); const born = bornOn(mm, dd).slice(0, 6); if (!same.length && !born.length) return ''; return `<h3 class="t2h">유명인과 나</h3>${same.length ? `<p class="t2sub">나와 같은 날의 기운(일주)으로 태어난 유명인 · ${esc(ganziKo(t.who.dayStem + t.who.dayBranch))}</p><div class="t2celeb">${same.map(cl).join('')}</div>` : ''}${born.length ? `<p class="t2sub">${mm}월 ${dd}일에 태어난 유명인</p><div class="t2celeb">${born.map(cl).join('')}</div>` : ''}<p class="t2whyn">생일은 위키백과와 위키데이터가 서로 일치하는 사람만 담았어요. 태어난 시간은 알 수 없어 날짜 기준으로 계산했어요.</p>` })()}
    <h3 class="t2h">오늘의 심리 카드</h3>
    <p class="t2sub">내 사주와 오늘 날짜로 계산해요. 매일 결과가 바뀌어요. 카드를 눌러 열어 보세요.</p>
    <div class="t2mind">${mindCards(t).map((m) => `<details><summary>${ico(m.art, m.emoji, 'big')}<span><b>${esc(m.title)}</b><i>${esc(m.ask)}</i></span></summary><div class="t2mr"><strong>${esc(m.name)}</strong><p>${esc(m.text)}</p><p class="t2mt">오늘의 한 가지: ${esc(m.tip)}</p><p class="t2mw">${esc(m.why)}</p></div></details>`).join('')}</div>
    </div>

    <div class="t2view" data-view="zodiac" hidden>
      <p class="dbody">오늘은 ${esc(ganziKo(t.dayGanzi))}일이에요. 이 날의 땅 기운과 열두 띠가 맺는 관계(합·충·원진 등)로 본 오늘의 띠별 운세예요. 오늘 특히 힘이 실리는 띠는 <b>${esc(top3)}</b>예요.</p>
      <div class="t2secs">${[...zs].sort((p, q) => Number(q.mine) - Number(p.mine)).map(zRow).join('')}</div>
    </div>
    <div class="t2view" data-view="star" hidden>
      <p class="dbody">오늘 달이 머무는 별자리와 열두 별자리가 맺는 관계로 본 오늘의 별자리 운세예요.</p>
      <div class="t2secs">${[...ss].sort((p, q) => Number(q.mine) - Number(p.mine)).map(sRow).join('')}</div>
    </div>
    <p class="note">${esc(v.disclaimer)}</p>
  </article>`
}

export function bindToday(root: HTMLElement, onDate: (d: Date) => void) {
  const tabs = root.querySelectorAll<HTMLButtonElement>('.t2tabs button')
  tabs.forEach((b) => (b.onclick = () => {
    tabs.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)) })
    root.querySelectorAll<HTMLElement>('.t2panel').forEach((p) => { p.hidden = p.dataset.p !== b.dataset.t })
  }))
  const vs = root.querySelectorAll<HTMLButtonElement>('.t2views button')
  vs.forEach((b) => (b.onclick = () => {
    vs.forEach((x) => x.classList.toggle('on', x === b))
    root.querySelectorAll<HTMLElement>('.t2view').forEach((p) => { p.hidden = p.dataset.view !== b.dataset.v })
  }))
  const di = root.querySelector<HTMLInputElement>('#t2date')
  if (di) di.onchange = () => { const [y, m, d] = di.value.split('-').map(Number); if (y) onDate(new Date(y, m - 1, d)) }
}

let seen = ''
/** 계산은 바로 끝나지만, 점신처럼 "분석 중"을 잠깐 보여 준다(하루 한 번, 사람이 같을 때는 건너뜀) */
export function loadingHtml(): string {
  const tip = LOADING_TIPS[new Date().getSeconds() % LOADING_TIPS.length]
  return `<article class="card t2load"><p class="t2lt">내 사주와 오늘의 기운을 맞춰 보는 중이에요</p><div class="t2prog"><i></i></div><p class="t2tip">💡 ${esc(tip)}</p></article>`
}
export const shouldLoad = (key: string) => { if (seen === key) return false; seen = key; return true }
export type { AxisKey }

/** 올해 운세 화면 맨 위: 나 × 올해 기운 */
export function yearStoryHtml(S: YearStory, yearLabel: string): string {
  return `<article class="card"><div class="t2story" style="margin:0"><h3 class="t2h0">${esc(yearLabel)} 나에게 온 기운</h3><div class="t2vs"><div>${ico('stem-' + S.me.key, S.me.hanja, 'stem')}<span>나</span><b>${esc(S.me.name)}</b><small>${esc(S.me.image)}</small></div><i>×</i><div>${ico('stem-' + S.sky.key, S.sky.hanja, 'stem')}<span>올해 하늘 기운</span><b>${esc(S.sky.name)}</b><small>${esc(S.sky.image)}</small></div></div>${S.skyLine === S.earthLine ? `<p><b>하늘·땅</b> ${esc(S.skyLine)} 하늘과 땅이 같은 기운이라 이 흐름이 한 해 내내 뚜렷해요.</p>` : `<p><b>하늘</b> ${esc(S.skyLine)}</p><p><b>땅(${esc(S.earthName)})</b> ${esc(S.earthLine)}</p>`}${S.extra ? `<p class="t2ex">${esc(S.extra)}</p>` : ''}</div></article>`
}
/** 궁합 화면: 두 사람의 타고난 기운이 만나면 */
export function pairStoryHtml(S: PairStory, nameA: string, nameB: string): string {
  return `<article class="rcard"><div class="t2story" style="margin:0"><h3 class="t2h0">두 사람의 기운이 만나면</h3><div class="t2vs"><div>${ico('stem-' + S.a.key, S.a.hanja, 'stem')}<span>${esc(nameA)}</span><b>${esc(S.a.name)}</b><small>${esc(S.a.image)}</small></div><i>×</i><div>${ico('stem-' + S.b.key, S.b.hanja, 'stem')}<span>${esc(nameB)}</span><b>${esc(S.b.name)}</b><small>${esc(S.b.image)}</small></div></div><p><b>${esc(nameA)}에게 ${esc(nameB)}</b> ${esc(S.aGets)}</p><p><b>${esc(nameB)}에게 ${esc(nameA)}</b> ${esc(S.bGets)}</p></div></article>`
}

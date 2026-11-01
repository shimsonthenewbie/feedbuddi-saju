import type { SajuResult } from '@orrery/core/types'
import { analyze } from './myeongri'
import { ASK_CATS, consultCalc, type AskCat } from './myeongri/consult'
import { composeConsult, consultPool } from './i18n/consult'

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const ICON: Record<string, string> = { answer: '✦', why: '據', you: '我', timeline: '時', event: '日', do: '行', care: '慎', close: '語' }

export function mountAsk(box: HTMLElement, lang: string, r: SajuResult) {
  const t = consultPool(lang)
  let cat: AskCat | null = null
  let q = ''
  let date = ''

  const form = () => {
    box.innerHTML = `
    <section class="card ask">
      <h2>${esc(t.ui.title)}</h2>
      <p class="meta">${esc(t.ui.sub)}</p>
      <h3>${esc(t.ui.catTitle)}</h3>
      <div class="chips" role="radiogroup" aria-label="${esc(t.ui.catTitle)}">${ASK_CATS.map((k) => `<button type="button" class="chip${cat === k ? ' on' : ''}" data-k="${k}" role="radio" aria-checked="${cat === k}">${esc(t.cats[k])}</button>`).join('')}</div>
      <h3>${esc(t.ui.qTitle)}</h3>
      <textarea id="q" maxlength="300" rows="4" placeholder="${esc(t.ui.qPh)}">${esc(q)}</textarea>
      <div class="cnt"><span id="cnt">${q.length}</span>/300</div>
      <label for="d">${esc(t.ui.dTitle)}</label>
      <input type="date" id="d" value="${esc(date)}">
      <p class="note">${esc(t.ui.dHint)}</p>
      <button class="go" id="go" type="button">${esc(t.ui.go)}</button>
    </section>`
    const go = box.querySelector<HTMLButtonElement>('#go')!
    const sync = () => { go.disabled = !(cat && q.trim().length >= 2) }
    sync()
    box.querySelectorAll<HTMLButtonElement>('.chip').forEach((b) => (b.onclick = () => {
      cat = b.dataset.k as AskCat
      box.querySelectorAll('.chip').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-checked', String(x === b)) })
      sync()
    }))
    const ta = box.querySelector<HTMLTextAreaElement>('#q')!
    ta.oninput = () => { q = ta.value; box.querySelector('#cnt')!.textContent = String(q.length); sync() }
    box.querySelector<HTMLInputElement>('#d')!.onchange = (e) => { date = (e.target as HTMLInputElement).value }
    go.onclick = loading
  }

  const loading = () => {
    let i = 0
    const tip = () => `<p class="tip"><b>${esc(t.tips.title)}</b><br>${esc(t.tips.items[i % t.tips.items.length])}</p>`
    box.innerHTML = `<section class="card wait" aria-live="polite"><div class="ring" aria-hidden="true"><span>命</span></div><h2>${esc(t.ui.loading)}</h2><p class="meta">${esc(t.ui.loadingSub)}</p><div id="tip">${tip()}</div></section>`
    const timer = setInterval(() => { i++; const el = box.querySelector('#tip'); if (el) el.innerHTML = tip() }, 1800)
    setTimeout(() => { clearInterval(timer); result() }, 3600)
  }

  const result = () => {
    const a = analyze(r)
    const ev = date ? new Date(date + 'T12:00:00') : null
    const calc = consultCalc(r, a, cat!, new Date(), 24, ev)
    let seed = 0
    for (const ch of q + date + cat) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
    const cards = composeConsult(calc, a, lang, seed)
    box.innerHTML = `
    <div class="bubble me"><small>${esc(t.ui.mine)} · ${esc(t.cats[cat!])}</small>${esc(q)}</div>
    ${cards.map((c, idx) => `<article class="rcard ${c.kind}${idx === 0 ? ' lead' : ''}"><h3><span class="ri">${ICON[c.kind]}</span>${esc(c.title)}</h3>${c.paras.map((p) => `<p>${esc(p)}</p>`).join('')}${c.list ? `<ul>${c.list.map((l) => (l.startsWith('#') ? `<li class="lh">${esc(l.slice(1))}</li>` : `<li>${esc(l)}</li>`)).join('')}</ul>` : ''}</article>`).join('')}
    <article class="card fit"><h3>${esc(t.ui.fit)}</h3><div class="row"><button class="chip" data-f="y" type="button">${esc(t.ui.fitYes)}</button><button class="chip" data-f="n" type="button">${esc(t.ui.fitNo)}</button></div><p class="ok" id="thx" role="status"></p></article>
    <p class="note demo">${esc(t.ui.demo)}</p>
    <p class="note">${esc(t.ui.disclaimer)}</p>
    <button class="go ghost" id="again" type="button">${esc(t.ui.again)}</button>`
    box.querySelectorAll<HTMLButtonElement>('[data-f]').forEach((b) => (b.onclick = () => { box.querySelector('#thx')!.textContent = t.ui.thanks }))
    box.querySelector<HTMLButtonElement>('#again')!.onclick = () => { cat = null; q = ''; date = ''; form() }
    box.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  form()
}

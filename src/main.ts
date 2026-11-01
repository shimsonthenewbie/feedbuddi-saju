import './style.css'
import { calculateSaju } from '@orrery/core/saju'
import { SEOUL, filterCities, formatCityName, type City } from '@orrery/core/cities'
import { BRANCH_ELEMENT, STEM_INFO } from '@orrery/core/constants'
import type { SajuResult } from '@orrery/core/types'
import tzlookup from '@photostructure/tz-lookup'
import { buildPrompt, type Lang, type Person } from './prompt'
import { analyze } from './myeongri'
import { dailyFortune } from './myeongri/daily'
import { composeDaily } from './i18n/daily'
import { mountAsk } from './consult-ui'

type Mode = 'home' | 'today' | 'ask' | 'solo' | 'match' | 'shop'
const EL = ['tree', 'fire', 'earth', 'metal', 'water'] as const
type El = (typeof EL)[number]
const EL_CLASS: Record<El, string> = { tree: 'wood', fire: 'fire', earth: 'earth', metal: 'metal', water: 'water' }
const EL_EMOJI: Record<El, string> = { tree: '木', fire: '火', earth: '土', metal: '金', water: '水' }

const T = {
  ko: {
    title: '피드버디 사주',
    sub: '생년월일만 넣으면 오늘의 운세와\n고민 상담까지 바로 받아볼 수 있어요',
    today: '오늘',
    home: '홈',
    homeBannerT: '램프 요정에게 물어보기',
    homeBannerD: '고민을 적으면 좋은 시기까지 짚어 드려요',
    homeBannerB: '질문하기',
    homeBeta: '베타 기간 무료',
    quick: [['today', '運', '오늘의 운세'], ['solo', '命', '내 사주'], ['ask', '問', '고민 상담'], ['match', '緣', '궁합'], ['shop', '籤', '풀이 목록']],
    newTitle: '새로 나온 운세',
    newItems: [['NEW', '2027 신년운세', '정미년 한 해 흐름을 월별로', '12월 공개 예정', 'shop'], ['NEW', '그 사람과 이어질 수 있을까', '두 사람의 인연과 시기', '곧 공개', 'match']],
    hotTitle: '지금 많이 보는 운세',
    hotItems: [['오늘의 운세', '무료', 'today'], ['무료 사주 풀이', '무료', 'solo'], ['고민 상담 (시기 짚기)', '베타 무료', 'ask'], ['올해 흐름 (월별)', '990원', 'shop'], ['재물·직업 풀이', '990원', 'shop'], ['종합 풀이 리포트', '9,900원', 'shop']],
    pieceTitle: '사주 한 조각',
    pieces: ['오행은 목·화·토·금·수예요. 하나가 많거나 없다고 나쁜 게 아니라 그 기운을 어떻게 쓰는지가 성향을 만들어요.', '일간은 태어난 날의 하늘 글자로, 사주에서 "나"를 뜻해요.', '대운은 약 10년 단위로 바뀌는 큰 흐름이에요.'],
    ask: '상담',
    shop: '풀이',
    solo: '내 사주',
    match: '최애와 궁합',
    me: '나',
    fav: '최애',
    date: '생년월일',
    time: '태어난 시각',
    unknownTime: '시간을 몰라요',
    gender: '성별',
    male: '남',
    female: '여',
    place: '태어난 곳',
    placeHint: '도시 이름 검색 (예: 서울, 도쿄, 뉴욕)',
    go: '사주 보기',
    todayGo: '오늘의 운세 보기',
    goMatch: '궁합 보기',
    pillars: ['시주', '일주', '월주', '년주'],
    dayMaster: '나의 일간',
    elements: ['목', '화', '토', '금', '수'],
    elTitle: '오행 분포',
    luck: '대운 흐름',
    age: '세',
    aiTitle: 'AI에게 풀이 받기',
    aiDesc: '아래 요청문을 복사해서 AI에 붙여넣으면, 이 차트를 바탕으로 풀이해줘요.',
    copy: '요청문 복사하기',
    copied: '복사했어요! AI에 붙여넣으세요',
    open: '복사하고 열기',
    preview: '요청문 미리보기',
    privacy: '계산은 이 브라우저 안에서만 해요. 입력한 생년월일은 이 기기에만 저장돼요. 단, AI에 붙여넣으면 그 서비스로 전송되니 참고하세요.',
    fun: '재미와 참고용이에요. 중요한 결정은 스스로 판단해 주세요.',
    errDate: '생년월일을 입력해 주세요.',
    errTime: '태어난 시각을 입력하거나 "시간을 몰라요"를 체크해 주세요.',
    errPlace: '출생지를 찾지 못했어요. 도시 이름을 다시 검색해 주세요.',
    errCalc: '계산에 실패했어요. 날짜와 출생지를 확인해 주세요.',
    reading: '풀이 언어',
    footer: '사주 계산은 오픈소스 orrery(AGPL-3.0)를 사용해요.',
    source: '소스 코드 보기',
    who: '의 사주',
    dToday: '오늘', dYest: '어제', dTom: '내일', change: '정보 바꾸기',
    shopTitle: '준비 중인 풀이',
    shopNote: '가격과 구성은 아직 정해지지 않았어요. 지금은 둘러보기만 가능해요.',
    shopItems: [
      ['運', '오늘의 운세', '매일 확인하는 하루 흐름', '무료'],
      ['歲', '올해 흐름', '월별로 보는 올해의 기회와 쉬어갈 때', '990원'],
      ['緣', '연애·궁합', '나의 인연 스타일과 시기', '990원'],
      ['財', '재물·직업', '어울리는 일의 형태와 돈의 흐름', '990원'],
      ['健', '건강·컨디션', '타고난 체질 경향과 생활 팁', '990원'],
      ['書', '종합 풀이 리포트', '12단계로 풀어 쓰는 평생 사주', '9,900원'],
    ],
    shared: '궁합',
  },
  en: {
    title: 'Feedbuddi Saju',
    sub: 'Enter your birth date to get today\'s fortune\nand ask about what is on your mind',
    today: 'Today',
    home: 'Home',
    homeBannerT: 'Ask the Lamp Genie',
    homeBannerD: 'Write your worry and get the timing pointed out',
    homeBannerB: 'Ask now',
    homeBeta: 'Free during beta',
    quick: [['today', '運', "Today's fortune"], ['solo', '命', 'My chart'], ['ask', '問', 'Ask'], ['match', '緣', 'Match'], ['shop', '籤', 'Readings']],
    newTitle: 'New readings',
    newItems: [['NEW', '2027 New Year reading', 'The Ding-Wei year, month by month', 'Coming in December', 'shop'], ['NEW', 'Can we become close?', 'The bond and timing between two people', 'Coming soon', 'match']],
    hotTitle: 'Popular now',
    hotItems: [["Today's fortune", 'Free', 'today'], ['Free chart reading', 'Free', 'solo'], ['Ask about your worry', 'Free beta', 'ask'], ['This year, month by month', '₩990', 'shop'], ['Money & career', '₩990', 'shop'], ['Full life report', '₩9,900', 'shop']],
    pieceTitle: 'A piece of Saju',
    pieces: ['The five elements are Wood, Fire, Earth, Metal and Water. Having a lot or none is not bad; how you use it shapes you.', 'The Day Master is the heaven character of your birth day. It stands for "you".', 'Luck cycles change about every ten years.'],
    ask: 'Ask',
    shop: 'Shop',
    solo: 'My chart',
    match: 'Match',
    me: 'Me',
    fav: 'My bias',
    date: 'Birth date',
    time: 'Birth time',
    unknownTime: "I don't know the time",
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    place: 'Birthplace',
    placeHint: 'Search a city (e.g. Seoul, Tokyo, New York)',
    go: 'Show my chart',
    todayGo: "See today's fortune",
    goMatch: 'Check compatibility',
    pillars: ['Hour', 'Day', 'Month', 'Year'],
    dayMaster: 'Day Master',
    elements: ['Wood', 'Fire', 'Earth', 'Metal', 'Water'],
    elTitle: 'Five elements',
    luck: 'Luck cycles',
    age: '',
    aiTitle: 'Get your reading from AI',
    aiDesc: 'Copy the prompt below and paste it into any AI. It will read this exact chart.',
    copy: 'Copy prompt',
    copied: 'Copied! Paste it into the AI',
    open: 'Copy & open',
    preview: 'Prompt preview',
    privacy: 'Everything is calculated in your browser. Your birth details are saved on this device only. Note: when you paste into an AI, the text goes to that service.',
    fun: 'For fun and reference only. Please make big decisions yourself.',
    errDate: 'Please enter the birth date.',
    errTime: 'Enter the birth time or check "I don\'t know the time".',
    errPlace: 'Birthplace not found. Please search the city name again.',
    errCalc: 'Calculation failed. Please check the date and birthplace.',
    reading: 'Reading language',
    footer: 'Chart calculation uses the open-source orrery engine (AGPL-3.0).',
    source: 'View source code',
    who: "'s chart",
    dToday: 'Today', dYest: 'Yesterday', dTom: 'Tomorrow', change: 'Change details',
    shopTitle: 'Coming soon',
    shopNote: 'Prices and contents are not final. For now you can only browse.',
    shopItems: [
      ['運', "Today's fortune", 'Your daily flow, every day', 'Free'],
      ['歲', 'This year', 'Month-by-month openings and rest periods', '₩990'],
      ['緣', 'Love & compatibility', 'Your relationship style and timing', '₩990'],
      ['財', 'Money & career', 'Work styles that fit you and money flow', '₩990'],
      ['健', 'Health & energy', 'Natural tendencies and lifestyle tips', '₩990'],
      ['書', 'Full report', 'A 12-stage life reading', '₩9,900'],
    ],
    shared: 'Compatibility',
  },
} as const


/* ───────── 저장된 프로필 (이 기기에만) ───────── */
interface Profile { y: number; m: number; d: number; hh: number; mm: number; gender: 'M' | 'F'; unk: boolean; lat: number; lon: number; place: string }
const PKEY = 'fb-saju-profile'
function saveProfile(p: Person) {
  const i = p.result.input
  const v: Profile = { y: i.year, m: i.month, d: i.day, hh: i.hour, mm: i.minute, gender: i.gender, unk: !!i.unknownTime, lat: i.latitude ?? SEOUL.lat, lon: i.longitude ?? SEOUL.lon, place: p.placeName }
  try { localStorage.setItem(PKEY, JSON.stringify(v)) } catch { /* 저장 불가 환경 */ }
  memProfile = v
}
let memProfile: Profile | null = null
function loadProfile(): Profile | null {
  if (memProfile) return memProfile
  try { const raw = localStorage.getItem(PKEY); if (raw) memProfile = JSON.parse(raw) } catch { /* 무시 */ }
  return memProfile
}
function clearProfile() {
  memProfile = null
  try { localStorage.removeItem(PKEY) } catch { /* 무시 */ }
}

function resultOf(pr: Profile): SajuResult {
  return calculateSaju({ year: pr.y, month: pr.m, day: pr.d, hour: pr.hh, minute: pr.mm, gender: pr.gender, unknownTime: pr.unk, latitude: pr.lat, longitude: pr.lon, timezone: tzlookup(pr.lat, pr.lon) })
}

/* ───────── 오늘의 운세 화면 ───────── */
const starRow = (n: number) => '★'.repeat(n) + '<span class="off">' + '★'.repeat(5 - n) + '</span>'

function showToday() {
  const x = t()
  const pr = loadProfile()!
  const out = document.getElementById('out')!
  const r = resultOf(pr)
  const a = analyze(r)
  const base = new Date()
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + dayOffset)
  const f = dailyFortune(r, a, date)
  const v = composeDaily(f, lang)
  const dstr = date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' })
  const label = dayOffset === 0 ? x.dToday : dayOffset === -1 ? x.dYest : dayOffset === 1 ? x.dTom : ''
  out.innerHTML = `
  <article class="card daily">
    <div class="dnav">
      <button type="button" id="prev" aria-label="${x.dYest}">‹</button>
      <div class="dtitle"><b>${esc(dstr)}</b>${label ? `<span>${esc(label)}</span>` : ''}</div>
      <button type="button" id="next" aria-label="${x.dTom}">›</button>
    </div>
    <div class="hero"><span class="seal" aria-hidden="true">運</span>
      <div class="stars" role="img" aria-label="${v.stars}/5">${starRow(v.stars)}</div>
      <div class="slabel">${esc(v.starLabel)}</div>
    </div>
    <h2 class="dh">${esc(v.title)}</h2>
    <p class="dbody">${esc(v.body)}</p>
    ${v.event ? `<p class="devent">${esc(v.event)}</p>` : ''}
    <div class="dcats">${v.cats.map((c) => `<div class="dcat"><div class="cn">${esc(c.name)}</div><div class="cs" aria-label="${c.stars}/5">${starRow(c.stars)}</div><p>${esc(c.line)}</p></div>`).join('')}</div>
    <p class="dtip">✦ ${esc(v.tip)}</p>
    <h3>${esc(v.lucky.title)}</h3>
    <div class="lucky">${v.lucky.items.map((i) => `<div><span>${esc(i.label)}</span><b>${esc(i.value)}</b></div>`).join('')}</div>
    <p class="note">${esc(v.disclaimer)}</p>
  </article>
  <p class="mine">${esc(pr.y + '.' + pr.m + '.' + pr.d)} · ${esc(pr.place)} <button type="button" id="reset" class="linkbtn">${x.change}</button></p>`
  document.getElementById('prev')!.onclick = () => { dayOffset--; showToday() }
  document.getElementById('next')!.onclick = () => { dayOffset++; showToday() }
  document.getElementById('reset')!.onclick = () => { clearProfile(); render() }
}


const LAMP = `<svg class="lamp" viewBox="0 0 120 96" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M60 30c-9-7 9-12 0-24" stroke-opacity=".6"/><path d="M22 62c0-16 18-24 38-24s38 8 38 24c0 12-16 18-38 18S22 74 22 62z" fill="var(--card)"/><path d="M98 54c10-4 14-12 14-20"/><path d="M22 58c-10 0-16-6-14-14 1-4 6-6 12-2"/><path d="M48 38c3-10 21-10 24 0"/><path d="M44 80h32v8H44z"/><circle cx="104" cy="22" r="2" fill="currentColor"/><circle cx="14" cy="24" r="1.5" fill="currentColor"/></svg>`

function navHtml(): string {
  const x = t()
  const items: [Mode, string, string][] = [['home', '家', x.home], ['today', '運', x.today], ['ask', '問', x.ask], ['solo', '命', x.solo], ['shop', '籤', x.shop]]
  return `<nav class="bnav" aria-label="menu">${items.map(([m, hj, label]) => `<button type="button" data-mode="${m}" class="${mode === m ? 'on' : ''}" ${mode === m ? 'aria-current="page"' : ''}><span class="hj">${hj}</span>${esc(label)}</button>`).join('')}</nav>`
}

function homeHtml(): string {
  const x = t()
  const quick = x.quick.map(([m, hj, label]) => `<button type="button" class="qk" data-mode="${m}"><span class="hj">${hj}</span><span>${esc(label)}</span></button>`).join('')
  const news = x.newItems.map(([badge, title, desc, when, go]) => `<button type="button" class="newc" data-mode="${go}"><span class="badge">${badge}</span><b>${esc(title)}</b><span>${esc(desc)}</span><em>${esc(when)}</em></button>`).join('')
  const hot = x.hotItems.map(([name, price, go], i) => `<li><button type="button" data-mode="${go}"><span class="rk">${i + 1}</span><span class="nm">${esc(name)}</span><span class="pr ${price === x.hotItems[0][1] || /무료|Free/.test(price) ? 'free' : ''}">${esc(price)}</span></button></li>`).join('')
  const pieces = x.pieces.map((p) => `<li>${esc(p)}</li>`).join('')
  return `
  <section class="banner" aria-label="${esc(x.homeBannerT)}">
    <div class="bmain">${LAMP}<div><h2>${esc(x.homeBannerT)}</h2><p>${esc(x.homeBannerD)}</p></div></div>
    <div class="brow"><span class="beta">${esc(x.homeBeta)}</span><button type="button" class="bgo" data-mode="ask">${esc(x.homeBannerB)}</button></div>
  </section>
  <div class="quick">${quick}</div>
  <h3 class="sec">${esc(x.newTitle)}</h3>
  <div class="news">${news}</div>
  <h3 class="sec">${esc(x.hotTitle)}</h3>
  <ol class="hot">${hot}</ol>
  <h3 class="sec">${esc(x.pieceTitle)}</h3>
  <ul class="pieces">${pieces}</ul>`
}

/* ───────── 풀이 목록 (준비 중 카탈로그) ───────── */
function shopHtml(): string {
  const x = t()
  const items = x.shopItems.map(([emoji, name, desc, price]) => `<li class="prod"><span class="pe">${emoji}</span><div><b>${esc(name)}</b><p>${esc(desc)}</p></div><span class="pp">${esc(price)}</span></li>`).join('')
  return `<section class="card shop"><h2>${esc(x.shopTitle)}</h2><p class="meta">${esc(x.shopNote)}</p><ul class="prods">${items}</ul></section>`
}

const app = document.getElementById('app')!
let lang: Lang = (navigator.language || 'ko').startsWith('ko') ? 'ko' : 'en'
let mode: Mode = 'home'
let dayOffset = 0
let readLang: Lang = lang
const cityState: Record<string, City> = { a: SEOUL, b: SEOUL }

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const t = () => T[lang]

function personForm(id: 'a' | 'b', label: string): string {
  const x = t()
  return `<fieldset class="card person" data-p="${id}">
    <legend class="tag">${esc(label)}</legend>
    <label>${x.date}<input type="date" name="date" min="1900-01-01" max="2100-12-31" required></label>
    <div class="row">
      <label class="grow">${x.time}<input type="time" name="time"></label>
      <label class="chk"><input type="checkbox" name="unk"> ${x.unknownTime}</label>
    </div>
    <div class="row">
      <span class="gl">${x.gender}</span>
      <div class="seg" role="radiogroup" aria-label="${x.gender}">
        <label><input type="radio" name="g-${id}" value="F" checked><span>${x.female}</span></label>
        <label><input type="radio" name="g-${id}" value="M"><span>${x.male}</span></label>
      </div>
    </div>
    <label>${x.place}<input type="text" name="city" list="cities-${id}" placeholder="${x.placeHint}" autocomplete="off" value="${esc(formatCityName(SEOUL))}"></label>
    <datalist id="cities-${id}"></datalist>
  </fieldset>`
}

function render() {
  const x = t()
  document.documentElement.lang = lang
  document.title = x.title
  app.innerHTML = `
  <header class="top">
    <svg class="emblem ${mode === 'home' ? '' : 'sm'}" viewBox="0 0 80 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="40" cy="40" r="36"/><circle cx="40" cy="40" r="31" stroke-opacity=".45"/><path d="M52 40a14 14 0 1 1-14-14 11 11 0 0 0 14 14z" fill="currentColor" stroke="none"/><circle cx="52" cy="24" r="1.6" fill="currentColor" stroke="none"/><circle cx="24" cy="54" r="1.2" fill="currentColor" stroke="none"/></svg>
    <h1>${x.title}</h1>
    ${mode === 'home' ? `<p class="sub">${esc(x.sub).replace(/\n/g, '<br>')}</p>` : ''}
    <button class="langbtn" id="lang" type="button">${lang === 'ko' ? 'EN' : '한국어'}</button>
  </header>
  ${mode === 'home' ? homeHtml() : mode === 'shop' ? shopHtml() : (mode === 'today' || mode === 'ask') && loadProfile() ? '<section id="out"></section>' : `<form id="form" novalidate>
    ${personForm('a', x.me)}
    ${mode === 'match' ? personForm('b', x.fav) : ''}
    <p class="err" id="err" role="alert"></p>
    <button class="go" type="submit">${mode === 'solo' ? x.go : mode === 'today' || mode === 'ask' ? x.todayGo : x.goMatch}</button>
  </form>
  <section id="out"></section>`}
  ${navHtml()}
  <footer>
    <p>${x.fun}</p>
    <p>${x.footer} <a href="https://github.com/rath/orrery" target="_blank" rel="noopener">orrery</a></p>
  </footer>`
  bind()
}

function bind() {
  document.getElementById('lang')!.onclick = () => { lang = lang === 'ko' ? 'en' : 'ko'; readLang = lang; render() }
  app.querySelectorAll<HTMLElement>('[data-mode]').forEach((b) => (b.onclick = () => { mode = b.dataset.mode as Mode; window.scrollTo(0, 0); render() }))
  app.querySelectorAll<HTMLFieldSetElement>('fieldset.person').forEach((fs) => {
    const id = fs.dataset.p as 'a' | 'b'
    const input = fs.querySelector<HTMLInputElement>('input[name=city]')!
    const list = fs.querySelector<HTMLDataListElement>('datalist')!
    const unk = fs.querySelector<HTMLInputElement>('input[name=unk]')!
    const time = fs.querySelector<HTMLInputElement>('input[name=time]')!
    unk.onchange = () => { time.disabled = unk.checked }
    input.oninput = () => {
      const found = filterCities(input.value)
      list.innerHTML = found.map((c) => `<option value="${esc(formatCityName(c))}"></option>`).join('')
      const exact = found.find((c) => formatCityName(c) === input.value)
      if (exact) cityState[id] = exact
    }
  })
  document.getElementById('form')?.addEventListener('submit', onSubmit)
  if (mode === 'today' && loadProfile()) showToday()
  if (mode === 'ask' && loadProfile()) mountAsk(document.getElementById('out')!, lang, resultOf(loadProfile()!))
}

function readPerson(id: 'a' | 'b', label: string): Person | string {
  const x = t()
  const fs = app.querySelector<HTMLFieldSetElement>(`fieldset[data-p=${id}]`)!
  const date = fs.querySelector<HTMLInputElement>('input[name=date]')!.value
  const timeV = fs.querySelector<HTMLInputElement>('input[name=time]')!.value
  const unk = fs.querySelector<HTMLInputElement>('input[name=unk]')!.checked
  const gender = (fs.querySelector<HTMLInputElement>(`input[name=g-${id}]:checked`)!.value) as 'M' | 'F'
  if (!date) return x.errDate
  if (!unk && !timeV) return x.errTime
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = unk ? [12, 0] : timeV.split(':').map(Number)
  const typed = fs.querySelector<HTMLInputElement>('input[name=city]')!.value
  const found = typed.trim() ? filterCities(typed.trim()) : []
  if (typed.trim() && !found.length) return x.errPlace
  const city = found.find((c) => formatCityName(c) === typed) ?? found[0] ?? cityState[id]
  try {
    const tz = tzlookup(city.lat, city.lon)
    const result = calculateSaju({ year: y, month: m, day: d, hour: hh, minute: mm, gender, unknownTime: unk, latitude: city.lat, longitude: city.lon, timezone: tz })
    return { label, placeName: formatCityName(city), result }
  } catch {
    return x.errCalc
  }
}

function onSubmit(e: Event) {
  e.preventDefault()
  const x = t()
  const err = document.getElementById('err')!
  err.textContent = ''
  const people: Person[] = []
  const a = readPerson('a', x.me)
  if (typeof a === 'string') { err.textContent = a; return }
  people.push(a)
  if (mode === 'today' || mode === 'ask') {
    saveProfile(a)
    dayOffset = 0
    render()
    return
  }
  if (mode === 'match') {
    const b = readPerson('b', x.fav)
    if (typeof b === 'string') { err.textContent = b; return }
    people.push(b)
  }
  showResult(people)
}

const stemEl = (s: string): El | null => (STEM_INFO[s]?.element as El) ?? null
const branchEl = (b: string): El | null => (BRANCH_ELEMENT[b] as El) ?? null

function chartHtml(p: Person): string {
  const x = t()
  const r: SajuResult = p.result
  const unkTime = !!r.input.unknownTime
  const counts: Record<El, number> = { tree: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  const cells = r.pillars.map((d, i) => {
    const hide = unkTime && i === 0
    const se = hide ? null : stemEl(d.pillar.stem)
    const be = hide ? null : branchEl(d.pillar.branch)
    if (se) counts[se]++
    if (be) counts[be]++
    return `<div class="pillar ${i === 1 ? 'me' : ''}">
      <div class="plabel">${x.pillars[i]}</div>
      <div class="ss">${hide ? '?' : esc(d.stemSipsin)}</div>
      <div class="ch ${se ? EL_CLASS[se] : ''}">${hide ? '?' : d.pillar.stem}</div>
      <div class="ch ${be ? EL_CLASS[be] : ''}">${hide ? '?' : d.pillar.branch}</div>
      <div class="ss">${hide ? '?' : esc(d.branchSipsin)}</div>
      <div class="us">${hide ? '' : esc(d.unseong)}</div>
    </div>`
  })
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const bars = EL.map((k, i) => `<div class="bar"><span class="bl">${EL_EMOJI[k]} ${x.elements[i]}</span><span class="track"><span class="fill ${EL_CLASS[k]}" style="width:${(counts[k] / total) * 100}%"></span></span><span class="bn">${counts[k]}</span></div>`).join('')
  const dm = r.pillars[1].pillar.stem
  const dmEl = stemEl(dm)
  const luck = r.daewoon.map((d) => `<div class="lk"><b>${d.age}${x.age}</b><span class="ch sm ${stemEl(d.ganzi[0]) ? EL_CLASS[stemEl(d.ganzi[0])!] : ''}">${d.ganzi[0]}</span><span class="ch sm ${branchEl(d.ganzi[1]) ? EL_CLASS[branchEl(d.ganzi[1])!] : ''}">${d.ganzi[1]}</span></div>`).join('')
  const title = lang === 'ko' ? `${p.label}${x.who}` : p.label === x.me ? 'My chart' : `${p.label}'s chart`
  return `<article class="card chart">
    <h2>${esc(title)}</h2>
    <p class="meta">${r.input.year}.${r.input.month}.${r.input.day}${unkTime ? '' : ` ${String(r.input.hour).padStart(2, '0')}:${String(r.input.minute).padStart(2, '0')}`} · ${esc(p.placeName)}</p>
    <div class="pillars">${cells.join('')}</div>
    <p class="dm">${x.dayMaster}: <span class="ch inline ${dmEl ? EL_CLASS[dmEl] : ''}">${dm}</span></p>
    <h3>${x.elTitle}</h3><div class="bars">${bars}</div>
    <h3>${x.luck}</h3><div class="luck">${luck}</div>
  </article>`
}

function showResult(people: Person[]) {
  const x = t()
  const out = document.getElementById('out')!
  const render2 = () => buildPrompt(mode === 'match' ? 'match' : 'solo', readLang, people)
  out.innerHTML = `${people.map(chartHtml).join('')}
  <article class="card ai">
    <h2>${x.aiTitle}</h2>
    <p>${x.aiDesc}</p>
    <div class="row between"><span>${x.reading}</span>
      <div class="seg small"><label><input type="radio" name="rl" value="ko" ${readLang === 'ko' ? 'checked' : ''}><span>한국어</span></label><label><input type="radio" name="rl" value="en" ${readLang === 'en' ? 'checked' : ''}><span>English</span></label></div></div>
    <button class="go" id="copy" type="button">${x.copy}</button>
    <div class="ais">
      <a data-u="https://gemini.google.com/app" href="https://gemini.google.com/app" target="_blank" rel="noopener">Gemini</a>
      <a data-u="https://chatgpt.com/" href="https://chatgpt.com/" target="_blank" rel="noopener">ChatGPT</a>
      <a data-u="https://claude.ai/new" href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a>
    </div>
    <p class="ok" id="ok" role="status"></p>
    <details><summary>${x.preview}</summary><pre id="pv"></pre></details>
    <p class="note">🔒 ${x.privacy}</p>
  </article>`
  const pv = document.getElementById('pv')!
  const refresh = () => { pv.textContent = render2() }
  refresh()
  out.querySelectorAll<HTMLInputElement>('input[name=rl]').forEach((r) => (r.onchange = () => { readLang = r.value as Lang; refresh() }))
  const copy = async () => {
    const text = render2()
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove()
    }
    document.getElementById('ok')!.textContent = x.copied
  }
  document.getElementById('copy')!.onclick = copy
  out.querySelectorAll<HTMLAnchorElement>('.ais a').forEach((a) => a.addEventListener('click', copy))
  out.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

render()

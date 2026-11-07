import './style.css'
import { calculateSaju } from '@orrery/core/saju'
import { SEOUL, filterCities, formatCityName, type City } from '@orrery/core/cities'
import { BRANCH_ELEMENT, STEM_INFO } from '@orrery/core/constants'
import type { SajuResult } from '@orrery/core/types'
import tzlookup from '@photostructure/tz-lookup'
import { buildPrompt, type Lang, type Person } from './prompt'
import { analyze, GROUP_OF, mainStemOf, sipsinOf } from './myeongri'
import { luckAt } from './myeongri/timing'
import { freeCards, freePool } from './i18n/free'
import { dailyFortune } from './myeongri/daily'
import { composeDaily } from './i18n/daily'
import { mountAsk } from './consult-ui'
import { art } from './art'
import { natal } from './astro'
import { findFace, fileToCanvas } from './face/mesh'
import { measure } from './face/measure'
import { readFace } from './face/read'
import { makeInviteUrl, readInvite, makeCard, type Invite } from './share'
import { astroFreeCard, astroMatchCard, astroTodayCard } from './i18n/astro'
import { matchReading, matchPool } from './i18n/match'

type Mode = 'home' | 'face' | 'invite' | 'star' | 'free' | 'today' | 'ask' | 'solo' | 'match' | 'shop'
const EL = ['tree', 'fire', 'earth', 'metal', 'water'] as const
type El = (typeof EL)[number]
const EL_CLASS: Record<El, string> = { tree: 'wood', fire: 'fire', earth: 'earth', metal: 'metal', water: 'water' }
const SIP_KO: Record<string, string> = { 比肩: '비견', 劫財: '겁재', 食神: '식신', 傷官: '상관', 偏財: '편재', 正財: '정재', 偏官: '편관', 正官: '정관', 偏印: '편인', 正印: '정인', 本元: '나' }
const UN_KO: Record<string, string> = { 長生: '장생', 沐浴: '목욕', 冠帶: '관대', 建祿: '건록', 帝旺: '제왕', 衰: '쇠', 病: '병', 死: '사', 墓: '묘', 絶: '절', 胎: '태', 養: '양' }
const EL_EMOJI: Record<El, string> = { tree: '木', fire: '火', earth: '土', metal: '金', water: '水' }

const T = {
  ko: {
    title: '피드버디 사주',
    sub: '생년월일만 넣으면 오늘의 운세와\n고민 상담까지 바로 받아볼 수 있어요',
    today: '오늘',
    home: '홈',
    freeTitle: '무료 사주 맛보기',
    faceName: '관상 (사진으로 보기)', faceT: '얼굴로 보는 관상', faceD: '정면 사진 한 장이면 돼요. 사진은 내 기기 안에서만 분석하고 서버로 보내지 않아요.',
    faceTips: ['밝은 곳에서 정면으로', '머리카락은 이마가 보이게 넘기기', '안경·마스크·모자는 벗기', '무표정에 가깝게'],
    faceCam: '카메라로 찍기', faceAlbum: '앨범에서 고르기', faceBusy: '여의가 얼굴을 살펴보는 중…',
    faceNone: '얼굴을 찾지 못했어요. 밝은 곳에서 정면으로 다시 찍어 주세요.', faceMany: '얼굴이 여러 개 보여요. 한 사람만 나오게 찍어 주세요.',
    faceSide: '얼굴이 옆으로 돌아가 있어요. 정면을 보고 다시 찍어 주세요.', faceTilt: '고개가 많이 기울었어요. 바르게 세우고 다시 찍어 주세요.', faceFail: '분석에 실패했어요. 잠시 뒤 다시 시도해 주세요.',
    faceAgain: '다른 사진으로 다시 보기', faceToSaju: '사주도 같이 보기', faceKept: '사진은 저장되지 않아요. 이 화면을 닫으면 사라져요.',
    selY: '연도', selM: '월', selD: '일', selH: '시', selMi: '분',
    shT: '친구와 나누기', again: '나도 다른 사람과 궁합 보기', shSend: '친구에게 궁합 보내기', shCard: '결과 카드 저장', shPriv: '링크에는 내 생년월일이 들어 있어요. 믿는 사람에게만 보내세요.', shCopied: '링크를 복사했어요. 친구에게 붙여 넣어 보내세요.', shSaved: '카드를 저장했어요.', shText: (sc: number, hl: string) => `여의가 본 우리 궁합은 ${sc}점, "${hl}"! 너랑도 궁합 볼래?`,
    invT: (n: string) => (n ? `${n}님이 궁합을 보내왔어요` : '친구가 궁합을 보내왔어요'), invD: '내 생년월일만 넣으면 둘의 궁합을 바로 볼 수 있어요. 가입은 필요 없어요.', invGo: '우리 궁합 보기',
    starTag: '해외 인기', starT: '해외에선 이렇게 봐요', starD: '서양 별자리로 보는 내 성격. 생일만 넣으면 태양·달·상승 별자리를 풀어 드려요.', starCta: '별자리 맛보기',
    starPageT: '별자리 맛보기', starPageD: '생일만 넣으면 돼요. 해외에서 가장 많이 보는 방식이에요.', starGo: '별자리 보기', starMore: '내 사주도 보기',
    introT: '', introD: '', introL: [] as string[], introCta: '',
    freeSub: '이름도 가입도 필요 없어요. 생일만 알려주면 여의가 슬쩍 봐 줄게요!',
    freeGo: '무료 사주 보기',
    freeBack: '다시 입력',
    todayLockT: '오늘의 운세',
    todayLockD: '로그인하면 매일 열려요',
    todayLockB: '베타 체험으로 열기',
    svcTitle: '모든 운세 보기',
    homeBannerT: '여의에게 물어보기',
    homeBannerD: '고민을 적으면 좋은 시기까지 짚어 드려요',
    homeBannerB: '질문하기',
    homeBeta: '베타 기간 무료',
    quick: [['today', '運', '오늘의 운세'], ['solo', '命', '내 사주'], ['ask', '問', '고민 상담'], ['match', '緣', '궁합'], ['shop', '籤', '풀이 목록']],
    newTitle: '새로 나온 운세',
    newItems: [['NEW', '관상', '사진 한 장으로 얼굴 읽기', '베타 무료', 'face'], ['NEW', '2027 신년운세', '정미년 한 해 흐름을 월별로', '12월 공개 예정', 'shop'], ['NEW', '두 사람의 궁합', '서로 끌리는 이유와 부딪히는 점', '베타 무료', 'match']],
    hotTitle: '지금 많이 보는 운세',
    hotItems: [['오늘의 운세', '무료', 'today'], ['무료 사주 풀이', '무료', 'solo'], ['고민 상담 (시기 짚기)', '베타 무료', 'ask'], ['사주 궁합', '베타 무료', 'match'], ['올해 흐름 (월별)', '990원', 'shop'], ['재물·직업 풀이', '990원', 'shop'], ['종합 풀이 리포트', '9,900원', 'shop']],
    pieceTitle: '사주 한 조각',
    pieces: ['오행은 목·화·토·금·수예요. 하나가 많거나 없다고 나쁜 게 아니라 그 기운을 어떻게 쓰는지가 성향을 만들어요.', '일간은 태어난 날의 하늘 글자로, 사주에서 "나"를 뜻해요.', '대운은 약 10년 단위로 바뀌는 큰 흐름이에요.'],
    ask: '상담',
    shop: '풀이',
    solo: '내 사주',
    match: '궁합',
    me: '나',
    fav: '상대',
    date: '생년월일',
    time: '태어난 시각',
    unknownTime: '시간을 몰라요',
    gender: '성별',
    male: '남',
    female: '여',
    place: '태어난 곳',
    placeHint: '도시 이름 검색 (예: 서울, 도쿄, 뉴욕)',
    nm: '이름 또는 별명 (선택)', nmHint: '결과에 이 이름으로 불러 드려요. 서버에 저장하지 않아요.',
    acc: '풀이 정확도', accDate: '생년월일', accTime: '태어난 시간', accPlace: '태어난 곳',
    accTimeTip: '태어난 시간을 알면 +25%예요. 모르면 가족에게 물어보거나 출생증명서·생활기록부에서 찾을 수 있어요.',
    accPlaceTip: '태어난 곳이 서울이 아니라면 도시를 바꿔 주세요(+10%). 지역마다 해 뜨는 시각이 달라 계산이 더 정확해져요. 서울이 맞으면 그대로 두셔도 돼요.',
    accFull: '좋아요! 가장 정확한 풀이가 나와요.',
    go: '사주 보기',
    todayGo: '오늘의 운세 보기',
    goMatch: '궁합 보기',
    pillars: ['시', '일', '월', '년'],
    dayMaster: '나를 나타내는 글자 (일간)',
    elements: ['목', '화', '토', '금', '수'],
    elTitle: '다섯 기운 분포 (오행)',
    luck: '10년 단위 큰 흐름 (대운)',
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
    freeTitle: 'Free Saju taste',
    faceName: 'Face reading (photo)', faceT: 'Face reading', faceD: 'One front-facing photo is enough. It is analysed on your device only and never uploaded.',
    faceTips: ['Bright light, facing the camera', 'Push hair off the forehead', 'No glasses, mask or hat', 'A neutral expression'],
    faceCam: 'Take a photo', faceAlbum: 'Choose from album', faceBusy: 'Yeoui is looking at your face…',
    faceNone: "Couldn't find a face. Try a front-facing photo in bright light.", faceMany: 'More than one face found. Please use a photo of one person.',
    faceSide: 'Your face is turned. Please face the camera.', faceTilt: 'Your head is tilted. Please hold it upright.', faceFail: 'Analysis failed. Please try again shortly.',
    faceAgain: 'Try another photo', faceToSaju: 'Also read my chart', faceKept: 'Your photo is not saved. It disappears when you leave this screen.',
    selY: 'Year', selM: 'Month', selD: 'Day', selH: 'Hour', selMi: 'Min',
    shT: 'Share with a friend', again: 'Check my match with someone else', shSend: 'Send match to a friend', shCard: 'Save result card', shPriv: 'The link contains your birth info. Send it only to people you trust.', shCopied: 'Link copied. Paste it to your friend.', shSaved: 'Card saved.', shText: (sc: number, hl: string) => `Yeoui read our match at ${sc}/100 — "${hl}". Check yours with me!`,
    invT: (n: string) => (n ? `${n} sent you a match` : 'A friend sent you a match'), invD: 'Enter your birth date and see your match right away. No sign-up needed.', invGo: 'See our match',
    starTag: 'WORLD', starT: 'How the world reads itself', starD: 'Your personality by Western star signs — Sun, Moon and Rising in plain words.', starCta: 'Try star signs',
    starPageT: 'Star sign taste', starPageD: 'Just your birthday. The most popular way to read a chart worldwide.', starGo: 'See my star signs', starMore: 'See my Saju too',
    introT: 'Korea’s way to know yourself: Saju', introD: 'Koreans check their “Four Pillars” around New Year and before big life choices. Your birth date and time become a chart — explained in plain words.',
    introL: ['Four Pillars from your birth date and time', 'Plain-language results, no jargon', 'Free taste — no sign-up needed'], introCta: 'Try my free Saju',
    freeSub: 'No name, no sign-up. Tell Yeoui your birthday for a quick peek!',
    freeGo: 'See my free reading',
    freeBack: 'Enter again',
    todayLockT: "Today's fortune",
    todayLockD: 'Opens every day when you log in',
    todayLockB: 'Open as beta trial',
    svcTitle: 'All readings',
    homeBannerT: 'Ask Yeoui',
    homeBannerD: 'Write your worry and get the timing pointed out',
    homeBannerB: 'Ask now',
    homeBeta: 'Free during beta',
    quick: [['today', '運', "Today's fortune"], ['solo', '命', 'My chart'], ['ask', '問', 'Ask'], ['match', '緣', 'Match'], ['shop', '籤', 'Readings']],
    newTitle: 'New readings',
    newItems: [['NEW', 'Face reading', 'Read your face from one photo', 'Free beta', 'face'], ['NEW', '2027 New Year reading', 'The Ding-Wei year, month by month', 'Coming in December', 'shop'], ['NEW', 'Compatibility', 'Why you click — and where you clash', 'Free beta', 'match']],
    hotTitle: 'Popular now',
    hotItems: [["Today's fortune", 'Free', 'today'], ['Free chart reading', 'Free', 'solo'], ['Ask about your worry', 'Free beta', 'ask'], ['Compatibility', 'Free beta', 'match'], ['This year, month by month', '₩990', 'shop'], ['Money & career', '₩990', 'shop'], ['Full life report', '₩9,900', 'shop']],
    pieceTitle: 'A piece of Saju',
    pieces: ['The five elements are Wood, Fire, Earth, Metal and Water. Having a lot or none is not bad; how you use it shapes you.', 'The Day Master is the heaven character of your birth day. It stands for "you".', 'Luck cycles change about every ten years.'],
    ask: 'Ask',
    shop: 'Shop',
    solo: 'My chart',
    match: 'Match',
    me: 'Me',
    fav: 'Them',
    date: 'Birth date',
    time: 'Birth time',
    unknownTime: "I don't know the time",
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    place: 'Birthplace',
    placeHint: 'Search a city (e.g. Seoul, Tokyo, New York)',
    nm: 'Name or nickname (optional)', nmHint: 'We use this name in your result. It is not stored on a server.',
    acc: 'Reading accuracy', accDate: 'Birth date', accTime: 'Birth time', accPlace: 'Birthplace',
    accTimeTip: 'Knowing your birth time adds +25%. Ask family, or check your birth certificate.',
    accPlaceTip: 'If you were not born in Seoul, change the city (+10%) — sunrise differs by place. If Seoul is right, leave it.',
    accFull: 'Great! This gives the most accurate reading.',
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
    <div class="hero"><img class="dmascot" src="${art('daily-' + Math.min(5, Math.max(1, Math.round(v.stars))))}" alt="" width="150" height="150">
      <div class="stars" role="img" aria-label="${v.stars}/5">${starRow(v.stars)}</div>
      <div class="slabel">${esc(v.starLabel)}</div>
    </div>
    <h2 class="dh">${esc(v.title)}</h2>
    <p class="dbody">${esc(v.body)}</p>
    ${v.event ? `<p class="devent">${esc(v.event)}</p>` : ''}
    <div class="dcats">${v.cats.map((c) => `<div class="dcat"><div class="cn">${esc(c.name)}</div><div class="cs" aria-label="${c.stars}/5">${starRow(c.stars)}</div><p>${esc(c.line)}</p></div>`).join('')}</div>
    <p class="dtip">✦ ${esc(v.tip)}</p>
    ${(() => {
      const ni = r.input as Parameters<typeof natal>[0]
      const mt = natal({ ...ni, year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour: 12, minute: 0, unknownTime: true }).planets.Moon.sign
      const ac = astroTodayCard(natal(ni), mt, lang)
      return `<h3 class="dh">${esc(ac.title)}</h3>${ac.paras.map((q) => `<p class="dbody">${esc(q)}</p>`).join('')}`
    })()}
    <h3>${esc(v.lucky.title)}</h3>
    <div class="lucky">${v.lucky.items.map((i) => `<div><span>${esc(i.label)}</span><b>${esc(i.value)}</b></div>`).join('')}</div>
    <p class="note">${esc(v.disclaimer)}</p>
  </article>
  <p class="mine">${esc(pr.y + '.' + pr.m + '.' + pr.d)} · ${esc(pr.place)} <button type="button" id="reset" class="linkbtn">${x.change}</button></p>`
  document.getElementById('prev')!.onclick = () => { dayOffset--; showToday() }
  document.getElementById('next')!.onclick = () => { dayOffset++; showToday() }
  document.getElementById('reset')!.onclick = () => { clearProfile(); render() }
}




function navHtml(): string {
  const x = t()
  const items: [Mode, string, string][] = [['home', '家', x.home], ['today', '運', x.today], ['ask', '問', x.ask], ['solo', '命', x.solo], ['shop', '籤', x.shop]]
  return `<nav class="bnav" aria-label="menu">${items.map(([m, hj, label]) => `<button type="button" data-mode="${m}" class="${mode === m ? 'on' : ''}" ${mode === m ? 'aria-current="page"' : ''}><span class="hj">${hj}</span>${esc(label)}</button>`).join('')}</nav>`
}

function homeHtml(): string {
  const x = t()
  const news = x.newItems.map(([badge, title, desc, when, go]) => `<button type="button" class="newc" data-mode="${go}"><span class="badge">${badge}</span><b>${esc(title)}</b><span>${esc(desc)}</span><em>${esc(when)}</em></button>`).join('')
  const hot = x.hotItems.map(([name, price, go], i) => `<li><button type="button" data-mode="${go}"><span class="rk">${i + 1}</span><span class="nm">${esc(name)}</span><span class="pr ${/무료|Free/.test(price) ? 'free' : ''}">${esc(price)}</span></button></li>`).join('')
  const svc = [['today', '運', x.quick[0][2]], ['solo', '命', x.quick[1][2]], ['ask', '問', x.quick[2][2]], ['match', '緣', x.quick[3][2]], ['face', '相', x.faceName], ...x.shopItems.slice(1).map(([, name]) => ['shop', '籤', name])]
    .map(([go, hj, name]) => `<li><button type="button" data-mode="${go}"><span class="hj">${hj}</span><span class="nm">${esc(name)}</span><span class="chev">›</span></button></li>`).join('')
  const pieces = x.pieces.map((p) => `<li>${esc(p)}</li>`).join('')
  const promo = lang === 'ko'
    ? `<section class="card promo"><img class="pimg" src="${art('dragon-orb')}" alt="" width="84" height="84"><div><span class="badge">${esc(x.starTag)}</span><h2>${esc(x.starT)}</h2><p>${esc(x.starD)}</p><button type="button" class="bgo" data-mode="star">${esc(x.starCta)}</button></div></section>`
    : `<section class="card promo intro"><img class="pimg" src="${art('ui-teach')}" alt="" width="96" height="96"><div><h2>${esc(x.introT)}</h2><p>${esc(x.introD)}</p><ul>${x.introL.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div></section>`
  return `
  ${lang === 'ko' ? '' : promo}
  <section class="card freebox" aria-label="${esc(x.freeTitle)}">
    <div class="freehead"><div><h2>${esc(x.freeTitle)}</h2><p class="meta">${esc(x.freeSub)}</p></div><img class="fmascot" src="${art('dragon-cheer')}" alt="" width="92" height="92"></div>
    <form id="freeform" novalidate>
      ${dateField('fdate')}
      <div class="row">
        ${timeField('ftime')}
        <label class="chk"><input type="checkbox" name="funk"> ${x.unknownTime}</label>
      </div>
      <div class="row">
        <span class="gl">${x.gender}</span>
        <div class="seg" role="radiogroup" aria-label="${x.gender}">
          <label><input type="radio" name="fg" value="F" checked><span>${x.female}</span></label>
          <label><input type="radio" name="fg" value="M"><span>${x.male}</span></label>
        </div>
      </div>
      ${cityField('f')}
      <p class="err" id="ferr" role="alert"></p>
      <button class="go" type="submit">${esc(x.freeGo)}</button>
    </form>
  </section>
  <section class="lockcard" aria-label="${esc(x.todayLockT)}">
    <div class="lk1"><img class="lockic" src="${art('ui-lock')}" alt="" width="52" height="52"><div><b>${esc(x.todayLockT)}</b><span>${esc(x.todayLockD)}</span></div></div>
    <div class="dim" aria-hidden="true">★★★★☆</div>
    <button type="button" class="bgo" data-mode="today">${esc(x.todayLockB)}</button>
  </section>
  <section class="banner" aria-label="${esc(x.homeBannerT)}">
    <div class="bmain"><img class="mascot" src="${art('dragon-hello')}" alt="" width="104" height="104"><div><h2>${esc(x.homeBannerT)}</h2><p>${esc(x.homeBannerD)}</p></div></div>
    <div class="brow"><span class="beta">${esc(x.homeBeta)}</span><button type="button" class="bgo" data-mode="ask">${esc(x.homeBannerB)}</button></div>
  </section>
  ${lang === 'ko' ? promo : ''}
  <h3 class="sec">${esc(x.hotTitle)}</h3>
  <ol class="hot">${hot}</ol>
  <h3 class="sec">${esc(x.newTitle)}</h3>
  <div class="news">${news}</div>
  <h3 class="sec">${esc(x.svcTitle)}</h3>
  <ul class="svc">${svc}</ul>
  <h3 class="sec">${esc(x.pieceTitle)}</h3>
  <ul class="pieces">${pieces}</ul>`
}

let freePerson: Person | null = null
function showFree() {
  const x = t()
  const out = document.getElementById('out')!
  if (!freePerson) { mode = 'home'; render(); return }
  const r = freePerson.result
  const a = analyze(r)
  const dayBranch = r.pillars[1].pillar.branch
  const dg = GROUP_OF[sipsinOf(a.dayStem, mainStemOf(dayBranch))]
  const tone = luckAt(r, a, new Date()).year.tone
  const base = freeCards(r, a, lang, dg, tone)
  const ac = astroFreeCard(natal(r.input as Parameters<typeof natal>[0]), lang)
  const cards = [base[0], { title: ac.title, head: '', body: ac.paras }, ...base.slice(1)] as typeof base
  const fp = freePool(lang)
  out.innerHTML = `${chartHtml(freePerson)}
  ${cards.map((c, i) => `<article class="rcard${i === 0 ? ' lead' : ''}"><h3>${esc(c.title)}</h3>${c.head ? `<p class="fhead">${esc(c.head)}</p>` : ''}${c.body.map((b) => `<p>${esc(b)}</p>`).join('')}</article>`).join('')}
  <article class="card"><h3>${esc(fp.t.next)}</h3><div class="row"><button class="go" data-mode="today" type="button">${esc(fp.t.todayCta)}</button><button class="go ghost" data-mode="ask" type="button">${esc(fp.t.askCta)}</button></div></article>
  <p class="note demo">${esc(fp.t.free)}</p>
  <button class="go ghost" id="freeback" type="button">${esc(x.freeBack)}</button>`
  out.querySelectorAll<HTMLElement>('[data-mode]').forEach((b) => (b.onclick = () => { mode = b.dataset.mode as Mode; window.scrollTo(0, 0); render() }))
  document.getElementById('freeback')!.onclick = () => { mode = 'home'; render() }
}

/** 연·월·일 따로 고르는 칸. 값은 숨은 input(name)에 YYYY-MM-DD로 모은다. */
function dateField(name: string): string {
  const x = t()
  const yNow = new Date().getFullYear()
  const ys = Array.from({ length: yNow - 1919 }, (_, i) => yNow - i).map((v) => `<option value="${v}">${v}</option>`).join('')
  const ms = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')
  const ds = Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')
  return `<div class="dsel" data-dt="date"><span class="lbl">${x.date}</span><div class="sels">
    <select aria-label="${x.selY}" data-k="y"><option value="">${x.selY}</option>${ys}</select>
    <select aria-label="${x.selM}" data-k="m"><option value="">${x.selM}</option>${ms}</select>
    <select aria-label="${x.selD}" data-k="d"><option value="">${x.selD}</option>${ds}</select></div>
    <input type="hidden" name="${name}"></div>`
}
/** 시·분 따로 고르는 칸(00~23시). 값은 숨은 input(name)에 HH:MM. */
function timeField(name: string): string {
  const x = t()
  const hs = Array.from({ length: 24 }, (_, i) => `<option value="${i}">${String(i).padStart(2, '0')}</option>`).join('')
  const mi = Array.from({ length: 60 }, (_, i) => `<option value="${i}">${String(i).padStart(2, '0')}</option>`).join('')
  return `<div class="dsel grow" data-dt="time"><span class="lbl">${x.time}</span><div class="sels">
    <select aria-label="${x.selH}" data-k="h"><option value="">${x.selH}</option>${hs}</select>
    <select aria-label="${x.selMi}" data-k="mi">${mi}</select></div>
    <input type="hidden" name="${name}"></div>`
}
/** 위 두 칸을 동작시킨다. 값이 바뀌면 숨은 input에 input 이벤트를 보낸다. */
function bindDT(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('.dsel').forEach((box) => {
    const hid = box.querySelector<HTMLInputElement>('input[type=hidden]')!
    const sel = (k: string) => box.querySelector<HTMLSelectElement>(`select[data-k=${k}]`)!
    const pad = (n: string | number) => String(n).padStart(2, '0')
    const sync = () => {
      if (box.dataset.dt === 'date') {
        const dsel = sel('d'), y = +sel('y').value, m = +sel('m').value
        const max = y && m ? new Date(y, m, 0).getDate() : 31
        Array.from(dsel.options).forEach((o) => { if (o.value) o.hidden = o.disabled = +o.value > max })
        if (+dsel.value > max) dsel.value = String(max)
        hid.value = y && m && dsel.value ? `${y}-${pad(m)}-${pad(dsel.value)}` : ''
      } else {
        hid.value = sel('h').value ? `${pad(sel('h').value)}:${pad(sel('mi').value || 0)}` : ''
      }
      hid.dispatchEvent(new Event('input', { bubbles: true }))
    }
    box.querySelectorAll('select').forEach((e) => e.addEventListener('change', sync))
  })
}
const setDT = (root: ParentNode, dis: boolean) => root.querySelectorAll<HTMLSelectElement>('.dsel[data-dt=time] select').forEach((e) => (e.disabled = dis))

/** 출생지 입력칸(홈 무료풀이·별자리용). 기본값은 서울. */
function cityField(id: string): string {
  const x = t()
  return `<label>${x.place}<input type="text" name="${id}city" list="cities-${id}" placeholder="${x.placeHint}" autocomplete="off" value="${esc(formatCityName(SEOUL))}"></label><datalist id="cities-${id}"></datalist>`
}
function bindCity(id: string) {
  const input = document.querySelector<HTMLInputElement>(`input[name=${id}city]`)
  const list = document.getElementById(`cities-${id}`)
  if (!input || !list) return
  input.oninput = () => { list.innerHTML = filterCities(input.value).map((c) => `<option value="${esc(formatCityName(c))}"></option>`).join('') }
}
/** 입력한 도시를 찾는다. 비어 있으면 서울, 못 찾으면 null */
function pickCity(f: HTMLFormElement, id: string): { lat: number; lon: number; tz: string; name: string } | null {
  const typed = (f.elements.namedItem(`${id}city`) as HTMLInputElement).value.trim()
  if (!typed) return { lat: SEOUL.lat, lon: SEOUL.lon, tz: 'Asia/Seoul', name: formatCityName(SEOUL) }
  const found = filterCities(typed)
  const c = found.find((k) => formatCityName(k) === typed) ?? found[0]
  if (!c) return null
  return { lat: c.lat, lon: c.lon, tz: tzlookup(c.lat, c.lon), name: formatCityName(c) }
}

function faceHtml(): string {
  const x = t()
  return `<section class="card" aria-label="${esc(x.faceT)}">
    <div class="freehead"><div><h2>${esc(x.faceT)}</h2><p class="meta">${esc(x.faceD)}</p></div><img class="fmascot" src="${art('dragon-think')}" alt="" width="92" height="92"></div>
    <ul class="tips">${x.faceTips.map((v: string) => `<li>${esc(v)}</li>`).join('')}</ul>
    <div class="faceact">
      <label class="go filebtn"><input type="file" id="facecam" accept="image/*" capture="user" hidden>${esc(x.faceCam)}</label>
      <label class="go filebtn ghost"><input type="file" id="facealb" accept="image/*" hidden>${esc(x.faceAlbum)}</label>
    </div>
    <p class="note">${esc(x.faceKept)}</p>
    <p class="err" id="faceerr" role="alert"></p>
  </section>
  <section id="faceout" aria-live="polite"></section>`
}

const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

async function onFacePick(file: File) {
  const x = t()
  const err = document.getElementById('faceerr')!, out = document.getElementById('faceout')!
  err.textContent = ''
  out.innerHTML = `<div class="card"><p class="meta">${esc(x.faceBusy)}</p></div>`
  try {
    const cv = await fileToCanvas(file)
    const found = await findFace(cv)
    if (found === 'none') { out.innerHTML = ''; err.textContent = x.faceNone; return }
    if (found === 'many') { out.innerHTML = ''; err.textContent = x.faceMany; return }
    const m = measure(found)
    if (m.yaw > 0.14) { out.innerHTML = ''; err.textContent = x.faceSide; return }
    if (Math.abs(m.roll) > 18) { out.innerHTML = ''; err.textContent = x.faceTilt; return }
    // 사진 위에 얼굴선을 그린다(사진은 화면에만 쓰고 저장하지 않는다)
    const g = cv.getContext('2d')!
    g.strokeStyle = 'rgba(106,38,35,.85)'; g.lineWidth = Math.max(2, cv.width / 260); g.beginPath()
    FACE_OVAL.forEach((i, k) => { const p = found.pts[i]; k ? g.lineTo(p.x * cv.width, p.y * cv.height) : g.moveTo(p.x * cv.width, p.y * cv.height) })
    g.closePath(); g.stroke()
    const r = readFace(m, lang)
    const debug = /[?&]debug\b/.test(location.search)
    out.innerHTML = `<article class="rcard lead faceres"><div class="fphoto"></div><h3>${esc(r.headline)}</h3><p>${esc(r.cards[0].paras[0])}</p>
      <div class="chips2">${r.chips.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
      <div class="axes">${r.axes.map((a) => `<div class="ax"><span>${esc(a.label)}</span><i class="tr"><b style="width:${a.value}%"></b></i><em>${a.value}</em></div>`).join('')}</div></article>
      ${r.cards.slice(1).map((c) => `<article class="rcard"><h3>${esc(c.title)}</h3>${c.paras.map((p) => `<p>${esc(p)}</p>`).join('')}</article>`).join('')}
      <p class="note">${esc(r.note)}</p>
      ${debug ? `<pre class="dbg">${r.debug.map((d) => `${d.k}\t${d.v}\t${d.z}`).join('\n')}</pre>` : ''}
      <article class="card"><div class="row"><button class="go" type="button" data-mode="solo">${esc(x.faceToSaju)}</button></div><div class="row"><label class="go filebtn ghost"><input type="file" id="faceagain" accept="image/*" hidden>${esc(x.faceAgain)}</label></div></article>`
    cv.className = 'fcanvas'
    out.querySelector('.fphoto')!.append(cv)
    out.querySelectorAll<HTMLElement>('[data-mode]').forEach((b) => (b.onclick = () => { mode = b.dataset.mode as Mode; window.scrollTo(0, 0); render() }))
    document.getElementById('faceagain')?.addEventListener('change', (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) void onFacePick(f) })
    out.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch {
    out.innerHTML = ''; err.textContent = x.faceFail
  }
}

function starHtml(): string {
  const x = t()
  return `<section class="card" aria-label="${esc(x.starPageT)}">
    <div class="freehead"><div><h2>${esc(x.starPageT)}</h2><p class="meta">${esc(x.starPageD)}</p></div><img class="fmascot" src="${art('dragon-orb')}" alt="" width="92" height="92"></div>
    <form id="starform" novalidate>
      ${dateField('sdate')}
      <div class="row">
        ${timeField('stime')}
        <label class="chk"><input type="checkbox" name="sunk" checked> ${x.unknownTime}</label>
      </div>
      ${cityField('s')}
      <p class="err" id="serr" role="alert"></p>
      <button class="go" type="submit">${esc(x.starGo)}</button>
    </form>
  </section>
  <section id="sout"></section>`
}

function onStarSubmit(e: Event) {
  e.preventDefault()
  const x = t()
  const f = e.target as HTMLFormElement
  const err = document.getElementById('serr')!
  const date = (f.elements.namedItem('sdate') as HTMLInputElement).value
  const timeV = (f.elements.namedItem('stime') as HTMLInputElement).value
  const unk = (f.elements.namedItem('sunk') as HTMLInputElement).checked || !timeV
  if (!date) { err.textContent = x.errDate; return }
  const city = pickCity(f, 's')
  if (!city) { err.textContent = x.errPlace; return }
  err.textContent = ''
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = unk ? [12, 0] : timeV.split(':').map(Number)
  const ac = astroFreeCard(natal({ year: y, month: m, day: d, hour: hh, minute: mm, latitude: city.lat, longitude: city.lon, timezone: city.tz, unknownTime: unk }), lang)
  const out = document.getElementById('sout')!
  out.innerHTML = `<article class="rcard lead"><h3>${esc(ac.title)}</h3>${ac.paras.map((p) => `<p>${esc(p)}</p>`).join('')}</article>
  <article class="card"><div class="row"><button class="go" type="button" data-mode="home">${esc(x.starMore)}</button></div></article>`
  out.querySelectorAll<HTMLElement>('[data-mode]').forEach((b) => (b.onclick = () => { mode = b.dataset.mode as Mode; window.scrollTo(0, 0); render() }))
}

function onFreeSubmit(e: Event) {
  e.preventDefault()
  const x = t()
  const f = e.target as HTMLFormElement
  const err = document.getElementById('ferr')!
  const date = (f.elements.namedItem('fdate') as HTMLInputElement).value
  const timeV = (f.elements.namedItem('ftime') as HTMLInputElement).value
  const unk = (f.elements.namedItem('funk') as HTMLInputElement).checked
  const gender = (f.querySelector('input[name=fg]:checked') as HTMLInputElement).value as 'M' | 'F'
  if (!date) { err.textContent = x.errDate; return }
  if (!unk && !timeV) { err.textContent = x.errTime; return }
  const city = pickCity(f, 'f')
  if (!city) { err.textContent = x.errPlace; return }
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = unk ? [12, 0] : timeV.split(':').map(Number)
  try {
    const result = calculateSaju({ year: y, month: m, day: d, hour: hh, minute: mm, gender, unknownTime: unk, latitude: city.lat, longitude: city.lon, timezone: city.tz })
    freePerson = { label: x.me, placeName: city.name, result }
    saveProfile(freePerson)
    mode = 'free'
    window.scrollTo(0, 0)
    render()
  } catch { err.textContent = x.errCalc }
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
let invite: Invite | null = readInvite(location.hash)
if (invite) mode = 'invite'
let lastMatch: { people: Person[]; m: ReturnType<typeof matchReading> } | null = null
let dayOffset = 0
let readLang: Lang = lang
const cityState: Record<string, City> = { a: SEOUL, b: SEOUL }

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const t = () => T[lang]

function personForm(id: 'a' | 'b', label: string): string {
  const x = t()
  return `<fieldset class="card person" data-p="${id}">
    <legend class="tag">${esc(label)}</legend>
    <label>${x.nm}<input type="text" name="nm" maxlength="12" autocomplete="off"></label>
    <p class="note nmhint">${x.nmHint}</p>
    ${dateField('date')}
    <div class="row">
      ${timeField('time')}
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
    <div class="acc" aria-live="polite"><div class="accrow"><b>${x.acc}</b><span class="accn">60%</span></div><i class="tr"><b class="accbar"></b></i><p class="note acctip"></p></div>
  </fieldset>`
}

function render() {
  const x = t()
  document.documentElement.lang = lang
  document.title = x.title
  app.innerHTML = `
  <header class="top">
    <svg class="mtn" viewBox="0 0 560 200" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><defs><filter id="wash" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="2.4"/></filter><filter id="rough" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9"/><feGaussianBlur stdDeviation=".7"/></filter><linearGradient id="peak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1c19" stop-opacity=".95"/><stop offset=".7" stop-color="#1e1c19" stop-opacity=".35"/><stop offset="1" stop-color="#1e1c19" stop-opacity="0"/></linearGradient><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#ece5d2" stop-opacity="0"/><stop offset="1" stop-color="#ece5d2" stop-opacity="1"/></linearGradient></defs><path d="M0 128 L38 96 L70 110 L118 62 L160 104 L206 78 L250 116 L300 72 L352 112 L402 84 L452 118 L504 90 L560 110 V200 H0Z" fill="url(#peak)" opacity=".3" filter="url(#wash)"/><ellipse cx="190" cy="120" rx="230" ry="13" fill="#ece5d2" opacity=".8" filter="url(#wash)"/><path d="M0 156 L46 120 L92 142 L146 88 L206 146 L262 108 L334 156 L398 114 L458 150 L512 112 L560 138 V200 H0Z" fill="url(#peak)" opacity=".55" filter="url(#rough)"/><ellipse cx="400" cy="150" rx="210" ry="11" fill="#ece5d2" opacity=".75" filter="url(#wash)"/><path d="M0 184 L64 154 L126 174 L192 146 L262 180 L340 150 L424 180 L498 156 L560 176 V200 H0Z" fill="#1e1c19" opacity=".62" filter="url(#rough)"/><path d="M96 168 q3-16 7-4 q2-10 6 0 q-2 6-6 8z M470 170 q3-14 7-3 q3-9 6 1 q-3 6-7 7z" fill="#1e1c19" opacity=".7"/><rect width="560" height="200" fill="url(#fade)"/></svg><svg class="emblem ${mode === 'home' ? '' : 'sm'}" viewBox="0 0 80 80" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="40" cy="40" r="36"/><circle cx="40" cy="40" r="31" stroke-opacity=".45"/><path d="M52 40a14 14 0 1 1-14-14 11 11 0 0 0 14 14z" fill="currentColor" stroke="none"/><circle cx="52" cy="24" r="1.6" fill="currentColor" stroke="none"/><circle cx="24" cy="54" r="1.2" fill="currentColor" stroke="none"/></svg>
    <h1>${x.title}</h1>
    ${mode === 'home' ? `<p class="sub">${esc(x.sub).replace(/\n/g, '<br>')}</p>` : ''}
    <button class="langbtn" id="lang" type="button">${lang === 'ko' ? 'EN' : '한국어'}</button>
  </header>
  ${mode === 'home' ? homeHtml() : mode === 'face' ? faceHtml() : mode === 'star' ? starHtml() : mode === 'free' ? '<section id="out"></section>' : mode === 'shop' ? shopHtml() : (mode === 'today' || mode === 'ask') && loadProfile() ? '<section id="out"></section>' : `<form id="form" novalidate>
    ${mode === 'invite' && invite ? `<section class="card promo"><img class="pimg" src="${art('dragon-hello')}" alt="" width="84" height="84"><div><h2>${esc(x.invT(invite.n))}</h2><p>${esc(x.invD)}</p></div></section>` : ''}
    ${personForm('a', x.me)}
    ${mode === 'match' ? personForm('b', x.fav) : ''}
    <p class="err" id="err" role="alert"></p>
    <button class="go" type="submit">${mode === 'solo' ? x.go : mode === 'today' || mode === 'ask' ? x.todayGo : mode === 'invite' ? x.invGo : x.goMatch}</button>
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
    const date = fs.querySelector<HTMLInputElement>('input[name=date]')!
    const accN = fs.querySelector<HTMLElement>('.accn')!, accBar = fs.querySelector<HTMLElement>('.accbar')!, accTip = fs.querySelector<HTMLElement>('.acctip')!
    let placeTouched = false
    const updAcc = () => {
      const x = t()
      const hasTime = !unk.checked && !!time.value, hasPlace = placeTouched
      const v = (date.value ? 60 : 0) + (hasTime ? 25 : 0) + (hasPlace ? 10 : 0) + 5
      accN.textContent = `${v}%`; accBar.style.width = `${v}%`
      accTip.textContent = !hasTime ? x.accTimeTip : !hasPlace ? x.accPlaceTip : x.accFull
    }
    unk.onchange = () => { time.disabled = unk.checked; setDT(fs, unk.checked); updAcc() }
    date.oninput = updAcc; time.oninput = updAcc
    updAcc()
    input.oninput = () => {
      const found = filterCities(input.value)
      list.innerHTML = found.map((c) => `<option value="${esc(formatCityName(c))}"></option>`).join('')
      const exact = found.find((c) => formatCityName(c) === input.value)
      if (exact) cityState[id] = exact
      placeTouched = true
      updAcc()
    }
  })
  document.getElementById('form')?.addEventListener('submit', onSubmit)
  ;['facecam', 'facealb'].forEach((id) => document.getElementById(id)?.addEventListener('change', (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) void onFacePick(f) }))
  bindDT(app); bindCity('f'); bindCity('s')
  ;(['funk', 'sunk'] as const).forEach((n) => {
    const c = document.querySelector<HTMLInputElement>(`input[name=${n}]`)
    if (c) { const f = () => setDT(c.closest('form')!, c.checked); c.onchange = f; f() }
  })
  document.getElementById('freeform')?.addEventListener('submit', onFreeSubmit)
  document.getElementById('starform')?.addEventListener('submit', onStarSubmit)
  if (mode === 'free') showFree()
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
    const nm = fs.querySelector<HTMLInputElement>('input[name=nm]')!.value.trim().slice(0, 12)
    return { label: nm || label, placeName: formatCityName(city), result }
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
  if (mode === 'invite' && invite) {
    try {
      const result = calculateSaju({ year: invite.y, month: invite.m, day: invite.d, hour: invite.hh, minute: invite.mm, gender: invite.g, unknownTime: invite.u, latitude: invite.la, longitude: invite.lo, timezone: invite.tz })
      people.push({ label: invite.n || x.fav, placeName: '', result })
      showResult(people, matchHtml(people))
    } catch { err.textContent = x.errCalc }
    return
  }
  if (mode === 'match') {
    const b = readPerson('b', x.fav)
    if (typeof b === 'string') { err.textContent = b; return }
    people.push(b)
    showResult(people, matchHtml(people))
    return
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
      <div class="ss">${hide ? '?' : esc(lang === 'ko' ? (SIP_KO[d.stemSipsin] ?? d.stemSipsin) : d.stemSipsin)}</div>
      <div class="ch ${se ? EL_CLASS[se] : ''}">${hide ? '?' : d.pillar.stem}</div>
      <div class="ch ${be ? EL_CLASS[be] : ''}">${hide ? '?' : d.pillar.branch}</div>
      <div class="ss">${hide ? '?' : esc(lang === 'ko' ? (SIP_KO[d.branchSipsin] ?? d.branchSipsin) : d.branchSipsin)}</div>
      <div class="us">${hide ? '' : esc(lang === 'ko' ? (UN_KO[d.unseong] ?? d.unseong) : d.unseong)}</div>
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

function matchHtml(people: Person[]): string {
  const mp = matchPool(lang)
  const [A, B] = people
  const m = matchReading(A.result, analyze(A.result), B.result, analyze(B.result), lang)
  lastMatch = { people, m }
  const [lead, ...rest0] = m.cards
  const ac = astroMatchCard(natal(A.result.input as Parameters<typeof natal>[0]), natal(B.result.input as Parameters<typeof natal>[0]), lang)
  const rest = [...rest0, { kind: 'astro', title: ac.title, paras: ac.paras } as (typeof rest0)[number]]
  return `<article class="rcard lead score">
    <img class="smascot" src="${art('match-sprite')}" alt="" width="110" height="110">
    <div class="sc"><b>${m.score}</b><span>${esc(mp.ui.ofHundred)}</span><small>${esc(mp.ui.score)}</small></div>
    <h3>${esc(lead.title)}</h3>${lead.paras.map((p) => `<p>${esc(p)}</p>`).join('')}
    <div class="axes">${m.axes.slice(1).map((a) => `<div class="ax"><span>${esc(a.label)}</span><i class="tr"><b style="width:${a.value}%"></b></i><em>${a.value}</em></div>`).join('')}</div>
    <ul class="chips2">${m.chips.map((c) => `<li><small>${esc(c.k)}</small>${esc(c.v)}</li>`).join('')}</ul>
  </article>
  ${rest.map((c) => `<article class="rcard"><h3>${esc(c.title)}</h3>${c.paras.map((p) => `<p>${esc(p)}</p>`).join('')}${c.list ? `<ul>${c.list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}</article>`).join('')}
  <p class="note">${esc(mp.ui.note)}</p>
  <article class="card share"><h3>${esc(t().shT)}</h3>
    ${invite ? `<div class="row"><button class="go" type="button" id="again">${esc(t().again)}</button></div>` : ''}
    <div class="row"><button class="go${invite ? ' ghost' : ''}" type="button" id="shsend">${esc(t().shSend)}</button></div>
    <div class="row"><button class="go ghost" type="button" id="shcard">${esc(t().shCard)}</button></div>
    <p class="note">${esc(t().shPriv)}</p><p class="ok" id="shok" role="status"></p></article>`
}

function showResult(people: Person[], lead = '') {
  const x = t()
  const out = document.getElementById('out')!
  const render2 = () => buildPrompt(mode === 'match' ? 'match' : 'solo', readLang, people)
  out.innerHTML = `${lead}${lead ? `<details class="charts"><summary>${esc(matchPool(lang).ui.charts)}</summary>${people.map(chartHtml).join('')}</details>` : people.map(chartHtml).join('')}
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
  bindShare()
  out.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function bindShare() {
  const send = document.getElementById('shsend'), card = document.getElementById('shcard')
  if (!send || !card || !lastMatch) return
  const x = t(), ok = document.getElementById('shok')!
  const { people, m } = lastMatch
  document.getElementById('again')?.addEventListener('click', () => { history.replaceState(null, '', location.pathname); invite = null; mode = 'match'; render(); window.scrollTo(0, 0) })
  send.onclick = async () => {
    const a = people[0]
    const url = makeInviteUrl(a.result.input as Parameters<typeof makeInviteUrl>[0], a.label === x.me ? '' : a.label)
    const text = x.shText(m.score, m.headline)
    try {
      if (navigator.share) { await navigator.share({ title: x.title, text, url }); return }
    } catch (e) { if ((e as Error).name === 'AbortError') return }
    try { await navigator.clipboard.writeText(`${text}\n${url}`) } catch {
      const ta = document.createElement('textarea'); ta.value = `${text}\n${url}`; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove()
    }
    ok.textContent = x.shCopied
  }
  card.onclick = async () => {
    try {
      const blob = await makeCard({ score: m.score, headline: m.headline, axes: m.axes, brand: x.title, foot: 'feedbuddi.com' })
      const file = new File([blob], 'feedbuddi-match.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: x.title }); return }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'feedbuddi-match.png'; document.body.append(a); a.click(); a.remove()
      ok.textContent = x.shSaved
    } catch (e) { if ((e as Error).name !== 'AbortError') ok.textContent = '' }
  }
}

render()

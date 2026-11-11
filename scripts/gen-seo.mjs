// 검색에 잡히는 설명 페이지(정적 HTML)와 sitemap.xml을 public/ 에 만든다.
// 내용은 아래 PAGES 에서만 고치면 된다. 실행: node scripts/gen-seo.mjs
import { mkdirSync, writeFileSync } from 'node:fs'

const ORIGIN = 'https://saju.feedbuddi.com'
const SITE = '용용사주'
const CONTACT = 'followonder99@gmail.com'

const PAGES = [
  {
    slug: 'today',
    title: '오늘의 운세 – 생년월일로 보는 하루 흐름',
    desc: '생년월일만 넣으면 오늘 하루의 기운과 조심할 점, 잘 맞는 일을 쉬운 말로 알려 드려요. 로그인 없이 무료.',
    h1: '오늘의 운세, 사주로 보면 이래요',
    cta: ['오늘의 운세 보러 가기', '/'],
    body: [
      ['사주로 보는 오늘의 운세란?', ['사주는 태어난 해·달·날·시를 네 개의 기둥으로 세운 뒤, 각 기둥을 목·화·토·금·수 다섯 기운으로 나눠 읽는 방법이에요. 오늘의 운세는 이 타고난 기운에 "오늘 날짜가 가진 기운(일진)"이 어떻게 닿는지를 살펴서 하루의 흐름을 짚어요.', '별자리나 띠로 보는 운세는 같은 날 같은 결과가 많은 사람에게 나가지만, 사주는 생년월일시마다 오늘과 닿는 모양이 달라서 사람마다 다른 풀이가 나와요.']],
      ['무엇을 알려 주나요?', ['오늘 힘이 되는 기운과 쉬어 가야 할 기운, 사람을 만날 때 신경 쓸 점, 일이나 공부에서 서두르면 좋을지 차분히 가면 좋을지 같은 흐름을 말해 드려요. 좋다 나쁘다로 단정하지 않고 "이런 경향이 있으니 이렇게 해 보세요"라는 말투로 안내해요.']],
      ['더 정확하게 보려면', ['태어난 시간까지 넣으면 네 기둥이 모두 세워져서 풀이가 더 촘촘해져요. 시간을 모르면 모르는 대로 세 기둥만으로도 볼 수 있어요.']],
    ],
    faq: [['오늘의 운세는 매일 바뀌나요?', '네. 오늘 날짜의 기운이 매일 달라지기 때문에 같은 사람도 날마다 다른 풀이가 나와요.'], ['태어난 시간을 몰라도 되나요?', '괜찮아요. 시간을 모르면 연·월·일 세 기둥으로 풀이해요.']],
  },
  {
    slug: 'newyear-2027',
    title: '2027 정미년 신년운세 – 내 사주로 보는 한 해 흐름',
    desc: '2027년 정미년의 기운과 내 사주가 어떻게 만나는지, 월별 흐름과 조심할 시기를 쉬운 말로 풀어 드려요.',
    h1: '2027 정미년 신년운세',
    cta: ['내 신년운세 보기', '/'],
    body: [
      ['2027년은 어떤 해인가요?', ['2027년은 간지로 정미년(丁未年)이에요. 위 글자 정(丁)은 음의 불, 아래 글자 미(未)는 음의 흙에 해당해요. 해마다 이 기운이 사람마다 다른 사주와 만나서 도움이 되는 사람도, 속도를 늦춰야 하는 사람도 생겨요.', '같은 해라도 내 사주에 부족한 기운을 채워 주면 힘이 되고, 이미 넘치는 기운을 더하면 부담이 될 수 있어요. 그래서 "올해 누구나 이렇다"가 아니라 내 사주 기준으로 보는 게 중요해요.']],
      ['무엇을 볼 수 있나요?', ['한 해 전체의 분위기, 월별로 기회가 오는 때와 쉬어 가야 할 때, 일·돈·관계에서 신경 쓸 점을 정리해 드려요. 결과는 정해진 운명이 아니라 흐름의 "경향"으로 읽어 주세요.']],
      ['입춘을 기준으로 해요', ['사주에서 새해는 1월 1일이 아니라 입춘(2월 초)부터 시작해요. 그래서 1월에 태어난 분은 전년도 기준으로 계산될 수 있어요. 용용사주는 이 기준을 반영해 풀이해요.']],
    ],
    faq: [['신년운세는 유료인가요?', '지금은 베타 기간이라 무료로 볼 수 있어요.'], ['띠별 운세와 뭐가 달라요?', '띠는 태어난 해 하나만 보지만 사주는 연·월·일·시를 모두 보기 때문에 더 개인에게 맞는 풀이가 나와요.']],
  },
  {
    slug: 'saju-basics',
    title: '사주팔자란? 쉽게 설명하는 사주 기초',
    desc: '사주팔자의 뜻, 네 기둥과 여덟 글자, 일간과 오행, 대운·세운을 어려운 한자 없이 쉽게 설명해요.',
    h1: '사주팔자, 쉽게 이해하기',
    cta: ['내 사주 무료로 보기', '/'],
    body: [
      ['사주팔자는 무슨 뜻인가요?', ['사주(四柱)는 "네 개의 기둥", 팔자(八字)는 "여덟 글자"라는 뜻이에요. 태어난 해·달·날·시를 각각 하늘의 글자(천간)와 땅의 글자(지지) 두 글자로 바꾸면 기둥 4개, 글자 8개가 돼요.']],
      ['일간이 중심이에요', ['네 기둥 가운데 태어난 날의 위 글자를 일간이라고 하고, 나 자신을 나타내는 중심으로 봐요. 나머지 글자들이 일간과 어떤 관계인지를 보면서 성격, 일, 인간관계의 경향을 읽어요.']],
      ['대운과 세운', ['대운은 약 10년 단위로 바뀌는 큰 흐름이고, 세운은 해마다 바뀌는 흐름이에요. 타고난 사주는 그대로지만 이 흐름과 만나는 모양이 시기마다 달라져요.']],
      ['사주는 정해진 운명인가요?', ['아니에요. 사주는 타고난 성향과 시기별 흐름을 보여 주는 참고 도구예요. 용용사주는 재미와 참고를 위한 풀이이며, 의학·법률·투자 같은 중요한 결정을 대신하지 않아요.']],
    ],
    faq: [['태어난 시간을 모르면 못 보나요?', '세 기둥(연·월·일)만으로도 기본 풀이는 가능해요.'], ['양력과 음력 중 뭘 넣나요?', '평소 아는 생일을 그대로 넣으세요. 음력이면 음력으로 선택하면 돼요.']],
  },
  {
    slug: 'five-elements',
    title: '오행(목·화·토·금·수) 쉽게 알아보기',
    desc: '사주의 핵심인 오행 다섯 기운의 성질과 서로 돕고 누르는 관계, 내게 부족한 기운 찾는 법을 쉽게 설명해요.',
    h1: '오행, 나를 이루는 다섯 기운',
    cta: ['내 오행 보러 가기', '/'],
    body: [
      ['다섯 기운의 성질', ['목(木)은 뻗어 나가는 성장과 시작, 화(火)는 열정과 표현, 토(土)는 안정과 중재, 금(金)은 결단과 정리, 수(水)는 지혜와 유연함을 나타내요. 어느 하나가 좋고 나쁜 게 아니라 사람마다 비율이 달라요.']],
      ['서로 돕고 누르는 관계', ['목은 화를, 화는 토를, 토는 금을, 금은 수를, 수는 목을 도와요(상생). 반대로 목은 토를, 토는 수를, 수는 화를, 화는 금을, 금은 목을 눌러요(상극). 사주 풀이는 이 관계로 내 사주의 균형을 살펴요.']],
      ['부족한 기운, 어떻게 쓰나요?', ['사주에서 부족하거나 도움이 되는 기운을 용신이라고 불러요. 그 기운과 어울리는 색, 방향, 활동을 일상에서 가볍게 챙겨 보는 정도로 참고하면 돼요.']],
    ],
    faq: [['오행이 한쪽으로 쏠리면 나쁜가요?', '나쁘다기보다 성향이 뚜렷하다는 뜻이에요. 뚜렷한 만큼 강점도 분명해요.']],
  },
  {
    slug: 'gunghap',
    title: '사주 궁합 – 두 사람의 기운이 맞는 정도',
    desc: '두 사람의 생년월일로 서로의 기운이 어떻게 맞고 부딪히는지, 잘 지내는 방법까지 쉽게 알려 드려요.',
    h1: '사주 궁합, 이렇게 봐요',
    cta: ['궁합 보러 가기', '/'],
    body: [
      ['궁합은 무엇을 보나요?', ['두 사람의 사주를 나란히 놓고 오행이 서로 돕는지 누르는지, 일간끼리 어떤 관계인지, 글자끼리 합이나 충이 있는지를 살펴봐요.']],
      ['점수보다 대화 방식', ['궁합은 "맞다 안 맞다"로 끝내기보다 서로의 다른 점을 어떻게 다루면 좋을지 알아보는 도구로 쓰면 좋아요. 용용사주는 잘 맞는 부분, 부딪히기 쉬운 부분, 서로 챙기면 좋은 점을 함께 알려 드려요.']],
      ['연인·친구·가족 모두 볼 수 있어요', ['연애 상대뿐 아니라 친구, 동료, 가족과도 비교해 볼 수 있어요. 상대 정보는 저장하지 않고 풀이에만 써요.']],
    ],
    faq: [['궁합이 나쁘면 헤어져야 하나요?', '아니에요. 경향을 참고하는 용도이고, 관계는 서로의 노력으로 달라져요.']],
  },
  {
    slug: 'face-reading',
    title: '관상 동물상 테스트 – 사진 한 장으로 닮은 동물 찾기',
    desc: '얼굴 사진으로 닮은 동물상 상위 3가지와 오행 기운을 재미로 알아보세요. 사진은 내 기기에서만 분석하고 서버에 저장하지 않아요.',
    h1: '관상 동물상 테스트',
    cta: ['동물상 테스트 해 보기', '/#face'],
    body: [
      ['어떻게 분석하나요?', ['얼굴의 눈 기울기, 코와 입의 비율, 턱선 같은 윤곽 특징을 재서 15가지 동물상 가운데 가까운 순서대로 비율로 보여 드려요. 하나로 딱 자르지 않고 "여우 48% · 고양이 30%"처럼 섞인 모습을 알려 줘요.']],
      ['사진은 안전한가요?', ['분석은 내 기기 안에서만 이뤄져요. 사진은 서버로 보내지 않고 저장하지 않아요.']],
      ['사주와 함께 보기', ['사주를 입력해 둔 상태라면 얼굴의 오행 기운과 사주의 기운을 같이 비교해 볼 수 있어요. 친구와 둘이 해 보는 관상 궁합도 있어요.']],
      ['재미로 즐겨 주세요', ['관상 결과는 재미로 보는 경향이에요. 성격이나 능력을 판단하는 근거가 아니에요.']],
    ],
    faq: [['정면 사진이 아니면 어떻게 되나요?', '얼굴이 많이 돌아가거나 기울면 각도를 알려 드리고 다시 찍도록 안내해요.'], ['PC에서도 되나요?', '네. 카메라로 바로 찍거나 사진을 골라서 분석할 수 있어요.']],
  },
  {
    slug: 'hand-reading',
    title: '손 모양 관상 – 손 사진으로 보는 오행 기운',
    desc: '손가락 길이와 비율로 나의 오행 기운을 재미로 알아보세요. 사진은 내 기기에서만 분석해요.',
    h1: '손 모양으로 보는 나의 기운',
    cta: ['손 모양 보기', '/#hand'],
    body: [
      ['손금이 아니라 손 모양이에요', ['손바닥의 선(손금)이 아니라 손가락의 길이와 비율, 손의 넓이 같은 모양을 재서 다섯 오행 가운데 어떤 기운이 두드러지는지 보여 드려요.']],
      ['사진은 저장하지 않아요', ['분석은 기기 안에서만 이뤄지고 사진은 서버에 보내거나 저장하지 않아요.']],
      ['재미로 즐겨 주세요', ['결과는 참고용 경향이에요. 사주나 얼굴 결과와 같이 보면 더 재미있어요.']],
    ],
    faq: [['어느 손으로 찍나요?', '손바닥이 보이게 손가락을 펴고 한 손을 화면에 담아 주세요.']],
  },
  {
    slug: 'exam-day',
    title: '시험 날 사주 – 수능·면접 날 컨디션 흐름',
    desc: '시험이나 면접 날의 기운과 컨디션 흐름을 내 사주로 확인하고 당일 챙길 점을 알아보세요.',
    h1: '시험 날 사주, 컨디션 흐름 보기',
    cta: ['시험 날 사주 보기', '/'],
    body: [
      ['어떤 날을 볼 수 있나요?', ['수능, 자격증, 면접처럼 중요한 날짜를 정해 그날의 기운이 내 사주와 어떻게 닿는지 살펴봐요.']],
      ['무엇을 알려 주나요?', ['집중이 잘 되는 시간대의 경향, 긴장하기 쉬운 부분, 당일 마음가짐과 챙길 점을 쉬운 말로 알려 드려요.']],
      ['부담 갖지 마세요', ['결과는 재미와 응원을 위한 참고예요. 시험 결과는 준비한 만큼 나와요. 마음 편히 보고 힘내세요.']],
    ],
    faq: [['날짜는 미리 볼 수 있나요?', '네. 날짜를 직접 골라 볼 수 있어요.']],
  },
  {
    slug: 'about',
    title: '용용사주 소개 – 용하디 용한 사주',
    desc: '용용사주는 생년월일만으로 오늘의 운세, 신년운세, 궁합, 관상까지 쉬운 말로 풀어 주는 사주 서비스예요.',
    h1: '용용사주 소개',
    cta: ['지금 시작하기', '/'],
    body: [
      ['용용사주는 이런 서비스예요', ['마스코트 용용이가 생년월일만으로 오늘의 운세, 신년운세, 고민 상담, 궁합, 관상 동물상, 손 모양 풀이까지 쉬운 말로 알려 드려요. 로그인 없이 바로 쓸 수 있어요.']],
      ['풀이는 이렇게 만들어져요', ['풀이는 전통 명리학(자평명리) 기준의 계산과 규칙으로 만들어요. 기본 풀이는 계산된 결과를 바탕으로 한 글이고, 상담처럼 개인 질문에는 선택적으로 AI를 함께 써요.']],
      ['공개 코드', ['사주 계산 엔진은 오픈소스로 공개되어 있어요. 소스는 GitHub 저장소 shimsonthenewbie/feedbuddi-saju 에서 볼 수 있어요.']],
      ['문의', [`문의는 ${CONTACT} 로 보내 주세요.`]],
    ],
    faq: [],
  },
]

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const CSS = `:root{--wine:#6a2623;--ink:#2a2118;--paper:#f6ecd6;--tan:#d2b574}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.8 'Gowun Dodum',system-ui,sans-serif}header,main,footer{max-width:720px;margin:0 auto;padding:0 18px}header{padding-top:18px;padding-bottom:8px}header a{color:var(--wine);font:700 20px 'Noto Serif KR',serif;text-decoration:none}h1{font:700 28px/1.4 'Noto Serif KR',serif;color:var(--wine);margin:18px 0 10px}h2{font:700 20px/1.5 'Noto Serif KR',serif;margin:30px 0 6px;border-bottom:1px solid var(--tan);padding-bottom:4px}p{margin:8px 0}.lead{color:#5a4a38}.cta{display:block;margin:26px 0;text-align:center;background:var(--wine);color:#f6ead0;text-decoration:none;font:700 18px 'Noto Serif KR',serif;padding:14px;border-radius:3px;border:1px solid var(--tan)}nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px 14px}nav a{color:var(--wine)}details{margin:6px 0}summary{cursor:pointer;font-weight:700}footer{padding:24px 18px 40px;color:#6b5a45;font-size:14px}small{display:block}`

const nav = (cur) => `<nav aria-label="다른 풀이"><ul>${PAGES.filter((p) => p.slug !== cur).map((p) => `<li><a href="/${p.slug}/">${esc(p.title.split(' – ')[0])}</a></li>`).join('')}</ul></nav>`

function render(p) {
  const url = `${ORIGIN}/${p.slug}/`
  const faqLd = p.faq.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) } : null
  const crumbs = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: SITE, item: ORIGIN + '/' }, { '@type': 'ListItem', position: 2, name: p.h1, item: url }] }
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)} | ${SITE}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${SITE}">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ORIGIN}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" href="/favicon-96.png" sizes="96x96">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Serif+KR:wght@600;700&display=swap">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
${faqLd ? `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>` : ''}
</head>
<body>
<header><a href="/">${SITE}</a></header>
<main>
<h1>${esc(p.h1)}</h1>
<p class="lead">${esc(p.desc)}</p>
<a class="cta" href="${p.cta[1]}">${esc(p.cta[0])}</a>
${p.body.map(([h, ps]) => `<section><h2>${esc(h)}</h2>${ps.map((t) => `<p>${esc(t)}</p>`).join('')}</section>`).join('\n')}
${p.faq.length ? `<section><h2>자주 묻는 질문</h2>${p.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>` : ''}
<a class="cta" href="${p.cta[1]}">${esc(p.cta[0])}</a>
${nav(p.slug)}
</main>
<footer><small>풀이는 재미와 참고를 위한 경향이며 의학·법률·투자 등 중요한 결정을 대신하지 않아요.</small><small><a href="/">${SITE}</a> · 문의 ${CONTACT}</small></footer>
</body>
</html>
`
}

for (const p of PAGES) {
  mkdirSync(`public/${p.slug}`, { recursive: true })
  writeFileSync(`public/${p.slug}/index.html`, render(p))
}
const today = new Date().toISOString().slice(0, 10)
const urls = [['/', 'daily', '1.0'], ...PAGES.map((p) => [`/${p.slug}/`, 'weekly', p.slug === 'newyear-2027' ? '0.9' : '0.7'])]
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, c, pr]) => `  <url><loc>${ORIGIN}${u}</loc><lastmod>${today}</lastmod><changefreq>${c}</changefreq><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`)
console.log('seo pages:', PAGES.length)

/**
 * /api/ask — 상담 풀이 서버.
 * - GEMINI_API_KEY(Cloudflare Secret)가 없으면 "엔진 전용 모드": 코드가 만든 초안 카드를 그대로 돌려준다.
 * - 키가 있으면 초안 카드를 근거로 Gemini가 쉬운 말로 다시 써서 같은 카드 형식(JSON)으로 돌려준다.
 * 어떤 오류든 초안 카드로 되돌아가므로 화면은 항상 결과를 보여 줄 수 있다.
 */
interface Env {
  ASSETS: { fetch(req: Request): Promise<Response> }
  GEMINI_API_KEY?: string
  GEMINI_MODEL?: string
}
interface Card { kind: string; title: string; paras: string[]; list?: string[] }
interface AskBody { lang: string; cat: string; question: string; date?: string; facts: string; cards: Card[] }

const LANG: Record<string, string> = {
  ko: '한국어', en: 'English', ja: '日本語', zh: '中文', es: 'Español', fr: 'Français', de: 'Deutsch', pt: 'Português',
  ru: 'Русский', it: 'Italiano', tr: 'Türkçe', ar: 'العربية', hi: 'हिन्दी', id: 'Bahasa Indonesia', th: 'ไทย',
}
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })

function valid(b: any): b is AskBody {
  return b && typeof b.lang === 'string' && typeof b.cat === 'string' && typeof b.question === 'string' && b.question.length <= 300
    && typeof b.facts === 'string' && b.facts.length <= 8000 && Array.isArray(b.cards) && b.cards.length > 0 && b.cards.length <= 12
    && b.cards.every((c: any) => c && typeof c.kind === 'string' && typeof c.title === 'string' && Array.isArray(c.paras) && c.paras.every((p: any) => typeof p === 'string'))
}

function prompt(b: AskBody): string {
  const lang = LANG[b.lang] ?? 'English'
  return `You are "Yeoui", a friendly dragon-genie who explains Saju (Four Pillars) in plain, warm words to people who know nothing about it.
Write in ${lang}. Avoid jargon; if you must use a term, explain it in a few words.

Strict rules:
- Use ONLY the facts below (computed by software). Never invent months, dates, events, jobs, or people.
- Speak in tendencies ("tends to", "this period looks easier for…"), never certainties. No medical, legal, or investment instructions.
- Answer the person's actual question first, then reasons, then practical tips.
- Keep each card short (2–4 sentences per paragraph). Keep the same number of cards, the same "kind" values and the same order as the draft.
- Keep every month/date from the draft exactly as given.

Question category: ${b.cat}
Question: ${b.question}${b.date ? `\nDate they asked about: ${b.date}` : ''}

Chart facts:
${b.facts}

Draft cards (JSON) — rewrite their wording, keep their facts:
${JSON.stringify(b.cards)}

Return ONLY JSON: {"cards":[{"kind":string,"title":string,"paras":string[],"list"?:string[]}]}`
}

async function rewrite(b: AskBody, env: Env): Promise<Card[] | null> {
  if (!env.GEMINI_API_KEY) return null
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash'
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 25000)
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', signal: ctl.signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt(b) }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
      }),
    })
    if (!res.ok) return null
    const data: any = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const out = JSON.parse(text)
    const cards: Card[] = out?.cards
    // 카드 수·종류·순서가 초안과 같을 때만 받아들인다.
    if (!Array.isArray(cards) || cards.length !== b.cards.length) return null
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i]
      if (c.kind !== b.cards[i].kind || typeof c.title !== 'string' || !Array.isArray(c.paras) || !c.paras.every((p) => typeof p === 'string')) return null
      if (c.list && !(Array.isArray(c.list) && c.list.every((x) => typeof x === 'string'))) return null
    }
    return cards
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname !== '/api/ask') return env.ASSETS.fetch(req)
    if (req.method !== 'POST') return json({ error: 'method' }, 405)
    let body: unknown
    try { body = await req.json() } catch { return json({ error: 'json' }, 400) }
    if (!valid(body)) return json({ error: 'invalid' }, 400)
    const ai = await rewrite(body, env)
    return json({ mode: ai ? 'ai' : 'engine', cards: ai ?? body.cards })
  },
}

/**
 * /api/ask — 상담 풀이 서버.
 * - GEMINI_API_KEY(Cloudflare Secret)가 없으면 "엔진 전용 모드": 코드가 만든 초안 카드를 그대로 돌려준다.
 * - 키가 있으면 초안 카드를 근거로 Gemini가 쉬운 말로 다시 써서 같은 카드 형식(JSON)으로 돌려준다.
 * 어떤 오류든 초안 카드로 되돌아가므로 화면은 항상 결과를 보여 줄 수 있다.
 */
import { D1Store, MemoryStore, DAILY_CAP, type D1, type Store } from './tickets'
import { buildReportRequest, type Part, type Tone } from '../src/report-prompt'

interface Env {
  DB?: D1
  /** 테스트 전용. 운영에서는 설정하지 않는다. */
  DEV_TICKET_SECRET?: string
  DAILY_CAP?: string
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

/** 종합 리포트: 4개 파트를 차례로 만들어 줄 단위(JSON)로 흘려 보낸다. 질문권 1장 = 리포트 1건. */
async function geminiText(env: Env, system: string, user: string, ms: number): Promise<string | null> {
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash'
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), ms)
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', signal: ctl.signal,
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY! },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
      }),
    })
    if (!res.ok) return null
    const data: any = await res.json()
    const parts: any[] = data?.candidates?.[0]?.content?.parts ?? []
    const text = parts.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('').trim()
    return text.length > 200 ? text : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
/** 다음 파트가 같은 말을 되풀이하지 않도록 앞 파트의 소제목과 첫 문장만 추린다. */
function digest(text: string): string {
  const out: string[] = []
  for (const block of text.split(/\n{2,}/)) {
    const t = block.trim()
    if (/^\d+\.\s/.test(t) || /^#{1,4}\s/.test(t)) out.push(t.split('\n')[0].slice(0, 80))
    else if (out.length && out[out.length - 1].length < 260) out[out.length - 1] += ' — ' + t.slice(0, 120)
  }
  return out.join('\n').slice(0, 2500)
}

function reportStream(body: { data: string; tone: Tone }, env: Env, onFirstFail: () => Promise<void>): Response {
  const enc = new TextEncoder()
  const { readable, writable } = new TransformStream()
  const w = writable.getWriter()
  const send = (o: unknown) => w.write(enc.encode(JSON.stringify(o) + '\n'))
  const run = (async () => {
    let prev = ''
    let okParts = 0
    for (const part of [1, 2, 3, 4] as Part[]) {
      const rq = buildReportRequest(body.data, part, { tone: body.tone, previousSummary: prev || undefined })
      let text = await geminiText(env, rq.system, rq.user, 110_000)
      if (!text) text = await geminiText(env, rq.system, rq.user, 110_000) // 한 번 더 시도
      if (!text) {
        if (okParts === 0) await onFirstFail()
        await send({ part, error: 'ai_failed', refunded: okParts === 0 })
        break
      }
      okParts++
      prev = (prev ? prev + '\n' : '') + digest(text)
      await send({ part, text })
    }
    await send({ done: true, parts: okParts })
    await w.close()
  })()
  return Object.assign(new Response(readable, { headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' } }), { _run: run })
}

const mem = new MemoryStore()
const storeOf = (env: Env): Store => (env.DB ? new D1Store(env.DB) : mem)

export default {
  async fetch(req: Request, env: Env, ctx?: { waitUntil(p: Promise<unknown>): void }): Promise<Response> {
    const url = new URL(req.url)
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req)
    if (req.method !== 'POST') return json({ error: 'method' }, 405)
    // 같은 사이트에서 온 요청만 받는다(다른 사이트가 우리 서버를 끌어 쓰는 것 방지).
    const origin = req.headers.get('origin')
    if (origin && origin !== url.origin) return json({ error: 'origin' }, 403)
    const store = storeOf(env)
    const now = Date.now()

    // 결제 확인 없이 질문권 발급 금지. 이 경로는 테스트 비밀값이 설정된 환경에서만 열린다.
    // (실제 결제 연동 후에는 결제 웹훅이 store.issue()를 호출하고, 이 경로는 쓰지 않는다.)
    if (url.pathname === '/api/dev-ticket') {
      if (!env.DEV_TICKET_SECRET || req.headers.get('x-dev-secret') !== env.DEV_TICKET_SECRET) return json({ error: 'forbidden' }, 403)
      const owner = (await req.json().catch(() => ({})) as any).owner
      return json({ ticket: await store.issue(typeof owner === 'string' && owner ? owner.slice(0, 64) : 'dev', now) })
    }

    if (url.pathname === '/api/report') {
      let b: any
      try { b = await req.json() } catch { return json({ error: 'json' }, 400) }
      if (!b || typeof b.data !== 'string' || b.data.length < 200 || b.data.length > 60000) return json({ error: 'invalid' }, 400)
      const tone: Tone = b.tone === 'warm' ? 'warm' : 'pro'
      const auth = req.headers.get('authorization') ?? ''
      const ticket = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
      if (!ticket) return json({ mode: 'engine', reason: 'no_ticket' })
      if (!env.GEMINI_API_KEY) return json({ mode: 'engine', reason: 'no_ai' }) // 질문권을 쓰지 않고 돌려보낸다
      const cap = Number(env.DAILY_CAP) > 0 ? Number(env.DAILY_CAP) : DAILY_CAP
      const deny = await store.consume(ticket, now, cap)
      if (deny) return json({ mode: 'engine', reason: deny })
      const res = reportStream({ data: b.data, tone }, env, () => store.release(ticket, now)) as Response & { _run: Promise<void> }
      if (ctx) ctx.waitUntil(res._run)
      return res
    }

    if (url.pathname !== '/api/ask') return json({ error: 'not_found' }, 404)
    let body: unknown
    try { body = await req.json() } catch { return json({ error: 'json' }, 400) }
    if (!valid(body)) return json({ error: 'invalid' }, 400)

    // 질문권이 없으면 AI를 호출하지 않고 엔진 풀이만 돌려준다(비용 0).
    const auth = req.headers.get('authorization') ?? ''
    const ticket = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
    if (!ticket) return json({ mode: 'engine', reason: 'no_ticket', cards: body.cards })
    const cap = Number(env.DAILY_CAP) > 0 ? Number(env.DAILY_CAP) : DAILY_CAP
    const deny = await store.consume(ticket, now, cap)
    if (deny) return json({ mode: 'engine', reason: deny, cards: body.cards })

    const ai = await rewrite(body, env)
    if (!ai) { await store.release(ticket, now); return json({ mode: 'engine', reason: 'ai_failed', refunded: true, cards: body.cards }) }
    return json({ mode: 'ai', cards: ai })
  },
}

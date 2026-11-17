// 제미나이 호출 공통 도구: 한도(429)에 걸리면 멈췄다가 풀리면 자동으로 다시 시도한다.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
export const HERE = path.dirname(fileURLToPath(import.meta.url))

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  const p = path.join(HERE, '.env')
  if (fs.existsSync(p)) for (const l of fs.readFileSync(p, 'utf8').split('\n')) { const m = l.match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/); if (m) return m[1].replace(/^["']|["']$/g, '') }
  return ''
}
export const KEY = loadKey()
export const BASE = process.env.GEMINI_BASE || 'https://generativelanguage.googleapis.com'
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const stamp = () => new Date().toLocaleTimeString('ko-KR')
export const log = (...a) => console.log(`[${stamp()}]`, ...a)

/** 기다리는 동안 1분마다 한 줄씩 남겨서, 멈춘 게 아니라는 걸 알 수 있게 한다. */
async function wait(ms, why) {
  const end = Date.now() + ms
  log(`⏸  ${why} — ${Math.ceil(ms / 60000)}분 정도 쉬었다가 자동으로 다시 해요 (끄려면 Ctrl+C, 다시 켜면 이어서 해요)`)
  while (Date.now() < end) { await sleep(Math.min(60000, end - Date.now())); if (Date.now() < end) log(`   …아직 쉬는 중 (남은 ${Math.ceil((end - Date.now()) / 60000)}분)`) }
}

/** 한 번 호출. 한도 초과·서버 혼잡이면 기다렸다가 계속 다시 한다. 되돌려 줄 수 없는 오류(키 오류 등)는 바로 멈춘다. */
export async function generate(model, body) {
  if (!KEY) throw new Error('API 키가 없어요. tools/gemini/.env 파일에 GEMINI_API_KEY=키 를 적어 주세요. (README 참고)')
  let soft = 0
  for (;;) {
    let res, text
    try {
      res = await fetch(`${BASE}/v1beta/models/${model}:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body) })
      text = await res.text()
    } catch (e) { soft++; if (soft > 8) throw e; await wait(Math.min(30000 * soft, 300000), `인터넷 연결 문제(${e.message})`); continue }
    if (res.ok) {
      const j = JSON.parse(text)
      const cand = j.candidates?.[0]
      if (!cand || cand.finishReason === 'SAFETY' || cand.finishReason === 'PROHIBITED_CONTENT' || j.promptFeedback?.blockReason) return { blocked: j.promptFeedback?.blockReason || cand?.finishReason || 'EMPTY', parts: [] }
      return { parts: cand.content?.parts || [] }
    }
    let err = {}; try { err = JSON.parse(text).error || {} } catch {}
    const msg = err.message || text.slice(0, 200)
    if (res.status === 429) {
      const retry = (err.details || []).find((d) => /RetryInfo/.test(d['@type'] || ''))?.retryDelay
      const sec = retry ? parseFloat(retry) : 0
      const raw = JSON.stringify(err)
      // 무료 키에 이 모델의 사용량이 처음부터 0이면 기다려도 소용없다 → 바로 알린다
      if (/limit"?:\s*0\b/.test(raw) || /limit: 0/.test(raw)) { const e = new Error(`이 모델은 지금 키로는 쓸 수 없어요(무료 사용량 0). ${msg.slice(0, 160)}`); e.noQuota = true; throw e }
      log(`   (제미나이 응답: ${msg.slice(0, 200)})`)
      const daily = /PerDay|per day|daily/i.test(raw) && !/PerMinute/i.test(raw)
      if (daily) await wait(30 * 60000, '오늘 쓸 수 있는 양을 다 썼어요(하루 한도)')   // 30분마다 확인. 자정(미국 태평양시, 한국 오후 4~5시쯤)에 풀려요
      else await wait((sec || 60) * 1000 + 5000, '1분당 한도에 걸렸어요')
      continue
    }
    if (res.status === 500 || res.status === 503 || res.status === 504) { soft++; if (soft > 8) throw new Error(`서버 오류 ${res.status}: ${msg}`); await wait(Math.min(20000 * soft, 300000), `제미나이 서버가 바빠요(${res.status})`); continue }
    throw new Error(`제미나이 오류 ${res.status}: ${msg}`)
  }
}

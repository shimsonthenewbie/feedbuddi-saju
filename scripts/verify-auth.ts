// 로그인 서버 검사: 가짜 카카오 서버와 임시 DB로 로그인→저장→불러오기→로그아웃→탈퇴를 확인한다.
import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import worker from '../worker/index'

const db = new DatabaseSync(':memory:')
db.exec(readFileSync(new URL('../worker/schema.sql', import.meta.url), 'utf8'))
const D1 = {
  prepare: (sql: string) => ({
    bind: (...v: unknown[]) => ({
      run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...(v as any[])).changes) } }),
      first: async () => (db.prepare(sql).get(...(v as any[])) as any) ?? null,
      all: async () => ({ results: db.prepare(sql).all(...(v as any[])) as any[] }),
    }),
  }),
}
const realFetch = globalThis.fetch
globalThis.fetch = (async (u: any, init?: any) => {
  const s = String(u)
  if (s.startsWith('https://kauth.kakao.com/oauth/token')) return new Response(JSON.stringify({ access_token: 'AT' }))
  if (s.startsWith('https://kapi.kakao.com/v2/user/me')) return new Response(JSON.stringify({ id: 12345 }))
  return realFetch(u, init)
}) as any

const env: any = { DB: D1, KAKAO_REST_KEY: 'k', ASSETS: { fetch: async () => new Response('x') } }
const O = 'https://saju.feedbuddi.com'
let ok = 0, bad = 0
const t = (n: string, c: boolean) => { c ? ok++ : (bad++, console.log('실패:', n)) }
const call = (path: string, init: RequestInit = {}, cookie = '') => worker.fetch(new Request(O + path, { ...init, headers: { ...(init.headers as any), origin: O, ...(cookie ? { cookie } : {}) } }), env)
const post = (path: string, body: unknown, cookie = '') => call(path, { method: 'POST', body: JSON.stringify(body) }, cookie)

const st = await (await post('/api/auth/status', {})).json() as any
t('status', st.kakao === true && st.google === false)
const s = await call('/api/auth/kakao/start')
const loc = s.headers.get('location')!, state = new URL(loc).searchParams.get('state')!
t('start→카카오', loc.startsWith('https://kauth.kakao.com/') && !!state)
const oc = s.headers.get('set-cookie')!.split(';')[0]
const bd = await call(`/api/auth/kakao/callback?code=c&state=wrong`, {}, oc)
t('state 불일치 거부', bd.headers.get('location') === '/?login=failed')
const cb = await call(`/api/auth/kakao/callback?code=c&state=${state}`, {}, oc)
t('로그인 성공', cb.headers.get('location') === '/?login=ok')
const sess = cb.headers.getSetCookie().find((c) => c.startsWith('fb_sess='))!
t('쿠키 HttpOnly', /HttpOnly/.test(sess) && /Secure/.test(sess))
const ck = sess.split(';')[0]
t('me 로그인됨', ((await (await post('/api/auth/me', {}, ck)).json()) as any).in === true)
t('me 비로그인', ((await (await post('/api/auth/me', {})).json()) as any).in === false)
t('저장 없이 불러오기 401', (await post('/api/auth/data/get', {})).status === 401)
t('저장', ((await (await post('/api/auth/data/set', { profile: { y: 1996, m: 10, d: 28 }, friends: [{ id: 'a' }] }, ck)).json()) as any).ok === true)
const g = await (await post('/api/auth/data/get', {}, ck)).json() as any
t('불러오기', g.profile?.y === 1996 && g.friends.length === 1)
await post('/api/auth/data/set', { profile: { y: 2000 } }, ck)
const g2 = await (await post('/api/auth/data/get', {}, ck)).json() as any
t('일부만 저장해도 친구 유지', g2.profile.y === 2000 && g2.friends.length === 1)
t('너무 큰 저장 거부', (await post('/api/auth/data/set', { profile: 'x'.repeat(25000) }, ck)).status === 413)
const cb2 = await (async () => { const s2 = await call('/api/auth/kakao/start'); const st2 = new URL(s2.headers.get('location')!).searchParams.get('state')!; return call(`/api/auth/kakao/callback?code=c&state=${st2}`, {}, s2.headers.get('set-cookie')!.split(';')[0]) })()
t('같은 계정 재로그인 시 user 1명', (db.prepare('SELECT COUNT(*) n FROM users').get() as any).n === 1 && cb2.status === 302)
t('다른 사이트 요청 거부', (await worker.fetch(new Request(O + '/api/auth/me', { method: 'POST', headers: { origin: 'https://evil.com' } }), env)).status === 403)
await post('/api/auth/logout', {}, ck)
t('로그아웃 후 me', ((await (await post('/api/auth/me', {}, ck)).json()) as any).in === false)
const ck2 = cb2.headers.getSetCookie().find((c) => c.startsWith('fb_sess='))!.split(';')[0]
await post('/api/auth/delete', {}, ck2)
t('탈퇴 후 데이터 삭제', (db.prepare('SELECT COUNT(*) n FROM users').get() as any).n === 0 && (db.prepare('SELECT COUNT(*) n FROM user_data').get() as any).n === 0)
const noKey = await worker.fetch(new Request(O + '/api/auth/google/start'), { ...env, ASSETS: env.ASSETS })
t('구글 키 없으면 준비 중', noKey.headers.get('location') === '/?login=unavailable')
console.log(bad ? `로그인 검사 ${ok}/${ok + bad} (실패 ${bad})` : `로그인 검사 ${ok}/${ok} 통과`)
process.exit(bad ? 1 : 0)

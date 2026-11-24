/**
 * 카카오·구글 로그인 + 내 사주 계정 저장.
 * - 제공자에게서 "고유 번호"만 받는다(이름·이메일·프로필 사진은 받지 않는다).
 * - 로그인 상태는 HttpOnly 쿠키(무작위 토큰)로 유지하고, 서버에는 토큰의 SHA-256만 저장한다.
 * - 키(KAKAO_REST_KEY 등)가 없으면 해당 로그인은 "준비 중"으로 돌려보낸다.
 */
import type { D1 } from './tickets'

export interface AuthEnv {
  DB?: D1
  KAKAO_REST_KEY?: string
  KAKAO_CLIENT_SECRET?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
}
type Provider = 'kakao' | 'google'
const SESSION_MS = 30 * 86400_000
const COOKIE = 'fb_sess'
const OAUTH_COOKIE = 'fb_oauth'
const MAX_DATA = 20_000

const enc = new TextEncoder()
const hex = (b: ArrayBuffer | Uint8Array) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
const rand = (n = 32) => hex(crypto.getRandomValues(new Uint8Array(n)))
const sha = async (s: string) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)))
const jsonRes = (o: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } })

function cookieOf(req: Request, name: string): string {
  const m = (req.headers.get('cookie') ?? '').split(/;\s*/).find((c) => c.startsWith(name + '='))
  return m ? decodeURIComponent(m.slice(name.length + 1)) : ''
}
const setCookie = (name: string, v: string, maxAge: number) => `${name}=${encodeURIComponent(v)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`

function conf(env: AuthEnv, p: Provider) {
  if (p === 'kakao') return env.KAKAO_REST_KEY ? { id: env.KAKAO_REST_KEY, secret: env.KAKAO_CLIENT_SECRET ?? '', auth: 'https://kauth.kakao.com/oauth/authorize', token: 'https://kauth.kakao.com/oauth/token', me: 'https://kapi.kakao.com/v2/user/me', scope: '' } : null
  return env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? { id: env.GOOGLE_CLIENT_ID, secret: env.GOOGLE_CLIENT_SECRET, auth: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token', me: 'https://openidconnect.googleapis.com/v1/userinfo', scope: 'openid' } : null
}

async function providerId(c: NonNullable<ReturnType<typeof conf>>, p: Provider, code: string, redirect: string): Promise<string | null> {
  const body = new URLSearchParams({ grant_type: 'authorization_code', client_id: c.id, redirect_uri: redirect, code })
  if (c.secret) body.set('client_secret', c.secret)
  const tr = await fetch(c.token, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body })
  if (!tr.ok) return null
  const tok = (await tr.json().catch(() => null)) as { access_token?: string } | null
  if (!tok?.access_token) return null
  const mr = await fetch(c.me, { headers: { authorization: `Bearer ${tok.access_token}` } })
  if (!mr.ok) return null
  const me = (await mr.json().catch(() => null)) as { id?: number | string; sub?: string } | null
  const id = p === 'kakao' ? me?.id : me?.sub
  return id != null && String(id) ? String(id) : null
}

export async function userOf(req: Request, env: AuthEnv, now: number): Promise<string | null> {
  const tok = cookieOf(req, COOKIE)
  if (!tok || !env.DB) return null
  const r = await env.DB.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash=?').bind(await sha(tok)).first<{ user_id: string; expires_at: number }>()
  return r && r.expires_at > now ? r.user_id : null
}

/** 로그인 관련 경로를 처리한다. 해당 없으면 null. */
export async function handleAuth(req: Request, env: AuthEnv, now: number): Promise<Response | null> {
  const url = new URL(req.url)
  const path = url.pathname
  if (!path.startsWith('/api/auth/')) return null
  const back = (q: string) => new Response(null, { status: 302, headers: { location: `/?${q}`, 'cache-control': 'no-store' } })

  // 로그인 시작/완료(브라우저 이동이라 GET)
  const m = path.match(/^\/api\/auth\/(kakao|google)\/(start|callback)$/)
  if (m && req.method === 'GET') {
    const p = m[1] as Provider
    const c = conf(env, p)
    if (!c || !env.DB) return back('login=unavailable')
    const redirect = `${url.origin}/api/auth/${p}/callback`
    if (m[2] === 'start') {
      const state = rand(16)
      const q = new URLSearchParams({ client_id: c.id, redirect_uri: redirect, response_type: 'code', state })
      if (c.scope) q.set('scope', c.scope)
      return new Response(null, { status: 302, headers: { location: `${c.auth}?${q}`, 'set-cookie': setCookie(OAUTH_COOKIE, state, 600), 'cache-control': 'no-store' } })
    }
    const state = url.searchParams.get('state') ?? ''
    const code = url.searchParams.get('code') ?? ''
    const saved = cookieOf(req, OAUTH_COOKIE)
    const clear = setCookie(OAUTH_COOKIE, '', 0)
    if (!code || !state || !saved || state !== saved) return new Response(null, { status: 302, headers: { location: '/?login=failed', 'set-cookie': clear } })
    const pid = await providerId(c, p, code, redirect).catch(() => null)
    if (!pid) return new Response(null, { status: 302, headers: { location: '/?login=failed', 'set-cookie': clear } })
    let u = await env.DB.prepare('SELECT id FROM users WHERE provider=? AND provider_id=?').bind(p, pid).first<{ id: string }>()
    if (!u) {
      const id = rand(16)
      await env.DB.prepare('INSERT INTO users (id,provider,provider_id,created_at) VALUES (?,?,?,?)').bind(id, p, pid, now).run()
      u = { id }
    }
    const tok = rand(32)
    await env.DB.prepare('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(await sha(tok), u.id, now + SESSION_MS).run()
    await env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(now).run()
    const h = new Headers({ location: '/?login=ok', 'cache-control': 'no-store' })
    h.append('set-cookie', setCookie(COOKIE, tok, SESSION_MS / 1000))
    h.append('set-cookie', clear)
    return new Response(null, { status: 302, headers: h })
  }

  // 나머지는 POST만(같은 사이트에서 온 요청인지는 index.ts에서 먼저 검사한다)
  if (req.method !== 'POST') return jsonRes({ error: 'method' }, 405)
  if (!env.DB) return jsonRes({ error: 'no_db' }, 503)

  if (path === '/api/auth/status') return jsonRes({ kakao: !!conf(env, 'kakao'), google: !!conf(env, 'google') })
  const uid = await userOf(req, env, now)

  if (path === '/api/auth/me') {
    if (!uid) return jsonRes({ in: false })
    const row = await env.DB.prepare('SELECT provider FROM users WHERE id=?').bind(uid).first<{ provider: string }>()
    return jsonRes({ in: true, provider: row?.provider ?? '' })
  }
  if (path === '/api/auth/logout') {
    const tok = cookieOf(req, COOKIE)
    if (tok) await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha(tok)).run()
    return jsonRes({ ok: true }, 200, { 'set-cookie': setCookie(COOKIE, '', 0) })
  }
  if (!uid) return jsonRes({ error: 'login' }, 401)

  if (path === '/api/auth/data/get') {
    const r = await env.DB.prepare('SELECT profile, friends FROM user_data WHERE user_id=?').bind(uid).first<{ profile: string | null; friends: string | null }>()
    return jsonRes({ profile: r?.profile ? JSON.parse(r.profile) : null, friends: r?.friends ? JSON.parse(r.friends) : [] })
  }
  if (path === '/api/auth/data/set') {
    const b = (await req.json().catch(() => null)) as { profile?: unknown; friends?: unknown } | null
    if (!b) return jsonRes({ error: 'bad' }, 400)
    const prev = await env.DB.prepare('SELECT profile, friends FROM user_data WHERE user_id=?').bind(uid).first<{ profile: string | null; friends: string | null }>()
    const profile = 'profile' in b ? JSON.stringify(b.profile ?? null) : prev?.profile ?? null
    const friends = 'friends' in b ? JSON.stringify(Array.isArray(b.friends) ? b.friends.slice(0, 8) : []) : prev?.friends ?? null
    if ((profile?.length ?? 0) > MAX_DATA || (friends?.length ?? 0) > MAX_DATA) return jsonRes({ error: 'too_big' }, 413)
    await env.DB.prepare('INSERT INTO user_data (user_id,profile,friends,updated_at) VALUES (?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET profile=excluded.profile, friends=excluded.friends, updated_at=excluded.updated_at').bind(uid, profile, friends, now).run()
    return jsonRes({ ok: true })
  }
  // 탈퇴: 계정·세션·저장된 사주를 모두 지운다
  if (path === '/api/auth/delete') {
    await env.DB.prepare('DELETE FROM user_data WHERE user_id=?').bind(uid).run()
    await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(uid).run()
    await env.DB.prepare('DELETE FROM users WHERE id=?').bind(uid).run()
    return jsonRes({ ok: true }, 200, { 'set-cookie': setCookie(COOKIE, '', 0) })
  }
  return jsonRes({ error: 'not_found' }, 404)
}

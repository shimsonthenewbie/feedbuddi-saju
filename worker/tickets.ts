/**
 * 질문권(ticket) — AI 풀이는 결제가 확인된 질문권 1장을 쓸 때만 호출된다.
 *  1) 질문권은 1회용: 사용 시 원자적으로 'used' 처리(같은 권으로 두 번 못 씀).
 *  2) 같은 구매자(owner)는 COOLDOWN_MS 안에 연속 사용 불가.
 *  3) 하루 전체 AI 호출 상한(DAILY_CAP): 넘으면 AI 대신 엔진 풀이로 돌려 비용 폭주를 막음.
 *  4) AI 호출이 실패하면 질문권을 되돌려 줌(release).
 * 저장소: D1(env.DB)이 있으면 D1, 없으면 메모리(테스트 전용·재시작하면 사라짐).
 */
export const COOLDOWN_MS = 60_000
export const TICKET_TTL_MS = 30 * 24 * 3600_000
export const DAILY_CAP = 500
/** 만료까지 이 기간 이하로 남으면 "임박"으로 본다 */
export const SOON_MS = 7 * 24 * 3600_000
/** 사용·만료 후 이 기간이 지난 기록은 자동으로 지운다(개인정보 처리방침의 보유 기간과 같아야 한다) */
export const KEEP_MS = 365 * 24 * 3600_000

export type Deny = 'none' | 'invalid' | 'used_or_expired' | 'cooldown' | 'cap'
export type View = 'all' | 'unused' | 'used' | 'expired' | 'soon' | 'revoked'
export type Sort = 'new' | 'expiring'
export interface TicketRow { id: string; owner: string; status: string; createdAt: number; expiresAt: number; usedAt: number | null }
export interface Summary { total: number; unused: number; soon: number; used: number; expired: number; revoked: number; aiToday: number }
/** 화면에 보여 줄 상태: 안 쓴 채 기한이 지났으면 expired */
export const effective = (r: { status: string; expiresAt: number }, now: number) => (r.status === 'unused' && r.expiresAt <= now ? 'expired' : r.status)
export interface Store {
  issue(owner: string, now: number): Promise<string>
  list(view: View, sort: Sort, now: number, limit: number): Promise<TicketRow[]>
  peek(id: string): Promise<TicketRow | null>
  /** 안 쓴 질문권을 회수한다. 성공하면 true */
  revoke(id: string): Promise<boolean>
  summary(now: number): Promise<Summary>
  /** 보유 기간이 지난 기록을 지운다. 지운 개수를 돌려준다 */
  purge(now: number): Promise<number>
  /** 질문권을 쓴다. 성공하면 null, 실패하면 이유. */
  consume(id: string, now: number, cap: number): Promise<Deny | null>
  release(id: string, now: number): Promise<void>
}

const hex = (n = 16) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('')
const day = (now: number) => new Date(now + 9 * 3600_000).toISOString().slice(0, 10) // 한국 날짜 기준
const ID = /^[0-9a-f]{32}$/
export const isTicketId = (s: string) => ID.test(s)
function matches(r: TicketRow, view: View, now: number): boolean {
  const e = effective(r, now)
  if (view === 'all') return true
  if (view === 'unused') return e === 'unused'
  if (view === 'soon') return e === 'unused' && r.expiresAt <= now + SOON_MS
  return e === view
}

export class MemoryStore implements Store {
  t = new Map<string, { owner: string; status: string; exp: number; at: number; usedAt?: number }>()
  b = new Map<string, number>()
  async issue(owner: string, now: number) {
    const id = hex(); this.t.set(id, { owner, status: 'unused', exp: now + TICKET_TTL_MS, at: now }); return id
  }
  private row(id: string, t: { owner: string; status: string; exp: number; at: number; usedAt?: number }): TicketRow {
    return { id, owner: t.owner, status: t.status, createdAt: t.at, expiresAt: t.exp, usedAt: t.usedAt ?? null }
  }
  async list(view: View, sort: Sort, now: number, limit: number) {
    const rows = [...this.t].map(([id, t]) => this.row(id, t)).filter((r) => matches(r, view, now))
    rows.sort(sort === 'new' ? (a, b) => b.createdAt - a.createdAt : (a, b) => a.expiresAt - b.expiresAt)
    return rows.slice(0, limit)
  }
  async peek(id: string) { const t = this.t.get(id); return t ? this.row(id, t) : null }
  async revoke(id: string) { const t = this.t.get(id); if (!t || t.status !== 'unused') return false; t.status = 'revoked'; return true }
  async summary(now: number): Promise<Summary> {
    const rows = [...this.t].map(([id, t]) => this.row(id, t))
    const c = (v: View) => rows.filter((r) => matches(r, v, now)).length
    return { total: rows.length, unused: c('unused'), soon: c('soon'), used: c('used'), expired: c('expired'), revoked: c('revoked'), aiToday: this.b.get(day(now)) ?? 0 }
  }
  async purge(now: number) {
    let n = 0
    for (const [id, t] of this.t) if ((t.usedAt ?? t.exp) < now - KEEP_MS) { this.t.delete(id); n++ }
    for (const d of this.b.keys()) if (d < day(now - 40 * 24 * 3600_000)) this.b.delete(d)
    return n
  }
  async consume(id: string, now: number, cap: number): Promise<Deny | null> {
    if (!ID.test(id)) return 'invalid'
    const t = this.t.get(id)
    if (!t) return 'invalid'
    if (t.status !== 'unused' || t.exp <= now) return 'used_or_expired'
    for (const o of this.t.values()) if (o.owner === t.owner && o.usedAt && o.usedAt > now - COOLDOWN_MS) return 'cooldown'
    const d = day(now), n = this.b.get(d) ?? 0
    if (n >= cap) return 'cap'
    this.b.set(d, n + 1); t.status = 'used'; t.usedAt = now
    return null
  }
  async release(id: string, now: number) {
    const t = this.t.get(id); if (!t || t.status !== 'used') return
    t.status = 'unused'; t.usedAt = undefined
    const d = day(now); this.b.set(d, Math.max(0, (this.b.get(d) ?? 1) - 1))
  }
}

/** Cloudflare D1 (타입은 최소한만 선언) */
export interface D1 {
  prepare(sql: string): { bind(...v: unknown[]): { run(): Promise<{ meta: { changes: number } }>; first<T = any>(): Promise<T | null>; all<T = any>(): Promise<{ results: T[] }> } }
}
export class D1Store implements Store {
  constructor(private db: D1) {}
  async issue(owner: string, now: number) {
    const id = hex()
    await this.db.prepare('INSERT INTO tickets (id,owner,status,created_at,expires_at) VALUES (?,?,?,?,?)').bind(id, owner, 'unused', now, now + TICKET_TTL_MS).run()
    return id
  }
  async list(view: View, sort: Sort, now: number, limit: number) {
    const where = { all: '1=1', unused: "status='unused' AND expires_at>?1", used: "status='used'", expired: "status='unused' AND expires_at<=?1", soon: "status='unused' AND expires_at>?1 AND expires_at<=?2", revoked: "status='revoked'" }[view]
    const order = sort === 'new' ? 'created_at DESC' : 'expires_at ASC'
    const r = await this.db.prepare(`SELECT id,owner,status,created_at,expires_at,used_at FROM tickets WHERE ${where} ORDER BY ${order} LIMIT ?3`)
      .bind(now, now + SOON_MS, Math.min(Math.max(limit, 1), 500)).all<{ id: string; owner: string; status: string; created_at: number; expires_at: number; used_at: number | null }>()
    return r.results.map((x) => ({ id: x.id, owner: x.owner, status: x.status, createdAt: x.created_at, expiresAt: x.expires_at, usedAt: x.used_at }))
  }
  async peek(id: string) {
    if (!ID.test(id)) return null
    const x = await this.db.prepare('SELECT id,owner,status,created_at,expires_at,used_at FROM tickets WHERE id=?').bind(id).first<{ id: string; owner: string; status: string; created_at: number; expires_at: number; used_at: number | null }>()
    return x ? { id: x.id, owner: x.owner, status: x.status, createdAt: x.created_at, expiresAt: x.expires_at, usedAt: x.used_at } : null
  }
  async revoke(id: string) {
    if (!ID.test(id)) return false
    const r = await this.db.prepare("UPDATE tickets SET status='revoked' WHERE id=? AND status='unused'").bind(id).run()
    return r.meta.changes === 1
  }
  async summary(now: number): Promise<Summary> {
    const x = await this.db.prepare(
      `SELECT COUNT(*) AS total,
        SUM(status='unused' AND expires_at>?1) AS unused,
        SUM(status='unused' AND expires_at>?1 AND expires_at<=?2) AS soon,
        SUM(status='used') AS used,
        SUM(status='unused' AND expires_at<=?1) AS expired,
        SUM(status='revoked') AS revoked FROM tickets`,
    ).bind(now, now + SOON_MS).first<Record<string, number | null>>()
    const b = await this.db.prepare('SELECT n FROM budget WHERE day=?').bind(day(now)).first<{ n: number }>()
    return { total: x?.total ?? 0, unused: x?.unused ?? 0, soon: x?.soon ?? 0, used: x?.used ?? 0, expired: x?.expired ?? 0, revoked: x?.revoked ?? 0, aiToday: b?.n ?? 0 }
  }
  async purge(now: number) {
    const r = await this.db.prepare('DELETE FROM tickets WHERE COALESCE(used_at, expires_at) < ?').bind(now - KEEP_MS).run()
    await this.db.prepare('DELETE FROM grants WHERE at < ?').bind(now - KEEP_MS).run()
    await this.db.prepare('DELETE FROM budget WHERE day < ?').bind(day(now - 40 * 24 * 3600_000)).run()
    return r.meta.changes
  }
  async consume(id: string, now: number, cap: number): Promise<Deny | null> {
    if (!ID.test(id)) return 'invalid'
    const row = await this.db.prepare('SELECT status, expires_at FROM tickets WHERE id=?').bind(id).first<{ status: string; expires_at: number }>()
    if (!row) return 'invalid'
    if (row.status !== 'unused' || row.expires_at <= now) return 'used_or_expired'
    // 한 문장으로 원자적 처리: 아직 안 쓴 권 + 같은 구매자의 최근 사용 없음
    const r = await this.db.prepare(
      `UPDATE tickets SET status='used', used_at=?1
       WHERE id=?2 AND status='unused' AND expires_at>?1
       AND NOT EXISTS (SELECT 1 FROM tickets o WHERE o.owner=tickets.owner AND o.used_at>?3)`,
    ).bind(now, id, now - COOLDOWN_MS).run()
    if (r.meta.changes !== 1) {
      const again = await this.db.prepare('SELECT status FROM tickets WHERE id=?').bind(id).first<{ status: string }>()
      return again?.status === 'unused' ? 'cooldown' : 'used_or_expired'
    }
    const b = await this.db.prepare('INSERT INTO budget (day,n) VALUES (?1,1) ON CONFLICT(day) DO UPDATE SET n=n+1 WHERE n<?2').bind(day(now), cap).run()
    if (b.meta.changes !== 1) { await this.db.prepare("UPDATE tickets SET status='unused', used_at=NULL WHERE id=?").bind(id).run(); return 'cap' }
    return null
  }
  async release(id: string, now: number) {
    const r = await this.db.prepare("UPDATE tickets SET status='unused', used_at=NULL WHERE id=? AND status='used'").bind(id).run()
    if (r.meta.changes === 1) await this.db.prepare('UPDATE budget SET n=MAX(0,n-1) WHERE day=?').bind(day(now)).run()
  }
}

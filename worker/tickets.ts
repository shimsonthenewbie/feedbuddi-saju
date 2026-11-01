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

export type Deny = 'none' | 'invalid' | 'used_or_expired' | 'cooldown' | 'cap'
export interface Store {
  issue(owner: string, now: number): Promise<string>
  /** 질문권을 쓴다. 성공하면 null, 실패하면 이유. */
  consume(id: string, now: number, cap: number): Promise<Deny | null>
  release(id: string, now: number): Promise<void>
}

const hex = (n = 16) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('')
const day = (now: number) => new Date(now + 9 * 3600_000).toISOString().slice(0, 10) // 한국 날짜 기준
const ID = /^[0-9a-f]{32}$/

export class MemoryStore implements Store {
  t = new Map<string, { owner: string; status: string; exp: number; usedAt?: number }>()
  b = new Map<string, number>()
  async issue(owner: string, now: number) {
    const id = hex(); this.t.set(id, { owner, status: 'unused', exp: now + TICKET_TTL_MS }); return id
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
  prepare(sql: string): { bind(...v: unknown[]): { run(): Promise<{ meta: { changes: number } }>; first<T = any>(): Promise<T | null> } }
}
export class D1Store implements Store {
  constructor(private db: D1) {}
  async issue(owner: string, now: number) {
    const id = hex()
    await this.db.prepare('INSERT INTO tickets (id,owner,status,created_at,expires_at) VALUES (?,?,?,?,?)').bind(id, owner, 'unused', now, now + TICKET_TTL_MS).run()
    return id
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

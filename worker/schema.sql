-- Cloudflare D1: wrangler d1 execute <DB> --file worker/schema.sql
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,           -- 무작위 128비트(hex). 결제 확인 뒤에만 발급
  owner TEXT NOT NULL,           -- 구매자 식별자(로그인 계정 id). 연속 사용 제한 기준
  status TEXT NOT NULL DEFAULT 'unused',  -- unused | used | revoked(주인이 회수)
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);
CREATE INDEX IF NOT EXISTS tickets_owner_used ON tickets(owner, used_at);
CREATE TABLE IF NOT EXISTS budget (day TEXT PRIMARY KEY, n INTEGER NOT NULL);

-- 주인이 직접 지급한 질문권 기록(누가·얼마·왜). 지급은 모두 여기 남긴다.
CREATE TABLE IF NOT EXISTS grants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at INTEGER NOT NULL,
  owner TEXT NOT NULL,
  count INTEGER NOT NULL,
  kind TEXT NOT NULL,            -- compensation | event | test
  reason TEXT NOT NULL
);

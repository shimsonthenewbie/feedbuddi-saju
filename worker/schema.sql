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

-- 로그인 계정(카카오·구글). 이름·이메일은 받지 않고 제공자가 주는 고유 번호만 저장한다.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,           -- 우리가 만든 무작위 id(질문권 owner로도 쓴다)
  provider TEXT NOT NULL,        -- kakao | google
  provider_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(provider, provider_id)
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,   -- 쿠키 값의 SHA-256. 원본은 저장하지 않는다
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
-- 내 사주와 저장한 사람들(이용자가 동의하고 저장한 경우만)
CREATE TABLE IF NOT EXISTS user_data (
  user_id TEXT PRIMARY KEY,
  profile TEXT,                  -- JSON(내 생년월일시·성별·태어난 곳)
  friends TEXT,                  -- JSON(저장한 사람들)
  updated_at INTEGER NOT NULL
);

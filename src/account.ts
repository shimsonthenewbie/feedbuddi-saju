/** 로그인(카카오·구글)과 내 사주 계정 저장 — 화면 쪽 도우미. 서버는 worker/auth.ts. */
export interface AcctState {
  ready: boolean
  in: boolean
  provider: string
  avail: { kakao: boolean; google: boolean }
  /** 서버에 내 사주를 저장하는 데 동의했고 연결된 상태 */
  synced: boolean
  /** 로그인했고 이 기기에 내 사주가 있는데 서버에는 아직 없음 → 저장 동의를 물어야 한다 */
  askConsent: boolean
  /** 로그인 직후 안내 문구(성공/실패) */
  msg: string
}
export const acct: AcctState = { ready: false, in: false, provider: '', avail: { kakao: false, google: false }, synced: false, askConsent: false, msg: '' }

async function post<T = any>(path: string, body: unknown = {}): Promise<T | null> {
  try {
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch { return null }
}

/** 앱을 열 때 한 번: 로그인 상태와 서버에 저장된 내 사주를 가져온다. */
export async function initAccount(): Promise<{ profile: any; friends: any[] } | null> {
  const st = await post<{ kakao: boolean; google: boolean }>('/api/auth/status')
  if (st) acct.avail = st
  const me = await post<{ in: boolean; provider: string }>('/api/auth/me')
  acct.ready = true
  if (!me?.in) return null
  acct.in = true
  acct.provider = me.provider
  const d = await post<{ profile: any; friends: any[] }>('/api/auth/data/get')
  if (d && (d.profile || d.friends.length)) { acct.synced = true; return d }
  acct.askConsent = true
  return null
}
export const pushData = (d: { profile?: unknown; friends?: unknown }) => (acct.synced ? post('/api/auth/data/set', d) : Promise.resolve(null))
export async function consentSave(profile: unknown, friends: unknown): Promise<boolean> {
  const r = await post<{ ok: boolean }>('/api/auth/data/set', { profile, friends })
  if (r?.ok) { acct.synced = true; acct.askConsent = false; return true }
  return false
}
export const logout = () => post('/api/auth/logout')
export const deleteAccount = () => post('/api/auth/delete')

const PROV: Record<string, string> = { kakao: '카카오', google: '구글' }
export function acctHtml(): string {
  if (!acct.ready) return ''
  const msg = acct.msg ? `<p class="${/못|않/.test(acct.msg) ? 'err' : 'note'}" role="status">${acct.msg}</p>` : ''
  if (acct.in) {
    return `<section class="card acct" aria-label="로그인">
      ${msg}<div class="arow"><b>${PROV[acct.provider] ?? ''} 계정으로 로그인 중</b><button type="button" class="linkbtn" id="aout">로그아웃</button></div>
      ${acct.askConsent ? `<div class="aconsent"><p><b>내 사주를 계정에 저장할까요?</b><br>저장하면 휴대폰·컴퓨터 어디서 로그인해도 내 사주가 그대로 나와요.</p>
        <label class="chk"><input type="checkbox" id="aok"> 생년월일·태어난 시각·성별·태어난 곳을 서버에 저장하는 것에 동의해요 (개인정보 수집·이용)</label>
        <p class="note">저장한 정보는 풀이 계산과 기기 간 이동에만 쓰고, 탈퇴하면 바로 지워요. <button type="button" class="linkbtn" data-legal="privacy">개인정보 처리방침</button></p>
        <button type="button" class="go" id="asave">내 사주 저장하기</button></div>` : acct.synced ? '<p class="note">내 사주가 계정에 저장돼 있어요. 다른 기기에서 로그인해도 그대로 나와요.</p>' : ''}
      <p class="note">로그아웃하면 이 기기에 남은 내 사주도 지워져요. <button type="button" class="linkbtn" id="adel">탈퇴하고 모두 지우기</button></p>
    </section>`
  }
  const btns = [acct.avail.kakao ? '<a class="lbtn kakao" href="/api/auth/kakao/start">카카오로 시작하기</a>' : '', acct.avail.google ? '<a class="lbtn google" href="/api/auth/google/start">구글로 시작하기</a>' : ''].join('')
  if (!btns && !msg) return ''
  return `<section class="card acct" aria-label="로그인">${msg}${btns ? '<b>로그인하면 내 사주가 어디서든 따라와요</b>' : ''}
    <p class="note">휴대폰을 바꾸거나 컴퓨터에서 열어도 한 번만 정해 두면 돼요. 이름·이메일은 받지 않아요. 로그인 없이도 무료 맛보기는 그대로 쓸 수 있어요.</p>
    ${btns ? `<div class="lbtns">${btns}</div>` : ''}</section>`
}

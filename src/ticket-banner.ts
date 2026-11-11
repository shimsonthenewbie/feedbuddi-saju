/** 질문권을 가진 사람에게, 만료가 7일 안으로 다가오면 화면 위에 알려 준다. 질문권 번호 외에는 아무것도 보내지 않는다. */
export async function ticketBanner(lang: string): Promise<void> {
  let tk = ''
  try { tk = localStorage.getItem('fb-saju-ticket') || '' } catch { return }
  if (!tk) return
  try {
    const r = await fetch('/api/ticket/status', { method: 'POST', headers: { authorization: `Bearer ${tk}` } })
    const d = await r.json()
    if (!d.ok) return
    if (d.status === 'expired' || d.status === 'revoked') {
      try { localStorage.removeItem('fb-saju-ticket') } catch { /* 쓸 수 없는 질문권은 지운다 */ }
      return
    }
    if (d.status !== 'unused' || d.remainDays > 7) return
    const el = document.createElement('div')
    el.className = 'tk-banner'
    el.setAttribute('role', 'status')
    el.textContent = lang === 'ko'
      ? (d.remainDays <= 1 ? '질문권이 곧 만료돼요. 오늘 안에 써 주세요.' : `질문권이 ${d.remainDays}일 뒤 만료돼요. 그전에 써 주세요.`)
      : (d.remainDays <= 1 ? 'Your ticket expires very soon. Please use it today.' : `Your ticket expires in ${d.remainDays} days. Please use it before then.`)
    document.body.prepend(el)
  } catch { /* 네트워크 오류는 조용히 넘어간다 */ }
}

/** AI 풀이(질문권 사용) 직전에 보여 주는 확인란. 체크하지 않으면 서버로 아무것도 보내지 않는다. */
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

const T = {
  ko: {
    title: 'AI 풀이를 쓰려면 확인해 주세요',
    hint: '아래 두 칸을 모두 체크하면 AI 풀이를 쓰고 질문권 1장이 사용돼요. 체크하지 않으면 기본 풀이만 보여 드리고 아무것도 전송하지 않아요.',
    warn: '이름, 연락처, 주민등록번호, 계좌번호, 다른 사람을 알아볼 수 있는 정보와 건강·질병 같은 민감한 내용은 적지 마세요.',
    age: '만 14세 이상이에요',
    ok: '사주 요약과 적은 글이 AI 풀이를 위해 구글(Google LLC, 미국 등 국외)로 전송되는 것에 동의해요',
    detail: '이전받는 자 Google LLC · 항목 사주 요약, 적은 글 · 목적 AI 풀이 문장 생성 · 거부하면 AI 풀이만 쓸 수 없고 기본 풀이는 그대로 이용할 수 있어요. 자세한 내용은 개인정보 처리방침을 확인해 주세요.',
    sensitive: '주민등록번호, 전화번호, 이메일, 계좌번호처럼 보이는 내용이 있어요. 지운 뒤 다시 시도해 주세요.',
  },
  en: {
    title: 'Please confirm to use an AI reading',
    hint: 'Tick both boxes to use an AI reading, which spends 1 ticket. If you do not, you get the basic reading and nothing is sent.',
    warn: 'Do not write names, contact details, ID or bank numbers, information that identifies other people, or sensitive health details.',
    age: 'I am 14 or older',
    ok: 'I agree that my chart summary and text are sent to Google LLC (United States or other countries) for the AI reading',
    detail: 'Recipient: Google LLC. Data: chart summary and your text. Purpose: generating the reading. If you decline, only the AI reading is unavailable; the basic reading still works. See the privacy policy for details.',
    sensitive: 'This looks like an ID, phone, email or account number. Please remove it and try again.',
  },
}
const tx = (lang: string) => (lang === 'ko' ? T.ko : T.en)

export function aiConsentHtml(lang: string, withWarn: boolean): string {
  const t = tx(lang)
  return `<div class="aiconsent">
    <h3>${esc(t.title)}</h3>
    <p class="note">${esc(t.hint)}</p>
    ${withWarn ? `<p class="note warn"><b>${esc(t.warn)}</b></p>` : ''}
    <label class="chk"><input type="checkbox" class="ac-age"> <span>${esc(t.age)}</span></label>
    <label class="chk"><input type="checkbox" class="ac-ok"> <span>${esc(t.ok)}</span></label>
    <p class="note">${esc(t.detail)}</p>
    <p class="note warn ac-sens" role="alert" hidden>${esc(t.sensitive)}</p>
  </div>`
}

export const aiConsentOk = (root: ParentNode): boolean =>
  !!root.querySelector<HTMLInputElement>('.ac-age')?.checked && !!root.querySelector<HTMLInputElement>('.ac-ok')?.checked

/** 주민등록번호·전화번호·이메일·계좌/카드번호처럼 보이는 글. 완벽한 검사는 아니고 실수 방지용 */
export function looksSensitive(s: string): boolean {
  const d = s.replace(/[\s]/g, '')
  return /\d{6}-?[1-4]\d{6}/.test(d) || /01[016789]-?\d{3,4}-?\d{4}/.test(d) || /[\w.+-]+@[\w-]+\.[\w.-]+/.test(s) || /\d{2,6}-\d{2,6}-\d{2,8}/.test(d) || /\d{4}-?\d{4}-?\d{4}-?\d{4}/.test(d)
}

export function showSensitive(root: ParentNode, on: boolean): void {
  const el = root.querySelector<HTMLElement>('.ac-sens')
  if (el) el.hidden = !on
}

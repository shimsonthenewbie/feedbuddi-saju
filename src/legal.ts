/** 개인정보 처리방침·이용약관 (실제 동작 기준). 유료 결제·사업자 등록 전 전문가 검토 필요. */
export type LegalDoc = 'privacy' | 'terms'
interface Sec { h: string; p: string[] }
interface Doc { title: string; date: string; secs: Sec[] }
const REPO = 'https://github.com/shimsonthenewbie/feedbuddi-saju/issues'

const ko: Record<LegalDoc, Doc> = {
  privacy: {
    title: '개인정보 처리방침', date: '시행일: 2026년 11월 9일',
    secs: [
      { h: '1. 처리하는 정보', p: ['생년월일·태어난 시각·성별·태어난 곳(풀이를 위해 직접 입력한 값), 상담에 적은 고민 글, 관상용 얼굴 사진(이용자가 올린 경우)을 처리해요.'] },
      { h: '2. 얼굴 사진', p: ['사진은 이용자의 기기 안에서만 분석해요. 서버로 보내지 않고, 저장하지 않고, 어디에도 기록하지 않아요.', '분석에 쓰는 얼굴 인식 모델 파일은 우리 사이트에서 내려받아 기기에서 실행해요. 사진이 구글 등 외부로 나가지 않아요.', '사진과 분석 중간값은 화면을 닫거나 다른 화면으로 가면 사라져요. 얼굴 특징으로 특정인을 알아보는 용도로는 쓰지 않아요.'] },
      { h: '3. 입력값의 보관', p: ['생년월일 등 입력값은 이용자 기기의 브라우저 저장소에만 저장돼요(다음에 다시 입력하지 않게 하려는 목적). 우리 서버에는 저장하지 않아요. 이용자가 "다시 입력하기"를 누르거나 브라우저 데이터를 지우면 삭제돼요.'] },
      { h: '4. AI 풀이를 쓸 때의 전송', p: ['질문권으로 AI 풀이를 요청하면, 계산된 사주 요약과 적은 고민 글이 우리 서버(Cloudflare)를 거쳐 구글 Gemini로 전송돼 문장을 다듬어요. 이때 이름이나 얼굴 사진은 보내지 않아요. 이 전송은 구글(미국 등 국외 서버)에서 처리될 수 있어요.', 'AI 풀이를 요청하지 않으면 이 전송은 일어나지 않아요.'] },
      { h: '5. 질문권·이용 기록', p: ['질문권 번호와 사용 여부, 하루 사용 횟수를 서버(Cloudflare D1)에 저장해요. 이름·연락처·생년월일은 함께 저장하지 않아요. 질문권은 발급 후 30일이 지나면 만료돼요.', '접속 주소(IP) 등 기술 로그는 인프라 제공사(Cloudflare)가 보안·운영을 위해 처리할 수 있어요.'] },
      { h: '6. 쿠키·광고', p: ['현재는 광고·분석용 쿠키를 쓰지 않아요. 광고나 분석 도구를 붙이게 되면 이 방침을 고치고 동의를 받아요.'] },
      { h: '7. 이용자의 권리', p: ['이용자는 언제든 자신의 정보 열람·삭제를 요청할 수 있어요. 기기에 저장된 값은 "다시 입력하기"나 브라우저 설정에서 직접 지울 수 있어요.', `문의: ${REPO}`] },
      { h: '8. 방침의 변경', p: ['내용이 바뀌면 이 화면에 시행일과 함께 알려요.'] },
    ],
  },
  terms: {
    title: '이용약관', date: '시행일: 2026년 11월 9일',
    secs: [
      { h: '1. 서비스의 성격', p: ['용용신점는 전통 명리학(자평명리 기준)의 이론으로 계산한 결과를 보여 주는 재미·참고용 서비스예요. 사건을 확정하는 예언이 아니에요. 유파에 따라 해석이 다를 수 있어요.'] },
      { h: '2. 중요한 결정', p: ['풀이는 의학·법률·투자 조언이 아니에요. 건강, 법률, 투자와 금전 결정은 스스로 판단해야 하고, 무리한 주식·코인 투자나 빚을 내는 투자는 권하지 않아요.'] },
      { h: '3. 관상(얼굴 사진)', p: ['관상은 얼굴 비율로 보는 재미용 경향 풀이예요. 사람의 능력·성격·가치를 단정하지 않고, 외모를 평가하는 용도가 아니에요.', '본인 사진이거나, 사진 속 사람의 허락을 받은 사진만 올려 주세요. 허락 없이 다른 사람 사진을 올리면 안 돼요. 만 14세 미만은 보호자 동의 없이 사진을 올릴 수 없어요.'] },
      { h: '4. 이용 방법', p: ['서비스를 자동화 수단으로 대량 호출하거나, 질문권을 사고팔거나, 서비스를 방해하는 행위는 할 수 없어요.'] },
      { h: '5. 유료 이용', p: ['유료 결제는 준비 중이에요. 시작할 때 가격, 이용 범위, 환불 기준을 이 약관과 결제 화면에 따로 알려요.'] },
      { h: '6. 책임의 한계', p: ['풀이를 근거로 한 결정의 결과에 대해 서비스는 책임지지 않아요. 계산 오류를 발견하면 알려 주세요. 바로잡을게요.'] },
      { h: '7. 소스 코드', p: ['이 사이트의 소스 코드는 AGPL-3.0으로 공개돼 있어요. 사주 계산 엔진은 오픈소스 orrery(AGPL-3.0)를 사용해요.'] },
    ],
  },
}
const en: Record<LegalDoc, Doc> = {
  privacy: {
    title: 'Privacy policy', date: 'Effective: 9 Nov 2026',
    secs: [
      { h: '1. What we process', p: ['Birth date, time, gender and place you type in for a reading; the worry text you write in Ask; and a face photo if you upload one.'] },
      { h: '2. Face photos', p: ['Photos are analysed only on your device. They are not uploaded, stored or logged anywhere.', 'The face model files are downloaded from our own site and run on your device, so no photo goes to Google or any third party.', 'The photo and intermediate values disappear when you leave the screen. We do not use faces to identify anyone.'] },
      { h: '3. Saved input', p: ['Your birth details are kept only in your browser storage on your device, so you do not retype them. They are not stored on our servers. They are removed when you press "Change" or clear browser data.'] },
      { h: '4. When you use AI readings', p: ['If you spend a ticket on an AI reading, a computed chart summary and the text you wrote are sent through our server (Cloudflare) to Google Gemini to polish the wording. No name or photo is sent. Google may process this outside your country.', 'Without an AI request, no such transfer happens.'] },
      { h: '5. Tickets and usage', p: ['Ticket codes, whether they were used and daily counts are stored on our server (Cloudflare D1), without name, contact or birth data. Tickets expire 30 days after issue.', 'Technical logs such as IP address may be processed by our infrastructure provider (Cloudflare) for security and operations.'] },
      { h: '6. Cookies and ads', p: ['We currently use no advertising or analytics cookies. If we add them, we will update this policy and ask for consent.'] },
      { h: '7. Your rights', p: ['You may ask to see or delete your data at any time. Data on your device can be removed with "Change" or browser settings.', `Contact: ${REPO}`] },
      { h: '8. Changes', p: ['Changes will be shown here with an effective date.'] },
    ],
  },
  terms: {
    title: 'Terms of use', date: 'Effective: 9 Nov 2026',
    secs: [
      { h: '1. Nature of the service', p: ['Yongyong Sinjeom shows results calculated from traditional Korean saju theory (Ziping school) for fun and reference. It does not predict fixed events. Schools may interpret differently.'] },
      { h: '2. Important decisions', p: ['Readings are not medical, legal or investment advice. Health, legal and money decisions are yours. We do not recommend reckless stock or crypto bets or investing with borrowed money.'] },
      { h: '3. Face reading (photos)', p: ['Face reading is a for-fun tendency reading from face proportions. It does not judge ability, character or worth, and is not an appearance rating.', 'Upload only your own photo, or one the person has allowed you to use. Do not upload others\' photos without permission. Under 14 needs a guardian\'s consent.'] },
      { h: '4. Use', p: ['Do not bulk-call the service with automation, trade tickets, or interfere with the service.'] },
      { h: '5. Paid use', p: ['Payments are not open yet. Price, scope and refund rules will be shown separately before they start.'] },
      { h: '6. Limits of liability', p: ['We are not responsible for outcomes of decisions based on readings. If you find a calculation error, tell us and we will fix it.'] },
      { h: '7. Source code', p: ['This site\'s source code is published under AGPL-3.0. Chart calculation uses the open-source orrery engine (AGPL-3.0).'] },
    ],
  },
}
export const legalDoc = (doc: LegalDoc, lang: string): Doc => (lang === 'ko' ? ko : en)[doc]

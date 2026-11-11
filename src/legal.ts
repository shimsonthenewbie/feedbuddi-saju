/** 개인정보 처리방침·이용약관 (실제 동작 기준). 유료 결제·사업자 등록 전 전문가 검토 필요. */
export type LegalDoc = 'privacy' | 'terms'
interface Sec { h: string; p: string[] }
interface Doc { title: string; date: string; secs: Sec[] }
const REPO = 'followonder99@gmail.com'
const SRC = 'https://github.com/shimsonthenewbie/feedbuddi-saju'

const ko: Record<LegalDoc, Doc> = {
  privacy: {
    title: '개인정보 처리방침', date: '시행일: 2026년 11월 11일 (이전 시행일: 2026년 11월 9일)',
    secs: [
      { h: '1. 처리하는 정보와 목적', p: ['풀이 계산: 생년월일·태어난 시각·성별·태어난 곳(이용자가 직접 입력한 값).', 'AI 풀이(질문권 사용 시): 상담에 적은 고민 글, 계산된 사주 요약.', '관상·손 모양: 이용자가 올린 얼굴·손 사진(기기 안에서만 분석).', '질문권 운영: 질문권 번호, 사용 여부, 하루 사용 횟수.', '자동 수집: 접속 주소(IP), 브라우저 정보 등 기술 로그(인프라 제공사가 보안·운영 목적으로 처리).', '현재 회원가입과 로그인은 없고, 이름·연락처·주민등록번호는 받지 않아요.'] },
      { h: '2. 얼굴·손 사진', p: ['사진은 이용자의 기기 안에서만 분석해요. 서버로 보내지 않고 저장하지 않아요.', '분석에 쓰는 인식 모델 파일은 우리 사이트에서 내려받아 기기에서 실행해요. 사진이 구글 등 외부로 나가지 않아요.', '사진과 분석 중간값은 화면을 닫거나 다른 화면으로 가면 사라져요. 얼굴·손의 특징으로 특정인을 알아보는 용도로는 쓰지 않아요.'] },
      { h: '3. 입력값의 보관', p: ['생년월일 등 입력값과 사용 전 질문권 번호는 이용자 기기의 브라우저 저장소(localStorage)에만 저장돼요(다음에 다시 입력하지 않게 하려는 목적). 우리 서버에는 저장하지 않아요. 이용자가 "다시 입력하기"를 누르거나 브라우저 설정에서 사이트 데이터를 지우면 삭제돼요. 저장을 거부하면 매번 다시 입력해야 할 수 있어요.'] },
      { h: '4. AI 풀이를 쓸 때의 전송(국외 이전)', p: ['질문권으로 AI 풀이를 요청하면 계산된 사주 요약과 적은 고민 글이 우리 서버(Cloudflare)를 거쳐 Google LLC의 Gemini로 전송돼 문장을 다듬어요. 이름과 사진은 보내지 않아요.', '이전받는 자: Google LLC(미국 등 국외 서버). 이전 항목: 사주 요약, 고민 글. 목적: 풀이 문장 생성. 시기·방법: 이용자가 AI 풀이를 요청할 때 암호화된 통신으로 전송. 보유·이용 기간: 우리는 전송한 글을 저장하지 않아요. 구글에서의 보관 기간과 이용 조건은 이용 중인 Google Gemini API의 약관과 정책에 따르며, 확인된 내용은 이 방침에 구체적으로 알려요.', '질문권이 없거나, AI 풀이 확인란에 체크하지 않으면 고민 글과 사주 요약은 우리 서버로도 구글로도 전송되지 않고 이 기기 안에서 기본 풀이만 만들어요. AI 풀이를 쓸 때는 시작 전에 확인란(만 14세 이상, 국외 이전 동의)에 체크해야 하며, 동의하지 않아도 기본 풀이는 그대로 이용할 수 있어요.'] },
      { h: '5. 질문권·이용 기록과 보유 기간', p: ['질문권 번호와 사용 여부, 하루 사용 횟수를 서버(Cloudflare D1)에 저장해요. 이름·연락처·생년월일은 함께 저장하지 않아요. 질문권은 발급 후 30일이 지나면 만료돼요.', '운영자가 질문권을 지급한 경우 지급 기록(질문권을 구분하기 위한 임의 식별값, 수량, 사유)을 남겨요. 로그인이 없는 동안 이메일·전화번호 같은 연락처는 식별값으로 쓰지 않아요.', '보유 기간: 질문권 기록은 만료 또는 사용 후 1년까지 보관해요(분쟁·부정 사용 확인 목적). 보유 기간이 지나거나 목적이 달성되면 지체 없이 복구할 수 없는 방법으로 삭제하고, 법령에 따라 보관해야 하는 정보는 다른 정보와 분리해 그 기간 동안만 보관해요.'] },
      { h: '6. 처리의 위탁과 국외 이전', p: ['Cloudflare, Inc.(미국 등): 사이트 제공, 접속 처리, 질문권 저장. 접속 주소 등 기술 로그가 처리될 수 있어요.', 'Google LLC(미국 등): AI 풀이 문장 생성(4번 참고). 화면의 글꼴은 우리 사이트에서 직접 제공해서, 글꼴 때문에 방문자의 접속 주소(IP)가 구글로 전달되지 않아요.', 'AI 풀이 전송을 원하지 않으면 해당 기능을 쓰지 않으면 돼요. 각 업체의 구체적인 처리 범위는 확인되는 대로 이 방침에 알려요.'] },
      { h: '7. 쿠키·광고', p: ['현재는 광고·분석용 쿠키를 쓰지 않아요. 광고나 분석 도구를 붙이게 되면 이 방침을 먼저 고치고, 필요한 경우 동의를 받아요. 브라우저 설정에서 쿠키와 저장 데이터를 거부하거나 삭제할 수 있어요.'] },
      { h: '8. 만 14세 미만', p: ['AI 풀이처럼 정보를 서버로 보내는 기능은 만 14세 이상만 쓸 수 있어요. 사용 전에 만 14세 이상인지 확인하는 체크를 받고, 만 14세 미만이면 쓸 수 없어요. 기본 풀이와 사진 분석은 정보를 서버로 보내지 않아요.'] },
      { h: '9. 민감한 정보 입력 주의', p: ['고민 글에 건강 상태, 주민등록번호, 계좌·카드 번호, 연락처, 다른 사람의 실명처럼 민감하거나 식별되는 정보는 적지 말아 주세요. 적은 글은 AI 풀이를 위해 국외로 전송될 수 있어요.'] },
      { h: '10. 안전성 확보 조치', p: ['모든 통신은 HTTPS로 암호화해요. 질문권 번호는 무작위로 만들고, 관리 기능은 별도 비밀값으로만 접근할 수 있게 제한해요. 꼭 필요한 정보만 받고, 서버에는 이름·연락처·생년월일·사진을 저장하지 않아요.'] },
      { h: '11. 이용자의 권리와 문의', p: ['이용자는 언제든 자신의 정보에 대한 열람, 정정, 삭제, 처리정지를 요청할 수 있어요. 기기에 저장된 값은 "다시 입력하기"나 브라우저 설정에서 직접 지울 수 있어요. 서버 기록은 질문권 번호 등 본인 확인이 가능한 정보와 함께 요청해 주세요.', `개인정보 보호책임자: 용용사주 운영자 / 문의·권리 행사 접수: ${REPO}`, '요청은 지체 없이 처리하고, 법령이 정한 기한 안에 결과를 알려요.', '개인정보 침해 관련 상담·신고: 개인정보침해신고센터(privacy.kisa.or.kr, 118), 개인정보 분쟁조정위원회(1833-6972), 대검찰청 사이버범죄 신고(1301), 경찰청 사이버범죄 신고(182).'] },
      { h: '12. 방침의 변경', p: ['내용이 바뀌면 이 화면에 시행일과 함께 알리고, 이용자에게 불리하거나 중요한 변경은 시행 30일 전에 알려요.'] },
    ],
  },
  terms: {
    title: '이용약관', date: '시행일: 2026년 11월 11일 (이전 시행일: 2026년 11월 9일)',
    secs: [
      { h: '1. 서비스의 성격', p: ['용용사주는 전통 명리학(자평명리 기준)의 이론으로 계산한 결과를 보여 주는 재미·참고용 서비스예요. 사건을 확정하는 예언이 아니에요. 유파에 따라 해석이 다를 수 있어요.', '"용하디 용한" 같은 표현은 서비스의 이름과 분위기를 나타내는 말이고, 결과의 정확성이나 적중을 보장하는 뜻이 아니에요.'] },
      { h: '2. 중요한 결정', p: ['풀이는 의학·법률·투자 조언이 아니에요. 건강, 법률, 투자와 금전 결정은 스스로 판단해야 하고, 무리한 주식·코인 투자나 빚을 내는 투자는 권하지 않아요.'] },
      { h: '3. 관상·손 모양(사진)', p: ['관상과 손 모양 풀이는 비율로 보는 재미용 경향 풀이예요. 사람의 능력·성격·가치를 단정하지 않고, 외모를 평가하는 용도가 아니에요.', '본인 사진이거나, 사진 속 사람의 허락을 받은 사진만 올려 주세요. 허락 없이 다른 사람 사진을 올리면 안 돼요. 만 14세 미만은 보호자의 동의 없이 사진을 올릴 수 없어요.'] },
      { h: '4. 이용 방법과 금지 행위', p: ['서비스를 자동화 수단으로 대량 호출하거나, 질문권을 사고팔거나, 서비스 운영을 방해하는 행위, 다른 사람의 정보를 도용하는 행위는 할 수 없어요. 어기면 이용을 제한할 수 있어요.'] },
      { h: '5. 유료 이용', p: ['유료 결제는 준비 중이에요. 시작할 때 사업자 정보(상호, 대표자, 주소, 연락처, 통신판매업 신고번호), 가격, 이용 범위, 환불 기준, 청약철회 가능 여부를 이 약관과 결제 화면에 따로 알려요.', '사용하지 않은 질문권은 법령이 정한 기간과 요건에 따라 청약철회와 환불이 가능해요. 질문권을 써서 AI 풀이가 제공된 부분은 전자상거래법이 정한 요건을 갖춘 경우에 한해 청약철회가 제한될 수 있고, 그 사실을 결제 전에 결제 화면에서 알려요. 시스템 오류, 중복 결제, 질문권만 차감되고 풀이가 제공되지 않은 경우에는 질문권 복구, 재제공 또는 환불로 처리해요. 이 안내는 유료 이용이 시작될 때 가격, 유효기간과 함께 구체적으로 보완돼요.'] },
      { h: '6. 책임의 한계', p: ['풀이는 오락과 참고를 위한 정보이고, 이용자가 풀이를 참고해 독립적으로 내린 결정의 결과에 대해서는 서비스에 귀책사유가 없는 범위에서 책임지지 않아요. 서비스의 고의 또는 과실로 이용자에게 손해가 생기면 법령에 따라 책임지고, 이 약관은 법령이 인정하는 이용자의 권리를 제한하지 않아요. 천재지변이나 외부 서비스(Cloudflare, Google 등)의 장애처럼 서비스가 막을 수 없는 사유로 제공하지 못한 경우에는 책임을 지지 않아요. 계산 오류를 발견하면 알려 주세요. 바로잡을게요.'] },
      { h: '7. 소스 코드', p: [`이 사이트의 소스 코드는 AGPL-3.0으로 공개돼 있어요(${SRC}). 사주 계산 엔진은 오픈소스 orrery(AGPL-3.0)를 사용해요.`] },
      { h: '8. 약관의 변경', p: ['약관을 바꿀 때는 적용일과 바꾼 이유를 이 화면에 알려요. 일반적인 변경은 적용 7일 전, 이용자에게 불리하거나 중요한 변경은 적용 30일 전에 알려요. 별도의 동의가 필요한 변경은 이용자의 동의를 받아요. 이미 결제한 유료 이용에는 법령과 구매 당시의 조건이 우선하고, 이용자의 법정 권리를 부당하게 제한하지 않아요.'] },
      { h: '9. 문의와 분쟁', p: [`문의: ${REPO}`, '이 약관은 대한민국 법을 따르고, 분쟁은 법령이 정한 관할 법원에서 해결해요.'] },
    ],
  },
}
const en: Record<LegalDoc, Doc> = {
  privacy: {
    title: 'Privacy policy', date: 'Effective: 11 Nov 2026 (previous: 9 Nov 2026)',
    secs: [
      { h: '1. What we process and why', p: ['For readings: birth date, time, gender and place you type in.', 'For AI readings (when you spend a ticket): the worry text you write and a computed chart summary.', 'For face and hand reading: the photo you upload (analysed only on your device).', 'For tickets: ticket codes, whether used, and daily counts.', 'Automatically: IP address and browser information in technical logs, processed by our infrastructure provider for security and operations.', 'There is no sign-up or login for now, and we do not ask for your name, contact details or ID numbers.'] },
      { h: '2. Face and hand photos', p: ['Photos are analysed only on your device. They are not uploaded to or stored on our servers.', 'The model files are downloaded from our own site and run on your device, so no photo goes to Google or any third party.', 'The photo and intermediate values disappear when you leave the screen. We do not use faces or hands to identify anyone.'] },
      { h: '3. Saved input', p: ['Your birth details and any unused ticket code are kept only in your browser storage (localStorage) on your device, so you do not retype them. They are not stored on our servers. They are removed when you press "Change" or clear site data in your browser. If you block storage, you may have to retype them each time.'] },
      { h: '4. AI readings and transfer abroad', p: ['If you spend a ticket on an AI reading, a computed chart summary and the text you wrote are sent through our server (Cloudflare) to Google LLC\'s Gemini to polish the wording. No name or photo is sent.', 'Recipient: Google LLC (United States or other countries). Data: chart summary and your text. Purpose: generating the reading text. When and how: when you request an AI reading, over encrypted connections. Retention: we do not store the text we send. Retention and use at Google follow the terms and policies of the Google Gemini API we use, and we will state confirmed details in this policy.', 'Without a ticket, or if you do not tick the AI confirmation boxes, your text and chart summary are sent neither to our server nor to Google; only the basic reading is built on your device. Before an AI reading you must tick the boxes (14 or older, consent to the transfer abroad). If you decline, the basic reading still works.'] },
      { h: '5. Tickets, usage records and retention', p: ['Ticket codes, whether they were used and daily counts are stored on our server (Cloudflare D1), without name, contact or birth data. Tickets expire 30 days after issue.', 'If the operator grants tickets, we record the grant (an arbitrary identifier used to tell tickets apart, amount, reason). While there is no login, contact details such as email or phone are not used as the identifier.', 'Retention: ticket records are kept for up to one year after expiry or use (for disputes and abuse checks). When the period ends or the purpose is met, they are deleted without delay by an irreversible method; data we must keep by law is kept separately for the required period only.'] },
      { h: '6. Processors and transfers abroad', p: ['Cloudflare, Inc. (United States or other countries): hosting, request handling and ticket storage. Technical logs such as IP address may be processed.', 'Google LLC (United States or other countries): AI wording (see 4). Fonts are served from our own site, so your IP address is not sent to Google because of fonts.', 'If you do not want the AI transfer, do not use that feature. We will state each provider\'s exact processing scope here as it is confirmed.'] },
      { h: '7. Cookies and ads', p: ['We currently use no advertising or analytics cookies. If we add them, we will update this policy first and ask for consent where required. You can block or delete cookies and stored data in your browser settings.'] },
      { h: '8. Children', p: ['Features that send data to our server, such as AI readings, are for users aged 14 or older. We ask you to confirm your age before use, and children under 14 may not use them. The basic reading and photo analysis do not send data to our server.'] },
      { h: '9. Do not enter sensitive data', p: ['Please do not write health conditions, ID numbers, bank or card numbers, contact details or real names of other people in your worry text. The text may be sent abroad for AI readings.'] },
      { h: '10. Security', p: ['All traffic uses HTTPS. Ticket codes are random, and admin functions are limited to a separate secret. We collect only what is needed and do not store names, contact details, birth data or photos on our servers.'] },
      { h: '11. Your rights and contact', p: ['You may ask to access, correct, delete or restrict processing of your data at any time. Data on your device can be removed with "Change" or browser settings. For server records, include something that lets us confirm it is yours, such as the ticket code.', `Privacy contact: Yongyong Saju operator / ${REPO}`, 'We handle requests without delay and tell you the result within the time the law requires.', 'In Korea you may also contact the Personal Information Infringement Report Center (privacy.kisa.or.kr, 118) or the Personal Information Dispute Mediation Committee (1833-6972).'] },
      { h: '12. Changes', p: ['Changes will be shown here with an effective date, and changes that are disadvantageous or important are announced 30 days before they take effect.'] },
    ],
  },
  terms: {
    title: 'Terms of use', date: 'Effective: 11 Nov 2026 (previous: 9 Nov 2026)',
    secs: [
      { h: '1. Nature of the service', p: ['Yongyong Saju shows results calculated from traditional Korean saju theory (Ziping school) for fun and reference. It does not predict fixed events. Schools may interpret differently.', 'Phrases such as "uncannily accurate" describe the brand\'s tone and do not promise accuracy or that a reading will come true.'] },
      { h: '2. Important decisions', p: ['Readings are not medical, legal or investment advice. Health, legal and money decisions are yours. We do not recommend reckless stock or crypto bets or investing with borrowed money.'] },
      { h: '3. Face and hand reading (photos)', p: ['These are for-fun tendency readings from proportions. They do not judge ability, character or worth, and are not an appearance rating.', 'Upload only your own photo, or one the person has allowed you to use. Do not upload others\' photos without permission. Under 14 needs a guardian\'s consent.'] },
      { h: '4. Use and prohibited acts', p: ['Do not bulk-call the service with automation, trade tickets, interfere with operations, or use another person\'s information. We may restrict use if these terms are broken.'] },
      { h: '5. Paid use', p: ['Payments are not open yet. Before they start we will show business details (name, representative, address, contact, mail-order registration number), price, scope, refund rules and whether withdrawal is possible, in these terms and at checkout.', 'Unused tickets can be withdrawn and refunded within the period and conditions set by law. For AI readings already delivered with a ticket, withdrawal may be limited only where the law\'s requirements are met, and we will say so on the checkout screen before you pay. If a system error, double payment, or a ticket spent without a reading being delivered occurs, we restore the ticket, provide the reading again, or refund. This section will be completed with price and validity when paid use starts.'] },
      { h: '6. Limits of liability', p: ['Readings are for entertainment and reference. We are not responsible for the outcome of decisions you make independently based on a reading, to the extent we are not at fault. We remain liable as the law requires for damage caused by our intent or negligence, and these terms do not limit rights the law grants you. We are not responsible when we cannot provide the service because of causes we cannot prevent, such as natural disasters or outages of outside services (Cloudflare, Google, etc.). If you find a calculation error, tell us and we will fix it.'] },
      { h: '7. Source code', p: [`This site's source code is published under AGPL-3.0 (${SRC}). Chart calculation uses the open-source orrery engine (AGPL-3.0).`] },
      { h: '8. Changes to these terms', p: ['We will post the effective date and the reason for a change here. Ordinary changes are announced 7 days before they apply, and changes that are disadvantageous or important 30 days before. Changes that need your consent will ask for it. For paid use already purchased, the law and the conditions at the time of purchase take priority, and we will not unfairly limit your legal rights.'] },
      { h: '9. Contact and disputes', p: [`Contact: ${REPO}`, 'These terms follow the laws of the Republic of Korea, and disputes go to the court with jurisdiction under the law.'] },
    ],
  },
}
export const legalDoc = (doc: LegalDoc, lang: string): Doc => (lang === 'ko' ? ko : en)[doc]

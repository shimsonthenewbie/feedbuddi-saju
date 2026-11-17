/**
 * 유료화 준비용 상품 목록과 열람 판정.
 * 지금은 OPEN_BETA = true 라서 모든 화면이 그대로 열린다(겉으로 달라지는 것 없음).
 * 결제·로그인을 붙일 때 이 파일의 판정만 바꾸면 화면 쪽은 손대지 않아도 된다.
 *
 * 등급
 *  - free  : 가입 없이 누구나 (오늘의 운세, 무료 사주 맛보기 등)
 *  - login : 로그인만 하면 무료
 *  - paid  : 결제 필요 (가격은 아직 미정이라 null)
 */
export type Tier = 'free' | 'login' | 'paid'
export interface Product { tier: Tier; nameKo: string; price: number | null }

/** 시험 오픈 기간에는 true. 정식 오픈 때 false 로 바꾼다. */
export const OPEN_BETA = true

// 사장님이 정한 원칙: 오늘의 운세는 가입 없이 무료, 무료 사주 1회, 토정비결·주역·택일은 유료,
// 분야별 풀이는 소액(약 990원, 미확정), 나머지는 로그인. 확정되지 않은 값은 null 로 둔다.
export const CATALOG: Record<string, Product> = {
  home: { tier: 'free', nameKo: '홈', price: null },
  today: { tier: 'free', nameKo: '오늘의 운세', price: null },
  free: { tier: 'free', nameKo: '무료 사주 맛보기', price: null },
  legal: { tier: 'free', nameKo: '약관·안내', price: null },
  shop: { tier: 'free', nameKo: '상점', price: null },
  invite: { tier: 'free', nameKo: '초대', price: null },
  tojeong: { tier: 'paid', nameKo: '토정비결', price: null },
  iching: { tier: 'paid', nameKo: '오늘의 한 괘(주역)', price: null },
  taegil: { tier: 'paid', nameKo: '택일', price: null },
  pick: { tier: 'paid', nameKo: '날짜 고르기', price: null },
  year: { tier: 'paid', nameKo: '올해 운세', price: null },
  newyear: { tier: 'paid', nameKo: '신년 운세', price: null },
  report: { tier: 'paid', nameKo: '분야별 풀이', price: null },
  exam: { tier: 'paid', nameKo: '시험·합격운', price: null },
  ask: { tier: 'paid', nameKo: '고민 상담(질문권)', price: null },
  solo: { tier: 'login', nameKo: '내 사주 풀이', price: null },
  match: { tier: 'login', nameKo: '궁합', price: null },
  star: { tier: 'login', nameKo: '별자리', price: null },
  astro: { tier: 'login', nameKo: '출생차트', price: null },
  face: { tier: 'login', nameKo: '관상', price: null },
  hand: { tier: 'login', nameKo: '손금', price: null },
  name: { tier: 'login', nameKo: '이름 풀이', price: null },
  koname: { tier: 'login', nameKo: '한국 이름 짓기', price: null },
  gusung: { tier: 'login', nameKo: '구성학', price: null },
  mbti: { tier: 'login', nameKo: 'MBTI와 사주', price: null },
  dream: { tier: 'login', nameKo: '꿈풀이', price: null },
  tarot: { tier: 'login', nameKo: '타로', price: null },
}

export interface Viewer { loggedIn: boolean; owned: string[] }
export type Access = 'open' | 'need-login' | 'need-pay'
/** 이 사람이 이 화면을 볼 수 있는지. 시험 오픈 중이면 항상 open. */
export function access(mode: string, viewer: Viewer = { loggedIn: false, owned: [] }, beta = OPEN_BETA): Access {
  const p = CATALOG[mode]
  if (beta || !p || p.tier === 'free') return 'open'
  if (!viewer.loggedIn) return 'need-login'
  if (p.tier === 'paid' && !viewer.owned.includes(mode)) return 'need-pay'
  return 'open'
}

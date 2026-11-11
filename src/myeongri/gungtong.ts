/**
 * 궁통보감(窮通寶鑑) 십간분론의 큰 방향: 일간 x 계절 -> 필요한 천간 순서(앞이 우선).
 * 주의: 원문의 월별(120칸) 표가 아니라 계절 단위로 줄인 "참고 후보"다.
 * 출처 대조 상태: 乙은 블로그 원문 해설과 일치. 나머지는 제미나이 요약과 대조했고, 원문 직접 대조는 아직 안 함.
 * 그래서 풀이 판정(용신)에는 쓰지 않고, 확인된 뒤에 연결한다. 번역문은 옮기지 않고 규칙만 다시 적었다.
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type StemName = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸'

export const GUNGTONG: Record<StemName, Record<Season, string>> = {
  甲: { spring: '庚丁丙', summer: '癸庚丁', autumn: '丁庚丙', winter: '丁丙庚' },
  乙: { spring: '丙癸', summer: '癸丙', autumn: '癸丙', winter: '丙' },
  丙: { spring: '壬庚', summer: '壬庚', autumn: '壬甲', winter: '甲壬戊' },
  丁: { spring: '甲庚', summer: '甲壬庚', autumn: '甲庚丙', winter: '甲庚' },
  戊: { spring: '丙甲癸', summer: '壬甲丙', autumn: '丙癸甲', winter: '丙甲' },
  己: { spring: '丙癸甲', summer: '癸丙', autumn: '丙癸', winter: '丙甲' },
  庚: { spring: '丁甲壬', summer: '壬癸', autumn: '丁甲', winter: '丁丙' },
  辛: { spring: '壬甲', summer: '壬癸', autumn: '壬甲', winter: '丙壬' },
  壬: { spring: '庚辛戊', summer: '辛癸庚', autumn: '甲戊', winter: '戊丙' },
  癸: { spring: '辛丙', summer: '辛庚癸', autumn: '辛丙', winter: '丙辛' },
}

/** 월지 -> 계절. 인묘진=봄, 사오미=여름, 신유술=가을, 해자축=겨울 */
export const seasonOfBranch = (b: string): Season =>
  '寅卯辰'.includes(b) ? 'spring' : '巳午未'.includes(b) ? 'summer' : '申酉戌'.includes(b) ? 'autumn' : 'winter'

/** 오행 얼굴형 비율(초안). 측정값 z → 다섯 기운의 섞인 정도. 규칙은 전통 설명(목=길고 마른, 화=턱이 뾰족, 토=두툼, 금=각지고 단단, 수=둥글고 통통)을 단순화한 것이다. */
import type { Metrics } from './measure'
import { NORM } from './read'
type K = keyof typeof NORM
export type El5 = 'tree' | 'fire' | 'earth' | 'metal' | 'water'
export const EL5: El5[] = ['tree', 'fire', 'earth', 'metal', 'water']
const z = (m: Metrics, k: K) => (m[k] - NORM[k][0]) / NORM[k][1]

export function wuxingOf(m: Metrics): { el: El5; pct: number }[] {
  const raw: Record<El5, number> = {
    tree: 1.0 * z(m, 'ratio') - 0.5 * z(m, 'jaw') - 0.2 * z(m, 'lip'),
    fire: -0.9 * z(m, 'jaw') + 0.4 * z(m, 'upper') + 0.4 * z(m, 'eyeTilt') - 0.2 * z(m, 'lip'),
    earth: 0.6 * z(m, 'jaw') + 0.5 * z(m, 'noseW') + 0.5 * z(m, 'lower') - 0.2 * z(m, 'ratio'),
    metal: 0.7 * z(m, 'jaw') - 0.4 * z(m, 'lip') - 0.4 * z(m, 'eyeW') - 0.3 * z(m, 'browArch'),
    water: -0.8 * z(m, 'ratio') + 0.5 * z(m, 'lip') + 0.4 * z(m, 'eyeW') - 0.3 * z(m, 'jaw'),
  }
  const ex = EL5.map((e) => Math.exp(raw[e] * 0.9))
  const sum = ex.reduce((a, b) => a + b, 0)
  let pct = ex.map((v) => Math.max(4, (v / sum) * 100))
  const s2 = pct.reduce((a, b) => a + b, 0); pct = pct.map((v) => Math.round((v / s2) * 1000) / 10)
  return EL5.map((el, i) => ({ el, pct: pct[i] })).sort((a, b) => b.pct - a.pct)
}

// 자체 엔진(src/engine) ↔ 기준 엔진(orrery, 개발용 비교 대상) 대조 테스트. 사용법: npm run verify:engine
// 신살 6종(천을·홍염·도화·백호·괴강·대운나이)은 의도적으로 고전 규칙을 더 넓게 적용해 차이가 난다.
import { calculateSaju as mine } from '../src/engine/saju'
import { calculateSaju as orr } from '@orrery/core/saju'

let seed = 12345
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
const ri = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))
const N = Number(process.argv[2] ?? 3000)
const bad: Record<string, number> = {}
const ex: Record<string, string[]> = {}
const note = (k: string, s: string) => { bad[k] = (bad[k] ?? 0) + 1; (ex[k] ??= []).length < 4 && ex[k].push(s) }
for (let n = 0; n < N; n++) {
  const y = ri(1930, 2024), m = ri(1, 12), d = ri(1, 28), h = ri(0, 23), mi = ri(0, 59)
  const input = { year: y, month: m, day: d, hour: h, minute: mi, gender: rnd() < 0.5 ? 'M' : 'F', latitude: 37.5, longitude: 127, timezone: 'Asia/Seoul' } as any
  let a: any, b: any; try { b = orr(input) } catch { continue }; a = mine(input)
  const tag = `${y}-${m}-${d} ${h}:${mi} ${input.gender}`
  const pg = (r: any) => r.pillars.map((p: any) => p.pillar.ganzi).join(' ')
  if (pg(a) !== pg(b)) { note('pillars', `${tag} mine=${pg(a)} orr=${pg(b)}`); continue }
  const f = (r: any, k: string) => JSON.stringify(r.pillars.map((p: any) => p[k]))
  for (const k of ['stemSipsin', 'branchSipsin', 'unseong', 'sinsal', 'jigang']) if (f(a, k) !== f(b, k)) note(k, tag)
  const dw = (r: any) => r.daewoon.map((x: any) => x.ganzi + x.stemSipsin + x.branchSipsin + x.unseong + x.sinsal + x.isGongmang).join()
  if (dw(a) !== dw(b)) note('daewoon', `${tag}\n ${dw(a)}\n ${dw(b)}`)
  const ag = (r: any) => r.daewoon.map((x: any) => x.age).join()
  if (ag(a) !== ag(b)) note('dwage', `${tag} ${ag(a)} | ${ag(b)} | ${new Date(a.daewoon[0].startDate).toISOString()} ${new Date(b.daewoon[0].startDate).toISOString()}`)
  const rel = (r: any) => JSON.stringify([...r.relations.pairs.entries()]) + JSON.stringify(r.relations.triple) + JSON.stringify(r.relations.directional)
  if (rel(a) !== rel(b)) note('relations', `${tag}\n ${rel(a)}\n ${rel(b)}`)
  if (JSON.stringify(a.gongmang) !== JSON.stringify(b.gongmang)) note('gongmang', tag)
  for (const k of Object.keys(a.specialSals)) if (JSON.stringify((a.specialSals as any)[k]) !== JSON.stringify((b.specialSals as any)[k])) note('sal.' + k, `${tag} mine=${JSON.stringify((a.specialSals as any)[k])} orr=${JSON.stringify((b.specialSals as any)[k])}`)
}
console.log('N=', N, bad)
for (const k of Object.keys(ex)) console.log('--', k, '\n' + ex[k].join('\n'))

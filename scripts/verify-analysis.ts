// 풀이 고정 검사: 정해진 사주들의 강약·격국·용신이 바뀌면 실패한다.
// 일부러 규칙을 바꿨다면 `npm run verify:analysis -- --update` 로 기준표를 새로 쓰고, 바뀐 이유를 커밋에 적는다.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { calculateSaju } from '../src/engine'
import { analyze } from '../src/myeongri'

const CASES: [string, number, number, number, number, number, 'M' | 'F'][] = [
  ['사장님', 1996, 10, 28, 9, 4, 'M'],
  ['2003-11-06', 2003, 11, 6, 11, 20, 'F'], ['2008-01-27', 2008, 1, 27, 15, 14, 'F'],
  ['1983-10-28', 1983, 10, 28, 19, 44, 'M'], ['2013-10-20', 2013, 10, 20, 18, 46, 'F'],
  ['1970-02-03', 1970, 2, 3, 6, 30, 'M'], ['1975-05-15', 1975, 5, 15, 12, 0, 'F'],
  ['1980-08-08', 1980, 8, 8, 23, 30, 'M'], ['1985-12-25', 1985, 12, 25, 4, 10, 'F'],
  ['1990-03-21', 1990, 3, 21, 8, 0, 'M'], ['1992-07-07', 1992, 7, 7, 14, 40, 'F'],
  ['1994-09-09', 1994, 9, 9, 20, 15, 'M'], ['1998-01-01', 1998, 1, 1, 1, 0, 'F'],
  ['2000-06-30', 2000, 6, 30, 17, 5, 'M'], ['2001-10-10', 2001, 10, 10, 10, 10, 'F'],
  ['1965-04-18', 1965, 4, 18, 5, 55, 'M'], ['1978-11-23', 1978, 11, 23, 21, 21, 'F'],
  ['1988-02-29', 1988, 2, 29, 13, 13, 'M'], ['1995-08-15', 1995, 8, 15, 16, 0, 'F'],
  ['2010-12-12', 2010, 12, 12, 7, 7, 'M'],
]
const out: Record<string, string> = {}
for (const [n, y, m, d, h, mi, g] of CASES) {
  const r: any = calculateSaju({ year: y, month: m, day: d, hour: h, minute: mi, gender: g, city: { name: '서울', lat: 37.57, lon: 126.98 } } as never)
  const a: any = analyze(r)
  out[n] = [r.pillars.map((p: any) => p.pillar.ganzi).join(' '), a.strength.label, a.gyeokguk.name,
    `${a.yongsin.basis}:${a.yongsin.primary}/${a.yongsin.heesin}/${a.yongsin.gisin}`].join(' | ')
}
const file = 'scripts/analysis-golden.json'
if (process.argv.includes('--update') || !existsSync(file)) { writeFileSync(file, JSON.stringify(out, null, 1)); console.log('기준표를 새로 썼습니다:', file); process.exit(0) }
const old = JSON.parse(readFileSync(file, 'utf8')); let bad = 0
for (const k of Object.keys(out)) if (old[k] !== out[k]) { bad++; console.log('달라짐', k, '\n  전:', old[k], '\n  후:', out[k]) }
console.log(bad ? `실패: ${bad}건 달라짐` : `통과: ${Object.keys(out).length}건 동일`); process.exit(bad ? 1 : 0)

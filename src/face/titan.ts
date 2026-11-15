/**
 * "거인의 힘을 이어받는다면" (재미용). 얼굴 측정 비율을 8가지 상상 속 거인 능력에 견줘 가장 가까운 하나를 고른다.
 * 능력 이름과 설명은 용용사주가 새로 지었다. 특정 작품의 이름·설정을 쓰지 않는다.
 */
import type { Metrics } from './measure'
import { NORM } from './read'

type K = keyof typeof NORM
const z = (m: Metrics, k: K) => (m[k] - NORM[k][0]) / NORM[k][1]

interface Power { name: string; line: string; body: string; cost: string; proto: Partial<Record<K, number>> }
const POWERS: Power[] = [
  { name: '불꽃 진군의 거인', line: '멈추지 않고 앞으로 밀고 나가는 힘', body: '한번 방향을 정하면 벽이 나와도 부수고 가는 추진력이 있어요. 망설이는 사람들에게 길을 열어 주는 선두 역할이 어울려요.', cost: '대가: 뒤를 돌아볼 틈 없이 달리다 지치기 쉬워요. 쉬는 날을 일정에 먼저 넣어 두세요.', proto: { jaw: 0.9, eyeTilt: 0.6, browArch: -0.5, mouthW: 0.5 } },
  { name: '강철 수호의 거인', line: '아무도 뚫지 못하는 단단한 방어력', body: '흔들리는 순간에도 중심을 잃지 않는 사람이에요. 소중한 사람이 위험할 때 가장 먼저 앞에 서는 믿음직한 방패 같은 존재예요.', cost: '대가: 혼자 다 막아 내려다 속으로 쌓아 두기 쉬워요. 힘들다고 말하는 연습이 필요해요.', proto: { ratio: -0.7, jaw: 0.6, eyeW: -0.5, noseW: 0.5 } },
  { name: '우뚝 선 거대한 거인', line: '서 있기만 해도 판이 바뀌는 존재감', body: '말하지 않아도 분위기를 바꾸는 사람이에요. 큰 자리에서 사람들을 한곳에 모으는 힘이 있어요.', cost: '대가: 눈에 잘 띄는 만큼 작은 실수도 크게 보여요. 첫인상 관리가 도움이 돼요.', proto: { ratio: 0.9, mid: 0.7, noseLen: 0.6, jaw: 0.3 } },
  { name: '야성의 지휘 거인', line: '본능으로 무리를 이끄는 감각', body: '상황이 어떻게 돌아가는지 몸이 먼저 알아채요. 설명보다 직감으로 방향을 잡고, 사람들이 자연스럽게 따라오게 만들어요.', cost: '대가: 직감이 강한 만큼 고집도 세져요. 중요한 결정은 한 사람에게 꼭 물어보세요.', proto: { eyeTilt: 0.9, eyeOpen: 0.4, browLen: 0.7, noseW: 0.4 } },
  { name: '날쌘 질주의 거인', line: '누구보다 빠른 판단과 몸놀림', body: '기회가 보이면 가장 먼저 움직이는 사람이에요. 변화가 빠른 곳에서 빛나고, 남들이 고민하는 사이 이미 한 발 앞서 있어요.', cost: '대가: 속도가 빨라 마무리가 헐거울 수 있어요. 끝나기 전 한 번 더 점검하세요.', proto: { eyeTilt: 0.7, ratio: 0.6, jaw: -0.7, mouthW: -0.5 } },
  { name: '끈기의 거인', line: '한 번 물면 놓지 않는 집념', body: '남들이 포기하는 지점부터 진짜 실력이 나오는 사람이에요. 오래 걸려도 끝까지 해내는 힘이 가장 큰 무기예요.', cost: '대가: 놓아야 할 때도 쥐고 있기 쉬워요. 그만둘 기준을 미리 정해 두세요.', proto: { jaw: 1, mouthW: 0.8, lip: 0.3, eyeGap: -0.3 } },
  { name: '통찰의 기억 거인', line: '지나간 이야기를 읽어 내는 깊은 눈', body: '사람과 사건의 흐름을 오래 기억하고 연결해요. 조용히 지켜보다 결정적인 순간에 정확한 한마디를 하는 참모 같은 타입이에요.', cost: '대가: 너무 많이 알아서 걱정이 많아져요. 쉬는 시간에는 생각을 꺼 두세요.', proto: { eyeW: 0.8, eyeOpen: 0.7, eyeGap: 0.6, browGap: 0.5, mouthW: -0.4 } },
  { name: '변신의 적응 거인', line: '어디서든 자기 자리를 만드는 유연함', body: '처음 보는 환경과 사람에도 금방 맞춰요. 상황에 따라 얼굴을 바꾸는 듯한 재주로 어떤 팀에서든 환영받아요.', cost: '대가: 맞추다 보면 내 모습이 흐려져요. 나만의 기준 하나는 꼭 지키세요.', proto: { eyeTilt: -0.3, lip: 0.7, eyeOpen: 0.5, ratio: -0.2, noseW: -0.3 } },
]
export interface TitanOut { name: string; line: string; body: string; cost: string; pct: number; second: string | null; shareText: string }
export function titanOf(m: Metrics): TitanOut {
  const sc = POWERS.map((p) => {
    const ks = Object.keys(p.proto) as K[]
    const norm = Math.sqrt(ks.reduce((q, c) => q + (p.proto[c] as number) ** 2, 0))
    return { p, s: ks.reduce((q, c) => q + (p.proto[c] as number) * z(m, c), 0) / norm }
  }).sort((a, b) => b.s - a.s)
  const ex = sc.slice(0, 3).map((r) => Math.exp((r.s - sc[0].s) / 0.6)), sum = ex.reduce((a, b) => a + b, 0)
  const best = sc[0].p
  return {
    name: best.name, line: best.line, body: best.body, cost: best.cost, pct: Math.round((ex[0] / sum) * 100),
    second: sc[1].s >= sc[0].s * 0.75 ? sc[1].p.name : null,
    shareText: `내 얼굴은 "${best.name}"의 힘을 이어받을 상이래요! 재미로 보는 용용사주 관상`,
  }
}

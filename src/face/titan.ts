/**
 * "거인의 힘을 이어받는다면" (재미용 비공식 팬 콘텐츠). 얼굴 측정 비율을 9가지 거인 이름에 견줘 가장 가까운 하나를 고른다.
 * 거인 이름은 흔히 불리는 일반 호칭만 쓰고, 성격 풀이는 용용사주가 새로 썼다. 원작의 문장·그림은 쓰지 않는다.
 * 얼굴과 능력의 대응은 재미로 정한 것이다.
 */
import type { Metrics } from './measure'
import { NORM } from './read'

type K = keyof typeof NORM
const z = (m: Metrics, k: K) => (m[k] - NORM[k][0]) / NORM[k][1]

interface Power { name: string; line: string; body: string; cost: string; proto: Partial<Record<K, number>> }
const POWERS: Power[] = [
  { name: '진격의 거인', line: '멈추지 않고 앞으로 밀고 나가는 힘', body: '한번 방향을 정하면 벽이 나와도 부수고 가는 추진력이 있어요. 자유롭게 살고 싶은 마음이 강해서, 막히면 오히려 더 세게 달려요.', cost: '대가: 뒤를 돌아볼 틈 없이 달리다 지치기 쉬워요. 쉬는 날을 일정에 먼저 넣어 두세요.', proto: { jaw: 0.9, eyeTilt: 0.6, browArch: -0.5, mouthW: 0.5 } },
  { name: '갑옷 거인', line: '아무도 뚫지 못하는 단단한 방어력', body: '흔들리는 순간에도 중심을 잃지 않는 사람이에요. 맡은 일은 끝까지 해내고, 소중한 사람이 위험할 때 가장 먼저 앞에 서는 방패 같은 존재예요.', cost: '대가: 혼자 다 막아 내려다 속으로 쌓아 두기 쉬워요. 힘들다고 말하는 연습이 필요해요.', proto: { ratio: -0.7, jaw: 0.6, eyeW: -0.5, noseW: 0.5 } },
  { name: '초대형 거인', line: '서 있기만 해도 판이 바뀌는 존재감', body: '큰 그림을 보고 계획을 세우는 사람이에요. 말하지 않아도 분위기를 바꾸고, 중요한 순간에는 크게 내려놓을 줄도 알아요.', cost: '대가: 눈에 잘 띄는 만큼 부담도 커요. 혼자 짊어지지 말고 나눠 맡기세요.', proto: { ratio: 0.9, mid: 0.7, noseLen: 0.6, jaw: 0.3 } },
  { name: '야수 거인', line: '냉정한 머리로 무리를 이끄는 지휘력', body: '상황을 차갑게 읽고 사람들을 움직이는 데 능해요. 웃는 얼굴 뒤에서 이미 몇 수 앞을 계산하고 있는 전략가 타입이에요.', cost: '대가: 계산이 앞서 정이 없어 보일 수 있어요. 진심을 한 줄 덧붙이면 훨씬 좋아요.', proto: { eyeTilt: 0.9, eyeOpen: 0.4, browLen: 0.7, noseW: 0.4 } },
  { name: '턱 거인', line: '한 번 물면 놓지 않는 기동력과 집념', body: '움직임이 빠르고 끈질겨서, 기회를 한 번 잡으면 끝까지 물고 늘어져요. 남들이 포기하는 지점에서 진짜 실력이 나오는 사람이에요.', cost: '대가: 놓아야 할 때도 쥐고 있기 쉬워요. 그만둘 기준을 미리 정해 두세요.', proto: { jaw: 1, mouthW: 0.8, lip: 0.3, eyeGap: -0.3, eyeTilt: 0.3 } },
  { name: '여성형 거인', line: '영리하고 다재다능한 숨은 승부사', body: '속마음을 잘 드러내지 않지만 머리 회전이 빠르고 여러 얼굴을 가진 사람이에요. 어디서든 적응하고, 필요하면 단단하게 스스로를 지킬 줄 알아요.', cost: '대가: 감추다 보면 아무도 진짜 모습을 몰라요. 믿는 한 사람에게는 열어 보이세요.', proto: { eyeTilt: -0.3, lip: 0.7, eyeOpen: 0.5, ratio: -0.2, noseW: -0.3 } },
  { name: '시조 거인', line: '사람과 이야기를 하나로 잇는 통찰', body: '사람과 사건의 흐름을 멀리서 읽고 연결하는 힘이 있어요. 조용히 지켜보다 결정적인 순간에 판을 뒤집는 한마디를 하는 타입이에요.', cost: '대가: 너무 많이 알아서 생각이 무거워져요. 쉬는 시간에는 생각을 꺼 두세요.', proto: { eyeW: 0.8, eyeOpen: 0.7, eyeGap: 0.6, browGap: 0.5, mouthW: -0.4 } },
  { name: '전퇴 거인', line: '묵직하게 만들어 내고 휘두르는 창조력', body: '손에 잡히는 결과물로 승부하는 사람이에요. 필요한 걸 그 자리에서 만들어 내는 재주가 있고, 한번 휘두르면 판이 달라져요.', cost: '대가: 한 번에 크게 쓰다 금방 지칠 수 있어요. 힘 분배를 신경 쓰세요.', proto: { ratio: -0.4, mid: 0.5, noseLen: 0.4, browLen: 0.5, jaw: 0.2 } },
  { name: '짐꾼 거인', line: '오래 걷는 꾸준함과 든든한 지구력', body: '화려하진 않아도 가장 멀리까지 가는 사람이에요. 무거운 짐을 묵묵히 나르며 모두를 지탱하는, 팀에서 없으면 안 되는 사람이에요.', cost: '대가: 고생을 당연하게 여겨 인정받지 못할 수 있어요. 한 일은 직접 알리세요.', proto: { eyeTilt: -0.8, lip: 0.4, noseW: 0.3, ratio: -0.3, eyeW: 0.3 } },
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

/** 얼굴 특징점 → 비율 측정. 모든 값은 얼굴 크기에 대한 비율이라 사진 크기와 무관하다. */
import type { Found } from './mesh'

export interface Metrics {
  ratio: number      // 얼굴 길이 / 너비
  jaw: number        // 턱 너비 / 광대 너비
  upper: number; mid: number; lower: number // 삼정 비율(합 1)
  eyeW: number       // 눈 너비 / 얼굴 너비
  eyeOpen: number    // 눈 높이 / 눈 너비
  eyeTilt: number    // 눈꼬리 기울기(도, +면 올라감)
  eyeGap: number     // 눈 사이 거리 / 눈 너비
  browLen: number    // 눈썹 길이 / 눈 너비
  browGap: number    // 눈썹-눈 거리 / 눈 너비
  browArch: number   // 눈썹 굽은 정도
  noseW: number      // 콧방울 너비 / 눈 사이 거리
  noseLen: number    // 코 길이 / 얼굴 길이
  mouthW: number     // 입 너비 / 얼굴 너비
  lip: number        // 입술 두께 / 입 너비
  yaw: number        // 얼굴 돌아간 정도(0이 정면)
  roll: number       // 고개 기울기(도)
  yawDeg: number     // 좌우로 돌아간 각도(도, 절댓값)
  pitchDeg: number   // 위아래로 숙이거나 든 각도(도, 절댓값)
}

export function measure(f: Found): Metrics {
  const P = f.pts.map((p) => ({ x: p.x * f.w, y: p.y * f.h }))
  const a = P[133], b = P[362]
  const roll = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2, th = (-roll * Math.PI) / 180
  const Q = P.map((p) => ({ x: cx + (p.x - cx) * Math.cos(th) - (p.y - cy) * Math.sin(th), y: cy + (p.x - cx) * Math.sin(th) + (p.y - cy) * Math.cos(th) }))
  const d = (i: number, j: number) => Math.hypot(Q[i].x - Q[j].x, Q[i].y - Q[j].y)
  const dx = (i: number, j: number) => Math.abs(Q[i].x - Q[j].x)

  const W = dx(234, 454), H = d(10, 152)
  const u = d(10, 9), m = d(9, 2), l = d(2, 152), tot = u + m + l
  const eyeWL = d(33, 133), eyeWR = d(362, 263), eyeW = (eyeWL + eyeWR) / 2
  const open = (d(159, 145) / eyeWL + d(386, 374) / eyeWR) / 2
  // 눈꼬리 기울기: 바깥쪽 끝이 안쪽 끝보다 위(이미지 y가 작음)면 +
  const tiltL = (Math.atan2(Q[133].y - Q[33].y, dx(33, 133)) * 180) / Math.PI
  const tiltR = (Math.atan2(Q[362].y - Q[263].y, dx(362, 263)) * 180) / Math.PI
  const browL = [70, 63, 105, 66, 107], browR = [336, 296, 334, 293, 300]
  const arch = (ids: number[]) => {
    const s = Q[ids[0]], e = Q[ids[4]], len = Math.hypot(e.x - s.x, e.y - s.y)
    let mx = 0
    for (const i of ids.slice(1, 4)) mx = Math.max(mx, Math.abs((e.x - s.x) * (s.y - Q[i].y) - (s.x - Q[i].x) * (e.y - s.y)) / len)
    return mx / len
  }
  const browLenA = (d(70, 107) + d(336, 300)) / 2
  const browGap = (d(105, 159) + d(334, 386)) / 2
  const Z = f.pts.map((p) => p.z * f.w)
  const deg = (r: number) => (r * 180) / Math.PI
  const yawDeg = Math.abs(deg(Math.atan2(Z[454] - Z[234], P[454].x - P[234].x))) * 1.4 // z 깊이가 실제보다 작게 나와 보정
  const pitchDeg = Math.abs(deg(Math.atan2(Z[152] - Z[10], P[152].y - P[10].y)) - 12) // 정면 얼굴도 이마가 살짝 앞이라 12°를 기준으로 본다
  const midX = (Q[234].x + Q[454].x) / 2
  return {
    ratio: H / W, jaw: dx(172, 397) / W,
    upper: u / tot, mid: m / tot, lower: l / tot,
    eyeW: eyeW / W, eyeOpen: open, eyeTilt: (tiltL + tiltR) / 2, eyeGap: dx(133, 362) / eyeW,
    browLen: browLenA / eyeW, browGap: browGap / eyeW, browArch: (arch(browL) + arch(browR)) / 2,
    noseW: dx(129, 358) / dx(133, 362), noseLen: m / H,
    mouthW: dx(61, 291) / W, lip: d(0, 17) / dx(61, 291),
    yaw: Math.abs(Q[1].x - midX) / W, roll, yawDeg, pitchDeg,
  }
}

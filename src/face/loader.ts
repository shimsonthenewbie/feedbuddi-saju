/** 어두운 바탕에서 하얀 점 고리가 돌고, 모였다 퍼지는 대기 화면 */
export function startRing(host: HTMLElement, captions: string[]): () => void {
  host.innerHTML = '<div class="ring"><canvas width="360" height="360" aria-hidden="true"></canvas><p class="ringcap" role="status"></p></div>'
  const cv = host.querySelector('canvas')!, cap = host.querySelector('.ringcap') as HTMLElement
  const g = cv.getContext('2d')!, N = 28, C = 180
  let stop = false, ci = 0
  const setCap = () => { cap.textContent = captions[ci % captions.length]; cap.classList.remove('in'); void cap.offsetWidth; cap.classList.add('in'); ci++ }
  setCap(); const tm = setInterval(setCap, 1700)
  const t0 = performance.now()
  const frame = () => {
    if (stop) return
    const t = (performance.now() - t0) / 1000
    g.clearRect(0, 0, 360, 360)
    const breathe = 0.5 + 0.5 * Math.sin(t * 1.5 - 1.2)          // 0(한 점)~1(활짝)
    const R = 10 + 140 * breathe * breathe
    const twist = 2.4 * (1 - breathe)                              // 모일 때 소용돌이
    g.fillStyle = '#fff'
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 + t * 0.9 + twist * (i % 3)
      const r = R * (0.72 + 0.28 * Math.sin(i * 2.1 + t * 1.3))
      g.globalAlpha = 0.55 + 0.45 * Math.sin(i + t * 2) ** 2
      g.beginPath(); g.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, 2.8 + 1.4 * ((i % 4) / 3), 0, 7); g.fill()
    }
    g.globalAlpha = 1
    requestAnimationFrame(frame)
  }
  frame()
  return () => { stop = true; clearInterval(tm) }
}

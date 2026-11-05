/** 여의(마스코트) 이미지. public/art/<이름>.webp — 배경이 투명한 스프라이트와 배경이 있는 장면 그림이 섞여 있다. */
export const art = (name: string): string => (globalThis as { __ART?: Record<string, string> }).__ART?.[name] ?? `/art/${name}.webp`
const CATS = new Set(['love', 'work', 'money', 'health', 'family', 'etc'])
export const catArt = (cat: string) => art(`cat-${CATS.has(cat) ? cat : 'etc'}`)

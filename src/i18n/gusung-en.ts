/** 구성기학 영어 화면용 데이터 (한국어 키 → 영어). */
export const DIR_EN: Record<string, string> = {
  중앙: 'Center', 북서: 'Northwest', 서: 'West', 북동: 'Northeast', 남: 'South', 북: 'North', 남서: 'Southwest', 동: 'East', 남동: 'Southeast',
}
export const VERDICT_EN: Record<string, string> = { 대길: 'Very good', 길: 'Good', 보통: 'Neutral', 조심: 'Careful', 피하세요: 'Avoid' }
export const EL_EN: Record<string, string> = { 水: 'Water', 土: 'Earth', 木: 'Wood', 金: 'Metal', 火: 'Fire' }
export const STAR_NAME_EN: Record<number, string> = {
  1: 'One White Water Star', 2: 'Two Black Earth Star', 3: 'Three Jade Wood Star', 4: 'Four Green Wood Star', 5: 'Five Yellow Earth Star',
  6: 'Six White Metal Star', 7: 'Seven Red Metal Star', 8: 'Eight White Earth Star', 9: 'Nine Purple Fire Star',
}
export const WHY_EN: Record<string, string> = {
  '오황살 방위예요. 가장 꺼리는 방향이에요.': 'The Five-Yellow direction, the one traditionally avoided most.',
  '암검살 방위예요. 오황살의 맞은편으로 역시 꺼려요.': 'The Hidden Blade direction, opposite the Five-Yellow, also avoided.',
  '내 본명성이 앉은 본명살 방위예요.': 'Where your own star sits, the "Self-Strike" direction.',
  '본명살의 맞은편인 본명적살 방위예요.': 'Opposite your own star, the "Self-Opposed" direction.',
  '이 방위의 별이 내 기운을 키워 줘요.': 'The star here feeds your element.',
  '이 방위의 별이 나와 같은 기운이라 편안해요.': 'The star here shares your element, so it feels comfortable.',
  '내가 다스리는 기운이에요. 노력하면 실속이 생겨요.': 'An element you govern. Effort here brings real returns.',
  '내 기운을 쓰게 되는 방위예요. 힘이 좀 들어요.': 'This direction drains your energy, so it takes some effort.',
  '이 방위의 별이 내 기운을 누르는 쪽이에요.': 'The star here tends to suppress your element.',
}
export const STAR_TEXT_EN: Record<number, [string, string]> = {
  1: ['Someone who seeps in like water', 'Flexible, quick to read a room, good at linking people. You rarely show your inner feelings and can be misread, so say the important things out loud.'],
  2: ['Someone who supports like the earth', 'Diligent and highly responsible. You back others up quietly and can wear out, so practice saying when it is hard.'],
  3: ['Someone who shoots up like a sprout', 'Quick to start and active. Words and action can run ahead of follow-through, so finishing things is what makes you grow.'],
  4: ['Someone who blends in like the wind', 'Sociable and values trust. With many connections and messages, decisions can slow down, so set one clear criterion.'],
  5: ['Someone big at the very center', 'A strong presence and drive. You affect people around you a lot; guard against stubbornness and you can lead well.'],
  6: ['Someone who leads like the heavens', 'A principled, dignified leader type. Make sure you rest so perfectionism does not drive you too hard.'],
  7: ['Someone who shares joy', 'Charming with a way with words, and you know how to enjoy life. Money can leak while chasing fun, so set a spending rule.'],
  8: ['Someone who builds up like a mountain', 'You accumulate steadily and change decisively when you change. You can look stubborn, so listen one more time.'],
  9: ['Someone who shines like fire', 'Sharp sense and passion, and you stand out. Moods swing, so make big decisions after you settle down.'],
}

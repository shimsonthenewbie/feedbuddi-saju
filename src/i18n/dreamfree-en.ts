/**
 * 꿈해몽 영어판(무료). 영어로 적은 꿈에서 흔한 상징·감정을 찾아 읽는다. 풀이 글은 용용사주가 새로 썼다.
 */
import type { Tone } from './dream-extra'

interface S { re: RegExp; name: string; trad: string; mind: string; tone: Tone }
const S_: S[] = [
  { re: /\bsnake|serpent\b/i, name: 'Snake', trad: 'Often read as a sign of money, a new opportunity or a person to be careful around.', mind: 'Something you have been avoiding or a quiet worry may be coiling up and asking for attention.', tone: 'change' },
  { re: /\bdragon\b/i, name: 'Dragon', trad: 'In East Asian dream lore, a rising dragon means success, status or a big break.', mind: 'A part of you wants to aim higher than the life you are living now.', tone: 'good' },
  { re: /\btiger|lion|wolf|bear\b/i, name: 'Large predator', trad: 'Power, a strong rival or a patron depending on how it behaved toward you.', mind: 'Strong drive or fear of a powerful person. Notice whether you ran or stood still.', tone: 'mixed' },
  { re: /\bdog|puppy\b/i, name: 'Dog', trad: 'Loyalty and a trustworthy friend. A barking dog can warn about gossip.', mind: 'Your need for faithful company, or worry about who you can trust.', tone: 'good' },
  { re: /\bcat|kitten\b/i, name: 'Cat', trad: 'Independence and intuition. A scratching cat can mean a minor irritation with someone close.', mind: 'A wish for more freedom, or a quiet instinct you are not listening to.', tone: 'mixed' },
  { re: /\bbird|eagle|crow|owl\b/i, name: 'Bird', trad: 'News, messages and freedom. A bird flying in often means news is coming.', mind: 'You may want to rise above a situation and see it from a distance.', tone: 'good' },
  { re: /\bfish|whale|shark|dolphin\b/i, name: 'Fish / sea creature', trad: 'Fish are a classic sign of wealth and good fortune. Sharks can mean a threat to your money.', mind: 'Feelings moving beneath the surface of your daily life.', tone: 'good' },
  { re: /\bpig\b/i, name: 'Pig', trad: 'In Korean dream lore a pig is a famously lucky sign of money.', mind: 'A wish for abundance, or relief that something is finally going to pay off.', tone: 'good' },
  { re: /\bspider|insect|bug|cockroach|worm\b/i, name: 'Insects', trad: 'Small annoyances piling up, or something small turning into a bigger problem.', mind: 'Minor stresses you have not dealt with yet.', tone: 'warn' },
  { re: /\bwater|river|ocean|sea|lake|rain\b/i, name: 'Water', trad: 'Clear water is good luck and money. Muddy or rough water means confusion or difficulty.', mind: 'Your emotions. Their clarity and movement describe how you are really feeling.', tone: 'mixed' },
  { re: /\bflood|tsunami|wave\b/i, name: 'Flood / big wave', trad: 'Overwhelming change. Sometimes it is a cleansing before a fresh start.', mind: 'Emotions or tasks that feel too big to manage right now.', tone: 'change' },
  { re: /\bfire|flame|burning\b/i, name: 'Fire', trad: 'A blazing fire is traditionally a sign of success and growing luck, as long as nobody is hurt.', mind: 'Passion or anger. Is it warming you or burning you?', tone: 'mixed' },
  { re: /\bteeth|tooth\b/i, name: 'Teeth', trad: 'Losing a tooth is the best-known warning dream, linked to family worries or a loss.', mind: 'Worry about how you look, about aging, or about losing control of a situation.', tone: 'warn' },
  { re: /\bfalling|fall off|fell\b/i, name: 'Falling', trad: 'A drop in status or a plan slipping. Waking before the landing softens it.', mind: 'A feeling that you are losing your footing at work, in a relationship or in your plans.', tone: 'warn' },
  { re: /\bfly|flying|float\b/i, name: 'Flying', trad: 'Rising luck and success. Flying freely is a very good sign.', mind: 'Freedom and confidence, or a wish to escape from pressure.', tone: 'good' },
  { re: /\bchase|chased|running away|pursued\b/i, name: 'Being chased', trad: 'A problem catching up with you. Escaping means you will get past it.', mind: 'Something you are avoiding facing. What would happen if you turned around?', tone: 'warn' },
  { re: /\bdeath|dead|die|dying|funeral|corpse\b/i, name: 'Death', trad: 'Dreaming of death is usually the reverse of what it sounds like: an ending, then a new beginning, even long life.', mind: 'Something in your life is ending and making room for change.', tone: 'change' },
  { re: /\bblood|bleeding\b/i, name: 'Blood', trad: 'Often money or vitality. Blood from a wound can be a sign of unexpected income.', mind: 'Strong emotion or energy draining away. Check whether you are overtired.', tone: 'mixed' },
  { re: /\bpoop|feces|toilet|shit\b/i, name: 'Toilet / feces', trad: 'In Korean dream lore feces are a famously lucky sign of money.', mind: 'Letting go of what you no longer need.', tone: 'good' },
  { re: /\bmoney|gold|cash|coins|treasure|lottery\b/i, name: 'Money / treasure', trad: 'Finding money is not always a money sign; it can be an opportunity arriving. Losing it can warn of carelessness.', mind: 'How you feel about your own worth and security.', tone: 'mixed' },
  { re: /\bexam|test|school|classroom|homework\b/i, name: 'Exam / school', trad: 'A trial or evaluation approaching. Passing in the dream is encouraging.', mind: 'Fear of being judged or not being prepared. Old school dreams are very common under stress.', tone: 'warn' },
  { re: /\blate|missed (the )?(bus|train|flight)|miss(ed)? (my|the)\b/i, name: 'Being late / missing something', trad: 'A missed chance or anxiety about timing.', mind: 'Worry that you are falling behind others or your own schedule.', tone: 'warn' },
  { re: /\bnaked|no clothes\b/i, name: 'Being naked', trad: 'Exposure of something hidden. Not minding it can mean you are becoming more honest.', mind: 'Fear of being seen as you really are.', tone: 'warn' },
  { re: /\bwedding|marry|married|bride|groom\b/i, name: 'Wedding', trad: 'A new commitment or union, not always a literal marriage. A funeral-like mood in a wedding can warn of strain.', mind: 'Thoughts about commitment, belonging or a big decision.', tone: 'good' },
  { re: /\bbaby|pregnant|pregnancy|birth|newborn\b/i, name: 'Baby / pregnancy', trad: 'Something new is being born: an idea, project or opportunity. In Korean lore this is the famous "taemong" good-news dream.', mind: 'A new part of you or a new project that needs care.', tone: 'good' },
  { re: /\bex\b|\bex-|former (boyfriend|girlfriend|partner)\b/i, name: 'An ex', trad: 'Rarely about the person; often an old pattern or feeling coming back to be looked at.', mind: 'Something unfinished emotionally, or a comparison with your present life.', tone: 'mixed' },
  { re: /\bmother|mom|mum|father|dad|parents\b/i, name: 'Parents', trad: 'Support, guidance or authority. Their mood in the dream hints at how you feel about your own responsibilities.', mind: 'Your relationship with care, approval and obligation.', tone: 'mixed' },
  { re: /\bhouse|home|room|apartment|door\b/i, name: 'House / rooms', trad: 'The house is you. A new room means untapped potential; a leaking or broken house means worry about your foundations.', mind: 'Your inner life and sense of security.', tone: 'mixed' },
  { re: /\bcar|driving|drive|bus|train|plane|airplane\b/i, name: 'Vehicle / travel', trad: 'The direction of your life. Smooth driving is a good sign; a car without brakes warns about speed.', mind: 'Whether you feel in control of where you are heading.', tone: 'mixed' },
  { re: /\bbridge|road|path|stairs|elevator\b/i, name: 'Road / stairs', trad: 'A transition. Climbing is progress; broken stairs mean an obstacle.', mind: 'The pace and difficulty of the change you are going through.', tone: 'change' },
  { re: /\bmountain|cliff|hill|tree|forest\b/i, name: 'Mountain / tree', trad: 'Stability and long-term growth. Climbing a mountain is a classic success sign.', mind: 'A big goal and how heavy the climb feels.', tone: 'good' },
  { re: /\bstorm|thunder|lightning|typhoon|earthquake\b/i, name: 'Storm / earthquake', trad: 'Sudden upheaval, but also a clearing of old pressure.', mind: 'Stress that has been building, or a sense that the ground is shifting.', tone: 'change' },
  { re: /\bsun|sunrise|sunshine|moon|star|rainbow\b/i, name: 'Sun / moon / sky', trad: 'The sun and moon are lucky signs of clarity, recognition and honor.', mind: 'Hope, and a sense of being seen.', tone: 'good' },
  { re: /\bphone|text|message|call\b/i, name: 'Phone / messages', trad: 'News or a connection. Failing to dial or being unable to speak is a sign of miscommunication.', mind: 'Something you want to say, or someone you want to reach.', tone: 'mixed' },
  { re: /\bhospital|doctor|sick|ill|surgery\b/i, name: 'Hospital / illness', trad: 'Rarely a prediction of illness. More often a need to rest or repair something.', mind: 'Your body or mind asking for care.', tone: 'warn' },
  { re: /\bkill|murder|fight|war|gun|weapon|attack\b/i, name: 'Violence', trad: 'Conflict or a strong break from the past. Winning a fight is a good sign.', mind: 'Anger, frustration or a boundary you want to defend.', tone: 'warn' },
  { re: /\bcelebrity|famous|president|king|queen\b/i, name: 'Famous person / ruler', trad: 'Recognition or help from someone powerful.', mind: 'A wish to be valued or to lead.', tone: 'good' },
  { re: /\bwhite|gold(en)?|bright\b/i, name: 'Bright light', trad: 'Light in a dream traditionally points to good news.', mind: 'Hope or clarity arriving.', tone: 'good' },
  { re: /\blost|can'?t find|searching|looking for\b/i, name: 'Being lost', trad: 'Uncertainty about direction.', mind: 'A decision you have not made yet.', tone: 'warn' },
]
const FEEL: Array<[RegExp, string, string]> = [
  [/\bscared|afraid|terrified|fear|panic\b/i, 'Fear', 'Fear in a dream is usually the mind rehearsing a worry. The more you name it while awake, the smaller it gets.'],
  [/\bhappy|joy|peaceful|calm|relieved|free\b/i, 'Calm or joy', 'Good feelings inside a dream are the strongest signal that the dream is on your side.'],
  [/\bsad|crying|cried|grief|lonely|miss\b/i, 'Sadness', 'Sadness in a dream often means a feeling you have been holding back during the day.'],
  [/\bangry|furious|anger|rage\b/i, 'Anger', 'A sign that a boundary has been crossed. What did you not say recently?'],
  [/\bconfused|lost|weird|strange\b/i, 'Confusion', 'Confusion points to a choice you have not settled yet.'],
  [/\bguilty|ashamed|embarrass/i, 'Guilt or embarrassment', 'You may be judging yourself more harshly than anyone else is.'],
]
const TOPIC: Array<[RegExp, string]> = [
  [/\bjob|work|boss|career|interview|resign\b/i, 'Since work is on your mind, the dream may be mirroring how you feel about your role or your pace.'],
  [/\brelationship|partner|breakup|dating|love|crush\b/i, 'With a relationship on your mind, notice which feelings in the dream match how you feel about the person.'],
  [/\bmoney|debt|rent|bills|savings\b/i, 'Money worries often show up as falling, losing or searching dreams.'],
  [/\bexam|study|school|degree\b/i, 'Pressure around studying often appears as exam or lateness dreams.'],
  [/\bfamily|parents|mother|father\b/i, 'Family matters on your mind often come up as parent or home images.'],
]
export interface DreamEnIn { dream: string; feelings: string[]; situation?: string }
export interface DreamEnOut { headline: string; tone: Tone; toneLine: string; story: string[]; symbols: Array<{ name: string; trad: string; mind: string }>; feelLines: Array<[string, string]>; context: string[]; action: string; ask: string }

export const FEELS_EN = ['Fear', 'Joy', 'Calm', 'Sadness', 'Anger', 'Confusion', 'Guilt', 'Relief']

export function readDreamEn(i: DreamEnIn): DreamEnOut {
  const text = i.dream
  const hits = S_.filter((s) => s.re.test(text)).slice(0, 5)
  const feelText = i.feelings.join(' ').toLowerCase()
  const good = i.feelings.some((f) => ['Joy', 'Calm', 'Relief'].includes(f))
  const bad = i.feelings.some((f) => ['Fear', 'Sadness', 'Anger', 'Guilt', 'Confusion'].includes(f))
  const count = (t: Tone) => hits.filter((h) => h.tone === t).length
  let tone: Tone = 'mixed'
  if (hits.length) {
    if (count('good') > count('warn') + count('change') && !bad) tone = 'good'
    else if (count('warn') > count('good')) tone = bad || !good ? 'warn' : 'mixed'
    else if (count('change') >= 1 && count('change') >= count('good')) tone = 'change'
  } else if (good && !bad) tone = 'good'
  else if (bad && !good) tone = 'warn'
  const head: Record<Tone, [string, string]> = {
    good: ['A dream leaning toward good energy', 'The images and the way you felt both lean positive.'],
    warn: ['A dream asking you to check in with yourself', 'This is less a warning about events and more a signal about stress or something unsaid.'],
    change: ['A dream about change', 'Something is ending or shifting, and the dream is helping you get used to the idea.'],
    mixed: ['A dream that depends on how you felt', 'Its images can go either way, so your feelings inside the dream decide the meaning.'],
  }
  const story: string[] = []
  if (hits.length) story.push(`The strongest images here are ${hits.map((h) => h.name.toLowerCase()).join(', ')}. Traditional dream lore and the psychological reading are given below, and the second one is usually the more useful.`)
  else story.push('No classic dream symbols stood out in the text, so this reading leans on the feelings you chose. Adding scenes, people and places to your description will make the reading richer.')
  if (good && bad) story.push('You felt both pleasant and uneasy feelings. Mixed feelings often mean a situation you are drawn to and worried about at once.')
  else if (good) story.push('Because the feelings were pleasant, even unusual images tend to be read gently.')
  else if (bad) story.push('Because the feelings were uncomfortable, the dream is probably processing stress rather than predicting anything.')
  const feelLines: Array<[string, string]> = FEEL.filter(([re, f]) => re.test(text) || i.feelings.includes(f.split(' ')[0])).map(([, f, l]) => [f, l] as [string, string])
  void feelText
  const context = TOPIC.filter(([re]) => re.test(i.situation ?? '')).map(([, l]) => l)
  const actions: Record<Tone, string> = {
    good: 'Take the good feeling into one small action today: message someone, start the thing you have been postponing for ten minutes.',
    warn: 'Write down the one worry that felt closest to the dream, then write one thing you can do about it this week.',
    change: 'Name what might be ending. Then pick one small thing you can do to meet the change halfway.',
    mixed: 'Notice what you felt most strongly when you woke up. That feeling, not the image, is the part to act on.',
  }
  return {
    headline: head[tone][0], tone, toneLine: head[tone][1], story,
    symbols: hits.map(({ name, trad, mind }) => ({ name, trad, mind })), feelLines, context, action: actions[tone],
    ask: 'If this dream were a message from you to you, what would it be saying?',
  }
}

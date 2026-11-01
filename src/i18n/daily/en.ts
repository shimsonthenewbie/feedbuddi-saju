import type { DailyText } from './types'

export const en: DailyText = {
  starLabel: ['A day to slow down', 'Take it easy', 'A steady day', 'Good flow today', 'Energy is high'],
  cats: { love: 'Love', money: 'Money', work: 'Work & study', health: 'Energy' },
  theme: {
    bijeon: { title: 'Energy like your own arrives', body: ['A good day to keep your own pace. Doing things your way will build momentum rather than comparing yourself with others.', 'Your sense of self is sharp today. If something needs solo focus, finish it now.'] },
    geopjae: { title: 'Competition and teamwork together', body: ['Energy moves between you and the people around you. Teamwork helps, but go easy on grabbing more than your share.', 'Many opinions are around today. Keep your own standard while hearing out what is useful.'] },
    siksin: { title: 'Expression and enjoyment', body: ['Good energy for making, eating well and enjoying yourself. Try voicing an idea or making something with your hands.', 'Ease and fun go well together today. Spend time on a hobby or a good meal.'] },
    sanggwan: { title: 'Talent and wit shine', body: ['Your expression and taste are sharp. Great for presenting, writing or creative work. Just watch that candor does not turn sharp.', 'You are drawn to new attempts. Changing your usual method slightly may give a surprising answer.'] },
    pyeonjae: { title: 'Opportunities appear as you move', body: ['Activity rises, and people and money circulate. Good for meetings, new deals or proposals. Double-check large spending.', 'You see the wider picture today. A small piece of information may turn into an opportunity.'] },
    jeongjae: { title: 'Steady, step-by-step gains', body: ['Consistency pays off. Accounts, planning and saving suit you today.', 'You are practical today. Finish the sorting or calculating you have been putting off.'] },
    pyeongwan: { title: 'Getting it done under pressure', body: ['You may feel pressure or responsibility, but finishing brings real satisfaction. Setting priorities makes it much easier.', 'A decision may come up. Take one beat before reacting.'] },
    jeonggwan: { title: 'Order and trust', body: ['Rules and promises go well today. Good for formal matters, interviews and paperwork. The trust you have built helps.', 'A good day to wrap things up cleanly.'] },
    pyeonin: { title: 'Intuition and new interests', body: ['Your mind is busy and curious. Good for study, research or planning, though overthinking may delay decisions.', 'Your senses are keen. Time alone can actually recharge you.'] },
    jeongin: { title: 'Support and stability', body: ['Help or learning comes easily. Study, certificates and documents go well. Resting and refilling your energy also suits today.', 'You feel at ease. Listen to advice from someone experienced.'] },
  },
  event: {
    clash_day: ['Your daily rhythm may be shaken once. If plans or travel change, stay calm and leave extra time.', 'There is a feeling of change. Even if plans shift, a new path can open, so stay flexible.'],
    harmony_day: ['People and tasks fit together smoothly. Good for asking favors, negotiating and setting appointments.', 'Connections come easily today. Reach out to someone you have been meaning to contact.'],
    repeat: ['Similar situations may repeat today. Check once more so the same slip does not happen again.'],
    clash_month: ['Small changes may occur around you. Leave some slack in your schedule and mood.'],
    compose: ['The same energy gathers strongly today. Focus on one thing for bigger results, and do not overdo what piles up.'],
  },
  catLine: {
    love: { hi: ['A good day to express your feelings. Reach out first.', 'The energy around connection is soft. Easy to make a good impression.'], mid: ['Relationships continue comfortably. Small gestures of care help.'], lo: ['Feelings may be sensitive. Important talks can wait until tomorrow.', 'Polishing your tone once can prevent misunderstandings.'] },
    money: { hi: ['Good news may come from income or deals. Read offers carefully.', 'Money flows smoothly. Needed spending feels worthwhile.'], mid: ['No big swings. A good day to tidy up your budget.'], lo: ['Watch out for impulse spending. Delay big payments by a day.', 'A good day to check for small leaks in your spending.'] },
    work: { hi: ['Focus is strong and results show. Put important tasks here.', 'You can make a good impression in reviews or discussions.'], mid: ['Calmly working through what is on your plate suits you.'], lo: ['Schedules may tangle. Set priorities before you start.', 'Do one more check before deadlines to avoid slips.'] },
    health: { hi: ['You feel light and motivated. A good day to exercise.'], mid: ['Energy is average. Keep up water and sleep.'], lo: ['Fatigue builds easily. Choose rest over an overloaded schedule.', 'Do not push yourself. Rest early.'] },
  },
  tip: {
    hi: ['A good day to try that important thing you have postponed.', 'Good energy grows when used. Move first.'],
    mid: ['A small routine makes the day comfortable.', 'Do not be greedy; focus on what has to be done.'],
    lo: ['Resting is a strategy too. Make fewer big decisions today.', 'If you do not rush, the day passes fine.'],
  },
  lucky: {
    title: "Today's lucky details",
    color: 'Lucky color',
    number: 'Lucky number',
    direction: 'Good direction',
    colors: { green: 'Green', red: 'Red', yellow: 'Yellow', white: 'White', blue: 'Blue' },
    dirs: { E: 'East', S: 'South', C: 'Center (stay put)', W: 'West', N: 'North' },
  },
  disclaimer: 'A tendency based on traditional Saju (Four Pillars) theory. It is not a prediction of fixed events; use it as a reference for preparing your day.',
}

/** Tarot readings in English (written fresh for Yongyong Saju). */
// [keywords, upright, reversed]
export const MAJOR_EN: Array<[string, string, string]> = [
  ['New start · innocence', 'A good time to take a light first step without calculating. Follow curiosity over fear.', 'You may be leaping unprepared or hesitating too long. Check the basics, then go.'],
  ['Will · action', 'You already have enough materials. Name exactly what you want and begin, and it happens.', 'Words outrun action or talent is going unused. Aim your focus at one thing.'],
  ['Intuition · stillness', 'The answer is inside, not outside. Do not rush; listen quietly to your intuition.', 'You may be hiding your true feelings or suppressing them. Admit them first.'],
  ['Abundance · care', 'What you tended is bearing fruit in a rich flow. Enjoying it is part of the work.', 'You may over-give or neglect yourself. Look after your own needs too.'],
  ['Order · responsibility', 'A time to build firmly with rules and plans. A role of responsibility becomes strength.', 'Stubbornness or control has gone too far. Step back one pace.'],
  ['Tradition · guidance', 'Proven methods and a trustworthy teacher become the road. Keep to the basics.', 'You feel boxed in by convention, or want to break the mold. Choose which rules are truly yours.'],
  ['Choice · attraction', 'It is clear which way your heart leans. Choose sincerely and both the bond and the path deepen.', 'You are putting off a choice or pulling apart. Re-clarify your values.'],
  ['Advance · victory', 'If the direction is set, push on. Gather your will in one place and you win.', 'You are speeding but lost direction, or control slips. Reset the course.'],
  ['Courage · gentle strength', 'Soothing beats suppressing. Patience and warmth are your strongest weapons.', 'Confidence wavers or emotions lead. Come back to your breath.'],
  ['Reflection · inquiry', 'Time to pause and look within. Alone time shows you the road.', 'You are isolating or hiding too long. Open up to someone trustworthy.'],
  ['Turning point · flow', 'The flow is changing. Ride the change rather than block it and a chance comes.', 'Timing is off or you are repeating a pattern. Break the cycle from your side.'],
  ['Balance · fairness', 'Facts and principles matter now. Judge fairly and take responsibility where it is yours.', 'Something feels biased or unfair. Start from the facts.'],
  ['Pause · another view', 'Wait now and shift your viewpoint. Some things only appear when you let go.', 'It feels like a loss or sacrifice and you are frustrated. Decide what is truly worth giving up.'],
  ['Ending · new beginning', 'What ends makes room for the new. Settle your attachments and the next door opens.', 'You are dragging out an ending you cannot accept. Let go and the flow resumes.'],
  ['Harmony · balance', 'A time to blend different things and set them right. Slow and steady is the answer.', 'Balance is off and you lean to one side. Reset your routine.'],
  ['Attachment · temptation', 'You are tied to a habit or bond that is hard to leave. Noticing it means it is half untied.', 'You are slipping free of a bind. Do not go back; keep the distance.'],
  ['Shock · collapse', 'A sudden change strips away what was false. What remains after the collapse is real.', 'You are avoiding or delaying a crisis. Repair it early and the shock is smaller.'],
  ['Hope · recovery', 'A tired heart recovers and hope shows. Trust the small light and keep going.', 'Confidence and hope are weak. Rebuild with small achievements.'],
  ['Anxiety · ambiguity', 'Everything is blurry and uneasy, but it is merely not yet clear. Decide after daybreak.', 'Anxiety lifts and truth shows. Check what was hidden.'],
  ['Joy · success', 'A bright, certain flow. Show yourself confidently and share the joy.', 'Joy is veiled or you are overconfident. Welcome a small pleasure.'],
  ['Awakening · new leap', 'Time to look back and answer anew. If a call comes, answer it with courage.', 'Self-blame or lingering regret holds you back. Forgive and move.'],
  ['Completion · wrap-up', 'A stage is finishing well. Acknowledge the achievement and prepare the next chapter.', 'You have stopped just before the finish. Close the last 10 percent.'],
]
export const SUIT_EN: Array<[string, string, string, string]> = [
  ['Wands', 'passion and action', 'passion', 'passion · action'],
  ['Cups', 'feelings and relationships', 'feelings', 'feelings · bonds'],
  ['Swords', 'thoughts, words and conflict', 'thoughts', 'thoughts · conflict'],
  ['Pentacles', 'money, work and reality', 'money', 'work · money'],
]
// [rank, keyword, upright({a}), reversed({a})]
export const RANKS_EN: Array<[string, string, string, string]> = [
  ['Ace', 'beginning', 'A new seed arrives in {a}. A welcome start, so grab it.', 'The start in {a} is blocked or delayed. Prepare more and watch for the time.'],
  ['Two', 'choice · balance', 'You need balance and a choice between two things in {a}. Set a criterion.', 'Hesitation drags or balance collapses in {a}. Pick one.'],
  ['Three', 'growth · cooperation', 'Together it grows in {a}. Cooperation and a first result show.', 'Hands and feet are out of sync, or you fall short of expectations in {a}. Redivide the roles.'],
  ['Four', 'stability · stagnation', 'A stable time to rest in {a}. Just do not settle in for good.', 'Things are stiff and stuffy in {a}. Add a small change.'],
  ['Five', 'conflict · change', 'Friction or competition arises in {a}. First decide whether it is worth winning.', 'The conflict in {a} is slowly easing. A sign of reconciling and sorting out.'],
  ['Six', 'harmony · recovery', 'You find your place and help flows both ways in {a}. A flow of recovery and sharing.', 'Giving and receiving is off in {a}. Check whether it is fair.'],
  ['Seven', 'test · review', 'Your persistence is tested in {a}. Do a midpoint check and do not give up.', 'You are tired and scattered in {a}. Try a different method.'],
  ['Eight', 'focus · speed', 'Speed picks up in {a}, and results come with focus.', 'Things stall or scatter in {a}. Reorder your priorities.'],
  ['Nine', 'endurance · nearly done', 'You are almost there in {a}. Your effort so far is your strength.', 'There is anxiety or overwork in {a}. Finish while resting.'],
  ['Ten', 'completion · overload', 'A cycle completes in {a}. Prepare the next stage.', 'The load in {a} is too heavy. Put it down or share it.'],
  ['Page', 'news · learning', 'News or a chance to learn comes in {a}. Stay curious.', 'There is immaturity or off news in {a}. Verify, then move.'],
  ['Knight', 'drive · charge', 'A fast-moving flow in {a}. If the direction is right you go far.', 'You are rash or extreme in {a}. Slow down.'],
  ['Queen', 'maturity · care', 'A time to handle {a} warmly and maturely. Embracing is your strength.', 'Feelings waver or you are worn out in {a}. Care for yourself first.'],
  ['King', 'responsibility · leadership', 'A time to lead by experience and take responsibility in {a}. Steady leadership is needed.', 'Stubbornness or control goes too far in {a}. Step back.'],
]

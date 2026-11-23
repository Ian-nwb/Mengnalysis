import React from 'react';
import { View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { MascotSays } from '../components/Mascot';
import { BigButton, Card, Kicker, ProgressBar, Screen, Stagger, Txt } from '../components/ui';
import { LESSONS, STAGES } from '../content';
import { fullnessWord } from '../pet';
import {
  addDays,
  canStartNew,
  currentStreak,
  dayStr,
  doneToday,
  focusItems,
  levelFor,
  liteItems,
  nextLesson,
  practiceItems,
  stageBeaten,
  warmupItems,
  weakLessons,
  weekStart,
} from '../engine';
import { Go } from '../nav';
import { useApp } from '../state';
import { space } from '../theme';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function StatTile({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  const { colors, state } = useApp();
  return (
    <Card style={{ flexGrow: 1, flexBasis: 140, alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={Math.round(32 * state.settings.textScale)} color={colors.brand} />
      <Txt v="h2" center>{value}</Txt>
      <Txt v="small" center color={colors.textMuted}>{label}</Txt>
    </Card>
  );
}

export function HomeScreen({ go }: { go: Go }) {
  const { state, colors } = useApp();
  const streak = currentStreak(state);
  const lvl = levelFor(state.xp);
  const next = nextLesson(state);
  const today = doneToday(state);
  const capped = !!next && today && !canStartNew(state);
  const mon = weekStart(dayStr());
  const week = DAY_LETTERS.map((_, i) => addDays(mon, i));
  const bugCount = Object.keys(state.bugs).length;
  const sheets = STAGES.filter((s) => stageBeaten(state, s.n)).length;
  const stage = next ? STAGES.find((s) => s.n === next.stage) : undefined;
  const hasReviews = Object.keys(state.reviews).length > 0;
  const weak = weakLessons(state, 1)[0];

  const start = () => {
    if (!next || capped) {
      go({ name: 'review', items: practiceItems(state), then: null, mode: 'practice' });
      return;
    }
    const items = today ? [] : warmupItems(state);
    if (items.length) go({ name: 'review', items, then: next.id, mode: 'warmup' });
    else go({ name: 'lesson', id: next.id, xpSoFar: 0 });
  };

  const mood = today ? (capped ? 'sleep' : 'cheer') : 'wave';
  const message = today
    ? capped
      ? "Great work today! Your next lesson unlocks tomorrow. I'll be here."
      : 'Daily dose done! Want to keep going?'
    : streak > 0
      ? `Day ${streak + 1} of your streak is waiting. Let's do this!`
      : "Ready for today's dose? Just a few minutes."
  const progress = lvl.next ? (state.xp - lvl.base) / (lvl.next - lvl.base) : 1;

  return (
    <Screen>
      <Stagger>
        <MascotSays mood={mood}>
          <Txt v="h1">{greeting()}, {state.settings.name || 'Tori'}!</Txt>
          <Txt>{message}</Txt>
        </MascotSays>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <StatTile icon="flame" value={`${streak}`} label={streak === 1 ? 'day streak' : 'day streak'} />
          <StatTile icon="star" value={`Lv ${lvl.level}`} label={lvl.title} />
        </View>

        <Card>
          <Kicker icon="clock">This week</Kicker>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {week.map((d, i) => {
              const done = state.daysDone.includes(d);
              const isToday = d === dayStr();
              return (
                <View
                  key={d}
                  accessible
                  accessibilityLabel={`${DAY_NAMES[i]}${done ? ', done' : ''}${isToday ? ', today' : ''}`}
                  style={{
                    minWidth: 42,
                    paddingVertical: 6,
                    alignItems: 'center',
                    borderRadius: 14,
                    borderWidth: isToday ? 3 : 1,
                    borderColor: isToday ? colors.accent : colors.border,
                    backgroundColor: done ? colors.brand : 'transparent',
                  }}
                >
                  <Txt v="small" bold color={done ? colors.onBrand : colors.textMuted}>{DAY_LETTERS[i]}</Txt>
                  {done ? <Icon name="check" size={20} color={colors.onBrand} /> : <Txt v="small" color={colors.textMuted}>·</Txt>}
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="snow" size={22} color={colors.accent} />
            <Txt v="small" color={colors.textMuted} style={{ flexShrink: 1 }}>
              {state.freezes > 0 ? 'Streak freeze ready: one missed day this week is okay.' : 'Streak freeze used this week.'}
            </Txt>
          </View>
          <ProgressBar value={progress} label="Level progress" height={12} />
          <Txt v="small" color={colors.textMuted}>
            {lvl.next ? `${state.xp} XP · ${lvl.next - state.xp} XP to next level` : `${state.xp} XP · Top level!`}
          </Txt>
        </Card>

        <Card tone="hero">
          <Kicker icon={today ? 'check' : 'coffee'}>{today ? "Today's dose: done" : "Today's dose"}</Kicker>
          {stage && !capped ? <Txt v="small" color={colors.textMuted}>Stage {stage.n} · {stage.title}</Txt> : null}
          <Txt v="h2">{capped ? 'Practice round' : next ? next.title : 'Practice round'}</Txt>
          <Txt color={colors.textMuted}>
            {capped
              ? `"${next!.title}" unlocks tomorrow.`
              : next
                ? `About ${next.minutes} min · Lesson ${LESSONS.indexOf(next) + 1} of ${LESSONS.length}`
                : 'You finished every lesson!'}
          </Txt>
          <BigButton label={today ? (capped || !next ? 'Practice' : 'Keep going') : 'Start'} icon="play" variant="primary" onPress={start} />
        </Card>

        {!today && hasReviews ? (
          <BigButton
            label="Lite day"
            sub="Short on time? A 2-minute review keeps your streak."
            icon="bolt"
            onPress={() => go({ name: 'review', items: liteItems(state), then: null, mode: 'lite' })}
          />
        ) : null}

        {weak ? (
          <Card>
            <Kicker icon="bulb">Focus topic</Kicker>
            <Txt bold>{weak.title}</Txt>
            <Txt v="small" color={colors.textMuted}>This one's been a little tricky. A quick focus round makes it click!</Txt>
            <BigButton
              label="Practice this topic"
              icon="refresh"
              onPress={() => go({ name: 'review', items: focusItems(state, weak.id), then: null, mode: 'focus' })}
            />
            <BigButton label="Replay the lesson" icon="play" variant="ghost" onPress={() => go({ name: 'lesson', id: weak.id, xpSoFar: 0 })} />
          </Card>
        ) : null}


        <View style={{ gap: space.sm }}>
          <BigButton
            label="Bug Book"
            sub={bugCount ? `${bugCount} to squash` : 'Your mistakes land here, so nothing slips by'}
            icon="bug"
            onPress={() => go({ name: 'bugbook' })}
          />
          <BigButton label="Cheat sheets" sub={`${sheets} of ${STAGES.length} unlocked`} icon="sheet" onPress={() => go({ name: 'vault' })} />
          {state.completed.includes('s4l2') ? (
            <BigButton label="SQL playground" sub="Write any query you like" icon="flask" onPress={() => go({ name: 'playground' })} />
          ) : null}
        </View>
      </Stagger>
    </Screen>
  );
}

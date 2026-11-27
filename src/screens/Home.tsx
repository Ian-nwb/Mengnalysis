import React from 'react';
import { View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { GroupTitle, TINTS, Tile } from '../components/kit';
import { Mascot } from '../components/Mascot';
import { BigButton, Card, Kicker, ProgressBar, Screen, Stagger, Txt } from '../components/ui';
import { LESSONS, lessonsInStage, STAGES } from '../content';
import {
  addDays,
  arcadeItems,
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
import { CATS, currentCat, unlockedCats } from '../cats';
import { Go } from '../nav';
import { useApp } from '../state';
import { space } from '../theme';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function StatChip({ icon, value, label, children }: { icon: IconName; value: string; label: string; children?: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={{ flexGrow: 1, flexBasis: 100, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: space.sm, gap: 4, alignItems: 'center' }}
    >
      <Icon name={icon} size={28} color={colors.brand} />
      <Txt bold center>{value}</Txt>
      <Txt v="small" center color={colors.textMuted}>{label}</Txt>
      {children}
    </View>
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
  const stageLessons = next ? lessonsInStage(next.stage) : [];
  const stageDone = stageLessons.filter((l) => state.completed.includes(l.id)).length;
  const hasReviews = Object.keys(state.reviews).length > 0;
  const weak = weakLessons(state, 1)[0];
  const now = new Date();
  const dateLabel = `${WEEKDAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

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
      : "Ready for today's dose? Just a few minutes.";
  const progress = lvl.next ? (state.xp - lvl.base) / (lvl.next - lvl.base) : 1;

  return (
    <Screen>
      <Stagger>
        {/* greeting */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Txt v="small" bold color={colors.accent}>{dateLabel.toUpperCase()}</Txt>
            <Txt v="h1">
              {greeting()}, {state.settings.name || 'Tori'}!
            </Txt>
          </View>
          <Mascot mood={mood} size={96} />
        </View>
        <View style={{ backgroundColor: colors.surface, borderRadius: 18, borderLeftWidth: 5, borderLeftColor: colors.brand, padding: space.md }}>
          <Txt>{message}</Txt>
        </View>

        {/* today's dose */}
        <Card tone="hero" style={{ gap: space.sm }}>
          <Kicker icon={today ? 'check' : 'coffee'}>{today ? "TODAY'S DOSE: DONE" : "TODAY'S DOSE"}</Kicker>
          {stage && !capped ? <Txt v="small" color={colors.textMuted}>Stage {stage.n} · {stage.title}</Txt> : null}
          <Txt v="h1">{capped || !next ? 'Practice round' : next.title}</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {capped ? (
              <Txt color={colors.textMuted}>"{next!.title}" unlocks tomorrow.</Txt>
            ) : next ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Icon name="clock" size={20} color={colors.accent} />
                  <Txt v="small" bold>About {next.minutes} min</Txt>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Icon name="book" size={20} color={colors.accent} />
                  <Txt v="small" bold>Lesson {LESSONS.indexOf(next) + 1} of {LESSONS.length}</Txt>
                </View>
              </>
            ) : (
              <Txt color={colors.textMuted}>You finished every lesson!</Txt>
            )}
          </View>
          {stage && !capped ? (
            <>
              <ProgressBar value={stageLessons.length ? stageDone / stageLessons.length : 0} height={12} label={`${stage.title} progress`} />
              <Txt v="small" color={colors.textMuted}>{stageDone} of {stageLessons.length} lessons in this stage</Txt>
            </>
          ) : null}
          <BigButton label={today ? (capped || !next ? 'Practice' : 'Keep going') : 'Start'} icon="play" variant="primary" onPress={start} />
        </Card>

        {/* stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <StatChip icon="flame" value={`${streak}`} label="day streak" />
          <StatChip icon="star" value={`Level ${lvl.level}`} label={lvl.title}>
            <View style={{ alignSelf: 'stretch' }}>
              <ProgressBar value={progress} height={8} label="Level progress" />
            </View>
          </StatChip>
          <StatChip icon="fish" value={`${state.pet.treats}`} label={`treats for ${currentCat(state).name}`} />
        </View>

        {/* this week */}
        <Card>
          <Kicker icon="clock">THIS WEEK</Kicker>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }}>
            {week.map((d, i) => {
              const done = state.daysDone.includes(d);
              const isToday = d === dayStr();
              return (
                <View
                  key={d}
                  accessible
                  accessibilityLabel={`${DAY_NAMES[i]}${done ? ', done' : ''}${isToday ? ', today' : ''}`}
                  style={{ alignItems: 'center', gap: 4, minWidth: 40 }}
                >
                  <Txt v="small" bold color={isToday ? colors.accent : colors.textMuted}>{DAY_LETTERS[i]}</Txt>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: done ? colors.brand : colors.surfaceHi,
                      borderWidth: isToday ? 3 : 0,
                      borderColor: colors.accent,
                    }}
                  >
                    {done ? <Icon name="check" size={22} color={colors.onBrand} /> : null}
                  </View>
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
        </Card>

        {weak ? (
          <Card>
            <Kicker icon="bulb">FOCUS TOPIC</Kicker>
            <Txt bold>{weak.title}</Txt>
            <Txt v="small" color={colors.textMuted}>This one's been a little tricky. A quick focus round makes it click!</Txt>
            <BigButton label="Practice this topic" icon="refresh" onPress={() => go({ name: 'review', items: focusItems(state, weak.id), then: null, mode: 'focus' })} />
          </Card>
        ) : null}

        {/* more ways to practice */}
        <GroupTitle>MORE WAYS TO PLAY AND PRACTICE</GroupTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {!today && hasReviews ? (
            <Tile icon="bolt" title="Lite day" sub="2 minutes, streak stays safe" tint={TINTS.mint} onPress={() => go({ name: 'review', items: liteItems(state), then: null, mode: 'lite' })} />
          ) : null}
          <Tile icon="star" title="Game arcade" sub="Quick games from your lessons" tint={TINTS.lavender} onPress={() => go({ name: 'review', items: arcadeItems(state), then: null, mode: 'arcade' })} />
          <Tile icon="bug" title="Bug Book" sub={bugCount ? `${bugCount} to squash` : 'Nothing to squash'} tint={TINTS.peach} onPress={() => go({ name: 'bugbook' })} />
          <Tile icon="paw" title="Cats" sub={`${unlockedCats(state).length} of ${CATS.length} unlocked`} tint={TINTS.pink} onPress={() => go({ name: 'cats' })} />
          <Tile icon="sheet" title="Cheat sheets" sub={`${sheets} of ${STAGES.length} unlocked`} tint={TINTS.butter} onPress={() => go({ name: 'vault' })} />
          {state.completed.includes('s4l2') ? (
            <Tile icon="flask" title="SQL playground" sub="Write any query" tint={TINTS.sky} onPress={() => go({ name: 'playground' })} />
          ) : null}
        </View>
      </Stagger>
    </Screen>
  );
}

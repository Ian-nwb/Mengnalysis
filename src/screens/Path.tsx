import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { BigButton, Card, ProgressBar, Screen, TopBar, Txt } from '../components/ui';
import { lessonsInStage, STAGES } from '../content';
import { canStartNew, nextLesson, stageBeaten } from '../engine';
import { Go } from '../nav';
import { useApp } from '../state';
import { space } from '../theme';

export function PathScreen({ go }: { go: Go }) {
  const { state, colors } = useApp();
  const next = nextLesson(state);
  const [open, setOpen] = useState<number | null>(next?.stage ?? 0);
  const iconPx = Math.round(24 * state.settings.textScale);

  return (
    <Screen>
      <TopBar onBack={() => go({ name: 'home' })} />
      <Txt v="h1">Your path</Txt>
      <Txt color={colors.textMuted}>From zero to job-ready analyst, one step at a time.</Txt>
      {STAGES.map((st) => {
        const lessons = lessonsInStage(st.n);
        const done = lessons.filter((l) => state.completed.includes(l.id)).length;
        const isOpen = open === st.n;
        const current = next?.stage === st.n;
        const beaten = stageBeaten(state, st.n);
        return (
          <Card key={st.n} tone={current ? 'hero' : 'plain'}>
            <Pressable
              onPress={() => setOpen(isOpen ? null : st.n)}
              accessibilityRole="button"
              accessibilityLabel={`Stage ${st.n}: ${st.title}. ${done} of ${lessons.length} lessons. ${isOpen ? 'Hide' : 'Show'} lessons`}
              style={{ gap: space.sm }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: done === lessons.length && lessons.length ? colors.brand : colors.surfaceHi,
                    borderWidth: 2,
                    borderColor: colors.brand,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {beaten ? <Icon name="trophy" size={26} color={colors.onBrand} /> : <Txt v="h2" center>{st.n}</Txt>}
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Txt v="h2">{st.title}</Txt>
                  <Txt v="small" color={colors.textMuted}>{st.blurb}</Txt>
                </View>
              </View>
              <ProgressBar value={lessons.length ? done / lessons.length : 0} height={12} label={`${st.title} progress`} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Txt v="small" bold color={colors.accent}>
                  {done} of {lessons.length} lessons {beaten ? '· Badge earned' : ''}
                </Txt>
                <Icon name={isOpen ? 'up' : 'down'} size={20} color={colors.accent} />
              </View>
            </Pressable>

            {isOpen ? (
              <View style={{ gap: 0, marginTop: space.xs }}>
                {current ? (
                  <View style={{ alignItems: 'center' }}>
                    <Mascot mood="wave" size={90} />
                  </View>
                ) : null}
                {lessons.map((l, idx) => {
                  const isDone = state.completed.includes(l.id);
                  const isNext = next?.id === l.id && canStartNew(state);
                  const tomorrow = next?.id === l.id && !isNext;
                  const playable = isDone || isNext;
                  const icon: IconName = isDone ? 'check' : isNext ? 'play' : tomorrow ? 'moon' : 'lock';
                  return (
                    <Pressable
                      key={l.id}
                      disabled={!playable}
                      onPress={() => go({ name: 'lesson', id: l.id, xpSoFar: 0 })}
                      accessibilityRole="button"
                      accessibilityLabel={`${l.title}, ${isDone ? 'done, tap to replay' : isNext ? 'up next' : tomorrow ? 'unlocks tomorrow' : 'locked'}`}
                      style={{ flexDirection: 'row', gap: space.sm, minHeight: 64 }}
                    >
                      <View style={{ alignItems: 'center', width: 48 }}>
                        <View style={{ width: 4, flex: 1, backgroundColor: idx === 0 ? 'transparent' : colors.border }} />
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDone ? colors.brand : isNext ? colors.brandSoft : colors.surfaceHi,
                            borderWidth: isNext ? 3 : 1,
                            borderColor: isNext ? colors.accent : colors.border,
                          }}
                        >
                          <Icon name={icon} size={iconPx} color={isDone ? colors.onBrand : isNext ? colors.accent : colors.textMuted} />
                        </View>
                        <View style={{ width: 4, flex: 1, backgroundColor: idx === lessons.length - 1 ? 'transparent' : colors.border }} />
                      </View>
                      <View style={{ flexShrink: 1, justifyContent: 'center', paddingVertical: 8, opacity: playable ? 1 : 0.6 }}>
                        <Txt bold={isNext}>{l.title}</Txt>
                        {tomorrow ? <Txt v="small" color={colors.textMuted}>Unlocks tomorrow</Txt> : null}
                        {isNext ? <Txt v="small" bold color={colors.accent}>Up next · tap to start</Txt> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </Card>
        );
      })}
      <BigButton label="Back home" icon="home" onPress={() => go({ name: 'home' })} />
    </Screen>
  );
}

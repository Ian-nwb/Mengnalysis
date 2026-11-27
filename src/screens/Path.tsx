import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollViewInstance, View } from 'react-native';
import Svg, { Path as SvgPath } from 'react-native-svg';
import { Icon, IconName } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { BigButton, Card, Kicker, ProgressBar, Screen, Txt } from '../components/ui';
import { lessonsInStage, STAGES } from '../content';
import { Lesson } from '../content/types';
import { accuracy, canStartNew, nextLesson, ReviewItem, shuffle, stageBeaten } from '../engine';
import { useReducedMotion } from '../motion';
import { Go } from '../nav';
import { useApp } from '../state';
import { space } from '../theme';

// A winding, game-style trail. Offsets stay small so the whole path fits one
// comfortable column (no sideways panning when zoomed in).
type Node =
  | { kind: 'lesson'; key: string; lesson: Lesson; boss: boolean }
  | { kind: 'practice'; key: string; before: Lesson[] }
  | { kind: 'chest'; key: string };

const SWAY = [0, 0.7, 1, 0.7, 0, -0.7, -1, -0.7];

function buildNodes(stage: number): Node[] {
  const lessons = lessonsInStage(stage);
  const out: Node[] = [];
  lessons.forEach((l, i) => {
    const boss = /boss/i.test(l.title);
    out.push({ kind: 'lesson', key: l.id, lesson: l, boss });
    if ((i + 1) % 4 === 0 && !boss && i < lessons.length - 1) out.push({ kind: 'practice', key: `p-${stage}-${i}`, before: lessons.slice(0, i + 1) });
    if (boss) out.push({ kind: 'chest', key: `chest-${stage}` });
  });
  return out;
}

function Pulse({ size, color }: { size: number; color: string }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduced, v]);
  if (reduced) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 4,
        borderColor: color,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
        transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
      }}
    />
  );
}

export function PathScreen({ go }: { go: Go }) {
  const { state, colors } = useApp();
  const reduced = useReducedMotion();
  const next = nextLesson(state);
  const canNew = canStartNew(state);
  const [open, setOpen] = useState<number | null>(next?.stage ?? 0);
  const [sel, setSel] = useState<string | null>(null);
  const [w, setW] = useState(0);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  const contentRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const currentRef = useRef<React.ComponentRef<typeof View> | null>(null);

  const jump = () => {
    if (!next) return;
    if (open !== next.stage) setOpen(next.stage);
    setTimeout(() => {
      const node = currentRef.current;
      const content = contentRef.current;
      if (!node || !content) return;
      node.measureLayout(content, (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 160), animated: !reduced }), () => {});
    }, 120);
  };
  useEffect(() => {
    const t = setTimeout(jump, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const amp = Math.min(60, w * 0.16);
  const nodeSize = Math.round(78 * Math.min(state.settings.textScale, 1.3));

  const practice = (before: Lesson[]) => {
    const done = before.filter((l) => state.completed.includes(l.id));
    const items: ReviewItem[] = shuffle(done.flatMap((l) => l.review))
      .slice(0, 5)
      .map((c) => ({ kind: 'card', card: c, key: c.id }));
    go({ name: 'review', items, then: null, mode: 'practice' });
  };

  const renderTrail = (stage: number) => {
    const nodes = buildNodes(stage);
    return (
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ alignItems: 'center', paddingVertical: space.sm }}>
        {nodes.map((n, i) => {
          const x = (SWAY[i % SWAY.length] ?? 0) * amp;
          const px = i === 0 ? x : (SWAY[(i - 1) % SWAY.length] ?? 0) * amp;
          let icon: IconName = 'lock';
          let label = '';
          let fill = colors.surfaceHi;
          let fg = colors.textMuted;
          let border = colors.border;
          let playable = false;
          let isCurrent = false;
          let status = 'Locked';
          let size = nodeSize;
          if (n.kind === 'lesson') {
            const done = state.completed.includes(n.lesson.id);
            const isNext = next?.id === n.lesson.id;
            label = n.lesson.title;
            if (n.boss) size = Math.round(nodeSize * 1.2);
            if (done) {
              icon = n.boss ? 'crown' : 'check';
              fill = colors.brand;
              fg = colors.onBrand;
              border = colors.brand;
              playable = true;
              status = 'Done';
            } else if (isNext && canNew) {
              icon = n.boss ? 'crown' : 'play';
              fill = colors.brandSoft;
              fg = colors.accent;
              border = colors.accent;
              playable = true;
              isCurrent = true;
              status = 'Up next';
            } else if (isNext) {
              icon = 'moon';
              status = 'Unlocks tomorrow';
              isCurrent = true;
            } else if (n.boss) icon = 'crown';
          } else if (n.kind === 'practice') {
            const any = n.before.some((l) => state.completed.includes(l.id));
            icon = 'star';
            label = 'Practice';
            playable = any;
            status = any ? 'Practice round' : 'Locked';
            if (any) {
              fill = colors.surface;
              fg = colors.accent;
              border = colors.accent;
            }
          } else {
            const ok = stageBeaten(state, stage);
            icon = ok ? 'sheet' : 'box';
            label = 'Cheat sheet';
            playable = ok;
            status = ok ? 'Cheat sheet unlocked' : 'Beat the boss to open';
            if (ok) {
              fill = colors.surface;
              fg = colors.accent;
              border = colors.brand;
            }
          }
          const selected = sel === n.key;
          return (
            <View key={n.key} style={{ width: '100%', alignItems: 'center' }}>
              {i > 0 && w > 0 ? (
                <Svg width={w} height={34} style={{ marginVertical: 2 }}>
                  <SvgPath
                    d={`M${w / 2 + px} 0 C ${w / 2 + px} 17, ${w / 2 + x} 17, ${w / 2 + x} 34`}
                    stroke={colors.border}
                    strokeWidth={6}
                    strokeDasharray="1 12"
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              ) : null}
              <View style={{ alignItems: 'center', transform: [{ translateX: x }] }} ref={isCurrent ? currentRef : undefined}>
                {isCurrent ? (
                  <View style={{ alignItems: 'center', marginBottom: 4 }}>
                    <Mascot mood={status === 'Unlocks tomorrow' ? 'sleep' : 'wave'} size={80} />
                    <View style={{ backgroundColor: colors.brand, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4 }}>
                      <Txt v="small" bold color={colors.onBrand}>{status === 'Unlocks tomorrow' ? 'Tomorrow' : 'Start'}</Txt>
                    </View>
                  </View>
                ) : null}
                <Pressable
                  onPress={() => setSel(selected ? null : n.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}. ${status}`}
                  style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}
                >
                  {isCurrent && playable ? <Pulse size={size} color={colors.accent} /> : null}
                  <View
                    style={{
                      width: size,
                      height: size,
                      borderRadius: n.kind === 'chest' ? 22 : size / 2,
                      backgroundColor: fill,
                      borderWidth: isCurrent ? 5 : 3,
                      borderColor: border,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: playable || isCurrent ? 1 : 0.65,
                      elevation: playable ? 4 : 0,
                      shadowColor: '#000',
                      shadowOpacity: playable ? 0.3 : 0,
                      shadowRadius: 6,
                      shadowOffset: { width: 0, height: 4 },
                    }}
                  >
                    <Icon name={icon} size={Math.round(size * 0.45)} color={fg} />
                  </View>
                </Pressable>
                <View style={{ maxWidth: Math.max(160, w * 0.6), marginTop: 6 }}>
                  <Txt v="small" bold={isCurrent} center color={playable || isCurrent ? colors.text : colors.textMuted}>
                    {label}
                  </Txt>
                </View>
              </View>
              {selected ? (
                <Card style={{ alignSelf: 'stretch', marginTop: space.sm }}>
                  <Kicker icon={icon}>{status}</Kicker>
                  <Txt v="h2">{label}</Txt>
                  {n.kind === 'lesson' ? (
                    <>
                      <Txt color={colors.textMuted}>
                        About {n.lesson.minutes} min
                        {accuracy(state, n.lesson.id) !== null ? `, ${Math.round((accuracy(state, n.lesson.id) ?? 0) * 100)}% right so far` : ''}
                      </Txt>
                      {playable ? (
                        <BigButton
                          label={state.completed.includes(n.lesson.id) ? 'Replay lesson' : 'Start lesson'}
                          icon="play"
                          variant="primary"
                          onPress={() => go({ name: 'lesson', id: n.lesson.id, xpSoFar: 0 })}
                        />
                      ) : (
                        <Txt>{status === 'Unlocks tomorrow' ? "You've done today's new lessons. This one opens tomorrow!" : 'Finish the lessons before this one to unlock it.'}</Txt>
                      )}
                    </>
                  ) : n.kind === 'practice' ? (
                    playable ? (
                      <BigButton label="Start practice" icon="star" variant="primary" onPress={() => practice(n.before)} />
                    ) : (
                      <Txt>Finish a lesson above to unlock this practice round.</Txt>
                    )
                  ) : playable ? (
                    <BigButton label="Open cheat sheet" icon="sheet" variant="primary" onPress={() => go({ name: 'sheet', stage })} />
                  ) : (
                    <Txt>Beat this stage's boss level to unlock its cheat sheet.</Txt>
                  )}
                  <BigButton label="Close" icon="x" variant="ghost" onPress={() => setSel(null)} />
                </Card>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Screen scrollRef={scrollRef} contentRef={contentRef}>
      <Txt v="h1">Your path</Txt>
      {next ? <BigButton label="Jump to my lesson" sub={next.title} icon="down" onPress={jump} /> : null}
      {STAGES.map((st) => {
        const lessons = lessonsInStage(st.n);
        const done = lessons.filter((l) => state.completed.includes(l.id)).length;
        const isOpen = open === st.n;
        const current = next?.stage === st.n;
        const beaten = stageBeaten(state, st.n);
        return (
          <View key={st.n} style={{ gap: space.xs }}>
            <Card tone={current ? 'hero' : 'plain'}>
              <Pressable
                onPress={() => setOpen(isOpen ? null : st.n)}
                accessibilityRole="button"
                accessibilityLabel={`Stage ${st.n}: ${st.title}. ${done} of ${lessons.length} lessons. ${isOpen ? 'Hide' : 'Show'} path`}
                style={{ gap: space.sm }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: beaten ? colors.brand : colors.surfaceHi,
                      borderWidth: 2,
                      borderColor: colors.brand,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {beaten ? <Icon name="trophy" size={28} color={colors.onBrand} /> : <Txt v="h2" center>{st.n}</Txt>}
                  </View>
                  <View style={{ flexShrink: 1 }}>
                    <Txt v="small" bold color={colors.accent}>STAGE {st.n}</Txt>
                    <Txt v="h2">{st.title}</Txt>
                  </View>
                </View>
                <Txt v="small" color={colors.textMuted}>{st.blurb}</Txt>
                <ProgressBar value={lessons.length ? done / lessons.length : 0} height={12} label={`${st.title} progress`} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Txt v="small" bold color={colors.accent}>
                    {done} of {lessons.length} done. {isOpen ? 'Hide path' : 'Show path'}
                  </Txt>
                  <Icon name={isOpen ? 'up' : 'down'} size={20} color={colors.accent} />
                </View>
              </Pressable>
            </Card>
            {isOpen ? renderTrail(st.n) : null}
          </View>
        );
      })}
    </Screen>
  );
}

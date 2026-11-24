import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { Mascot, MASCOT_NAME, Mood } from '../components/Mascot';
import { BigButton, Card, Kicker, ProgressBar, Screen, Txt } from '../components/ui';
import { buzz } from '../haptics';
import { useReducedMotion } from '../motion';
import { Go } from '../nav';
import { fullnessWord, happinessWord, PET_ITEMS, PetItem } from '../pet';
import { playSfx } from '../sfx';
import { useApp } from '../state';
import { space } from '../theme';

// Meng's corner: a little virtual pet. Rub Meng to pet her, drag food onto
// her to feed her (or tap a food, then tap Meng). Never sad, never guilt.

type Particle = { id: number; x: number; y: number; icon: IconName; color: string };
type Rect = { x: number; y: number; w: number; h: number };
const PURR_LINES = ['Purrrr…', 'Right behind the ears, please.', 'You are my favorite human.', 'Mrrp! ♡', 'More scritches!', 'This is the best spot.'];
const STUFFED = "I'm so full! Maybe a toy instead? 😺";

function FloatUp({ p, onDone }: { p: Particle; onDone: (id: number) => void }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: reduced ? 500 : 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => onDone(p.id));
  }, [v, p.id, onDone, reduced]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: p.x - 16,
        top: p.y - 16,
        opacity: v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
        transform: reduced ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) }, { scale: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 1.2, 1] }) }],
      }}
    >
      <Icon name={p.icon} size={32} color={p.color} filled />
    </Animated.View>
  );
}

type TileApi = {
  grant: () => void;
  move: (id: string, x: number, y: number) => void;
  end: (id: string, x: number, y: number, moved: number) => void;
  cancel: () => void;
};

/** A pantry/toy tile you can drag onto Meng (or tap to select). */
function DragTile({ it, count, selected, dragging, api }: { it: PetItem; count: number | null; selected: boolean; dragging: boolean; api: TileApi }) {
  const { colors } = useApp();
  const apiRef = useRef(api);
  apiRef.current = api;
  const start = useRef({ x: 0, y: 0, moved: 0 });
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        start.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, moved: 0 };
        apiRef.current.grant();
      },
      onPanResponderMove: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        start.current.moved = Math.max(start.current.moved, Math.hypot(pageX - start.current.x, pageY - start.current.y));
        if (start.current.moved > 10) apiRef.current.move(it.id, pageX, pageY);
      },
      onPanResponderRelease: (e) => apiRef.current.end(it.id, e.nativeEvent.pageX, e.nativeEvent.pageY, start.current.moved),
      onPanResponderTerminate: () => apiRef.current.cancel(),
    }),
  ).current;
  return (
    <View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${it.name}${count !== null ? `, ${count} left` : ''}. Drag onto Meng, or tap then tap Meng`}
      style={{
        flexGrow: 1,
        flexBasis: 100,
        minHeight: 96,
        borderRadius: 18,
        borderWidth: selected ? 4 : 2,
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? colors.brandSoft : colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        opacity: dragging ? 0.4 : 1,
      }}
    >
      <Icon name={it.icon} size={36} color={colors.accent} />
      <Txt v="small" bold center>{it.name}</Txt>
      {count !== null ? <Txt v="small" center color={colors.textMuted}>×{count}</Txt> : null}
    </View>
  );
}

export function MengScreen({ go }: { go: Go }) {
  const { state, setState, colors } = useApp();
  const reduced = useReducedMotion();
  const pet = state.pet;
  const inventory = pet.inventory ?? {};
  const toys = pet.toys ?? [];

  const [tempMood, setTempMood] = useState<Mood | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);
  const [chew, setChew] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scrollOn, setScrollOn] = useState(true);

  const rootRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const mengRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const root = useRef({ x: 0, y: 0 });
  const mengRect = useRef<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const pid = useRef(0);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPurr = useRef(0);

  const breathe = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  const hour = new Date().getHours();
  const night = hour >= 22 || hour < 7;
  const baseMood: Mood = night && !tempMood ? 'sleep' : pet.fullness < 30 ? 'hungry' : pet.happiness >= 85 && pet.fullness >= 70 ? 'love' : 'happy';
  const mood = tempMood ?? baseMood;
  const baseLine = night
    ? `Zzz… ${MASCOT_NAME} is snoozing. Rub her gently to say goodnight.`
    : pet.fullness < 30
      ? "My tummy is rumbling! Got a snack for me? (No rush 💜)"
      : pet.happiness < 30
        ? 'Will you play with me? A rub would be lovely too.'
        : 'Hi! Rub me for scritches, or drag a snack onto me.';

  // Gentle idle animation: breathing + blinking.
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    const b = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3800);
    return () => {
      loop.stop();
      clearInterval(b);
    };
  }, [reduced, breathe]);

  useEffect(() => () => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
  }, []);

  const feel = (m: Mood, ms = 2200) => {
    setTempMood(m);
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setTempMood(null), ms);
  };
  const doHop = (h = 14) => {
    if (reduced) return;
    hop.setValue(0);
    Animated.sequence([
      Animated.timing(hop, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(hop, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 12 }),
    ]).start();
    void h;
  };
  const doWiggle = () => {
    if (reduced) return;
    wiggle.setValue(0);
    Animated.sequence(
      [1, -1, 1, -1, 0].map((to) => Animated.timing(wiggle, { toValue: to, duration: 110, useNativeDriver: true })),
    ).start();
  };
  const spawn = useCallback((x: number, y: number, icon: IconName, color: string, n = 1) => {
    setParticles((ps) => [
      ...ps.slice(-14),
      ...Array.from({ length: n }, (_, i) => ({ id: ++pid.current, x: x + (i - (n - 1) / 2) * 24, y: y - i * 6, icon, color })),
    ]);
  }, []);
  const removeParticle = useCallback((id: number) => setParticles((ps) => ps.filter((p) => p.id !== id)), []);

  const center = () => ({ x: mengRect.current.x - root.current.x + mengRect.current.w / 2, y: mengRect.current.y - root.current.y + mengRect.current.h * 0.35 });

  const measure = () => {
    rootRef.current?.measureInWindow((x, y) => (root.current = { x, y }));
    mengRef.current?.measureInWindow((x, y, w, h) => (mengRect.current = { x, y, w, h }));
  };

  const petTick = (x: number, y: number) => {
    setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + 2) } }));
    feel('purr');
    buzz('light');
    const now = Date.now();
    if (now - lastPurr.current > 1600) {
      playSfx('purr');
      lastPurr.current = now;
      setLine(PURR_LINES[Math.floor(Math.random() * PURR_LINES.length)]);
    }
    spawn(x, y, 'heart', '#E0457B');
  };

  const use = (id: string) => {
    const it = PET_ITEMS.find((x) => x.id === id);
    if (!it) return;
    const c = center();
    setSelected(null);
    if (it.kind === 'food') {
      if ((inventory[id] ?? 0) <= 0) return;
      if (pet.fullness >= 100) {
        feel('happy');
        setLine(STUFFED);
        return;
      }
      setState((s) => {
        const inv = { ...(s.pet.inventory ?? {}) };
        inv[id] = Math.max(0, (inv[id] ?? 0) - 1);
        return {
          ...s,
          pet: { ...s.pet, inventory: inv, fullness: Math.min(100, s.pet.fullness + it.full), happiness: Math.min(100, s.pet.happiness + it.happy), fedTotal: s.pet.fedTotal + 1 },
        };
      });
      playSfx('chomp');
      buzz('success');
      setTempMood('eat');
      if (moodTimer.current) clearTimeout(moodTimer.current);
      let n = 0;
      const t = setInterval(() => {
        setChew((v) => !v);
        if (++n >= 8) {
          clearInterval(t);
          setChew(false);
          feel(pet.fullness + it.full >= 90 ? 'love' : 'cheer', 2000);
          playSfx('meow');
          doHop();
        }
      }, 160);
      spawn(c.x, c.y + 30, it.icon, colors.accent);
      setLine(it.line);
    } else {
      setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + it.happy) } }));
      playSfx('boing');
      buzz('success');
      feel('cheer', 2400);
      doWiggle();
      doHop();
      spawn(c.x, c.y, 'star', colors.brand, 3);
      setLine(it.line);
    }
  };

  // Rubbing Meng: every bit of finger movement over her counts as a pet. A tap also pets
  // (or feeds the selected food). Callbacks live in a ref so the responder stays stable.
  const latest = useRef({ petTick, use, measure, selected, hopTap: () => {} });
  latest.current = {
    petTick,
    use,
    measure,
    selected,
    hopTap: () => {
      playSfx('meow');
      doHop();
    },
  };
  const rub = useRef({ dist: 0, moved: 0, lx: 0, ly: 0 });
  const rubResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        latest.current.measure();
        setScrollOn(false);
        rub.current = { dist: 0, moved: 0, lx: e.nativeEvent.pageX, ly: e.nativeEvent.pageY };
      },
      onPanResponderMove: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        const d = Math.hypot(pageX - rub.current.lx, pageY - rub.current.ly);
        rub.current.lx = pageX;
        rub.current.ly = pageY;
        rub.current.dist += d;
        rub.current.moved += d;
        if (rub.current.dist > 70) {
          rub.current.dist = 0;
          latest.current.petTick(pageX - root.current.x, pageY - root.current.y);
        }
      },
      onPanResponderRelease: (e) => {
        setScrollOn(true);
        if (rub.current.moved < 12) {
          const L = latest.current;
          if (L.selected) L.use(L.selected);
          else {
            L.petTick(e.nativeEvent.pageX - root.current.x, e.nativeEvent.pageY - root.current.y);
            L.hopTap();
          }
        }
      },
      onPanResponderTerminate: () => setScrollOn(true),
    }),
  ).current;

  const tileApi = {
    grant: () => {
      latest.current.measure();
      setScrollOn(false);
    },
    move: (id: string, x: number, y: number) => setDrag({ id, x, y }),
    end: (id: string, x: number, y: number, moved: number) => {
      setScrollOn(true);
      setDrag(null);
      if (moved <= 10) {
        setSelected((cur) => (cur === id ? null : id));
        return;
      }
      const m = mengRect.current;
      const it = PET_ITEMS.find((x) => x.id === id);
      if (x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) latest.current.use(id);
      else if (it) setLine(`Bring the ${it.name.toLowerCase()} right onto me!`);
    },
    cancel: () => {
      setScrollOn(true);
      setDrag(null);
    },
  };

  const foods = PET_ITEMS.filter((x) => x.kind === 'food' && (inventory[x.id] ?? 0) > 0);
  const ownedToys = PET_ITEMS.filter((x) => x.kind === 'toy' && toys.includes(x.id));
  const sel = PET_ITEMS.find((x) => x.id === selected);

  const buy = (it: PetItem) => {
    if (pet.treats < it.cost) return;
    setState((s) => ({
      ...s,
      pet: {
        ...s.pet,
        treats: s.pet.treats - it.cost,
        inventory: it.kind === 'food' ? { ...(s.pet.inventory ?? {}), [it.id]: ((s.pet.inventory ?? {})[it.id] ?? 0) + 1 } : s.pet.inventory ?? {},
        toys: it.kind === 'toy' ? Array.from(new Set([...(s.pet.toys ?? []), it.id])) : s.pet.toys ?? [],
      },
    }));
    playSfx('correct');
    setLine(it.kind === 'food' ? `Ooh, ${it.name.toLowerCase()} for later? Yes please!` : `A new ${it.name.toLowerCase()}! Drag it over to play.`);
  };

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });
  return (
    <Screen scrollEnabled={scrollOn}>
      <View ref={rootRef} onLayout={measure} style={{ gap: space.md }}>
        <Txt v="h1">{MASCOT_NAME}'s corner</Txt>

        <Card tone="hero" style={{ alignItems: 'center' }}>
          <View
            ref={mengRef}
            onLayout={measure}
            {...rubResponder.panHandlers}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${MASCOT_NAME}. ${sel ? `Tap to give her the ${sel.name}` : 'Rub or tap to pet her'}`}
            style={{ alignItems: 'center', paddingVertical: 8 }}
          >
            <Animated.View
              style={{
                transform: [
                  { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }) },
                  { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] }) },
                  { scaleY: scale },
                ],
              }}
            >
              <Mascot mood={mood} size={230} blink={blink} chewOpen={chew} tapToMeow={false} />
            </Animated.View>
          </View>
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, borderWidth: 2, borderColor: colors.brand, padding: space.sm, alignSelf: 'stretch' }}>
            <Txt center>{line ?? baseLine}</Txt>
          </View>
          <Txt v="small" center color={colors.textMuted}>
            Rub {MASCOT_NAME} to pet her · drag a snack or toy onto her (or tap it, then tap her)
          </Txt>
        </Card>

        {sel ? (
          <BigButton label={`Give ${sel.name} to ${MASCOT_NAME}`} icon={sel.icon} variant="primary" onPress={() => use(sel.id)} />
        ) : null}

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="fish" size={30} color={colors.brand} />
            <Txt v="h2">{pet.treats} {pet.treats === 1 ? 'treat' : 'treats'}</Txt>
          </View>
          <Kicker icon="bowl">Tummy: {fullnessWord(pet.fullness)} ({pet.fullness}/100)</Kicker>
          <ProgressBar value={pet.fullness / 100} height={14} label="Tummy" />
          <Kicker icon="heart">Happiness: {happinessWord(pet.happiness)} ({pet.happiness}/100)</Kicker>
          <ProgressBar value={pet.happiness / 100} height={14} label="Happiness" />
        </Card>

        <Txt v="h2">Pantry</Txt>
        {foods.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {foods.map((it) => (
              <DragTile key={it.id} it={it} count={inventory[it.id] ?? 0} selected={selected === it.id} dragging={drag?.id === it.id} api={tileApi} />
            ))}
          </View>
        ) : (
          <Txt color={colors.textMuted}>The pantry is empty. Buy snacks in the shop below with your treats.</Txt>
        )}

        <Txt v="h2">Toy box</Txt>
        {ownedToys.length ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {ownedToys.map((it) => (
              <DragTile key={it.id} it={it} count={null} selected={selected === it.id} dragging={drag?.id === it.id} api={tileApi} />
            ))}
          </View>
        ) : (
          <Txt color={colors.textMuted}>No toys yet. Toys are yours forever once bought.</Txt>
        )}

        <BigButton label="Pet Meng" sub="Or rub her with your finger" icon="heart" variant="ghost" onPress={() => petTick(center().x, center().y)} />

        <Txt v="h2">Shop</Txt>
        <Txt v="small" color={colors.textMuted}>Earn treats by learning: +2 per new lesson, +1 per review, +5 per boss level.</Txt>
        {PET_ITEMS.map((it) => {
          const owned = it.kind === 'toy' && toys.includes(it.id);
          const short = it.cost - pet.treats;
          return (
            <BigButton
              key={it.id}
              label={owned ? `${it.name} (owned)` : `Buy ${it.name}`}
              sub={
                owned
                  ? 'In the toy box'
                  : `${it.cost} ${it.cost === 1 ? 'treat' : 'treats'} · ${it.kind === 'food' ? `+${it.full} tummy` : `+${it.happy} happiness each play`}${short > 0 ? ` · need ${short} more` : ''}`
              }
              icon={it.icon}
              state={owned || short > 0 ? 'dim' : 'normal'}
              disabled={owned || short > 0}
              onPress={() => buy(it)}
            />
          );
        })}

        {particles.map((p) => (
          <FloatUp key={p.id} p={p} onDone={removeParticle} />
        ))}
        {drag ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: drag.x - root.current.x - 32, top: drag.y - root.current.y - 32 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandSoft, borderWidth: 3, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={PET_ITEMS.find((x) => x.id === drag.id)?.icon ?? 'bowl'} size={38} color={colors.accent} />
            </View>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, PanResponder, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { Icon, IconName } from '../components/Icon';
import { Mascot, MASCOT_NAME, Mood } from '../components/Mascot';
import { BigButton, Card, Kicker, ListenButton, ProgressBar, Txt } from '../components/ui';
import { buzz } from '../haptics';
import { useReducedMotion } from '../motion';
import { Go } from '../nav';
import { fullnessWord, happinessWord, PET_ITEMS, PetItem } from '../pet';
import { playSfx } from '../sfx';
import { useApp } from '../state';
import { BRAND, palettes, space } from '../theme';

// Meng's home: three cozy rooms, one screen, no scrolling. Meng sits in the middle;
// the item you're holding sits right below her: drag it up onto her, or just tap it.

type Room = 'living' | 'kitchen' | 'bedroom';
const ROOMS: { id: Room; name: string }[] = [
  { id: 'living', name: 'Living room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'bedroom', name: 'Bedroom' },
];
type Particle = { id: number; x: number; y: number; icon: IconName; color: string };
type Rect4 = { x: number; y: number; w: number; h: number };
const PURR_LINES = ['Purrrr…', 'Right behind the ears, please.', 'You are my favorite human.', 'Mrrp! ♡', 'More scritches!', 'Ahh, the best spot.'];

// ---------- room art ----------
function RoomArt({ room, w, h, dark, lightsOff }: { room: Room; w: number; h: number; dark: boolean; lightsOff: boolean }) {
  const floorY = h * 0.68;
  const wall = { living: dark ? '#3A2646' : '#F6E3FA', kitchen: dark ? '#3B2A35' : '#FFE9DC', bedroom: dark ? '#2B2447' : '#E6DDF8' }[room];
  const floor = { living: dark ? '#5A3F33' : '#D9B48F', kitchen: dark ? '#4A3C4E' : '#EADBEA', bedroom: dark ? '#3E3060' : '#CFC0EE' }[room];
  const trim = dark ? '#1B1420' : '#7A2E8C';
  const winX = w * 0.08;
  const winW = Math.min(w * 0.3, 150);
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Rect x={0} y={0} width={w} height={h} fill={wall} />
      {room === 'kitchen'
        ? Array.from({ length: Math.ceil(w / 40) + 1 }, (_, i) => (
            <Line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={floorY} stroke={trim} strokeOpacity={0.12} strokeWidth={2} />
          )).concat(
            Array.from({ length: Math.ceil(floorY / 40) }, (_, i) => (
              <Line key={`h${i}`} x1={0} y1={i * 40} x2={w} y2={i * 40} stroke={trim} strokeOpacity={0.12} strokeWidth={2} />
            )),
          )
        : null}
      {room === 'bedroom'
        ? [0.15, 0.32, 0.55, 0.78, 0.9].map((fx, i) => (
            <Path key={i} d={`M${w * fx} ${h * (0.1 + (i % 3) * 0.08)} l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z`} fill={BRAND} opacity={0.45} />
          ))
        : null}
      {/* window */}
      {room !== 'kitchen' ? (
        <G>
          <Rect x={winX} y={h * 0.1} width={winW} height={winW * 0.9} rx={14} fill={lightsOff || dark ? '#2B3A67' : '#BFE3FF'} stroke={trim} strokeWidth={5} />
          <Line x1={winX + winW / 2} y1={h * 0.1} x2={winX + winW / 2} y2={h * 0.1 + winW * 0.9} stroke={trim} strokeWidth={4} />
          <Line x1={winX} y1={h * 0.1 + winW * 0.45} x2={winX + winW} y2={h * 0.1 + winW * 0.45} stroke={trim} strokeWidth={4} />
          {lightsOff || dark ? <Circle cx={winX + winW * 0.72} cy={h * 0.1 + winW * 0.25} r={winW * 0.1} fill="#FFF3C4" /> : <Circle cx={winX + winW * 0.75} cy={h * 0.1 + winW * 0.22} r={winW * 0.1} fill="#FFD66B" />}
        </G>
      ) : (
        <G>
          {/* shelf with jars */}
          <Rect x={w * 0.62} y={h * 0.2} width={w * 0.32} height={8} rx={4} fill={trim} />
          {[0, 1, 2].map((i) => (
            <Rect key={i} x={w * 0.64 + i * (w * 0.1)} y={h * 0.2 - 34} width={w * 0.07} height={34} rx={8} fill={[BRAND, '#F2A65A', '#8FE3A6'][i]} stroke={trim} strokeWidth={3} />
          ))}
        </G>
      )}
      {/* floor */}
      <Rect x={0} y={floorY} width={w} height={h - floorY} fill={floor} />
      <Rect x={0} y={floorY} width={w} height={6} fill={trim} opacity={0.35} />
      {room === 'living' ? <Ellipse cx={w / 2} cy={floorY + (h - floorY) * 0.35} rx={w * 0.36} ry={(h - floorY) * 0.22} fill={BRAND} opacity={0.55} /> : null}
      {room === 'bedroom' ? <Ellipse cx={w / 2} cy={floorY + (h - floorY) * 0.3} rx={w * 0.33} ry={(h - floorY) * 0.24} fill="#7A2E8C" stroke={trim} strokeWidth={4} /> : null}
      {room === 'kitchen' ? (
        <G>
          <Ellipse cx={w * 0.8} cy={floorY + (h - floorY) * 0.35} rx={w * 0.09} ry={(h - floorY) * 0.12} fill={BRAND} stroke={trim} strokeWidth={4} />
          <Ellipse cx={w * 0.8} cy={floorY + (h - floorY) * 0.3} rx={w * 0.06} ry={(h - floorY) * 0.05} fill={trim} opacity={0.4} />
        </G>
      ) : null}
      {lightsOff ? <Rect x={0} y={0} width={w} height={h} fill="#0B0614" opacity={0.55} /> : null}
    </Svg>
  );
}

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
        transform: reduced ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) }, { scale: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 1.25, 1] }) }],
      }}
    >
      <Icon name={p.icon} size={34} color={p.color} filled />
    </Animated.View>
  );
}

/** Round icon button used in the top and bottom bars. */
function RoundBtn({ icon, label, onPress, size = 64, a11y }: { icon: IconName; label?: string; onPress: () => void; size?: number; a11y: string }) {
  const { colors } = useApp();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={{ alignItems: 'center', gap: 2, minWidth: size }}>
      {({ pressed }) => (
        <>
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: pressed ? colors.brand : colors.surface,
              borderWidth: 3,
              borderColor: colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 4,
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <Icon name={icon} size={Math.round(size * 0.48)} color={pressed ? colors.onBrand : colors.accent} />
          </View>
          {label ? (
            <Txt v="small" bold center>
              {label}
            </Txt>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

function Meter({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  const { colors } = useApp();
  return (
    <View accessible accessibilityLabel={`${label}: ${value} out of 100`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexGrow: 1, flexBasis: 90 }}>
      <Icon name={icon} size={26} color={colors.accent} />
      <View style={{ flex: 1, height: 14, borderRadius: 7, backgroundColor: colors.surfaceHi, borderWidth: 2, borderColor: colors.border, overflow: 'hidden' }}>
        <View style={{ width: `${value}%`, height: '100%', backgroundColor: value < 30 ? '#F2A65A' : colors.brand }} />
      </View>
    </View>
  );
}

/** A sheet that slides over the room (shop, pantry, help). */
function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(10,5,20,0.55)', justifyContent: 'flex-end' }}>
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', borderTopWidth: 3, borderColor: colors.brand }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.md, gap: space.sm }}>
            <Txt v="h2" style={{ flexShrink: 1 }}>{title}</Txt>
            <RoundBtn icon="x" onPress={onClose} size={52} a11y={`Close ${title}`} />
          </View>
          <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: 0, gap: space.sm }}>{children}</ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export function MengScreen({ go }: { go: Go }) {
  void go;
  const { state, setState, colors } = useApp();
  const reduced = useReducedMotion();
  const dark = colors.bg === palettes.dark.bg;
  const pet = state.pet;
  const inventory = pet.inventory ?? {};
  const toys = pet.toys ?? [];

  const [room, setRoom] = useState<Room>('living');
  const [lightsOff, setLightsOff] = useState(false);
  const [tempMood, setTempMood] = useState<Mood | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);
  const [chew, setChew] = useState(false);
  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sheet, setSheet] = useState<'shop' | 'items' | 'help' | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [yawn, setYawn] = useState(false);
  const [antic, setAntic] = useState(false); // mouth open, waiting for food

  const rootRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const mengRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const root = useRef({ x: 0, y: 0 });
  const mengRect = useRef<Rect4>({ x: 0, y: 0, w: 0, h: 0 });
  const pid = useRef(0);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPurr = useRef(0);
  const breathe = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const recentPets = useRef<number[]>([]);
  const recentTaps = useRef<number[]>([]);
  const busy = useRef(false);

  // What the bottom bar holds depends on the room.
  const items: PetItem[] =
    room === 'kitchen'
      ? PET_ITEMS.filter((x) => x.kind === 'food' && (inventory[x.id] ?? 0) > 0)
      : room === 'living'
        ? PET_ITEMS.filter((x) => x.kind === 'toy' && toys.includes(x.id))
        : [];
  const cur = items.length ? items[((idx % items.length) + items.length) % items.length] : null;

  const sleeping = room === 'bedroom' && lightsOff;
  const baseMood: Mood = sleeping ? 'sleep' : pet.fullness < 30 ? 'hungry' : pet.happiness >= 85 && pet.fullness >= 70 ? 'love' : 'happy';
  const sleepingRef = useRef(false);
  sleepingRef.current = sleeping;
  const mood = antic ? 'eat' : tempMood ?? baseMood;
  const baseLine = sleeping
    ? 'Zzz… goodnight. Tap the lamp to turn the lights back on.'
    : room === 'kitchen'
      ? pet.fullness < 30
        ? 'My tummy is rumbling! Something yummy? 🐟'
        : cur
          ? `Slide the ${cur.name.toLowerCase()} up to me, or just tap it.`
          : 'The pantry is empty. Let\'s visit the shop!'
      : room === 'bedroom'
        ? 'Cozy time. Tap the lamp when I need a nap.'
        : cur
          ? 'Rub me for scritches, or toss me a toy!'
          : 'Rub me for scritches! Toys from the shop live here.';

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
  useEffect(
    () => () => {
      if (moodTimer.current) clearTimeout(moodTimer.current);
    },
    [],
  );
  useEffect(() => {
    setLine(null);
    if (reduced) return;
    enter.setValue(1);
    Animated.spring(enter, { toValue: 0, useNativeDriver: true, speed: 6, bounciness: 6 }).start();
  }, [room, reduced, enter]);

  // Pou-style idle life: every few seconds Meng does something on her own.
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => {
      if (busy.current) return;
      const acts = sleepingRef.current ? ['snore'] : ['look', 'look', 'yawn', 'stretch', 'hop', 'tail', 'peek'];
      const a = acts[Math.floor(Math.random() * acts.length)];
      if (a === 'look') {
        setLook({ x: -1, y: 0 });
        setTimeout(() => setLook({ x: 1, y: -0.3 }), 700);
        setTimeout(() => setLook({ x: 0, y: 0 }), 1500);
      } else if (a === 'peek') {
        setLook({ x: 0, y: 1 });
        setTimeout(() => setLook({ x: 0, y: 0 }), 1200);
      } else if (a === 'yawn') {
        setYawn(true);
        setTimeout(() => setYawn(false), 1300);
      } else if (a === 'stretch') {
        Animated.sequence([
          Animated.timing(squash, { toValue: -1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(squash, { toValue: 0, useNativeDriver: true, speed: 8, bounciness: 10 }),
        ]).start();
      } else if (a === 'hop') doHopRef.current();
      else if (a === 'tail') doWiggleRef.current(0.4);
      else if (a === 'snore') {
        Animated.sequence([
          Animated.timing(squash, { toValue: 0.4, duration: 900, useNativeDriver: true }),
          Animated.timing(squash, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]).start();
      }
    }, 5200);
    return () => clearInterval(t);
  }, [reduced, squash]);

  const feel = (m: Mood, ms = 2200) => {
    setTempMood(m);
    busy.current = true;
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => {
      setTempMood(null);
      busy.current = false;
    }, ms);
  };
  const doHop = () => {
    if (reduced) return;
    hop.setValue(0);
    Animated.sequence([
      Animated.timing(hop, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(hop, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 12 }),
    ]).start();
  };
  const doWiggle = (k = 1) => {
    if (reduced) return;
    wiggle.setValue(0);
    Animated.sequence([k, -k, k, -k, 0].map((to) => Animated.timing(wiggle, { toValue: to, duration: 110, useNativeDriver: true }))).start();
  };
  const doSquish = () => {
    if (reduced) return;
    squash.setValue(0);
    Animated.sequence([
      Animated.timing(squash, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.spring(squash, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 16 }),
    ]).start();
  };
  const doHopRef = useRef(doHop);
  doHopRef.current = doHop;
  const doWiggleRef = useRef(doWiggle);
  doWiggleRef.current = doWiggle;
  const spawn = useCallback((x: number, y: number, icon: IconName, color: string, n = 1) => {
    setParticles((ps) => [...ps.slice(-14), ...Array.from({ length: n }, (_, i) => ({ id: ++pid.current, x: x + (i - (n - 1) / 2) * 26, y: y - i * 6, icon, color }))]);
  }, []);
  const removeParticle = useCallback((id: number) => setParticles((ps) => ps.filter((p) => p.id !== id)), []);
  const measure = () => {
    rootRef.current?.measureInWindow((x, y) => (root.current = { x, y }));
    mengRef.current?.measureInWindow((x, y, w, h) => (mengRect.current = { x, y, w, h }));
  };
  const center = () => ({ x: mengRect.current.x - root.current.x + mengRect.current.w / 2, y: mengRect.current.y - root.current.y + mengRect.current.h * 0.3 });

  const petTick = (x: number, y: number) => {
    if (sleeping) {
      spawn(x, y, 'heart', '#E0457B');
      return;
    }
    setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + 2) } }));
    const now0 = Date.now();
    recentPets.current = [...recentPets.current.filter((t) => now0 - t < 1500), now0];
    if (recentPets.current.length >= 9) {
      recentPets.current = [];
      feel('dizzy', 2200);
      doWiggle(0.6);
      setLine("Wheee! I'm all dizzy! 😵‍💫");
      spawn(x, y, 'star', BRAND, 3);
      return;
    }
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

  const give = (it: PetItem) => {
    const c = center();
    if (sleeping) return;
    if (it.kind === 'food') {
      if ((inventory[it.id] ?? 0) <= 0) return;
      if (pet.fullness >= 100) {
        feel('happy');
        setLine("I'm so full! Maybe later. 😺");
        return;
      }
      setState((s) => {
        const inv = { ...(s.pet.inventory ?? {}) };
        inv[it.id] = Math.max(0, (inv[it.id] ?? 0) - 1);
        return { ...s, pet: { ...s.pet, inventory: inv, fullness: Math.min(100, s.pet.fullness + it.full), happiness: Math.min(100, s.pet.happiness + it.happy), fedTotal: s.pet.fedTotal + 1 } };
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
      spawn(c.x, c.y + 40, it.icon, colors.accent);
    } else {
      setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + it.happy) } }));
      playSfx('boing');
      buzz('success');
      feel('cheer', 2400);
      doWiggle();
      doHop();
      spawn(c.x, c.y, 'star', BRAND, 3);
    }
    setLine(it.line);
  };

  const latest = useRef({ petTick, give, measure, cur, hopTap: () => {}, track: (_x: number, _y: number) => {}, endTrack: () => {} });
  latest.current = {
    petTick,
    give,
    measure,
    cur,
    hopTap: () => {
      if (sleeping) return;
      doSquish();
      const now = Date.now();
      recentTaps.current = [...recentTaps.current.filter((t) => now - t < 2000), now];
      if (recentTaps.current.length >= 4) {
        recentTaps.current = [];
        feel('cheer', 1800);
        doWiggle();
        playSfx('boing');
        setLine('Hehe, that tickles! 😹');
      } else playSfx('meow');
    },
    track: (px: number, py: number) => {
      const m = mengRect.current;
      if (!m.w) return;
      const cx = m.x + m.w / 2;
      const cy = m.y + m.h * 0.4;
      setLook({ x: (px - cx) / (m.w * 0.6), y: (py - cy) / (m.h * 0.6) });
      const near = Math.hypot(px - cx, py - cy) < m.w * 0.9;
      setAntic(!!cur && cur.kind === 'food' && near && !sleeping);
    },
    endTrack: () => {
      setLook({ x: 0, y: 0 });
      setAntic(false);
    },
  };

  // Rub anywhere on Meng to pet her; a tap pets too.
  const rub = useRef({ dist: 0, moved: 0, lx: 0, ly: 0 });
  const rubResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        latest.current.measure();
        rub.current = { dist: 0, moved: 0, lx: e.nativeEvent.pageX, ly: e.nativeEvent.pageY };
      },
      onPanResponderMove: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        const d = Math.hypot(pageX - rub.current.lx, pageY - rub.current.ly);
        rub.current = { ...rub.current, lx: pageX, ly: pageY, dist: rub.current.dist + d, moved: rub.current.moved + d };
        if (rub.current.dist > 60) {
          rub.current.dist = 0;
          latest.current.petTick(pageX - root.current.x, pageY - root.current.y);
        }
      },
      onPanResponderRelease: (e) => {
        if (rub.current.moved < 12) {
          latest.current.petTick(e.nativeEvent.pageX - root.current.x, e.nativeEvent.pageY - root.current.y);
          latest.current.hopTap();
        }
      },
    }),
  ).current;

  // The held item: drag it up onto Meng, or tap to give it.
  const hold = useRef({ x: 0, y: 0, moved: 0 });
  const itemResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!latest.current.cur,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        latest.current.measure();
        hold.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY, moved: 0 };
      },
      onPanResponderMove: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        hold.current.moved = Math.max(hold.current.moved, Math.hypot(pageX - hold.current.x, pageY - hold.current.y));
        if (hold.current.moved > 10) {
          setDrag({ x: pageX, y: pageY });
          latest.current.track(pageX, pageY);
        }
      },
      onPanResponderRelease: (e) => {
        setDrag(null);
        latest.current.endTrack();
        const it = latest.current.cur;
        if (!it) return;
        const { pageX, pageY } = e.nativeEvent;
        const m = mengRect.current;
        if (hold.current.moved <= 10) latest.current.give(it);
        else if (pageX >= m.x && pageX <= m.x + m.w && pageY >= m.y && pageY <= m.y + m.h) latest.current.give(it);
        else setLine('Bring it right up to me!');
      },
      onPanResponderTerminate: () => {
        setDrag(null);
        latest.current.endTrack();
      },
    }),
  ).current;

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
  };

  const roomI = ROOMS.findIndex((r) => r.id === room);
  const switchRoom = (d: number) => {
    setRoom(ROOMS[(roomI + d + ROOMS.length) % ROOMS.length].id);
    setIdx(0);
    if (room === 'bedroom') setLightsOff(false);
  };
  const toggleLights = () => {
    const off = !lightsOff;
    setLightsOff(off);
    playSfx(off ? 'purr' : 'meow');
    if (off) setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + 5) } }));
    setLine(null);
  };

  const mengSize = Math.max(140, Math.min(size.w * 0.68, size.h * 0.4, 300));
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });
  const leftBtn = room === 'kitchen' ? { icon: 'bowl' as IconName, label: 'Pantry' } : room === 'living' ? { icon: 'box' as IconName, label: 'Toys' } : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        ref={rootRef}
        style={{ flex: 1 }}
        onLayout={(e) => {
          setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
          measure();
        }}
      >
        {size.w > 0 ? <RoomArt room={room} w={size.w} h={size.h} dark={dark} lightsOff={lightsOff} /> : null}

        {/* top bar: treats · meters · help */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingTop: space.sm, flexWrap: 'wrap' }}>
          <View
            accessible
            accessibilityLabel={`${pet.treats} treats`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface, borderRadius: 22, borderWidth: 3, borderColor: colors.brand, paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <Icon name="fish" size={26} color={colors.accent} />
            <Txt bold>{pet.treats}</Txt>
          </View>
          <View style={{ flexGrow: 1, flexBasis: 160, flexDirection: 'row', gap: space.sm, backgroundColor: colors.surface, borderRadius: 22, borderWidth: 2, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 8 }}>
            <Meter icon="bowl" value={pet.fullness} label="Tummy" />
            <Meter icon="heart" value={pet.happiness} label="Happiness" />
          </View>
          <RoundBtn icon="help" onPress={() => setSheet('help')} size={48} a11y="How Meng's home works" />
        </View>

        {/* room switcher */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md, marginTop: space.sm }}>
          <RoundBtn icon="back" onPress={() => switchRoom(-1)} size={52} a11y={`Go to ${ROOMS[(roomI + 2) % 3].name}`} />
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, borderWidth: 3, borderColor: colors.brand, paddingHorizontal: 16, paddingVertical: 6, minWidth: 150 }}>
            <Txt v="h2" center>{ROOMS[roomI].name}</Txt>
          </View>
          <RoundBtn icon="next" onPress={() => switchRoom(1)} size={52} a11y={`Go to ${ROOMS[(roomI + 1) % 3].name}`} />
        </View>

        {/* Meng + speech */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: size.h * 0.05 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, borderWidth: 2, borderColor: colors.brand, paddingHorizontal: 14, paddingVertical: 8, marginHorizontal: space.md, marginBottom: 6, maxWidth: 460 }}>
            <Txt center>{line ?? baseLine}</Txt>
          </View>
          <View
            ref={mengRef}
            {...rubResponder.panHandlers}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${MASCOT_NAME}. Rub or tap to pet her.`}
          >
            <Animated.View
              style={{
                transform: [
                  { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }) },
                  { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [0, 90] }) },
                  { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] }) },
                  { scaleY: Animated.multiply(scale, squash.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.1, 1, 0.82] })) },
                  { scaleX: squash.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.94, 1, 1.14] }) },
                ],
              }}
            >
              <Mascot mood={mood} size={mengSize} blink={blink} chewOpen={chew || antic} tapToMeow={false} look={look} yawn={yawn} />
            </Animated.View>
          </View>
        </View>

        {/* bottom bar: pantry/toys · held item · shop */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: space.md,
            paddingVertical: space.sm,
            backgroundColor: dark ? 'rgba(27,20,32,0.85)' : 'rgba(255,255,255,0.85)',
            borderTopWidth: 3,
            borderTopColor: colors.brand,
            gap: space.xs,
          }}
        >
          {leftBtn ? (
            <RoundBtn icon={leftBtn.icon} label={leftBtn.label} onPress={() => setSheet('items')} a11y={`Open ${leftBtn.label}`} />
          ) : (
            <View style={{ minWidth: 64 }} />
          )}

          <View style={{ flex: 1, alignItems: 'center' }}>
            {room === 'bedroom' ? (
              <RoundBtn icon={lightsOff ? 'bulb' : 'moon'} label={lightsOff ? 'Lights on' : 'Lights off'} onPress={toggleLights} size={76} a11y={lightsOff ? 'Turn the lights on' : 'Turn the lights off for a nap'} />
            ) : cur ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <RoundBtn icon="back" onPress={() => setIdx((i) => i - 1)} size={44} a11y="Previous item" />
                <View
                  {...itemResponder.panHandlers}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`${cur.name}${cur.kind === 'food' ? `, ${inventory[cur.id]} left` : ''}. Tap to give it to Meng, or drag it onto her`}
                  style={{ alignItems: 'center', minWidth: 96, opacity: drag ? 0.35 : 1 }}
                >
                  <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: colors.brandSoft, borderWidth: 3, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={cur.icon} size={46} color={colors.accent} />
                  </View>
                  <Txt v="small" bold center>
                    {cur.name}
                    {cur.kind === 'food' ? ` ×${inventory[cur.id]}` : ''}
                  </Txt>
                </View>
                <RoundBtn icon="next" onPress={() => setIdx((i) => i + 1)} size={44} a11y="Next item" />
              </View>
            ) : (
              <Txt v="small" center color={colors.textMuted}>{room === 'kitchen' ? 'Pantry is empty' : 'No toys yet'}</Txt>
            )}
          </View>

          <RoundBtn icon="sparkle" label="Shop" onPress={() => setSheet('shop')} a11y="Open the shop" />
        </View>

        {particles.map((p) => (
          <FloatUp key={p.id} p={p} onDone={removeParticle} />
        ))}
        {drag && cur ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: drag.x - root.current.x - 40, top: drag.y - root.current.y - 40 }}>
            <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: colors.brandSoft, borderWidth: 3, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={cur.icon} size={46} color={colors.accent} />
            </View>
          </View>
        ) : null}
      </View>

      <Sheet visible={sheet === 'shop'} title="Shop" onClose={() => setSheet(null)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="fish" size={28} color={colors.accent} />
          <Txt bold>{pet.treats} treats to spend</Txt>
        </View>
        <Txt v="small" color={colors.textMuted}>Earn treats by learning: +2 per new lesson, +1 per review, +5 per boss level.</Txt>
        <Kicker icon="bowl">Snacks (go to the kitchen pantry)</Kicker>
        {PET_ITEMS.filter((x) => x.kind === 'food').map((it) => (
          <BigButton
            key={it.id}
            label={it.name}
            sub={`${it.cost} ${it.cost === 1 ? 'treat' : 'treats'} · +${it.full} tummy · you have ${inventory[it.id] ?? 0}`}
            icon={it.icon}
            state={pet.treats < it.cost ? 'dim' : 'normal'}
            disabled={pet.treats < it.cost}
            onPress={() => buy(it)}
          />
        ))}
        <Kicker icon="box">Toys (live in the living room, yours forever)</Kicker>
        {PET_ITEMS.filter((x) => x.kind === 'toy').map((it) => {
          const owned = toys.includes(it.id);
          return (
            <BigButton
              key={it.id}
              label={owned ? `${it.name} ✓` : it.name}
              sub={owned ? 'Already in the toy box' : `${it.cost} treats · +${it.happy} happiness each play`}
              icon={it.icon}
              state={owned || pet.treats < it.cost ? 'dim' : 'normal'}
              disabled={owned || pet.treats < it.cost}
              onPress={() => buy(it)}
            />
          );
        })}
      </Sheet>

      <Sheet visible={sheet === 'items'} title={room === 'kitchen' ? 'Pantry' : 'Toy box'} onClose={() => setSheet(null)}>
        {items.length ? (
          items.map((it, i) => (
            <BigButton
              key={it.id}
              label={it.name}
              sub={it.kind === 'food' ? `${inventory[it.id]} left · +${it.full} tummy` : `+${it.happy} happiness`}
              icon={it.icon}
              state={cur?.id === it.id ? 'selected' : 'normal'}
              onPress={() => {
                setIdx(i);
                setSheet(null);
              }}
            />
          ))
        ) : (
          <>
            <Txt>{room === 'kitchen' ? 'The pantry is empty.' : 'No toys yet.'}</Txt>
            <BigButton label="Go to the shop" icon="sparkle" variant="primary" onPress={() => setSheet('shop')} />
          </>
        )}
      </Sheet>

      <Sheet visible={sheet === 'help'} title={`${MASCOT_NAME}'s home`} onClose={() => setSheet(null)}>
        <Card>
          <Txt>• <Txt bold>Pet:</Txt> rub {MASCOT_NAME} with your finger (or tap her). She purrs!</Txt>
          <Txt>• <Txt bold>Feed:</Txt> in the Kitchen, slide the snack at the bottom up onto her, or just tap it. Use ‹ › to pick another snack.</Txt>
          <Txt>• <Txt bold>Play:</Txt> in the Living room, toss her a toy the same way.</Txt>
          <Txt>• <Txt bold>Nap:</Txt> in the Bedroom, tap the lamp.</Txt>
          <Txt>• <Txt bold>Shop:</Txt> spend the treats you earn from lessons.</Txt>
          <Txt>• <Txt bold>Secrets:</Txt> rub really fast, or tap her a few times quickly…</Txt>
        </Card>
        <Card>
          <Kicker icon="bowl">Tummy: {fullnessWord(pet.fullness)} ({pet.fullness}/100)</Kicker>
          <ProgressBar value={pet.fullness / 100} height={14} label="Tummy" />
          <Kicker icon="heart">Happiness: {happinessWord(pet.happiness)} ({pet.happiness}/100)</Kicker>
          <ProgressBar value={pet.happiness / 100} height={14} label="Happiness" />
        </Card>
        <ListenButton text={`Rub ${MASCOT_NAME} to pet her. In the kitchen, slide a snack up onto her or tap it. In the living room, toss her a toy. In the bedroom, tap the lamp for a nap. Spend treats from lessons in the shop.`} />
      </Sheet>
    </SafeAreaView>
  );
}

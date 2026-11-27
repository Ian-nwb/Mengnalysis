import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, PanResponder, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { Icon, IconName } from '../components/Icon';
import { Mascot, Mood } from '../components/Mascot';
import { currentCat } from '../cats';
import { CatPicker } from './Cats';
import { BigButton, Card, Kicker, ListenButton, ProgressBar, Txt } from '../components/ui';
import { buzz } from '../haptics';
import { useReducedMotion } from '../motion';
import { Go } from '../nav';
import { fullnessWord, happinessWord, PET_ITEMS, PetItem } from '../pet';
import { playSfx } from '../sfx';
import { useApp } from '../state';
import { BRAND, palettes, space } from '../theme';

// Meng's home: one screen, three cozy rooms. A solid status band on top, the room in
// the middle, and the item you're holding right below Meng: drag it up onto her or tap it.

type Room = 'living' | 'kitchen' | 'bedroom';
const ROOMS: { id: Room; name: string }[] = [
  { id: 'living', name: 'Living room' },
  { id: 'kitchen', name: 'Kitchen' },
  { id: 'bedroom', name: 'Bedroom' },
];
type FxKind = 'float' | 'drop' | 'fly';
type Particle = { id: number; x: number; y: number; icon: IconName; color: string; kind: FxKind; size?: number; travel?: number };
type Rect4 = { x: number; y: number; w: number; h: number };
const PURR_LINES = ['Purrrr…', 'Right behind the ears, please.', 'You are my favorite human.', 'Mrrp! ♡', 'More scritches!', 'Ahh, the best spot.'];
const IDLE_ACTS = ['look', 'look', 'yawn', 'stretch', 'hop', 'peek', 'butterfly', 'wave', 'look', 'love'] as const;

// ---------- room art (drawn only inside the room area, never under the controls) ----------
function RoomArt({ room, w, h, dark, lightsOff }: { room: Room; w: number; h: number; dark: boolean; lightsOff: boolean }) {
  const floorY = h * 0.6;
  const wall = { living: dark ? '#3A2646' : '#F6E3FA', kitchen: dark ? '#3B2A35' : '#FFE9DC', bedroom: dark ? '#2B2447' : '#E6DDF8' }[room];
  const floor = { living: dark ? '#5A3F33' : '#D9B48F', kitchen: dark ? '#4A3C4E' : '#EADBEA', bedroom: dark ? '#3E3060' : '#CFC0EE' }[room];
  const trim = dark ? '#1B1420' : '#7A2E8C';
  const winW = Math.min(w * 0.26, 120);
  const winX = w - winW - w * 0.06;
  const winY = Math.max(70, h * 0.17); // below Meng's speech bubble
  const night = lightsOff || dark;
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Rect x={0} y={0} width={w} height={h} fill={wall} />
      {room === 'kitchen'
        ? [
            ...Array.from({ length: Math.ceil(w / 44) + 1 }, (_, i) => (
              <Line key={`v${i}`} x1={i * 44} y1={0} x2={i * 44} y2={floorY} stroke={trim} strokeOpacity={0.1} strokeWidth={2} />
            )),
            ...Array.from({ length: Math.ceil(floorY / 44) }, (_, i) => (
              <Line key={`h${i}`} x1={0} y1={i * 44} x2={w} y2={i * 44} stroke={trim} strokeOpacity={0.1} strokeWidth={2} />
            )),
          ]
        : null}
      {room === 'bedroom'
        ? [0.12, 0.28, 0.45, 0.6].map((fx, i) => (
            <Path key={i} d={`M${w * fx} ${h * (0.08 + (i % 2) * 0.1)} l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z`} fill={BRAND} opacity={0.4} />
          ))
        : null}
      {room !== 'kitchen' ? (
        <G>
          <Rect x={winX} y={winY} width={winW} height={winW * 0.95} rx={12} fill={night ? '#2B3A67' : '#BFE3FF'} stroke={trim} strokeWidth={4} />
          <Line x1={winX + winW / 2} y1={winY} x2={winX + winW / 2} y2={winY + winW * 0.95} stroke={trim} strokeWidth={3} />
          <Line x1={winX} y1={winY + winW * 0.47} x2={winX + winW} y2={winY + winW * 0.47} stroke={trim} strokeWidth={3} />
          <Circle cx={winX + winW * 0.73} cy={winY + winW * 0.24} r={winW * 0.1} fill={night ? '#FFF3C4' : '#FFD66B'} />
          {/* curtain rod + curtains */}
          <Line x1={winX - 16} y1={winY - 9} x2={winX + winW + 16} y2={winY - 9} stroke={trim} strokeWidth={4} strokeLinecap="round" />
          <Rect x={winX - 14} y={winY - 9} width={winW * 0.2} height={winW * 1.08} rx={8} fill={BRAND} opacity={0.85} />
          <Rect x={winX + winW + 14 - winW * 0.2} y={winY - 9} width={winW * 0.2} height={winW * 1.08} rx={8} fill={BRAND} opacity={0.85} />
        </G>
      ) : (
        <G>
          <Rect x={w * 0.06} y={Math.max(100, h * 0.3)} width={w * 0.34} height={8} rx={4} fill={trim} />
          {[0, 1, 2].map((i) => (
            <Rect key={i} x={w * 0.08 + i * (w * 0.11)} y={Math.max(100, h * 0.3) - 32} width={w * 0.075} height={32} rx={8} fill={[BRAND, '#F2A65A', '#8FE3A6'][i]} stroke={trim} strokeWidth={3} />
          ))}
        </G>
      )}
      {/* floor + baseboard */}
      <Rect x={0} y={floorY} width={w} height={h - floorY} fill={floor} />
      <Rect x={0} y={floorY - 4} width={w} height={8} fill={trim} opacity={0.3} />
      {room === 'living' ? (
        <G>
          <Ellipse cx={w / 2} cy={floorY + (h - floorY) * 0.62} rx={w * 0.38} ry={(h - floorY) * 0.2} fill={BRAND} opacity={0.5} />
          <Rect x={w * 0.05} y={floorY - h * 0.11} width={w * 0.08} height={h * 0.12} rx={6} fill="#C77B4A" stroke={trim} strokeWidth={3} />
          <Ellipse cx={w * 0.09} cy={floorY - h * 0.13} rx={w * 0.07} ry={h * 0.05} fill="#6FBF73" stroke={trim} strokeWidth={3} />
        </G>
      ) : null}
      {room === 'bedroom' ? <Ellipse cx={w / 2} cy={floorY + (h - floorY) * 0.6} rx={w * 0.34} ry={(h - floorY) * 0.24} fill="#7A2E8C" stroke={trim} strokeWidth={4} /> : null}
      {room === 'kitchen' ? (
        <G>
          <Ellipse cx={w * 0.84} cy={floorY + (h - floorY) * 0.55} rx={w * 0.09} ry={(h - floorY) * 0.12} fill={BRAND} stroke={trim} strokeWidth={4} />
          <Ellipse cx={w * 0.84} cy={floorY + (h - floorY) * 0.5} rx={w * 0.06} ry={(h - floorY) * 0.05} fill={trim} opacity={0.4} />
        </G>
      ) : null}
      {lightsOff ? <Rect x={0} y={0} width={w} height={h} fill="#0B0614" opacity={0.55} /> : null}
    </Svg>
  );
}

/** Little effects: hearts float up, toys drop and bounce, butterflies flutter past. */
function Fx({ p, onDone }: { p: Particle; onDone: (id: number) => void }) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  const dur = p.kind === 'fly' ? 2600 : p.kind === 'drop' ? 1300 : 1000;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: reduced ? Math.min(dur, 500) : dur, easing: p.kind === 'float' ? Easing.out(Easing.quad) : Easing.linear, useNativeDriver: true }).start(() => onDone(p.id));
  }, [v, p.id, p.kind, dur, onDone, reduced]);
  const s = p.size ?? 34;
  const style =
    p.kind === 'float'
      ? {
          opacity: v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
          transform: reduced ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) }, { scale: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 1.25, 1] }) }],
        }
      : p.kind === 'drop'
        ? {
            opacity: v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
            transform: reduced ? [] : [{ translateY: v.interpolate({ inputRange: [0, 0.35, 0.5, 0.62, 0.72, 1], outputRange: [-140, 0, -36, 0, -10, 0] }) }],
          }
        : {
            opacity: v.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, p.travel ?? 260] }) },
              { translateY: v.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -22, 0, -22, 0] }) },
            ],
          };
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: p.x - s / 2, top: p.y - s / 2 }, style]}>
      <Icon name={p.icon} size={s} color={p.color} filled />
    </Animated.View>
  );
}

/** Round icon button. `soft` = filled chip for the top band; `ring` = outlined, for the bottom bar. */
function RoundBtn({ icon, label, onPress, size = 64, a11y, variant = 'ring' }: { icon: IconName; label?: string; onPress: () => void; size?: number; a11y: string; variant?: 'ring' | 'soft' }) {
  const { colors } = useApp();
  const soft = variant === 'soft';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={{ alignItems: 'center', gap: 2, minWidth: size }}>
      {({ pressed }) => (
        <>
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: pressed ? colors.brand : soft ? colors.brandSoft : colors.surface,
              borderWidth: soft ? 0 : 3,
              borderColor: colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: soft ? 0 : 3,
              shadowColor: '#000',
              shadowOpacity: soft ? 0 : 0.22,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <Icon name={icon} size={Math.round(size * 0.5)} color={pressed ? colors.onBrand : colors.accent} />
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

/** A small labelled meter that can shrink with the screen (never pushes into its neighbors). */
function Meter({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  const { colors } = useApp();
  return (
    <View accessible accessibilityLabel={`${label}: ${value} out of 100`} style={{ flex: 1, minWidth: 0, flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={24} color={colors.accent} />
      <View style={{ flex: 1, minWidth: 16, height: 12, borderRadius: 6, backgroundColor: colors.surfaceHi, overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(4, value)}%`, height: '100%', borderRadius: 6, backgroundColor: value < 30 ? '#F2A65A' : colors.brand }} />
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
            <RoundBtn icon="x" onPress={onClose} size={50} a11y={`Close ${title}`} variant="soft" />
          </View>
          <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: 0, gap: space.sm }}>{children}</ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export function MengScreen({ go }: { go: Go }) {
  const { state, setState, colors } = useApp();
  const MASCOT_NAME = currentCat(state).name;
  const reduced = useReducedMotion();
  const dark = colors.bg === palettes.dark.bg;
  const pet = state.pet;
  const inventory = pet.inventory ?? {};
  const toys = pet.toys ?? [];
  const name = state.settings.name || 'Tori';

  const [room, setRoom] = useState<Room>('living');
  const [lightsOff, setLightsOff] = useState(false);
  const [dozing, setDozing] = useState(false);
  const [tempMood, setTempMood] = useState<Mood | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);
  const [chew, setChew] = useState(false);
  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sheet, setSheet] = useState<'shop' | 'items' | 'help' | 'cats' | null>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [yawn, setYawn] = useState(false);
  const [antic, setAntic] = useState(false); // mouth open, waiting for food
  const [play, setPlay] = useState<null | 'yarn' | 'mouse' | 'feather' | 'box'>(null);
  const [marks, setMarks] = useState(0);
  const [mouseLeft, setMouseLeft] = useState(false);

  const rootRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const mengRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const root = useRef({ x: 0, y: 0, w: 0 });
  const mengRect = useRef<Rect4>({ x: 0, y: 0, w: 0, h: 0 });
  const pid = useRef(0);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPurr = useRef(0);
  const lastAct = useRef(Date.now());
  const petRun = useRef({ n: 0, last: 0 });
  const recentPets = useRef<number[]>([]);
  const recentTaps = useRef<number[]>([]);
  const busy = useRef(false);

  const breathe = useRef(new Animated.Value(0)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(0)).current;
  const lean = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  // Toy play: Meng can walk left/right; toys live in room coordinates.
  const posX = useRef(new Animated.Value(0)).current;
  const posXv = useRef(0);
  const toyX = useRef(new Animated.Value(0)).current;
  const toyY = useRef(new Animated.Value(0)).current;
  const toyV = useRef({ x: 0, y: 0 });
  const boxShake = useRef(new Animated.Value(0)).current;
  const stageRef = useRef<React.ComponentRef<typeof View> | null>(null);
  const stageO = useRef({ x: 0, y: 0 });
  const lastSwat = useRef(0);
  const lastWalk = useRef(0);

  // What the bottom bar holds depends on the room.
  const items: PetItem[] =
    room === 'kitchen'
      ? PET_ITEMS.filter((x) => x.kind === 'food' && (inventory[x.id] ?? 0) > 0)
      : room === 'living'
        ? PET_ITEMS.filter((x) => x.kind === 'toy' && toys.includes(x.id))
        : [];
  const cur = items.length ? items[((idx % items.length) + items.length) % items.length] : null;

  const sleeping = room === 'bedroom' && lightsOff;
  const sleepy = sleeping || dozing;
  const baseMood: Mood = sleepy ? 'sleep' : pet.fullness < 30 ? 'hungry' : 'happy';
  const mood: Mood = antic ? 'eat' : tempMood ?? baseMood;
  const baseLine = sleeping
    ? 'Zzz… goodnight. Tap the lamp to turn the lights back on.'
    : dozing
      ? `${MASCOT_NAME} dozed off… rub her gently to wake her up.`
      : room === 'kitchen'
        ? pet.fullness < 30
          ? 'My tummy is rumbling! Something yummy? 🐟'
          : cur
            ? `Slide the ${cur.name.toLowerCase()} up to me, or just tap it.`
            : "The pantry is empty. Let's visit the shop!"
        : room === 'bedroom'
          ? 'Cozy time. Tap the lamp when I need a nap.'
          : cur
            ? 'Rub me for scritches, or toss me a toy!'
            : 'Rub me for scritches! Toys from the shop live here.';

  // Values the timers need without restarting.
  const playRef = useRef<string | null>(null);
  playRef.current = play;
  const life = useRef({ sleeping, dozing, fullness: pet.fullness });
  life.current = { sleeping, dozing, fullness: pet.fullness };

  // ---------- animation helpers ----------
  const feel = (m: Mood, ms = 2200) => {
    setTempMood(m);
    busy.current = true;
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => {
      setTempMood(null);
      busy.current = false;
    }, ms);
  };
  const doHop = (h = 1) => {
    if (reduced) return;
    hop.setValue(0);
    Animated.sequence([
      Animated.timing(hop, { toValue: h, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
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
  const doStretch = () => {
    if (reduced) return;
    Animated.sequence([
      Animated.timing(squash, { toValue: -1, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(squash, { toValue: 0, useNativeDriver: true, speed: 8, bounciness: 10 }),
    ]).start();
  };
  const doRumble = () => {
    if (reduced) return;
    Animated.sequence([1, -1, 0.8, -0.8, 0.5, -0.5, 0].map((to) => Animated.timing(shake, { toValue: to, duration: 55, useNativeDriver: true }))).start();
  };
  const doDance = () => {
    doHop();
    setTimeout(() => {
      doWiggle(0.7);
      doHop(0.8);
    }, 380);
    setTimeout(() => {
      doWiggle(0.5);
      doHop(1.1);
    }, 760);
  };
  const spawn = useCallback((x: number, y: number, icon: IconName, color: string, n = 1, kind: FxKind = 'float', size?: number) => {
    setParticles((ps) => [
      ...ps.slice(-16),
      ...Array.from({ length: n }, (_, i) => ({ id: ++pid.current, x: x + (i - (n - 1) / 2) * 28, y: y - (i % 2) * 10, icon, color, kind, size })),
    ]);
  }, []);
  const removeParticle = useCallback((id: number) => setParticles((ps) => ps.filter((p) => p.id !== id)), []);
  const measure = () => {
    rootRef.current?.measureInWindow((x, y, w) => (root.current = { x, y, w }));
    mengRef.current?.measureInWindow((x, y, w, h) => (mengRect.current = { x, y, w, h }));
  };
  const center = () => ({ x: mengRect.current.x - root.current.x + mengRect.current.w / 2 + posXv.current, y: mengRect.current.y - root.current.y + mengRect.current.h * 0.3 });
  const touched = () => {
    lastAct.current = Date.now();
  };
  const wake = () => {
    setDozing(false);
    setYawn(true);
    setTimeout(() => setYawn(false), 1100);
    doStretch();
    setLine("Oh! You're back! 😸");
  };

  const fns = useRef({ doHop, doWiggle, doStretch, doRumble, spawn, feel, measure });
  fns.current = { doHop, doWiggle, doStretch, doRumble, spawn, feel, measure };

  // Breathing (slower when sleepy) + blinking.
  useEffect(() => {
    if (reduced) return;
    const ms = sleepy ? 2600 : 1600;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    const b = setInterval(() => {
      if (life.current.sleeping || life.current.dozing) return;
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3600);
    return () => {
      loop.stop();
      clearInterval(b);
    };
  }, [reduced, breathe, sleepy]);

  useEffect(
    () => () => {
      if (moodTimer.current) clearTimeout(moodTimer.current);
    },
    [],
  );

  // Walk in when the room changes; say hi when you arrive.
  useEffect(() => {
    setLine(null);
    if (reduced) return;
    enter.setValue(1);
    Animated.spring(enter, { toValue: 0, useNativeDriver: true, speed: 6, bounciness: 6 }).start();
  }, [room, reduced, enter]);
  useEffect(() => {
    const t = setTimeout(() => {
      fns.current.doStretch();
      fns.current.feel('wave', 1900);
      setLine(`Hi ${name}! 👋`);
    }, 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pou-style idle life: every few seconds Meng does something on her own, and dozes off if left alone.
  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => {
      if (busy.current || playRef.current) return;
      const L = life.current;
      if (L.sleeping) {
        Animated.sequence([
          Animated.timing(squash, { toValue: 0.35, duration: 900, useNativeDriver: true }),
          Animated.timing(squash, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]).start();
        return;
      }
      if (L.dozing) return;
      if (Date.now() - lastAct.current > 40000) {
        setDozing(true);
        setLine(null);
        return;
      }
      if (L.fullness < 30 && Math.random() < 0.45) {
        fns.current.doRumble();
        setLook({ x: 0, y: 1 });
        setTimeout(() => setLook({ x: 0, y: 0 }), 1100);
        setLine('*grrrumble* …was that my tummy? 🙀');
        return;
      }
      const a = IDLE_ACTS[Math.floor(Math.random() * IDLE_ACTS.length)];
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
      } else if (a === 'stretch') fns.current.doStretch();
      else if (a === 'hop') fns.current.doHop(0.7);
      else if (a === 'wave') fns.current.feel('wave', 1600);
      else if (a === 'love') fns.current.feel('love', 1400);
      else if (a === 'butterfly') {
        // A butterfly flutters past; Meng's eyes follow it, then she pounces.
        const m = mengRect.current;
        if (!m.w) return;
        const startX = 24;
        const travel = Math.max(120, root.current.w - 48);
        const y = m.y - root.current.y + m.h * 0.15;
        fns.current.spawn(startX, y, 'butterfly', '#F2A65A', 1, 'fly', 30);
        busy.current = true;
        let k = 0;
        const follow = setInterval(() => {
          k += 1;
          const px = startX + (travel * k) / 26;
          const cx = m.x - root.current.x + m.w / 2;
          setLook({ x: Math.max(-1, Math.min(1, (px - cx) / (m.w * 0.5))), y: -0.8 });
          if (k >= 26) {
            clearInterval(follow);
            setLook({ x: 0, y: 0 });
            fns.current.doHop(1.2);
            fns.current.doWiggle(0.5);
            setLine('Almost got it! 🦋');
            busy.current = false;
          }
        }, 100);
        setTimeout(() => clearInterval(follow), 4000);
      }
    }, 5200);
    return () => clearInterval(t);
  }, [reduced, squash]);

  // ---------- interactions ----------
  const petTick = (x: number, y: number) => {
    touched();
    if (sleeping) {
      spawn(x, y, 'heart', '#E0457B');
      return;
    }
    if (dozing) {
      wake();
      return;
    }
    setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + 2) } }));
    const now = Date.now();
    recentPets.current = [...recentPets.current.filter((t) => now - t < 1500), now];
    if (recentPets.current.length >= 9) {
      recentPets.current = [];
      feel('dizzy', 2200);
      doWiggle(0.6);
      setLine("Wheee! I'm all dizzy! 😵‍💫");
      spawn(x, y, 'star', BRAND, 3);
      return;
    }
    // A long, gentle petting session ends in a burst of love.
    petRun.current = now - petRun.current.last < 2500 ? { n: petRun.current.n + 1, last: now } : { n: 1, last: now };
    if (petRun.current.n >= 12) {
      petRun.current = { n: 0, last: now };
      feel('love', 2600);
      doHop();
      playSfx('meow');
      const c = center();
      spawn(c.x, c.y, 'heart', '#E0457B', 5);
      setLine('I love you this much! 💕');
      return;
    }
    feel('purr');
    buzz('light');
    if (now - lastPurr.current > 1600) {
      playSfx('purr');
      lastPurr.current = now;
      setLine(PURR_LINES[Math.floor(Math.random() * PURR_LINES.length)]);
    }
    spawn(x, y, 'heart', '#E0457B');
  };

  const give = (it: PetItem) => {
    touched();
    const c = center();
    if (sleeping) return;
    if (dozing) setDozing(false);
    if (it.kind === 'food') {
      if ((inventory[it.id] ?? 0) <= 0) return;
      if (pet.fullness >= 100) {
        feel('happy');
        setLine("I'm so full! Maybe later. 😺");
        return;
      }
      const after = pet.fullness + it.full;
      setState((s) => {
        const inv = { ...(s.pet.inventory ?? {}) };
        inv[it.id] = Math.max(0, (inv[it.id] ?? 0) - 1);
        return { ...s, pet: { ...s.pet, inventory: inv, fullness: Math.min(100, s.pet.fullness + it.full), happiness: Math.min(100, s.pet.happiness + it.happy), fedTotal: s.pet.fedTotal + 1 } };
      });
      playSfx('chomp');
      buzz('success');
      setTempMood('eat');
      busy.current = true;
      if (moodTimer.current) clearTimeout(moodTimer.current);
      spawn(c.x, c.y + 40, it.icon, colors.accent);
      let n = 0;
      const t = setInterval(() => {
        setChew((v) => !v);
        if (n % 3 === 1) spawn(c.x + (n % 2 ? 26 : -26), c.y + 70, 'sparkle', '#F2A65A', 1, 'drop', 16);
        if (++n >= 8) {
          clearInterval(t);
          setChew(false);
          if ((after >= 90 || it.cost >= 5) && Math.random() < 0.5) {
            feel('love', 2400);
            doDance();
            spawn(c.x, c.y - 10, 'heart', '#E0457B', 3);
          } else {
            feel('cheer', 2000);
            doHop();
          }
          playSfx('meow');
        }
      }, 160);
    } else {
      setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + it.happy) } }));
      startPlay(it.id as 'yarn' | 'mouse' | 'feather' | 'box');
      return;
    }
    setLine(it.line);
  };

  // ---------- toy play ----------
  const mengSz = Math.max(140, Math.min(stage.w * 0.66, stage.h * 0.66, 300));
  const floorTop = stage.h * 0.62;
  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const measureStage = () => stageRef.current?.measureInWindow((x, y) => (stageO.current = { x, y }));
  const moveMeng = (x: number, speed = 6) => {
    const range = Math.max(0, stage.w / 2 - mengSz * 0.42);
    const t = clamp(x, -range, range);
    if (Math.abs(t - posXv.current) > 4) setLook({ x: t > posXv.current ? 1 : -1, y: 0.2 });
    posXv.current = t;
    Animated.spring(posX, { toValue: t, useNativeDriver: true, speed, bounciness: 4 }).start();
  };
  const head = () => ({ x: stage.w / 2 + posXv.current, y: stage.h * 0.96 - mengSz * 0.55 });
  const toyTo = (x: number, y: number, speed = 5) => {
    toyV.current = { x, y };
    Animated.parallel([
      Animated.spring(toyX, { toValue: x, useNativeDriver: true, speed, bounciness: 8 }),
      Animated.spring(toyY, { toValue: y, useNativeDriver: true, speed, bounciness: 8 }),
    ]).start();
  };
  const toySet = (x: number, y: number) => {
    toyV.current = { x, y };
    toyX.setValue(x);
    toyY.setValue(y);
  };
  const reward = (n = 2) => setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + n) } }));
  const CATCH_LINES = ['Pounce! 🐾', 'Got it!', 'Again, again!', 'Did you see that jump?', 'Too fast for you? 😼'];
  const caught = (x: number, y: number) => {
    feel('cheer', 1200);
    doHop(1.3);
    doWiggle(0.5);
    playSfx('boing');
    buzz('success');
    reward(2);
    spawn(x, y, 'star', BRAND, 2);
    setLine(CATCH_LINES[Math.floor(Math.random() * CATCH_LINES.length)]);
  };
  const scratchBox = () => {
    touched();
    feel('scratch', 3000);
    setLook({ x: 1, y: 0.4 });
    reward(3);
    [0, 950, 1900].forEach((ms) => setTimeout(() => playSfx('scratch'), ms));
    [500, 1200, 1900, 2600].forEach((ms) => setTimeout(() => setMarks((m) => Math.min(9, m + 1)), ms));
    if (!reduced)
      Animated.sequence(
        Array.from({ length: 12 }, (_, i) => Animated.timing(boxShake, { toValue: i === 11 ? 0 : i % 2 ? -1 : 1, duration: 240, useNativeDriver: true })),
      ).start();
    setTimeout(() => {
      setLook({ x: 0, y: 0 });
      setLine(['Scritch scritch… perfect box.', 'Best. Box. Ever. 📦', 'My claws feel amazing now!'][Math.floor(Math.random() * 3)]);
    }, 3000);
  };
  // Yarn: after a throw, Meng runs over and bats it somewhere else.
  const chaseYarn = () => {
    const target = toyV.current;
    setTimeout(() => moveMeng(target.x - stage.w / 2, 5), 250);
    setTimeout(() => {
      if (playRef.current !== 'yarn') return;
      const near = Math.abs(stage.w / 2 + posXv.current - toyV.current.x) < mengSz * 0.55;
      if (near) {
        caught(toyV.current.x, toyV.current.y - 30);
        const away = toyV.current.x > stage.w / 2 ? stage.w * (0.1 + Math.random() * 0.25) : stage.w * (0.65 + Math.random() * 0.25);
        setTimeout(() => toyTo(away, clamp(floorTop + 40 + Math.random() * (stage.h - floorTop - 80), floorTop + 30, stage.h - 30), 4), 250);
      } else setLine('Too far! Throw it closer to me 🧶');
    }, 1150);
  };
  function startPlay(id: 'yarn' | 'mouse' | 'feather' | 'box') {
    touched();
    setPlay(id);
    setMarks(0);
    setTempMood(null);
    busy.current = false;
    if (id === 'yarn') {
      toySet(stage.w / 2 + mengSz * 0.55, stage.h * 0.86);
      setLine('Fling the yarn ball with your finger! I\'ll chase it 🧶');
    } else if (id === 'feather') {
      toySet(stage.w * 0.78, stage.h * 0.3);
      setLine("Wave the feather around… I'm watching it 👀");
    } else if (id === 'mouse') {
      toySet(stage.w * 0.18, stage.h * 0.9);
      setLine('A mouse!! Tap it to make it run 🐭');
    } else {
      moveMeng(-mengSz * 0.2);
      setTimeout(scratchBox, 450);
      setLine('A box!! Scritch scritch scritch 📦');
    }
  }
  const endPlay = () => {
    setPlay(null);
    moveMeng(0);
    setTimeout(() => setLook({ x: 0, y: 0 }), 600);
    setLine('That was fun! Thank you 💕');
  };

  // The mouse scurries around on its own; Meng chases it.
  useEffect(() => {
    if (play !== 'mouse' || !stage.w) return;
    const t = setInterval(() => {
      const from = toyV.current.x;
      const to = clamp(from + (Math.random() < 0.5 ? -1 : 1) * stage.w * (0.25 + Math.random() * 0.35), 30, stage.w - 30);
      setMouseLeft(to < from);
      toyV.current = { x: to, y: toyV.current.y };
      Animated.timing(toyX, { toValue: to, duration: 650, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();
      playSfx('squeak');
      setTimeout(() => fns2.current.moveMeng(to - stage.w / 2, 4), 250);
      setTimeout(() => {
        if (playRef.current !== 'mouse') return;
        if (Math.abs(stage.w / 2 + posXv.current - toyV.current.x) < mengSz * 0.4) {
          fns2.current.caught(toyV.current.x, toyV.current.y - 30);
          setLine('Caught it! …and it slipped away again 🐭');
        }
      }, 1100);
    }, 1700);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, stage.w, stage.h]);
  const fns2 = useRef({ moveMeng, caught });
  fns2.current = { moveMeng, caught };

  // Yarn ball: drag and fling it.
  const toyApi = useRef({ chaseYarn, toyTo, toySet, measureStage, head, caught, moveMeng, stage, floorTop, mengSz });
  toyApi.current = { chaseYarn, toyTo, toySet, measureStage, head, caught, moveMeng, stage, floorTop, mengSz };
  const yarnGrab = useRef({ moved: 0, sx: 0, sy: 0 });
  const yarnResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        toyApi.current.measureStage();
        toyX.stopAnimation();
        toyY.stopAnimation();
        yarnGrab.current = { moved: 0, sx: e.nativeEvent.pageX, sy: e.nativeEvent.pageY };
      },
      onPanResponderMove: (e) => {
        const { pageX, pageY } = e.nativeEvent;
        yarnGrab.current.moved = Math.max(yarnGrab.current.moved, Math.hypot(pageX - yarnGrab.current.sx, pageY - yarnGrab.current.sy));
        const A = toyApi.current;
        toySet(Math.max(30, Math.min(A.stage.w - 30, pageX - stageO.current.x)), Math.max(30, Math.min(A.stage.h - 30, pageY - stageO.current.y)));
      },
      onPanResponderRelease: (_e, g) => {
        const A = toyApi.current;
        let vx = g.vx;
        let vy = g.vy;
        if (yarnGrab.current.moved < 10) {
          vx = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random());
          vy = -0.3;
        }
        const tx = Math.max(30, Math.min(A.stage.w - 30, toyV.current.x + vx * 320));
        const ty = Math.max(A.floorTop + 30, Math.min(A.stage.h - 30, toyV.current.y + vy * 200));
        A.toyTo(tx, ty, 4);
        playSfx('tap');
        A.chaseYarn();
      },
    }),
  ).current;

  // Feather wand: drag it around; Meng swats when it's near her head.
  const featherResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => toyApi.current.measureStage(),
      onPanResponderMove: (e) => {
        const A = toyApi.current;
        const x = Math.max(28, Math.min(A.stage.w - 28, e.nativeEvent.pageX - stageO.current.x));
        const y = Math.max(28, Math.min(A.stage.h - 28, e.nativeEvent.pageY - stageO.current.y));
        toySet(x, y);
        const h = A.head();
        setLook({ x: Math.max(-1, Math.min(1, (x - h.x) / (A.mengSz * 0.5))), y: Math.max(-1, Math.min(1, (y - h.y) / (A.mengSz * 0.5))) });
        const now = Date.now();
        if (now - lastWalk.current > 500) {
          lastWalk.current = now;
          A.moveMeng((x - A.stage.w / 2) * 0.6, 4);
        }
        if (Math.hypot(x - h.x, y - h.y) < A.mengSz * 0.4 && now - lastSwat.current > 1000) {
          lastSwat.current = now;
          A.caught(x, y);
        }
      },
    }),
  ).current;

  const latest = useRef({ petTick, give, measure, cur, hopTap: () => {}, track: (_x: number, _y: number) => {}, endTrack: () => {} });
  latest.current = {
    petTick,
    give,
    measure,
    cur,
    hopTap: () => {
      if (sleeping || dozing) return;
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
      touched();
      const m = mengRect.current;
      if (!m.w) return;
      const cx = m.x + m.w / 2;
      const cy = m.y + m.h * 0.4;
      const lx = Math.max(-1, Math.min(1, (px - cx) / (m.w * 0.6)));
      setLook({ x: lx, y: (py - cy) / (m.h * 0.6) });
      lean.setValue(lx);
      const near = Math.hypot(px - cx, py - cy) < m.w * 0.9;
      setAntic(!!cur && cur.kind === 'food' && near && !sleeping);
      if (dozing) setDozing(false);
    },
    endTrack: () => {
      setLook({ x: 0, y: 0 });
      setAntic(false);
      Animated.spring(lean, { toValue: 0, useNativeDriver: true, speed: 10, bounciness: 8 }).start();
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
        else if (pageX >= m.x + posXv.current && pageX <= m.x + m.w + posXv.current && pageY >= m.y && pageY <= m.y + m.h) latest.current.give(it);
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
    touched();
    setRoom(ROOMS[(roomI + d + ROOMS.length) % ROOMS.length].id);
    setIdx(0);
    if (play) {
      setPlay(null);
      moveMeng(0);
    }
    setDozing(false);
    if (room === 'bedroom') setLightsOff(false);
  };
  const toggleLights = () => {
    touched();
    const off = !lightsOff;
    setLightsOff(off);
    setDozing(false);
    playSfx(off ? 'purr' : 'meow');
    if (off) setState((s) => ({ ...s, pet: { ...s.pet, happiness: Math.min(100, s.pet.happiness + 5) } }));
    else {
      setYawn(true);
      setTimeout(() => setYawn(false), 1100);
      doStretch();
    }
    setLine(null);
  };

  const mengSize = Math.max(140, Math.min(stage.w * 0.66, stage.h * 0.66, 300));
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, sleepy ? 1.04 : 1.025] });
  const leftBtn = room === 'kitchen' ? { icon: 'bowl' as IconName, label: 'Pantry' } : room === 'living' ? { icon: 'box' as IconName, label: 'Toys' } : null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
      <View ref={rootRef} style={{ flex: 1 }} onLayout={() => measure()}>
        {/* status band: treats · meters · help, then the room switcher */}
        <View style={{ backgroundColor: colors.surface, borderBottomWidth: 2, borderBottomColor: colors.border, paddingHorizontal: space.md, paddingTop: space.xs, paddingBottom: space.sm, gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <View
              accessible
              accessibilityLabel={`${pet.treats} treats`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.brandSoft, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 }}
            >
              <Icon name="fish" size={24} color={colors.accent} />
              <Txt bold>{pet.treats}</Txt>
            </View>
            <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Meter icon="bowl" value={pet.fullness} label="Tummy" />
              <Meter icon="heart" value={pet.happiness} label="Happiness" />
            </View>
            <RoundBtn icon="paw" onPress={() => setSheet('cats')} size={44} a11y="Change cat" variant="soft" />
            <RoundBtn icon="help" onPress={() => setSheet('help')} size={44} a11y="How Meng's home works" variant="soft" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <RoundBtn icon="back" onPress={() => switchRoom(-1)} size={44} a11y={`Go to ${ROOMS[(roomI + 2) % 3].name}`} variant="soft" />
            <View style={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
              <Txt v="h2" center>{ROOMS[roomI].name}</Txt>
            </View>
            <RoundBtn icon="next" onPress={() => switchRoom(1)} size={44} a11y={`Go to ${ROOMS[(roomI + 1) % 3].name}`} variant="soft" />
          </View>
        </View>

        {/* the room */}
        <View
          ref={stageRef}
          style={{ flex: 1, overflow: 'hidden' }}
          onLayout={(e) => {
            setStage({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
            measureStage();
          }}
        >
          {stage.w > 0 ? <RoomArt room={room} w={stage.w} h={stage.h} dark={dark} lightsOff={lightsOff} /> : null}
          {play === 'box' ? (
            <Pressable
              onPress={scratchBox}
              accessibilityRole="button"
              accessibilityLabel="Cardboard box. Tap for more scratching"
              style={{ position: 'absolute', left: stage.w / 2 + mengSz * 0.12, bottom: stage.h * 0.04, width: mengSz * 0.55, height: mengSz * 0.48 }}
            >
              <Animated.View style={{ flex: 1, transformOrigin: '50% 100%', transform: [{ rotate: boxShake.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] }) }] }}>
                <Svg width="100%" height="100%" viewBox="0 0 100 90">
                  <Path d="M6 30 L50 18 L94 30 L94 84 L50 90 L6 84 Z" fill="#C98B55" stroke="#1B1420" strokeWidth={4} strokeLinejoin="round" />
                  <Path d="M6 30 L50 42 L94 30 M50 42 L50 90" stroke="#1B1420" strokeWidth={3} fill="none" />
                  <Path d="M6 30 L-4 16 L40 6 L50 18 Z M94 30 L104 16 L60 6 L50 18 Z" fill="#DDA36D" stroke="#1B1420" strokeWidth={3} strokeLinejoin="round" />
                  {Array.from({ length: marks }, (_, i) => (
                    <Line key={i} x1={14 + (i % 3) * 9} y1={50 + Math.floor(i / 3) * 10} x2={22 + (i % 3) * 9} y2={62 + Math.floor(i / 3) * 10} stroke="#1B1420" strokeWidth={2.5} strokeLinecap="round" />
                  ))}
                </Svg>
              </Animated.View>
            </Pressable>
          ) : null}
          <View pointerEvents="box-none" style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: space.sm, paddingBottom: stage.h * 0.04 }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 18,
                borderWidth: 2,
                borderColor: colors.brand,
                paddingHorizontal: 14,
                paddingVertical: 8,
                marginHorizontal: space.md,
                maxWidth: 440,
              }}
            >
              <Txt center>{line ?? baseLine}</Txt>
            </View>
            <View ref={mengRef} {...rubResponder.panHandlers} accessible accessibilityRole="button" accessibilityLabel={`${MASCOT_NAME}. Rub or tap to pet her.`}>
              <Animated.View
                style={{
                  transform: [
                    { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -24] }) },
                    { translateX: Animated.add(Animated.add(enter.interpolate({ inputRange: [0, 1], outputRange: [0, 90] }), shake.interpolate({ inputRange: [-1, 1], outputRange: [-5, 5] })), posX) },
                    { rotate: lean.interpolate({ inputRange: [-1, 1], outputRange: ['-9deg', '9deg'] }) },
                    { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] }) },
                    { scaleY: Animated.multiply(scale, squash.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.1, 1, 0.82] })) },
                    { scaleX: squash.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.94, 1, 1.14] }) },
                  ],
                }}
              >
                <Mascot mood={mood} size={mengSize} blink={blink} chewOpen={chew || antic} tapToMeow={false} look={look} yawn={yawn} alive />
              </Animated.View>
            </View>
          </View>
          {play === 'yarn' || play === 'feather' || play === 'mouse' ? (
            <Animated.View
              {...(play === 'yarn' ? yarnResponder.panHandlers : play === 'feather' ? featherResponder.panHandlers : {})}
              accessible
              accessibilityRole="button"
              accessibilityLabel={play === 'yarn' ? 'Yarn ball. Drag and fling it, or tap to toss it' : play === 'feather' ? 'Feather wand. Drag it around Meng' : 'Catnip mouse. Tap to make it run'}
              onTouchEnd={
                play === 'mouse'
                  ? () => {
                      playSfx('squeak');
                      const to = toyV.current.x < stage.w / 2 ? stage.w - 40 : 40;
                      setMouseLeft(to < toyV.current.x);
                      toyV.current = { x: to, y: toyV.current.y };
                      Animated.timing(toyX, { toValue: to, duration: 500, useNativeDriver: true }).start();
                      moveMeng(to - stage.w / 2, 5);
                    }
                  : undefined
              }
              style={{
                position: 'absolute',
                left: -32,
                top: -32,
                width: 64,
                height: 64,
                borderRadius: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: play === 'yarn' ? '#F5B3C8' : play === 'feather' ? colors.brandSoft : 'transparent',
                borderWidth: play === 'mouse' ? 0 : 3,
                borderColor: '#1B1420',
                transform: [{ translateX: toyX }, { translateY: toyY }, { scaleX: play === 'mouse' && mouseLeft ? -1 : 1 }],
              }}
            >
              <Icon name={play === 'yarn' ? 'yarn' : play === 'feather' ? 'feather' : 'mouse'} size={play === 'mouse' ? 52 : 40} color={play === 'mouse' ? colors.text : '#1B1420'} />
            </Animated.View>
          ) : null}
        </View>

        {/* bottom bar: pantry/toys · held item · shop */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: space.md,
            paddingVertical: space.sm,
            backgroundColor: colors.surface,
            borderTopWidth: 2,
            borderTopColor: colors.border,
            gap: space.xs,
          }}
        >
          {leftBtn ? (
            <RoundBtn icon={leftBtn.icon} label={leftBtn.label} onPress={() => setSheet('items')} a11y={`Open ${leftBtn.label}`} size={58} />
          ) : (
            <View style={{ minWidth: 58 }} />
          )}

          <View style={{ flex: 1, alignItems: 'center' }}>
            {play ? (
              <RoundBtn icon="box" label="Put the toy away" onPress={endPlay} size={62} a11y="Put the toy away" />
            ) : room === 'bedroom' ? (
              <RoundBtn icon={lightsOff ? 'bulb' : 'moon'} label={lightsOff ? 'Lights on' : 'Lights off'} onPress={toggleLights} size={70} a11y={lightsOff ? 'Turn the lights on' : 'Turn the lights off for a nap'} />
            ) : cur ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <RoundBtn icon="back" onPress={() => setIdx((i) => i - 1)} size={42} a11y="Previous item" variant="soft" />
                <View
                  {...itemResponder.panHandlers}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={`${cur.name}${cur.kind === 'food' ? `, ${inventory[cur.id]} left` : ''}. Tap to give it to Meng, or drag it onto her`}
                  style={{ alignItems: 'center', minWidth: 92, opacity: drag ? 0.35 : 1 }}
                >
                  <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: colors.brandSoft, borderWidth: 3, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={cur.icon} size={44} color={colors.accent} />
                  </View>
                  <Txt v="small" bold center>
                    {cur.name}
                    {cur.kind === 'food' ? ` ×${inventory[cur.id]}` : ''}
                  </Txt>
                </View>
                <RoundBtn icon="next" onPress={() => setIdx((i) => i + 1)} size={42} a11y="Next item" variant="soft" />
              </View>
            ) : (
              <Txt v="small" center color={colors.textMuted}>{room === 'kitchen' ? 'Pantry is empty' : 'No toys yet'}</Txt>
            )}
          </View>

          <RoundBtn icon="sparkle" label="Shop" onPress={() => setSheet('shop')} a11y="Open the shop" size={58} />
        </View>

        {particles.map((p) => (
          <Fx key={p.id} p={p} onDone={removeParticle} />
        ))}
        {drag && cur ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: drag.x - root.current.x - 38, top: drag.y - root.current.y - 38 }}>
            <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: colors.brandSoft, borderWidth: 3, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={cur.icon} size={44} color={colors.accent} />
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
            sub={`${it.cost} ${it.cost === 1 ? 'treat' : 'treats'}, +${it.full} tummy. You have ${inventory[it.id] ?? 0}`}
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
              sub={owned ? 'Already in the toy box' : `${it.cost} treats, +${it.happy} happiness each play`}
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
              sub={it.kind === 'food' ? `${inventory[it.id]} left, +${it.full} tummy` : `+${it.happy} happiness`}
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

      <Sheet visible={sheet === 'cats'} title="Change cat" onClose={() => setSheet(null)}>
        <CatPicker onChosen={() => setSheet(null)} />
      </Sheet>
      <Sheet visible={sheet === 'help'} title={`${MASCOT_NAME}'s home`} onClose={() => setSheet(null)}>
        <BigButton label="Change cat" sub="Unlock new cats as you learn" icon="paw" onPress={() => setSheet('cats')} />
        <Card>
          <Txt>• <Txt bold>Change cat:</Txt> tap the paw button at the top to pick another cat you've unlocked.</Txt>
          <Txt>• <Txt bold>Pet:</Txt> rub {MASCOT_NAME} with your finger (or tap her). She purrs and kneads!</Txt>
          <Txt>• <Txt bold>Feed:</Txt> in the Kitchen, slide the snack at the bottom up onto her, or just tap it. Use ‹ › to pick another snack.</Txt>
          <Txt>• <Txt bold>Play:</Txt> in the Living room, give her a toy, then play! Fling the yarn ball, wave the feather near her, tap the mouse to make it run, or watch her scratch the box.</Txt>
          <Txt>• <Txt bold>Nap:</Txt> in the Bedroom, tap the lamp.</Txt>
          <Txt>• <Txt bold>Shop:</Txt> spend the treats you earn from lessons.</Txt>
          <Txt>• <Txt bold>Her own life:</Txt> she stretches, yawns, chases butterflies, and dozes off if you leave her alone for a while.</Txt>
          <Txt>• <Txt bold>Secrets:</Txt> rub really fast, pet her for a long time, or tap her a few times quickly…</Txt>
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

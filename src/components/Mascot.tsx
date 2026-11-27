import React, { createContext, useContext, useEffect, useId, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Polygon, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { popStyle, useAppear, useReducedMotion } from '../motion';
import { playSfx } from '../sfx';
import { CatId, catById, CatLook, CATS, currentCat } from '../cats';
import { useApp } from '../state';
import { BRAND, space } from '../theme';

// Meng: Tori's calico cat guide, drawn after the real Meng (white blaze,
// black forehead spot, orange cheeks, golden eyes, dark ear and tail). Bold shapes + thick outline so she reads
// clearly at any zoom level. With `alive`, her tail, ears, paws and little extras move on their own.
export const MASCOT_NAME = 'Meng';

export type Mood = 'happy' | 'wave' | 'think' | 'cheer' | 'sleep' | 'encourage' | 'purr' | 'eat' | 'love' | 'hungry' | 'dizzy' | 'scratch';

const PLUM = '#1B1420';
const WHITE = '#FFFDF9';
const ORANGE = '#F6AE68';
const BLACK = '#2E2733';
const PINK = '#F5A9C0';
const GOLD = '#D9B44A';

type Face = { mood: Mood; blink: boolean; chewOpen: boolean; look: { x: number; y: number }; yawn: boolean; clip: string };

const heart = (cx: number, cy: number, k = 1) =>
  `M${cx} ${cy + 7 * k} c-7 -5 -11 -9 -11 -14 c0 -5 6 -8 11 -3 c5 -5 11 -2 11 3 c0 5 -4 9 -11 14 z`;

// ---------- drawing pieces (shared by the still and the animated cat) ----------
// Colors and markings come from the chosen cat (see src/cats.ts).
const LookCtx = createContext<CatLook>(CATS[0].look);
const useLook = () => useContext(LookCtx);

// Chibi style: a big round mochi head, big shiny eyes, a little "w" smile, blush, toe-bean paws.
const HEAD = 'M34 108 C34 68 62 50 100 50 C138 50 166 68 166 108 C166 142 138 158 100 158 C62 158 34 142 34 108Z';
const EYE_DARK = '#2A1F2E';
const MOUTH_PINK = '#B4466A';

/** Soft shading: fur color in the middle, a touch darker at the edges. */
function Shade({ id }: { id: string }) {
  const L = useLook();
  return (
    <Defs>
      <RadialGradient id={id} cx="45%" cy="38%" r="70%">
        <Stop offset="0.6" stopColor={L.fur} />
        <Stop offset="1" stopColor={L.shade} />
      </RadialGradient>
    </Defs>
  );
}
const useGid = (p: string) => p + useId().replace(/[^a-zA-Z0-9]/g, '');

const Tail = () => {
  const L = useLook();
  const d = 'M140 186 Q182 184 176 150 Q172 136 160 142';
  return (
    <>
      <Path d={d} fill="none" stroke={L.line} strokeWidth={15} strokeLinecap="round" />
      <Path d={d} fill="none" stroke={L.tail} strokeWidth={8} strokeLinecap="round" />
    </>
  );
};
const Body = () => {
  const L = useLook();
  const g = useGid('b');
  return (
    <>
      <Shade id={g} />
      <Ellipse cx={100} cy={172} rx={50} ry={24} fill={`url(#${g})`} stroke={L.line} strokeWidth={4} />
      {L.patches === 'calico' ? <Path d="M118 152 q28 2 30 20 q-14 10 -30 4 z" fill={ORANGE} /> : null}
      {L.patches === 'tuxedo' || L.patches === 'orange' ? <Ellipse cx={100} cy={170} rx={24} ry={16} fill={WHITE} /> : null}
      {L.patches === 'orange' ? <Path d="M58 160 q-8 10 2 20 q12 0 18 -10 q-6 -10 -20 -10 z" fill={WHITE} /> : null}
    </>
  );
};
const EarLeft = () => {
  const L = useLook();
  return (
    <>
      <Path d="M46 78 Q40 30 58 24 Q74 28 94 54Z" fill={L.earL} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M56 66 Q54 42 62 38 Q72 44 82 56Z" fill={L.innerEar} />
    </>
  );
};
const EarRight = () => {
  const L = useLook();
  return (
    <>
      <Path d="M154 78 Q160 30 142 24 Q126 28 106 54Z" fill={L.earR} stroke={L.line} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M144 66 Q146 42 138 38 Q128 44 118 56Z" fill={L.innerEar} />
    </>
  );
};

function Markings() {
  const L = useLook();
  if (L.patches === 'calico')
    return (
      <>
        <Path d="M30 60 Q70 46 92 62 Q88 100 80 160 L20 160Z" fill={ORANGE} />
        <Path d="M170 60 Q130 46 108 62 Q112 100 120 160 L180 160Z" fill={ORANGE} />
        <Path d="M86 50 Q100 44 114 50 Q108 64 100 72 Q92 64 86 50Z" fill={BLACK} />
      </>
    );
  if (L.patches === 'tuxedo') return <Path d="M100 84 Q122 120 136 160 L64 160 Q78 120 100 84Z" fill={WHITE} />;
  if (L.patches === 'orange')
    return (
      <>
        <Ellipse cx={100} cy={138} rx={34} ry={22} fill={WHITE} />
        <Path d="M90 54 q2 9 0 16 M100 52 v19 M110 54 q-2 9 0 16" stroke="#DE8B45" strokeWidth={5} fill="none" strokeLinecap="round" />
      </>
    );
  return null;
}

function Eye({ x, y, lx, ly }: { x: number; y: number; lx: number; ly: number }) {
  const L = useLook();
  return (
    <>
      <Ellipse cx={x} cy={y} rx={15} ry={17} fill={EYE_DARK} stroke={L.line} strokeWidth={2} />
      <Ellipse cx={x + lx * 0.5} cy={y + 6 + ly * 0.5} rx={12} ry={10} fill={L.iris} opacity={0.95} />
      <Ellipse cx={x + lx} cy={y + ly} rx={8} ry={11} fill={EYE_DARK} />
      <Circle cx={x - 5 + lx} cy={y - 7 + ly} r={5.5} fill="#FFFFFF" />
      <Circle cx={x + 5 + lx} cy={y + 8 + ly} r={2.5} fill="#FFFFFF" />
    </>
  );
}

function Head({ mood, blink, chewOpen, look, yawn, clip }: Face) {
  const L = useLook();
  const g = useGid('h');
  const closed = mood === 'cheer' || mood === 'purr' || mood === 'eat' || blink || yawn;
  const lx = Math.max(-1, Math.min(1, look.x)) * 4;
  const ly = Math.max(-1, Math.min(1, look.y)) * 4;
  const sleeping = mood === 'sleep';
  const eyeY = mood === 'think' ? 104 : mood === 'hungry' ? 111 : 108;
  const lid = { stroke: L.lid, strokeWidth: 5, fill: 'none', strokeLinecap: 'round' as const };
  const ink = { stroke: L.ink, strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <>
      <Shade id={g} />
      <Defs>
        <ClipPath id={clip}>
          <Path d={HEAD} />
        </ClipPath>
      </Defs>
      <Path d={HEAD} fill={`url(#${g})`} />
      <G clipPath={`url(#${clip})`}>
        <Markings />
      </G>
      {/* cheek fluff */}
      <Path d="M36 118 l-8 4 l9 3 M164 118 l8 4 l-9 3" stroke={L.line} strokeWidth={3} fill="none" strokeLinejoin="round" />
      <Path d={HEAD} fill="none" stroke={L.line} strokeWidth={4} />

      {/* eyes */}
      {mood === 'dizzy' ? (
        <>
          <Path d="M72 108 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -6 0 a5 5 0 1 1 10 0 a7 7 0 1 1 -14 0 a9 9 0 1 1 18 0" {...lid} strokeWidth={3} />
          <Path d="M128 108 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -6 0 a5 5 0 1 1 10 0 a7 7 0 1 1 -14 0 a9 9 0 1 1 18 0" {...lid} strokeWidth={3} />
        </>
      ) : mood === 'love' && !blink ? (
        <>
          <Path d={heart(72, 104, 1.25)} fill="#E0457B" stroke={L.line} strokeWidth={2.5} />
          <Path d={heart(128, 104, 1.25)} fill="#E0457B" stroke={L.line} strokeWidth={2.5} />
        </>
      ) : closed ? (
        <>
          <Path d="M60 112 q12 -14 24 0" {...lid} />
          <Path d="M116 112 q12 -14 24 0" {...lid} />
        </>
      ) : sleeping ? (
        <>
          <Path d="M60 106 q12 10 24 0" {...lid} />
          <Path d="M116 106 q12 10 24 0" {...lid} />
        </>
      ) : (
        <>
          <Eye x={72} y={eyeY} lx={lx} ly={ly} />
          <Eye x={128} y={eyeY} lx={lx} ly={ly} />
        </>
      )}

      {/* blush */}
      <Ellipse cx={52} cy={130} rx={12} ry={7} fill="#F58BB0" opacity={mood === 'purr' || mood === 'love' ? 0.75 : 0.45} />
      <Ellipse cx={148} cy={130} rx={12} ry={7} fill="#F58BB0" opacity={mood === 'purr' || mood === 'love' ? 0.75 : 0.45} />

      {/* nose + mouth */}
      <Path d="M95 124 Q100 121 105 124 Q100 130 95 124Z" fill={L.nose} />
      {yawn ? (
        <Ellipse cx={100} cy={137} rx={9} ry={10} fill={MOUTH_PINK} stroke={L.ink} strokeWidth={3} />
      ) : mood === 'dizzy' ? (
        <Path d="M88 133 q6 -5 12 0 q6 5 12 0" {...ink} />
      ) : mood === 'eat' ? (
        chewOpen ? (
          <Ellipse cx={100} cy={134} rx={8} ry={6} fill={MOUTH_PINK} stroke={L.ink} strokeWidth={3} />
        ) : (
          <Path d="M90 131 q5 6 10 0 q5 6 10 0" {...ink} strokeWidth={3.5} />
        )
      ) : mood === 'hungry' ? (
        <>
          <Path d="M90 131 q5 6 10 0 q5 6 10 0" {...ink} />
          <Path d="M97 135 q3 8 6 0 z" fill="#F07A9A" stroke={L.ink} strokeWidth={2} />
        </>
      ) : mood === 'cheer' || mood === 'love' ? (
        <Path d="M89 130 q11 16 22 0 q-11 4 -22 0 z" fill={MOUTH_PINK} stroke={L.ink} strokeWidth={3} strokeLinejoin="round" />
      ) : mood === 'think' ? (
        <Circle cx={100} cy={134} r={4} fill="none" stroke={L.ink} strokeWidth={3} />
      ) : sleeping ? (
        <Path d="M95 133 h10" {...ink} />
      ) : (
        <Path d="M90 131 q5 6 10 0 q5 6 10 0" {...ink} />
      )}

      {/* whiskers */}
      <Path d="M26 124 l16 2 M28 134 l15 -3 M174 124 l-16 2 M172 134 l-15 -3" stroke={L.whisker} strokeWidth={2} strokeLinecap="round" opacity={0.8} />

      {/* collar with a little bell */}
      {L.collar ? (
        <>
          <Path d="M62 152 Q100 172 138 152" stroke={L.collar} strokeWidth={8} fill="none" strokeLinecap="round" />
          <Circle cx={100} cy={166} r={7} fill="#F6CF3E" stroke={L.line} strokeWidth={2.5} />
          <Path d="M95 166 h10" stroke={L.line} strokeWidth={2} />
        </>
      ) : null}
    </>
  );
}

const Foot = ({ cx }: { cx: number }) => {
  const L = useLook();
  return (
    <>
      <Ellipse cx={cx} cy={190} rx={14} ry={9} fill={L.feet} stroke={L.line} strokeWidth={3.5} />
      <Path d={`M${cx - 4} 186 v5 M${cx + 4} 186 v5`} stroke={L.line} strokeWidth={2} strokeLinecap="round" />
    </>
  );
};
const Arm = ({ d }: { d: string }) => {
  const L = useLook();
  return (
    <>
      <Path d={d} stroke={L.line} strokeWidth={20} strokeLinecap="round" fill="none" />
      <Path d={d} stroke={L.feet} strokeWidth={12} strokeLinecap="round" fill="none" />
    </>
  );
};
const ARM = {
  wave: 'M140 160 q20 -20 26 -46',
  cheerL: 'M62 162 q-20 -18 -24 -44',
  cheerR: 'M138 162 q20 -18 24 -44',
  think: 'M118 168 q4 -14 -6 -28',
  scratch: 'M140 160 q22 2 36 -10',
};

function Paws({ mood }: { mood: Mood }) {
  if (mood === 'wave')
    return (
      <>
        <Arm d={ARM.wave} />
        <Foot cx={80} />
      </>
    );
  if (mood === 'scratch')
    return (
      <>
        <Arm d={ARM.scratch} />
        <Foot cx={80} />
      </>
    );
  if (mood === 'cheer')
    return (
      <>
        <Arm d={ARM.cheerL} />
        <Arm d={ARM.cheerR} />
      </>
    );
  if (mood === 'think')
    return (
      <>
        <Arm d={ARM.think} />
        <Foot cx={80} />
      </>
    );
  return (
    <>
      <Foot cx={80} />
      <Foot cx={120} />
    </>
  );
}

function Extras({ mood }: { mood: Mood }) {
  return (
    <>
      {mood === 'cheer' ? (
        <>
          <Polygon points="24,40 29,52 42,54 32,62 35,75 24,68 13,75 16,62 6,54 19,52" fill={BRAND} stroke={PLUM} strokeWidth={2.5} />
          <Polygon points="176,30 180,40 190,41 182,48 185,58 176,52 167,58 170,48 162,41 172,40" fill={BRAND} stroke={PLUM} strokeWidth={2.5} />
        </>
      ) : null}
      {mood === 'scratch' ? (
        <SvgText x={136} y={34} fontSize={20} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={1.2}>scritch!</SvgText>
      ) : null}
      {mood === 'think' ? (
        <SvgText x={168} y={48} fontSize={40} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={2}>?</SvgText>
      ) : null}
      {mood === 'sleep' ? (
        <>
          <SvgText x={150} y={40} fontSize={26} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={1.5}>z</SvgText>
          <SvgText x={168} y={22} fontSize={34} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={1.5}>Z</SvgText>
        </>
      ) : null}
      {mood === 'purr' ? (
        <SvgText x={150} y={44} fontSize={22} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={1.2}>prr</SvgText>
      ) : null}
      {mood === 'love' ? (
        <>
          <Path d={heart(28, 40, 0.9)} fill="#E0457B" stroke={PLUM} strokeWidth={2} />
          <Path d={heart(172, 30, 0.8)} fill="#E0457B" stroke={PLUM} strokeWidth={2} />
        </>
      ) : null}
      {mood === 'encourage' ? (
        <Path d="M170 46 c-6 -10 -20 -4 -14 8 l14 12 l14 -12 c6 -12 -8 -18 -14 -8 z" fill={BRAND} stroke={PLUM} strokeWidth={3} />
      ) : null}
    </>
  );
}

// ---------- the animated cat: each moving part is its own layer, animated on the native thread ----------
function Layer({ size, style, children }: { size: number; style?: object; children: React.ReactNode }) {
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {children}
      </Svg>
    </Animated.View>
  );
}

const loop = (v: Animated.Value, ms: number, from = -1, to = 1) =>
  Animated.loop(
    Animated.sequence([
      Animated.timing(v, { toValue: to, duration: ms / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: from, duration: ms / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]),
  );

function AliveCat({ size, face }: { size: number; face: Face }) {
  const reduced = useReducedMotion();
  const { mood } = face;
  const tail = useRef(new Animated.Value(0)).current;
  const ear = useRef(new Animated.Value(0)).current;
  const pawA = useRef(new Animated.Value(0)).current;
  const pawB = useRef(new Animated.Value(0)).current;
  const extra = useRef(new Animated.Value(0)).current;
  const k = size / 200;
  const sleeping = mood === 'sleep';
  const excited = mood === 'cheer' || mood === 'love' || mood === 'eat';
  const tempo = sleeping ? 'sleep' : excited ? 'fast' : mood === 'purr' ? 'slow' : 'calm';

  // Tail: always swishing; speed follows her mood.
  useEffect(() => {
    if (reduced) return;
    const a = loop(tail, tempo === 'sleep' ? 4200 : tempo === 'fast' ? 520 : tempo === 'slow' ? 2600 : 1800);
    a.start();
    return () => a.stop();
  }, [tempo, reduced, tail]);

  // Ears: a little twitch every few seconds (not while asleep).
  useEffect(() => {
    if (reduced || sleeping) return;
    let t: ReturnType<typeof setTimeout>;
    const twitch = () => {
      Animated.sequence([
        Animated.timing(ear, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(ear, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(ear, { toValue: 0.6, duration: 90, useNativeDriver: true }),
        Animated.timing(ear, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]).start();
      t = setTimeout(twitch, 2600 + Math.random() * 4200);
    };
    t = setTimeout(twitch, 1500 + Math.random() * 2000);
    return () => clearTimeout(t);
  }, [reduced, sleeping, ear]);

  // Paws: kneading when purring, waving, cheering arms.
  useEffect(() => {
    pawA.setValue(0);
    pawB.setValue(0);
    if (reduced) return;
    let a: Animated.CompositeAnimation | null = null;
    if (mood === 'purr')
      a = Animated.loop(
        Animated.sequence([
          Animated.timing(pawA, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(pawA, { toValue: 0, duration: 260, useNativeDriver: true }),
          Animated.timing(pawB, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(pawB, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]),
      );
    else if (mood === 'wave') a = loop(pawA, 620);
    else if (mood === 'scratch') a = loop(pawA, 230);
    else if (mood === 'cheer') a = Animated.parallel([loop(pawA, 420), loop(pawB, 420)]);
    a?.start();
    return () => a?.stop();
  }, [mood, reduced, pawA, pawB]);

  // Extras: floating Zzz, pulsing hearts and stars.
  useEffect(() => {
    extra.setValue(0);
    if (reduced) return;
    const a = Animated.loop(Animated.timing(extra, { toValue: 1, duration: sleeping ? 2200 : 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [sleeping, reduced, extra]);

  const rot = (v: Animated.Value, a: number, b: number) => ({ rotate: v.interpolate({ inputRange: [-1, 1], outputRange: [`${a}deg`, `${b}deg`] }) });
  const tailAmp = sleeping ? [-3, 4] : tempo === 'fast' ? [-14, 18] : [-9, 13];
  const footLift = (v: Animated.Value) => ({ transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -7 * k] }) }] });

  return (
    <View style={{ width: size, height: size }}>
      <Layer size={size} style={{ transformOrigin: '73% 88%', transform: [rot(tail, tailAmp[0], tailAmp[1])] }}>
        <Tail />
      </Layer>
      <Layer size={size}>
        <Body />
        <EarRight />
      </Layer>
      <Layer size={size} style={{ transformOrigin: '36% 28%', transform: [{ rotate: ear.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-16deg'] }) }] }}>
        <EarLeft />
      </Layer>
      <Layer size={size}>
        <Head {...face} />
      </Layer>
      {mood === 'scratch' ? (
        <>
          <Layer size={size}>
            <Foot cx={80} />
          </Layer>
          <Layer size={size} style={{ transformOrigin: '70% 80%', transform: [rot(pawA, -24, 16)] }}>
            <Arm d={ARM.scratch} />
          </Layer>
        </>
      ) : mood === 'wave' ? (
        <>
          <Layer size={size}>
            <Foot cx={80} />
          </Layer>
          <Layer size={size} style={{ transformOrigin: '70% 80%', transform: [rot(pawA, -16, 10)] }}>
            <Arm d={ARM.wave} />
          </Layer>
        </>
      ) : mood === 'cheer' ? (
        <>
          <Layer size={size} style={{ transformOrigin: '31% 81%', transform: [rot(pawA, -10, 12)] }}>
            <Arm d={ARM.cheerL} />
          </Layer>
          <Layer size={size} style={{ transformOrigin: '69% 81%', transform: [rot(pawB, 10, -12)] }}>
            <Arm d={ARM.cheerR} />
          </Layer>
        </>
      ) : mood === 'think' ? (
        <Layer size={size}>
          <Paws mood={mood} />
        </Layer>
      ) : (
        <>
          <Layer size={size} style={footLift(pawA)}>
            <Foot cx={80} />
          </Layer>
          <Layer size={size} style={footLift(pawB)}>
            <Foot cx={120} />
          </Layer>
        </>
      )}
      <Layer
        size={size}
        style={
          sleeping
            ? { opacity: extra.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }), transform: [{ translateY: extra.interpolate({ inputRange: [0, 1], outputRange: [0, -14 * k] }) }] }
            : { transformOrigin: '50% 30%', transform: [{ scale: extra.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1] }) }] }
        }
      >
        <Extras mood={mood} />
      </Layer>
    </View>
  );
}

export function Mascot({
  mood = 'happy',
  size = 140,
  blink = false,
  chewOpen = false,
  tapToMeow = true,
  look = { x: 0, y: 0 },
  yawn = false,
  alive = false,
  cat,
}: {
  mood?: Mood;
  size?: number;
  /** which cat to draw (defaults to the one chosen in Cats) */
  cat?: CatId;
  /** eyes briefly closed (idle blinking) */
  blink?: boolean;
  /** mouth open while chewing */
  chewOpen?: boolean;
  tapToMeow?: boolean;
  /** where she's looking, -1..1 on each axis (pupils follow) */
  look?: { x: number; y: number };
  /** big sleepy yawn */
  yawn?: boolean;
  /** tail, ears, paws and extras move on their own */
  alive?: boolean;
}) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const face: Face = { mood, blink, chewOpen, look, yawn, clip: `head${raw}` };
  const v = useAppear(380);
  const { state } = useApp();
  const c = cat ? catById(cat) : currentCat(state);

  return (
    <LookCtx.Provider value={c.look}>
    <Animated.View style={popStyle(v)}>
      <Pressable disabled={!tapToMeow} onPress={() => playSfx('meow')} accessibilityRole="imagebutton" accessibilityLabel={`${c.name} the cat. Tap to say hi.`}>
        {alive ? (
          <AliveCat size={size} face={face} />
        ) : (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Tail />
            <Body />
            <EarLeft />
            <EarRight />
            <Head {...face} />
            <Paws mood={mood} />
            <Extras mood={mood} />
          </Svg>
        )}
      </Pressable>
    </Animated.View>
    </LookCtx.Provider>
  );
}

/** Mascot with a speech bubble underneath (stacked, so nothing needs side-panning). */
export function MascotSays({
  mood = 'happy',
  size = 130,
  alive = false,
  children,
}: {
  mood?: Mood;
  size?: number;
  alive?: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useApp();
  return (
    <View style={{ alignItems: 'center', gap: 0 }}>
      <Mascot mood={mood} size={size} alive={alive} />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 14,
          borderRightWidth: 14,
          borderBottomWidth: 14,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: colors.brand,
        }}
      />
      <View
        style={{
          alignSelf: 'stretch',
          backgroundColor: colors.surface,
          borderColor: colors.brand,
          borderWidth: 3,
          borderRadius: 22,
          padding: space.md,
          gap: space.sm,
        }}
      >
        {children}
      </View>
    </View>
  );
}

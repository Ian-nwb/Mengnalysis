import React, { createContext, useContext, useEffect, useId, useRef } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, Path, Polygon, Text as SvgText } from 'react-native-svg';
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
const ORANGE = '#F2A65A';
const BLACK = '#2B2230';
const PINK = '#F5A9C0';
const GOLD = '#D9B44A';

type Face = { mood: Mood; blink: boolean; chewOpen: boolean; look: { x: number; y: number }; yawn: boolean; clip: string };

const heart = (cx: number, cy: number, k = 1) =>
  `M${cx} ${cy + 7 * k} c-7 -5 -11 -9 -11 -14 c0 -5 6 -8 11 -3 c5 -5 11 -2 11 3 c0 5 -4 9 -11 14 z`;

// ---------- drawing pieces (shared by the still and the animated cat) ----------
// Colors and markings come from the chosen cat (see src/cats.ts).
const LookCtx = createContext<CatLook>(CATS[0].look);
const useLook = () => useContext(LookCtx);

const Tail = () => {
  const L = useLook();
  return (
    <>
      <Path d="M146 176 q34 -6 30 -40 q-2 -10 -10 -8" fill="none" stroke={L.line} strokeWidth={13} strokeLinecap="round" />
      <Path d="M146 176 q34 -6 30 -40 q-2 -10 -10 -8" fill="none" stroke={L.tail} strokeWidth={7} strokeLinecap="round" />
    </>
  );
};
const Body = () => {
  const L = useLook();
  return (
    <>
      <Ellipse cx={100} cy={168} rx={50} ry={30} fill={L.fur} stroke={L.line} strokeWidth={5} />
      {L.patches === 'calico' ? <Path d="M122 146 q26 4 26 26 q-16 8 -30 -2 q2 -14 4 -24 z" fill={ORANGE} /> : null}
      {L.patches === 'tuxedo' ? <Ellipse cx={100} cy={166} rx={22} ry={24} fill={WHITE} /> : null}
      {L.patches === 'orange' ? (
        <>
          <Ellipse cx={100} cy={164} rx={20} ry={20} fill={WHITE} />
          <Path d="M78 146 q-26 4 -26 26 q16 8 30 -2 q-2 -14 -4 -24 z" fill={WHITE} />
          <Path d="M128 156 q8 6 6 16 M140 154 q6 6 4 14" stroke="#D9843A" strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      ) : null}
    </>
  );
};
const EarLeft = () => {
  const L = useLook();
  return (
    <>
      <Polygon points="50,66 58,16 94,46" fill={L.earL} stroke={L.line} strokeWidth={5} strokeLinejoin="round" />
      <Polygon points="62,52 64,32 79,46" fill={L.innerEar} opacity={0.9} />
    </>
  );
};
const EarRight = () => {
  const L = useLook();
  return (
    <>
      <Polygon points="150,66 142,16 106,46" fill={L.earR} stroke={L.line} strokeWidth={5} strokeLinejoin="round" />
      <Polygon points="138,52 136,32 121,46" fill={L.innerEar} opacity={0.9} />
    </>
  );
};

function Markings() {
  const L = useLook();
  if (L.patches === 'calico')
    return (
      <>
        <Ellipse cx={62} cy={80} rx={40} ry={42} fill={ORANGE} />
        <Ellipse cx={138} cy={80} rx={40} ry={42} fill={ORANGE} />
        <Path d="M90 44 L110 44 L122 104 L78 104 Z" fill={WHITE} />
        <Ellipse cx={100} cy={120} rx={34} ry={22} fill={WHITE} />
        <Ellipse cx={62} cy={136} rx={20} ry={14} fill={WHITE} />
        <Ellipse cx={138} cy={136} rx={20} ry={14} fill={WHITE} />
        <Path d="M84 44 Q100 36 116 44 Q108 56 100 66 Q92 56 84 44 Z" fill={BLACK} />
        <Ellipse cx={120} cy={123} rx={11} ry={7} fill={ORANGE} />
      </>
    );
  if (L.patches === 'tuxedo')
    return (
      <>
        {/* white inverted-V blaze and muzzle */}
        <Path d="M100 76 L124 128 L76 128 Z" fill={WHITE} />
        <Ellipse cx={100} cy={124} rx={30} ry={20} fill={WHITE} />
        <Ellipse cx={100} cy={142} rx={22} ry={10} fill={WHITE} />
      </>
    );
  if (L.patches === 'orange')
    return (
      <>
        {/* white mouth and chin, soft tabby stripes */}
        <Ellipse cx={100} cy={124} rx={28} ry={18} fill={WHITE} />
        <Path d="M90 46 q2 10 0 18 M100 44 v20 M110 46 q-2 10 0 18" stroke="#D9843A" strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M46 84 q10 2 16 8 M44 98 q10 0 16 4 M154 84 q-10 2 -16 8 M156 98 q-10 0 -16 4" stroke="#D9843A" strokeWidth={4} fill="none" strokeLinecap="round" />
      </>
    );
  return null;
}

function Head({ mood, blink, chewOpen, look, yawn, clip }: Face) {
  const L = useLook();
  const closed = mood === 'cheer' || mood === 'purr' || mood === 'eat' || blink || yawn;
  const lx = Math.max(-1, Math.min(1, look.x)) * 4;
  const ly = Math.max(-1, Math.min(1, look.y)) * 4;
  const sleeping = mood === 'sleep';
  const eyeY = mood === 'think' ? 90 : mood === 'hungry' ? 97 : 94;
  return (
    <>
      <Defs>
        <ClipPath id={clip}>
          <Ellipse cx={100} cy={92} rx={56} ry={48} />
        </ClipPath>
      </Defs>
      {/* head: orange on both sides, white blaze down the middle, black forehead spot */}
      <Ellipse cx={100} cy={92} rx={56} ry={48} fill={L.fur} />
      <G clipPath={`url(#${clip})`}>
        <Markings />
      </G>
      <Ellipse cx={100} cy={92} rx={56} ry={48} fill="none" stroke={L.line} strokeWidth={5} />

      {/* cheeks */}
      <Ellipse cx={64} cy={112} rx={9} ry={5} fill={BRAND} opacity={0.7} />
      <Ellipse cx={136} cy={112} rx={9} ry={5} fill={BRAND} opacity={0.7} />
      {mood === 'purr' ? (
        <>
          <Ellipse cx={64} cy={112} rx={12} ry={7} fill="#F07A9A" opacity={0.55} />
          <Ellipse cx={136} cy={112} rx={12} ry={7} fill="#F07A9A" opacity={0.55} />
        </>
      ) : null}

      {/* eyes: golden, like hers */}
      {mood === 'dizzy' ? (
        <>
          <Path d="M78 94 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -6 0 a5 5 0 1 1 10 0 a7 7 0 1 1 -14 0" stroke={L.lid} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M122 94 m-1 0 a1 1 0 1 1 2 0 a3 3 0 1 1 -6 0 a5 5 0 1 1 10 0 a7 7 0 1 1 -14 0" stroke={L.lid} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'love' && !blink ? (
        <>
          <Path d={heart(78, 92)} fill="#E0457B" stroke={PLUM} strokeWidth={2.5} />
          <Path d={heart(122, 92)} fill="#E0457B" stroke={PLUM} strokeWidth={2.5} />
        </>
      ) : closed ? (
        <>
          <Path d="M68 98 q10 -12 20 0" stroke={L.lid} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M112 98 q10 -12 20 0" stroke={L.lid} strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      ) : sleeping ? (
        <>
          <Path d="M68 94 q10 9 20 0" stroke={L.lid} strokeWidth={5} fill="none" strokeLinecap="round" />
          <Path d="M112 94 q10 9 20 0" stroke={L.lid} strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <Ellipse cx={78} cy={eyeY} rx={11} ry={12} fill={L.iris} stroke={PLUM} strokeWidth={3} />
          <Ellipse cx={122} cy={eyeY} rx={11} ry={12} fill={L.iris} stroke={PLUM} strokeWidth={3} />
          <Ellipse cx={78 + lx} cy={eyeY + 1 + ly} rx={5} ry={9} fill={PLUM} />
          <Ellipse cx={122 + lx} cy={eyeY + 1 + ly} rx={5} ry={9} fill={PLUM} />
          <Ellipse cx={81 + lx} cy={eyeY - 4 + ly} rx={2.8} ry={3.2} fill={WHITE} />
          <Ellipse cx={125 + lx} cy={eyeY - 4 + ly} rx={2.8} ry={3.2} fill={WHITE} />
        </>
      )}

      {/* nose + mouth */}
      <Polygon points="94,108 106,108 100,115" fill={L.nose} stroke={L.ink} strokeWidth={2.5} strokeLinejoin="round" />
      {yawn ? (
        <Ellipse cx={100} cy={125} rx={10} ry={11} fill="#B4466A" stroke={L.ink} strokeWidth={3} />
      ) : mood === 'dizzy' ? (
        <Path d="M90 121 q5 -5 10 0 q5 5 10 0" stroke={L.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
      ) : mood === 'eat' ? (
        chewOpen ? (
          <Ellipse cx={100} cy={123} rx={9} ry={7} fill="#B4466A" stroke={L.ink} strokeWidth={3} />
        ) : (
          <Path d="M90 119 q5 5 10 0 q5 5 10 0" stroke={L.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        )
      ) : mood === 'hungry' ? (
        <>
          <Path d="M90 117 q5 6 10 0 q5 6 10 0" stroke={L.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M97 121 q3 9 6 0 z" fill="#F07A9A" stroke={L.ink} strokeWidth={2} />
        </>
      ) : mood === 'cheer' || mood === 'love' ? (
        <Path d="M88 118 q12 18 24 0 z" fill="#B4466A" stroke={L.ink} strokeWidth={3} strokeLinejoin="round" />
      ) : mood === 'think' ? (
        <Ellipse cx={100} cy={122} rx={4} ry={4} fill="none" stroke={L.ink} strokeWidth={3} />
      ) : sleeping ? (
        <Path d="M95 121 h10" stroke={L.ink} strokeWidth={3} strokeLinecap="round" />
      ) : (
        <Path d="M90 117 q5 6 10 0 q5 6 10 0" stroke={L.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
      )}

      {/* whiskers */}
      <Path d="M38 106 l22 3 M40 118 l21 -3 M162 106 l-22 3 M160 118 l-21 -3" stroke={L.whisker} strokeWidth={2.5} strokeLinecap="round" />

      {/* collar with tag */}
      {L.collar ? (
        <>
          <Path d="M66 132 q34 20 68 0" stroke={L.collar} strokeWidth={9} fill="none" strokeLinecap="round" />
          <Ellipse cx={100} cy={146} rx={7} ry={7} fill={L.collar} stroke={PLUM} strokeWidth={3} />
        </>
      ) : null}
    </>
  );
}

const Foot = ({ cx }: { cx: number }) => {
  const L = useLook();
  return <Ellipse cx={cx} cy={190} rx={14} ry={9} fill={L.feet} stroke={L.line} strokeWidth={4} />;
};
const Arm = ({ d }: { d: string }) => {
  const L = useLook();
  return (
    <>
      <Path d={d} stroke={L.line} strokeWidth={22} strokeLinecap="round" fill="none" />
      <Path d={d} stroke={L.feet} strokeWidth={13} strokeLinecap="round" fill="none" />
    </>
  );
};
const ARM = {
  wave: 'M140 150 q20 -20 26 -46',
  cheerL: 'M62 152 q-20 -18 -24 -44',
  cheerR: 'M138 152 q20 -18 24 -44',
  think: 'M118 160 q4 -14 -6 -28',
  scratch: 'M140 150 q22 2 36 -10',
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
          <Layer size={size} style={{ transformOrigin: '70% 75%', transform: [rot(pawA, -24, 16)] }}>
            <Arm d={ARM.scratch} />
          </Layer>
        </>
      ) : mood === 'wave' ? (
        <>
          <Layer size={size}>
            <Foot cx={80} />
          </Layer>
          <Layer size={size} style={{ transformOrigin: '70% 75%', transform: [rot(pawA, -16, 10)] }}>
            <Arm d={ARM.wave} />
          </Layer>
        </>
      ) : mood === 'cheer' ? (
        <>
          <Layer size={size} style={{ transformOrigin: '31% 76%', transform: [rot(pawA, -10, 12)] }}>
            <Arm d={ARM.cheerL} />
          </Layer>
          <Layer size={size} style={{ transformOrigin: '69% 76%', transform: [rot(pawB, 10, -12)] }}>
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

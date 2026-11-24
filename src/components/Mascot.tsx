import React, { useId } from 'react';
import { Animated, Pressable, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, Path, Polygon, Text as SvgText } from 'react-native-svg';
import { popStyle, useAppear } from '../motion';
import { playSfx } from '../sfx';
import { useApp } from '../state';
import { BRAND, space } from '../theme';

// Meng: Tori's calico cat guide, drawn after the real Meng (white blaze,
// black forehead spot, orange cheeks, golden eyes, dark ear and tail). Bold shapes + thick outline so she reads
// clearly at any zoom level.
export const MASCOT_NAME = 'Meng';

export type Mood = 'happy' | 'wave' | 'think' | 'cheer' | 'sleep' | 'encourage' | 'purr' | 'eat' | 'love' | 'hungry';

const PLUM = '#1B1420';
const WHITE = '#FFFDF9';
const ORANGE = '#F2A65A';
const BLACK = '#2B2230';
const PINK = '#F5A9C0';
const GOLD = '#D9B44A';

export function Mascot({
  mood = 'happy',
  size = 140,
  blink = false,
  chewOpen = false,
  tapToMeow = true,
}: {
  mood?: Mood;
  size?: number;
  /** eyes briefly closed (idle blinking) */
  blink?: boolean;
  /** mouth open while chewing */
  chewOpen?: boolean;
  tapToMeow?: boolean;
}) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clip = `head${raw}`;
  const v = useAppear(380);
  const closed = mood === 'cheer' || mood === 'purr' || mood === 'eat' || blink;
  const sleeping = mood === 'sleep';
  const eyeY = mood === 'think' ? 90 : mood === 'hungry' ? 97 : 94;
  const heart = (cx: number, cy: number, k = 1) =>
    `M${cx} ${cy + 7 * k} c-7 -5 -11 -9 -11 -14 c0 -5 6 -8 11 -3 c5 -5 11 -2 11 3 c0 5 -4 9 -11 14 z`;

  return (
    <Animated.View style={popStyle(v)}>
      <Pressable disabled={!tapToMeow} onPress={() => playSfx('meow')} accessibilityRole="imagebutton" accessibilityLabel={`${MASCOT_NAME} the cat. Tap to say hi.`}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <ClipPath id={clip}>
            <Ellipse cx={100} cy={92} rx={56} ry={48} />
          </ClipPath>
        </Defs>

        {/* tail (dark, like hers) */}
        <Path d="M146 176 q34 -6 30 -40 q-2 -10 -10 -8" fill="none" stroke={PLUM} strokeWidth={13} strokeLinecap="round" />
        <Path d="M146 176 q34 -6 30 -40 q-2 -10 -10 -8" fill="none" stroke={BLACK} strokeWidth={7} strokeLinecap="round" />

        {/* body: white with an orange patch on her side */}
        <Ellipse cx={100} cy={168} rx={50} ry={30} fill={WHITE} stroke={PLUM} strokeWidth={5} />
        <Path d="M122 146 q26 4 26 26 q-16 8 -30 -2 q2 -14 4 -24 z" fill={ORANGE} />

        {/* ears: dark on her right side (viewer's left), orange-white on the other */}
        <Polygon points="50,66 58,16 94,46" fill={BLACK} stroke={PLUM} strokeWidth={5} strokeLinejoin="round" />
        <Polygon points="150,66 142,16 106,46" fill={ORANGE} stroke={PLUM} strokeWidth={5} strokeLinejoin="round" />
        <Polygon points="62,52 64,32 79,46" fill={WHITE} opacity={0.9} />
        <Polygon points="138,52 136,32 121,46" fill={WHITE} opacity={0.9} />

        {/* head: orange on both sides, white blaze down the middle, black forehead spot */}
        <Ellipse cx={100} cy={92} rx={56} ry={48} fill={WHITE} />
        <G clipPath={`url(#${clip})`}>
          <Ellipse cx={62} cy={80} rx={40} ry={42} fill={ORANGE} />
          <Ellipse cx={138} cy={80} rx={40} ry={42} fill={ORANGE} />
          <Path d="M90 44 L110 44 L122 104 L78 104 Z" fill={WHITE} />
          <Ellipse cx={100} cy={120} rx={34} ry={22} fill={WHITE} />
          <Ellipse cx={62} cy={136} rx={20} ry={14} fill={WHITE} />
          <Ellipse cx={138} cy={136} rx={20} ry={14} fill={WHITE} />
          <Path d="M84 44 Q100 36 116 44 Q108 56 100 66 Q92 56 84 44 Z" fill={BLACK} />
          <Ellipse cx={120} cy={123} rx={11} ry={7} fill={ORANGE} />
        </G>
        <Ellipse cx={100} cy={92} rx={56} ry={48} fill="none" stroke={PLUM} strokeWidth={5} />

        {/* cheeks */}
        <Ellipse cx={64} cy={112} rx={9} ry={5} fill={BRAND} opacity={0.7} />
        <Ellipse cx={136} cy={112} rx={9} ry={5} fill={BRAND} opacity={0.7} />

        {/* eyes: golden, like hers */}
        {mood === 'love' && !blink ? (
          <>
            <Path d={heart(78, 92)} fill="#E0457B" stroke={PLUM} strokeWidth={2.5} />
            <Path d={heart(122, 92)} fill="#E0457B" stroke={PLUM} strokeWidth={2.5} />
          </>
        ) : closed ? (
          <>
            <Path d="M68 98 q10 -12 20 0" stroke={PLUM} strokeWidth={5} fill="none" strokeLinecap="round" />
            <Path d="M112 98 q10 -12 20 0" stroke={PLUM} strokeWidth={5} fill="none" strokeLinecap="round" />
          </>
        ) : sleeping ? (
          <>
            <Path d="M68 94 q10 9 20 0" stroke={PLUM} strokeWidth={5} fill="none" strokeLinecap="round" />
            <Path d="M112 94 q10 9 20 0" stroke={PLUM} strokeWidth={5} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <Ellipse cx={78} cy={eyeY} rx={11} ry={12} fill={GOLD} stroke={PLUM} strokeWidth={3} />
            <Ellipse cx={122} cy={eyeY} rx={11} ry={12} fill={GOLD} stroke={PLUM} strokeWidth={3} />
            <Ellipse cx={78} cy={eyeY + 1} rx={5} ry={9} fill={PLUM} />
            <Ellipse cx={122} cy={eyeY + 1} rx={5} ry={9} fill={PLUM} />
            <Ellipse cx={81} cy={eyeY - 4} rx={2.8} ry={3.2} fill={WHITE} />
            <Ellipse cx={125} cy={eyeY - 4} rx={2.8} ry={3.2} fill={WHITE} />
          </>
        )}

        {/* nose + mouth */}
        <Polygon points="94,108 106,108 100,115" fill={PINK} stroke={PLUM} strokeWidth={2.5} strokeLinejoin="round" />
        {mood === 'eat' ? (
          chewOpen ? (
            <Ellipse cx={100} cy={123} rx={9} ry={7} fill="#B4466A" stroke={PLUM} strokeWidth={3} />
          ) : (
            <Path d="M90 119 q5 5 10 0 q5 5 10 0" stroke={PLUM} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          )
        ) : mood === 'hungry' ? (
          <>
            <Path d="M90 117 q5 6 10 0 q5 6 10 0" stroke={PLUM} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M97 121 q3 9 6 0 z" fill="#F07A9A" stroke={PLUM} strokeWidth={2} />
          </>
        ) : mood === 'cheer' || mood === 'love' ? (
          <Path d="M88 118 q12 18 24 0 z" fill="#B4466A" stroke={PLUM} strokeWidth={3} strokeLinejoin="round" />
        ) : mood === 'think' ? (
          <Ellipse cx={100} cy={122} rx={4} ry={4} fill="none" stroke={PLUM} strokeWidth={3} />
        ) : sleeping ? (
          <Path d="M95 121 h10" stroke={PLUM} strokeWidth={3} strokeLinecap="round" />
        ) : (
          <Path d="M90 117 q5 6 10 0 q5 6 10 0" stroke={PLUM} strokeWidth={3} fill="none" strokeLinecap="round" />
        )}

        {/* whiskers */}
        <Path d="M38 106 l22 3 M40 118 l21 -3 M162 106 l-22 3 M160 118 l-21 -3" stroke={PLUM} strokeWidth={2.5} strokeLinecap="round" />

        {/* collar with tag */}
        <Path d="M66 132 q34 20 68 0" stroke={BRAND} strokeWidth={9} fill="none" strokeLinecap="round" />
        <Ellipse cx={100} cy={146} rx={7} ry={7} fill={BRAND} stroke={PLUM} strokeWidth={3} />

        {/* paws */}
        {mood === 'wave' ? (
          <>
            <Path d="M140 150 q20 -20 26 -46" stroke={PLUM} strokeWidth={22} strokeLinecap="round" fill="none" />
            <Path d="M140 150 q20 -20 26 -46" stroke={WHITE} strokeWidth={13} strokeLinecap="round" fill="none" />
            <Ellipse cx={80} cy={190} rx={14} ry={9} fill={WHITE} stroke={PLUM} strokeWidth={4} />
          </>
        ) : mood === 'cheer' ? (
          <>
            <Path d="M62 152 q-20 -18 -24 -44" stroke={PLUM} strokeWidth={22} strokeLinecap="round" fill="none" />
            <Path d="M62 152 q-20 -18 -24 -44" stroke={WHITE} strokeWidth={13} strokeLinecap="round" fill="none" />
            <Path d="M138 152 q20 -18 24 -44" stroke={PLUM} strokeWidth={22} strokeLinecap="round" fill="none" />
            <Path d="M138 152 q20 -18 24 -44" stroke={WHITE} strokeWidth={13} strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'think' ? (
          <>
            <Path d="M118 160 q4 -14 -6 -28" stroke={PLUM} strokeWidth={22} strokeLinecap="round" fill="none" />
            <Path d="M118 160 q4 -14 -6 -28" stroke={WHITE} strokeWidth={13} strokeLinecap="round" fill="none" />
            <Ellipse cx={80} cy={190} rx={14} ry={9} fill={WHITE} stroke={PLUM} strokeWidth={4} />
          </>
        ) : (
          <>
            <Ellipse cx={80} cy={190} rx={14} ry={9} fill={WHITE} stroke={PLUM} strokeWidth={4} />
            <Ellipse cx={120} cy={190} rx={14} ry={9} fill={WHITE} stroke={PLUM} strokeWidth={4} />
          </>
        )}

        {/* extras */}
        {mood === 'cheer' ? (
          <>
            <Polygon points="24,40 29,52 42,54 32,62 35,75 24,68 13,75 16,62 6,54 19,52" fill={BRAND} stroke={PLUM} strokeWidth={2.5} />
            <Polygon points="176,30 180,40 190,41 182,48 185,58 176,52 167,58 170,48 162,41 172,40" fill={BRAND} stroke={PLUM} strokeWidth={2.5} />
          </>
        ) : null}
        {mood === 'think' ? (
          <SvgText x={168} y={48} fontSize={40} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={2}>?</SvgText>
        ) : null}
        {sleeping ? (
          <>
            <SvgText x={150} y={40} fontSize={26} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={1.5}>z</SvgText>
            <SvgText x={168} y={22} fontSize={34} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={1.5}>Z</SvgText>
          </>
        ) : null}
        {mood === 'purr' ? (
          <>
            <Ellipse cx={64} cy={112} rx={12} ry={7} fill="#F07A9A" opacity={0.55} />
            <Ellipse cx={136} cy={112} rx={12} ry={7} fill="#F07A9A" opacity={0.55} />
            <SvgText x={150} y={44} fontSize={22} fontWeight="900" fill={BRAND} stroke={PLUM} strokeWidth={1.2}>prr</SvgText>
          </>
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
      </Svg>
      </Pressable>
    </Animated.View>
  );
}

/** Mascot with a speech bubble underneath (stacked, so nothing needs side-panning). */
export function MascotSays({
  mood = 'happy',
  size = 130,
  children,
}: {
  mood?: Mood;
  size?: number;
  children: React.ReactNode;
}) {
  const { colors } = useApp();
  return (
    <View style={{ alignItems: 'center', gap: 0 }}>
      <Mascot mood={mood} size={size} />
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

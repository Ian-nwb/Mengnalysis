import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, ScrollViewInstance, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Example } from '../content/types';
import { appearStyle, popStyle, useAppear, useReducedMotion } from '../motion';
import { useApp } from '../state';
import { fonts, maxWidth, radius, space, type, radii } from '../theme';
import { buzz } from '../haptics';
import { playSfx } from '../sfx';
import { speak, stopSpeaking } from '../voice';
import { Icon, IconName, isIconName } from './Icon';
import { Mascot } from './Mascot';

// ---------- Text ----------
type Variant = keyof typeof type;
export function Txt({
  v = 'body',
  color,
  bold,
  center,
  style,
  children,
}: {
  v?: Variant;
  color?: string;
  bold?: boolean;
  center?: boolean;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}) {
  const { colors, state } = useApp();
  const size = type[v] * state.settings.textScale;
  const heading = v === 'h1' || v === 'h2';
  return (
    <Text
      style={[
        {
          color: color ?? colors.text,
          fontSize: size,
          lineHeight: Math.round(size * (heading ? 1.25 : 1.4)),
          fontFamily: heading ? fonts.heading : bold ? fonts.bold : fonts.body,
          textAlign: center ? 'center' : 'left',
        },
        style,
      ]}
      accessibilityRole={heading ? 'header' : undefined}
    >
      {children}
    </Text>
  );
}

// ---------- Screen: one centered column, gentle entrance ----------
/** True when the bottom tab bar is showing (it handles the bottom safe area itself). */
export const TabsContext = createContext(false);

export function Screen({
  children,
  scrollRef,
  contentRef,
  scrollEnabled = true,
}: {
  children: React.ReactNode;
  scrollEnabled?: boolean;
  scrollRef?: React.RefObject<ScrollViewInstance | null>;
  contentRef?: React.RefObject<React.ComponentRef<typeof View> | null>;
}) {
  const { colors } = useApp();
  const tabs = useContext(TabsContext);
  const v = useAppear(240);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={tabs ? ['top'] : ['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ padding: 20, paddingBottom: 56, alignItems: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View ref={contentRef} style={[{ width: '100%', maxWidth, gap: space.md }, appearStyle(v)]}>
          {children}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Children appear one after another (only once, on mount). */
export function Stagger({ children, step = 70 }: { children: React.ReactNode; step?: number }) {
  return (
    <>
      {React.Children.toArray(children).map((c, i) => (
        <Appear key={i} delay={i * step}>
          {c}
        </Appear>
      ))}
    </>
  );
}

export function Appear({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const v = useAppear(280, delay);
  return <Animated.View style={appearStyle(v, 18)}>{children}</Animated.View>;
}

// ---------- Buttons ----------
export type BtnState = 'normal' | 'correct' | 'wrong' | 'selected' | 'dim';
export function BigButton({
  label,
  sub,
  onPress,
  variant = 'secondary',
  state = 'normal',
  icon,
  disabled,
  a11y,
  style,
}: {
  label: string;
  sub?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  state?: BtnState;
  icon?: IconName | string;
  disabled?: boolean;
  a11y?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, state: app } = useApp();
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const press = (to: number) => {
    if (reduced) return;
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };
  const primary = variant === 'primary';
  const ghost = variant === 'ghost';
  let bg = primary ? colors.brand : ghost ? 'transparent' : colors.surface;
  let fg = primary ? colors.onBrand : colors.text;
  let border = primary ? colors.brand : colors.border;
  if (state === 'correct') {
    border = colors.good;
    fg = colors.good;
  }
  if (state === 'wrong') {
    border = colors.bad;
    fg = colors.bad;
  }
  if (state === 'selected') {
    border = colors.accent;
    bg = colors.brandSoft;
  }
  const iconName: IconName | null =
    state === 'correct' ? 'check' : state === 'wrong' ? 'x' : icon && isIconName(icon) ? icon : null;
  const emoji = !iconName && icon ? icon : null;
  const iconSize = Math.round(26 * app.settings.textScale);
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={() => {
          if (primary) playSfx('tap');
          onPress?.();
        }}
        onPressIn={() => press(0.97)}
        onPressOut={() => press(1)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={a11y ?? (sub ? `${label}. ${sub}` : label)}
        accessibilityState={{ disabled: !!disabled, selected: state === 'selected' }}
        style={({ pressed }) => ({
          minHeight: 62,
          borderRadius: radius,
          borderWidth: (state === 'normal' || state === 'dim' ? 2 : 4) + (app.settings.boldOutlines ? 1 : 0),
          borderColor: border,
          backgroundColor: pressed && !primary ? colors.surfaceHi : bg,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: primary ? 'center' : 'flex-start',
          gap: 12,
          opacity: state === 'dim' || (disabled && state === 'normal') ? 0.5 : 1,
          elevation: primary && !pressed ? 3 : 0,
          shadowColor: '#000',
          shadowOpacity: primary ? 0.25 : 0,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        })}
      >
        {iconName ? <Icon name={iconName} size={iconSize} color={fg} /> : null}
        <View style={{ flexShrink: 1 }}>
          <Txt bold color={fg} center={primary}>
            {emoji ? `${emoji}  ` : ''}
            {label}
          </Txt>
          {sub ? (
            <Txt v="small" color={primary ? colors.onBrand : colors.textMuted}>
              {sub}
            </Txt>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function Card({
  children,
  style,
  tone = 'plain',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'plain' | 'hero' | 'inset';
}) {
  const { colors, state } = useApp();
  const bold = state.settings.boldOutlines;
  const bg = tone === 'hero' ? colors.brandSoft : tone === 'inset' ? colors.surfaceHi : colors.surface;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: tone === 'hero' ? radii.hero : radius,
          padding: tone === 'hero' ? space.lg : space.md,
          gap: space.sm,
          borderWidth: (tone === 'hero' ? 2 : 1) + (bold ? 1 : 0),
          borderColor: tone === 'hero' ? colors.brand : bold ? colors.textMuted : colors.border,
          elevation: tone === 'inset' ? 0 : 2,
          shadowColor: '#000',
          shadowOpacity: tone === 'inset' ? 0 : 0.18,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Small label with an icon, used as a card header. */
export function Kicker({ icon, children }: { icon?: IconName; children: React.ReactNode }) {
  const { colors, state } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon ? <Icon name={icon} size={Math.round(20 * state.settings.textScale)} color={colors.accent} /> : null}
      <Txt v="small" bold color={colors.accent} style={{ letterSpacing: 0.5, flexShrink: 1 }}>
        {children}
      </Txt>
    </View>
  );
}

export function TopBar({ onBack, backLabel = 'Home', right }: { onBack: () => void; backLabel?: string; right?: string }) {
  const { colors, state } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, flexWrap: 'wrap' }}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={`Back to ${backLabel}`}
        style={{ minHeight: 56, minWidth: 56, flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 12 }}
      >
        <Icon name="back" size={Math.round(26 * state.settings.textScale)} color={colors.accent} />
        <Txt bold color={colors.accent}>{backLabel}</Txt>
      </Pressable>
      {right ? <Txt v="small" bold color={colors.textMuted}>{right}</Txt> : null}
    </View>
  );
}

export function ProgressBar({ value, label, height = 16 }: { value: number; label?: string; height?: number }) {
  const { colors } = useApp();
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(1, value));
  const anim = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    if (reduced) anim.setValue(pct);
    else Animated.timing(anim, { toValue: pct, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pct, reduced, anim]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height / 2, backgroundColor: colors.surfaceHi, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}
    >
      <Animated.View
        style={{
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: colors.brand,
        }}
      />
    </View>
  );
}

// ---------- Listen (text to speech) ----------
export function ListenButton({ text }: { text: string }) {
  const { state } = useApp();
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => stopSpeaking(), []);
  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, {
      rate: state.settings.speechRate,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };
  return <BigButton label={speaking ? 'Stop' : 'Listen'} icon={speaking ? 'stop' : 'speaker'} variant="ghost" onPress={toggle} />;
}

/** Reads text aloud once when it appears, if auto-read is on. */
export function useAutoRead(text: string) {
  const { state } = useApp();
  useEffect(() => {
    if (state.settings.autoRead) speak(text, { rate: state.settings.speechRate });
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
}

// ---------- Feedback (stays until Continue is tapped) ----------
const PRAISE = ['Nice one!', 'You got it!', 'Purr-fect!', 'Exactly right!', 'Nailed it!'];
const NUDGE = ['Not quite', 'Almost!', 'Good try'];

export function Feedback({ correct, detail, onContinue }: { correct: boolean; detail: string; onContinue: () => void }) {
  const { colors } = useApp();
  const v = useAppear(300);
  const [title] = useState(() => (correct ? PRAISE : NUDGE)[Math.floor(Math.random() * (correct ? PRAISE : NUDGE).length)]);
  useEffect(() => {
    playSfx(correct ? 'correct' : 'wrong');
    buzz(correct ? 'success' : 'warning');
  }, [correct]);
  return (
    <Animated.View style={popStyle(v)}>
      <Card style={{ borderWidth: 3, borderColor: correct ? colors.good : colors.bad, alignItems: 'stretch' }}>
        <View style={{ alignItems: 'center' }}>
          <Mascot mood={correct ? 'cheer' : 'encourage'} size={110} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Icon name={correct ? 'check' : 'refresh'} size={30} color={correct ? colors.good : colors.bad} />
          <Txt v="h2" color={correct ? colors.good : colors.bad}>
            {title}
          </Txt>
        </View>
        <Txt>{detail}</Txt>
        <BigButton label="Continue" variant="primary" onPress={onContinue} />
      </Card>
    </Animated.View>
  );
}

// ---------- Examples ----------
export function ExampleView({ ex }: { ex: Example }) {
  const { colors } = useApp();
  if (ex.kind === 'record') {
    return (
      <Card tone="inset">
        <Kicker icon="database">{ex.title}</Kicker>
        {ex.fields.map(([k, val]) => (
          <View key={k} accessible accessibilityLabel={`${k}: ${val}`} style={{ borderLeftWidth: 4, borderLeftColor: colors.brand, paddingLeft: 12 }}>
            <Txt v="small" color={colors.textMuted}>{k}</Txt>
            <Txt bold>{val}</Txt>
          </View>
        ))}
      </Card>
    );
  }
  if (ex.kind === 'chart') return <Chart ex={ex} />;
  if (ex.kind === 'code') {
    return (
      <Card tone="inset">
        <Kicker icon="code">Code</Kicker>
        <Txt bold color={colors.accent} style={{ fontFamily: 'monospace' }}>{ex.code}</Txt>
        {ex.output !== undefined ? (
          <>
            <Kicker icon="next">Output</Kicker>
            <Txt bold style={{ fontFamily: 'monospace' }}>{ex.output}</Txt>
          </>
        ) : null}
      </Card>
    );
  }
  if (ex.kind === 'formula') {
    return (
      <Card tone="inset">
        <Kicker icon="pencil">Formula</Kicker>
        <Txt v="h2" color={colors.accent} style={{ fontFamily: 'monospace' }}>{ex.formula}</Txt>
        <Kicker icon="next">Result</Kicker>
        <Txt v="h2">{ex.result}</Txt>
        {ex.note ? <Txt color={colors.textMuted}>{ex.note}</Txt> : null}
      </Card>
    );
  }
  if (ex.kind === 'compare') {
    return (
      <View style={{ gap: space.sm }}>
        <Card tone="inset">
          <Kicker icon="sheet">In Google Sheets</Kicker>
          <Txt>{ex.sheets}</Txt>
        </Card>
        <Card tone="inset">
          <Kicker icon="sheet">In Microsoft Excel</Kicker>
          <Txt>{ex.excel}</Txt>
        </Card>
      </View>
    );
  }
  return (
    <Card tone="inset">
      {ex.title ? <Kicker icon="bulb">{ex.title}</Kicker> : null}
      {ex.items.map((it) => (
        <View key={it} style={{ flexDirection: 'row', gap: 10 }}>
          <Txt bold color={colors.accent}>•</Txt>
          <Txt style={{ flexShrink: 1 }}>{it}</Txt>
        </View>
      ))}
    </Card>
  );
}

/** Makes formulas sound natural when read aloud: =SUM(B2:B5) -> "equals SUM of B2 to B5". */
export function speakFormula(f: string) {
  return f
    .replace(/^=/, 'equals ')
    .replace(/:/g, ' to ')
    .replace(/\$/g, ' dollar ')
    .replace(/\(/g, ' of ')
    .replace(/\)/g, ' ')
    .replace(/,/g, ', ')
    .replace(/</g, ' less than ')
    .replace(/>/g, ' greater than ');
}

export function speakCode(c: string) {
  return c
    .split('\n')
    .join('. New line: ')
    .replace(/==/g, ' equals equals ')
    .replace(/=/g, ' equals ')
    .replace(/\(\)/g, ' ')
    .replace(/\(/g, ' of ')
    .replace(/\)/g, ' ')
    .replace(/\[/g, ' bracket ')
    .replace(/\]/g, ' ')
    .replace(/_/g, ' underscore ')
    .replace(/#/g, ' comment: ');
}

export function exampleSpeech(ex?: Example) {
  if (!ex) return '';
  if (ex.kind === 'record') return `${ex.title}. ` + ex.fields.map(([k, v]) => `${k}: ${v}.`).join(' ');
  if (ex.kind === 'formula') return `Formula: ${speakFormula(ex.formula)}. Result: ${ex.result}. ${ex.note ?? ''}`;
  if (ex.kind === 'chart') return chartSpeech(ex);
  if (ex.kind === 'code') return `Code: ${speakCode(ex.code)}.` + (ex.output !== undefined ? ` Output: ${ex.output}.` : '');
  if (ex.kind === 'compare') return `In Google Sheets: ${ex.sheets}. In Microsoft Excel: ${ex.excel}.`;
  return (ex.title ? `${ex.title}. ` : '') + ex.items.join('. ');
}

// ---------- Charts: big marks, labels right on the data ----------
type ChartEx = Extract<Example, { kind: 'chart' }>;
const fmtVal = (v: number, unit = '') => `${unit}${v.toLocaleString()}`;

export function chartSpeech(ex: ChartEx) {
  const vals = ex.data.map(([, v]) => v);
  const hi = ex.data[vals.indexOf(Math.max(...vals))];
  const lo = ex.data[vals.indexOf(Math.min(...vals))];
  const all = ex.data.map(([k, v]) => `${k}: ${fmtVal(v, ex.unit)}`).join('. ');
  const trend =
    ex.type === 'line' ? ` It goes from ${fmtVal(vals[0], ex.unit)} to ${fmtVal(vals[vals.length - 1], ex.unit)}.` : '';
  return `${ex.type === 'bar' ? 'Bar' : 'Line'} chart: ${ex.title}. Highest is ${hi[0]} at ${fmtVal(hi[1], ex.unit)}. Lowest is ${lo[0]} at ${fmtVal(lo[1], ex.unit)}.${trend} All values: ${all}.`;
}

function GrowBar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const v = useAppear(520, delay);
  return (
    <View style={{ height: 28, width: '100%' }}>
      <Animated.View
        style={{
          height: 28,
          width: `${pct}%`,
          borderRadius: 10,
          backgroundColor: color,
          transform: [{ scaleX: v }],
          transformOrigin: 'left',
        }}
      />
    </View>
  );
}

function Chart({ ex }: { ex: ChartEx }) {
  const { colors, state } = useApp();
  const [w, setW] = useState(0);
  const max = Math.max(...ex.data.map(([, v]) => v), 1);
  return (
    <Card tone="inset">
      <Kicker icon="chart">{ex.title}</Kicker>
      {ex.type === 'bar' ? (
        <View style={{ gap: space.sm }} accessible accessibilityLabel={chartSpeech(ex)}>
          {ex.data.map(([label, v], i) => {
            const hl = ex.highlight === label;
            return (
              <View key={label} style={{ gap: 4 }}>
                <Txt bold={hl}>
                  {hl ? '★ ' : ''}
                  {label}: {fmtVal(v, ex.unit)}
                </Txt>
                <GrowBar pct={Math.max(3, (v / max) * 100)} color={hl || !ex.highlight ? colors.brand : colors.border} delay={i * 70} />
              </View>
            );
          })}
        </View>
      ) : (
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessible accessibilityLabel={chartSpeech(ex)}>
          {w > 0 ? <LineSvg ex={ex} w={w} scale={state.settings.textScale} max={max} /> : null}
        </View>
      )}
      <ListenButton text={chartSpeech(ex)} />
    </Card>
  );
}

function LineSvg({ ex, w, scale, max }: { ex: ChartEx; w: number; scale: number; max: number }) {
  const { colors } = useApp();
  const n = ex.data.length;
  const fs = Math.min(18 * scale, (w / n) * 0.3);
  const top = fs * 2;
  const bottom = fs * 2;
  const h = 240 + top + bottom;
  const pad = Math.max(24, fs * 1.4);
  const min = Math.min(...ex.data.map(([, v]) => v), 0);
  const x = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, n - 1);
  const y = (v: number) => top + 240 - ((v - min) / (max - min || 1)) * 240;
  const pts = ex.data.map(([, v], i) => `${x(i)},${y(v)}`).join(' ');
  return (
    <Svg width={w} height={h}>
      <Line x1={pad} x2={w - pad} y1={top + 240} y2={top + 240} stroke={colors.border} strokeWidth={2} />
      <Polyline points={pts} fill="none" stroke={colors.brand} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      {ex.data.map(([label, v], i) => (
        <React.Fragment key={label}>
          <Circle cx={x(i)} cy={y(v)} r={9} fill={colors.brand} stroke={colors.surfaceHi} strokeWidth={3} />
          <SvgText x={x(i)} y={y(v) - 16} fontSize={fs} fontWeight="700" fill={colors.text} textAnchor="middle">
            {fmtVal(v, ex.unit)}
          </SvgText>
          <SvgText x={x(i)} y={h - fs * 0.5} fontSize={fs} fill={colors.textMuted} textAnchor="middle">
            {label}
          </SvgText>
        </React.Fragment>
      ))}
    </Svg>
  );
}

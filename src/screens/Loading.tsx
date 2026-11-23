import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { Mascot } from '../components/Mascot';
import { useReducedMotion } from '../motion';
import { BRAND, palettes } from '../theme';

// Looks exactly like the native splash (Meng on plum), then comes alive.
const C = palettes.dark;
const TIPS = [
  'Tip: tap Meng anytime to say hi.',
  'Tip: busy day? A Lite day keeps your streak.',
  'Tip: every lesson earns treats for Meng.',
  'Fun fact: SQL was invented in the 1970s.',
  'Fun fact: Excel came out in 1985.',
  'Tip: mistakes go to your Bug Book, to squash later.',
  'Fun fact: "data" is the plural of "datum".',
  'Tip: tap Listen to hear any lesson read aloud.',
];

function greeting(name: string) {
  const h = new Date().getHours();
  return `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}, ${name}!`;
}

export function LoadingScreen({
  progress,
  done,
  name,
  fontsReady,
  onFinish,
}: {
  progress: number;
  done: boolean;
  name: string;
  fontsReady: boolean;
  onFinish: () => void;
}) {
  const reduced = useReducedMotion();
  const bob = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const paws = 5;
  const filled = Math.round(Math.max(0, Math.min(1, progress)) * paws);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, bob]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(
      () => Animated.timing(fade, { toValue: 0, duration: reduced ? 0 : 350, useNativeDriver: true }).start(() => onFinish()),
      650,
    );
    return () => clearTimeout(t);
  }, [done, fade, reduced, onFinish]);

  const font = (f: string) => (fontsReady ? { fontFamily: f } : { fontWeight: '800' as const });
  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24, opacity: fade }}
      accessible
      accessibilityLabel={done ? greeting(name) : `Loading Tori. ${tip}`}
    >
      <Animated.View style={{ transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) }] }}>
        <Mascot mood={done ? 'cheer' : 'happy'} size={200} />
      </Animated.View>
      <Text style={{ color: C.text, fontSize: 48, marginTop: 8, ...font('Nunito_800ExtraBold') }}>Tori</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        {Array.from({ length: paws }, (_, i) => (
          <Icon key={i} name="paw" size={34} color={i < filled ? BRAND : C.surfaceHi} />
        ))}
      </View>
      <Text style={{ color: C.textMuted, fontSize: 21, textAlign: 'center', marginTop: 24, maxWidth: 420, lineHeight: 29, ...font('AtkinsonHyperlegible_400Regular') }}>
        {done ? greeting(name) : tip}
      </Text>
    </Animated.View>
  );
}

/** Shown if something ever crashes: progress is safe, one tap to go home. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode; onReset: () => void }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <Mascot mood="encourage" size={180} />
        <Text style={{ color: C.text, fontSize: 32, fontWeight: '800', textAlign: 'center' }}>Oops, let's try that again</Text>
        <Text style={{ color: C.textMuted, fontSize: 21, textAlign: 'center', lineHeight: 29 }}>
          Something went wrong, but your progress is safe.
        </Text>
        <Pressable
          onPress={() => {
            this.props.onReset();
            this.setState({ error: false });
          }}
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={{ backgroundColor: BRAND, borderRadius: 22, minHeight: 62, paddingHorizontal: 32, justifyContent: 'center', alignSelf: 'stretch' }}
        >
          <Text style={{ color: C.onBrand, fontSize: 22, fontWeight: '800', textAlign: 'center' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

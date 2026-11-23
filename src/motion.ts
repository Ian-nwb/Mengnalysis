import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

// All motion is short, happens on appear/tap only (never while reading),
// and turns off when Android's "Remove animations" is on.

let animationsOn = true;
export function setAnimationsEnabled(v: boolean) {
  animationsOn = v;
}
export const animationsEnabled = () => animationsOn;

export function useReducedMotion() {
  const [sysReduced, setReduced] = useState(false);
  const reduced = sysReduced || !animationsOn;
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

/** 0 → 1 once on mount. */
export function useAppear(duration = 260, delay = 0) {
  const reduced = useReducedMotion();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      v.setValue(1);
      return;
    }
    Animated.timing(v, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [reduced, v, duration, delay]);
  return v;
}

/** Fade + gentle rise. */
export function appearStyle(v: Animated.Value, rise = 14) {
  return {
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] }) }],
  };
}

/** Small "pop" scale for feedback and rewards. */
export function popStyle(v: Animated.Value) {
  return {
    opacity: v,
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
  };
}

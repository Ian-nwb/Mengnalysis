import * as Haptics from 'expo-haptics';

let on = true;
export const setHapticsEnabled = (v: boolean) => {
  on = v;
};
export function buzz(kind: 'success' | 'warning' | 'light') {
  if (!on) return;
  const p =
    kind === 'light'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : Haptics.notificationAsync(kind === 'success' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
  p.catch(() => {});
}

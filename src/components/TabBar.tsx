import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz } from '../haptics';
import { currentCat } from '../cats';
import { useApp } from '../state';
import { fonts } from '../theme';
import { Icon, IconName } from './Icon';

export type Tab = 'home' | 'path' | 'library' | 'meng' | 'cats' | 'settings';
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Today', icon: 'home' },
  { id: 'path', label: 'Path', icon: 'map' },
  { id: 'library', label: 'Learn', icon: 'book' },
  { id: 'meng', label: 'Meng', icon: 'paw' },
  { id: 'cats', label: 'Cats', icon: 'heart' },
  { id: 'settings', label: 'Me', icon: 'user' },
];

export function TabBar({ active, onTab }: { active: Tab; onTab: (t: Tab) => void }) {
  const { colors, state } = useApp();
  const catName = currentCat(state).name;
  const insets = useSafeAreaInsets();
  const scale = Math.min(state.settings.textScale, 1.2);
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 2,
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
        paddingHorizontal: 4,
        gap: 4,
      }}
    >
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <Pressable
            key={t.id}
            onPress={() => {
              buzz('light');
              onTab(t.id);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.id === 'meng' ? catName : t.label}
            style={{
              flex: 1,
              minHeight: 64,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: on ? colors.brandSoft : 'transparent',
              borderWidth: on ? 2 : 0,
              borderColor: colors.brand,
              gap: 2,
            }}
          >
            <Icon name={t.icon} size={Math.round(28 * scale)} color={on ? colors.accent : colors.textMuted} />
            <Text style={{ fontSize: Math.round(15 * scale), fontFamily: on ? fonts.bold : fonts.body, color: on ? colors.accent : colors.textMuted }}>
              {t.id === 'meng' ? catName : t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

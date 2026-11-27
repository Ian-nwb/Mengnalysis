import React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buzz } from '../haptics';
import { useApp } from '../state';
import { radius, space } from '../theme';
import { Icon, IconName } from './Icon';
import { Card, Txt } from './ui';
import { Mascot, Mood } from './Mascot';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { currentCat } from '../cats';

// Shared building blocks for list-style screens (Me & settings, Learn, Meng's home sheets).

/** A sheet that slides up over the screen. */
export function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(10,5,20,0.55)', justifyContent: 'flex-end' }}>
        <SafeAreaView
          edges={['bottom']}
          style={{ backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', borderTopWidth: 3, borderColor: colors.brand }}
        >
          <View style={{ alignItems: 'center', paddingTop: 8 }}>
            <View style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: colors.border }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.md, paddingVertical: space.sm, gap: space.sm }}>
            <Txt v="h2" style={{ flexShrink: 1 }}>{title}</Txt>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: pressed ? colors.brand : colors.brandSoft,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Icon name="x" size={26} color={colors.accent} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: space.md, paddingTop: 0, gap: space.sm }}>{children}</ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/** Heading above a group of rows. */
export function GroupTitle({ children }: { children: React.ReactNode }) {
  const { colors } = useApp();
  return (
    <Txt v="h2" style={{ marginTop: space.md, marginLeft: 4 }}>
      {children}
    </Txt>
  );
}

/** A rounded card holding rows, separated by thin dividers. */
export function RowGroup({ children }: { children: React.ReactNode }) {
  const { colors } = useApp();
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
      {kids.map((c, i) => (
        <View key={i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: colors.border } : undefined}>
          {c}
        </View>
      ))}
    </View>
  );
}

function IconDot({ icon, tint }: { icon: IconName; tint?: string }) {
  const { colors } = useApp();
  return (
    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: tint ?? colors.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={24} color={tint ? '#1B1420' : colors.accent} />
    </View>
  );
}

/** A settings row: icon, title, current value, and an arrow. Opens a sheet or runs an action. */
export function NavRow({ icon, title, value, onPress, danger, tint }: { icon: IconName; title: string; value?: string; onPress: () => void; danger?: boolean; tint?: string }) {
  const { colors } = useApp();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}: ${value}` : title}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, minHeight: 72, backgroundColor: pressed ? colors.surfaceHi : 'transparent' })}
    >
      <IconDot icon={icon} tint={tint} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt bold color={danger ? colors.bad : colors.text}>{title}</Txt>
        {value ? (
          <Txt v="small" color={colors.textMuted}>
            {value}
          </Txt>
        ) : null}
      </View>
      <Icon name="next" size={24} color={colors.textMuted} />
    </Pressable>
  );
}

/** An on/off switch, placed right next to its label (with "On"/"Off" written on it, not just a color). */
export function ToggleRow({ title, sub, value, onChange }: { title: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useApp();
  return (
    <Pressable
      onPress={() => {
        buzz('light');
        onChange(!value);
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={sub ? `${title}. ${sub}` : title}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, minHeight: 72, backgroundColor: pressed ? colors.surfaceHi : 'transparent' })}
    >
      <View
        style={{
          width: 76,
          height: 42,
          borderRadius: 21,
          backgroundColor: value ? colors.brand : colors.surfaceHi,
          borderWidth: 2,
          borderColor: value ? colors.brand : colors.border,
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}
      >
        <View style={{ flexDirection: value ? 'row' : 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt v="small" bold color={value ? colors.onBrand : colors.textMuted} style={{ paddingHorizontal: 6 }}>
            {value ? 'On' : 'Off'}
          </Txt>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: value ? colors.onBrand : colors.textMuted }} />
        </View>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt bold>{title}</Txt>
        {sub ? (
          <Txt v="small" color={colors.textMuted}>
            {sub}
          </Txt>
        ) : null}
      </View>
    </Pressable>
  );
}

/** A colorful tile for hub screens (two per row, wraps at large text). */
export function Tile({ icon, title, sub, tint, onPress }: { icon: IconName; title: string; sub?: string; tint: string; onPress: () => void }) {
  const { colors } = useApp();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={sub ? `${title}. ${sub}` : title}
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: 150,
        minHeight: 130,
        borderRadius: radius,
        padding: space.md,
        gap: space.sm,
        backgroundColor: pressed ? colors.surfaceHi : colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      })}
    >
      <IconDot icon={icon} tint={tint} />
      <Txt bold>{title}</Txt>
      {sub ? (
        <Txt v="small" color={colors.textMuted}>
          {sub}
        </Txt>
      ) : null}
    </Pressable>
  );
}

/** Pastel tints for icons and tiles (dark icons on top keep strong contrast). */
export const TINTS = { lavender: '#E5A2F2', peach: '#F7C08A', mint: '#A6E8BC', sky: '#A9D3FF', pink: '#F5B3C8', butter: '#F6E08F' };

/**
 * The hero card with your cat peeking over its top edge, paws resting on it.
 * Used once (Today's dose) so it stays special.
 */
export function PeekCard({ mood = 'happy', size = 150, children }: { mood?: Mood; size?: number; children: React.ReactNode }) {
  const { state } = useApp();
  const look = currentCat(state).look;
  const paw = size * 0.16;
  return (
    <View>
      <View pointerEvents="box-none" style={{ alignItems: 'center', height: size * 0.76, overflow: 'hidden' }}>
        <Mascot mood={mood} size={size} />
      </View>
      <Card tone="hero" style={{ marginTop: -size * 0.06 }}>
        <View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          style={{ position: 'absolute', top: -paw * 0.55, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: size * 0.1 }}
        >
          {[0, 1].map((i) => (
            <Svg key={i} width={paw} height={paw * 0.66} viewBox="0 0 30 20">
              <Ellipse cx={15} cy={10} rx={13} ry={8.5} fill={look.feet} stroke={look.line} strokeWidth={2.5} />
              <Path d="M11 5 v5 M19 5 v5" stroke={look.line} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          ))}
        </View>
        {children}
      </Card>
    </View>
  );
}
